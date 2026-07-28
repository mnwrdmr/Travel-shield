# ─────────────────────────────────────────────────────────────
# backend/services/vision_service.py
# ─────────────────────────────────────────────────────────────

from __future__ import annotations

import base64
import io
import json
import os
from typing import Optional

from google import genai
from google.genai import types
from PIL import Image
from openai import AsyncOpenAI
from pydantic import BaseModel, Field


# ── Pydantic modelleri ────────────────────────────────────────

class BaggageDimensions(BaseModel):
    width_cm: float = Field(..., ge=0, description="Genişlik (cm)")
    height_cm: float = Field(..., ge=0, description="Yükseklik (cm)")
    depth_cm: float = Field(..., ge=0, description="Derinlik (cm)")


class BaggageScanResponse(BaseModel):
    is_luggage: bool
    message: str
    status: Optional[str] = None  # PASS | FAIL | WARNING
    detected_dimensions: Optional[BaggageDimensions] = None
    allowed_dimensions: Optional[BaggageDimensions] = None
    overage_cm: Optional[BaggageDimensions] = None
    potential_gate_fee_eur: Optional[float] = None
    confidence_score: Optional[float] = None
    recommendations: Optional[list[str]] = None


class TicketRiskAlert(BaseModel):
    level: str  # CRITICAL | WARNING | INFO
    title: str
    description: str
    potential_fine_eur: float


class TicketAnalysisResponse(BaseModel):
    operator: str
    origin: str
    destination: str
    transport_mode: str
    risks: list[TicketRiskAlert]
    total_risk_eur: float
    total_saved_eur: float
    cabin_bag_included: bool


# ── Havayolu bagaj limitleri ─────────────────────────────────

AIRLINE_LIMITS: dict[str, dict] = {
    "RYANAIR": {"w": 40, "h": 20, "d": 25, "gate_fee": 70},
    "WIZZAIR": {"w": 40, "h": 30, "d": 20, "gate_fee": 80},
    "EASYJET": {"w": 56, "h": 45, "d": 25, "gate_fee": 48},
    "THY": {"w": 55, "h": 40, "d": 20, "gate_fee": 0},
    "PEGASUS": {"w": 55, "h": 40, "d": 20, "gate_fee": 50},
    "AJET": {"w": 55, "h": 40, "d": 20, "gate_fee": 45},
    "SUNEXPRESS": {"w": 55, "h": 40, "d": 20, "gate_fee": 45},
    "CORENDON": {"w": 55, "h": 40, "d": 20, "gate_fee": 40},
    "TRENITALIA": {"w": 80, "h": 50, "d": 30, "gate_fee": 0},
    "SNCF": {"w": 70, "h": 50, "d": 30, "gate_fee": 0},
    "DB": {"w": 70, "h": 50, "d": 30, "gate_fee": 0},
    "OBB": {"w": 70, "h": 50, "d": 30, "gate_fee": 0},
    "FLIXBUS": {"w": 67, "h": 42, "d": 27, "gate_fee": 0},
}


# ── Yardımcı Fonksiyonlar ─────────────────────────────────────

def _image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode('utf-8')


def _get_gemini_client() -> Optional[genai.Client]:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    try:
        return genai.Client(api_key=key)
    except Exception as e:
        print(f"[Vision Error] Gemini Client ilklendirilemedi: {e}")
        return None


# ── Görsel Analiz (Gemini Ana - OpenAI Yedek) ─────────────────

