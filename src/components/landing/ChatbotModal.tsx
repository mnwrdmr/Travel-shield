"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, X, Send, CheckCheck, Sparkles, ShieldAlert, ArrowRight } from "lucide-react";

type Channel = "WHATSAPP" | "TELEGRAM";

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
  const [channel, setChannel] = useState<Channel>("WHATSAPP");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Merhaba! Travel Shield AI Bot'una hoş geldiniz 🛡️. Uçuşunuzu veya bagaj boyutlarınızı yazın, kapı cezanızı anında hesaplayalım.",
      time: "21:42",
    },
  ]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    const lowerText = text.toLowerCase();
    const isWizz = lowerText.includes("wizz");

    // Simulate Dynamic Bot Analysis Response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: isWizz
          ? "⚠️ WIZZ AIR KAPIDA CEZA RİSKİ TESPİT EDİLDİ!\n\n• Resmi Limit: 40 × 30 × 20 cm\n• Katı Boyut Kontrolü: 1 cm aşımda bile €45-80 ceza\n• Öneri: Online kabin bagajı ekleyin."
          : "⚠️ RYANAIR KAPIDA CEZA RİSKİ TESPİT EDİLDİ!\n\n• Resmi Limit: 40 × 20 × 25 cm\n• Taranan Çanta: 42 × 22 × 25 cm (+2 cm aşım)\n• Olası Kapı Cezası: €70\n\n💡 Çözüm: Şimdi €18'e online kabin hakkı ekleyin (€52 Net Tasarruf)!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        highlightCard: true,
        actionUrl: "/analyze?tab=baggage",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 900);
  };

  const isWa = channel === "WHATSAPP";

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-3 font-bold shadow-2xl transition-all hover:scale-105 group"
      >
        <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs sm:text-sm">Omnichannel AI Bot</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-md h-[550px] bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-3.5 flex items-center justify-between transition-colors ${isWa ? "bg-emerald-700 text-white" : "bg-sky-600 text-white"}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  TS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">Travel Shield AI Bot</span>
                    <Sparkles size={13} className="text-yellow-300" />
                  </div>
                  <p className="text-[11px] text-white/80">Çevrimiçi · Anında Bilet & Bagaj Taraması</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Channel Switcher */}
                <div className="flex bg-black/20 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setChannel("WHATSAPP")}
                    className={`px-2 py-1 rounded-md transition-all ${isWa ? "bg-white text-emerald-800 shadow" : "text-white/70"}`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setChannel("TELEGRAM")}
                    className={`px-2 py-1 rounded-md transition-all ${!isWa ? "bg-white text-sky-800 shadow" : "text-white/70"}`}
                  >
                    Telegram
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/80"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-sm whitespace-pre-line ${
                      msg.sender === "user"
                        ? isWa
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-sky-600 text-white rounded-br-none"
                        : msg.highlightCard
                        ? "bg-slate-800 border-2 border-red-500/50 text-slate-100 rounded-bl-none"
                        : "bg-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {msg.highlightCard && (
                      <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1 border-b border-slate-700 pb-1 text-xs">
                        <ShieldAlert size={14} />
                        <span>KAPIDA CEZA UYARISI</span>
                      </div>
                    )}
                    {msg.text}
                    {msg.actionUrl && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700">
                        <Link
                          href={msg.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          <span>Bavul Analizine Git</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                    {msg.time}
                    {msg.sender === "user" && <CheckCheck size={12} className="text-emerald-400" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 flex gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => handleSend("Ryanair · Roma (42x22x25 cm çanta)")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap text-[11px]"
              >
                🎒 Test Et: Ryanair 42x22x25 cm
              </button>
              <button
                onClick={() => handleSend("Wizz Air · Budapeşte (40x30x20 cm çanta)")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap text-[11px]"
              >
                ✈️ Test Et: Wizz Air
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`${isWa ? "WhatsApp" : "Telegram"} üzerinden mesaj yaz...`}
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                className={`p-2 rounded-xl text-slate-950 font-bold transition-all ${isWa ? "bg-emerald-400 hover:bg-emerald-300" : "bg-sky-400 hover:bg-sky-300"}`}
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
