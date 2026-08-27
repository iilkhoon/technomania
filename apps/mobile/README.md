# TechnoMania Mobile Application (iOS & Android)

Müasir **React Native + Expo (TypeScript)** əsaslı TechnoMania e-ticarət mobil tətbiqi.

---

## 📱 İmkanlar və Ekranlar

1. **🏠 Ana Səhifə (`app/(tabs)/index.tsx`):**
   - Dinamik Hero Banner Sliders (avtomatik fırlanan aksiya bannerləri)
   - Kateqoriyaların horizontal dairəvi ikonları
   - Flaş Təkliflər (Flash Deals) karuseli
   - Satış Liderləri 2 sütunlu məhsul toru
   - Brendlər bölməsi

2. **📁 Kataloq (`app/(tabs)/catalog.tsx`):**
   - Bütün kateqoriyaların və alt bölmələrin tam siyahısı

3. **🔍 Ultra-Sürətli Axtarış (`app/(tabs)/search.tsx`):**
   - **Meilisearch** inteqrasiyası ilə 1–5ms cavab vaxtı
   - Typo-tolerance (hərf səhvlərini bağışlayan axtarış)
   - Brend və qiymət filtrləri

4. **🛒 Səbət & Sifariş (`app/(tabs)/cart.tsx`):**
   - Say idarəetməsi, promokod tətbiqi, çatdırılma və ödəniş seçimi ilə rəsmiləşdirmə

5. **👤 Profil & Dəstək (`app/(tabs)/profile.tsx`):**
   - Bəyəndiklərim (Wishlist) və Müqayisə
   - WhatsApp Dəstək Xətti və Zəng Mərkəzi birbaşa keçidi
   - Filiallar və Zəmanət məlumatları
   - Qaranlıq (Dark) və İşıqlı (Light) rejim keçidi

6. **📦 Məhsul Detalı (`app/product/[id].tsx`):**
   - Şəkil qalereyası
   - 0₼ İlkin ödənişlə 6, 12, 18, 24 aylıq Kredit Kalkulyatoru
   - Bütün texniki göstəricilər cədvəli
   - "Səbətə at" və "1 Kliklə Al" düymələri

---

## 🚀 Tətbiqi Telefonda Necə Test Etmək Olar?

### 1. Telefonunuza **Expo Go** tətbiqini yükləyin:
- **iPhone (iOS):** App Store-dan `Expo Go` yükləyin.
- **Android:** Google Play Store-dan `Expo Go` yükləyin.

### 2. Serverdə tətbiqi işə salın:
```bash
cd /var/www/techno-erp/apps/mobile
npx expo start --tunnel
```

### 3. QR Kodu oxudun:
- Terminalda çıxan **QR kodu** iPhone kamera tətbiqi və ya Android Expo Go tətbiqi ilə oxudun.
- Tətbiq birbaşa telefonunuzun ekranında canlı açılacaq!

---

## 📦 APK (Android) və IPA (iOS) Yaratmaq (EAS Build):
```bash
npx eas build -p android --profile preview
npx eas build -p ios --profile preview
```
