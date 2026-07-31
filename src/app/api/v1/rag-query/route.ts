import { NextResponse } from "next/server";

export interface PolicyChunk {
  id: string;
  operator: string;
  category: string;
  title: string;
  clause_ref: string;
  content: string;
  score?: number;
}

const POLICIES: PolicyChunk[] = [
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
    content: "Trenitalia Frecciarossa ve Frecciargento trenlerinde bagaj sınırı kişi başı 2 adet bagajdır. Sınırı aşan veya koridorları kapatan bagajlara €50 tren içi ceza uygulanır.",
  },
  {
    id: "SNCF_BAG_01",
    operator: "SNCF",
    category: "BAGGAGE",
    title: "SNCF TGV Inoui ve Ouigo Bagaj Kuralları",
    clause_ref: "SNCF Reglement Bagages Art. 5",
    content: "SNCF TGV Inoui trenlerinde bagaj sınırı olmamakla birlikte her valizin üzerine isim etiketi takılması zorunludur. Ouigo trenlerinde ise bilet fiyatına yalnızca 1 kişisel eşya (36x27x15 cm) ve 1 kabin bagajı (55x35x25 cm) dahildir.",
  },
  {
    id: "DB_BAG_01",
    operator: "DB",
    category: "BAGGAGE",
    title: "Deutsche Bahn ICE Bagaj Esasları",
    clause_ref: "DB Beförderungsbedingungen Section 7",
    content: "Deutsche Bahn ICE hızlı trenlerinde yolcu başına 1 el bagajı ve 1 ek valiz hakkı bulunur. Eşyaların koltuk altı veya koltuk üstü bagaj raflarına sığması gerekir. Koridoru engelleyen bagajlar personel tarafından aktarılabilir.",
  },
  {
    id: "OBB_BAG_01",
    operator: "OBB",
    category: "BAGGAGE",
    title: "ÖBB Railjet Seyahat ve Bagaj Kuralları",
    clause_ref: "ÖBB Handgepäck Bestimmungen",
    content: "ÖBB Railjet trenlerinde yolcular bagaj raflarını ücretsiz kullanabilir. Ağır ve büyük valizler giriş alanlarındaki özel bagaj kompartımanlarına yerleştirilmelidir.",
  },
  {
    id: "FLIXBUS_BAG_01",
    operator: "FLIXBUS",
    category: "BAGGAGE",
    title: "FlixBus Bagaj Limitleri ve Ücret Politikası",
    clause_ref: "FlixBus Bagaj Şartları Madde 3.1",
    content: "FlixBus biletlerine 1 adet el bagajı (maks 42x30x18 cm, 7 kg) ve 1 adet kargo bagajı (maks 80x50x30 cm, 20 kg) dahildir. Ek kargo bagajı bilet alma esnasında €3-€5 karşılığında eklenebilir.",
  },
];

const OPERATOR_ALIASES: Record<string, string> = {
  wizz: "WIZZAIR", wizzair: "WIZZAIR",
  thy: "THY", turkish: "THY", "türk hava": "THY",
  pegasus: "PEGASUS", flypgs: "PEGASUS", flypegasus: "PEGASUS",
  ajet: "AJET", anadolu: "AJET",
  sunexpress: "SUNEXPRESS", sunx: "SUNEXPRESS",
  corendon: "CORENDON",
  ryanair: "RYANAIR", ryr: "RYANAIR",
  easyjet: "EASYJET", ezy: "EASYJET",
  trenitalia: "TRENITALIA",
  sncf: "SNCF",
  db: "DB", deutsche: "DB",
  obb: "OBB", öbb: "OBB",
  flixbus: "FLIXBUS", flix: "FLIXBUS",
};