async def analyze_luggage_image(
        image_bytes: bytes,
        mime_type: str,
        operator: str = "RYANAIR",
) -> BaggageScanResponse:
    operator = operator.upper()
    limits = AIRLINE_LIMITS.get(operator, AIRLINE_LIMITS["RYANAIR"])

    prompt = f"""
    Sen bir havalimanı güvenlik ve bagaj uyumluluk yapay zekasısın. Görseli dikkatle incele:

    1. BAVUL / ÇANTA TESPİTİ:
       - Görselde bir valiz, sırt çantası, el çantası veya kabin bagajı var mı?
       - Eğer yoksa (insan, manzara, evcil hayvan, mobilya veya belirsiz bir nesne varsa): "is_luggage": false döndür.

    2. BOYUT TAHMİNİ (Sadece bagaj ise):
       - {operator} limitleri: {limits['w']}cm (G) x {limits['h']}cm (Y) x {limits['d']}cm (D)
       - Görseldeki çantanın boyutlarını (cm) tahmin et.

    ÇIKTI FORMATI (SADECE GEÇERLİ JSON):
    Eğer bagaj yoksa:
    {{"is_luggage": false, "message": "Görselde çanta veya valiz tespit edilemedi. Lütfen net bir bagaj fotoğrafı yükleyin."}}

    Eğer bagaj varsa:
    {{"is_luggage": true, "message": "Bagaj tespit edildi ve boyutlar analiz edildi.", "detected_w": 40, "detected_h": 20, "detected_d": 25, "confidence": 0.9}}
    """

    # 1. DENEME: Gemini API
    client = _get_gemini_client()
    if client:
        # google-genai SDK'sının güncel modelleri
        candidate_models = ['gemini-2.5-flash', 'gemini-2.0-flash']

        for model_name in candidate_models:
            try:
                pil_image = Image.open(io.BytesIO(image_bytes))

                response = client.models.generate_content(
                    model=model_name,
                    contents=[pil_image, prompt],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.0
                    )
                )
                raw = response.text.strip()
                data = json.loads(raw)
                print(f"[Vision Success] Gemini ({model_name}) ile analiz tamamlandi.")
                return _build_response(data, operator, limits)
            except Exception as gemini_err:
                print(f"[Vision Warning] Gemini ({model_name}) hatasi: {gemini_err}")

    # 2. DENEME: OpenAI API (Yedek)
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            async_client = AsyncOpenAI(api_key=openai_key)
            b64 = _image_to_base64(image_bytes)
            resp = await async_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
                        ],
                    }
                ],
                max_tokens=300,
                temperature=0.0,
            )
            raw = resp.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw.strip())
            print("[Vision Success] OpenAI (gpt-4o-mini) ile analiz tamamlandi.")
            return _build_response(data, operator, limits)
        except Exception as oai_err:
            print(f"[Vision Warning] OpenAI hatasi: {oai_err}")

    # 3. DENEME: Demo Fallback (Key yoksa veya servisler çöktüyse)
    print("[Vision Warning] API anahtarlari calismadi, Demo moduna geciliyor.")
    return _heuristic_fallback(operator, limits)


def _build_response(
        data: dict,
        operator: str,
        limits: dict,
) -> BaggageScanResponse:
    if not data.get("is_luggage"):
        return BaggageScanResponse(
            is_luggage=False,
            message=data.get("message",
                             "Görselde çanta veya valiz tespit edilemedi. Lütfen net bir fotoğraf yükleyin."),
            status=None,
            detected_dimensions=None,
            allowed_dimensions=None,
            overage_cm=None,
            potential_gate_fee_eur=0.0,
            confidence_score=0.0,
            recommendations=["Çantanın net göründüğü bir fotoğraf çekip tekrar deneyin."]
        )

    w = float(data.get("detected_w") or limits["w"])
    h = float(data.get("detected_h") or limits["h"])
    d = float(data.get("detected_d") or limits["d"])
    conf = float(data.get("confidence", 0.9))

    ow = max(0.0, w - limits["w"])
    oh = max(0.0, h - limits["h"])
    od = max(0.0, d - limits["d"])
    is_oversized = ow > 0 or oh > 0 or od > 0

    status = "FAIL" if is_oversized else ("WARNING" if conf < 0.8 else "PASS")
    gate_fee = float(limits["gate_fee"]) if is_oversized else 0.0
    savings = gate_fee - 18.0 if gate_fee > 0 else 0.0

    recs: list[str] = []
    if is_oversized:
        recs.append(
            f"Çantanız {operator} kabin limitini ({limits['w']}×{limits['h']}×{limits['d']} cm) aşıyor."
        )
        if gate_fee > 0:
            recs.append(
                f"Kapıda €{gate_fee:.0f} ceza ödememek için online kabin hakkı ekleyin (€{savings:.0f} tasarruf)."
            )
        recs.append("Çantanızı sıkıştırarak birkaç cm küçültmeyi deneyin.")
    else:
        recs.append("Çantanız kabin limitleri içinde — tamamen güvenli.")

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
        confidence_score=round(conf, 2),
        recommendations=recs,
    )


