-- ==========================================
-- TECHNO ERP FULL POSTGRESQL DATABASE SEED
-- ==========================================

-- 1. SEED CATEGORIES (3 Levels with spec_fields)
INSERT INTO categories (id, name, slug, full_slug, icon, icon_url, description, parent_id, level, is_top, sort_order, product_count, spec_fields)
VALUES
-- 1. Smartfonlar və planşetlər
('cat-smartphones', 'Smartfonlar və planşetlər', 'smartphones', 'smartphones', 'Smartphone', NULL, 'Smartfonlar, planşetlər, saatlar və aksessuarlar', NULL, 1, TRUE, 1, 20, '["Yaddaş", "RAM", "Ekran Ölçüsü", "Prosessor", "Batareya Tutumu", "Əsas Kamera", "Ön Kamera", "Əməliyyat Sistemi", "Zəmanət"]'::jsonb),
('cat-smartphones-phones', 'Smartfonlar', 'smartfonlar', 'smartphones/smartfonlar', 'Smartphone', NULL, 'iOS və Android smartfonlar', 'cat-smartphones', 2, TRUE, 1, 10, '["Yaddaş", "RAM", "Ekran Ölçüsü", "Prosessor", "Batareya Tutumu", "Əsas Kamera", "Ön Kamera", "Əməliyyat Sistemi", "Zəmanət"]'::jsonb),
('cat-smartphones-apple', 'Apple iPhone', 'apple-iphone', 'smartphones/smartfonlar/apple-iphone', 'Smartphone', NULL, 'iPhone 15, 14, 13 seriyaları', 'cat-smartphones-phones', 3, FALSE, 1, 4, '["Yaddaş", "RAM", "Ekran Ölçüsü", "Prosessor", "Batareya Tutumu", "Əsas Kamera", "Ön Kamera", "Zəmanət"]'::jsonb),
('cat-smartphones-samsung', 'Samsung Galaxy', 'samsung-galaxy', 'smartphones/smartfonlar/samsung-galaxy', 'Smartphone', NULL, 'Galaxy S, A, Z Flip & Fold seriyaları', 'cat-smartphones-phones', 3, FALSE, 2, 4, '["Yaddaş", "RAM", "Ekran Ölçüsü", "Prosessor", "Batareya Tutumu", "Əsas Kamera", "Ön Kamera", "Zəmanət"]'::jsonb),
('cat-smartphones-tablets', 'Planşetlər', 'plansetler', 'smartphones/plansetler', 'Tablet', NULL, 'iPad və Android planşetlər', 'cat-smartphones', 2, TRUE, 2, 5, '["Yaddaş", "RAM", "Ekran Ölçüsü", "Prosessor", "Əməliyyat Sistemi", "Zəmanət"]'::jsonb),
('cat-smartphones-ipad', 'Apple iPad', 'apple-ipad', 'smartphones/plansetler/apple-ipad', 'Tablet', NULL, 'iPad Pro, Air, Mini', 'cat-smartphones-tablets', 3, FALSE, 1, 3, '["Yaddaş", "RAM", "Ekran Ölçüsü", "Prosessor", "Zəmanət"]'::jsonb),
('cat-smartphones-watches', 'Smart Saatlar və Qolbaqlar', 'smart-watches', 'smartphones/smart-watches', 'Watch', NULL, 'Apple Watch, Galaxy Watch və smart band-lər', 'cat-smartphones', 2, TRUE, 3, 5, '["Ekran Ölçüsü", "Korpus Materialı", "Suya Davamlılıq", "Batareya İşi", "Uyğunluq", "Zəmanət"]'::jsonb),

-- 2. Notbuklar və kompüter texnikası
('cat-laptops-pc', 'Notbuklar və kompüter texnikası', 'laptops-pc', 'laptops-pc', 'Laptop', NULL, 'Noutbuklar, kompüterlər, monitorlar və aksessuarlar', NULL, 1, TRUE, 2, 18, '["Prosessor", "RAM", "SSD Yaddaş", "Videokart (GPU)", "Ekran Diaqonalı", "Matris Növü", "Əməliyyat Sistemi", "Zəmanət"]'::jsonb),
('cat-laptops-notebooks', 'Noutbuklar', 'noutbuklar', 'laptops-pc/noutbuklar', 'Laptop', NULL, 'Biznes, oyun və ultrabook noutbuklar', 'cat-laptops-pc', 2, TRUE, 1, 10, '["Prosessor", "RAM", "SSD Yaddaş", "Videokart (GPU)", "Ekran Diaqonalı", "Matris Növü", "Əməliyyat Sistemi", "Zəmanət"]'::jsonb),
('cat-laptops-gaming', 'Oyun Noutbukları (Gaming)', 'gaming-laptops', 'laptops-pc/noutbuklar/gaming-laptops', 'Laptop', NULL, 'ASUS ROG, Lenovo Legion, MSI', 'cat-laptops-notebooks', 3, FALSE, 1, 5, '["Prosessor", "RAM", "SSD Yaddaş", "Videokart (GPU)", "Ekran Tezliyi (Hz)", "Zəmanət"]'::jsonb),
('cat-laptops-desktops', 'Masaüstü Kompüterlər (PC)', 'desktop-pcs', 'laptops-pc/desktop-pcs', 'Monitor', NULL, 'Monobloklar və gaming kompyuterlər', 'cat-laptops-pc', 2, TRUE, 2, 4, '["Prosessor", "RAM", "SSD Yaddaş", "Videokart (GPU)", "Korpus Tipi", "Əməliyyat Sistemi", "Zəmanət"]'::jsonb),
('cat-laptops-monitors', 'Kompüter Aksessuarları və Monitorlar', 'pc-accessories', 'laptops-pc/pc-accessories', 'Mouse', NULL, 'Monitorlar, klaviatura və siçanlar', 'cat-laptops-pc', 2, TRUE, 3, 4, '["Qoşulma İnterfeysi", "Ekran Ölçüsü", "Daxili Dinamik", "Zəmanət"]'::jsonb),

