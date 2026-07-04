# Takım 127 — Travel Shield Projesi

> **Havayollarının Gizli Cezalarına ve Tuzak Bilet Kurallarına Karşı Yapay Zeka Kalkanı**

Ryanair, Wizz Air ve Trenitalia gibi operatörlerin gizli kural labirentlerini yapay zeka ile analiz eden bilet koruma sistemi.

---

## 🗂 Proje Yapısı

```
src/
├── app/
│   ├── layout.tsx          # Küresel Navbar + Footer (Person A)
│   ├── globals.css         # Tasarım sistemi değişkenleri (Person A)
│   ├── page.tsx            # Ana Sayfa / Landing Page (Person A)
│   ├── analyze/
│   │   └── page.tsx        # ← Person Y çalışma alanı
│   └── dashboard/
│       └── page.tsx        # ← Person M çalışma alanı
├── components/
│   ├── ui/                 # Atomik bileşenler (Person A)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   └── landing/            # Landing page bölümleri (Person A)
│       ├── Navbar.tsx
│       ├── HeroSection.tsx
│       ├── ProblemGrid.tsx
│       ├── HowItWorks.tsx
│       ├── FeaturesSection.tsx
│       └── Footer.tsx
└── lib/
    └── utils.ts            # cn() yardımcı fonksiyonu (Person A)
```

---

## 🚀 Kurulum ve Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat (http://localhost:3000)
npm run dev

# Production build al
npm run build
```

### Teknoloji Yığını

| Araç | Sürüm | Açıklama |
|---|---|---|
| Next.js | 16.x | App Router, Turbopack |
| React | 19.x | Server & Client Components |
| TypeScript | 5.x | Tam tip güvenliği |
| Tailwind CSS | 4.x | `@theme` direktifi ile CSS değişkenleri |
| lucide-react | latest | İkon kütüphanesi |
| clsx + tailwind-merge | latest | Güvenli sınıf birleştirme |

---

## 🎨 Tasarım Sistemi

Tüm renk ve font değişkenleri `src/app/globals.css` içindeki `@theme` bloğunda tanımlanmıştır. Tailwind sınıflarında **`bg-*`, `text-*`, `border-*`** önekleriyle doğrudan kullanılırlar.

| CSS Değişkeni | Tailwind Sınıfı | Renk | Kullanım Amacı |
|---|---|---|---|
| `--color-background` | `bg-background` | Derin zinc-950 | Sayfa arkaplanı |
| `--color-foreground` | `text-foreground` | Zinc-100 | Ana metin |
| `--color-primary` | `bg-primary`, `text-primary` | Elektrik violet | CTA butonlar, vurgular |
| `--color-success` | `bg-success`, `text-success` | Emerald-500 | Başarı, güvenli durum |
| `--color-destructive` | `bg-destructive`, `text-destructive` | Red-500 | Hata, yüksek risk |
| `--color-border` | `border-border` | %8 beyaz / şeffaf | Kart kenarları, ayraçlar |

---

## 📦 Bileşen Kullanım Kılavuzu

> Aşağıdaki tüm bileşenler `src/components/ui/` klasöründe bulunur. Her bileşen `cn()` fonksiyonunu destekler; yani dışarıdan `className` prop'u ile ek stil ekleyebilirsiniz.

---

### `Button` — Aksiyon Butonu

```tsx
import { Button } from "@/components/ui/button";
```

#### Varyantlar

| Variant | Görünüm | Ne Zaman Kullanılır? |
|---|---|---|
| `default` | Dolu violet arka plan | Ana CTA, form gönderme |
| `outline` | Şeffaf, kenarlıklı | İkincil aksiyonlar |
| `secondary` | Yarı saydam beyaz | Nötr aksiyonlar |
| `ghost` | Tamamen şeffaf | Toolbar, menü öğeleri |
| `link` | Alt çizgili metin | Sayfa içi yönlendirmeler |
| `destructive` | Kırmızı dolu | Silme, iptal işlemleri |
| `success` | Yeşil dolu | Onay, kaydetme işlemleri |

#### Boyutlar

| Size | Yükseklik | Ne Zaman Kullanılır? |
|---|---|---|
| `sm` | 32px | Tablo satırı aksiyonları |
| `md` *(varsayılan)* | 40px | Genel form elemanları |
| `lg` | 48px | Hero CTA, dikkat çekici aksiyonlar |

#### Örnek Kullanımlar

```tsx
// Temel kullanım
<Button>Analizi Başlat</Button>

// Varyant ve boyut seçimi
<Button variant="destructive" size="sm">
  Bileti İptal Et
</Button>

// Next.js Link ile birlikte (asChild benzeri)
import Link from "next/link";
<Button asChild variant="default" size="lg">
  <Link href="/analyze">Ücretsiz Analiz Yap</Link>
</Button>

// Ek sınıf ekleme
<Button variant="success" className="w-full mt-4">
  Raporu Kaydet
</Button>

// Devre dışı durum
<Button disabled>İşleniyor...</Button>
```

---

### `Badge` — Risk ve Durum Etiketi

```tsx
import { Badge } from "@/components/ui/badge";
```

#### Varyantlar

| Variant | Renk | Önerilen Kullanım |
|---|---|---|
| `default` | Violet tonu | Genel etiketler, AI kategorileri |
| `secondary` | Nötr gri | Pasif durumlar, taslak |
| `success` | Emerald yeşil | Düşük risk, analiz tamamlandı, onaylı |
| `destructive` | Canlı kırmızı | Yüksek risk, ceza tetikleyicisi, hata |
| `outline` | Kenarlıklı şeffaf | Filtre etiketi, tag |

#### Örnek Kullanımlar

```tsx
// Risk seviyesi gösterimi (Person M — Dashboard'da)
<Badge variant="destructive">Yüksek Risk</Badge>
<Badge variant="success">Düşük Risk</Badge>
<Badge variant="secondary">Analiz Bekleniyor</Badge>