function detectOperatorInQuery(query: string): string {
  const q = query.toLowerCase();
  for (const [alias, code] of Object.entries(OPERATOR_ALIASES)) {
    if (q.includes(alias)) return code;
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { query, operator } = await req.json();
    const qRaw = String(query || "").trim();

    if (!qRaw) {
      return NextResponse.json({ error: "Sorgu boş olamaz." }, { status: 400 });
    }

    const qLower = qRaw.toLowerCase();
    const qTokens = qLower.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, "").split(/\s+/).filter(t => t.length > 1);

    // Etkin operatör: önce sorgu metninde geçen havayolu, yoksa dropdown seçimi.
    const opClean = detectOperatorInQuery(qRaw) || String(operator || "").toUpperCase();

    // Operatör biliniyorsa retrieval'ı yalnızca o havayolunun maddeleriyle sınırla;
    // aksi halde başka havayollarının kuralları contexte ve atıflara sızıyor.
    const searchPool = opClean
      ? POLICIES.filter(i => i.operator.toUpperCase() === opClean)
      : POLICIES;
    const pool = searchPool.length > 0 ? searchPool : POLICIES;

    // Retrieval scoring
    const scored = pool.map(item => {
      let score = 0;
      const itemOp = item.operator.toUpperCase();

      if (opClean && (itemOp === opClean || item.title.toUpperCase().includes(opClean))) {
        score += 8;
      }
      const corpus = (item.title + " " + item.content + " " + item.category + " " + item.clause_ref).toLowerCase();
      qTokens.forEach(token => {
        if (corpus.includes(token)) score += 4;
      });

      if (qLower.includes("checkin") || qLower.includes("check-in") || qLower.includes("kontuar") || qLower.includes("kapan")) {
        if (item.category === "CHECKIN") score += 10;
      }
      if (qLower.includes("koltuk") || qLower.includes("seat") || qLower.includes("seçim")) {
        if (item.category === "SEAT_TRAP") score += 10;
      }
      if (qLower.includes("bagaj") || qLower.includes("kabin") || qLower.includes("ceza") || qLower.includes("limit") || qLower.includes("boyut")) {
        if (item.category === "BAGGAGE") score += 6;
      }

      return { item: { ...item, score }, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.filter(s => s.score > 0).map(s => s.item);
    const chunks = topMatches.length > 0
      ? topMatches.slice(0, 3)
      : pool.slice(0, 2);

    const citations = chunks.map(c => `${c.operator} - ${c.clause_ref}: ${c.title}`);

    // If Gemini API Key exists in environment, call Gemini LLM for Augmented Generation!
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const contextStr = chunks.map(c => `[${c.clause_ref}] (${c.title}):\n${c.content}`).join("\n\n");
      const promptStr = `Sen Travel Shield AI kural ve ceza uzmanısın.
Aşağıda sunulan resmi mevzuat ve havayolu sözleşme maddelerini (CONTEXT) esas alarak kullanıcının sorusunu yanıtla.

[RESMİ SÖZLEŞME VE KURAL MADDELERİ - CONTEXT]
${contextStr}

[KULLANICI SORUSU]
${qRaw} (Operatör: ${opClean || "Genel"})

[TALİMATLAR]
1. Yanıtında doğrudan verilen CONTEXT maddelerine atıfta bulun (Örn: 'THY Genel Şartlar Madde 4.2.1 uyarınca...').
2. Varsa kapı cezası (gate fee) ve bagaj limitlerini net rakamlarla belirt.
3. Yanıtı Türkçe, kısa, anlaşılır ve madde işaretli olarak formatla.
`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptStr }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const llmAnswer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (llmAnswer) {
          return NextResponse.json({
            query: qRaw,
            operator: opClean,
            retrieved_chunks: chunks,
            answer: llmAnswer.trim(),
            citations,
            is_demo: false,
          });
        }
      }
    }

    // Fallback RAG synthesis
    let answer = `📌 **${chunks[0].title}** (${chunks[0].clause_ref})\n${chunks[0].content}\n\n`;
    if (chunks.length > 1) {
      answer += `**İlgili Diğer Mevzuat Maddeleri:**\n`;
      chunks.slice(1).forEach(c => {
        answer += `• **${c.clause_ref}**: ${c.content}\n`;
      });
    }

    return NextResponse.json({
      query: qRaw,
      operator: opClean,
      retrieved_chunks: chunks,
      answer,
      citations,
      is_demo: true,
    });
  } catch (err) {
    console.error("[api/v1/rag-query] Hata:", err);
    return NextResponse.json({ error: "RAG sorgu hatası." }, { status: 500 });
  }
}
