"""
backend/services/vision_service.py
====================================
Düzeltme v3:
  - Gemini SDK asenkron (client.aio.models.generate_content) yapısına geçirildi (Event loop kilitlemesi önlendi)
  - PIL görsel iletimi types.Part.from_bytes standart tipine dönüştürüldü
  - Model listesi ve 429/404 hata yakalama mekanizması korundu
"""

from __future__ import annotations

import asyncio
import io
import json
import logging
import os
import re
import textwrap
from typing import Any, Optional

from google import genai
from google.genai import types
from openai import AsyncOpenAI
from PIL import Image
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
def get_gemini_vision_models() -> list[str]:
    primary = os.getenv("GEMINI_VISION_MODEL", "gemini-3.6-flash")
    fallbacks = [
        primary,
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite",
    ]
    # Remove duplicates preserving order
    seen = set()
    return [m for m in fallbacks if not (m in seen or seen.add(m))]

GEMINI_MODELS = get_gemini_vision_models()

MAX_RETRY_WAIT_SEC = 30

# ─────────────────────────────────────────────────────────────
# Pydantic modelleri
# ─────────────────────────────────────────────────────────────

class BaggageDimensions(BaseModel):
    width_cm:  float = Field(..., ge=0, le=300)
    height_cm: float = Field(..., ge=0, le=300)
    depth_cm:  float = Field(..., ge=0, le=300)


class BaggageScanResponse(BaseModel):
    is_luggage:             bool
    message:                str
    status:                 Optional[str]               = None
    detected_dimensions:    Optional[BaggageDimensions] = None
    allowed_dimensions:     Optional[BaggageDimensions] = None
    overage_cm:             Optional[BaggageDimensions] = None
    potential_gate_fee_eur: Optional[float]             = None
    confidence_score:       Optional[float]             = None
    luggage_type:           Optional[str]               = None
    recommendations:        Optional[list[str]]         = None
    analysis_source:        Optional[str]               = None


class TicketRiskAlert(BaseModel):
    level:              str
    title:              str
    description:        str
    potential_fine_eur: float


class TicketAnalysisResponse(BaseModel):
    operator:           str
    origin:             str
    destination:        str
    transport_mode:     str
    risks:              list[TicketRiskAlert]
    total_risk_eur:     float
    total_saved_eur:    float
    cabin_bag_included: bool


# ─────────────────────────────────────────────────────────────
# Havayolu limitleri
# ─────────────────────────────────────────────────────────────

AIRLINE_LIMITS: dict[str, dict[str, float]] = {
    "RYANAIR":    {"w": 40, "h": 20, "d": 25, "gate_fee": 70},
    "WIZZAIR":    {"w": 40, "h": 30, "d": 20, "gate_fee": 80},
    "EASYJET":    {"w": 56, "h": 45, "d": 25, "gate_fee": 48},
    "THY":        {"w": 55, "h": 40, "d": 20, "gate_fee":  0},
    "PEGASUS":    {"w": 55, "h": 40, "d": 20, "gate_fee": 50},
    "AJET":       {"w": 55, "h": 40, "d": 20, "gate_fee": 45},
    "SUNEXPRESS": {"w": 55, "h": 40, "d": 20, "gate_fee": 45},
    "CORENDON":   {"w": 55, "h": 40, "d": 20, "gate_fee": 40},
    "TRENITALIA": {"w": 80, "h": 50, "d": 30, "gate_fee":  0},
    "SNCF":       {"w": 70, "h": 50, "d": 30, "gate_fee":  0},
    "DB":         {"w": 70, "h": 50, "d": 30, "gate_fee":  0},
    "OBB":        {"w": 70, "h": 50, "d": 30, "gate_fee":  0},
    "FLIXBUS":    {"w": 67, "h": 42, "d": 27, "gate_fee":  0},
}

