# Sprint 1
---
## Takım İsmi
Takım Travel-shield

## Takım Rolleri

Münevver Demir:  Scrum Master/Team Member/Developer    
Abdülaziz Kıran:  Product Owner/Team Member/Developer       
Yasin Ünsal:  Team Member/Developer      
Umut Can Karaman:  Team Member/Developer      

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

---
### A. Backlog Dağıtma Mantığı : Backlog Düzeni & Story seçimleri & Görev Dağılımı (Efor: 21 SP)

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

<img width="1347" height="7482" alt="Travel Nasil Gali" src="https://github.com/user-attachments/assets/6613ecb5-4dab-43f0-96c3-6ebd68965b41" />
<img width="1280" height="831" alt="product_ss_1" src="https://github.com/user-attachments/assets/5a3630c8-3c87-4914-a467-1f6de9d41ade" />
<img width="1280" height="831" alt="product_ss_2" src="https://github.com/user-attachments/assets/8fccbe83-af64-41dc-88f2-6abc6134ae4e" />
<img width="353" height="753" alt="Ekran Resmi 2026-07-04 00 56 14" src="https://github.com/user-attachments/assets/3d05a301-32cf-4429-8e7a-5c980c7e190d" />
<img width="355" height="263" alt="Ekran Resmi 2026-07-04 00 56 26" src="https://github.com/user-attachments/assets/22ff4cee-c2b6-4a04-85cc-8d54990a824b" />



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

## Takım İsmi
Takım Travel-shield

## Takım Rolleri

Münevver Demir:  Scrum Master/Team Member/Developer    
Abdülaziz Kıran:  Product Owner/Team Member/Developer       
Yasin Ünsal:  Team Member/Developer      
Umut Can Karaman:  Team Member/Developer      

## Ürün İsmi

--Travel-Shield--

## Ürün Açıklaması

- Travel Shield AI, bütçeli gezginlerin seyahat maliyetlerini öngörülemeyen cezalardan koruyan bir "Operasyonel Risk Kalkanı"dır. Havayolu firmalarının karmaşık bilet kurallarını, check-in zaman pencerelerini ve bagaj sınırlamalarını analiz ederek kullanıcılara cezaya düşmeden önce aksiyon aldıran akıllı bir asistan görevi görür. Sprint 2 itibarıyla, pazardaki onay süreçlerinin getirdiği riskleri minimize etmek adına "Omnichannel Chatbot" (Telegram/WhatsApp) vizyonunu arayüze entegre ederek büyüme stratejisini jüriye çalışır bir prototiple gösterir.

## Ürün Özellikleri

- AI Ticket & Booking Scanner: Kullanıcının ham bilet metnini veya manuel girdilerini tarayarak gizli cezaları analiz eden motor.
- Centralized State Engine (Hafıza Katmanı): Kullanıcı verilerini formdan dashboard'a kayıpsız aktaran React Context yapısı.
- Premium Dark Workspaces: Kullanıcıya lüks ve yüksek teknoloji hissi veren karanlık mod arayüz birliği.
- Resilient Empty State: Hatalı sayfa geçişlerini engelleyen ve kullanıcıyı akışa sadık tutan koruma paneli.
- Omnichannel Chatbot Teaser: WhatsApp ve Telegram bot entegrasyonlarının gelecekteki yerini gösteren QR ve bilet sürükle-bırak (drop) kartları.

## Hedef Kitle

- Gen Z & Millennial Bütçeli Gezginler  & Sırt Çantalılar: Ekstra 40€ bagaj veya check-in cezası ödemesi bütçesini tamamen sarsacak olan genç kitle.
- Sık Seyahat Eden İş İnsanları/Dijital Göçmenler: Farklı havayollarının kurallarını akılda tutmakla vakit kaybetmek istemeyen profesyoneller.
- Erasmus ve Değişim Programı Öğrencileri: Avrupa içinde bölgesel ulaşım ağlarını (Trenitalia, Ryanair) aktif kullanan öğrenciler.
- Interrail Kullanıcıları
- Çoklu Modlu (Multimodal) Seyahat Edenler
- Seyahat planlamayı seven tüm kullanıcılar

## Product Backlog URL

https://trello.com/b/WQPd2syn/takim-127

