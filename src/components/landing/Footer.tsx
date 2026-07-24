import Link from "next/link";
import { Shield, Share2, ExternalLink, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Ürün: [
    { label: "Nasıl Çalışır?", href: "#how-it-works" },
    { label: "Özellikler", href: "#features" },
    { label: "Fiyatlandırma", href: "#" },
    { label: "API Erişimi", href: "#" },
  ],
  Hukuki: [
    { label: "Gizlilik Politikası", href: "#" },
    { label: "Kullanım Koşulları", href: "#" },
    { label: "KVKK Aydınlatma", href: "#" },
    { label: "Çerez Politikası", href: "#" },
  ],
  Şirket: [
    { label: "Hakkımızda", href: "#" },
    { label: "Blog", href: "#" },
    { label: "İletişim", href: "#" },
    { label: "Basın Kiti", href: "#" },
  ],
};

const socialLinks = [
  { label: "Twitter / X", href: "#", icon: Share2 },
  { label: "LinkedIn", href: "#", icon: ExternalLink },
  { label: "GitHub", href: "#", icon: Code2 },
];

export default function Footer() {
  return (
    <footer aria-label="Site alt bilgisi" className="relative border-t border-[var(--color-border)]">
      {/* Final CTA band */}
      <div className="relative overflow-hidden bg-[var(--color-primary)]/8 border-b border-[var(--color-border)]">
        {/* Glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-primary)]/10 to-transparent pointer-events-none"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-2">
              Yolculuğunuzu Güvence Altına Alın
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)] leading-tight">
              Bir sonraki cezayı beklemeden
              <br className="hidden sm:block" />
              biletinizi şimdi analiz edin.
            </h2>
          </div>
          <div className="shrink-0">
            <Button
              asChild
              variant="default"
              size="lg"
              className="shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transition-shadow duration-300"
            >
              <Link href="/analyze" className="flex items-center gap-2">
                Ücretsiz Analiz Başlat
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg"
              aria-label="Travel Shield Ana Sayfa"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30">
                <Shield size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
              </div>
              <span className="text-[var(--color-foreground)] font-bold text-lg tracking-tight">
                Travel<span className="text-[var(--color-primary)]">Shield</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-foreground)]/50 leading-relaxed max-w-[220px]">
              Yapay zeka destekli bilet analiz sistemi. Havayolu tuzaklarını fark
              etmeden önce sizin için tespit ederiz.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)]/40 hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/20 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    <SocialIcon size={16} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]/40 mb-4">
                {category}
              </h3>
              <ul className="flex flex-col gap-2.5" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-foreground)]/55 hover:text-[var(--color-foreground)] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-foreground)]/35">
          <p>
            © {new Date().getFullYear()} TravelShield Teknoloji A.Ş. Tüm hakları
            saklıdır.
          </p>
          <p>
            Bu platform yatırım danışmanlığı ya da hukuki tavsiye vermez.
            Yalnızca bilgilendirme amaçlıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