CABIN_TYPE_HINT: dict[str, str] = {
    "RYANAIR":    "küçük kabin çantası (carry-on, max 40×20×25 cm)",
    "WIZZAIR":    "küçük kabin çantası (carry-on, max 40×30×20 cm)",
    "EASYJET":    "orta boy kabin çantası (cabin bag, max 56×45×25 cm)",
    "THY":        "orta/büyük kabin çantası (cabin bag, max 55×40×20 cm)",
    "PEGASUS":    "orta boy kabin çantası (max 55×40×20 cm)",
    "AJET":       "orta boy kabin çantası (max 55×40×20 cm)",
    "SUNEXPRESS": "orta boy kabin çantası (max 55×40×20 cm)",
    "CORENDON":   "orta boy kabin çantası (max 55×40×20 cm)",
}


# ─────────────────────────────────────────────────────────────
# Prompt şablonları
# ─────────────────────────────────────────────────────────────

DETECTION_PROMPT = textwrap.dedent("""
    Görevin: Görselin YALNIZCA bir yolculuk bagajı içerip içermediğini belirlemek.

    KABUL EDİLEN (is_luggage = true):
    - Tekerlekli valiz / suitcase
    - Sırt çantası / backpack (seyahat tipi)
    - El çantası / tote bag (seyahat için)
    - Spor/duffle çanta
    - Kabin çantası / carry-on bag

    REDDEDİLEN (is_luggage = false):
    - İnsan, hayvan, bitki, araç, mobilya, gıda, elektronik cihaz
    - Görselin %30'undan azını kaplayan küçük çantalar
    - Tüm çantanın görünmediği (kısmi) kareler
    - Birden fazla nesnenin olduğu karmaşık sahneler

    ÇIKTI: SADECE geçerli JSON, başka hiçbir metin olmadan:

    Bagaj YOK ise:
    {"is_luggage": false, "reason": "Görselde [NE GÖRÜLDÜĞÜ] tespit edildi, bagaj bulunamadı.", "detection_confidence": 0.95}

    Bagaj VAR ise:
    {"is_luggage": true, "luggage_type": "suitcase|backpack|tote|duffel|carry-on", "detection_confidence": 0.92, "visible_features": ["tekerlekler", "taşıma kolu"]}
""").strip()


def _build_dimension_prompt(operator: str, limits: dict[str, float]) -> str:
    hint = CABIN_TYPE_HINT.get(operator, "kabin çantası")
    return textwrap.dedent(f"""
        Görevin: Görseldeki {hint} boyutlarını cm cinsinden tahmin etmek.

        REFERANS NOKTALARI:
        - Standart kapı genişliği ≈ 80 cm
        - Standart sandalye yüksekliği ≈ 45 cm
        - A4 kağıt: 21×29.7 cm
        - Kabin valizi genellikle 50-55 cm yüksekliğindedir
        - Tekerlekler ve çıkıntıları DAHIL et (havayolları bunları da ölçer)

        TAHMİN KURALLARI:
        1. EN UZUN kenar = yükseklik (height)
        2. EN GENİŞ düz yüzey = genişlik (width)
        3. ÖN-ARKA mesafe = derinlik (depth)
        4. 5 cm altı veya 150 cm üzeri tahminler hatalıdır, tekrar değerlendir.

        {operator} LİMİTİ: {limits['w']}cm (G) × {limits['h']}cm (Y) × {limits['d']}cm (D)

        ÇIKTI: SADECE geçerli JSON:
        {{"width_cm": <sayı>, "height_cm": <sayı>, "depth_cm": <sayı>, "dimension_confidence": <0-1>, "reference_used": "<açıklama>"}}
    """).strip()


# ─────────────────────────────────────────────────────────────
# JSON ayrıştırıcı
# ─────────────────────────────────────────────────────────────

def _safe_parse_json(raw: str) -> dict[str, Any]:
    raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)
    return json.loads(raw.replace("'", '"'))


# ─────────────────────────────────────────────────────────────
# Hata sınıflandırması
# ─────────────────────────────────────────────────────────────

