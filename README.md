
# **Takım İsmi**

Takım Travel-shield

# Ürün İle İlgili Bilgiler
Travel-shield

## Takım Elemanları

- Münevver Demir: Scrum Master/Team Member/Developer
- Abdülaziz Kıran: - Product Owner/Team Member/Developer
- Yasin Ünsal: - Team Member/Developer
- Umut Can Karaman: Team Member/Developer

## Ürün İsmi

--Travel-Shield--

## Ürün Açıklaması

- Düşük maliyetli havayolları ve bölgesel tren operatörlerinin (Ryanair, Trenitalia vb.) karmaşık kurallar ve dijital tuzaklar üzerinden kestiği ağır operasyonel cezalara karşı bütçeli gezginleri koruyan yapay zeka ajanlı bir seyahat asistanı.

## Ürün Özellikleri

- Uçuş check-in'leri tamamlamanız için sizi bilgilendirir.
- PDF iptal tuzaklarını bloke eder
- Bölgesel trenleri kalkış anında otonom olarak doğrular,
- Kapıda bagaj cezasını engeller. 

## Hedef Kitle

- Gen Z ve Millennial Bütçeli Gezginler  
- Interrail Kullanıcıları
- Çoklu Modlu (Multimodal) Seyahat Edenler
- Seyahat planlamayı seven tüm kullanıcılar 

## Product Backlog URL
https://trello.com/b/WQPd2syn/takim-127

---

# Sprint 1: 📋 Scrum ve Proje Yönetimi Raporu

### A. Backlog Düzeni & Story seçimleri & Görev Dağılımı (Efor: 21 SP)

Backlog'umuz öncelikli story'lere göre düzenlenmiştir. Sprint başına tahmin edilen puan sayısını geçmeyecek şekilde sıradan seçimler yapılmaktadır. Story başına çıkan tahmin puanı, toplam puanın yarısından az tutulmuştur. Story'ler yapılacak işlere (task'lere) bölünmüştür. 
Trello Board'da gözüken turuncu item'lar öncelikli yapılacak görevleri (task) gösterirken, mor item'ler turuncu adımlar tamamlandıktan sonra ki adımları, sarı item'ler proje yönetimi için ana adımları temsil etmektedir.  

Süreç içerisinde git merge çakışmalarını (conflict) sıfıra indirmek adına görevler **sayfa rotalarına (routes) ve atomik bileşen mimarisine** göre bölünmüştür.

| İş Kimliği | Görev / Kullanıcı Hikayesi | Sorumlu | Efor (SP) | İlgili Rota / Klasör |
| --- | --- | --- | --- | --- |
| **TS-101** | Proje setup, Tailwind premium dark konfigürasyonu ve temel `shadcn/ui` atomik bileşenlerinin kurulumu. | **Abdülaziz** | 3 SP | `/components/ui` |
| **TS-102** | Ana Sayfa (Landing Page) arayüzünün, sorun (ceza tuzakları) ve değer önerisi odaklı responsive geliştirilmesi. | **Abdülaziz** | 5 SP | `/app/page.tsx` |
| **TS-103** | Kullanıcının seyahat bilgilerini gireceği `/analyze` giriş formunun ve bilet yapıştırma alanının UI tasarımı. | **Yasin** | 4 SP | `/app/analyze` |
| **TS-104** | "Analiz Et" butonuna basıldığında tetiklenecek "AI Ajanları kuralları okuyor..." loading ve yazma animasyonu. | **Yasin** | 2 SP | `/app/analyze` |
| **TS-105** | Seyahate özgü üst düzey akıllı bileşenlerin (`RiskCard`, `SavingsCard`, `AlternativeTransportCard`) geliştirilmesi. | **Münevver** | 4 SP | `/components/dashboard` |
| **TS-106** | Tüm dashboard bileşenlerinin `/dashboard` rotasında mockup JSON verisiyle beslenerek son kullanıcı ekranı olarak birleştirilmesi. | **Münevver** | 3 SP | `/app/dashboard` |
| **TS-107** | Sınav haftasında olması nedeniyle önümüzdeki hafta görev dağılımı dengelenecektir . | **Umut Can** | - | 

### B. Daily Scrum Notları:

