import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background: radial gradient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      >
        {/* Top-left violet glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[var(--color-primary)]/10 blur-[120px]" />
        {/* Bottom-right emerald glow */}
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-[var(--color-success)]/8 blur-[100px]" />
        {/* Center subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="flex justify-center mb-6">
          <Badge
            variant="default"
            className="gap-2 px-4 py-1.5 text-sm font-medium rounded-full"
          >
            <Sparkles size={14} aria-hidden="true" />
            Yapay Zeka Destekli Bilet Koruma Sistemi
          </Badge>
        </div>

        {/* Main heading */}
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6"
        >
          <span className="text-[var(--color-foreground)]">Havayollarının</span>
          <br />
          <span
            className="bg-gradient-to-r from-violet-400 via-[var(--color-primary)] to-indigo-400 bg-clip-text text-transparent"
          >
            Gizli Cezalarına
          </span>
          <br />
          <span className="text-[var(--color-foreground)]">ve Tuzak Bilet</span>
          <br />
          <span className="text-[var(--color-foreground)]">Kurallarına Son!</span>
        </h1>

        {/* Sub-text */}
        <p className="text-base sm:text-lg lg:text-xl text-[var(--color-foreground)]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Travel Shield, biletinizi saniyeler içinde tarayarak Ryanair, Wizz Air ve
          Trenitalia'nın gizli kural labirentlerini kırıyor. Check-in cezaları,
          bagaj tuzakları ve esnetilemez iade kurallarına karşı yapay zeka kalkanı.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto text-base px-8 shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transition-shadow duration-300">
            <Link href="/analyze" className="flex items-center gap-2">
              Ücretsiz Analiz Başlat
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Button>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg px-2 py-1"
          >
            Nasıl çalışır?
          </a>
        </div>

        {/* Trust signals */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[var(--color-foreground)]/40">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--color-success)]" aria-hidden="true" />
            <span>Kredi kartı gerektirmez</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[var(--color-border)]" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--color-success)]" aria-hidden="true" />
            <span>30 saniyede analiz tamamlanır</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[var(--color-border)]" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--color-success)]" aria-hidden="true" />
            <span>AB Havacılık Mevzuatı uyumlu</span>
          </div>
        </div>
      </div>
    </section>
  );
}
