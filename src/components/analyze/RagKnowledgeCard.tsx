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

const LOCAL_KNOWLEDGE_BASE: PolicyChunk[] = [
  {
    id: "THY_BAG_01",
    operator: "THY",
    category: "BAGGAGE",
    title: "Türk Hava Yolları Kabin Bagajı Esasları",
    clause_ref: "THY Genel Şartlar Madde 4.2.1",
    content: "Türk Hava Yolları tüm tarifeli uçuşlarda ekonomi sınıfı yolcularına 1 adet maksimum 55x40x23 cm boyutlarında ve 8 kg ağırlığında kabin bagajı ile 1 adet kişisel eşya (40x30x15 cm) hakkı tanır. Sınırı aşan bagajlar uçağa alınmaz ve kapıda ₺600 - ₺1200 (€20 - €60) ceza ödemesi uygulanarak kargo bölümüne gönderilir.",
  },
  {
    id: "THY_CHECKIN_01",
    operator: "THY",
    category: "CHECKIN",
    title: "Türk Hava Yolları Online Check-in Kapanış Süreleri",
    clause_ref: "THY Kural Madde 2.4",
    content: "Dış hat uçuşlarında online check-in uçuştan 24 saat önce açılır ve uçuştan 90 dakika önce kapanır. İç hat uçuşlarında kapanış süresi uçuştan 45 dakika öncesidir. Havalimanında kontuar kapanış saatini kaçıran yolcular uçuşa kabul edilmez.",
  },
  {
    id: "PEGASUS_BAG_01",
    operator: "PEGASUS",
    category: "BAGGAGE",
    title: "Pegasus Light Paket Kabin Bagajı Kısıtlamaları",
    clause_ref: "FlyPegasus Kural Madde 7.1",
    content: "Pegasus 'Light' (en ucuz) bilet paketi satın alan yolcuların yalnızca koltuk altına sığacak 1 adet küçük kişisel eşya (40x30x15 cm, maks 3 kg) hakkı bulunur. Baş üstü dolabına konacak 55x40x20 cm kabin bagajı için biletleme sırasında veya kapıda ekstra ücret ödenmesi zorunludur. Kapıda yapılan tespitlerde €50 - €80 aşım cezası tahsil edilir.",
  },
  {
    id: "PEGASUS_SEAT_01",
    operator: "PEGASUS",
    category: "SEAT_TRAP",
    title: "Pegasus Otomatik Koltuk Seçim Tuzağı",
    clause_ref: "FlyPegasus Bilet Adımı 3",
    content: "Bilet satın alımı sırasında sistem otomatik olarak ücretli koltuk seçimi ($8 - $25) ekler. Yolcular ödeme adımına geçmeden önce 'Rastgele Ücretsiz Koltuk Ata' butonunu işaretlemelidir, aksi takdirde koltuk bedeli otomatik fatura edilir.",
  },
  {
    id: "RYANAIR_BAG_01",
    operator: "RYANAIR",
    category: "BAGGAGE",
    title: "Ryanair Kabin Bagajı Cezaları ve Limitleri",
    clause_ref: "Ryanair Terms Section 8.1",
    content: "Ryanair standart biletlerde yalnızca 40x20x25 cm boyutlarında 1 adet küçük kişisel eşya hakkı verir. Boyutu 40x20x25 cm'yi geçen çantalar için kapıda €70 - €75 (Gate Baggage Fee) ceza tahsil edilir ve çanta kargoya verilir. Priority 2 Cabin Bags paketi satın alarak (€18 - €30) 55x40x20 cm büyük kabin çantası eklenebilir.",
  },
  {
    id: "RYANAIR_CHECKIN_01",
    operator: "RYANAIR",
    category: "CHECKIN",
    title: "Ryanair Havalimanı Check-in Cezası",
    clause_ref: "Ryanair Terms Section 6.2",
    content: "Ryanair yolcularının uçuştan en geç 2 saat öncesine kadar Ryanair mobil uygulaması veya web sitesinden online check-in yapması zorunludur. Havalimanı kontuarında check-in yaptırmak isteyen yolculardan kişi başı €55 Airport Check-in Fee tahsil edilir.",
  },
  {
    id: "WIZZAIR_BAG_01",
    operator: "WIZZAIR",
    category: "BAGGAGE",
    title: "Wizz Air Kabin Bagajı ve WIZZ Priority Rules",
    clause_ref: "Wizz Air General Conditions Clause 14.1",
    content: "Wizz Air ücretsiz olarak yalnızca 40x30x20 cm (maks 10 kg) boyutlarında çanta kabul eder. WIZZ Priority olmadan 55x40x23 cm boyutlu troley bagaj uçağa alınmaz. Kapı aşım cezası (Gate Baggage Fee) €80'dir.",
  },
  {
    id: "EASYJET_BAG_01",
    operator: "EASYJET",
    category: "BAGGAGE",
    title: "EasyJet Kabin Çantası Kuralları",
    clause_ref: "EasyJet Terms Rule 11.2",
    content: "EasyJet standart bilet sahipleri 45x36x20 cm boyutlarında (ağırlık sınırı yok) tek çanta taşıyabilir. Kapıda limit aşımı tespit edildiğinde €48 (or £48) kapı bagaj cezası uygulanır.",
  },
  {
    id: "AJET_BAG_01",
    operator: "AJET",
    category: "BAGGAGE",
    title: "AJet (AnadoluJet) Kabin Bagajı Hakları",
    clause_ref: "AJet Uçuş Kuralları Bölüm 3",
    content: "AJet tüm tarifeli uçuşlarda 55x40x20 cm ebatlarında (maks 8 kg) 1 adet kabin bagajı ve 40x30x15 cm 1 adet kişisel eşya hakkı sunar. Kapı aşımında iç hatlarda ₺350, dış hatlarda €50 ceza uygulanır.",
  },
  {
    id: "SUNEXPRESS_BAG_01",
    operator: "SUNEXPRESS",
    category: "BAGGAGE",
    title: "SunExpress Kabin Bagaj Sınırları",
    clause_ref: "SunExpress Taşıma Şartları Madde 8",
    content: "SunExpress seyahatlerinde kabin bagajı limiti 55x40x20 cm ve maksimum 8 kg'dır. Limit aşımında kilogram başına €10 - €15 fazla bagaj ücreti veya kapıda €45 sabitleme cezası alınır.",
  },
  {
    id: "CORENDON_BAG_01",
    operator: "CORENDON",
    category: "BAGGAGE",
    title: "Corendon Airlines Kabin Kuralları",
    clause_ref: "Corendon Bagaj Esasları Madde 5",
    content: "Corendon uçuşlarında kabin bagajı maksimum 55x40x20 cm ve 8 kg'dır. Güvenlik ve kapı kontuarında limiti aşan bavullar kargoya aktarılarak €45 kapı cezası fatura edilir.",
  },
  {
    id: "TRENITALIA_BAG_01",
    operator: "TRENITALIA",
    category: "BAGGAGE",
    title: "Trenitalia Yüksek Hızlı Tren Bagaj Limitleri",
    clause_ref: "Trenitalia Regolamento Bagagli 2024",
    content: "Trenitalia Frecciarossa ve Frecciargento trenlerinde bagaj limiti kişi başı 2 adet büyüklük sınırı (toplam boyut 183 cm) gözetilmeksizin bagajdır. Sınırı aşan veya koridorları kapatan bagajlara €50 tren içi ceza uygulanır.",
  },
];