def _extract_retry_delay(error_str: str) -> Optional[float]:
    match = re.search(r"retry[^\d]*(\d+\.?\d*)\s*s", error_str, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def _is_retryable(error_str: str) -> bool:
    return "429" in error_str or "RESOURCE_EXHAUSTED" in error_str


def _is_model_not_found(error_str: str) -> bool:
    return "404" in error_str or "NOT_FOUND" in error_str


# ─────────────────────────────────────────────────────────────
# Gemini istemcisi (Asenkron)
# ─────────────────────────────────────────────────────────────

def _get_gemini_client() -> Optional[genai.Client]:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    try:
        # Client seviyesinde HTTP timeout süresini 120 saniyeye çıkarıyoruz
        return genai.Client(
            api_key=key,
            http_options=types.HttpOptions(timeout=120000) # milisaniye cinsinden (120 sn)
        )
    except Exception as exc:
        logger.warning("Gemini Client başlatılamadı: %s", exc)
        return None

async def _call_gemini(
    client: genai.Client,
    image_bytes: bytes,
    mime_type: str,
    prompt: str,
) -> Optional[dict[str, Any]]:
    """
    GEMINI_MODELS listesini sırayla dener (Asenkron olarak).
    """
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

    for model_name in GEMINI_MODELS:
        try:
            # Asenkron çağrı için client.aio kullanılır
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.0,
                    max_output_tokens=512,
                ),
            )
            data = _safe_parse_json(response.text)
            logger.info("✓ Gemini (%s) başarılı.", model_name)
            return data

        except json.JSONDecodeError as exc:
            logger.warning("Gemini (%s) JSON parse hatası: %s", model_name, exc)

        except Exception as exc:
            err_str = str(exc)

            if _is_model_not_found(err_str):
                logger.warning("Gemini (%s) model bulunamadı, atlanıyor.", model_name)
                continue

            if _is_retryable(err_str):
                delay = _extract_retry_delay(err_str)
                if delay and delay <= MAX_RETRY_WAIT_SEC:
                    logger.warning(
                        "Gemini (%s) quota aşımı, %.1fs bekleniyor…", model_name, delay
                    )
                    await asyncio.sleep(delay)
                    try:
                        response = await client.aio.models.generate_content(
                            model=model_name,
                            contents=[image_part, prompt],
                            config=types.GenerateContentConfig(
                                response_mime_type="application/json",
                                temperature=0.0,
                                max_output_tokens=512,
                            ),
                        )
                        data = _safe_parse_json(response.text)
                        logger.info("✓ Gemini (%s) retry başarılı.", model_name)
                        return data
                    except Exception as retry_exc:
                        logger.warning("Gemini (%s) retry de başarısız: %s", model_name, retry_exc)
                else:
                    logger.warning(
                        "Gemini (%s) quota aşımı, bekleme süresi çok uzun (%.0fs), atlanıyor.",
                        model_name, delay or 999,
                    )
                continue

            logger.warning("Gemini (%s) beklenmeyen hata: %s", model_name, err_str)

    return None


# ─────────────────────────────────────────────────────────────
# OpenAI yedek
# ─────────────────────────────────────────────────────────────

async def _call_openai(
    image_bytes: bytes,
    mime_type:   str,
    prompt:      str,
) -> Optional[dict[str, Any]]:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None

    import base64
    b64 = base64.b64encode(image_bytes).decode()

    try:
        client = AsyncOpenAI(api_key=key)
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {
                        "url": f"data:{mime_type};base64,{b64}",
                        "detail": "high",
                    }},
                ],
            }],
            max_tokens=512,
            temperature=0.0,
            response_format={"type": "json_object"},
        )
        data = _safe_parse_json(resp.choices[0].message.content or "{}")
        logger.info("✓ OpenAI (gpt-4o-mini) başarılı.")
        return data

    except Exception as exc:
        err_str = str(exc)
        if "429" in err_str or "insufficient_quota" in err_str:
            logger.warning("OpenAI quota aşımı: %s", err_str[:120])
        else:
            logger.warning("OpenAI hatası: %s", err_str[:120])
        return None


