# ─────────────────────────────────────────────────────────────
# backend/main.py
# Travel Shield AI — FastAPI Backend
#
# Endpoints:
#   GET  /               → health check
#   POST /api/v1/scan-luggage    → Vision AI bagaj taraması
#   POST /api/v1/analyze-ticket  → Bilet kural analizi
#
# Başlatmak için:
#   pip install -r requirements.txt
#   uvicorn main:app --reload --port 8000
#
# Ortam değişkenleri (.env dosyasına koy):
#   GEMINI_API_KEY=...   (Google AI Studio'dan al — ücretsiz)
#   OPENAI_API_KEY=...   (opsiyonel, fallback için)
# ─────────────────────────────────────────────────────────────

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv

# En üstte .env dosyasını yüklüyoruz
load_dotenv()

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.vision_service import (
    BaggageScanResponse,
    TicketAnalysisResponse,
    analyze_luggage_image,
    analyze_ticket,
)
from services.rag_service import (
    RagAnalysisResponse,
    generate_rag_analysis,
)

load_dotenv()

# ── Uygulama yaşam döngüsü ────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    gemini_ok = bool(os.getenv("GEMINI_API_KEY"))
    openai_ok  = bool(os.getenv("OPENAI_API_KEY"))
    print("=" * 60)
    print("  Travel Shield AI — Backend Başlatıldı")
    print(f"  Gemini API : {'✓ Yapılandırıldı' if gemini_ok else '✗ API anahtarı yok (demo modu)'}")
    print(f"  OpenAI API : {'✓ Yapılandırıldı (fallback)' if openai_ok else '✗ Yok'}")
    print("=" * 60)
    yield


# ── FastAPI uygulaması ────────────────────────────────────────
app = FastAPI(
    title="Travel Shield AI API",
    description="Bütçeli gezginleri havayolu ceza tuzaklarına karşı koruyan AI backend.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (Next.js frontend ile konuşmak için) ─────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://travel-shield.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── İzin verilen MIME türleri ─────────────────────────────────
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── Request/Response modelleri ────────────────────────────────
class TicketAnalysisRequest(BaseModel):
    operator: str
    origin: str
    destination: str
    transport_mode: str = "FLIGHT"
    cabin_bag_included: bool = False


class RagQueryRequest(BaseModel):
    query: str
    operator: str = ""


class HealthResponse(BaseModel):
    status: str
    version: str
    gemini_configured: bool
    openai_configured: bool


# ── Sağlık kontrolü ───────────────────────────────────────────
@app.get("/", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version="1.0.0",
        gemini_configured=bool(os.getenv("GEMINI_API_KEY")),
        openai_configured=bool(os.getenv("OPENAI_API_KEY")),
    )


# ── ENDPOINT 1: Bagaj Görüntü Taraması ───────────────────────
@app.post(
    "/api/v1/scan-luggage",
    response_model=BaggageScanResponse,
    tags=["AI Vision"],
    summary="Bagaj görselini Vision AI ile analiz et",
    description="""
Yüklenen bagaj görüntüsünü Gemini 1.5 Flash (veya GPT-4o-mini) ile analiz eder.

**Adımlar:**
1. Görselde bagaj/çanta olup olmadığını doğrular
2. Varsa: tahmini boyutları çıkarır
3. Belirtilen havayolunun kabin limitleriyle karşılaştırır
4. PASS / FAIL / WARNING durumu ve öneriler döner
""",
)
async def scan_luggage(
    file: Annotated[UploadFile, File(description="Bagaj fotoğrafı (JPG/PNG/WEBP)")],
    operator: Annotated[str, Form(description="Havayolu kodu (RYANAIR, THY, PEGASUS vb.)")] = "RYANAIR",
) -> BaggageScanResponse:

    # Dosya tipi kontrolü
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Desteklenmeyen dosya türü: {file.content_type}. Lütfen JPG, PNG veya WEBP yükleyin.",
        )

    # Dosya boyutu kontrolü
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Dosya boyutu 10 MB sınırını aşıyor. Lütfen daha küçük bir görsel yükleyin.",
        )

    if len(image_bytes) < 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Görsel çok küçük veya bozuk. Lütfen geçerli bir fotoğraf yükleyin.",
        )

    try:
        result = await analyze_luggage_image(
            image_bytes=image_bytes,
            mime_type=file.content_type or "image/jpeg",
            operator=operator.upper(),
        )
        return result
    except Exception as exc:
        print(f"[scan-luggage] Vision AI hatası: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vision AI servisi geçici olarak kullanılamıyor. Lütfen tekrar deneyin.",
        )


# ── ENDPOINT 2: Bilet Kural Analizi ──────────────────────────
@app.post(
    "/api/v1/analyze-ticket",
    response_model=TicketAnalysisResponse,
    tags=["AI Analysis"],
    summary="Bilet metni veya manuel girişi analiz et",
    description="""
Havayolu, rota ve kabin bagajı bilgisine göre risk ve ceza analizi yapar.
Gizli ücretleri, dark pattern'leri ve operasyonel tuzakları tespit eder.
""",
)
async def analyze_ticket_endpoint(
    body: TicketAnalysisRequest,
) -> TicketAnalysisResponse:
    try:
        result = analyze_ticket(
            operator=body.operator,
            origin=body.origin,
            destination=body.destination,
            transport_mode=body.transport_mode,
            cabin_bag_included=body.cabin_bag_included,
        )
        return result
    except Exception as exc:
        print(f"[analyze-ticket] Hata: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bilet analizi sırasında bir hata oluştu.",
        )


# ── ENDPOINT 3: RAG Mevzuat Sorgulama ─────────────────────────
@app.post(
    "/api/v1/rag-query",
    response_model=RagAnalysisResponse,
    tags=["RAG Engine"],
    summary="Yapay Zeka RAG ile resmi mevzuat ve ceza kuralı sorgula",
    description="""
Bilgi tabanından ilgili resmi sözleşme ve kural maddelerini (Retrieval) çeker,
Gemini LLM ile gerekçeli ve atıflı RAG yanıtı üretir (Augmented Generation).
""",
)
async def rag_query_endpoint(
    body: RagQueryRequest,
) -> RagAnalysisResponse:
    try:
        result = await generate_rag_analysis(
            query=body.query,
            operator=body.operator,
        )
        return result
    except Exception as exc:
        print(f"[rag-query] Hata: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="RAG sorgulaması sırasında bir hata oluştu.",
        )


# ── Genel hata yakalayıcı ─────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc: Exception):
    print(f"[Unhandled] {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Beklenmeyen bir sunucu hatası oluştu."},
    )