function getLocalRagFallback(searchQuery: string, searchOp: string): RagResponse {
  const opClean = searchOp.toUpperCase();
  const qLower = searchQuery.toLowerCase();
  const qTokens = qLower.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, "").split(/\s+/).filter((t) => t.length > 1);

  const scored = LOCAL_KNOWLEDGE_BASE.map((item) => {
    let score = 0;
    const itemOp = item.operator.toUpperCase();
    if (opClean && (itemOp === opClean || item.title.toUpperCase().includes(opClean))) {
      score += 5;
    }

    const corpus = (item.title + " " + item.content + " " + item.category + " " + item.clause_ref).toLowerCase();
    qTokens.forEach((token) => {
      if (corpus.includes(token)) {
        score += 3;
      }
    });

    if (qLower.includes("checkin") || qLower.includes("check-in") || qLower.includes("kontuar") || qLower.includes("kapan")) {
      if (item.category === "CHECKIN") score += 8;
    }
    if (qLower.includes("koltuk") || qLower.includes("seat") || qLower.includes("seçim")) {
      if (item.category === "SEAT_TRAP") score += 8;
    }
    if (qLower.includes("bagaj") || qLower.includes("kabin") || qLower.includes("ceza") || qLower.includes("limit") || qLower.includes("boyut")) {
      if (item.category === "BAGGAGE") score += 5;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topItems = scored.filter((s) => s.score > 0).map((s) => s.item);
  const chunks = topItems.length > 0
    ? topItems.slice(0, 3)
    : LOCAL_KNOWLEDGE_BASE.filter((i) => i.operator === opClean || i.operator === "THY").slice(0, 2);

  const citations = chunks.map((c) => `${c.operator} - ${c.clause_ref}: ${c.title}`);
  
  let answer = `📌 **${chunks[0].title}** (${chunks[0].clause_ref})\n${chunks[0].content}\n\n`;
  if (chunks.length > 1) {
    answer += `**İlgili Diğer Mevzuat Maddeleri:**\n`;
    chunks.slice(1).forEach((c) => {
      answer += `• **${c.clause_ref}**: ${c.content}\n`;
    });
  }

  return {
    query: searchQuery,
    operator: searchOp,
    retrieved_chunks: chunks,
    answer,
    citations,
    is_demo: true,
  };
}

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
        signal: AbortSignal.timeout(6_000), // 6s timeout before falling back
      });

      if (!res.ok) {
        throw new Error("RAG servisine ulaşılamadı.");
      }

      const data: RagResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.warn("RAG backend kapalı — akıllı yerel RAG motoruna düşülüyor:", err);
      const fallbackData = getLocalRagFallback(searchQuery, searchOp);
      setResult(fallbackData);
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
