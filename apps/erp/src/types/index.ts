export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  logo_url?: string;
  is_popular?: boolean;
  description?: string;
  created_at?: string;
}

export interface CategorySpecFieldItem {
  name: string;
  has_price?: boolean;
  unit?: string;
}

export type CategorySpecField = string | CategorySpecFieldItem;

export interface Category {
  id: string;
  name: string;
  slug: string;
  full_slug?: string; // e.g. 'noutbuklar-komputerler-planshetler/komputer-aksesuarlar/noutbuklar-ucun-altliqlar'
  icon: string; // Lucide icon identifier e.g. 'Smartphone', 'Laptop', 'Tv'
  icon_url?: string; // Custom uploaded image URL for icon
  description?: string;
  parent_id?: string | null; // Nullable parent category ID for 3-level hierarchy
  level?: 1 | 2 | 3; // 1: Level 1 (Ana), 2: Level 2 (Qrup), 3: Level 3 (Brend/Növ)
  is_top?: boolean; // Show in "Top Kateqoriyalar" grid on homepage
  sort_order?: number; // Position order on left sidebar (1, 2, 3...)
  created_at?: string;
  product_count?: number;
  spec_fields?: CategorySpecField[]; // Filterable spec field names defined per category (e.g. ['RAM', { name: 'Yaddaş', has_price: true }])
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductStorageVariant {
  size: string;
  price: number;
  old_price?: number;
  cost_price?: number;
  stock?: number;
}

export interface ProductVideoItem {
  url: string;
  title?: string;
  type?: 'upload' | 'youtube';
  button_text?: string;
}

export interface Product {
  id: string;
  name: string; // e.g. 'iPhone 15 Pro Max 256GB'
  slug?: string; // URL-friendly identifier
  model_name?: string;
  brand: string;
  brand_id?: string;
  cost_price?: number;
  cash_price: number;
  old_price?: number;
  discount_price?: number;
  discount?: string;
  sku?: string;
  barcode?: string;
  stock: number;
  category_id: string;
  sub_category_id?: string;
  category_name?: string;
  campaign?: string; // Campaign name or ID the product belongs to
  image: string;
  images?: string[];
  is_active: boolean;
  is_new?: boolean;
  new_badge_until?: string; // ISO timestamp until which the "Yeni" badge is shown
  is_online_only?: boolean;
  attributes: Record<string, string>; // Dynamic JSON specs (e.g. { Yaddaş: '256 GB', RAM: '8 GB' })
  badge?: string; // Custom badge label text e.g. 'Hit Satış', 'Endirim 20%'
  badge_color?: string; // Custom badge background color e.g. '#ef4444'
  description?: string; // Detailed product description text
  video_url?: string; // Video review / YouTube / MP4 URL
  hasVideo?: boolean; // Video indicator flag
  youtube_video_url?: string; // Dedicated YouTube review URL
  youtube_button_text?: string; // Custom YouTube review button label
  videos?: ProductVideoItem[]; // Array of up to 2 videos
  storage_variants?: ProductStorageVariant[]; // Dynamic price storage variants
  bundled_product_ids?: string[]; // Array of associated bundled product IDs
  alternative_product_ids?: string[]; // Array of alternative product IDs
  service_ids?: string[]; // Array of assigned service IDs
  colors?: Array<{ name: string; hex: string; slug?: string; productId?: string }>; // Color variants with redirect links
  created_at?: string;
  updated_at?: string;
}

export interface ProductDraftData {
  name: string;
  slug?: string;
  brand?: string;
  mainCategoryId?: string;
  subCategoryId?: string;
  thirdCategoryId?: string;
  costPrice?: string;
  cashPrice?: string;
  oldPrice?: string;
  campaign?: string;
  isActive?: boolean;
  isNew?: boolean;
  badgeDurationDays?: number;
  description?: string;
  videoUrl?: string;
  youtubeVideoUrl?: string;
  youtubeButtonText?: string;
  videos?: ProductVideoItem[];
  storageVariants?: ProductStorageVariant[];
  imageList?: string[];
  specValues?: Record<string, string>;
  extraSpecs?: { key: string; value: string }[];
  badge?: string;
  badgeColor?: string;
  bundledProductIds?: string[];
}

export interface ProductDraft {
  id: string;
  title: string;
  saved_at: string;
  data: ProductDraftData;
}
