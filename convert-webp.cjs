const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processImages(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await processImages(fullPath);
    } else {
      if (/\.(png|jpe?g)$/i.test(fullPath)) {
        const ext = path.extname(fullPath);
        const webpPath = fullPath.substring(0, fullPath.lastIndexOf(ext)) + '.webp';
        console.log(`Converting: ${fullPath} -> ${webpPath}`);
        try {
          await sharp(fullPath).webp({ quality: 80 }).toFile(webpPath);
        } catch (err) {
          console.error(`Error converting ${fullPath}:`, err);
        }
      }
    }
  }
}

processImages('./src/assets').then(() => {
  console.log('Conversion complete.');
}).catch(err => {
  console.error('Script failed:', err);
});