# ─────────────────────────────────────────────────────────────
# İki aşamalı analiz
# ─────────────────────────────────────────────────────────────

async def _run_two_stage_analysis(
    image_bytes: bytes,
    mime_type:   str,
    operator:    str,
    limits:      dict[str, float],
) -> tuple[dict[str, Any], dict[str, Any], str]:
    gemini_client = _get_gemini_client()
    source        = "demo"

    # ── Aşama 1: Nesne tespiti ────────────────────────────────
    detection: Optional[dict] = None

    if gemini_client:
        detection = await _call_gemini(gemini_client, image_bytes, mime_type, DETECTION_PROMPT)
        if detection:
            source = "gemini"

    if detection is None:
        detection = await _call_openai(image_bytes, mime_type, DETECTION_PROMPT)
        if detection:
            source = "gpt-4o"

    if detection is None:
        logger.error("Tüm detection API çağrıları başarısız.")
        return (
            {"is_luggage": False, "reason": "Görsel analiz servisi şu an kullanılamıyor, lütfen birkaç dakika sonra tekrar deneyin.", "detection_confidence": 0.0},
            {},
            "error",
        )

    if not detection.get("is_luggage", False):
        return detection, {}, source

    # ── Aşama 2: Boyut tahmini ────────────────────────────────
    dim_prompt = _build_dimension_prompt(operator, limits)
    dimension: Optional[dict] = None

    if gemini_client:
        dimension = await _call_gemini(gemini_client, image_bytes, mime_type, dim_prompt)

    if dimension is None:
        dimension = await _call_openai(image_bytes, mime_type, dim_prompt)

    if dimension is None:
        logger.warning("Boyut tahmini başarısız, limit değerleri fallback olarak kullanılıyor.")
        dimension = {
            "width_cm":            limits["w"],
            "height_cm":           limits["h"],
            "depth_cm":            limits["d"],
            "dimension_confidence": 0.3,
            "reference_used":      "Tahmin yapılamadı — havayolu limiti kullanıldı",
        }

    return detection, dimension, source


# ─────────────────────────────────────────────────────────────
# Yanıt oluşturucular
# ─────────────────────────────────────────────────────────────

def _build_not_luggage_response(detection: dict, source: str) -> BaggageScanResponse:
    reason = detection.get("reason", "Görselde çanta veya valiz tespit edilemedi.")
    return BaggageScanResponse(
        is_luggage=False,
        message=reason,
        confidence_score=float(detection.get("detection_confidence", 0.0)),
        recommendations=[
            "Çantanın tamamının göründüğü, düz arka planlı bir fotoğraf yükleyin.",
            "Fotoğrafı yakın plan, iyi ışıkta çekin.",
        ],
        analysis_source=source,
    )


def _safe_dim(val: Any, fallback: float) -> float:
    try:
        v = float(val)
        return v if 5.0 <= v <= 200.0 else fallback
    except (TypeError, ValueError):
        return fallback


