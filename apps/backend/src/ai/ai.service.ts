import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI | null = null;
  private readonly modelName = 'gemini-3.6-flash';

  constructor(
    private configService: ConfigService,
    private dbService: DatabaseService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'AQ.Ab8RN6LAiF9uF8xfAdKCtULhPd-bFgeJ_mnhs43DrX55ab9SEQ';
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        this.logger.log(`Techno AI initialized successfully with ${this.modelName}`);
      } catch (err) {
        this.logger.error('Failed to initialize Gemini AI SDK:', err);
      }
    } else {
      this.logger.warn('GEMINI_API_KEY is not defined.');
    }
  }

  private cachedBriefing: { data: any; timestamp: number } | null = null;

  private getDBSchemaPrompt(): string {
    return `
    Mərkəzi Sistem Verilənləri:
    - products (id, name, model_name, brand, cash_price, old_price, discount_price, cost_price, stock, category_name, is_active, created_at)
    - pos_sales (id, customer_name, customer_phone, customer_fin, sale_type, total_amount, down_payment, months, interest_rate, monthly_payment, items (JSONB), created_at)
    - orders (id, customer, phone, address, total, status, date, payment, items (JSONB), created_at)
    - customers (id, name, surname, workplace, phone, email, status, credit_status, total_spent, order_count, created_at)
    - purchase_invoices (id, invoice_number, supplier_name, items (JSONB), total_amount, payment_status, invoice_date, created_at)
    - stores (id, name, address, phone, is_main, status)
    - warehouses (id, name, store_id, is_main)
    - warehouse_stock (id, product_id, warehouse_id, quantity)
    - categories (id, name, slug, product_count)
    - brands (id, name, slug, is_popular)
    `;
  }

  /**
   * Main Executive Boss AI: analyzes executive natural language queries and provides instant strategic insights.
   */
  async askBossDashboard(question: string, history: any[] = []): Promise<any> {
    if (!this.ai) {
      return {
        answer: 'Techno AI sistemi hazırda aktivləşdirilməkdədir. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.',
        kpiCards: [],
        recommendations: [],
      };
    }

    try {
      // Parallel fast fetch of core operational data from DB
      const [statsRes, topProdsRes, lowStockRes, recentSalesRes] = await Promise.all([
        this.dbService.query(`
          SELECT 
            (SELECT COUNT(*) FROM products WHERE is_active = true) as total_active_products,
            (SELECT COUNT(*) FROM products WHERE stock <= 5) as low_stock_count,
            (SELECT COUNT(*) FROM customers) as total_customers,
            (SELECT COUNT(*) FROM pos_sales) as total_sales_count,
            (SELECT COALESCE(SUM(total_amount), 0) FROM pos_sales WHERE created_at >= NOW() - INTERVAL '30 days') as revenue_30d
        `).catch(() => ({ rows: [{}] })),
        this.dbService.query(`
          SELECT id, name, model_name, brand, cash_price, stock, category_name, images 
          FROM products 
          WHERE is_active = true 
          ORDER BY cash_price DESC 
          LIMIT 12
        `).catch(() => ({ rows: [] })),
        this.dbService.query(`
          SELECT id, name, model_name, brand, stock, cash_price, category_name, images 
          FROM products 
          WHERE stock <= 5 
          ORDER BY stock ASC 
          LIMIT 8
        `).catch(() => ({ rows: [] })),
        this.dbService.query(`
          SELECT customer_name, total_amount, sale_type, created_at 
          FROM pos_sales 
          ORDER BY created_at DESC 
          LIMIT 8
        `).catch(() => ({ rows: [] })),
      ]);

      const formatImg = (imgRaw: any): string => {
        if (!imgRaw) return '';
        if (Array.isArray(imgRaw) && imgRaw.length > 0) {
          return typeof imgRaw[0] === 'string' ? imgRaw[0] : (imgRaw[0]?.url || '');
        }
        if (typeof imgRaw === 'string') {
          if (imgRaw.startsWith('http') || imgRaw.startsWith('/')) return imgRaw;
          try {
            const parsed = JSON.parse(imgRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return typeof parsed[0] === 'string' ? parsed[0] : (parsed[0]?.url || '');
            }
          } catch (e) {}
        }
        return '';
      };

      const liveContext = {
        summary: statsRes.rows[0] || {},
        topProducts: (topProdsRes.rows || []).map(r => ({ ...r, image: formatImg(r.images), images: undefined })),
        lowStockAlerts: (lowStockRes.rows || []).map(r => ({ ...r, image: formatImg(r.images), images: undefined })),
        recentSales: recentSalesRes.rows || [],
      };

      const analysisPrompt = `
        Sən "Techno AI" — TechnoMania Şirkətlər Qrupunun Rəhbər İcraçı Müşavirisən (Chief Executive Advisor).
        Müdir sənə rəhbərlik sualı verib.
        
        Müdirin Sualı: "${question}"
        
        Sistemdəki canlı faktiki göstəricilər:
        ${JSON.stringify(liveContext)}
        
        Tələblər:
        1. Cavabı son dərəcə peşəkar, aydın, rəhbər üçün strateji və qısa Azərbaycan dilində yaz.
        2. Qətiyyən heç bir texniki ad (məsələn: model adı, baza adı və s.) İSTİFADƏ ETMƏ!
        3. Rəqəmləri, faktları və həll yollarını vurğula.
        4. Müdir üçün 2-4 ədəd ən vacib KPI kartı formalaşdır.
        5. Əgər sual məhsullar, anbar qalıqları, top satışlar və ya flaqman modellər ilə bağlıdırsa, canlı siyahıdan uyğun 2-4 məhsulu "productCards" siyahısında daxil et. Hər məhsul üçün adı, brendi, qiyməti, qalıq sayı, şəkli (image), status badge-i ("Top Satış", "Kritik Qalıq", "Yüksək Marja" və s.) və müdir üçün 1 cümləlik qısa səbəb (reason) təyin et.
        6. Müdir üçün 3 ədəd konkret icraedici TÖVSİYƏ ver.
        7. Müdirin növbəti addımda verə biləcəyi 3 ədəd maraqlı hazır sual təklif et.
        
        Yalnız aşağıdakı təmiz JSON formatında cavab ver:
        {
          "answer": "Markdown formatında aydın və analitik hesabat (bold başlıqlar, bullet point-lər ilə)",
          "kpiCards": [
            { "title": "Aylıq Dövriyyə", "value": "125,400 ₼", "change": "+14.2%", "isPositive": true, "iconType": "dollar" }
          ],
          "productCards": [
            {
              "id": 1,
              "name": "Apple iPhone 15 Pro Max",
              "brand": "Apple",
              "price": "2,939.99 ₼",
              "stock": 5,
              "image": "https://storage.techno-mania.az/...",
              "badge": "Top Satış",
              "reason": "Son 30 gündə ən yüksək gəlir gətirən flaqman model"
            }
          ],
          "chartData": {
            "title": "Məhsul və ya Satış Bölgüsü",
            "type": "bar",
            "labels": ["Məhsul A", "Məhsul B", "Məhsul C"],
            "data": [120, 85, 45]
          },
          "recommendations": [
            "1-ci konkret təklif",
            "2-ci konkret təklif",
            "3-cü konkret təklif"
          ],
          "suggestedQuestions": [
            "Bu həftə ən çox satılan modellər hansılardır?",
            "Kritik qalıqda olan məhsulların sifariş planı",
            "Filiallar üzrə dövriyyə müqayisəsi"
          ]
        }
      `;

      const finalResponse = await this.ai.models.generateContent({
        model: this.modelName,
        contents: analysisPrompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsedResult = JSON.parse(finalResponse.text || '{}');
      return {
        answer: parsedResult.answer || 'Məlumatlar təhlil edildi.',
        kpiCards: parsedResult.kpiCards || [],
        productCards: parsedResult.productCards || [],
        chartData: parsedResult.chartData || null,
        recommendations: parsedResult.recommendations || [],
        suggestedQuestions: parsedResult.suggestedQuestions || [],
      };
    } catch (err: any) {
      this.logger.error('Techno AI Error:', err);
      return {
        answer: `Hörmətli Rəhbər, cari məlumatlar üzrə təhlil aparıldı. Sualınızı daha da dəqiqləşdirmək üçün filial və ya dövr qeyd edə bilərsiniz.`,
        kpiCards: [],
        productCards: [],
        recommendations: ['Filial və ya məhsul kateqoriyasını dəqiqləşdirin.', 'Satış dövrünü seçin.'],
        suggestedQuestions: ['Son 30 günün ən çox satılan məhsulları hansılardır?', 'Kritik qalıqda olan məhsulların hesabatı'],
      };
    }
  }

  /**
   * Daily Executive Briefing for Boss (Cached in memory for instant response).
   */
  async getDailyExecutiveBriefing(): Promise<any> {
    const now = Date.now();
    if (this.cachedBriefing && (now - this.cachedBriefing.timestamp < 10 * 60 * 1000)) {
      return this.cachedBriefing.data;
    }

    try {
      const salesRes = await this.dbService.query('SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue FROM pos_sales WHERE created_at >= NOW() - INTERVAL \'30 days\';');
      const prodRes = await this.dbService.query('SELECT COUNT(*) as total_products, SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) as low_stock_count FROM products;');
      const custRes = await this.dbService.query('SELECT COUNT(*) as total_customers FROM customers;');

      const metrics = {
        sales: salesRes.rows[0] || {},
        products: prodRes.rows[0] || {},
        customers: custRes.rows[0] || {},
      };

      if (!this.ai) {
        return {
          greeting: 'Sabahınız xeyir, Hörmətli Rəhbər! ☀️',
          summary: 'TechnoMania idarəetmə sistemində bütün əməliyyatlar və anbar hərəkətləri aktiv nəzarət altındadır.',
          metrics,
        };
      }

      const prompt = `
        Sən "Techno AI" — Rəhbərin şəxsi biznes müşavirisən.
        Aşağıdakı cari rəqəmlərə əsasən müdir üçün 1 paraqraflıq güclü, motivasiyaedici və strateji "Səhər İcmalı (Daily Briefing)" hazırla:
        Məlumatlar: ${JSON.stringify(metrics)}
        
        Qeyd: Heç bir texniki ad işlətmə.
        
        JSON formatında cavab ver:
        {
          "greeting": "Salam, Hörmətli Rəhbər! ☀️",
          "summary": "Qısa, təsirli və dərin biznes icmalı (Azərbaycan dilində)",
          "priorities": ["1-ci vacib məsələ", "2-ci vacib məsələ", "3-cü vacib məsələ"]
        }
      `;

      const res = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(res.text || '{}');
      const finalData = {
        ...parsed,
        metrics,
      };

      this.cachedBriefing = { data: finalData, timestamp: now };
      return finalData;
    } catch (e: any) {
      return {
        greeting: 'Salam, Hörmətli Rəhbər!',
        summary: 'Sistem aktivdir və bütün satış əməliyyatları nəzarət altındadır.',
        priorities: ['Anbar qalıqlarına nəzarət', 'Kredit portfelinin təhlili'],
      };
    }
  }

  /**
   * AI-based product description & SEO generator for ERP.
   */
  async generateProductDetails(
    title: string,
    category: string,
    brand: string,
    specs?: any
  ): Promise<{ description: string; seoKeywords: string[]; highlights: string[]; titleSuggestion?: string }> {
    if (!this.ai) {
      return {
        description: `${brand} ${title} — müasir texnologiya və yüksək keyfiyyət standartları ilə təchiz edilmiş premium məhsul. TechnoMania-da rəsmi zəmanət və hissə-hissə ödənişlə əldə edin.`,
        seoKeywords: [title, brand, category, 'kreditlə almaq', 'bakıda ən ucuz'],
        highlights: ['1 İl Rəsmi Zəmanət', '0% Faizsiz Taksit İmkanı', 'Sürətli Çatdırılma'],
      };
    }

    try {
      const prompt = `
        Məhsul adı: "${title}"
        Kateqoriya: "${category}"
        Brend: "${brand}"
        Əlavə xüsusiyyətlər: ${JSON.stringify(specs || {})}
        
        Sən e-ticarət və texnologiya üzrə peşəkar kopirayter və SEO mütəxəssisisən.
        Azərbaycan dilində TechnoMania mağazası üçün cəlbedici, zəngin və rəsmi məhsul təsviri, 5-7 ədəd SEO açar söz və 4 əsas üstünlük (highlights) hazırla.
        
        JSON formatında cavab ver:
        {
          "titleSuggestion": "Məhsul üçün ən ideal tam marketinq adı",
          "description": "2-3 paraqrafdan ibarət, zəngin, cəlbedici və detallı məhsul təsviri",
          "seoKeywords": ["açar 1", "açar 2", "açar 3", "açar 4", "açar 5"],
          "highlights": ["1-ci üstünlük", "2-ci üstünlük", "3-cü üstünlük", "4-cü üstünlük"]
        }
      `;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      this.logger.error('Gemini Product Gen Error:', err);
      return {
        description: `${brand} ${title} — rəsmi zəmanətli orijinal məhsul.`,
        seoKeywords: [title, brand, category],
        highlights: ['Rəsmi Zəmanət', 'Orijinal Qablaşdırma'],
      };
    }
  }

  /**
   * Predicts credit approval probability using Gemini AI.
   */
  async predictCreditApproval(
    income: number,
    months: number,
    price: number,
    pin: string
  ): Promise<{ probability: number; rationale: string; riskLevel: 'low' | 'medium' | 'high' }> {
    const monthlyPayment = price / months;
    const dti = (monthlyPayment / income) * 100;

    if (this.ai) {
      try {
        const prompt = `
          Müştəri Maliyyə Məlumatı:
          - Aylıq gəlir: ${income} AZN
          - İstənilən müddət: ${months} ay
          - Məhsulun qiyməti: ${price} AZN
          - Hesablanmış aylıq ödəniş: ${monthlyPayment.toFixed(2)} AZN
          - Gəlir-Ödəniş nisbəti (DTI): ${dti.toFixed(1)}%
          
          Azərbaycan bank və BOKT-larının (Birkart, Tamkart, Nova Credit, EmbaFinans) kredit siyasətinə əsasən bu müştərinin kredit təsdiq ehtimalını (% ilə), risk dərəcəsini və qısa izahatını təhlil et.
          
          JSON formatında cavab ver:
          {
            "probability": number (0-100),
            "riskLevel": "low" | "medium" | "high",
            "rationale": "Azərbaycan dilində qısa və aydın izahat (maksimum 2 cümlə)"
          }
        `;

        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        return {
          probability: parsed.probability || 75,
          riskLevel: parsed.riskLevel || (dti > 45 ? 'high' : 'low'),
          rationale: parsed.rationale || 'Müştərinin gəliri və aylıq ödəniş balansı müsbətdir.',
        };
      } catch (err) {
        this.logger.error('Gemini Credit Scoring Error:', err);
      }
    }

    return {
      probability: dti > 50 ? 35 : (dti > 35 ? 65 : 90),
      riskLevel: dti > 50 ? 'high' : (dti > 35 ? 'medium' : 'low'),
      rationale: dti > 50 ? 'Aylıq ödəniş gəlirin böyük hissəsini təşkil edir.' : 'Gəlir ödəniş üçün yetərlidir.',
    };
  }

  /**
   * Storefront Customer Service AI Chatbot helper.
   */
  async chatSupport(userMessage: string): Promise<{ reply: string }> {
    if (this.ai) {
      try {
        const prompt = `
          Sən TechnoMania E-ticarət mağazasının virtual satış məsləhətçisisən.
          Müştərinin mesajı: "${userMessage}"
          
          Müştəriyə nəzakətli, köməkçi və cəlbedici Azərbaycan dilində cavab ver (maksimum 3 cümlə).
        `;
        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });
        return { reply: response.text || 'Sizə necə kömək edə bilərəm?' };
      } catch (err) {
        this.logger.error('Gemini error in chatbot:', err);
      }
    }

    return {
      reply: 'Salam! TechnoMania onlayn mağazasına xoş gəlmisiniz. Sizi maraqlandıran məhsul və ya kredit şərtləri barədə suallarınızı verə bilərsiniz.',
    };
  }
}

