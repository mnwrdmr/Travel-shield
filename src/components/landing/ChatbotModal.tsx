"use client";
// ─────────────────────────────────────────────────────────────
// src/components/landing/ChatbotModal.tsx
// SPRINT FINAL: WhatsApp TAMAMEN KALDIRILDI
//   ✅ Sadece Telegram (@TravelShieldBot)
//   ✅ Sky-blue Telegram teması
//   ✅ "WhatsApp / Telegram" ibaresi → "@TravelShieldBot"
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  highlightCard?: boolean;
  actionUrl?: string;
}

export default function ChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Merhaba! @TravelShieldBot'a hoş geldiniz 🛡️\n\nUçuşunuzu veya bagaj boyutlarınızı yazın — kapı cezanızı anında hesaplayalım.",
      time: "21:42",
    },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend ?? input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    const lower = text.toLowerCase();
    const isWizz    = lower.includes("wizz");
    const isThy     = lower.includes("thy") || lower.includes("turkish");
    const isPegasus = lower.includes("pegasus");

    setTimeout(() => {
      let replyText: string;

      if (isWizz) {
        replyText =
          "⚠️ WIZZ AIR KAPIDA CEZA RİSKİ!\n\n" +
          "• Resmi Limit: 40 × 30 × 20 cm\n" +
          "• Katı boyut kontrolü — 1 cm aşımda €45–80 ceza\n" +
          "• Öneri: Online kabin bagajı ekleyin.";
      } else if (isThy) {
        replyText =
          "✈️ TURKISH AIRLINES BİLET ANALİZİ\n\n" +
          "• Economy Lite biletlerde koltuk seçimi ücretli\n" +
          "• 2. bagaj için ek ücret uygulanabilir\n" +
          "• Miles&Smiles kart avantajlarını kontrol edin.";
      } else if (isPegasus) {
        replyText =
          "🟡 PEGASUS UYARI\n\n" +
          "• Economy Eco'da kabin bagajı dahil değil (€20–40)\n" +
          "• Havalimanı check-in: €25 ek ücret\n" +
          "• Öneri: Web check-in yapın.";
      } else {
        replyText =
          "⚠️ RYANAIR KAPIDA CEZA RİSKİ!\n\n" +
          "• Resmi Limit: 40 × 20 × 25 cm\n" +
          "• Taranan Çanta: 42 × 22 × 25 cm (+2 cm aşım)\n" +
          "• Olası Kapı Cezası: €70\n\n" +
          "💡 Çözüm: €18'e online kabin hakkı ekle → €52 net tasarruf!";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        highlightCard: true,
        actionUrl: "/analyze?tab=baggage",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  return (
    <>
      {/* Floating trigger — sadece Telegram */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white px-4 py-3 font-bold shadow-2xl transition-all hover:scale-105 group"
        aria-label="Telegram AI Bot'u aç"
      >
        <Send size={18} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs sm:text-sm">@TravelShieldBot</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Telegram Bot Simülatörü"
        >
          <div className="w-full sm:max-w-md h-[560px] bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">

            {/* Header — Telegram teması */}
            <div className="p-3.5 flex items-center justify-between bg-sky-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Send size={16} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">@TravelShieldBot</span>
                    <Sparkles size={13} className="text-yellow-300" />
                  </div>
                  <p className="text-[11px] text-white/80">
                    Telegram İle Bilet veya Fotoğraf Gönder, Anında Tara
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/80"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info banner */}
            <div className="px-3.5 py-2 bg-slate-800/90 border-b border-slate-700 text-[11px] text-slate-300 leading-tight">
              📱 <strong>Telegram Bot:</strong> Biletinizi veya bagaj fotoğrafınızı doğrudan
              @TravelShieldBot'a gönderin — anında ceza analizi alın.
            </div>

            {/* Mesajlar */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-sm whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-sky-600 text-white rounded-br-none"
                        : msg.highlightCard
                        ? "bg-slate-800 border-2 border-sky-500/40 text-slate-100 rounded-bl-none"
                        : "bg-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {msg.highlightCard && (
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1 border-b border-slate-700 pb-1 text-xs">
                        <ShieldAlert size={14} />
                        <span>TRAVEL SHIELD ANALİZİ</span>
                      </div>
                    )}
                    {msg.text}
                    {msg.actionUrl && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700">
                        <Link
                          href={msg.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
                        >
                          <span>Bavul Analizine Git</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                    {msg.time}
                    {msg.sender === "user" && <CheckCheck size={12} className="text-sky-400" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Hızlı aksiyonlar */}
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 flex gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => handleSend("Ryanair · Roma · 42x22x25 cm çanta")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap text-[11px]"
              >
                🎒 Ryanair 42×22×25 cm
              </button>
              <button
                onClick={() => handleSend("THY İstanbul → Londra Economy Lite")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap text-[11px]"
              >
                ✈️ THY Economy Lite
              </button>
              <button
                onClick={() => handleSend("Pegasus · İzmir → Berlin")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap text-[11px]"
              >
                🟡 Pegasus
              </button>
            </div>

            {/* Input */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Telegram'da mesaj yaz..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all"
                aria-label="Gönder"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