def _build_luggage_response(
    detection: dict,
    dimension: dict,
    limits:    dict[str, float],
    operator:  str,
    source:    str,
) -> BaggageScanResponse:
    w = _safe_dim(dimension.get("width_cm"),  limits["w"])
    h = _safe_dim(dimension.get("height_cm"), limits["h"])
    d = _safe_dim(dimension.get("depth_cm"),  limits["d"])

    ow = round(max(0.0, w - limits["w"]), 1)
    oh = round(max(0.0, h - limits["h"]), 1)
    od = round(max(0.0, d - limits["d"]), 1)
    is_oversized = ow > 0 or oh > 0 or od > 0

    det_conf = float(detection.get("detection_confidence", 0.9))
    dim_conf = float(dimension.get("dimension_confidence", 0.7))
    conf     = round(det_conf * 0.4 + dim_conf * 0.6, 2)

    status = "FAIL" if is_oversized else ("WARNING" if conf < 0.70 else "PASS")

    gate_fee = float(limits["gate_fee"]) if is_oversized else 0.0
    savings  = max(0.0, gate_fee - 18.0)

    recs: list[str] = []
    if is_oversized:
        axes = [f"genişlik +{ow} cm" if ow > 0 else "",
                f"yükseklik +{oh} cm" if oh > 0 else "",
                f"derinlik +{od} cm" if od > 0 else ""]
        axes = [a for a in axes if a]
        recs.append(
            f"Çantanız {operator} kabin limitini ({limits['w']}×{limits['h']}×{limits['d']} cm) "
            f"aşıyor: {', '.join(axes)}."
        )
        if gate_fee > 0:
            recs.append(
                f"Kapıda €{gate_fee:.0f} ceza ödememek için şimdi €18'e online kabin hakkı ekleyin "
                f"→ €{savings:.0f} net tasarruf."
            )
        recs.append("Çantanızı sıkıştırarak birkaç cm küçültmeyi deneyin.")
    elif status == "WARNING":
        recs.append(
            f"Boyutlar limit içinde ancak AI güven skoru düşük (%{int(conf*100)}). "
            "Fiziksel ölçüm almanızı öneririz."
        )
    else:
        recs.append(f"Çantanız {operator} kabin limitleri içinde — güvenli. (Güven: %{int(conf*100)})")

    ref = dimension.get("reference_used", "")
    if ref and status != "PASS":
        recs.append(f"Ölçüm referansı: {ref}")

    return BaggageScanResponse(
        is_luggage=True,
        message="Bagaj tespit edildi ve havayolu kurallarıyla karşılaştırıldı.",
        status=status,
        detected_dimensions=BaggageDimensions(width_cm=w, height_cm=h, depth_cm=d),
        allowed_dimensions=BaggageDimensions(
            width_cm=limits["w"], height_cm=limits["h"], depth_cm=limits["d"]
        ),
        overage_cm=BaggageDimensions(width_cm=ow, height_cm=oh, depth_cm=od),
        potential_gate_fee_eur=gate_fee,
        confidence_score=conf,
        luggage_type=detection.get("luggage_type"),
        recommendations=recs,
        analysis_source=source,
    )


# ─────────────────────────────────────────────────────────────
# Ana public fonksiyon
# ─────────────────────────────────────────────────────────────

