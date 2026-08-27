import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

export interface SearchOptions {
  query?: string;
  category_id?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string; // 'price_asc' | 'price_desc' | 'newest'
  limit?: number;
  offset?: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private meiliHost: string;
  private meiliKey: string;
  private isMeiliAvailable = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {
    this.meiliHost = this.configService.get<string>('MEILI_HOST') || 'http://127.0.0.1:7700';
    this.meiliKey = this.configService.get<string>('MEILI_MASTER_KEY') || 'technomania_meili_secret_2026';
  }

  async onModuleInit() {
    // Wait a brief moment for database & meilisearch containers to settle
    setTimeout(async () => {
      await this.initMeilisearch();
    }, 2000);
  }

  private async requestMeili(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.meiliHost}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.meiliKey}`,
      ...(options.headers as any),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Meilisearch HTTP ${res.status}: ${text}`);
      }
      return await res.json();
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  }

  async initMeilisearch() {
    try {
      // Check health
      const health = await this.requestMeili('/health');
      if (health.status === 'available') {
        this.isMeiliAvailable = true;
        this.logger.log('Meilisearch engine connected successfully.');
      }

      // Configure index settings
      await this.configureIndex();

      // Sync all products
      await this.syncAllProducts();
    } catch (err: any) {
      this.logger.warn(`Meilisearch initialization warning: ${err.message}. SQL fallback active.`);
      this.isMeiliAvailable = false;
    }
  }

  private async configureIndex() {
    try {
      // 1. Create index if not exists
      try {
        await this.requestMeili('/indexes', {
          method: 'POST',
          body: JSON.stringify({ uid: 'products', primaryKey: 'id' }),
        });
      } catch (e) {}

      // 2. Configure searchable, filterable, sortable attributes and synonyms
      await this.requestMeili('/indexes/products/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          searchableAttributes: [
            'name',
            'model_name',
            'brand',
            'category_name',
            'description',
            'attributesList',
            'slug',
          ],
          filterableAttributes: [
            'brand',
            'category_id',
            'category_name',
            'cash_price',
            'is_active',
            'is_new',
            'is_online_only',
          ],
          sortableAttributes: [
            'cash_price',
            'created_at',
          ],
          rankingRules: [
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
          ],
          typoTolerance: {
            enabled: true,
            minWordSizeForTypos: {
              oneTypo: 3,
              twoTypos: 7,
            },
          },
          synonyms: {
            'iphone': ['apple', 'ayfon', 'telefon'],
            'smartfon': ['telefon', 'smartphone', 'phone', 'mobil'],
            'noutbuk': ['notbuk', 'notebook', 'laptop', 'komputer'],
            'planset': ['planşet', 'ipad', 'tablet'],
            'tozsoran': ['tozsoranlar', 'vacuum', 'robot'],
            'televizor': ['tv', 'smart tv'],
          },
        }),
      });
      this.logger.log('Meilisearch "products" index configured with Azerbaijani synonyms & typo-tolerance.');
    } catch (err: any) {
      this.logger.warn(`Failed to configure Meilisearch settings: ${err.message}`);
    }
  }

  async syncAllProducts(): Promise<{ count: number }> {
    try {
      const res = await this.db.query('SELECT * FROM products WHERE is_active = true');
      const rows = res.rows || [];

      const documents = rows.map((p) => this.formatProductDocument(p));

      if (documents.length > 0) {
        await this.requestMeili('/indexes/products/documents', {
          method: 'POST',
          body: JSON.stringify(documents),
        });
      }

      this.logger.log(`Synced ${documents.length} products to Meilisearch index.`);
      return { count: documents.length };
    } catch (err: any) {
      this.logger.error(`Error syncing products to Meilisearch: ${err.message}`);
      return { count: 0 };
    }
  }

  async indexProduct(product: any) {
    try {
      const doc = this.formatProductDocument(product);
      await this.requestMeili('/indexes/products/documents', {
        method: 'POST',
        body: JSON.stringify([doc]),
      });
    } catch (err: any) {
      this.logger.warn(`Failed to sync product ${product.id} to Meilisearch: ${err.message}`);
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.requestMeili(`/indexes/products/documents/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      this.logger.warn(`Failed to delete product ${id} from Meilisearch: ${err.message}`);
    }
  }

  private formatProductDocument(p: any) {
    let attrs = p.attributes;
    if (typeof attrs === 'string') {
      try { attrs = JSON.parse(attrs); } catch (e) { attrs = {}; }
    }
    const attributesList = attrs && typeof attrs === 'object'
      ? Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(' ')
      : '';

    return {
      id: String(p.id),
      name: p.name || '',
      model_name: p.model_name || p.name || '',
      brand: p.brand || '',
      brand_id: p.brand_id || null,
      cash_price: Number(p.cash_price || 0),
      old_price: p.old_price ? String(p.old_price) : null,
      discount_price: p.discount_price ? Number(p.discount_price) : null,
      stock: Number(p.stock || 0),
      category_id: p.category_id || '',
      category_name: p.category_name || '',
      image: p.image || null,
      is_active: p.is_active !== false,
      is_new: Boolean(p.is_new),
      is_online_only: Boolean(p.is_online_only),
      discount: p.discount || null,
      attributes: attrs || {},
      attributesList,
      created_at: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
    };
  }

  async search(options: SearchOptions) {
    const query = options.query?.trim() || '';
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    // Build filter expressions
    const filters: string[] = ['is_active = true'];
    if (options.category_id) {
      filters.push(`category_id = "${options.category_id}"`);
    }
    if (options.brand) {
      filters.push(`brand = "${options.brand}"`);
    }
    if (options.minPrice !== undefined && options.minPrice > 0) {
      filters.push(`cash_price >= ${options.minPrice}`);
    }
    if (options.maxPrice !== undefined && options.maxPrice < 10000) {
      filters.push(`cash_price <= ${options.maxPrice}`);
    }

    const sortOption: string[] = [];
    if (options.sort === 'price_asc') sortOption.push('cash_price:asc');
    else if (options.sort === 'price_desc') sortOption.push('cash_price:desc');
    else if (options.sort === 'newest') sortOption.push('created_at:desc');

    // Attempt Meilisearch fast search
    try {
      const searchBody: any = {
        q: query,
        limit,
        offset,
        filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        sort: sortOption.length > 0 ? sortOption : undefined,
        attributesToHighlight: ['name', 'model_name', 'brand'],
        highlightPreTag: '<mark class="bg-yellow-200 text-slate-900 rounded px-0.5">',
        highlightPostTag: '</mark>',
      };

      const res = await this.requestMeili('/indexes/products/search', {
        method: 'POST',
        body: JSON.stringify(searchBody),
      });

      return {
        engine: 'meilisearch',
        hits: res.hits || [],
        totalHits: res.estimatedTotalHits || res.hits?.length || 0,
        processingTimeMs: res.processingTimeMs || 0,
        query,
      };
    } catch (err: any) {
      this.logger.warn(`Meilisearch query failed (${err.message}). Falling back to PostgreSQL.`);
      return this.fallbackSqlSearch(options);
    }
  }

  async suggest(query: string, limit = 5) {
    const q = (query || '').trim();
    if (!q) return { hits: [], total: 0 };

    try {
      const res = await this.requestMeili('/indexes/products/search', {
        method: 'POST',
        body: JSON.stringify({
          q,
          limit,
          filter: 'is_active = true',
          attributesToHighlight: ['name', 'model_name', 'brand'],
          highlightPreTag: '<span class="text-[#4f533b] font-black">',
          highlightPostTag: '</span>',
        }),
      });

      return {
        engine: 'meilisearch',
        hits: res.hits || [],
        total: res.estimatedTotalHits || res.hits?.length || 0,
        processingTimeMs: res.processingTimeMs || 0,
      };
    } catch (e) {
      return this.fallbackSqlSuggest(q, limit);
    }
  }

  // PostgreSQL fallback search when Meilisearch is not reachable
  private async fallbackSqlSearch(options: SearchOptions) {
    const q = `%${(options.query || '').toLowerCase()}%`;
    const res = await this.db.query(
      `SELECT * FROM products
       WHERE is_active = true
         AND (LOWER(name) LIKE $1 OR LOWER(model_name) LIKE $1 OR LOWER(brand) LIKE $1)
       ORDER BY created_at DESC
       LIMIT $2`,
      [q, options.limit || 20],
    );

    return {
      engine: 'postgres_fallback',
      hits: res.rows || [],
      totalHits: res.rows?.length || 0,
      processingTimeMs: 15,
      query: options.query || '',
    };
  }

  private async fallbackSqlSuggest(q: string, limit: number) {
    const pattern = `%${q.toLowerCase()}%`;
    const res = await this.db.query(
      `SELECT id, name, model_name, brand, cash_price, old_price, image
       FROM products
       WHERE is_active = true
         AND (LOWER(name) LIKE $1 OR LOWER(model_name) LIKE $1 OR LOWER(brand) LIKE $1)
       LIMIT $2`,
      [pattern, limit],
    );

    return {
      engine: 'postgres_fallback',
      hits: res.rows || [],
      total: res.rows?.length || 0,
      processingTimeMs: 15,
    };
  }
}