Daily Scrum toplantılarında daha hızlı aksiyon alınması için WhatApp üzerinden ilerlenmiş, ekip üyelerinin müsait olduğu günlerde Slack üzerinden toplantı yapılmasına karar verilmiştir. Daily Scrum toplantısı örneği jpeg veya word olarak Readme'de tarafımızdan paylaşılmaktadır: 
[DailyScrumMeetingNotesSprint1.docx](https://github.com/user-attachments/files/29614065/DailyScrumMeetingNotesSprint1.docx)

### C. Sprint Board Updates: Ekran görüntüleri
<img width="1512" height="982" alt="backlog_1" src="https://github.com/user-attachments/assets/c95f6ce7-eb2f-496e-8e2e-5be5a7454797" />
<img width="1512" height="982" alt="backlog_2" src="https://github.com/user-attachments/assets/695fe317-db02-46f3-b537-6947eaa0e221" />
<img width="1512" height="982" alt="backlog_3" src="https://github.com/user-attachments/assets/08778001-12a4-439e-912e-957835fca28e" />
<img width="1512" height="982" alt="backlog_4" src="https://github.com/user-attachments/assets/e136fb20-f00f-4511-bcca-c7ea1e540815" />

### D. Ürün Durumu: Ekran görüntüleri

<img width="1280" height="831" alt="product_ss_1" src="https://github.com/user-attachments/assets/5a3630c8-3c87-4914-a467-1f6de9d41ade" />
<img width="1280" height="831" alt="product_ss_2" src="https://github.com/user-attachments/assets/8fccbe83-af64-41dc-88f2-6abc6134ae4e" />
<img width="373" height="749" alt="product_ss_3" src="https://github.com/user-attachments/assets/7ea1e396-0580-4a47-a258-4154e9a116ba" />
<img width="375" height="474" alt="product_ss_4" src="https://github.com/user-attachments/assets/909d81fb-bf8e-4a43-af45-a9dffde134cb" />

Sprint 1 ekran görüntüleri çıktısı, uçtan uca çalışan fütüristik bir **Frontend Prototipidir**. Kullanıcı ana sayfadan giriş yapar, `/analyze` rotasında biletini simüle eder, AI analiz animasyonunu deneyimler ve ardından seyahat risklerini gösteren `/dashboard` paneline sorunsuz yönlendirilir.

### E. Sprint Review:

Neler Tamamlandı ?: Next.js projesinin çalışma hızı, landing page tasarımlarının mobil uyumluluğu, form sayfasındaki AI loading animasyonunun gerçekçiliği ve dashboard üzerindeki risk kartlarının görsel netliği canlı olarak tarayıcıda gösterildi.

Alınan Geri Bildirimler: Tasarım sisteminin renk paletinin (LCC/karanlık örüntü vurgusu için premium koyu tema) çok başarılı olduğu; ancak sonraki sprintte eklenecek olan gerçek LLM API entegrasyonu için mock verilerin biraz daha detaylandırılması gerektiği gözlemlendi.

Onay Durumu: Ürün, ilk sprint için belirlenen "Görsel ve Tıklanabilir Protokol" hedefini %100 karşıladığı için ekip üyeleri tarafından kabul edildi. Bir sonraki sprintte devreye girecek gerçek AI Agent orkestrasyonu (CrewAI/FastAPI) öncesinde arayüz akışının kusursuz çalıştığı doğrulandı.

### F. Sprint Retrospective:

* **🟢 Ne İyi Gitti?:** Sorumluluklar sayfa bazlı ayrıldığı için sıfır git çakışması (merge conflict) ile çalışıldı. Tasarım dili baştan sabitlendiği için kodlama hızı arttı.
  
* **🔴 Ne Geliştirilebilir?:** Formdan gönderilen değişken isimleri ile dashboard'un beklediği veri tiplerinde (TypeScript interfaces) ilk saatlerde senkronizasyon hatası yaşandı.
  
* **🛠️ Aksiyon Planı:** Sprint 2'de ilk iş olarak ortak bir `types/index.ts` dosyası açılarak tüm veri sözleşmeleri (data contracts) tek elden yönetilecektir. Konuşulan ek özellikler geliştirilerek, eklenecektir. Takım içindeki görev dağılımı önümüzdeki haftalarda bir ekip üyesi daha katılacağından dolayı dengelenecektir.

---


# Sprint 2


---

# Sprint 3

---
