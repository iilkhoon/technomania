export interface Product {
  id: string;
  name: string;
  model_name?: string;
  brand: string;
  brand_id?: string | null;
  cash_price: number | string;
  old_price?: string | null;
  discount_price?: number | string | null;
  stock?: number;
  category_id?: string;
  category_name?: string;
  image?: string | null;
  images?: string[];
  colors?: any;
  is_active?: boolean;
  is_new?: boolean;
  is_online_only?: boolean;
  discount?: string | null;
  attributes?: Record<string, string>;
  specs?: Array<{ label: string; value: string }>;
  description?: string;
  created_at?: string | number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  full_slug?: string;
  icon?: string;
  icon_url?: string | null;
  description?: string;
  parent_id?: string | null;
  level?: number;
  is_top?: boolean;
  sort_order?: number;
  product_count?: number;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  position?: string;
  image: string;
  link?: string;
  active?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface OrderPayload {
  customer: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  notes?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  is_main?: boolean;
  location_url?: string;
}

export interface StorySlide {
  id: string;
  image: string;
  media_url?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  button_text?: string;
}

export interface MobileStory {
  id: string;
  title: string;
  image: string;
  media_url?: string;
  badge?: string;
  badge_color?: string;
  slides?: StorySlide[];
  link?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  surname?: string;
  father_name?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  fin_code?: string;
  id_serial?: string;
  birth_date?: string;
  workplace?: string;
  avatar_url?: string;
  is_vip?: boolean;
  created_at?: string;
  total_spent?: number;
  order_count?: number;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface CustomerFeedback {
  name: string;
  phone: string;
  email?: string;
  topic: string;
  message: string;
}
