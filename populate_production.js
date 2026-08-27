const http = require('http');

// 15 Main Categories matching user's uploaded image
const categories = [
  { id: 'cat-1', name: 'Sərinlik dünyası', slug: 'serinlik-dunyasi', icon: 'Wind', description: 'Kondisionerlər, ventilyatorlar və hava nəmləndiriciləri', level: 1, sort_order: 1 },
  { id: 'cat-2', name: 'Günəş Stili', slug: 'gunes-stili', icon: 'Glasses', description: 'Klassik və idman günəş eynəkləri', level: 1, sort_order: 2 },
  { id: 'cat-3', name: 'Aktiv və sağlam yaşam', slug: 'aktiv-ve-saglam-yasam', icon: 'Dumbbell', description: 'Skuterlər, fitnes avadanlıqları və trekerlər', level: 1, sort_order: 3 },
  { id: 'cat-4', name: 'Smartfonlar və planşetlər', slug: 'smartphones', icon: 'Smartphone', description: 'Smartfonlar, planşetlər və aksessuarlar', level: 1, sort_order: 4 },
  { id: 'cat-5', name: 'Notbuklar və kompüter texnikası', slug: 'laptops-pc', icon: 'Laptop', description: 'Noutbuklar, kompyuterlər və komponentlər', level: 1, sort_order: 5 },
  { id: 'cat-6', name: 'Oyun konsolları və aksessuarlar', slug: 'gaming-consoles', icon: 'Gamepad2', description: 'PlayStation, Xbox, aksessuarlar və oyunlar', level: 1, sort_order: 6 },
  { id: 'cat-7', name: 'TV, audio və video', slug: 'tv-audio', icon: 'Tv', description: 'Televizorlar, soundbarlar və dinamiklər', level: 1, sort_order: 7 },
  { id: 'cat-8', name: 'Böyük məişət texnikası', slug: 'big-appliances', icon: 'HomeIcon', description: 'Soyuducular, paltaryuyanlar və dondurucular', level: 1, sort_order: 8 },
  { id: 'cat-9', name: 'Kiçik məişət texnikası', slug: 'small-appliances', icon: 'Coffee', description: 'Qəhvə maşınları, mikserlər və blenderlər', level: 1, sort_order: 9 },
  { id: 'cat-10', name: 'İqlim texnikası', slug: 'climate-tech', icon: 'Thermometer', description: 'Hava təmizləyicilər, qızdırıcılar və nəmləndiricilər', level: 1, sort_order: 10 },
  { id: 'cat-11', name: 'Gözəllik və baxım', slug: 'beauty-care', icon: 'Scissors', description: 'Fenlər, staylerlər və təraş aparatları', level: 1, sort_order: 11 },
  { id: 'cat-12', name: 'Avto və moto', slug: 'auto-moto', icon: 'Car', description: 'Videoqeydiyyatçılar, kompressorlar və aksessuarlar', level: 1, sort_order: 12 },
  { id: 'cat-13', name: 'Tibbi məhsulları', slug: 'medical-products', icon: 'Stethoscope', description: 'Təzyiq ölçənlər, tonometrlər və nebulayzerlər', level: 1, sort_order: 13 },
  { id: 'cat-14', name: 'Ev və bağ', slug: 'home-garden', icon: 'House', description: 'Otbiçənlər, yuma aparatları və bağ alətləri', level: 1, sort_order: 14 },
  { id: 'cat-15', name: 'Mebel, tekstil və dekor', slug: 'furniture-decor', icon: 'Armchair', description: 'Oyunçu kresloları, masaları və dekor', level: 1, sort_order: 15 }
];

// Brands
const brands = [
  { id: 'b-apple', name: 'Apple', slug: 'apple', is_popular: true },
  { id: 'b-samsung', name: 'Samsung', slug: 'samsung', is_popular: true },
  { id: 'b-xiaomi', name: 'Xiaomi', slug: 'xiaomi', is_popular: true },
  { id: 'b-asus', name: 'ASUS', slug: 'asus', is_popular: true },
  { id: 'b-sony', name: 'Sony', slug: 'sony', is_popular: true },
  { id: 'b-lg', name: 'LG', slug: 'lg', is_popular: true },
  { id: 'b-haier', name: 'Haier', slug: 'haier', is_popular: true },
  { id: 'b-bosch', name: 'Bosch', slug: 'bosch', is_popular: true },
  { id: 'b-dyson', name: 'Dyson', slug: 'dyson', is_popular: true },
  { id: 'b-delonghi', name: 'DeLonghi', slug: 'delonghi', is_popular: true },
  { id: 'b-rayban', name: 'Ray-Ban', slug: 'ray-ban', is_popular: true },
  { id: 'b-oakley', name: 'Oakley', slug: 'oakley', is_popular: false },
  { id: 'b-omron', name: 'Omron', slug: 'omron', is_popular: true },
  { id: 'b-karcher', name: 'Kärcher', slug: 'karcher', is_popular: true },
  { id: 'b-cougar', name: 'Cougar', slug: 'cougar', is_popular: true }
];

