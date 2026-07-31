"use client";

/**
 * @file RagKnowledgeCard.tsx
 * @description Yapay Zeka RAG (Retrieval-Augmented Generation) Mevzuat & Ceza Sorgu Bileşeni.
 *
 * Havayolu politika anlık görüntülerini bilgi tabanından (knowledge base) çeker
 * ve kullanıcılara gerekçeli, madde atıflı resmi yanıtlar sunar.
 */

import { useState } from "react";
import { BookOpen, Search, Sparkles, ShieldCheck, FileText, Loader2, ArrowRight } from "lucide-react";

interface PolicyChunk {
  id: string;
  operator: string;
  category: string;
  title: string;
  clause_ref: string;
  content: string;
  score?: number;
}

interface RagResponse {
  query: string;
  operator: string;
  retrieved_chunks: PolicyChunk[];
  answer: string;
  citations: string[];
  is_demo: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const QUICK_QUERIES = [
  { label: "THY El Bagajı Sınırı", query: "THY el bagajı sınırı nedir ve kapı cezası ne kadar?", op: "THY" },
  { label: "Pegasus Koltuk Seçim Tuzağı", query: "Pegasus biletinde otomatik koltuk ücreti tuzağı nasıl engellenir?", op: "PEGASUS" },
  { label: "Ryanair Check-in Cezası", query: "Ryanair havalimanı kontuar check-in ücreti kaç Euro?", op: "RYANAIR" },
  { label: "Wizz Air Priority Bagajı", query: "Wizz Air Priority olmadan büyük kabin çantası uçağa alınır mı?", op: "WIZZAIR" },
];

export default function RagKnowledgeCard() {
  const [query, setQuery] = useState("");
  const [operator, setOperator] = useState("THY");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RagResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string, searchOp: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/rag-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, operator: searchOp }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        throw new Error("RAG servisine ulaşılamadı.");
      }

      const data: RagResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.warn("RAG sorgusu başarısız:", err);
      setResult(null);
      setErrorMsg("Mevzuat servisine şu anda ulaşılamıyor. Doğrulanmamış bir yanıt göstermek yerine lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Yapay Zeka RAG Mevzuat Sorgusu</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                <Sparkles size={10} className="animate-pulse" />
                RAG Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Politika anlık görüntülerinden kaynaklı retrieval ve gerekçeli AI yanıtı
            </p>
          </div>
        </div>

        {/* Operator Select */}
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="THY">🇹🇷 THY</option>
          <option value="PEGASUS">🐎 Pegasus</option>
          <option value="AJET">✈️ AJet</option>
          <option value="RYANAIR">🟡 Ryanair</option>
          <option value="WIZZAIR">🟣 Wizz Air</option>
          <option value="EASYJET">🟠 EasyJet</option>
        </select>
      </div>

      {/* Input & Search Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query, operator);
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={600}
            placeholder="Örn: THY el bagajı sınırı nedir ve kapı cezası ne kadar?"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Sorgulanıyor...</span>
            </>
          ) : (
            <>
              <span>Mevzuat Ara (RAG)</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {errorMsg && (
        <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
          {errorMsg}
        </p>
      )}

      {/* Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-500">Örnek Sorgular:</span>
        {QUICK_QUERIES.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(item.query);
              setOperator(item.op);
              handleSearch(item.query, item.op);
            }}
            className="text-[11px] font-medium bg-slate-800/70 hover:bg-purple-950/50 hover:text-purple-300 border border-slate-700 hover:border-purple-500/30 text-slate-300 px-2.5 py-1 rounded-lg transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-950/10 p-4 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>RAG Bilgi Tabanı Yanıtı & Mevzuat Atıfları</span>
            </div>
            {result.is_demo && (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Demo / fallback — resmi doğrulama gerekli
              </span>
            )}
          </div>

          {/* AI Generated Answer */}
          <div className="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
            {result.answer}
          </div>

          {/* Retrieved Policy Chunks */}
          {result.retrieved_chunks && result.retrieved_chunks.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300/80 flex items-center gap-1.5">
                <FileText size={12} />
                Çekilen politika anlık görüntüleri (Retrieval):
              </p>
              <div className="grid grid-cols-1 gap-2">
                {result.retrieved_chunks.map((chunk, i) => (
                  <div key={i} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs">
                    <div className="flex items-center justify-between text-purple-400 font-bold text-[11px] mb-1">
                      <span>{chunk.title}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{chunk.clause_ref}</span>
                    </div>
                    <p className="text-slate-300 leading-normal text-[11px]">{chunk.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.citations.length > 0 && (
            <div className="space-y-1 text-[11px] text-slate-400">
              <p className="font-semibold uppercase tracking-wider text-purple-300/80">Atıflar</p>
              <ul className="list-inside list-disc space-y-1">
                {result.citations.map((citation) => <li key={citation}>{citation}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
