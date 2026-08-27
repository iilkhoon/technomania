-- ═════════════════════════════════════════════════════════════════
--  TechnoMania ERP — Supabase PostgreSQL Schema Migration
-- ═════════════════════════════════════════════════════════════════

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100) DEFAULT 'Folder',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table with Dynamic JSONB Attributes
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255),
    brand VARCHAR(100) NOT NULL,
    cash_price NUMERIC(10, 2) NOT NULL,
    old_price NUMERIC(10, 2),
    discount_price NUMERIC(10, 2),
    stock INTEGER DEFAULT 0,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT FALSE,
    is_online_only BOOLEAN DEFAULT FALSE,
    discount VARCHAR(20),
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 4. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public all access on categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public all access on products" ON public.products FOR ALL USING (true);

-- 5. Seed Initial Categories
INSERT INTO public.categories (id, name, slug, icon, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'Smartfonlar', 'smartphones', 'Smartphone', 'Smartfonlar və aksessuarlar'),
('c2000000-0000-0000-0000-000000000002', 'Noutbuklar', 'laptops', 'Laptop', 'Noutbuklar, PC və planşetlər'),
('c3000000-0000-0000-0000-000000000003', 'TV & Audio', 'tv-audio', 'Tv', 'Televizorlar və audio sistemləri'),
('c4000000-0000-0000-0000-000000000004', 'Ev Texnikası', 'home-appliances', 'Home', 'Ev və məişət cihazları'),
('c5000000-0000-0000-0000-000000000005', 'Qəhvə Texnikası', 'coffee', 'Coffee', 'Espresso və kapsul qəhvə aparatları')
ON CONFLICT (slug) DO NOTHING;

-- 6. Seed Initial Products with Dynamic Attributes
INSERT INTO public.products (id, name, model_name, brand, cash_price, old_price, stock, category_id, image, is_active, discount, attributes) VALUES
('a1000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max 256GB Natural Titanium', 'iPhone 15 Pro Max 256GB', 'Apple', 2939.99, 3199.99, 15, 'c1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80', true, '-8%', '{"Yaddaş": "256 GB", "RAM": "8 GB", "Ekran Ölçüsü": "6.7\\" Super Retina", "Prosessor": "Apple A17 Pro"}'::jsonb),
('a2000000-0000-0000-0000-000000000002', 'Samsung Galaxy S24 Ultra 512GB Titanium Silver', 'Samsung Galaxy S24 Ultra 512GB', 'Samsung', 2759.99, 2999.99, 8, 'c1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80', true, '-8%', '{"Yaddaş": "512 GB", "RAM": "12 GB", "Ekran Ölçüsü": "6.8\\" Dynamic AMOLED", "Prosessor": "Snapdragon 8 Gen 3"}'::jsonb),
('a3000000-0000-0000-0000-000000000003', 'Noutbuk ASUS Vivobook 15X i5/16GB/512SSD', 'ASUS Vivobook 15X', 'ASUS', 1399.99, 1799.99, 12, 'c2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80', true, '-22%', '{"Prosessor": "Intel Core i5", "RAM": "16 GB", "SSD": "512 GB", "Ekran": "15.6\\" OLED"}'::jsonb),
('a4000000-0000-0000-0000-000000000004', 'Smart TV Samsung UE50CU7000UXRU 50" 4K Ultra HD', 'Samsung 50" 4K Smart TV', 'Samsung', 999.99, 1399.99, 5, 'c3000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', true, '-29%', '{"Ekran Diaqonalı": "50\\" (127 sm)", "Görüntü Keyfiyyəti": "4K Ultra HD", "Smart TV": "Bəli"}'::jsonb),
('a5000000-0000-0000-0000-000000000005', 'Robot tozsoran Xiaomi Robot Vacuum E10 White', 'Xiaomi Robot Vacuum E10', 'Xiaomi', 469.99, 599.99, 20, 'c4000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80', true, '-22%', '{"Növ": "Robot Tozsoran", "Sorma Gücü": "4000 Pa Turbo"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
