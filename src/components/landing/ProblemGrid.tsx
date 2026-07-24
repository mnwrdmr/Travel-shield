import { AlertTriangle, Luggage, Ticket, Clock, CreditCard, Ban } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Trap {
  icon: React.ElementType;
  airline: string;
  title: string;
  description: string;
  penalty: string;
  severity: "destructive" | "default" | "secondary";
  severityLabel: string;
}

const traps: Trap[] = [
  {
    icon: AlertTriangle,
    airline: "Ryanair",
    title: "Havalimanı Check-in Cezası",
    description:
      "Online check-in yapmayı unutanlar Ryanair kontuarında bilete yazılı ücretin 3 katına varan ceza ödemek zorunda kalıyor. Birçok yolcu bu gizli ücrete havalimanında, uçağa binmeden dakikalar önce maruz kalıyor.",
    penalty: "€55 / kişi",
    severity: "destructive",
    severityLabel: "Kritik Risk",
  },
  {
    icon: Luggage,
    airline: "Wizz Air",
    title: "Kabinde 1 cm Bagaj Cezası",
    description:
      "Wizz Air'in kabin bagajı boyut kontrolü çok katıdır. Çantanız maske kapıya 1 cm sığmasa bile kapıda ücretli valiz kesmek zorunda bırakılabilirsiniz. Bu durum özellikle yüksek sezonda agresif biçimde uygulanır.",
    penalty: "€45–€80 / çanta",
    severity: "destructive",
    severityLabel: "Kritik Risk",
  },
  {
    icon: Ticket,
    airline: "Trenitalia",
    title: "Esnetilemez Bilet Değişiklik Kuralları",
    description:
      "Trenitalia'nın 'Base' tarifeli biletleri hiçbir koşulda değiştirilemez ya da iade edilemez. Yolcular bu kısıtlamayı çoğunlukla trende veya sonrasında öğreniyor; sefer iptali bile tam iade garantisi vermiyor.",
    penalty: "Tam bilet bedeli",
    severity: "destructive",
    severityLabel: "Yüksek Risk",
  },
  {
    icon: Clock,
    airline: "EasyJet",
    title: "Gece Yarısı Fare Kuralı",
    description:
      "EasyJet'te aynı gün yapılan koltuk değişikliklerinde yeni sefer daha uygun olsa bile fark iadesi yapılmıyor. 24 saatlik pencere içinde yapılan değişikliklerde tek yönlü ücret tüm bilet bedeliyle yer değiştirebiliyor.",
    penalty: "Bilet farkı iadesi yok",
    severity: "default",
    severityLabel: "Orta Risk",
  },
  {
    icon: CreditCard,
    airline: "Ryanair",
    title: "Gizli Koltuk Seçim Ücretleri",
    description:
      "Bilet satın alırken eklenmeyen koltuk seçimi ücreti, check-in sürecinde zorunlu gibi gösterilen adımlar üzerinden sürpriz şekilde faturaya yansıtılıyor. Ek ücretsiz koltuk hakkı küçük puntolarla gizleniyor.",
    penalty: "€4–€20 / koltuk",
    severity: "default",
    severityLabel: "Orta Risk",
  },
  {
    icon: Ban,
    airline: "Wizz Air",
    title: "Kullanılmayan Uçuş Sonrası İptal",
    description:
      "Gidiş-dönüş alınan biletlerde gidiş uçuşunu kaçıran yolcular, Wizz Air'in dönüş biletini de otomatik iptal ettiğini öğreniyor. Bu kural bilet koşullarında küçük puntolarla açıklanmış olsa da çok az kişi farkında.",
    penalty: "Dönüş bileti kaybı",
    severity: "destructive",
    severityLabel: "Kritik Risk",
  },
];

export default function ProblemGrid() {
  return (
    <section
      id="traps"
      aria-labelledby="traps-heading"
      className="py-24 relative"
    >
      {/* Subtle section glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[var(--color-destructive)]/5 blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="destructive" className="mb-4 px-4 py-1.5 rounded-full text-sm">
            <AlertTriangle size={13} className="mr-1.5" aria-hidden="true" />
            Belgelenmiş Havayolu Tuzakları
          </Badge>
          <h2
            id="traps-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4"
          >
            Bilinçsiz Yolcuların
            <br />
            <span className="text-[var(--color-destructive)]">Düştüğü Tuzaklar</span>
          </h2>
          <p className="text-[var(--color-foreground)]/55 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Avrupa'nın önde gelen havayolları ve demiryolu şirketleri, gizli kural
            labirentleriyle milyarlarca Euro ekstra gelir elde ediyor. İşte en sık
            rastlanan tuzaklar:
          </p>
        </div>

        {/* Grid of trap cards */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="list"
          aria-label="Yaygın seyahat tuzakları"
        >
          {traps.map((trap) => {
            const Icon = trap.icon;
            return (
              <li key={`${trap.airline}-${trap.title}`}>
                <Card className="h-full hover:border-[var(--color-destructive)]/30 transition-colors duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-destructive)]/10 border border-[var(--color-destructive)]/20 group-hover:bg-[var(--color-destructive)]/15 transition-colors duration-200">
                        <Icon
                          size={18}
                          className="text-[var(--color-destructive)]"
                          aria-hidden="true"
                        />
                      </div>
                      <Badge variant={trap.severity} className="text-xs">
                        {trap.severityLabel}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-[var(--color-foreground)]/40 uppercase tracking-widest mb-1">
                      {trap.airline}
                    </p>
                    <CardTitle as="h3" className="text-base leading-snug">
                      {trap.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-4">
                      {trap.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                      <span className="text-xs text-[var(--color-foreground)]/40 font-medium">
                        Olası ceza:
                      </span>
                      <span className="text-sm font-bold text-[var(--color-destructive)]">
                        {trap.penalty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
