import { Upload, ScanSearch, BadgeCheck } from "lucide-react";

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Biletini veya Rezervasyon Kodunu Yükle",
    description:
      "PDF biletini, rezervasyon onay e-postanı veya PNR kodunu sisteme yükle. Ryanair, Wizz Air, EasyJet, Trenitalia ve onlarca operatörü destekliyoruz.",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Travel Shield AI Tarasın",
    description:
      "Yapay zeka motorumuz 200.000'den fazla havayolu kuralı ve AB mevzuatı veritabanımızda biletini saniyeler içinde çapraz-referanslar; gizli kısıtlamaları ve ceza tetikleyicilerini tespit eder.",
  },
  {
    number: "03",
    icon: BadgeCheck,
    title: "Cezalardan Korun, Paranı Kurtar",
    description:
      "Kişiselleştirilmiş güvenlik raporu al: hangi kurallara dikkat etmen gerektiği, hangi değişikliklerin cezasız yapılabileceği ve anlaşmazlık durumunda hangi haklarını kullanabileceğin net biçimde listelenir.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="py-24 relative"
    >
      {/* Violet section glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-primary)]/6 blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2
            id="how-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4"
          >
            3 Adımda Tam Koruma
          </h2>
          <p className="text-[var(--color-foreground)]/55 text-base sm:text-lg max-w-xl mx-auto">
            Karmaşık havayolu hukuku, artık sizi tehdit etmek zorunda değil.
          </p>
        </div>

        {/* Steps */}
        <ol className="relative flex flex-col lg:flex-row gap-8 lg:gap-6" aria-label="Nasıl çalışır adımları">
          {/* Connector line — desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-primary)]/60 to-[var(--color-primary)]/20"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="flex-1 flex flex-col items-center text-center relative group"
              >
                {/* Step number + icon bubble */}
                <div className="relative mb-6">
                  {/* Outer glow ring on hover */}
                  <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/25 group-hover:border-[var(--color-primary)]/50 transition-all duration-300">
                    <Icon
                      size={32}
                      className="text-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                    {/* Step number badge */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold shadow-lg"
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-3 leading-snug max-w-xs">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-foreground)]/55 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
