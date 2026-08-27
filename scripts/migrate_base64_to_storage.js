const { Pool } = require('/var/www/techno-erp/apps/backend/node_modules/pg');
const sharp = require('/var/www/techno-erp/apps/backend/node_modules/sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_PATH = '/var/www/techno-erp/storage';
const PUBLIC_URL_BASE = 'https://storage.techno-mania.az';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/postgres';

const pool = new Pool({ connectionString: DB_URL });

function ensureDir(folder) {
  const dir = path.join(STORAGE_PATH, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function convertBase64ToWebpFile(base64Str, folder, prefix = 'img') {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) return base64Str;

  const match = base64Str.match(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml|avif|heic);base64,(.+)$/i);
  if (!match) return base64Str;

  const buffer = Buffer.from(match[2], 'base64');
  const filename = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.webp`;
  const targetDir = ensureDir(folder);
  const targetPath = path.join(targetDir, filename);

  try {
    await sharp(buffer)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(targetPath);

    return `${PUBLIC_URL_BASE}/${folder}/${filename}`;
  } catch (e) {
    console.error(`  ❌ Failed to convert base64 image:`, e.message);
    return base64Str;
  }
}

async function migrateProducts() {
  console.log('📦 Starting Products migration...');
  const res = await pool.query('SELECT id, name, image, images FROM products');
  let convertedCount = 0;
  let totalSavedBytes = 0;

  for (const row of res.rows) {
    let updated = false;
    let newImage = row.image;
    let newImages = row.images;

    // 1. Convert main image
    if (typeof row.image === 'string' && row.image.startsWith('data:image/')) {
      const origLen = row.image.length;
      newImage = await convertBase64ToWebpFile(row.image, 'products', `prod_${row.id}_main`);
      if (newImage !== row.image) {
        updated = true;
        convertedCount++;
        totalSavedBytes += (origLen - newImage.length);
      }
    }

    // 2. Convert images array
    let imagesArr = row.images;
    if (typeof imagesArr === 'string') {
      try { imagesArr = JSON.parse(imagesArr); } catch (e) { imagesArr = []; }
    }

    if (Array.isArray(imagesArr)) {
      const updatedImages = [];
      let imagesChanged = false;
      for (let i = 0; i < imagesArr.length; i++) {
        const img = imagesArr[i];
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          const origLen = img.length;
          const webpUrl = await convertBase64ToWebpFile(img, 'products', `prod_${row.id}_${i + 1}`);
          updatedImages.push(webpUrl);
          if (webpUrl !== img) {
            imagesChanged = true;
            convertedCount++;
            totalSavedBytes += (origLen - webpUrl.length);
          }
        } else if (typeof img === 'string') {
          updatedImages.push(img);
        }
      }
      if (imagesChanged) {
        newImages = updatedImages;
        updated = true;
      }
    }

    // If updated, write back to DB
    if (updated) {
      const imagesJson = JSON.stringify(Array.isArray(newImages) ? newImages : (newImage ? [newImage] : []));
      await pool.query(
        'UPDATE products SET image = $1, images = $2::jsonb WHERE id = $3',
        [newImage, imagesJson, row.id]
      );
      console.log(`  ✅ Updated product: ${row.name || row.id}`);
    }
  }

  console.log(`✨ Products completed: ${convertedCount} images converted to WebP, ~${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB of Base64 purged!`);
}

async function migrateCategories() {
  console.log('\n📂 Starting Categories migration...');
  try {
    const res = await pool.query('SELECT id, name, icon, image FROM categories');
    let converted = 0;
    for (const row of res.rows) {
      let updated = false;
      let newIcon = row.icon;
      let newImage = row.image;

      if (typeof row.icon === 'string' && row.icon.startsWith('data:image/')) {
        newIcon = await convertBase64ToWebpFile(row.icon, 'categories', `cat_${row.id}_icon`);
        if (newIcon !== row.icon) { updated = true; converted++; }
      }
      if (typeof row.image === 'string' && row.image.startsWith('data:image/')) {
        newImage = await convertBase64ToWebpFile(row.image, 'categories', `cat_${row.id}_img`);
        if (newImage !== row.image) { updated = true; converted++; }
      }

      if (updated) {
        await pool.query('UPDATE categories SET icon = $1, image = $2 WHERE id = $3', [newIcon, newImage, row.id]);
        console.log(`  ✅ Updated category: ${row.name}`);
      }
    }
    console.log(`✨ Categories completed: ${converted} images converted to WebP!`);
  } catch (e) {
    console.log('  ⚠️ Categories check skipped/not present:', e.message);
  }
}

async function migrateMedia() {
  console.log('\n🖼️ Starting Media Gallery migration...');
  try {
    const res = await pool.query('SELECT id, name, url FROM media');
    let converted = 0;
    for (const row of res.rows) {
      if (typeof row.url === 'string' && row.url.startsWith('data:image/')) {
        const newUrl = await convertBase64ToWebpFile(row.url, 'media', `media_${row.id}`);
        if (newUrl !== row.url) {
          await pool.query('UPDATE media SET url = $1 WHERE id = $2', [newUrl, row.id]);
          converted++;
          console.log(`  ✅ Updated media item: ${row.name || row.id}`);
        }
      }
    }
    console.log(`✨ Media Gallery completed: ${converted} items converted to WebP!`);
  } catch (e) {
    console.log('  ⚠️ Media table check skipped/not present:', e.message);
  }
}

async function run() {
  console.log('🚀 Starting Storage & WebP Database Migration...');
  ensureDir('products');
  ensureDir('categories');
  ensureDir('banners');
  ensureDir('media');

  await migrateProducts();
  await migrateCategories();
  await migrateMedia();

  await pool.end();
  console.log('\n🎉 ALL MIGRATIONS SUCCESSFULLY FINISHED!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