// Havayolu kategori etiketi (Person Y — Analiz sonuçlarında)
<Badge variant="default">Ryanair Kuralı</Badge>
<Badge variant="outline">EC 261/2004</Badge>

// İkon ile birlikte kullanım
import { AlertTriangle } from "lucide-react";
<Badge variant="destructive">
  <AlertTriangle size={12} />
  Ceza Riski
</Badge>
```

---

### `Card` — İçerik Kartı

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
```

#### Alt Parçalar

| Bileşen | Açıklama |
|---|---|
| `Card` | Kök kapsayıcı. Glassmorphism kenarlığı ve arka planı taşır. |
| `CardHeader` | Başlık bölgesi (dikey flex, `p-6`). |
| `CardTitle` | `<h3>` varsayımlı başlık. `as` prop'u ile `h2`…`h6` yapılabilir. |
| `CardDescription` | Soluk gri açıklama metni. |
| `CardContent` | Ana içerik alanı. Yatay dolgu korunur, üst dolgu sıfırdır. |
| `CardFooter` | Alt aksiyon alanı. Yatay `flex` düzeni. |

#### Örnek Kullanımlar

```tsx
// Temel kart (Person M — dashboard risk kartı)
<Card>
  <CardHeader>
    <CardTitle>Ryanair — PNR: ABC123</CardTitle>
    <CardDescription>26 Temmuz 2025, BCN → SAW</CardDescription>
  </CardHeader>
  <CardContent>
    <Badge variant="destructive">Yüksek Risk</Badge>
    <p className="mt-3 text-sm text-foreground/60">
      Online check-in penceresi 48 saat sonra kapanıyor.
    </p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="default" size="sm">Detaylar</Button>
    <Button variant="ghost" size="sm">Yoksay</Button>
  </CardFooter>
</Card>

// Başlık hiyerarşisini değiştirme
<CardTitle as="h2">Analiz Özeti</CardTitle>

// Ek sınıf ile tam genişlik
<Card className="w-full hover:border-primary/40 transition-colors">
  ...
</Card>
```

---

### `Dialog` — Modal / İletişim Kutusu

```tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
```

> **Not:** Dialog bir `"use client"` bileşenidir. Kullanan sayfa veya bileşen de client-side olmalıdır.

#### Özellikler

- **Focus trap**: Dialog açıkken klavye navigasyonu yalnızca dialog içinde kalır.
- **Esc tuşu**: Dialog'u otomatik kapatır.
- **Backdrop tıklama**: Dialog dışına tıklamak kapatır (light-dismiss).
- **Animasyon**: `globals.css`'deki `dialogIn` keyframe'i ile açılış animasyonu.

#### Örnek Kullanım

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RiskModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Risk Detayını Gör</Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <DialogTitle>Ryanair Check-in Cezası Tespit Edildi</DialogTitle>
          <DialogDescription>
            Biletinizde havalimanı check-in ücreti tetikleyicisi bulundu.
            Online check-in için son 2 saatiniz kaldı.
          </DialogDescription>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Kapat
          </Button>
          <Button variant="destructive">Acil Önlem Al</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
```

---

## 🛣 Rota Haritası

| Rota | Sayfa | Sorumlu |
|---|---|---|
| `/` | Landing Page — Ana Sayfa | **Person A** ✅ |
| `/analyze` | Bilet Analiz Sayfası | **Person Y** 🚧 |
| `/dashboard` | Kullanıcı Paneli | **Person M** 🚧 |

> **Önemli:** `/analyze` ve `/dashboard` rotaları şu an geçici birer iskelet sayfadır. `layout.tsx`'deki Navbar ve Footer her iki sayfada da otomatik olarak görünecektir — ek bir işlem gerekmez.

---

## ⚠️ Dikkat Edilmesi Gerekenler

- **`"use client"` direktifi**: `Dialog` ve `Navbar` gibi `useState`/`useEffect` kullanan bileşenler dosyanın en üstünde `"use client";` direktifine sahiptir. Bunları Server Component olan bir sayfada doğrudan kullanabilirsiniz; Next.js sınırı otomatik yönetir.
- **`cn()` fonksiyonu**: Tailwind sınıflarını dinamik ve çakışmasız birleştirmek için her zaman `cn()` kullanın. Örn: `cn("text-sm", isActive && "text-primary", className)`.
- **Renk değişkenleri**: Sabit renk kodları (`#7c3aed` gibi) yerine her zaman CSS değişkenlerini (`var(--color-primary)`) veya Tailwind karşılıklarını (`text-primary`) kullanın.
- **Bileşen değiştirme**: `src/components/ui/` altındaki dosyalarda yapılacak değişiklikler tüm sayfaları etkiler. Değişiklik yapmadan önce takımla koordineli olun.

---

## 👥 Takım

| Kişi | Rol | Sorumluluk |
|---|---|---|
| **Person A** | Senior Frontend & Product Designer | Tasarım sistemi, Landing Page |
| **Person Y** | Backend & AI Integration | `/analyze` — Bilet analiz arayüzü |
| **Person M** | Data & Dashboard | `/dashboard` — Kullanıcı paneli |

---

*© 2025 Takım 127 — Travel Shield Bootcamp Projesi*
