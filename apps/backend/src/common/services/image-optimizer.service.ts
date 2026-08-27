import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class ImageOptimizerService {
  private readonly storageBasePath: string = process.env.STORAGE_PATH || '/var/www/techno-erp/storage';
  private readonly storagePublicUrl: string = process.env.STORAGE_URL || 'https://storage.techno-mania.az';

  constructor() {
    this.ensureStorageDir('products');
    this.ensureStorageDir('categories');
    this.ensureStorageDir('banners');
    this.ensureStorageDir('media');
  }

  private ensureStorageDir(folder: string) {
    const dir = path.join(this.storageBasePath, folder);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.error(`Failed to create storage directory ${dir}:`, e);
      }
    }
  }

  /**
   * Converts a base64 image string (data:image/...) to optimized WebP file on disk and returns the storage URL.
   */
  async saveBase64ToStorage(base64Str: string, folder = 'products'): Promise<string> {
    if (!base64Str || typeof base64Str !== 'string') return base64Str;

    // Already a public URL
    if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
      return base64Str;
    }

    const match = base64Str.match(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml|avif|heic);base64,(.+)$/i);
    if (!match) return base64Str;

    const imageBuffer = Buffer.from(match[2], 'base64');
    const filename = `img_${Date.now()}_${randomBytes(4).toString('hex')}.webp`;
    const targetDir = path.join(this.storageBasePath, folder);
    const targetPath = path.join(targetDir, filename);

    try {
      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      await sharp(imageBuffer)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(targetPath);

      return `${this.storagePublicUrl}/${folder}/${filename}`;
    } catch (e) {
      console.error('Failed to convert base64 image to webp file:', e);
      return base64Str;
    }
  }

  /**
   * Converts raw buffer to optimized WebP file on disk and returns the storage URL.
   */
  async saveBufferToStorage(
    buffer: Buffer,
    folder = 'products',
    filenamePrefix = 'file'
  ): Promise<{ url: string; filename: string; size: number }> {
    const filename = `${filenamePrefix}_${Date.now()}_${randomBytes(4).toString('hex')}.webp`;
    const targetDir = path.join(this.storageBasePath, folder);
    const targetPath = path.join(targetDir, filename);

    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    const info = await sharp(buffer)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(targetPath);

    return {
      url: `${this.storagePublicUrl}/${folder}/${filename}`,
      filename,
      size: info.size,
    };
  }

  /**
   * Converts buffer to WebP buffer in memory (legacy helper).
   */
  async processBuffer(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
    } catch (e) {
      console.error('Failed to convert image buffer to webp:', e);
      return buffer;
    }
  }

  /**
   * Recursively scans payload objects (products, categories, banners, media, site settings)
   * and converts any embedded base64 image data to optimized WebP on disk, replacing with storage URL.
   */
  async processObjectPayload(obj: any): Promise<any> {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item) => this.processObjectPayload(item)));
    }

    const result: any = { ...obj };
    for (const key of Object.keys(result)) {
      const val = result[key];
      if (typeof val === 'string' && val.startsWith('data:image/')) {
        const folder = key.includes('banner') ? 'banners' : (key.includes('cat') ? 'categories' : 'products');
        result[key] = await this.saveBase64ToStorage(val, folder);
      } else if (val && typeof val === 'object') {
        result[key] = await this.processObjectPayload(val);
      }
    }
    return result;
  }
}