// 2 Real Products for each of the 15 categories (Total 30 Products)
const products = [
  // 1. Sərinlik dünyası
  {
    id: 'p101',
    name: 'Kondisioner Haier Coral 12000 BTU Inverter White',
    model_name: 'Haier Coral 12000 BTU Inverter',
    brand: 'Haier',
    cash_price: 849.99,
    old_price: 999.99,
    stock: 12,
    category_id: 'cat-1',
    category_name: 'Sərinlik dünyası',
    image: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-15%',
    attributes: { 'Təsir Sahəsi': '35-40 m²', 'Mühərrik': 'İnverter', 'Enerji Sinfi': 'A++' }
  },
  {
    id: 'p102',
    name: 'Ventilyator Midea FS40-16JA 40sm Taymerli Ağ',
    model_name: 'Midea FS40-16JA 40sm',
    brand: 'Midea',
    cash_price: 69.99,
    old_price: 89.99,
    stock: 25,
    category_id: 'cat-1',
    category_name: 'Sərinlik dünyası',
    image: 'https://images.unsplash.com/photo-1618941716939-553df3c6c276?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-22%',
    attributes: { 'Pər Ölçüsü': '40 sm', 'Güc': '45W', 'Sürət sayı': '3' }
  },

  // 2. Günəş Stili
  {
    id: 'p201',
    name: 'Günəş eynəyi Ray-Ban Aviator Classic RB3025 Gold/Green',
    model_name: 'Ray-Ban Aviator Classic RB3025',
    brand: 'Ray-Ban',
    cash_price: 329.99,
    old_price: 389.99,
    stock: 10,
    category_id: 'cat-2',
    category_name: 'Günəş Stili',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-15%',
    attributes: { 'Çərçivə Rəngi': 'Qızılı', 'Linza Rəngi': 'Yaşıl G-15', 'UV Qoruma': '100% UV400' }
  },
  {
    id: 'p202',
    name: 'Günəş eynəyi Oakley Holbrook Matte Black/Prizm Sapphire',
    model_name: 'Oakley Holbrook Prizm Sapphire',
    brand: 'Oakley',
    cash_price: 279.99,
    old_price: 329.99,
    stock: 8,
    category_id: 'cat-2',
    category_name: 'Günəş Stili',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-15%',
    attributes: { 'Çərçivə Rəngi': 'Mat Qara', 'Texnologiya': 'Prizm Sapphire Lens', 'Stil': 'Sport' }
  },

  // 3. Aktiv və sağlam yaşam
  {
    id: 'p301',
    name: 'Elektrikli skuter Xiaomi Electric Scooter 4 Pro 25km/h',
    model_name: 'Xiaomi Electric Scooter 4 Pro',
    brand: 'Xiaomi',
    cash_price: 1299.99,
    old_price: 1499.99,
    stock: 7,
    category_id: 'cat-3',
    category_name: 'Aktiv və sağlam yaşam',
    image: 'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-13%',
    attributes: { 'Maksimal Sürət': '25 km/saat', 'Məsafə': '55 km', 'Mühərrik': '700W Max' }
  },
  {
    id: 'p302',
    name: 'Ağıllı qaçış cığırı KingSmith WalkingPad R2 Inverter',
    model_name: 'KingSmith WalkingPad R2',
    brand: 'KingSmith',
    cash_price: 1199.99,
    old_price: 1399.99,
    stock: 5,
    category_id: 'cat-3',
    category_name: 'Aktiv və sağlam yaşam',
    image: 'https://images.unsplash.com/photo-1576678927484-cc909957088c?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-14%',
    attributes: { 'Konstruksiya': 'Qatlanan 180°', 'Maksimal Yük': '110 kq', 'Ekran': 'LED Sensor' }
  },

  // 4. Smartfonlar və planşetlər
  {
    id: 'p401',
    name: 'iPhone 15 Pro Max 256GB Natural Titanium',
    model_name: 'iPhone 15 Pro Max 256GB',
    brand: 'Apple',
    cash_price: 2939.99,
    old_price: 3199.99,
    stock: 15,
    category_id: 'cat-4',
    category_name: 'Smartfonlar və planşetlər',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-8%',
    attributes: { 'Yaddaş': '256 GB', 'RAM': '8 GB', 'Ekran': '6.7" Super Retina XDR', 'Prosessor': 'A17 Pro' }
  },
  {
    id: 'p402',
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium Silver',
    model_name: 'Samsung Galaxy S24 Ultra 512GB',
    brand: 'Samsung',
    cash_price: 2759.99,
    old_price: 2999.99,
    stock: 10,
    category_id: 'cat-4',
    category_name: 'Smartfonlar və planşetlər',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-8%',
    attributes: { 'Yaddaş': '512 GB', 'RAM': '12 GB', 'Ekran': '6.8" Dynamic AMOLED 2X', 'Prosessor': 'Snapdragon 8 Gen 3' }
  },

  // 5. Notbuklar və kompüter texnikası
  {
    id: 'p501',
    name: 'Apple MacBook Pro 14" M3 8GB/512GB Space Gray',
    model_name: 'MacBook Pro 14" M3',
    brand: 'Apple',
    cash_price: 3399.99,
    old_price: 3699.99,
    stock: 6,
    category_id: 'cat-5',
    category_name: 'Notbuklar və kompüter texnikası',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-8%',
    attributes: { 'Prosessor': 'Apple M3', 'RAM': '8 GB', 'SSD': '512 GB', 'Ekran': '14.2" Liquid Retina XDR' }
  },
  {
    id: 'p502',
    name: 'Noutbuk ASUS Vivobook 15X OLED i5/16GB/512SSD',
    model_name: 'ASUS Vivobook 15X OLED',
    brand: 'ASUS',
    cash_price: 1399.99,
    old_price: 1799.99,
    stock: 14,
    category_id: 'cat-5',
    category_name: 'Notbuklar və kompüter texnikası',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-22%',
    attributes: { 'Prosessor': 'Intel Core i5-13500H', 'RAM': '16 GB', 'SSD': '512 GB', 'Ekran': '15.6" Full HD OLED' }
  },

  // 6. Oyun konsolları və aksessuarlar
  {
    id: 'p601',
    name: 'PlayStation 5 Slim 1TB Digital Edition White',
    model_name: 'PlayStation 5 Slim 1TB',
    brand: 'Sony',
    cash_price: 1149.99,
    old_price: 1299.99,
    stock: 18,
    category_id: 'cat-6',
    category_name: 'Oyun konsolları və aksessuarlar',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-11%',
    attributes: { 'Yaddaş': '1 TB Custom SSD', 'Görüntü': '4K 120Hz', 'Pult': 'DualSense Wireless' }
  },
  {
    id: 'p602',
    name: 'Oyun kontroloru Sony DualSense Wireless White (PS5)',
    model_name: 'Sony DualSense Wireless Controller',
    brand: 'Sony',
    cash_price: 159.99,
    old_price: 189.99,
    stock: 30,
    category_id: 'cat-6',
    category_name: 'Oyun konsolları və aksessuarlar',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-15%',
    attributes: { 'Qoşulma': 'Bluetooth 5.1 / Type-C', 'Geribildirim': 'Haptic Feedback', 'Mikrofon': 'Daxili' }
  },

  // 7. TV, audio və video
  {
    id: 'p701',
    name: 'Smart TV Samsung 55" QLED 4K Q60C Smart TV',
    model_name: 'Samsung 55" QLED 4K Q60C',
    brand: 'Samsung',
    cash_price: 1599.99,
    old_price: 1999.99,
    stock: 9,
    category_id: 'cat-7',
    category_name: 'TV, audio və video',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-20%',
    attributes: { 'Ekran': '55" (139 sm)', 'Görüntü': '4K QLED Quantum Dot', 'Smart OS': 'Tizen OS' }
  },
  {
    id: 'p702',
    name: 'Soundbar LG S75Q 3.1.2 Dolby Atmos Səs Sistemi',
    model_name: 'LG S75Q 3.1.2 Soundbar',
    brand: 'LG',
    cash_price: 799.99,
    old_price: 999.99,
    stock: 7,
    category_id: 'cat-7',
    category_name: 'TV, audio və video',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-20%',
    attributes: { 'Kanal sayı': '3.1.2 ch', 'Ümumi Güc': '380W', 'Səs Texnologiyası': 'Dolby Atmos & DTS:X' }
  },

  // 8. Böyük məişət texnikası
  {
    id: 'p801',
    name: 'Soyuducu Haier Side-by-Side 518L NoFrost Silver',
    model_name: 'Haier Side-by-Side 518L',
    brand: 'Haier',
    cash_price: 2099.99,
    old_price: 2499.99,
    stock: 4,
    category_id: 'cat-8',
    category_name: 'Böyük məişət texnikası',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-16%',
    attributes: { 'Həcm': '518 Litr', 'Dondurma Sistemi': 'Total NoFrost', 'Mühərrik': 'Twin Inverter' }
  },
  {
    id: 'p802',
    name: 'Paltaryuyan Bosch Series 4 8kq 1200 RPM White',
    model_name: 'Bosch Series 4 8kq WAN24068BY',
    brand: 'Bosch',
    cash_price: 1199.99,
    old_price: 1399.99,
    stock: 8,
    category_id: 'cat-8',
    category_name: 'Böyük məişət texnikası',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-14%',
    attributes: { 'Yükləmə': '8 kq', 'Dövrə sürəti': '1200 RPM', 'Mühərrik': 'EcoSilence Drive Inverter' }
  },

  // 9. Kiçik məişət texnikası
  {
    id: 'p901',
    name: 'Qəhvə maşını DeLonghi Magnifica S Avtomatik Espresso',
    model_name: 'DeLonghi Magnifica S Espresso',
    brand: 'DeLonghi',
    cash_price: 999.99,
    old_price: 1299.99,
    stock: 11,
    category_id: 'cat-9',
    category_name: 'Kiçik məişət texnikası',
    image: 'https://images.unsplash.com/photo-1517668808822-9e428d052671?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-23%',
    attributes: { 'Təzyiq': '15 Bar', 'Üyütmə': 'Daxili Polad Üyüdücü', 'Köpükləndirmə': 'Manual Cappuccino' }
  },
  {
    id: 'p902',
    name: 'Aeroqril Philips XXL HD9650/90 Avtomatik Airfryer',
    model_name: 'Philips XXL HD9650/90 Airfryer',
    brand: 'Philips',
    cash_price: 549.99,
    old_price: 699.99,
    stock: 15,
    category_id: 'cat-9',
    category_name: 'Kiçik məişət texnikası',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-21%',
    attributes: { 'Tutum': '1.4 kq / 7 Porsiya', 'Texnologiya': 'Twin TurboStar Airfryer', 'Güc': '2225W' }
  },

  // 10. İqlim texnikası
  {
    id: 'p1001',
    name: 'Hava təmizləyici Xiaomi Smart Air Purifier 4 Pro',
    model_name: 'Xiaomi Smart Air Purifier 4 Pro',
    brand: 'Xiaomi',
    cash_price: 499.99,
    old_price: 599.99,
    stock: 10,
    category_id: 'cat-10',
    category_name: 'İqlim texnikası',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-16%',
    attributes: { 'Sahə': '35-60 m²', 'Süzgəc': 'HEPA H13', 'İdarəetmə': 'Mi Home App / OLED Touch' }
  },
  {
    id: 'p1002',
    name: 'Elektrik qızdırıcı Ballu Apollo Transformer 2000W Inverter',
    model_name: 'Ballu Apollo Transformer 2000W',
    brand: 'Ballu',
    cash_price: 199.99,
    old_price: 249.99,
    stock: 20,
    category_id: 'cat-10',
    category_name: 'İqlim texnikası',
    image: 'https://images.unsplash.com/photo-1607400201889-565b1e76f164?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-20%',
    attributes: { 'Güc': '2000W', 'İsitmə Sahəsi': '25 m²', 'Termostat': 'Rəqəmsal İnverter' }
  },

  // 11. Gözəllik və baxım
  {
    id: 'p1101',
    name: 'Fen-stayler Dyson Airwrap Multi-Styler Complete Long Nickel',
    model_name: 'Dyson Airwrap Multi-Styler Complete',
    brand: 'Dyson',
    cash_price: 1399.99,
    old_price: 1599.99,
    stock: 9,
    category_id: 'cat-11',
    category_name: 'Gözəllik və baxım',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-12.5%',
    attributes: { 'Mühərrik': 'Dyson V9 Digital', 'Effekt': 'Coanda Airflow System', 'Bölmələr': '6 Başlıq' }
  },
  {
    id: 'p1102',
    name: 'Təraş aparatı Braun Series 9 Pro 9417s Wet&Dry Silver',
    model_name: 'Braun Series 9 Pro 9417s',
    brand: 'Braun',
    cash_price: 649.99,
    old_price: 799.99,
    stock: 12,
    category_id: 'cat-11',
    category_name: 'Gözəllik və baxım',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-18%',
    attributes: { 'Təraş Texnologiyası': 'ProHead 5 Təraş Elementi', 'Davamlılıq': '100% Suya davamlı (Wet&Dry)' }
  },

  // 12. Avto və moto
  {
    id: 'p1201',
    name: 'Avtomobil videoqeydiyyatçısı 70mai Dash Cam A800S 4K GPS',
    model_name: '70mai Dash Cam A800S 4K',
    brand: '70mai',
    cash_price: 249.99,
    old_price: 299.99,
    stock: 16,
    category_id: 'cat-12',
    category_name: 'Avto və moto',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-16%',
    attributes: { 'Görüntü imkanı': '4K UHD 3840x2160', 'Sensor': 'Sony IMX415', 'Əlavələr': 'Daxili GPS & ADAS' }
  },
  {
    id: 'p1202',
    name: 'Akumulyator kompressoru Baseus Energy Source Inflator Pump',
    model_name: 'Baseus Energy Source Inflator Pump',
    brand: 'Baseus',
    cash_price: 89.99,
    old_price: 119.99,
    stock: 25,
    category_id: 'cat-12',
    category_name: 'Avto və moto',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-25%',
    attributes: { 'Batareya': '2000 mAh Li-Ion', 'Təzyiq': '150 PSI Max', 'Ekran': 'LED Avto-stop Display' }
  },

  // 13. Tibbi məhsulları
  {
    id: 'p1301',
    name: 'Tonometr Omron M3 Comfort Avtomatik Təzyiq Ölçən',
    model_name: 'Omron M3 Comfort',
    brand: 'Omron',
    cash_price: 159.99,
    old_price: 189.99,
    stock: 15,
    category_id: 'cat-13',
    category_name: 'Tibbi məhsulları',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-15%',
    attributes: { 'Manjet': 'Intelli Wrap Cuff 360°', 'Yaddaş': '2 x 60 Ölçmə', 'Indikator': 'Aritmiya İndikatoru' }
  },
  {
    id: 'p1302',
    name: 'İnhalyator Nebulayzer Beurer IH 26 Kompressorlu',
    model_name: 'Beurer IH 26 Kompressorlu',
    brand: 'Beurer',
    cash_price: 119.99,
    old_price: 149.99,
    stock: 12,
    category_id: 'cat-13',
    category_name: 'Tibbi məhsulları',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-20%',
    attributes: { 'Püskürtmə Sürəti': '0.3 ml/dəq', 'Təzyiq': '0.8 - 1.45 bar', 'Dəst': 'Uşaq və Böyük Maskanı' }
  },

  // 14. Ev və bağ
  {
    id: 'p1401',
    name: 'Otbiçən maşın Bosch ARM 32 Elektrikli 1200W',
    model_name: 'Bosch ARM 32 Elektrikli',
    brand: 'Bosch',
    cash_price: 299.99,
    old_price: 359.99,
    stock: 7,
    category_id: 'cat-14',
    category_name: 'Ev və bağ',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-16%',
    attributes: { 'Güc': '1200W', 'Kəsim Eni': '32 sm', 'Ot Qutusu': '31 Litr' }
  },
  {
    id: 'p1402',
    name: 'Yüksək təzyiqli yuma aparatı Kärcher K 5 Power Control',
    model_name: 'Kärcher K 5 Power Control',
    brand: 'Kärcher',
    cash_price: 749.99,
    old_price: 899.99,
    stock: 5,
    category_id: 'cat-14',
    category_name: 'Ev və bağ',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-16%',
    attributes: { 'Təzyiq': '145 Bar Max', 'Su Sərfi': '500 L/saat', 'Şlanq': '10 Metr High-Pressure' }
  },

  // 15. Mebel, tekstil və dekor
  {
    id: 'p1501',
    name: 'Oyunçu kreslosu Cougar Armor One Black/Orange Ergonomic',
    model_name: 'Cougar Armor One Gaming Chair',
    brand: 'Cougar',
    cash_price: 449.99,
    old_price: 529.99,
    stock: 10,
    category_id: 'cat-15',
    category_name: 'Mebel, tekstil və dekor',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    is_new: true,
    discount: '-15%',
    attributes: { 'Maksimal Yük': '120 kq', 'Meyillənmə': '180° Yatma bucağı', 'Material': 'Nəfəs alan PVC dəri' }
  },
  {
    id: 'p1502',
    name: 'Erqonomik oyun masası Cougar Mars Ergonomic RGB Gaming Desk',
    model_name: 'Cougar Mars RGB Gaming Desk',
    brand: 'Cougar',
    cash_price: 699.99,
    old_price: 799.99,
    stock: 6,
    category_id: 'cat-15',
    category_name: 'Mebel, tekstil və dekor',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80',
    is_active: true,
    discount: '-12.5%',
    attributes: { 'Ölçülər': '1533 x 771 mm', 'İşıqlandırma': 'Dual-sided RGB Sync', 'Əlavələr': 'USB 3.0 & Audio Hub' }
  }
];

