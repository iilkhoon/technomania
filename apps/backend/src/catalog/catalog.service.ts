import { Injectable, OnModuleInit, Optional, Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { SearchService } from '../search/search.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() private readonly searchService?: SearchService,
    @Optional() private readonly redisService?: RedisService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureTables();
    } catch (e) {
      console.error('Failed to initialize database tables:', e);
    }
  }

  async ensureTables() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        full_slug VARCHAR(500),
        icon VARCHAR(100),
        icon_url TEXT,
        description TEXT,
        parent_id VARCHAR(255),
        level INT DEFAULT 1,
        is_top BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 1,
        product_count INT DEFAULT 0,
        spec_fields JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS spec_fields JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        logo_url TEXT,
        is_popular BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model_name VARCHAR(255),
        brand VARCHAR(255) NOT NULL,
        brand_id VARCHAR(255),
        cash_price DECIMAL(10,2) NOT NULL,
        old_price DECIMAL(10,2),
        discount_price DECIMAL(10,2),
        stock INT DEFAULT 0,
        category_id VARCHAR(255),
        category_name VARCHAR(255),
        image TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_new BOOLEAN DEFAULT FALSE,
        is_online_only BOOLEAN DEFAULT FALSE,
        discount VARCHAR(50),
        attributes JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'main',
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        subtitle TEXT,
        position VARCHAR(100) DEFAULT 'hero_slide_1',
        position_label VARCHAR(255),
        dimensions VARCHAR(100),
        ratio VARCHAR(50),
        image TEXT,
        link TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS position VARCHAR(100) DEFAULT 'hero_slide_1';
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS position_label VARCHAR(255);
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS ratio VARCHAR(50);
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS link TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_url TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(255),
        hours VARCHAR(255),
        map_embed_url TEXT,
        google_maps_url TEXT,
        is_main BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        discount_type VARCHAR(50) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        usage_count INT DEFAULT 0,
        max_usage INT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255),
        product_name VARCHAR(255),
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        rating INT DEFAULT 5,
        comment TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255),
        product_name VARCHAR(255),
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255),
        question TEXT NOT NULL,
        answer TEXT,
        answered_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answered_at TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id VARCHAR(255) PRIMARY KEY,
        partner_id VARCHAR(255),
        partner_code VARCHAR(100) NOT NULL,
        partner_name VARCHAR(255),
        product_id VARCHAR(255),
        product_name VARCHAR(255),
        product_slug VARCHAR(255),
        target_url TEXT,
        tracking_url TEXT,
        clicks INT DEFAULT 0,
        leads_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer VARCHAR(255),
        phone VARCHAR(255),
        address TEXT,
        total DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Yeni',
        date VARCHAR(255),
        payment VARCHAR(255),
        items JSONB DEFAULT '[]'::jsonb,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        user_name VARCHAR(255) NOT NULL DEFAULT 'Sistem İnzibatçısı',
        user_role VARCHAR(100) NOT NULL DEFAULT 'Super Admin',
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255),
        entity_name VARCHAR(255),
        old_values JSONB DEFAULT '{}'::jsonb,
        new_values JSONB DEFAULT '{}'::jsonb,
        details TEXT NOT NULL,
        ip_address VARCHAR(100) DEFAULT '127.0.0.1',
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_name ON audit_logs(user_name);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS youtube_videos (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        youtube_url TEXT NOT NULL,
        video_id VARCHAR(100) NOT NULL,
        thumbnail_url TEXT,
        duration VARCHAR(50),
        views_count VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_video_url TEXT;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_button_text VARCHAR(255);`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS alternative_product_ids JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS bundled_product_ids JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS service_ids JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(255);`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50);`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS campaign VARCHAR(255);`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS new_badge_until TIMESTAMP;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_variants JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;`);
    await this.db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS fin VARCHAR(50);`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS id_card VARCHAR(100);`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code VARCHAR(100);`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(100) DEFAULT 'Standart';`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS installment_months INT;`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(10,2);`);
    await this.db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;`);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(50) NOT NULL DEFAULT 'Pulsuz',
        icon VARCHAR(50) DEFAULT '🛡️',
        description TEXT,
        duration VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        sort_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(100),
        email VARCHAR(255),
        address TEXT,
        country VARCHAR(100) DEFAULT 'Azərbaycan',
        tax_number VARCHAR(100),
        bank_details TEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS purchase_invoices (
        id VARCHAR(255) PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL,
        supplier_id VARCHAR(255),
        supplier_name VARCHAR(255),
        items JSONB DEFAULT '[]'::jsonb,
        total_amount NUMERIC(12, 2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'unpaid',
        payment_method VARCHAR(50) DEFAULT 'cash',
        is_draft BOOLEAN DEFAULT FALSE,
        notes TEXT,
        invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS warehouse_transfers (
        id VARCHAR(255) PRIMARY KEY,
        transfer_number VARCHAR(100) NOT NULL,
        from_warehouse_id VARCHAR(255),
        from_warehouse_name VARCHAR(255),
        to_warehouse_id VARCHAR(255),
        to_warehouse_name VARCHAR(255),
        items JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        image TEXT,
        author_name VARCHAR(255) NOT NULL DEFAULT 'Admin',
        author_role VARCHAR(255) DEFAULT 'Müəllif',
        author_avatar TEXT,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_published BOOLEAN DEFAULT TRUE,
        views_count INT DEFAULT 0,
        sort_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS legal_documents (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS homepage_layout (
        id VARCHAR(255) PRIMARY KEY,
        section_key VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        is_enabled BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 1,
        config JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS feature_badges (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        icon VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255),
        father_name VARCHAR(255),
        fin_code VARCHAR(50),
        id_serial VARCHAR(50),
        address TEXT,
        workplace TEXT,
        phone VARCHAR(50) NOT NULL,
        home_phone VARCHAR(50),
        extra_phone VARCHAR(50),
        email VARCHAR(255),
        password_hash TEXT,
        birth_date TEXT,
        status VARCHAR(50) DEFAULT 'active',
        credit_status VARCHAR(50) DEFAULT 'clean',
        total_spent DECIMAL(10,2) DEFAULT 0,
        order_count INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS customer_privileges (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100) DEFAULT 'Award',
        image_url TEXT,
        badge VARCHAR(100),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS customer_notifications (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target VARCHAR(100) DEFAULT 'all',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS erp_notifications (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        author_name VARCHAR(255) DEFAULT 'Rəhbərlik',
        priority VARCHAR(50) DEFAULT 'info',
        target_role VARCHAR(100) DEFAULT 'all',
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS mobile_stories (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        media_url TEXT,
        badge VARCHAR(100) DEFAULT '',
        badge_color VARCHAR(50) DEFAULT '#4f533b',
        slides JSONB DEFAULT '[]'::jsonb,
        link VARCHAR(500),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE mobile_stories ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50) DEFAULT '#4f533b';
      ALTER TABLE mobile_stories ADD COLUMN IF NOT EXISTS slides JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE mobile_stories ALTER COLUMN image TYPE TEXT;
      ALTER TABLE mobile_stories ALTER COLUMN media_url TYPE TEXT;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS customer_feedbacks (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        phone VARCHAR(100),
        email VARCHAR(255),
        topic VARCHAR(255) DEFAULT 'Təklif',
        message TEXT NOT NULL,
        source VARCHAR(50) DEFAULT 'mobile_app',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS pos_sales (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        customer_fin VARCHAR(50),
        sale_type VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        down_payment DECIMAL(10,2) DEFAULT 0,
        months INT DEFAULT 1,
        interest_rate DECIMAL(5,2) DEFAULT 0,
        monthly_payment DECIMAL(10,2) DEFAULT 0,
        payment_schedule JSONB DEFAULT '[]'::jsonb,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // High-performance B-Tree & GIN Indexes for fast filtering and 50,000+ products
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
      CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(category_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_products_active_brand ON products(brand, is_active);
      CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(is_active, cash_price);
      CREATE INDEX IF NOT EXISTS idx_products_active_created ON products(is_active, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_products_active_new ON products(is_active, is_new);
      CREATE INDEX IF NOT EXISTS idx_products_attributes_gin ON products USING gin(attributes);

      CREATE INDEX IF NOT EXISTS idx_categories_is_top ON categories(is_top);
      CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
      CREATE INDEX IF NOT EXISTS idx_brands_is_popular ON brands(is_popular);

      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_pos_sales_created_at ON pos_sales(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_pos_sales_customer_phone ON pos_sales(customer_phone);

      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_customers_fin ON customers(fin_code);

      CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
      CREATE INDEX IF NOT EXISTS idx_faqs_product_id ON faqs(product_id);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        store_id VARCHAR(255),
        code VARCHAR(50),
        address TEXT,
        is_main BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS warehouse_stock (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        warehouse_id VARCHAR(255) NOT NULL,
        quantity INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, warehouse_id)
      );
      INSERT INTO warehouses (id, name, code, is_main, is_active)
      VALUES ('main', 'Mərkəzi Anbar', 'WH-MAIN', true, true)
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // Orders
  async getOrders() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return res.rows;
  }

  async saveOrder(order: any) {
    await this.ensureTables();
    const id = order.id || 'TM-' + Math.floor(100000 + Math.random() * 900000);
    const itemsJson = JSON.stringify(order.items || []);
    const extraDataJson = JSON.stringify(order.extra_data || order.extraData || {});
    await this.db.query(`
      INSERT INTO orders (
        id, customer, phone, address, total, status, date, payment, items, notes,
        fin, id_card, promo_code, order_type, installment_months, monthly_payment, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        customer = EXCLUDED.customer,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        total = EXCLUDED.total,
        status = EXCLUDED.status,
        payment = EXCLUDED.payment,
        items = EXCLUDED.items,
        notes = EXCLUDED.notes,
        fin = EXCLUDED.fin,
        id_card = EXCLUDED.id_card,
        promo_code = EXCLUDED.promo_code,
        order_type = EXCLUDED.order_type,
        installment_months = EXCLUDED.installment_months,
        monthly_payment = EXCLUDED.monthly_payment,
        extra_data = EXCLUDED.extra_data
    `, [
      id,
      order.customer || order.customerName || 'Müştəri',
      order.phone || order.customerPhone || '',
      order.address || '',
      order.total || order.totalAmount || 0,
      order.status || 'Yeni',
      order.date || new Date().toISOString(),
      order.payment || order.paymentMethod || 'Nağd',
      itemsJson,
      order.notes || '',
      order.fin || order.finCode || null,
      order.id_card || order.idCard || order.idCardSerial || null,
      order.promo_code || order.promoCode || null,
      order.order_type || order.orderType || 'Standart',
      order.installment_months || order.months || null,
      order.monthly_payment || order.monthlyPayment || null,
      extraDataJson
    ]);
    return { success: true, id };
  }

  async updateOrderStatus(id: string, status: string) {
    await this.ensureTables();
    await this.db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    return { success: true };
  }

  async deleteOrder(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM orders WHERE id = $1', [id]);
    return { success: true };
  }

  async clearAllOrders() {
    await this.ensureTables();
    await this.db.query('DELETE FROM orders');
    return { success: true };
  }

  // Categories
  async getCategories() {
    if (this.redisService) {
      const cached = await this.redisService.get('catalog:categories');
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }
    const res = await this.db.query('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
    if (this.redisService && res.rows) {
      await this.redisService.set('catalog:categories', JSON.stringify(res.rows), 300);
    }
    return res.rows;
  }

  async saveCategory(cat: any) {
    const id = cat.id || 'c' + Date.now();
    const specFieldsJson = JSON.stringify(cat.spec_fields || []);
    await this.db.query(`
      INSERT INTO categories (id, name, slug, full_slug, icon, icon_url, description, parent_id, level, is_top, sort_order, product_count, spec_fields)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        full_slug = EXCLUDED.full_slug,
        icon = EXCLUDED.icon,
        icon_url = EXCLUDED.icon_url,
        description = EXCLUDED.description,
        parent_id = EXCLUDED.parent_id,
        level = EXCLUDED.level,
        is_top = EXCLUDED.is_top,
        sort_order = EXCLUDED.sort_order,
        product_count = EXCLUDED.product_count,
        spec_fields = EXCLUDED.spec_fields
    `, [id, cat.name, cat.slug, cat.full_slug || cat.slug, cat.icon || 'Folder', cat.icon_url || null, cat.description || null, cat.parent_id || null, cat.level || 1, cat.is_top ?? true, cat.sort_order || 1, cat.product_count || 0, specFieldsJson]);
    if (this.redisService) {
      await this.redisService.delByPattern('catalog:*');
    }
    return { success: true, id };
  }

  async deleteCategory(id: string) {
    await this.db.query('DELETE FROM categories WHERE id = $1 OR parent_id = $1', [id]);
    if (this.redisService) {
      await this.redisService.delByPattern('catalog:*');
    }
    return { success: true };
  }

  // Brands
  async getBrands() {
    if (this.redisService) {
      const cached = await this.redisService.get('catalog:brands');
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }
    const res = await this.db.query('SELECT * FROM brands ORDER BY name ASC');
    if (this.redisService && res.rows) {
      await this.redisService.set('catalog:brands', JSON.stringify(res.rows), 300);
    }
    return res.rows;
  }

  async saveBrand(brand: any) {
    const id = brand.id || 'b' + Date.now();
    await this.db.query(`
      INSERT INTO brands (id, name, slug, logo_url, is_popular, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        logo_url = EXCLUDED.logo_url,
        is_popular = EXCLUDED.is_popular,
        description = EXCLUDED.description
    `, [id, brand.name, brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-'), brand.logo_url || null, brand.is_popular ?? true, brand.description || null]);
    if (this.redisService) {
      await this.redisService.delByPattern('catalog:*');
    }
    return { success: true, id };
  }

  // Products
  async getProducts() {
    if (this.redisService) {
      const cached = await this.redisService.get('catalog:products');
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }
    await this.ensureTables();
    const res = await this.db.query(`
      SELECT p.*,
        GREATEST(COALESCE(ws_sum.total_stock, 0), COALESCE(p.stock, 0))::int AS stock
      FROM products p
      LEFT JOIN (
        SELECT product_id, SUM(quantity) AS total_stock
        FROM warehouse_stock
        GROUP BY product_id
      ) ws_sum ON p.id = ws_sum.product_id
      ORDER BY p.created_at DESC
    `);
    if (this.redisService && res.rows) {
      await this.redisService.set('catalog:products', JSON.stringify(res.rows), 120);
    }
    return res.rows;
  }

  async saveProduct(prod: any) {
    const id = prod.id || 'a' + Date.now();
    const attrsJson = JSON.stringify(prod.attributes || {});
    const imagesJson = JSON.stringify(Array.isArray(prod.images) ? prod.images : (prod.image ? [prod.image] : []));
    const colorsJson = JSON.stringify(Array.isArray(prod.colors) ? prod.colors : []);
    const altIdsJson = JSON.stringify(Array.isArray(prod.alternative_product_ids) ? prod.alternative_product_ids : []);
    const bundleIdsJson = JSON.stringify(Array.isArray(prod.bundled_product_ids) ? prod.bundled_product_ids : []);
    const serviceIdsJson = JSON.stringify(Array.isArray(prod.service_ids) ? prod.service_ids : []);
    const storageVariantsJson = JSON.stringify(Array.isArray(prod.storage_variants) ? prod.storage_variants : (Array.isArray(prod.variants) ? prod.variants : []));
    const videosJson = JSON.stringify(Array.isArray(prod.videos) ? prod.videos : []);

    await this.ensureTables();
    await this.db.query(`
      INSERT INTO products (
        id, name, model_name, brand, brand_id, cash_price, old_price, discount_price, 
        stock, category_id, category_name, image, is_active, is_new, is_online_only, 
        discount, attributes, images, colors, alternative_product_ids, bundled_product_ids,
        service_ids, description, video_url, youtube_video_url, youtube_button_text, badge, badge_color,
        slug, cost_price, campaign, new_badge_until, storage_variants, videos, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33::jsonb, $34::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_name = EXCLUDED.model_name,
        brand = EXCLUDED.brand,
        brand_id = EXCLUDED.brand_id,
        cash_price = EXCLUDED.cash_price,
        old_price = EXCLUDED.old_price,
        discount_price = EXCLUDED.discount_price,
        stock = EXCLUDED.stock,
        category_id = EXCLUDED.category_id,
        category_name = EXCLUDED.category_name,
        image = EXCLUDED.image,
        is_active = EXCLUDED.is_active,
        is_new = EXCLUDED.is_new,
        is_online_only = EXCLUDED.is_online_only,
        discount = EXCLUDED.discount,
        attributes = EXCLUDED.attributes,
        images = EXCLUDED.images,
        colors = EXCLUDED.colors,
        alternative_product_ids = EXCLUDED.alternative_product_ids,
        bundled_product_ids = EXCLUDED.bundled_product_ids,
        service_ids = EXCLUDED.service_ids,
        description = EXCLUDED.description,
        video_url = EXCLUDED.video_url,
        youtube_video_url = EXCLUDED.youtube_video_url,
        youtube_button_text = EXCLUDED.youtube_button_text,
        badge = EXCLUDED.badge,
        badge_color = EXCLUDED.badge_color,
        slug = EXCLUDED.slug,
        cost_price = EXCLUDED.cost_price,
        campaign = EXCLUDED.campaign,
        new_badge_until = EXCLUDED.new_badge_until,
        storage_variants = EXCLUDED.storage_variants,
        videos = EXCLUDED.videos,
        updated_at = CURRENT_TIMESTAMP
    `, [
      id,
      prod.name,
      prod.model_name || prod.name,
      prod.brand,
      prod.brand_id || null,
      prod.cash_price,
      prod.old_price || null,
      prod.discount_price || null,
      prod.stock || 0,
      prod.category_id || null,
      prod.category_name || null,
      prod.image || (Array.isArray(prod.images) && prod.images[0]) || null,
      prod.is_active ?? true,
      prod.is_new ?? false,
      prod.is_online_only ?? false,
      prod.discount || null,
      attrsJson,
      imagesJson,
      colorsJson,
      altIdsJson,
      bundleIdsJson,
      serviceIdsJson,
      prod.description || null,
      prod.video_url || null,
      prod.youtube_video_url || null,
      prod.youtube_button_text || 'Video İcmala Bax',
      prod.badge || null,
      prod.badge_color || null,
      prod.slug || null,
      prod.cost_price || null,
      prod.campaign || null,
      prod.new_badge_until || null,
      storageVariantsJson,
      videosJson,
    ]);
    
    // Sync to Meilisearch in background
    if (this.searchService) {
      this.searchService.indexProduct({ ...prod, id, attributes: prod.attributes || {} }).catch(() => {});
    }

    if (this.redisService) {
      await this.redisService.delByPattern('catalog:*');
    }

    return { success: true, id };
  }

  async deleteProduct(id: string) {
    await this.db.query('DELETE FROM products WHERE id = $1', [id]);
    if (this.searchService) {
      this.searchService.deleteProduct(id).catch(() => {});
    }
    if (this.redisService) {
      await this.redisService.delByPattern('catalog:*');
    }
    return { success: true };
  }

  async updateStock(id: string, stock: number) {
    await this.ensureTables();
    await this.db.query('UPDATE products SET stock = $1 WHERE id = $2', [stock, id]);
    return { success: true, id, stock };
  }

  // Warehouses Management
  async getWarehouses() {
    await this.ensureTables();
    const res = await this.db.query(`
      SELECT w.*, s.name AS store_name
      FROM warehouses w
      LEFT JOIN stores s ON w.store_id = s.id
      ORDER BY w.is_main DESC, w.name ASC
    `);
    return res.rows;
  }

  async saveWarehouse(w: any) {
    await this.ensureTables();
    const id = w.id || 'w-' + Date.now();
    await this.db.query(`
      INSERT INTO warehouses (id, name, store_id, code, address, is_main, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        store_id = EXCLUDED.store_id,
        code = EXCLUDED.code,
        address = EXCLUDED.address,
        is_main = EXCLUDED.is_main,
        is_active = EXCLUDED.is_active
    `, [id, w.name, w.store_id || null, w.code || null, w.address || null, w.is_main ?? false, w.is_active ?? true]);
    return { success: true, id };
  }

  async deleteWarehouse(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM warehouses WHERE id = $1', [id]);
    return { success: true };
  }

  // Warehouse Stock Management
  async getWarehouseStock(warehouseId?: string) {
    await this.ensureTables();
    let query = `
      SELECT ws.*, p.name AS product_name, p.model_name, p.brand, p.cash_price, p.image, w.name AS warehouse_name
      FROM warehouse_stock ws
      JOIN products p ON ws.product_id = p.id
      JOIN warehouses w ON ws.warehouse_id = w.id
    `;
    const params: any[] = [];
    if (warehouseId) {
      query += ` WHERE ws.warehouse_id = $1`;
      params.push(warehouseId);
    }
    query += ` ORDER BY p.name ASC`;
    const res = await this.db.query(query, params);
    return res.rows;
  }

  async updateProductWarehouseStock(productId: string, warehouseId: string, quantity: number) {
    await this.ensureTables();
    await this.db.query(`
      INSERT INTO warehouse_stock (product_id, warehouse_id, quantity, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (product_id, warehouse_id) DO UPDATE SET
        quantity = EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
    `, [productId, warehouseId, Math.max(0, quantity)]);

    // Recalculate total product stock across all warehouses
    const totalRes = await this.db.query(`
      SELECT SUM(quantity)::int AS total_stock
      FROM warehouse_stock
      WHERE product_id = $1
    `, [productId]);
    const totalStock = totalRes.rows[0]?.total_stock || 0;

    // Update main product table stock
    await this.db.query(`UPDATE products SET stock = $1 WHERE id = $2`, [totalStock, productId]);

    return { success: true, productId, warehouseId, quantity, totalStock };
  }

  // Site Settings
  async getSettings() {
    await this.ensureTables();
    const res = await this.db.query("SELECT data FROM site_settings WHERE id = 'main'");
    if (res.rows.length > 0) return res.rows[0].data;
    return {};
  }

  async saveSettings(data: any) {
    await this.ensureTables();
    await this.db.query(`
      INSERT INTO site_settings (id, data, updated_at)
      VALUES ('main', $1::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(data)]);
    return { success: true };
  }

  // Banners
  async getBanners() {
    await this.ensureTables();
    try {
      const res = await this.db.query('SELECT * FROM banners ORDER BY created_at DESC');
      return res.rows.map(r => ({
        ...r,
        image: r.image || r.image_url || '',
        image_url: r.image_url || r.image || '',
        link: r.link || r.link_url || '',
        link_url: r.link_url || r.link || '',
      }));
    } catch (e) {
      const res = await this.db.query('SELECT * FROM banners');
      return res.rows.map(r => ({
        ...r,
        image: r.image || r.image_url || '',
        image_url: r.image_url || r.image || '',
        link: r.link || r.link_url || '',
        link_url: r.link_url || r.link || '',
      }));
    }
  }

  async saveBanners(banners: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM banners');
    if (Array.isArray(banners)) {
      for (const b of banners) {
        const id = String(b.id || Date.now());
        const img = b.image || b.image_url || '';
        const lnk = b.link || b.link_url || null;
        await this.db.query(`
          INSERT INTO banners (id, title, subtitle, position, position_label, dimensions, ratio, image, image_url, link, link_url, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [id, b.title || null, b.subtitle || null, b.position || 'hero_slide_1', b.positionLabel || null, b.dimensions || null, b.ratio || null, img, img, lnk, lnk, b.active ?? true]);
      }
    }
    return { success: true };
  }

  // Stores
  async getStores() {
    await this.ensureTables();
    const res = await this.db.query('SELECT id, name, address, phone, hours, map_embed_url as "mapEmbedUrl", google_maps_url as "googleMapsUrl", is_main as "isMain", status FROM stores ORDER BY created_at ASC');
    return res.rows;
  }

  async saveStores(stores: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM stores');
    if (Array.isArray(stores)) {
      for (const s of stores) {
        const id = String(s.id || 'store-' + Date.now());
        await this.db.query(`
          INSERT INTO stores (id, name, address, phone, hours, map_embed_url, google_maps_url, is_main, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [id, s.name, s.address || '', s.phone || '', s.hours || '', s.mapEmbedUrl || s.map_embed_url || '', s.googleMapsUrl || s.google_maps_url || '', s.isMain ?? s.is_main ?? false, s.status || 'active']);
      }
    }
    return { success: true };
  }

  // Coupons
  async getCoupons() {
    await this.ensureTables();
    const res = await this.db.query('SELECT id, code, discount_type as "discountType", discount_value::float as "discountValue", min_order_amount::float as "minOrderAmount", usage_count as "usageCount", max_usage as "maxUsage", start_date as "startDate", end_date as "endDate", status, created_at as "createdAt" FROM coupons ORDER BY created_at DESC');
    return res.rows;
  }

  async saveCoupons(coupons: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM coupons');
    if (Array.isArray(coupons)) {
      for (const c of coupons) {
        const id = String(c.id || 'coup-' + Date.now());
        await this.db.query(`
          INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, usage_count, max_usage, start_date, end_date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [id, String(c.code).toUpperCase(), c.discountType || c.discount_type || 'percent', c.discountValue ?? c.discount_value ?? 0, c.minOrderAmount ?? c.min_order_amount ?? 0, c.usageCount ?? c.usage_count ?? 0, c.maxUsage || c.max_usage || null, c.startDate || c.start_date || null, c.endDate || c.end_date || null, c.status || 'active']);
      }
    }
    return { success: true };
  }

  // Reviews
  async getReviews() {
    await this.ensureTables();
    const res = await this.db.query('SELECT id, product_id, product_name, user_name, user_email, rating, comment, status, created_at FROM reviews ORDER BY created_at DESC');
    return res.rows;
  }

  async saveReviews(reviews: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM reviews');
    if (Array.isArray(reviews)) {
      for (const r of reviews) {
        const id = String(r.id || 'rev-' + Date.now());
        await this.db.query(`
          INSERT INTO reviews (id, product_id, product_name, user_name, user_email, rating, comment, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, r.product_id || null, r.product_name || null, r.user_name, r.user_email || null, r.rating || 5, r.comment || '', r.status || 'pending']);
      }
    }
    return { success: true };
  }

  // FAQs
  async getFaqs() {
    await this.ensureTables();
    const res = await this.db.query('SELECT id, product_id, product_name, author_name, author_email, question, answer, answered_by, created_at, answered_at FROM faqs ORDER BY created_at DESC');
    return res.rows;
  }

  async saveFaqs(faqs: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM faqs');
    if (Array.isArray(faqs)) {
      for (const f of faqs) {
        const id = String(f.id || 'faq-' + Date.now());
        await this.db.query(`
          INSERT INTO faqs (id, product_id, product_name, author_name, author_email, question, answer, answered_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, f.product_id || null, f.product_name || null, f.author_name, f.author_email || null, f.question, f.answer || null, f.answered_by || null]);
      }
    }
    return { success: true };
  }

  // Affiliates
  async getAffiliates() {
    await this.ensureTables();
    const res = await this.db.query('SELECT id, partner_id, partner_code, partner_name, product_id, product_name, product_slug, target_url, tracking_url, clicks, leads_count, created_at FROM affiliates ORDER BY created_at DESC');
    return res.rows;
  }

  async saveAffiliates(links: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM affiliates');
    if (Array.isArray(links)) {
      for (const l of links) {
        const id = String(l.id || 'link-' + Date.now());
        await this.db.query(`
          INSERT INTO affiliates (id, partner_id, partner_code, partner_name, product_id, product_name, product_slug, target_url, tracking_url, clicks, leads_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [id, l.partner_id || null, l.partner_code, l.partner_name || null, l.product_id || null, l.product_name || null, l.product_slug || null, l.target_url || '', l.tracking_url || '', l.clicks || 0, l.leads_count || 0]);
      }
    }
    return { success: true };
  }

  // Media Gallery
  async getMedia() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM media_gallery ORDER BY created_at DESC');
    return res.rows;
  }

  async saveMedia(mediaItem: any) {
    await this.ensureTables();
    const id = mediaItem.id || 'media-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
    const name = mediaItem.name || 'Şəkil ' + new Date().toLocaleDateString('az-AZ');
    const url = mediaItem.url || mediaItem.image;
    if (!url) return { success: false, error: 'URL or Base64 content required' };

    await this.db.query(`
      INSERT INTO media_gallery (id, name, url)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url
    `, [id, name, url]);

    return { success: true, id, name, url };
  }

  async deleteMedia(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM media_gallery WHERE id = $1', [id]);
    return { success: true };
  }

  // YouTube Videos
  async getVideos() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM youtube_videos ORDER BY sort_order ASC, created_at DESC');
    return res.rows;
  }

  async saveVideos(videos: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM youtube_videos');
    if (Array.isArray(videos)) {
      for (const v of videos) {
        const id = String(v.id || 'yt-' + Date.now());
        await this.db.query(`
          INSERT INTO youtube_videos (id, title, youtube_url, video_id, thumbnail_url, duration, views_count, is_active, sort_order, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          id,
          v.title || '',
          v.youtube_url || v.youtubeUrl || '',
          v.video_id || v.videoId || '',
          v.thumbnail_url || v.thumbnailUrl || null,
          v.duration || null,
          v.views_count || v.viewsCount || null,
          v.is_active ?? v.isActive ?? true,
          v.sort_order ?? v.sortOrder ?? 1,
          v.created_at || new Date().toISOString()
        ]);
      }
    }
    return { success: true };
  }

  // News Articles
  async getNews() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM news_articles ORDER BY sort_order ASC, published_at DESC');
    return res.rows;
  }

  async getNewsBySlug(slug: string) {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM news_articles WHERE slug = $1', [slug]);
    return res.rows[0] || null;
  }

  async saveNews(article: any) {
    await this.ensureTables();
    const id = article.id || 'news-' + Date.now();
    const slug = (article.slug || article.title || 'news')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    await this.db.query(`
      INSERT INTO news_articles (id, title, slug, excerpt, content, image, author_name, author_role, author_avatar, published_at, is_published, views_count, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        image = EXCLUDED.image,
        author_name = EXCLUDED.author_name,
        author_role = EXCLUDED.author_role,
        author_avatar = EXCLUDED.author_avatar,
        published_at = EXCLUDED.published_at,
        is_published = EXCLUDED.is_published,
        views_count = EXCLUDED.views_count,
        sort_order = EXCLUDED.sort_order
    `, [
      id,
      article.title,
      slug,
      article.excerpt || '',
      article.content || '',
      article.image || null,
      article.author_name || article.authorName || 'TechnoMania Redaksiya',
      article.author_role || article.authorRole || 'Texno İcmalçı',
      article.author_avatar || article.authorAvatar || null,
      article.published_at || article.publishedAt || new Date().toISOString(),
      article.is_published ?? article.isPublished ?? true,
      article.views_count ?? article.viewsCount ?? 0,
      article.sort_order ?? article.sortOrder ?? 1
    ]);
    return { success: true, id, slug };
  }

  async deleteNews(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM news_articles WHERE id = $1', [id]);
    return { success: true };
  }

  // Newsletter Subscribers
  async getSubscribers() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    return res.rows;
  }

  async addSubscriber(email: string) {
    await this.ensureTables();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Düzgün email daxil edin' };
    }
    const id = 'sub-' + Date.now();
    await this.db.query(`
      INSERT INTO newsletter_subscribers (id, email, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT (email) DO NOTHING
    `, [id, cleanEmail]);
    return { success: true, email: cleanEmail };
  }

  async deleteSubscriber(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM newsletter_subscribers WHERE id = $1', [id]);
    return { success: true };
  }

  // Legal Documents
  async getLegalDocuments() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM legal_documents ORDER BY category ASC, title ASC');
    return res.rows;
  }

  async getLegalDocumentBySlug(slug: string) {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM legal_documents WHERE slug = $1', [slug]);
    return res.rows[0] || null;
  }

  async saveLegalDocument(doc: any) {
    await this.ensureTables();
    const id = doc.id || 'doc-' + Date.now();
    const slug = doc.slug || 'privacy';
    await this.db.query(`
      INSERT INTO legal_documents (id, slug, title, category, content, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        content = EXCLUDED.content,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
    `, [
      id,
      slug,
      doc.title,
      doc.category || 'Müqavilə',
      doc.content || '',
      doc.is_active ?? doc.isActive ?? true
    ]);
    return { success: true, id, slug };
  }

  // Homepage Layout
  async getHomepageLayout() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM homepage_layout ORDER BY sort_order ASC');
    return res.rows;
  }

  async saveHomepageLayout(sections: any[]) {
    await this.ensureTables();
    if (Array.isArray(sections)) {
      for (const s of sections) {
        const id = String(s.id || 'sec-' + s.section_key);
        await this.db.query(`
          INSERT INTO homepage_layout (id, section_key, title, subtitle, is_enabled, sort_order, config, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (section_key) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            is_enabled = EXCLUDED.is_enabled,
            sort_order = EXCLUDED.sort_order,
            config = EXCLUDED.config,
            updated_at = CURRENT_TIMESTAMP
        `, [
          id,
          s.section_key || s.sectionKey,
          s.title || '',
          s.subtitle || '',
          s.is_enabled ?? s.isEnabled ?? true,
          s.sort_order ?? s.sortOrder ?? 1,
          JSON.stringify(s.config || {})
        ]);
      }
    }
    return { success: true };
  }

  // Feature Badges (Top 4 Badges)
  async getBadges() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM feature_badges ORDER BY sort_order ASC, created_at ASC');
    return res.rows;
  }

  async saveBadges(badges: any[]) {
    await this.ensureTables();
    await this.db.query('DELETE FROM feature_badges');
    if (Array.isArray(badges)) {
      for (const b of badges) {
        const id = String(b.id || 'badge-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5));
        await this.db.query(`
          INSERT INTO feature_badges (id, title, subtitle, icon, is_active, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          id,
          b.title,
          b.subtitle || '',
          b.icon || 'Truck',
          b.is_active ?? b.isActive ?? true,
          b.sort_order ?? b.sortOrder ?? 1
        ]);
      }
    }
    return { success: true };
  }

  // Customers
  async getCustomers() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM customers ORDER BY created_at DESC');
    return res.rows;
  }

  async saveCustomer(c: any) {
    await this.ensureTables();
    const id = c.id || 'cust-' + Date.now();
    await this.db.query(`
      INSERT INTO customers (id, name, surname, father_name, fin_code, id_serial, address, workplace, phone, home_phone, extra_phone, email, status, credit_status, total_spent, order_count, notes, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        surname = EXCLUDED.surname,
        father_name = EXCLUDED.father_name,
        fin_code = EXCLUDED.fin_code,
        id_serial = EXCLUDED.id_serial,
        address = EXCLUDED.address,
        workplace = EXCLUDED.workplace,
        phone = EXCLUDED.phone,
        home_phone = EXCLUDED.home_phone,
        extra_phone = EXCLUDED.extra_phone,
        email = EXCLUDED.email,
        status = EXCLUDED.status,
        credit_status = EXCLUDED.credit_status,
        notes = EXCLUDED.notes,
        avatar_url = COALESCE(EXCLUDED.avatar_url, customers.avatar_url)
    `, [
      id,
      c.name,
      c.surname || '',
      c.father_name || c.fatherName || '',
      c.fin_code || c.finCode || '',
      c.id_serial || c.idSerial || '',
      c.address || '',
      c.workplace || '',
      c.phone || '',
      c.home_phone || c.homePhone || '',
      c.extra_phone || c.extraPhone || '',
      c.email || '',
      c.status || 'active',
      c.credit_status || c.creditStatus || 'clean',
      c.total_spent || c.totalSpent || 0,
      c.order_count || c.orderCount || 0,
      c.notes || '',
      c.avatar_url || c.avatar || null
    ]);
    return { success: true, id };
  }

  async deleteCustomer(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM customers WHERE id = $1', [id]);
    return { success: true };
  }

  // POS Sales
  async getPosSales() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM pos_sales ORDER BY created_at DESC');
    return res.rows;
  }

  async savePosSale(sale: any) {
    await this.ensureTables();
    const id = sale.id || 'POS-' + Math.floor(100000 + Math.random() * 900000);
    const scheduleJson = JSON.stringify(sale.payment_schedule || sale.paymentSchedule || []);
    const itemsJson = JSON.stringify(sale.items || []);

    await this.db.query(`
      INSERT INTO pos_sales (id, customer_id, customer_name, customer_phone, customer_fin, sale_type, total_amount, down_payment, months, interest_rate, monthly_payment, payment_schedule, items, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14)
    `, [
      id,
      sale.customer_id || sale.customerId || null,
      sale.customer_name || sale.customerName || 'Müştəri',
      sale.customer_phone || sale.customerPhone || '',
      sale.customer_fin || sale.customerFin || '',
      sale.sale_type || sale.saleType || 'cash',
      sale.total_amount || sale.totalAmount || 0,
      sale.down_payment || sale.downPayment || 0,
      sale.months || 1,
      sale.interest_rate || sale.interestRate || 0,
      sale.monthly_payment || sale.monthlyPayment || 0,
      scheduleJson,
      itemsJson,
      sale.notes || ''
    ]);

    // Also deduct product stocks
    if (Array.isArray(sale.items)) {
      for (const item of sale.items) {
        if (item.id && item.quantity) {
          await this.db.query('UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [item.quantity, item.id]);
        }
      }
    }

    // Update customer total spent & order count
    if (sale.customer_id) {
      await this.db.query(`
        UPDATE customers
        SET total_spent = total_spent + $1,
            order_count = order_count + 1,
            credit_status = CASE WHEN $2 = 'credit' THEN 'active_credit' ELSE credit_status END
        WHERE id = $3
      `, [sale.total_amount || 0, sale.sale_type || 'cash', sale.customer_id]);
    }

    return { success: true, id };
  }

  // Services
  async getServices() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM services ORDER BY sort_order ASC, created_at DESC');
    return res.rows;
  }

  async saveServices(services: any[]) {
    await this.ensureTables();
    if (Array.isArray(services)) {
      for (const s of services) {
        const id = s.id || 'srv-' + Date.now();
        await this.db.query(`
          INSERT INTO services (id, name, price, icon, description, duration, status, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            icon = EXCLUDED.icon,
            description = EXCLUDED.description,
            duration = EXCLUDED.duration,
            status = EXCLUDED.status,
            sort_order = EXCLUDED.sort_order
        `, [id, s.name, s.price || 'Pulsuz', s.icon || '🛡️', s.description || '', s.duration || '', s.status || 'active', s.sort_order || 1]);
      }
    }
    return { success: true };
  }

  async deleteService(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM services WHERE id = $1', [id]);
    return { success: true };
  }

  // Suppliers
  async getSuppliers() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    return res.rows;
  }

  async saveSupplier(supplier: any) {
    await this.ensureTables();
    const id = supplier.id || 'sup-' + Date.now();
    await this.db.query(`
      INSERT INTO suppliers (id, name, contact_person, phone, email, address, country, tax_number, bank_details, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        contact_person = EXCLUDED.contact_person,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        country = EXCLUDED.country,
        tax_number = EXCLUDED.tax_number,
        bank_details = EXCLUDED.bank_details,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status
    `, [
      id,
      supplier.name,
      supplier.contact_person || supplier.contactPerson || '',
      supplier.phone || '',
      supplier.email || '',
      supplier.address || '',
      supplier.country || 'Azərbaycan',
      supplier.tax_number || supplier.taxNumber || '',
      supplier.bank_details || supplier.bankDetails || '',
      supplier.notes || '',
      supplier.status || 'active'
    ]);
    return { success: true, id };
  }

  async deleteSupplier(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM suppliers WHERE id = $1', [id]);
    return { success: true };
  }

  // Purchase Invoices
  async getPurchaseInvoices() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM purchase_invoices ORDER BY created_at DESC');
    return res.rows;
  }

  async savePurchaseInvoice(invoice: any) {
    await this.ensureTables();
    const id = invoice.id || 'PI-' + Date.now();
    const invNum = invoice.invoice_number || invoice.invoiceNumber || 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const itemsJson = JSON.stringify(invoice.items || []);

    await this.db.query(`
      INSERT INTO purchase_invoices (id, invoice_number, supplier_id, supplier_name, items, total_amount, payment_status, payment_method, is_draft, notes, invoice_date)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        invoice_number = EXCLUDED.invoice_number,
        supplier_id = EXCLUDED.supplier_id,
        supplier_name = EXCLUDED.supplier_name,
        items = EXCLUDED.items,
        total_amount = EXCLUDED.total_amount,
        payment_status = EXCLUDED.payment_status,
        payment_method = EXCLUDED.payment_method,
        is_draft = EXCLUDED.is_draft,
        notes = EXCLUDED.notes,
        invoice_date = EXCLUDED.invoice_date
    `, [
      id,
      invNum,
      invoice.supplier_id || invoice.supplierId || null,
      invoice.supplier_name || invoice.supplierName || 'Təchizatçı',
      itemsJson,
      invoice.total_amount || invoice.totalAmount || 0,
      invoice.payment_status || invoice.paymentStatus || 'unpaid',
      invoice.payment_method || invoice.paymentMethod || 'cash',
      invoice.is_draft ?? invoice.isDraft ?? false,
      invoice.notes || '',
      invoice.invoice_date || invoice.invoiceDate || new Date().toISOString()
    ]);

    // If not draft, increment product stocks automatically in both products and warehouse_stock
    if (!(invoice.is_draft ?? invoice.isDraft)) {
      const whRes = await this.db.query("SELECT id FROM warehouses WHERE is_main = true LIMIT 1");
      const defaultWhId = whRes.rows[0]?.id || 'main';

      if (Array.isArray(invoice.items)) {
        for (const item of invoice.items) {
          const qty = Number(item.quantity) || 0;
          if (item.id && qty > 0) {
            // 1. Update product table stock and cost_price if provided
            if (item.purchase_price && Number(item.purchase_price) > 0) {
              await this.db.query('UPDATE products SET stock = COALESCE(stock, 0) + $1, cost_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [qty, Number(item.purchase_price), item.id]);
            } else {
              await this.db.query('UPDATE products SET stock = COALESCE(stock, 0) + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [qty, item.id]);
            }

            // 2. Update warehouse_stock table for default warehouse
            await this.db.query(`
              INSERT INTO warehouse_stock (product_id, warehouse_id, quantity, updated_at)
              VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
              ON CONFLICT (product_id, warehouse_id) DO UPDATE SET
                quantity = warehouse_stock.quantity + EXCLUDED.quantity,
                updated_at = CURRENT_TIMESTAMP
            `, [item.id, defaultWhId, qty]);

            // Sync Meilisearch
            if (this.searchService) {
              const search = this.searchService;
              this.db.query('SELECT * FROM products WHERE id = $1', [item.id]).then(r => {
                if (r.rows[0]) search.indexProduct(r.rows[0]).catch(() => {});
              }).catch(() => {});
            }
          }
        }
      }
    }

    // Invalidate Redis catalog cache
    if (this.redisService) {
      await this.redisService.delByPattern('catalog:*');
    }

    return { success: true, id };
  }

  async deletePurchaseInvoice(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM purchase_invoices WHERE id = $1', [id]);
    return { success: true };
  }

  // Warehouse Transfers
  async getTransfers() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM warehouse_transfers ORDER BY created_at DESC');
    return res.rows;
  }

  async saveTransfer(transfer: any) {
    await this.ensureTables();
    const id = transfer.id || 'TR-' + Date.now();
    const trNum = transfer.transfer_number || transfer.transferNumber || 'TR-' + Math.floor(100000 + Math.random() * 900000);
    const itemsJson = JSON.stringify(transfer.items || []);

    await this.db.query(`
      INSERT INTO warehouse_transfers (id, transfer_number, from_warehouse_id, from_warehouse_name, to_warehouse_id, to_warehouse_name, items, status, notes, transfer_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        transfer_number = EXCLUDED.transfer_number,
        from_warehouse_id = EXCLUDED.from_warehouse_id,
        from_warehouse_name = EXCLUDED.from_warehouse_name,
        to_warehouse_id = EXCLUDED.to_warehouse_id,
        to_warehouse_name = EXCLUDED.to_warehouse_name,
        items = EXCLUDED.items,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        transfer_date = EXCLUDED.transfer_date
    `, [
      id,
      trNum,
      transfer.from_warehouse_id || transfer.fromWarehouseId || null,
      transfer.from_warehouse_name || transfer.fromWarehouseName || 'Mərkəzi Anbar',
      transfer.to_warehouse_id || transfer.toWarehouseId || null,
      transfer.to_warehouse_name || transfer.toWarehouseName || 'Filial Anbarı',
      itemsJson,
      transfer.status || 'completed',
      transfer.notes || '',
      transfer.transfer_date || transfer.transferDate || new Date().toISOString()
    ]);

    return { success: true, id };
  }

  async updateTransferStatus(id: string, status: string) {
    await this.ensureTables();
    await this.db.query('UPDATE warehouse_transfers SET status = $1 WHERE id = $2', [status, id]);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════
  // AUDIT LOGS (Immutable Security Journal)
  // ═══════════════════════════════════════════════════
  async createAuditLog(log: {
    id?: string;
    user_id?: string;
    user_name?: string;
    user_role?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    entity_name?: string;
    old_values?: any;
    new_values?: any;
    details: string;
    ip_address?: string;
    user_agent?: string;
  }) {
    await this.ensureTables();
    const id = log.id || 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const userName = log.user_name || 'Rəşad Məmmədov (Super Admin)';
    const userRole = log.user_role || 'Super Admin';
    const oldValuesJson = JSON.stringify(log.old_values || {});
    const newValuesJson = JSON.stringify(log.new_values || {});

    await this.db.query(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, entity_name, old_values, new_values, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, NOW())
      ON CONFLICT (id) DO NOTHING
    `, [
      id,
      log.user_id || null,
      userName,
      userRole,
      log.action,
      log.entity_type,
      log.entity_id || null,
      log.entity_name || null,
      oldValuesJson,
      newValuesJson,
      log.details,
      log.ip_address || '127.0.0.1',
      log.user_agent || 'TechnoMania-ERP-Client'
    ]);

    return { success: true, id };
  }

  async getAuditLogs(params: {
    search?: string;
    action?: string;
    entity_type?: string;
    user_name?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    await this.ensureTables();
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (params.search && params.search.trim()) {
      query += ` AND (details ILIKE $${paramIndex} OR entity_name ILIKE $${paramIndex} OR user_name ILIKE $${paramIndex} OR id ILIKE $${paramIndex})`;
      values.push(`%${params.search.trim()}%`);
      paramIndex++;
    }

    if (params.action && params.action !== 'all') {
      query += ` AND action = $${paramIndex}`;
      values.push(params.action);
      paramIndex++;
    }

    if (params.entity_type && params.entity_type !== 'all') {
      query += ` AND entity_type = $${paramIndex}`;
      values.push(params.entity_type);
      paramIndex++;
    }

    if (params.user_name && params.user_name !== 'all') {
      query += ` AND user_name ILIKE $${paramIndex}`;
      values.push(`%${params.user_name}%`);
      paramIndex++;
    }

    if (params.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(params.endDate);
      paramIndex++;
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countRes = await this.db.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(params.limit ? Number(params.limit) : 100);
    values.push(params.offset ? Number(params.offset) : 0);

    const res = await this.db.query(query, values);

    return { logs: res.rows, total };
  }

  async getAuditLogStats() {
    await this.ensureTables();
    const totalRes = await this.db.query(`SELECT COUNT(*) as total FROM audit_logs`);
    const todayRes = await this.db.query(`SELECT COUNT(*) as today FROM audit_logs WHERE created_at >= CURRENT_DATE`);
    const priceChangesRes = await this.db.query(`SELECT COUNT(*) as count FROM audit_logs WHERE action IN ('price_change', 'bulk_pricing', 'pricing_update')`);
    const stockChangesRes = await this.db.query(`SELECT COUNT(*) as count FROM audit_logs WHERE action IN ('stock_update', 'stock_delete', 'inventory_adjust')`);
    const orderChangesRes = await this.db.query(`SELECT COUNT(*) as count FROM audit_logs WHERE action IN ('order_status_update', 'status_update', 'order_delete')`);
    
    return {
      total: parseInt(totalRes.rows[0]?.total || '0', 10),
      today: parseInt(todayRes.rows[0]?.today || '0', 10),
      priceChanges: parseInt(priceChangesRes.rows[0]?.count || '0', 10),
      stockChanges: parseInt(stockChangesRes.rows[0]?.count || '0', 10),
      orderChanges: parseInt(orderChangesRes.rows[0]?.count || '0', 10),
    };
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER AUTHENTICATION & PROFILE
  // ═══════════════════════════════════════════════════
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'techno_salt_2026!').digest('hex');
  }

  async registerCustomer(dto: { phone: string; name: string; password: string }) {
    try {
      await this.ensureTables();
      const cleanPhone = String(dto.phone || '').trim();
      const cleanName = String(dto.name || '').trim();
      const cleanPassword = String(dto.password || '').trim();

      if (!cleanPhone || !cleanName || !cleanPassword) {
        return { success: false, message: 'Bütün xanaları doldurun.' };
      }

      if (cleanPassword.length < 6) {
        return { success: false, message: 'Şifrə minimum 6 simvol olmalıdır.' };
      }

      const existing = await this.db.query('SELECT * FROM customers WHERE phone = $1', [cleanPhone]);
      if (existing.rows.length > 0) {
        return { success: false, message: 'Bu mobil nömrə ilə artıq qeydiyyatdan keçilib. Zəhmət olmasa daxil olun.' };
      }

      const id = 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const passwordHash = this.hashPassword(cleanPassword);

      await this.db.query(
        `INSERT INTO customers (id, name, phone, password_hash, status, created_at)
         VALUES ($1, $2, $3, $4, 'active', CURRENT_TIMESTAMP)`,
        [id, cleanName, cleanPhone, passwordHash]
      );

      return {
        success: true,
        message: 'Qeydiyyat uğurla tamamlandı! İndi daxil ola bilərsiniz.',
        customer: { id, name: cleanName, phone: cleanPhone },
      };
    } catch (err: any) {
      this.logger.error('Customer register error:', err);
      return { success: false, message: err.message || 'Qeydiyyat zamanı xəta baş verdi.' };
    }
  }

  async loginCustomer(dto: { phone?: string; phoneOrEmail?: string; email?: string; password?: string }) {
    try {
      await this.ensureTables();
      const identifier = String(dto.phone || dto.phoneOrEmail || dto.email || '').trim();
      const cleanPassword = String(dto.password || '').trim();

      if (!identifier || !cleanPassword) {
        return { success: false, message: 'Mobil nömrə və ya e-poçt və şifrəni daxil edin.' };
      }

      const digits = identifier.replace(/\D/g, '');

      const res = await this.db.query(
        `SELECT * FROM customers 
         WHERE LOWER(phone) = LOWER($1) 
            OR LOWER(email) = LOWER($1)
            OR ($2 <> '' AND regexp_replace(phone, '\\D', '', 'g') = $2)
            OR ($2 <> '' AND regexp_replace(phone, '\\D', '', 'g') LIKE '%' || $2)
         ORDER BY created_at DESC LIMIT 1`,
        [identifier, digits.length >= 7 ? digits : '']
      );

      if (res.rows.length === 0) {
        return { success: false, message: 'Mobil nömrə və ya şifrə yanlışdır.' };
      }

      const customer = res.rows[0];
      const passwordHash = this.hashPassword(cleanPassword);

      if (customer.password_hash && customer.password_hash !== passwordHash) {
        return { success: false, message: 'Mobil nömrə və ya şifrə yanlışdır.' };
      }

      const { password_hash, ...safeCustomer } = customer;
      return {
        success: true,
        customer: safeCustomer,
      };
    } catch (err: any) {
      this.logger.error('Customer login error:', err);
      return { success: false, message: err.message || 'Daxil olarkən xəta baş verdi.' };
    }
  }

  async updateCustomerProfile(dto: {
    id: string;
    name?: string;
    surname?: string;
    phone?: string;
    email?: string;
    fin_code?: string;
    birth_date?: string;
    id_serial?: string;
    father_name?: string;
    address?: string;
    city?: string;
    workplace?: string;
    avatar_url?: string;
  }) {
    try {
      await this.ensureTables();
      if (!dto.id) return { success: false, message: 'İstifadəçi ID tapılmadı.' };

      await this.db.query(`
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS surname VARCHAR(255);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS fin_code VARCHAR(50);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_serial VARCHAR(50);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS workplace TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date TEXT;
      `);

      const res = await this.db.query(
        `UPDATE customers
         SET name = COALESCE($2, name),
             surname = COALESCE($3, surname),
             email = COALESCE($4, email),
             fin_code = COALESCE($5, fin_code),
             birth_date = COALESCE($6, birth_date),
             id_serial = COALESCE($7, id_serial),
             father_name = COALESCE($8, father_name),
             address = COALESCE($9, address),
             city = COALESCE($10, city),
             workplace = COALESCE($11, workplace),
             avatar_url = COALESCE($12, avatar_url),
             phone = COALESCE($13, phone)
         WHERE id = $1
         RETURNING *`,
        [
          dto.id,
          dto.name || null,
          dto.surname || null,
          dto.email || null,
          dto.fin_code || null,
          dto.birth_date || null,
          dto.id_serial || null,
          dto.father_name || null,
          dto.address || null,
          dto.city || null,
          dto.workplace || null,
          dto.avatar_url || null,
          dto.phone || null,
        ]
      );

      if (res.rows.length === 0) {
        return { success: false, message: 'Müştəri tapılmadı.' };
      }

      const { password_hash, ...safeCustomer } = res.rows[0];
      return {
        success: true,
        message: 'Profil məlumatları uğurla yeniləndi.',
        customer: safeCustomer,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Məlumatlar yenilənərkən xəta baş verdi.' };
    }
  }

  async changeCustomerPassword(dto: { id: string; oldPassword: string; newPassword: string }) {
    try {
      await this.ensureTables();
      if (!dto.id || !dto.oldPassword || !dto.newPassword) {
        return { success: false, message: 'Bütün xanaları doldurun.' };
      }

      if (dto.newPassword.length < 6) {
        return { success: false, message: 'Yeni şifrə minimum 6 simvol olmalıdır.' };
      }

      const res = await this.db.query('SELECT * FROM customers WHERE id = $1', [dto.id]);
      if (res.rows.length === 0) return { success: false, message: 'İstifadəçi tapılmadı.' };

      const customer = res.rows[0];
      const oldHash = this.hashPassword(dto.oldPassword);

      if (customer.password_hash && customer.password_hash !== oldHash) {
        return { success: false, message: 'Cari şifrəniz yanlışdır.' };
      }

      const newHash = this.hashPassword(dto.newPassword);
      await this.db.query('UPDATE customers SET password_hash = $1 WHERE id = $2', [newHash, dto.id]);

      return {
        success: true,
        message: 'Şifrəniz uğurla dəyişdirildi.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Şifrə dəyişdirilərkən xəta baş verdi.' };
    }
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER PRIVILEGES (İMTİYAZLAR)
  // ═══════════════════════════════════════════════════
  async getPrivileges() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM customer_privileges ORDER BY sort_order ASC, created_at DESC');
    return res.rows;
  }

  async savePrivilege(p: any) {
    await this.ensureTables();
    const id = p.id || 'priv_' + Date.now();
    await this.db.query(
      `INSERT INTO customer_privileges (id, title, description, icon, image_url, badge, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           description = EXCLUDED.description,
           icon = EXCLUDED.icon,
           image_url = EXCLUDED.image_url,
           badge = EXCLUDED.badge,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active`,
      [
        id,
        p.title || 'İmtiyaz',
        p.description || '',
        p.icon || 'Award',
        p.image_url || p.imageUrl || null,
        p.badge || null,
        p.sort_order || p.sortOrder || 0,
        p.is_active !== false,
      ]
    );
    return { success: true, id };
  }

  async deletePrivilege(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM customer_privileges WHERE id = $1', [id]);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER BROADCAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════
  async getCustomerNotifications() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM customer_notifications ORDER BY created_at DESC');
    return res.rows;
  }

  async saveCustomerNotification(n: any) {
    await this.ensureTables();
    const id = n.id || 'notif_' + Date.now();
    await this.db.query(
      `INSERT INTO customer_notifications (id, title, description, target)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           description = EXCLUDED.description,
           target = EXCLUDED.target`,
      [id, n.title || 'Bildiriş', n.description || '', n.target || 'all']
    );
    return { success: true, id };
  }

  async deleteCustomerNotification(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM customer_notifications WHERE id = $1', [id]);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════
  // ERP INTERNAL NOTIFICATIONS (DAXİLİ İŞÇİ/ADMİN BİLDİRİŞLƏRİ)
  // ═══════════════════════════════════════════════════
  async getErpNotifications() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM erp_notifications ORDER BY created_at DESC LIMIT 50');
    return res.rows;
  }

  async saveErpNotification(n: any) {
    await this.ensureTables();
    const id = n.id || 'erp_notif_' + Date.now();
    await this.db.query(
      `INSERT INTO erp_notifications (id, title, description, author_name, priority, target_role, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           description = EXCLUDED.description,
           author_name = EXCLUDED.author_name,
           priority = EXCLUDED.priority,
           target_role = EXCLUDED.target_role,
           link = EXCLUDED.link`,
      [
        id,
        n.title || 'ERP Daxili Bildiriş',
        n.description || '',
        n.author_name || n.author || 'Rəhbərlik',
        n.priority || 'info',
        n.target_role || 'all',
        n.link || '',
      ]
    );
    return { success: true, id };
  }

  async deleteErpNotification(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM erp_notifications WHERE id = $1', [id]);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════
  // MOBILE APP STORIES (HEKAYƏLƏR)
  // ═══════════════════════════════════════════════════
  async getMobileStories() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM mobile_stories ORDER BY sort_order ASC, created_at DESC');
    return res.rows.map(row => {
      let slides = [];
      try {
        slides = typeof row.slides === 'string' ? JSON.parse(row.slides || '[]') : (row.slides || []);
      } catch (e) {
        slides = [];
      }
      return {
        ...row,
        slides,
      };
    });
  }

  async saveMobileStory(s: any) {
    await this.ensureTables();
    const id = s.id || 'story_' + Date.now();
    const slidesJson = JSON.stringify(Array.isArray(s.slides) ? s.slides : []);
    await this.db.query(
      `INSERT INTO mobile_stories (id, title, image, media_url, badge, badge_color, slides, link, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           image = EXCLUDED.image,
           media_url = EXCLUDED.media_url,
           badge = EXCLUDED.badge,
           badge_color = EXCLUDED.badge_color,
           slides = EXCLUDED.slides,
           link = EXCLUDED.link,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active`,
      [
        id,
        s.title || 'Hekayə',
        s.image || '',
        s.media_url || s.image || '',
        s.badge || '',
        s.badge_color || '#4f533b',
        slidesJson,
        s.link || '',
        s.sort_order || 0,
        s.is_active !== false,
      ]
    );
    return { success: true, id };
  }

  async deleteMobileStory(id: string) {
    await this.ensureTables();
    await this.db.query('DELETE FROM mobile_stories WHERE id = $1', [id]);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER FEEDBACK & SUGGESTIONS
  // ═══════════════════════════════════════════════════
  async getFeedbacks() {
    await this.ensureTables();
    const res = await this.db.query('SELECT * FROM customer_feedbacks ORDER BY created_at DESC');
    return res.rows;
  }

  async saveFeedback(f: any) {
    await this.ensureTables();
    const id = 'fb_' + Date.now();
    await this.db.query(
      `INSERT INTO customer_feedbacks (id, name, phone, email, topic, message, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        f.name || 'Müştəri',
        f.phone || '',
        f.email || '',
        f.topic || 'Təklif',
        f.message || '',
        f.source || 'mobile_app',
      ]
    );
    return { success: true, id };
  }
}

