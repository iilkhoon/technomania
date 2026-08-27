-- Create custom types for user roles and statuses
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'cashier', 'creditor', 'warehouseman', 'accountant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory_status AS ENUM ('in_stock', 'reserved', 'sold', 'in_transit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE credit_status AS ENUM ('pending', 'ai_review', 'bokt_pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transfer_status AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Profiles (Users) Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    cash_price DECIMAL(12, 2) NOT NULL,
    credit_price DECIMAL(12, 2) NOT NULL,
    has_imei BOOLEAN DEFAULT false,
    has_serial BOOLEAN DEFAULT true,
    specs JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT NOT NULL,
    imei VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100),
    quantity INT DEFAULT 1,
    status inventory_status NOT NULL DEFAULT 'in_stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cashier_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    receipt_number VARCHAR(100) UNIQUE,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE RESTRICT NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(12, 2) NOT NULL
);

-- 8. Credit Applications
CREATE TABLE IF NOT EXISTS credit_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creditor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_pin VARCHAR(20) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    monthly_income DECIMAL(10, 2) NOT NULL,
    requested_months INT NOT NULL DEFAULT 12,
    documents JSONB DEFAULT '{}'::jsonb,
    status credit_status NOT NULL DEFAULT 'pending',
    ai_probability DECIMAL(5, 2),
    selected_bokt VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Stock Transfers Table
CREATE TABLE IF NOT EXISTS stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT NOT NULL,
    to_branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    status transfer_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE
);

-- 10. Stock Transfer Items
CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES stock_transfers(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE RESTRICT NOT NULL,
    quantity INT DEFAULT 1
);

-- Seed Categories
INSERT INTO categories (id, name, slug, icon) VALUES
('c1000000-0000-0000-0000-000000000001', 'Smartfonlar və Planşetlər', 'smartphones', 'smartphone'),
('c2000000-0000-0000-0000-000000000002', 'Noutbuklar və Kompüterlər', 'laptops', 'laptop'),
('c3000000-0000-0000-0000-000000000003', 'TV, Audio və Video', 'tv-audio', 'tv'),
('c4000000-0000-0000-0000-000000000004', 'Məişət Texnikası', 'appliances', 'home'),
('c5000000-0000-0000-0000-000000000005', 'Aksesuarlar və Qadcetlər', 'accessories', 'headphones')
ON CONFLICT (id) DO NOTHING;

-- Seed Branches
INSERT INTO branches (id, name, address) VALUES
('b1000000-0000-0000-0000-000000000001', 'TechnoMania Nizami (28 May)', 'Nizami küç. 142, Bakı'),
('b2000000-0000-0000-0000-000000000002', 'TechnoMania Xırdalan', 'Heydər Əliyev pr. 32, Xırdalan')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, category_id, model_name, brand, barcode, cash_price, credit_price, has_imei, has_serial, specs, image_url) VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max 256GB', 'Apple', '190199000001', 2899.00, 3199.00, true, true, '{"color": "Natural Titanium", "ram": "8GB", "storage": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80'),
('a2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'MacBook Pro 16 M3 Max 36GB', 'Apple', '190199000002', 6499.00, 7199.00, false, true, '{"cpu": "M3 Max", "ram": "36GB", "ssd": "1TB"}'::jsonb, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'),
('a3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 'Samsung OLED 65" 4K Smart TV', 'Samsung', '880609000003', 3899.00, 4299.00, false, true, '{"screen": "65 inch", "resolution": "4K OLED", "refresh_rate": "120Hz"}'::jsonb, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80'),
('a4000000-0000-0000-0000-000000000004', 'c4000000-0000-0000-0000-000000000004', 'LG Inverter Paltaryuyan 9kg', 'LG', '880609000004', 1299.00, 1449.00, false, true, '{"capacity": "9kg", "motor": "Inverter Direct Drive"}'::jsonb, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80'),
('a5000000-0000-0000-0000-000000000005', 'c5000000-0000-0000-0000-000000000005', 'Apple MagSafe Charger 20W', 'Apple', '190199000005', 79.00, 89.00, false, false, '{"power": "20W", "type": "Wireless"}'::jsonb, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (id) DO NOTHING;

-- Seed Inventory Items
INSERT INTO inventory_items (id, product_id, branch_id, imei, serial_number, quantity, status) VALUES
('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '358765123456781', 'SN-IPH15P-001', 1, 'in_stock'),
('d2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', NULL, 'SN-MBP16-9921', 1, 'in_stock'),
('d3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002', NULL, 'SN-SAMTV-4412', 1, 'in_stock'),
('d4000000-0000-0000-0000-000000000004', 'a4000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000002', NULL, 'SN-LGWASH-8812', 1, 'in_stock'),
('d5000000-0000-0000-0000-000000000005', 'a5000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', NULL, NULL, 50, 'in_stock')
ON CONFLICT (id) DO NOTHING;