---

# Sprint 2: 📋 Scrum ve Proje Yönetimi Raporu

---
### A. Backlog Dağıtma Mantığı : Backlog Düzeni & Story seçimleri & Görev Dağılımı (Efor: 21 SP)

Backlog'umuz öncelikli story'lere göre düzenlenmiştir. Sprint başına tahmin edilen puan sayısını geçmeyecek şekilde sıradan seçimler yapılmaktadır. Story başına çıkan tahmin puanı, toplam puanın yarısından az tutulmuştur. Story'ler yapılacak işlere (task'lere) bölünmüştür. 
Trello Board'da gözüken turuncu item'lar öncelikli yapılacak görevleri (task) gösterirken, mor item'ler turuncu adımlar tamamlandıktan sonra ki adımları, sarı item'ler proje yönetimi için ana adımları temsil etmektedir.  

Süreç içerisinde git merge çakışmalarını (conflict) sıfıra indirmek adına görevler **sayfa rotalarına (routes) ve atomik bileşen mimarisine** göre bölünmüştür.

| İş Kimliği | Görev / Kullanıcı Hikayesi                                                                    | Sorumlu       | Efor (SP) | İlgili Rota / Klasör |
|------------|-----------------------------------------------------------------------------------------------|---------------|-----------| --- |
| **TS2-01** | Global State (TravelContext) Yapısının Kurulması                                              | **Abdülaziz** | 5 SP      | `src/types/travel.ts` |
| **TS2-02** | Premium Dark Tema Eşitlemesi & Global CSS                                                     | **Abdülaziz** | 3 SP      | `src/context/TravelContext.tsx` |
| **TS2-03** | Omnichannel Chatbot Landing Page Kartlarının Yazılması                                        | **Abdülaziz** | 3 SP      | `src/app/layout.tsx` |
| **TS2-04** | /analyze Sayfası Kontrollü Form Tasarımı & State Bağlantısı                                   | **Yasin**     | 5 SP      | `src/app/analyze/page.tsx` |
| **TS2-05** | Form Verilerinin runAiSimulation ile Context'e Paslanması                                     | **Yasin**     | 2 SP      | `src/app/analyze/page.tsx` |
| **TS2-06** | /dashboard Statik Dosya Bağlantısının Koparılması & useTravel() Entegrasyonu                  | **Münevver**  | 3 SP      | `src/app/dashboard/page.tsx` |
| **TS2-07** | NULL Analiz Sonucu için Resilient Empty State Ekranı Yapımı                                   | **Münevver**  | 4 SP      | `src/app/dashboard/page.tsx` |
| **TS2-08** | Bütünleme sınavı haftasında olması nedeniyle önümüzdeki hafta görev dağılımı dengelenecektir. | **Umut Can**  | -         | 

