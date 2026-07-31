# ─────────────────────────────────────────────────────────────
# backend/services/rag_service.py
# Travel Shield AI — Retrieval-Augmented Generation (RAG) Engine
#
# Sorumluluklar:
#  1. airline_policies.json bilgi tabanından en alakalı kuralları çekmek (Retrieval)
#  2. Çekilen kural parçaları + kullanıcı sorgusunu Gemini LLM'e beslemek (Augmentation & Generation)
#  3. Alıntılı ve gerekçeli RAG raporu üretmek
# ─────────────────────────────────────────────────────────────

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, List, Optional

from pydantic import BaseModel

# Gemini SDK (google-genai)
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Knowledge base yükleme
POLICIES_FILE = Path(__file__).parent.parent / "data" / "airline_policies.json"

class PolicyChunk(BaseModel):
    id: str
    operator: str
    category: str
    title: str
    clause_ref: str
    content: str
    score: Optional[float] = None

class RagAnalysisResponse(BaseModel):
    query: str
    operator: str
    retrieved_chunks: List[PolicyChunk]
    answer: str
    citations: List[str]
    is_demo: bool = False

_KNOWLEDGE_BASE: List[dict] = []

def _load_knowledge_base():
    global _KNOWLEDGE_BASE
    if not _KNOWLEDGE_BASE and POLICIES_FILE.exists():
        try:
            with open(POLICIES_FILE, "r", encoding="utf-8") as f:
                _KNOWLEDGE_BASE = json.load(f)
        except Exception as err:
            print(f"[RAG] Bilgi tabanı yüklenemedi: {err}")

# Başlangıçta bir kez yükle
_load_knowledge_base()


def retrieve_policy_chunks(query: str, operator: str = "", top_k: int = 3) -> List[PolicyChunk]:
    """Sorgu ve operatör adına göre bilgi tabanından en alakalı kural maddelerini skorlar ve çeker."""
    _load_knowledge_base()
    if not _KNOWLEDGE_BASE:
        return []

    op_clean = operator.strip().upper()
    query_tokens = set(re.findall(r"\w+", query.lower()))

    scored_items: List[tuple[float, dict]] = []

    for item in _KNOWLEDGE_BASE:
        score = 0.0
        item_op = item.get("operator", "").upper()
        
        # 1. Operatör tam eşleşmesi (büyük bonus)
        if op_clean and (item_op == op_clean or op_clean in item.get("title", "").upper()):
            score += 10.0
        
        # 2. İçerik ve başlık kelime eşleşmeleri
        text_corpus = (item.get("title", "") + " " + item.get("content", "") + " " + item.get("category", "")).lower()
        corpus_tokens = set(re.findall(r"\w+", text_corpus))
        
        overlap = query_tokens.intersection(corpus_tokens)
        score += len(overlap) * 2.0

        # Eğer sorgu bagaj/kabin/ceza gibi anahtar kelimeler içeriyorsa kategori bonusu
        if "bagaj" in query.lower() or "kabin" in query.lower() or "bavul" in query.lower():
            if item.get("category") == "BAGGAGE":
                score += 3.0
        if "checkin" in query.lower() or "kontuar" in query.lower():
            if item.get("category") == "CHECKIN":
                score += 3.0

        if score > 0:
            scored_items.append((score, item))

    # Skora göre sırala
    scored_items.sort(key=lambda x: x[0], reverse=True)

    results: List[PolicyChunk] = []
    for score, item in scored_items[:top_k]:
        results.append(
            PolicyChunk(
                id=item["id"],
                operator=item["operator"],
                category=item["category"],
                title=item["title"],
                clause_ref=item["clause_ref"],
                content=item["content"],
                score=round(score, 2),
            )
        )

    # Eğer hiçbir şey bulunamadıysa operatörün tüm kurallarını döndür
    if not results and op_clean:
        for item in _KNOWLEDGE_BASE:
            if item.get("operator", "").upper() == op_clean:
                results.append(
                    PolicyChunk(
                        id=item["id"],
                        operator=item["operator"],
                        category=item["category"],
                        title=item["title"],
                        clause_ref=item["clause_ref"],
                        content=item["content"],
                        score=1.0,
                    )
                )
                if len(results) >= top_k:
                    break

    return results