const banners = [
  {
    id: 100,
    title: 'Möhtəşəm Kreditlə Telefon Sahibi Olmaq Daha Asan',
    subtitle: '0% ilkin ödəniş, 24 ayadək komissiyasız faizsiz hissə-hissə ödəniş fürsəti!',
    image: '/banners/technomania_credit_banner.png',
    position: 'hero_slide_1',
    positionLabel: 'Ana Səhifə (Sol Böyük)',
    dimensions: '870 x 460 px',
    ratio: '19:10',
    link: '#products-grid-section',
    active: true,
  },
  {
    id: 101,
    title: 'Xüsusi Yay Fürsətləri',
    subtitle: 'Bütün smartfon və aksessuarlara 24 ayadək komissiyasız faizsiz taksit!',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    position: 'hero_slide_1',
    positionLabel: 'Ana Səhifə (Sol Böyük)',
    dimensions: '870 x 460 px',
    ratio: '19:10',
    link: '#products-grid-section',
    active: true,
  },
  {
    id: 102,
    title: 'Noutbuklar & Qeyminq Modellər',
    subtitle: '0₼ ilkin ödənişlə 18 ayadək faizsiz rəsmi kredit!',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    position: 'hero_slide_2',
    positionLabel: 'Ana Səhifə (Sağ Dar)',
    dimensions: '300 x 460 px',
    ratio: '2:3',
    link: '#products-grid-section',
    active: true,
  },
  {
    id: 1,
    title: 'Mobil Smartfon Kampaniyası',
    subtitle: 'Rəsmi zəmanətlə Nağd və ya Hissə-hissə',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    position: 'mobile_top',
    positionLabel: 'Mobil Top Reklam Banneri',
    dimensions: '800 x 240 px',
    ratio: '10:3',
    link: '#products-grid-section',
    active: true,
  },
];

const stores = [
  {
    id: 'store-1',
    name: 'TechnoMania Flaiqman Mağaza (Nərimanov)',
    address: 'Bakı şəhəri, Nərimanov rayonu, Təbriz küç. 106B',
    phone: '+994 (12) 404-00-00',
    hours: 'B.e - B.: 09:00 - 21:00',
    isMain: true,
    status: 'active'
  },
  {
    id: 'store-2',
    name: 'TechnoMania 28 May Filialı',
    address: 'Bakı şəhəri, Nəsimi rayonu, 28 May küç. 44',
    phone: '+994 (12) 404-00-01',
    hours: 'B.e - B.: 10:00 - 22:00',
    isMain: false,
    status: 'active'
  }
];

function post(path, data) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/api/catalog/' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', (err) => resolve(err.message));
    req.write(payload);
    req.end();
  });
}

async function runSeed() {
  console.log('Seeding Categories, Brands, Products, Banners and Stores...');
  for (const c of categories) {
    await post('categories', c);
  }
  for (const b of brands) {
    await post('brands', b);
  }
  for (const p of products) {
    await post('products', p);
  }
  await post('banners', banners);
  await post('stores', stores);
  console.log('All Categories, Brands, Products, Banners and Stores populated successfully!');
}

runSeed();