### B. Daily Scrum Notları- Sprint 2:
Daily Scrum toplantılarında daha hızlı aksiyon alınması için WhatApp üzerinden ilerlenmiş, ekip üyelerinin müsait olduğu günlerde Slack üzerinden toplantı yapılmasına karar verilmiştir. Daily Scrum toplantısı örneği jpeg veya word olarak Readme'de tarafımızdan paylaşılmaktadır:
[DailyScrumMeetingNotesSprint2.docx](https://github.com/user-attachments/files/30170621/DailyScrumMeetingNotesSprint2.docx)


### C. Sprint 2 Board Updates: Ekran görüntüleri

<img width="1512" height="982" alt="backlog_1" src="https://github.com/user-attachments/assets/537ba258-d356-4719-ab7e-59763eee9550" />
<img width="1512" height="982" alt="backlog_2" src="https://github.com/user-attachments/assets/57961078-cea4-4d51-9b18-37244c2c043a" />
<img width="1512" height="982" alt="backlog_3" src="https://github.com/user-attachments/assets/ca105656-881f-4c5c-9b51-268cc9d685ad" />
<img width="1512" height="982" alt="backlog_4" src="https://github.com/user-attachments/assets/c866b7b1-c2c5-4c8d-b118-d6c41a30496e" />
<img width="1512" height="982" alt="backlog_5" src="https://github.com/user-attachments/assets/c57d0be0-4327-4a58-babc-79312adf252d" />
<img width="1512" height="982" alt="backlog_6" src="https://github.com/user-attachments/assets/32fe7700-d129-40c7-b832-8f6a407f937f" />

### D. Ürün Durumu: Ekran görüntüleri

[product_ss_1.pdf](https://github.com/user-attachments/files/30153879/product_ss_1.pdf)
![product_ss_2.jpeg](ProjectManagment/Sprint2Documents/product_ss_2.jpeg)
![product_ss_3.png](ProjectManagment/Sprint2Documents/product_ss_3.png)
<img width="1280" height="831" alt="product_ss_4" src="https://github.com/user-attachments/assets/9f750eb8-4ec1-4414-8c50-7da0acf6354d" />
<img width="1280" height="831" alt="product_ss_5" src="https://github.com/user-attachments/assets/4ce61f2d-fb68-4392-9f1d-38422f7788cb" />
<img width="1280" height="831" alt="product_ss_6" src="https://github.com/user-attachments/assets/ad35f8e0-568c-49f6-9260-438bcbc92145" />



Sprint 2 sonunda elde edilen ürün; kullanıcı girdilerine dinamik olarak tepki veren, durum yönetimli (stateful) ve çok kanallı (omnichannel) büyüme vizyonuna sahip üst segment bir frontend prototipidir. Sunucu ihtiyacı duymadan, istemci tarafında gelişmiş yapay zeka ajan tarama simülasyonunu başarıyla oluşturur.

### E. Sprint Review:

Neler Tamamlandı?: TravelContext hafıza katmanı kurularak /analyze formundan gelen dinamik girdilerin 2.6 saniyelik AI simülasyonu eşliğinde /dashboard risk paneline hatasız akışı sağlanmış; tüm sayfalar premium koyu tema baseline mimarisine eşitlenerek "Omnichannel Chatbot" vizyon kartları landing page'e başarıyla giydirilmiştir.

Alınan Geri Bildirimler: Sunucusuz (frontend-only) mimaride kurulan küresel veri köprüsünün ve dinamik kural haritalama mantığının çalışma hızı ekip üyeleri tarafından başarılı bulunmuş; ekip üyeleri tarafından WhatsApp/Telegram "Çok Yakında" teaser kartlarının yatırımcı sunumu öncesi pazar doğrulama (lean validation) hissini jüriye çok iyi aktarılacağı belirtilmiştir.

Onay Durumu: Ürün, Sprint 2 için belirlenen "Uçtan uca durum yönetimli (stateful) MVP prototipi ve omnichannel büyüme vizyonu" hedeflerinin tamamını eksiksiz karşıladığı için Ürün Sahibi (Product Owner) ve ekip üyeleri tarafından %100 başarıyla onaylanmış ve teslim alınmıştır.

### F. Sprint Retrospective:

* **🟢 Ne İyi Gitti?:** React Context sayesinde sunucusuz bir uygulamada sanki arkada gerçek bir veritabanı varmış gibi dinamik bir akış yakalandı. Tasarım bütünlüğü sağlandı.
  
* **🔴 Ne Geliştirilebilir?:** 2.6 saniyelik animasyon senkronizasyonunu yakalamak için zaman aşımı (setTimeout) sürelerini kod içinde manuel eşitlemek zorunda kaldık. Bir sonraki geliştirme fazında merkezi bir animasyon zamanlayıcısı (event emitter) kurulabilir.
  
* **🛠️ Aksiyon Planı:** WhatsApp/Telegram chatbotunun aktifleşip, yasal izinlerinlerin alınması için hızlıca aksiyon alınması üzerine tartışıldı.Gerçek API onay süreçleri (Twilio/Telegram Bot API) için gereklilikler hazırlanacak ve backend entegrasyonuna başlanıp, ürünün son hali tamamlanacak.

---

# Sprint 3

---

## Takım İsmi
Takım Travel-shield

## Takım Rolleri

Münevver Demir:  Scrum Master/Team Member/Developer    
Abdülaziz Kıran:  Product Owner/Team Member/Developer       
Yasin Ünsal:  Team Member/Developer       

## Ürün İsmi

--Travel-Shield--

## Ürün Açıklaması

-**Travel Shield AI**, havayolu seyahatlerinde yaşanan kafa karıştırıcı bagaj kurallarını, beklenmedik kapı cezalarını (*gate fees*) ve bilet risklerini ortadan kaldıran yapay zeka destekli bir seyahat asistanı ve finansal risk analiz platformudur.

Platform; uçuş ve bilet verilerini, görsel bagaj taramasını (**Vision AI**) ve taşıyıcı kural veritabanını (**RAG Engine**) birleştirerek seyahat öncesinde kullanıcıya potansiyel cezaları bildirir, cüzdanını korur ve anlık, açıklanabilir finansal tasarruf çözümleri sunar.

## Ürün Özellikleri

- **Multi-Agent Baggage Scanner:** Kamera veya fotoğraf yüklemesi üzerinden bagaj boyutlarını tespit eden, AR 3D boyut rozetleri ile limit aşımlarını görselleştiren altyapı.
- **Dynamic RAG Engine:** Havayolu özelinde (Ryanair, EasyJet, Wizz Air vb.) bagaj boyutları ve kapı cezalarını anlık sorgulayan kural veritabanı.
- **Unified Wizard Flow:** Uçuş bilgileri ile gerçek bagaj ölçülerini tek bir sıralı formda eşleştiren analiz akışı.
- **Explainable Financial Risk Assessment:** Potansiyel kapı cezasını, kaçınılabilecek tutarı ve alternatif optimizasyon adımlarını gösteren Dashboard bileşenleri.
- **Omnichannel Chatbot Simulator:** Telegram temalı, RAG API destekli canlı müşteri asistanı.

---
## Hedef Kitle

- Gen Z & Millennial Bütçeli Gezginler  & Sırt Çantalılar: Ekstra 40€ bagaj veya check-in cezası ödemesi bütçesini tamamen sarsacak olan genç kitle.
- Sık Seyahat Eden İş İnsanları/Dijital Göçmenler: Farklı havayollarının kurallarını akılda tutmakla vakit kaybetmek istemeyen profesyoneller.
- Erasmus ve Değişim Programı Öğrencileri: Avrupa içinde bölgesel ulaşım ağlarını (Trenitalia, Ryanair) aktif kullanan öğrenciler.
- Interrail Kullanıcıları:Sadece kabin/el bagajı ile seyahat eden ve kapıda sürpriz ücret ödemek istemeyen kullanıcılar.
- Çoklu Modlu (Multimodal) Seyahat Edenler:Ryanair, EasyJet, Wizz Air gibi katı bagaj politikası uygulayan havayollarını tercih eden yolcular.
- Seyahat planlamayı seven tüm kullanıcılar :Bilet ve bagaj risklerini tek panelden yönetmek isteyen profesyoneller.

## Product Backlog URL

https://trello.com/b/WQPd2syn/takim-127

---

# Sprint 3: 📋 Scrum ve Proje Yönetimi Raporu

---
### A. Backlog Dağıtma Mantığı : Backlog Düzeni & Story seçimleri & Görev Dağılımı (Efor: 52 SP)

Backlog'umuz öncelikli story'lere göre düzenlenmiştir. Sprint başına tahmin edilen puan sayısını geçmeyecek şekilde sıradan seçimler yapılmaktadır. Story başına çıkan tahmin puanı, toplam puanın yarısından az tutulmuştur. Story'ler yapılacak işlere (task'lere) bölünmüştür. 
Trello Board'da gözüken turuncu item'lar öncelikli yapılacak görevleri (task) gösterirken, mor item'ler turuncu adımlar tamamlandıktan sonra ki adımları, sarı item'ler proje yönetimi için ana adımları temsil etmektedir.  

Süreç içerisinde git merge çakışmalarını (conflict) sıfıra indirmek adına görevler **sayfa rotalarına (routes) ve atomik bileşen mimarisine** göre bölünmüştür.

| İş Kimliği | Görev / Kullanıcı Hikayesi                                                                                                                                                                                                                     | Sorumlu                    | Efor (SP) | İlgili Rota / Klasör |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-----------| --- |
| **TS2-01** | **State Mimarisi:** `BaggageAnalysis`, `BaggageDimensions` ve `BaggageStatus` tiplerinin ve `localStorage` kalıcılık mekanizmasının `TravelContext`'e eklenmesi.                                                                               | Abdülaziz                  | 5 SP      | `src/types/travel.ts`, `src/context/TravelContext.tsx` |
| **TS3-02** | **Landing & Chatbot RAG Entegrasyonu:** Chatbot üzerindeki hardcoded mantığın silinip `/api/v1/rag-query` API servisine bağlanması ve Landing Page Teaser bileşeninin yazılması.                                                               | Abdülaziz                  | 5 SP      | `src/components/landing/*`, `src/app/page.tsx` |
| **TS3-03** | **Wizard Analiz Formu (UX)& Üst Bar UI:** Bilet verisi ve bagaj boyutlarını tek bir sıralı wizard formunda birleştiren giriş arayüzünün yapılması.üst bilgi ve yönlendirme barlarının (Progress & Header Bars) tasarımsal olarak düzenlenmesi. | Abdülaziz                  | 8 SP      | `src/app/analyze/*` |
| **TS3-04** | **Baggage Vision & AR Rozetler:** Kamera/fotoğraf yükleme modülünün yazılması ve görsel üzerinde SVG/Canvas tabanlı AR 3D boyut rozetlerinin (42x22x25 cm) gösterilmesi.                                                                       | Münevver                   | 8 SP      | `src/components/analyze/BaggageScannerTab.tsx` |
| **TS3-05** | **Real-Time Scan Veri Bağlantısı:** Görsel tarama sonucunda elde edilen boyutların analiz formuna ve `runBaggageAiSimulation` motoruna otomatik aktarılması.                                                                                   | Yasin                      | 3 SP      | `src/components/analyze/*` |
| **TS3-06** | **Dashboard Uyum Kartı:** `BaggageComplianceCard.tsx` ile limit kıyaslama barlarının, €70 ceza uyarısının ve %94 AI Güven Skoru rozetinin tasarlanması.                                                                                        | Münevver                   | 8 SP      | `src/components/dashboard/BaggageComplianceCard.tsx` |
| **TS3-07** | **Client State Sarmalayıcısı:** `DashboardClientWrapper.tsx` ile istemci tarafında veri senkronizasyonunun sağlanması ve sayfa yenileme hatalarının önlenmesi.                                                                                 | Münevver                   | 5 SP      | `src/components/dashboard/DashboardClientWrapper.tsx`, `src/app/dashboard/page.tsx` |
| **TS3-08** | **Veri Tekilleştirme & Temizlik:** Havayolu limit verilerinin 4 ayrı dosya yerine `airline-policies.ts` dosyasından okunacak şekilde sadeleştirilmesi.                                                                                         | Münevver                   | 3 SP      | `src/lib/airline-policies.ts`, `src/lib/operator-meta.ts` |
| **TS3-09** | **Türkiye Merkezli Havayolları & Veri Tekilleştirme:** THY, Pegasus, SunExpress, AJet gibi Türkiye merkezli taşıyıcı firmaların kural ve ceza veritabanına eklenmesi, kural verilerinin `airline-policies.ts` altında tekilleştirilmesi.       | Münevver                   | 5 SP | `src/lib/airline-policies.ts`, `src/lib/operator-meta.ts` |
| **TS3-10** | **RAG Servis & Fallback Altyapısı:** API anahtarı eksiklikleri veya ağ kopmalarında uygulamanın çökmesini önleyen Demo Safety Guard (Fallback) mekanizmasının kurulması.                                                                       | Abdülaziz                  | 5 SP | `src/app/api/v1/rag-query/route.ts` |
| **TS3-11** | **Hukuki Sorumluluk Reddi (Legal Disclaimer Banner):** Hukuki riskleri önlemek adına site genelinde ve analiz ekranında "Bu araç bir yapay zeka asistanıdır, verilen uyarılar bağlayıcı/resmi bildirim değildir" uyarısının eklenmesi.         | Münevver                   | 2 SP | `src/components/common/LegalDisclaimerBanner.tsx`, `src/app/layout.tsx` |
| **TS3-12** | **Demo Hazırlığı&Ürünün Videosunun Hazırlanması:**                                                                                                                                                                                             | Abdülaziz, Münevver, Yasin | 8 SP | 
---
### B. Daily Scrum Notları- Sprint 3:
Daily Scrum toplantılarında daha hızlı aksiyon alınması için WhatApp üzerinden ilerlenmiş, ekip üyelerinin müsait olduğu günlerde Slack üzerinden toplantı yapılmasına karar verilmiştir. Daily Scrum toplantısı örneği jpeg veya word olarak Readme'de tarafımızdan paylaşılmaktadır:
[DailyScrumMeetingNotesSprint3.docx](ProjectManagment/Sprint3Documents/DailyScrumMeetingNotesSprint3.docx)


### C. Sprint 3 Board Updates: Ekran görüntüleri
![backlog_1.png](ProjectManagment/Sprint3Documents/backlog_1.png)
![backlog_2.png](ProjectManagment/Sprint3Documents/backlog_2.png)
![backlog_3.png](ProjectManagment/Sprint3Documents/backlog_3.png)
![backlog_4.png](ProjectManagment/Sprint3Documents/backlog_4.png)
![backlog_5.png](ProjectManagment/Sprint3Documents/backlog_5.png)
![backlog_6.png](ProjectManagment/Sprint3Documents/backlog_6.png)

### D. Ürün Durumu: Ekran görüntüleri



Sprint 3 çıktıları itibarıyla ürün Persona'nın Seyahat Senaryosu üzerinden %100 çalışır durumdadır:
Giriş: Persona, Ryanair uçuşu için bagaj fotoğrafını yükler.
Görsel Algılama: Sistem çantayı 42×22×25 cm olarak tespit eder.
Kural Eşleştirme (RAG): Ryanair kabin limiti olan 40×20×25 cm ile kıyaslanır (+2 cm yükseklik aşımı).
Risk ve Çözüm:
Tespit Edilen Ceza: €70 Kapı Ücreti (Gate Baggage Fee).
Aksiyon: €18 Online Kabin Yükseltme Önerisi.
Net Finansal Tasarruf: €52.

Sprint 3 sonunda elde edilen ürün; kullanıcı girdilerine dinamik olarak tepki veren, durum yönetimli (stateful) ve çok kanallı (omnichannel) büyüme vizyonuna sahip üst segment bir frontend prototipidir. Sunucu ihtiyacı duymadan, istemci tarafında gelişmiş yapay zeka ajan tarama simülasyonunu başarıyla oluşturur.


### E. Sprint Review:

Neler Tamamlandı?: 
* Bilet ve bagaj verilerini tek akışta birleştiren Wizard mimarisi devreye alındı.
* Hardcoded chatbot yapısı, Gemini 2.5 tabanlı RAG API'ye bağlandı.
* Olası ağ kopmalarında canlı sunumu korumak adına Demo Safety Fallback Guard eklendi.
* Çift backend ve çakışan kural veritabanı temizlenerek kod mimarisi sadeleştirildi.

Alınan Geri Bildirimler: Kapı cezası ve net tasarruf miktarının doğrudan Euro bazlı gösterilmesi finansal etkiyi görünür kılmıştır.

Onay Durumu: Ürün, Sprint 3-Proje Kapanışı için belirlenen "Uçtan uca durum yönetimli (stateful) MVP prototipi ve omnichannel büyüme vizyonu" hedeflerinin tamamını eksiksiz karşıladığı için Ürün Sahibi (Product Owner) ve ekip üyeleri tarafından %100 başarıyla onaylanmış ve teslim alınmıştır.

### F. Sprint Retrospective:

* **🟢 Ne İyi Gitti?:** src/types/travel.ts veri kontratının kilitlenmesi, 3 geliştiricinin birbirini engellemeden paralel çalışmasını sağladı. Live Demo Safety Guard sayesinde sunum sırasında API kotası aşılsa bile uygulamanın çökmesi engellendi.
  
* **🔴 Ne Geliştirilebilir?:** Farklı dosyalarda tutulan veri alanları (4 ayrı policies tanımı) sprint başında fark edilip daha erken tekilleştirilebilirdi.
  
* **🛠️ Aksiyon Planı:** Proje sonlandırılarak jüriye demo sunumu yapıldı, Bootcamp Kapanışı gerçekleştirilip ürün teslim edildi.

---