async def generate_rag_analysis(query: str, operator: str = "") -> RagAnalysisResponse:
    """RAG Boru Hattı: Retrieval + Augmented Context Generation"""
    chunks = retrieve_policy_chunks(query=query, operator=operator, top_k=3)
    citations = [f"{c.operator} - {c.clause_ref}: {c.title}" for c in chunks]

    api_key = os.getenv("GEMINI_API_KEY")

    # Eğer API key yoksa veya Gemini SDK yoksa akıllı mock cevabı üret
    if not api_key or not HAS_GENAI:
        return _generate_demo_rag_response(query, operator, chunks, citations)

    # Context metnini oluştur
    context_str = "\n\n".join(
        [f"[{c.clause_ref}] ({c.title}):\n{c.content}" for c in chunks]
    )

    prompt = f"""Sen Travel Shield AI kural ve ceza uzmanısın.
Aşağıda sunulan resmi mevzuat ve havayolu sözleşme maddelerini (CONTEXT) esas alarak kullanıcının sorusunu yanıtla.

[RESMİ SÖZLEŞME VE KURAL MADDELERİ - CONTEXT]
{context_str if context_str else "Resmi kural verisi bulunamadı."}

[KULLANICI SORUSU]
{query} (Operatör: {operator})

[TALİMATLAR]
1. Yanıtında doğrudan verilen CONTEXT maddelerine atıfta bulun (Örn: 'THY Genel Şartlar Madde 4.2.1 uyarınca...').
2. Varsa kapı cezası (gate fee) ve bagaj limitlerini net rakamlarla belirt.
3. Yanıtı Türkçe, kısa, anlaşılır ve madde işaretli olarak formatla.
"""

    models_to_try = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash-8b",
    ]

    client = genai.Client(api_key=api_key)

    for model_name in models_to_try:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=600,
                ),
            )
            if response.text:
                return RagAnalysisResponse(
                    query=query,
                    operator=operator,
                    retrieved_chunks=chunks,
                    answer=response.text.strip(),
                    citations=citations,
                    is_demo=False,
                )
        except Exception as err:
            print(f"[RAG] Model {model_name} hatası: {err}")
            continue

    # LLM başarısız olursa fallback cevabı dön
    return _generate_demo_rag_response(query, operator, chunks, citations)


def _generate_demo_rag_response(
    query: str, operator: str, chunks: List[PolicyChunk], citations: List[str]
) -> RagAnalysisResponse:
    """Demo veya Fallback RAG cevabı üreticisi"""
    if chunks:
        main_chunk = chunks[0]
        answer = f"**RAG Bilgi Tabanı Sorgu Sonucu ({main_chunk.operator}):**\n\n"
        answer += f"📌 **{main_chunk.title}** ({main_chunk.clause_ref})\n"
        answer += f"{main_chunk.content}\n\n"
        if len(chunks) > 1:
            answer += "**İlgili Diğer Mevzuat Maddeleri:**\n"
            for c in chunks[1:]:
                answer += f"• **{c.clause_ref}**: {c.title}\n"
    else:
        answer = f"**Travel Shield RAG Analizi ({operator}):**\n\n"
        answer += f"Sorguladığınız '{query}' konusu için genel taşıma şartları uyarınca, havayolu kapı kontrolünde milimetrik çanta aşımı cezası ve online check-in kısıtlaması uygulanmaktadır."

    return RagAnalysisResponse(
        query=query,
        operator=operator,
        retrieved_chunks=chunks,
        answer=answer,
        citations=citations,
        is_demo=True,
    )