-- 3. TV, audio və video
('cat-tv-audio', 'TV, audio və video', 'tv-audio', 'tv-audio', 'Tv', NULL, 'Televizorlar, soundbarlar və dinamiklər', NULL, 1, TRUE, 3, 15, '["Ekran Diaqonalı", "Görüntü Keyfiyyəti (Resolution)", "Smart TV", "Matris Növü (OLED/QLED/LED)", "Səs Gücü", "Tezlik (Hz)", "Zəmanət"]'::jsonb),
('cat-tv-tvs', 'Televizorlar', 'televizorlar', 'tv-audio/televizorlar', 'Tv', NULL, '4K Ultra HD, OLED və QLED Smart TV-lər', 'cat-tv-audio', 2, TRUE, 1, 8, '["Ekran Diaqonalı", "Görüntü Keyfiyyəti (Resolution)", "Smart TV", "Matris Növü (OLED/QLED/LED)", "Səs Gücü", "Tezlik (Hz)", "Zəmanət"]'::jsonb),
('cat-tv-4k', '4K Ultra HD Televizorlar', '4k-tvs', 'tv-audio/televizorlar/4k-tvs', 'Tv', NULL, 'Samsung, LG, Xiaomi 4K TV-lər', 'cat-tv-tvs', 3, FALSE, 1, 5, '["Ekran Diaqonalı", "Smart TV", "Matris Növü", "Zəmanət"]'::jsonb),
('cat-tv-audio-tech', 'Audio Texnikası', 'audio-tech', 'tv-audio/audio-tech', 'Speaker', NULL, 'Soundbarlar, bluetooth dinamiklər və qulaqlıqlar', 'cat-tv-audio', 2, TRUE, 2, 7, '["Səs Gücü (W)", "Qoşulma (Bluetooth/Wi-Fi)", "Batareya İşi", "Kanal Sayı", "Zəmanət"]'::jsonb),

-- 4. Sərinlik dünyası & İqlim texnikası
('cat-climate-tech', 'Sərinlik dünyası & İqlim texnikası', 'serinlik-dunyasi', 'serinlik-dunyasi', 'Wind', NULL, 'Kondisionerlər, hava təmizləyicilər və ventilyatorlar', NULL, 1, TRUE, 4, 12, '["Xidmət Sahəsi (m²)", "İnverter Mühərrik", "Soyutma Gücü (BTU)", "Freon Tipi", "Səs Səviyyəsi (dB)", "Zəmanət Müddəti"]'::jsonb),
('cat-climate-ac', 'Kondisionerlər', 'kondisionerler', 'serinlik-dunyasi/kondisionerler', 'Wind', NULL, 'Inverter və split kondisionerlər', 'cat-climate-tech', 2, TRUE, 1, 8, '["Xidmət Sahəsi (m²)", "İnverter Mühərrik", "Soyutma Gücü (BTU)", "Freon Tipi", "Səs Səviyyəsi (dB)", "Zəmanət Müddəti"]'::jsonb),
('cat-climate-purifiers', 'Hava Təmizləyicilər və Nəmləndiricilər', 'air-purifiers', 'serinlik-dunyasi/air-purifiers', 'Wind', NULL, 'Dyson və Xiaomi hava təmizləyiciləri', 'cat-climate-tech', 2, TRUE, 2, 4, '["Xidmət Sahəsi (m²)", "Filter Tipi (HEPA)", "Səs Səviyyəsi", "Zəmanət"]'::jsonb),

-- 5. Böyük məişət texnikası
('cat-big-appliances', 'Böyük məişət texnikası', 'big-appliances', 'big-appliances', 'HomeIcon', NULL, 'Soyuducular, paltaryuyanlar və qabyuyanlar', NULL, 1, TRUE, 5, 14, '["Ümumi Həcm (Litr)", "Enerji Səmərəliliyi Dərəcəsi", "Mühərrik Tipi (Inverter)", "Rəng", "Maksimal Yük (kq)", "Zəmanət Müddəti"]'::jsonb),
('cat-big-fridges', 'Soyuducular', 'soyuducular', 'big-appliances/soyuducular', 'HomeIcon', NULL, 'NoFrost və Side-by-Side soyuducular', 'cat-big-appliances', 2, TRUE, 1, 6, '["Dondurucu Növü (NoFrost)", "Ümumi Həcm (Litr)", "Enerji Səmərəliliyi Dərəcəsi", "Rəng", "Zəmanət Müddəti"]'::jsonb),
('cat-big-washers', 'Paltaryuyan maşınlar', 'paltaryuyanlar', 'big-appliances/paltaryuyanlar', 'HomeIcon', NULL, 'Inverter paltaryuyan maşınlar', 'cat-big-appliances', 2, TRUE, 2, 5, '["Maksimal Yük (kq)", "Dövriyyə Sürəti (dövr/dəq)", "Mühərrik Tipi (Inverter)", "Enerji Sinfi", "Zəmanət Müddəti"]'::jsonb),
('cat-big-dishwashers', 'Qabyuyan maşınlar', 'qabyuyanlar', 'big-appliances/qabyuyanlar', 'HomeIcon', NULL, 'Quraşdırılan və müstəqil qabyuyanlar', 'cat-big-appliances', 2, TRUE, 3, 3, '["Tutumu (Dəst)", "Su Sərfi (L)", "Proqram Sayı", "Zəmanət Müddəti"]'::jsonb),