async def analyze_luggage_image(
    image_bytes: bytes,
    mime_type:   str,
    operator:    str = "RYANAIR",
) -> BaggageScanResponse:
    operator = operator.upper()
    limits   = AIRLINE_LIMITS.get(operator, AIRLINE_LIMITS["RYANAIR"])

    has_api = bool(os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY"))
    if not has_api:
        return BaggageScanResponse(
            is_luggage=False,
            message="[Demo] API anahtarı bulunamadı. .env dosyasına GEMINI_API_KEY ekleyin.",
            recommendations=["[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) → ücretsiz anahtar al"],
            analysis_source="demo",
        )

    try:
        detection, dimension, source = await _run_two_stage_analysis(
            image_bytes, mime_type, operator, limits
        )

        if not detection.get("is_luggage", False):
            return _build_not_luggage_response(detection, source)

        return _build_luggage_response(detection, dimension, limits, operator, source)

    except Exception as exc:
        logger.exception("analyze_luggage_image beklenmeyen hata: %s", exc)
        return BaggageScanResponse(
            is_luggage=False,
            message="Görsel analizi sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
            recommendations=["Farklı formatta (JPG veya PNG) görsel deneyin."],
            analysis_source="error",
        )


# ─────────────────────────────────────────────────────────────
# Bilet analiz motoru
# ─────────────────────────────────────────────────────────────

AIRLINE_RISK_DB: dict[str, list[dict]] = {
    "RYANAIR": [
        {"level": "CRITICAL", "title": "Havalimanı check-in ücreti",
         "desc": "Online check-in yapılmazsa €55 ücret uygulanır.", "fine": 55},
        {"level": "WARNING",  "title": "Kapıda bagaj boyut kontrolü",
         "desc": "40×20×25 cm aşımında kapıda €70 ceza kesilir.", "fine": 70},
        {"level": "INFO",     "title": "Ön seçili seyahat sigortası",
         "desc": "Onay e-postasında sigorta önceden işaretlidir.", "fine": 0},
    ],
    "WIZZAIR": [
        {"level": "CRITICAL", "title": "Havalimanı check-in ücreti",
         "desc": "Online check-in yapılmazsa €30–50 ücret uygulanır.", "fine": 50},
        {"level": "CRITICAL", "title": "Gidiş kaçırılırsa dönüş iptal",
         "desc": "Gidiş-dönüş biletlerde gidiş kaçırılırsa dönüş iptal edilir.", "fine": 0},
        {"level": "WARNING",  "title": "Bagaj boyut kontrolü çok katı",
         "desc": "1 cm aşımda dahi €45–80 ceza uygulanır.", "fine": 80},
    ],
    "EASYJET": [
        {"level": "WARNING", "title": "Zorunluymuş gibi sunulan koltuk seçimi",
         "desc": "Ücretsiz rastgele atama hakkınız var, zorlanmayın.", "fine": 20},
        {"level": "INFO",    "title": "Gece yarısı kural değişikliği",
         "desc": "Aynı gün seferde koltuk değişikliğinde fark iadesi yapılmaz.", "fine": 0},
    ],
    "THY": [
        {"level": "INFO", "title": "Economy Lite: koltuk seçimi ücretli",
         "desc": "Economy Lite biletlerde koltuk seçimi ek ücretlidir.", "fine": 15},
        {"level": "INFO", "title": "İkinci bagaj ek ücreti",
         "desc": "İkinci bagaj için ek ücret uygulanabilir.", "fine": 30},
    ],
    "PEGASUS": [
        {"level": "WARNING", "title": "Economy Eco: kabin bagajı dahil değil",
         "desc": "Economy Eco biletlerde kabin bagajı dahil değildir (€20–40).", "fine": 40},
        {"level": "WARNING", "title": "Havalimanı check-in ücreti",
         "desc": "Havalimanında check-in yapılırsa €25 ücret alınır.", "fine": 25},
    ],
    "AJET":       [{"level": "INFO", "title": "AJet kabin politikası", "desc": "Standart LCC kuralları.", "fine": 0}],
    "SUNEXPRESS": [{"level": "INFO", "title": "Koltuk seçim ücreti", "desc": "Standart biletlerde koltuk seçimi ek ücretlidir.", "fine": 10}],
    "CORENDON":   [{"level": "INFO", "title": "Büyük kabin bagajı ücretli", "desc": "Bilet tipine göre değişebilir.", "fine": 20}],
}


def analyze_ticket(
    operator: str, origin: str, destination: str,
    transport_mode: str, cabin_bag_included: bool,
) -> TicketAnalysisResponse:
    op        = operator.upper()
    raw_risks = AIRLINE_RISK_DB.get(op, [
        {"level": "INFO", "title": "Genel bilet kontrolü",
         "desc": "Seyahat öncesi bilet koşullarını kontrol edin.", "fine": 0},
    ])

    alerts = [
        TicketRiskAlert(
            level=r["level"], title=r["title"],
            description=r["desc"], potential_fine_eur=float(r["fine"]),
        )
        for r in raw_risks
    ]

    total_risk  = sum(a.potential_fine_eur for a in alerts if a.level == "CRITICAL")
    total_saved = sum(
        a.potential_fine_eur for a in alerts
        if a.potential_fine_eur > 0 and a.level != "CRITICAL"
    ) * 0.7

    return TicketAnalysisResponse(
        operator=op, origin=origin, destination=destination,
        transport_mode=transport_mode, risks=alerts,
        total_risk_eur=round(total_risk, 2),
        total_saved_eur=round(total_saved, 2),
        cabin_bag_included=cabin_bag_included,
    )