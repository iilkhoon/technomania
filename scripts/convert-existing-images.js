const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIRS = [
  path.join(__dirname, '../apps/web/public'),
  path.join(__dirname, '../apps/erp/public'),
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../media'),
  path.join(__dirname, '../apps/backend/uploads'),
];

async function convertFileToWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const webpPath = path.join(dir, `${baseName}.webp`);

  try {
    const originalStats = fs.statSync(filePath);
    await sharp(filePath)
      .webp({ quality: 80, effort: 4 })
      .toFile(webpPath);

    const newStats = fs.statSync(webpPath);
    console.log(`✓ Converted: ${path.relative(process.cwd(), filePath)} (${(originalStats.size / 1024).toFixed(1)} KB -> ${(newStats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`✗ Error converting ${filePath}:`, err.message);
  }
}

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      await convertFileToWebp(fullPath);
    }
  }
}

async function main() {
  console.log('🚀 Starting conversion of existing PNG/JPG/JPEG images to WebP...');
  for (const dir of TARGET_DIRS) {
    await processDirectory(dir);
  }
  console.log('🎉 Existing image conversion completed successfully!');
}

main();