-- 6. Kiçik məişət texnikası
('cat-small-appliances', 'Kiçik məişət texnikası', 'small-appliances', 'small-appliances', 'Coffee', NULL, 'Tozsoranlar, qəhvə maşınları və blenderlər', NULL, 1, TRUE, 6, 12, '["Maksimal Güc (W)", "Həcm (L)", "Material", "Proqram Sayı", "Zəmanət Müddəti"]'::jsonb),
('cat-small-vacuums', 'Tozsoranlar', 'tozsoranlar', 'small-appliances/tozsoranlar', 'Coffee', NULL, 'Robot və şaquli naqilsiz tozsoranlar', 'cat-small-appliances', 2, TRUE, 1, 7, '["Sorma Gücü", "Naviqasiya", "Batareya İşi", "Nəm Təmizləmə", "Zəmanət"]'::jsonb),
('cat-small-coffee', 'Qəhvə Texnikası', 'qehve-texnikasi', 'small-appliances/qehve-texnikasi', 'Coffee', NULL, 'DeLonghi və Philips espresso aparatları', 'cat-small-appliances', 2, TRUE, 2, 5, '["Təzyiq (Bar)", "Qəhvə Tipi", "Köpükləndirici", "Zəmanət"]'::jsonb),

-- 7. Oyun konsolları və aksessuarlar
('cat-gaming-consoles', 'Oyun konsolları və aksessuarlar', 'gaming-consoles', 'gaming-consoles', 'Gamepad2', NULL, 'PlayStation 5, Xbox və qeympadlar', NULL, 1, TRUE, 7, 10, '["Yaddaş", "Video Çıxış (4K/120Hz)", "Dəstəklənən Formatlar", "Qutuda Controller Sayı", "Zəmanət"]'::jsonb),
('cat-gaming-boxes', 'Oyun Konsolları', 'consoles', 'gaming-consoles/consoles', 'Gamepad2', NULL, 'PS5 Slim, Xbox Series X/S', 'cat-gaming-consoles', 2, TRUE, 1, 5, '["Yaddaş", "Video Çıxış (4K/120Hz)", "Dəstəklənən Formatlar", "Qutuda Controller Sayı", "Zəmanət"]'::jsonb),
('cat-gaming-accessories', 'Qeympadlar və Aksessuarlar', 'gamepads', 'gaming-consoles/gamepads', 'Gamepad2', NULL, 'DualSense və Xbox controller-lər', 'cat-gaming-consoles', 2, TRUE, 2, 5, '["Qoşulma Tipi", "Vibrasiya", "Zəmanət"]'::jsonb),

-- 8. Gözəllik və baxım
('cat-beauty-care', 'Gözəllik və baxım', 'beauty-care', 'beauty-care', 'Scissors', NULL, 'Dyson fenlər, staylerlər və təraş aparatları', NULL, 1, TRUE, 8, 8, '["Güc (W)", "Temperatur Rejimi", "İonlaşma Funksiyası", "Növlər", "Zəmanət"]'::jsonb),
('cat-beauty-hair', 'Saç Qulluğu', 'hair-care', 'beauty-care/hair-care', 'Scissors', NULL, 'Dyson Airwrap, fenlər və ütülər', 'cat-beauty-care', 2, TRUE, 1, 4, '["Güc (W)", "Temperatur Rejimi", "İonlaşma Funksiyası", "Zəmanət"]'::jsonb),
('cat-beauty-shavers', 'Təraş Aparatları', 'shavers', 'beauty-care/shavers', 'Scissors', NULL, 'Philips və Braun kişi təraş aparatları', 'cat-beauty-care', 2, TRUE, 2, 4, '["Ülgüc Tipi", "Batareya İşi", "Suya Davamlılıq", "Zəmanət"]'::jsonb),

-- 9. Aktiv və sağlam yaşam
('cat-active-living', 'Aktiv və sağlam yaşam', 'aktiv-ve-saglam-yasam', 'aktiv-ve-saglam-yasam', 'Dumbbell', NULL, 'Elektrik skuterlər və fitnes avadanlıqları', NULL, 1, TRUE, 9, 6, '["Maksimal Sürət (km/s)", "Məsafə Qət Etmə (km)", "Maksimal Yük (kq)", "Batareya", "Zəmanət"]'::jsonb),
('cat-active-scooters', 'Elektrik Skuterləri və Velosipedlər', 'electric-scooters', 'aktiv-ve-saglam-yasam/electric-scooters', 'Dumbbell', NULL, 'Xiaomi və Segway Ninebot skuterlər', 'cat-active-living', 2, TRUE, 1, 6, '["Maksimal Sürət (km/s)", "Məsafə Qət Etmə (km)", "Maksimal Yük (kq)", "Batareya", "Zəmanət"]'::jsonb),