def _heuristic_fallback(operator: str, limits: dict) -> BaggageScanResponse:
    """Demo modu."""
    return BaggageScanResponse(
        is_luggage=False,
        message="[Demo] Görsel analizi için GEMINI_API_KEY bulunamadı veya bağlantı sağlanamadı.",
        status=None,
        confidence_score=0.0,
        recommendations=["Lütfen .env dosyanızdaki API anahtarını kontrol edin."],
    )


# ── Bilet Analiz Motoru ───────────────────────────────────────

AIRLINE_RISK_DB: dict[str, list[dict]] = {
    "RYANAIR": [
        {"level": "CRITICAL", "title": "Havalimanı check-in ücreti",
         "desc": "Online check-in yapılmazsa €55 havalimanı check-in ücreti uygulanır.", "fine": 55},
        {"level": "WARNING", "title": "Kapıda bagaj boyut kontrolü",
         "desc": "40×20×25 cm'yi aşan çantalardan kapıda €70 ceza kesilir.", "fine": 70},
        {"level": "INFO", "title": "Dark pattern: ön-seçim sigorta",
         "desc": "Onay e-postasında seyahat sigortası önceden işaretlidir.", "fine": 0},
    ],
    "WIZZAIR": [
        {"level": "CRITICAL", "title": "Havalimanı check-in ücreti",
         "desc": "Online check-in yapılmazsa €30–50 havalimanı check-in ücreti uygulanır.", "fine": 50},
        {"level": "CRITICAL", "title": "Gidiş kaçırılırsa dönüş iptal",
         "desc": "Gidiş-dönüş biletlerde gidiş kaçırılırsa dönüş otomatik iptal edilir.", "fine": 0},
        {"level": "WARNING", "title": "Bagaj boyut kontrolü çok katı",
         "desc": "40×30×20 cm limiti havalimanında ölçülür, 1 cm aşımda €45–80 ceza.", "fine": 80},
    ],
}


def analyze_ticket(
        operator: str,
        origin: str,
        destination: str,
        transport_mode: str,
        cabin_bag_included: bool,
) -> TicketAnalysisResponse:
    op = operator.upper()
    raw_risks = AIRLINE_RISK_DB.get(op, [
        {"level": "INFO", "title": "Genel bilet kontrolü", "desc": "Seyahat öncesi bilet koşullarını kontrol edin.",
         "fine": 0}
    ])

    alerts = [
        TicketRiskAlert(
            level=r["level"],
            title=r["title"],
            description=r["desc"],
            potential_fine_eur=float(r["fine"]),
        )
        for r in raw_risks
    ]

    total_risk = sum(a.potential_fine_eur for a in alerts if a.level == "CRITICAL")
    total_saved = sum(a.potential_fine_eur for a in alerts if a.potential_fine_eur > 0 and a.level != "CRITICAL") * 0.7

    return TicketAnalysisResponse(
        operator=op,
        origin=origin,
        destination=destination,
        transport_mode=transport_mode,
        risks=alerts,
        total_risk_eur=round(total_risk, 2),
        total_saved_eur=round(total_saved, 2),
        cabin_bag_included=cabin_bag_included,
    )