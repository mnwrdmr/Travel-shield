"use client";
// ─────────────────────────────────────────────────────────────
// src/components/landing/OmnichannelSection.tsx
// SPRINT FINAL: WhatsApp TAMAMEN KALDIRILDI
//   ✅ Tek kanal: Telegram Bot (@TravelShieldBot)
//   ✅ Sky-blue Telegram teması
//   ✅ QR kodu alanı korundu (bot aktif olunca gerçek QR eklenecek)
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────
// components/landing/OmnichannelSection.tsx
// Sprint 2 — Person A: Chatbot Teaser UI
//
// Strategic "Coming Soon" section promoting
// WhatsApp & Telegram bot integration.
// ─────────────────────────────────────────────

import { Send, QrCode, ArrowRight, Sparkles, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TELEGRAM_FEATURES = [
  "Bilet PDF'ini direkt ilet",
  "Bagaj fotoğrafı → anında boyut analizi",
  "PNR kodu ile hızlı tarama",
  "Kanal & grup desteği",
  "Otomatik check-in hatırlatıcısı",
  "Türkçe & İngilizce destek",
];

export default function OmnichannelSection() {
  return (
    <section
      id="omnichannel"
      aria-labelledby="omnichannel-heading"
      className="py-24 relative"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)]/5 blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bölüm başlığı */}
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 gap-2 px-4 py-1.5 rounded-full text-sm">
            <Smartphone size={14} aria-hidden />
            Telegram Bot Entegrasyonu
          </Badge>
          <h2
            id="omnichannel-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4"
          >
            Telegram İle
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-[var(--color-primary)] bg-clip-text text-transparent">
              Anında Bilet Tara
            </span>
          </h2>
          <p className="text-[var(--color-foreground)]/55 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Web arayüzünün yanı sıra{" "}
            <strong className="text-[var(--color-foreground)]/80">@TravelShieldBot</strong>'a
            biletinizi veya bagaj fotoğrafınızı göndererek anında ceza analizi alın.
          </p>
        </div>

        {/* Tek kart — Telegram */}
        <div className="max-w-2xl mx-auto">
          <div className="group relative rounded-2xl border border-[var(--color-border)] bg-white/[0.03] backdrop-blur-sm p-8 transition-all duration-300 hover:border-sky-500/30 hover:bg-white/[0.05]">

            {/* Gradient top border */}
            <div
              aria-hidden
              className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-sky-500/20 via-sky-400/60 to-sky-500/20"
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:scale-110 transition-transform duration-200">
                <Send size={26} className="text-sky-400" aria-hidden />
              </div>
              <Badge
                variant="secondary"
                className="text-xs px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25"
              >
                <Sparkles size={11} className="mr-1 text-sky-400 animate-pulse" aria-hidden />
                Canlı Simülatör (Sağ Altta)
              </Badge>
            </div>

            {/* Başlık */}
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3">
              @TravelShieldBot — Telegram
            </h3>

            {/* Açıklama */}
            <p className="text-sm text-[var(--color-foreground)]/55 leading-relaxed mb-6">
              Telegram'dan biletinizi iletin veya PNR kodunuzu yazın. Bagaj fotoğrafını
              gönderin — Vision AI boyutları analiz edip limit aşımı varsa uyarsın.
              Yapay zeka motorumuz kuralları analiz edip size detaylı koruma raporu göndersin.
            </p>

            {/* Özellik listesi */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8" role="list">
              {TELEGRAM_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-sm text-[var(--color-foreground)]/70"
                >
                  <ArrowRight size={12} className="text-sky-400 shrink-0" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            {/* QR + Bot adı */}
            <div className="flex items-center gap-5 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-white/[0.06] border border-[var(--color-border)] shrink-0">
                <QrCode size={32} className="text-[var(--color-foreground)]/30" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-foreground)]/80">
                  @TravelShieldBot
                </p>
                <p className="text-xs text-[var(--color-foreground)]/40 mt-1 leading-relaxed">
                  Telegram&apos;da aratın veya QR&apos;ı tarayın.
                  Bot yakında aktif olacak.
                </p>
                <a
                  href="https://t.me/TravelShieldBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                >
                  <Send size={11} />
                  Telegram&apos;da Aç
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Alt not */}
        <p className="text-center text-xs text-[var(--color-foreground)]/35 mt-10 max-w-lg mx-auto leading-relaxed">
          @TravelShieldBot şu anda geliştirme aşamasındadır. Lansman bildirimi
          almak için web arayüzümüzü kullanarak biletinizi hemen analiz edebilirsiniz.
        </p>
      </div>
    </section>
  );
}