-- 10. Günəş Stili
('cat-sun-style', 'Günəş Stili', 'gunes-stili', 'gunes-stili', 'Glasses', NULL, 'Ray-Ban və Oakley günəş eynəkləri', NULL, 1, TRUE, 10, 5, '["Çərçivə Materialı", "Linza Rəngi", "UV Qoruma Dərəcəsi", "Forma", "Zəmanət"]'::jsonb),
('cat-sun-glasses', 'Günəş Eynəkləri', 'sunglasses', 'gunes-stili/sunglasses', 'Glasses', NULL, 'Aviator, Wayfarer və İdman eynəkləri', 'cat-sun-style', 2, TRUE, 1, 5, '["Çərçivə Materialı", "Linza Rəngi", "UV Qoruma Dərəcəsi", "Forma", "Zəmanət"]'::jsonb),

-- 11. Avto və moto
('cat-auto-moto', 'Avto və moto', 'auto-moto', 'auto-moto', 'Car', NULL, 'Videoqeydiyyatçılar və avto aksessuarlar', NULL, 1, TRUE, 11, 5, '["Görüntü Bucağı", "Video Görüntü Keyfiyyəti", "Ekran Ölçüsü", "Qida Mənbəyi", "Zəmanət"]'::jsonb),
('cat-auto-dashcams', 'Videoqeydiyyatçılar', 'dashcams', 'auto-moto/dashcams', 'Car', NULL, '70mai və Xiaomi ikili videoqeydiyyatçılar', 'cat-auto-moto', 2, TRUE, 1, 5, '["Görüntü Bucağı", "Video Görüntü Keyfiyyəti", "Ekran Ölçüsü", "Qida Mənbəyi", "Zəmanət"]'::jsonb),

-- 12. Tibbi məhsulları
('cat-medical-products', 'Tibbi məhsulları', 'medical-products', 'medical-products', 'Stethoscope', NULL, 'Omron tonometrlər və nebulayzerlər', NULL, 1, TRUE, 12, 5, '["Ölçmə Dəqiqliyi", "Yaddaş Tutumu", "Manjet Ölçüsü", "Qida Mənbəyi", "Zəmanət"]'::jsonb),
('cat-medical-tonometers', 'Təzyiq Ölçənlər (Tonometrlər)', 'tonometers', 'medical-products/tonometers', 'Stethoscope', NULL, 'Avtomatik qol tonometrləri', 'cat-medical-products', 2, TRUE, 1, 5, '["Ölçmə Dəqiqliyi", "Yaddaş Tutumu", "Manjet Ölçüsü", "Qida Mənbəyi", "Zəmanət"]'::jsonb),

-- 13. Ev və bağ
('cat-home-garden', 'Ev və bağ', 'home-garden', 'home-garden', 'House', NULL, 'Kärcher yuma aparatları və otbiçənlər', NULL, 1, TRUE, 13, 5, '["Mühərrik Gücü", "İş Rejimi", "Təzyiq (Bar)", "Çən Həcmi", "Zəmanət"]'::jsonb),
('cat-home-washers', 'Yuma Aparatları və Otbiçənlər', 'pressure-washers', 'home-garden/pressure-washers', 'House', NULL, 'Kärcher yüksek təzyiqli yuyucular', 'cat-home-garden', 2, TRUE, 1, 5, '["Mühərrik Gücü", "İş Rejimi", "Təzyiq (Bar)", "Çən Həcmi", "Zəmanət"]'::jsonb),

