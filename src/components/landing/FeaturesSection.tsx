import {
  Bell,
  Layers,
  ShieldCheck,
  FileSearch,
  Globe,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "primary" | "success" | "warning";
}

const colorMap = {
  primary: {
    bg: "bg-[var(--color-primary)]/10",
    border: "border-[var(--color-primary)]/20",
    icon: "text-[var(--color-primary)]",
    hoverBorder: "hover:border-[var(--color-primary)]/40",
  },
  success: {
    bg: "bg-[var(--color-success)]/10",
    border: "border-[var(--color-success)]/20",
    icon: "text-[var(--color-success)]",
    hoverBorder: "hover:border-[var(--color-success)]/40",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    hoverBorder: "hover:border-amber-500/40",
  },
};

const features: Feature[] = [
  {
    icon: Bell,
    title: "Anlık Ceza Bildirimleri",
    description:
      "Biletinizdeki kritik tarihler (check-in penceresi, bagaj ekleme son günü, değişiklik kesim saati) yaklaştığında sizi anında uyaran akıllı bildirim sistemi.",
    color: "primary",
  },
  {
    icon: Layers,
    title: "Akıllı Bagaj Optimizasyonu",
    description:
      "Hangi uçuşta kaç kg'a kadar ücretsiz hakkınız olduğunu hesaplar, farklı kabin seçeneklerini karşılaştırır ve fazla bagaj cezasından kaçınmanız için en uygun stratejiyi önerir.",
    color: "success",
  },
  {
    icon: ShieldCheck,
    title: "Mevzuat Uyumluluk Kontrolü",
    description:
      "EC 261/2004, IATA kuralları ve ulusal havacılık otoritesi direktifleri çerçevesinde biletinizin yasal uyumluluğunu denetler; hangi haklarınızı kullanabileceğinizi raporlar.",
    color: "primary",
  },
  {
    icon: FileSearch,
    title: "Gizli Kural Tespiti",
    description:
      "Operatörlerin bilet yolculuğunda küçük puntolarla sakladığı kural değişikliklerini, ek ücret tetikleyicilerini ve geçersizleştirme koşullarını makine öğrenmesiyle tespit eder.",
    color: "warning",
  },
  {
    icon: Globe,
    title: "Çok Dilli Hukuk Veritabanı",
    description:
      "İngilizce, İtalyanca, Almanca, Fransızca ve İspanyolca olarak yayımlanan havayolu taşıma koşullarını doğrudan birincil kaynaktan işleyen kapsamlı bir çok dilli mevzuat veritabanı.",
    color: "success",
  },
  {
    icon: Zap,
    title: "30 Saniyelik Analiz Hızı",
    description:
      "Turbopack altyapısıyla desteklenen AI motorumuz, karmaşık çok bacaklı güzergahları ve kombinasyon biletlerini 30 saniye içinde tamamıyla analiz eder.",
    color: "warning",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 relative"
    >
      {/* Emerald glow top-left */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-[600px] h-[500px] rounded-full bg-[var(--color-success)]/5 blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4"
          >
            Kurumsal Düzeyde
            <br />
            <span className="text-[var(--color-primary)]">Koruma Teknolojisi</span>
          </h2>
          <p className="text-[var(--color-foreground)]/55 text-base sm:text-lg max-w-2xl mx-auto">
            Büyük seyahat acenteleri yıllardır kullanan karmaşık bilet analiz
            araçlarını, bireysel yolcular için sezgisel bir arayüze taşıdık.
          </p>
        </div>

        {/* Feature cards grid */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="list"
          aria-label="Özellikler listesi"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            return (
              <li key={feature.title}>
                <Card
                  className={`h-full transition-all duration-300 group ${colors.hoverBorder}`}
                >
                  <CardHeader>
                    <div
                      className={`flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${colors.bg} border ${colors.border} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon
                        size={20}
                        className={colors.icon}
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle as="h3" className="text-base mb-1">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
