"use client";

// ─────────────────────────────────────────────
// components/landing/OmnichannelSection.tsx
// Sprint 2 — Person A: Chatbot Teaser UI
//
// Strategic "Coming Soon" section promoting
// WhatsApp & Telegram bot integration.
// ─────────────────────────────────────────────

import {
  MessageCircle,
  Send,
  QrCode,
  Smartphone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChannelCard {
  platform: string;
  icon: React.ElementType;
  accentFrom: string;
  accentTo: string;
  description: string;
  features: string[];
  comingSoon: boolean;
}

const channels: ChannelCard[] = [
  {
    platform: "WhatsApp Bot",
    icon: MessageCircle,
    accentFrom: "from-emerald-500/20",
    accentTo: "to-green-600/20",
    description:
      "Biletinizin PDF'ini veya rezervasyon onayını doğrudan WhatsApp'tan gönderin. Travel Shield AI saniyeler içinde tarayıp risk raporunu dönsün.",
    features: [
      "PDF bilet tarama",
      "Anlık risk raporu",
      "Sesli uyarı bildirimleri",
      "Çoklu dil desteği",
    ],
    comingSoon: true,
  },
  {
    platform: "Telegram Bot",
    icon: Send,
    accentFrom: "from-sky-500/20",
    accentTo: "to-blue-600/20",
    description:
      "Telegram'dan biletinizi iletin veya PNR kodunuzu yazın. Yapay zeka motorumuz kuralları analiz edip size detaylı koruma raporu göndersin.",
    features: [
      "Inline bilet iletme",
      "PNR kodu ile hızlı tarama",
      "Kanal & grup desteği",
      "Otomatik check-in hatırlatma",
    ],
    comingSoon: true,
  },
];

export default function OmnichannelSection() {
  return (
    <section
      id="omnichannel"
      aria-labelledby="omnichannel-heading"
      className="py-24 relative"
    >
      {/* Background glows */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-success)]/5 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge
            variant="default"
            className="mb-4 gap-2 px-4 py-1.5 rounded-full text-sm"
          >
            <Smartphone size={14} aria-hidden="true" />
            Çok Kanallı Erişim
          </Badge>
          <h2
            id="omnichannel-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4"
          >
            Her Yerden
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-[var(--color-primary)] bg-clip-text text-transparent">
              Bilet Tarama
            </span>
          </h2>
          <p className="text-[var(--color-foreground)]/55 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Web arayüzünün yanı sıra, WhatsApp ve Telegram botlarımız aracılığıyla
            biletlerinizi doğrudan mesajlaşma uygulamalarından taratabilirsiniz.
          </p>
        </div>

        {/* Channel cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div
                key={channel.platform}
                className="group relative rounded-2xl border border-[var(--color-border)] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8 transition-all duration-300 hover:border-[var(--color-foreground)]/15 hover:bg-white/[0.05]"
              >
                {/* Gradient top border */}
                <div
                  aria-hidden="true"
                  className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${channel.accentFrom} via-transparent ${channel.accentTo}`}
                />

                {/* Header row */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${channel.accentFrom} ${channel.accentTo} border border-[var(--color-border)] group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon
                      size={22}
                      className="text-[var(--color-foreground)]"
                      aria-hidden="true"
                    />
                  </div>
                  {channel.comingSoon && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-3 py-1 rounded-full"
                    >
                      <Sparkles size={11} className="mr-1" aria-hidden="true" />
                      Yakında
                    </Badge>
                  )}
                </div>

                {/* Platform title */}
                <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
                  {channel.platform}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-foreground)]/55 leading-relaxed mb-5">
                  {channel.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-2 mb-6" role="list">
                  {channel.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm text-[var(--color-foreground)]/70"
                    >
                      <ArrowRight
                        size={12}
                        className="text-[var(--color-primary)] shrink-0"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* QR Code placeholder */}
                <div className="flex items-center gap-4 pt-5 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/[0.06] border border-[var(--color-border)]">
                    <QrCode
                      size={28}
                      className="text-[var(--color-foreground)]/30"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-foreground)]/60">
                      QR ile bağlan
                    </p>
                    <p className="text-[10px] text-[var(--color-foreground)]/35 mt-0.5">
                      Bot aktif olduğunda QR kodu burada görünecek
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-[var(--color-foreground)]/35 mt-10 max-w-lg mx-auto leading-relaxed">
          WhatsApp ve Telegram botlarımız şu anda geliştirme aşamasındadır.
          Lansman bildirimi almak için web arayüzümüzü kullanarak biletinizi hemen
          analiz edebilirsiniz.
        </p>
      </div>
    </section>
  );
}