-- 14. Mebel, tekstil və dekor
('cat-furniture-decor', 'Mebel, tekstil və dekor', 'furniture-decor', 'furniture-decor', 'Armchair', NULL, 'Cougar gaming kresloları və masaları', NULL, 1, TRUE, 14, 5, '["Maksimal Yük (kq)", "Korpus Materialı", "Qolaltı Qaldırma", "Mexanizm Tipi", "Zəmanət"]'::jsonb),
('cat-furniture-chairs', 'Oyunçu Kresloları və Masaları', 'gaming-chairs', 'furniture-decor/gaming-chairs', 'Armchair', NULL, 'Cougar Vantar və Armor gaming kresloları', 'cat-furniture-decor', 2, TRUE, 1, 5, '["Maksimal Yük (kq)", "Korpus Materialı", "Qolaltı Qaldırma", "Mexanizm Tipi", "Zəmanət"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  full_slug = EXCLUDED.full_slug,
  spec_fields = EXCLUDED.spec_fields,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 2. SEED BRANDS
INSERT INTO brands (id, name, slug, logo_url, is_popular, description)
VALUES
('b-apple', 'Apple', 'apple', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80', TRUE, 'Rəsmi Apple smartfonları, kompyuterləri və aksessuarları'),
('b-samsung', 'Samsung', 'samsung', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80', TRUE, 'Samsung smartfonlar, 4K TV və məişət texnikası'),
('b-xiaomi', 'Xiaomi', 'xiaomi', NULL, TRUE, 'Xiaomi ağıllı ev texnikası və smartfonları'),
('b-asus', 'ASUS', 'asus', NULL, TRUE, 'ASUS ROG və Vivobook noutbukları'),
('b-lenovo', 'Lenovo', 'lenovo', NULL, TRUE, 'Lenovo Legion və ThinkPad kompyuterləri'),
('b-hp', 'HP', 'hp', NULL, TRUE, 'HP noutbukları və printerləri'),
('b-dell', 'Dell', 'dell', NULL, FALSE, 'Dell XPS və Latitude noutbukları'),
('b-lg', 'LG', 'lg', NULL, TRUE, 'LG OLED TV və Inverter paltaryuyanlar'),
('b-haier', 'Haier', 'haier', NULL, TRUE, 'Haier Inverter kondisionerlər və soyuducular'),
('b-bosch', 'Bosch', 'bosch', NULL, TRUE, 'Bosch məişət texnikası'),
('b-dyson', 'Dyson', 'dyson', NULL, TRUE, 'Dyson fenlər, staylerlər və tozsoranlar'),
('b-sony', 'Sony', 'sony', NULL, TRUE, 'Sony PlayStation 5 və audio texnika'),
('b-delonghi', 'DeLonghi', 'delonghi', NULL, TRUE, 'DeLonghi espresso qəhvə maşınları'),
('b-rayban', 'Ray-Ban', 'ray-ban', NULL, TRUE, 'Ray-Ban Aviator və Wayfarer günəş eynəkləri'),
('b-oakley', 'Oakley', 'oakley', NULL, FALSE, 'Oakley idman eynəkləri'),
('b-omron', 'Omron', 'omron', NULL, TRUE, 'Omron yaponiya istehsalı avtomatik tonometrlər'),
('b-karcher', 'Kärcher', 'karcher', NULL, TRUE, 'Kärcher alman keyfiyyətli yuma aparatları'),
('b-cougar', 'Cougar', 'cougar', NULL, TRUE, 'Cougar erqonomik gaming kresloları')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  is_popular = EXCLUDED.is_popular,
  description = EXCLUDED.description;

-- 3. SEED PRODUCTS (Real products for every category)
INSERT INTO products (id, name, model_name, brand, brand_id, cash_price, old_price, stock, category_id, category_name, image, is_active, is_new, discount, attributes)
VALUES
(
  'p-apple-15promax',
  'iPhone 15 Pro Max 256GB Natural Titanium',
  'iPhone 15 Pro Max 256GB',
  'Apple',
  'b-apple',
  2939.99,
  3199.99,
  15,
  'cat-smartphones-phones',
  'Smartfonlar',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-8%',
  '{"Yaddaş": "256 GB", "RAM": "8 GB", "Ekran Ölçüsü": "6.7\" Super Retina XDR", "Prosessor": "Apple A17 Pro", "Batareya Tutumu": "4422 mAh", "Əsas Kamera": "48 MP + 12 MP + 12 MP", "Ön Kamera": "12 MP TrueDepth", "Əməliyyat Sistemi": "iOS 17", "Zəmanət": "1 il rəsmi Apple"}'::jsonb
),
(
  'p-samsung-s24ultra',
  'Samsung Galaxy S24 Ultra 512GB Titanium Silver',
  'Samsung Galaxy S24 Ultra 512GB',
  'Samsung',
  'b-samsung',
  2759.99,
  2999.99,
  8,
  'cat-smartphones-phones',
  'Smartfonlar',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-8%',
  '{"Yaddaş": "512 GB", "RAM": "12 GB", "Ekran Ölçüsü": "6.8\" Dynamic AMOLED 2X", "Prosessor": "Snapdragon 8 Gen 3 for Galaxy", "Batareya Tutumu": "5000 mAh", "Əsas Kamera": "200 MP + 50 MP + 12 MP + 10 MP", "Ön Kamera": "12 MP", "Əməliyyat Sistemi": "Android 14 (One UI 6.1)", "Zəmanət": "1 il rəsmi Samsung"}'::jsonb
),
(
  'p-ipad-pro11',
  'Apple iPad Pro 11" M4 256GB Space Black',
  'iPad Pro 11" M4',
  'Apple',
  'b-apple',
  2199.99,
  2399.99,
  10,
  'cat-smartphones-tablets',
  'Planşetlər',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-8%',
  '{"Yaddaş": "256 GB", "RAM": "8 GB", "Ekran Ölçüsü": "11\" Ultra Retina Tandem OLED", "Prosessor": "Apple M4 9-Core", "Əməliyyat Sistemi": "iPadOS 17.5", "Zəmanət": "1 il rəsmi Apple"}'::jsonb
),
(
  'p-apple-watch-s9',
  'Apple Watch Series 9 45mm Midnight Aluminum',
  'Apple Watch Series 9 45mm',
  'Apple',
  'b-apple',
  949.99,
  1099.99,
  12,
  'cat-smartphones-watches',
  'Smart Saatlar və Qolbaqlar',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  '-13%',
  '{"Ekran Ölçüsü": "45mm Always-On OLED", "Korpus Materialı": "Alüminium", "Suya Davamlılıq": "50m Suya dözümlü", "Batareya İşi": "18 saata qədər", "Uyğunluq": "iOS", "Zəmanət": "1 il rəsmi Apple"}'::jsonb
),
(
  'p-macbook-pro16',
  'Apple MacBook Pro 16" M3 Max 36GB/1TB Space Black',
  'MacBook Pro 16" M3 Max',
  'Apple',
  'b-apple',
  7499.99,
  7999.99,
  5,
  'cat-laptops-notebooks',
  'Noutbuklar',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-6%',
  '{"Prosessor": "Apple M3 Max (14 CPU / 30 GPU)", "RAM": "36 GB Unified", "SSD Yaddaş": "1 TB NVMe SSD", "Videokart (GPU)": "Apple 30-Core GPU", "Ekran Diaqonalı": "16.2\" Liquid Retina XDR 120Hz", "Matris Növü": "Mini-LED 1600nits", "Əməliyyat Sistemi": "macOS Sonoma", "Zəmanət": "1 il rəsmi Apple"}'::jsonb
),
(
  'p-asus-vivobook15',
  'Noutbuk ASUS Vivobook 15X OLED i5/16GB/512SSD',
  'ASUS Vivobook 15X',
  'ASUS',
  'b-asus',
  1399.99,
  1799.99,
  14,
  'cat-laptops-notebooks',
  'Noutbuklar',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  '-22%',
  '{"Prosessor": "Intel Core i5-13500H (12 Cores)", "RAM": "16 GB DDR4 3200MHz", "SSD Yaddaş": "512 GB NVMe PCIe 4.0", "Ekran Diaqonalı": "15.6\" OLED 120Hz 600nits", "Videokart (GPU)": "Intel Iris Xe Graphics", "Əməliyyat Sistemi": "Windows 11 Home", "Matris Növü": "OLED 100% DCI-P3", "Zəmanət": "2 il rəsmi ASUS"}'::jsonb
),
(
  'p-samsung-50tv',
  'Smart TV Samsung UE50CU7000UXRU 50" 4K Ultra HD',
  'Samsung 50" 4K Smart TV',
  'Samsung',
  'b-samsung',
  999.99,
  1399.99,
  6,
  'cat-tv-tvs',
  'Televizorlar',
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  '-29%',
  '{"Ekran Diaqonalı": "50\" (127 sm)", "Görüntü Keyfiyyəti (Resolution)": "4K Ultra HD (3840x2160)", "Smart TV": "Bəli (Tizen OS 7.0)", "Matris Növü (OLED/QLED/LED)": "Crystal UHD LED", "Səs Gücü": "20W Dolby Digital Plus", "Tezlik (Hz)": "60 Hz", "Zəmanət Müddəti": "1 il rəsmi"}'::jsonb
),
(
  'p-haier-coral12',
  'Kondisioner Haier Coral 12000 BTU Inverter White',
  'Haier Coral 12000 BTU Inverter',
  'Haier',
  'b-haier',
  849.99,
  999.99,
  12,
  'cat-climate-ac',
  'Kondisionerlər',
  'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-15%',
  '{"Xidmət Sahəsi (m²)": "35-40 m²", "İnverter Mühərrik": "Bəli (DC Inverter A++)", "Soyutma Gücü (BTU)": "12000 BTU", "Freon Tipi": "R32 Ekoloji", "Səs Səviyyəsi (dB)": "19 dB Ultra Səssiz", "Zəmanət Müddəti": "3 il rəsmi"}'::jsonb
),
(
  'p-lg-washer85',
  'Paltaryuyan maşın LG F2V5GG9S 8.5kq Inverter AI DD',
  'LG F2V5GG9S 8.5kq',
  'LG',
  'b-lg',
  1149.99,
  1299.99,
  7,
  'cat-big-washers',
  'Paltaryuyan maşınlar',
  'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  '-11%',
  '{"Maksimal Yük (kq)": "8.5 kq", "Dövriyyə Sürəti (dövr/dəq)": "1200 d/d", "Mühərrik Tipi (Inverter)": "Direct Drive Inverter Mühərrik", "Enerji Sinfi": "A+++", "Zəmanət Müddəti": "10 il mühərrik zəmanəti"}'::jsonb
),
(
  'p-xiaomi-vacs10',
  'Robot Tozsoran Xiaomi Robot Vacuum S10+ White',
  'Xiaomi Vacuum S10+',
  'Xiaomi',
  'b-xiaomi',
  689.99,
  849.99,
  14,
  'cat-small-vacuums',
  'Tozsoranlar',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-19%',
  '{"Sorma Gücü": "4000 Pa Turbo Sorma", "Naviqasiya": "LDS Lazer 3D Naviqasiya", "Batareya İşi": "5200 mAh (120 dəq işləmə)", "Nəm Təmizləmə": "Bəli (İkili fırlanan bez)", "Zəmanət": "1 il rəsmi"}'::jsonb
),
(
  'p-ps5-slim',
  'PlayStation 5 Slim Digital 1TB White',
  'PlayStation 5 Slim Digital 1TB',
  'Sony',
  'b-sony',
  999.99,
  1199.99,
  9,
  'cat-gaming-boxes',
  'Oyun Konsolları',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-17%',
  '{"Yaddaş": "1 TB Custom NVMe SSD", "Video Çıxış (4K/120Hz)": "4K 120Hz / 8K HDR", "Dəstəklənən Formatlar": "Digital Edition (Rəqəmsal)", "Qutuda Controller Sayı": "1x DualSense Wireless", "Zəmanət": "1 il rəsmi Sony"}'::jsonb
),
(
  'p-dyson-airwrap',
  'Stayler Dyson Airwrap Multi-Styler Complete Long Nickel/Copper',
  'Dyson Airwrap Long',
  'Dyson',
  'b-dyson',
  1499.99,
  1699.99,
  4,
  'cat-beauty-hair',
  'Saç Qulluğu',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-12%',
  '{"Güc (W)": "1300W Coanda Hava Axını", "Temperatur Rejimi": "3 Temperatur + Soyuq Havasızlama", "İonlaşma Funksiyası": "Bəli (Statik elektriki azaldır)", "Zəmanət": "2 il rəsmi Dyson"}'::jsonb
),
(
  'p-xiaomi-scooter4pro',
  'Elektrikli skuter Xiaomi Electric Scooter 4 Pro 25km/h',
  'Xiaomi Scooter 4 Pro',
  'Xiaomi',
  'b-xiaomi',
  1299.99,
  1499.99,
  7,
  'cat-active-scooters',
  'Elektrik Skuterləri və Velosipedlər',
  'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-13%',
  '{"Maksimal Sürət (km/s)": "25 km/saat", "Məsafə Qət Etmə (km)": "55 km məsafə", "Maksimal Yük (kq)": "120 kq", "Batareya": "12400 mAh (446Wh)", "Zəmanət": "1 il rəsmi"}'::jsonb
),
(
  'p-rayban-aviator',
  'Günəş eynəyi Ray-Ban Aviator Classic RB3025 Gold/Green',
  'Ray-Ban Aviator RB3025',
  'Ray-Ban',
  'b-rayban',
  329.99,
  389.99,
  10,
  'cat-sun-glasses',
  'Günəş Eynəkləri',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-15%',
  '{"Çərçivə Materialı": "Qızılı Metallik", "Linza Rəngi": "Yaşıl G-15 Şüşə", "UV Qoruma Dərəcəsi": "100% UV400 Protection", "Forma": "Aviator Klassik", "Zəmanət": "1 il rəsmi"}'::jsonb
),
(
  'p-70mai-a500s',
  'Videoqeydiyyatçı 70mai Dash Cam Pro Plus+ A500S Dual',
  '70mai Dash Cam A500S Dual',
  'Xiaomi',
  'b-xiaomi',
  199.99,
  249.99,
  15,
  'cat-auto-dashcams',
  'Videoqeydiyyatçılar',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  '-20%',
  '{"Görüntü Bucağı": "140° Geniş Bucaq", "Video Görüntü Keyfiyyəti": "2.7K Ultra HD 1944P", "Ekran Ölçüsü": "2.0\" IPS", "Qida Mənbəyi": "500mAh Batareya + Type-C", "Zəmanət": "1 il rəsmi"}'::jsonb
),
(
  'p-omron-m6',
  'Təzyiq ölçən Omron M6 Comfort Avtomatik Qol Tonometri',
  'Omron M6 Comfort',
  'Omron',
  'b-omron',
  189.99,
  229.99,
  11,
  'cat-medical-tonometers',
  'Təzyiq Ölçənlər (Tonometrlər)',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  '-17%',
  '{"Ölçmə Dəqiqliyi": "IntelliSense Avtomatik", "Yaddaş Tutumu": "2 İstifadəçi x 100 Yaddaş", "Manjet Ölçüsü": "22-42 sm Intelli Wrap", "Qida Mənbəyi": "Batareya + Adaptor", "Zəmanət": "5 il rəsmi Omron"}'::jsonb
),
(
  'p-karcher-k5',
  'Yüksək təzyiqli yuma aparatı Kärcher K 5 Power Control',
  'Kärcher K 5 Power Control',
  'Kärcher',
  'b-karcher',
  749.99,
  899.99,
  8,
  'cat-home-washers',
  'Yuma Aparatları və Otbiçənlər',
  'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-17%',
  '{"Mühərrik Gücü": "2100W Su İlə Soyudulan Mühərrik", "İş Rejimi": "Hard, Medium, Soft, MIX", "Təzyiq (Bar)": "145 Bar Maksimal Təzyiq", "Çən Həcmi": "500 l/saat Su sərfi", "Zəmanət": "2 il rəsmi Kärcher"}'::jsonb
),
(
  'p-cougar-armor-titan',
  'Oyunçu kreslosu Cougar Armor Titan PRO Black/Orange',
  'Cougar Armor Titan PRO',
  'Cougar',
  'b-cougar',
  649.99,
  749.99,
  6,
  'cat-furniture-chairs',
  'Oyunçu Kresloları və Masaları',
  'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80',
  TRUE,
  TRUE,
  '-13%',
  '{"Maksimal Yük (kq)": "160 kq Yükqaldırma", "Korpus Materialı": "Poliuretan Dəri + Polad Çərçivə", "Qolaltı Qaldırma": "4D Tənzimlənən Qolaltılar", "Mexanizm Tipi": "170° Arxaya Əyilmə", "Zəmanət": "2 il rəsmi"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  model_name = EXCLUDED.model_name,
  brand = EXCLUDED.brand,
  brand_id = EXCLUDED.brand_id,
  cash_price = EXCLUDED.cash_price,
  old_price = EXCLUDED.old_price,
  stock = EXCLUDED.stock,
  category_id = EXCLUDED.category_id,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  is_active = EXCLUDED.is_active,
  is_new = EXCLUDED.is_new,
  discount = EXCLUDED.discount,
  attributes = EXCLUDED.attributes;

-- ═══════════════════════════════════════════════════
-- STORES, WAREHOUSES & WAREHOUSE STOCK SCHEMA & SEED DATA
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64),
  address TEXT,
  phone VARCHAR(64),
  hours VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stores (id, name, address, phone, hours, status) VALUES
('store-narimanov', 'TechnoMania Nərimanov Flaqman Mağazası', 'Bakı şəhəri, M. Nərimanov küç. 15', '*6060', '09:00 - 21:00', 'active'),
('store-28may', 'TechnoMania 28 May Mağazası', 'Bakı şəhəri, 28 May küç. 44', '*6060', '10:00 - 22:00', 'active'),
('store-ganclik', 'TechnoMania Gənclik Mall Mağazası', 'Bakı şəhəri, F.X.Xoyski küç. 14', '*6060', '10:00 - 22:00', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  status = EXCLUDED.status;

CREATE TABLE IF NOT EXISTS warehouses (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  store_id VARCHAR(64) REFERENCES stores(id) ON DELETE SET NULL,
  code VARCHAR(64),
  address TEXT,
  is_main BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouse_stock (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id VARCHAR(64) REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_product_warehouse UNIQUE(product_id, warehouse_id)
);

-- Seed Physical Warehouses (linked to Stores)
INSERT INTO warehouses (id, name, store_id, code, address, is_main, is_active) VALUES
('w-narimanov', 'Nərimanov Flaqman Mağazası Anbarı', 'store-narimanov', 'WH-NAR-01', 'Bakı şəhəri, M. Nərimanov küç. 15', TRUE, TRUE),
('w-28may', '28 May Mağazası Anbarı', 'store-28may', 'WH-28M-02', 'Bakı şəhəri, 28 May küç. 44', FALSE, TRUE),
('w-ganclik', 'Gənclik Mall Mağazası Anbarı', 'store-ganclik', 'WH-GNC-03', 'Bakı şəhəri, F.X.Xoyski küç. 14', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  store_id = EXCLUDED.store_id,
  code = EXCLUDED.code,
  address = EXCLUDED.address,
  is_main = EXCLUDED.is_main,
  is_active = EXCLUDED.is_active;

-- Seed Warehouse Stock per Product across the 3 Warehouses
INSERT INTO warehouse_stock (product_id, warehouse_id, quantity) VALUES
('p-apple-15promax', 'w-narimanov', 6),
('p-apple-15promax', 'w-28may', 5),
('p-apple-15promax', 'w-ganclik', 4),

('p-samsung-s24ultra', 'w-narimanov', 3),
('p-samsung-s24ultra', 'w-28may', 3),
('p-samsung-s24ultra', 'w-ganclik', 2),

('p-ipad-pro11', 'w-narimanov', 4),
('p-ipad-pro11', 'w-28may', 3),
('p-ipad-pro11', 'w-ganclik', 3),

('p-apple-watch-s9', 'w-narimanov', 5),
('p-apple-watch-s9', 'w-28may', 4),
('p-apple-watch-s9', 'w-ganclik', 3),

('p-macbook-pro16', 'w-narimanov', 2),
('p-macbook-pro16', 'w-28may', 2),
('p-macbook-pro16', 'w-ganclik', 1),

('p-asus-vivobook15', 'w-narimanov', 4),
('p-asus-vivobook15', 'w-28may', 3),
('p-asus-vivobook15', 'w-ganclik', 3),

('p-samsung-50tv', 'w-narimanov', 3),
('p-samsung-50tv', 'w-28may', 2),
('p-samsung-50tv', 'w-ganclik', 2),

('p-haier-coral12', 'w-narimanov', 3),
('p-haier-coral12', 'w-28may', 2),
('p-haier-coral12', 'w-ganclik', 1),

('p-lg-washer85', 'w-narimanov', 2),
('p-lg-washer85', 'w-28may', 2),
('p-lg-washer85', 'w-ganclik', 1),

('p-xiaomi-vacs10', 'w-narimanov', 5),
('p-xiaomi-vacs10', 'w-28may', 4),
('p-xiaomi-vacs10', 'w-ganclik', 3),

('p-ps5-slim', 'w-narimanov', 4),
('p-ps5-slim', 'w-28may', 3),
('p-ps5-slim', 'w-ganclik', 3),

('p-dyson-airwrap', 'w-narimanov', 3),
('p-dyson-airwrap', 'w-28may', 2),
('p-dyson-airwrap', 'w-ganclik', 2),

('p-xiaomi-scooter4pro', 'w-narimanov', 2),
('p-xiaomi-scooter4pro', 'w-28may', 2),
('p-xiaomi-scooter4pro', 'w-ganclik', 1),

('p-rayban-aviator', 'w-narimanov', 7),
('p-rayban-aviator', 'w-28may', 5),
('p-rayban-aviator', 'w-ganclik', 3),

('p-70mai-a500s', 'w-narimanov', 5),
('p-70mai-a500s', 'w-28may', 4),
('p-70mai-a500s', 'w-ganclik', 3),

('p-omron-m6', 'w-narimanov', 8),
('p-omron-m6', 'w-28may', 7),
('p-omron-m6', 'w-ganclik', 5),

('p-karcher-k5', 'w-narimanov', 2),
('p-karcher-k5', 'w-28may', 2),
('p-karcher-k5', 'w-ganclik', 1),

('p-cougar-armor-titan', 'w-narimanov', 2),
('p-cougar-armor-titan', 'w-28may', 2),
('p-cougar-armor-titan', 'w-ganclik', 2)
ON CONFLICT (product_id, warehouse_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  updated_at = CURRENT_TIMESTAMP;
