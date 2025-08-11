import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source directory
const sourceDir = path.join(process.cwd(), 'public');
const outputDir = path.join(process.cwd(), 'public'); // Output to the same directory

// Higher quality setting (90% instead of 75%)
const WEBP_QUALITY = 90;

// Process all thumbnail images
async function reoptimizeThumbnails() {
  console.log('🔍 Finding images to reoptimize...');
  
  // Find all jpg files in the public directory
  const imageFiles = fs.readdirSync(sourceDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg'].includes(ext) && !file.startsWith('.');
  });
  
  console.log(`📝 Found ${imageFiles.length} original JPG images to process`);
  
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const thumbOutputPath = path.join(outputDir, `${fileNameWithoutExt}-thumb.webp`);
    
    // Skip if original JPG doesn't exist
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️ Original image not found: ${file}`);
      continue;
    }
    
    console.log(`🔄 Reoptimizing thumbnail for: ${file}`);
    
    try {
      // Create a better quality thumbnail
      await sharp(inputPath)
        .resize({ width: 380, height: 207, fit: 'cover' })
        .webp({ quality: WEBP_QUALITY }) // Higher quality setting
        .toFile(thumbOutputPath + '.new');
      
      // Get file sizes for comparison
      const oldSize = fs.existsSync(thumbOutputPath) ? 
        (fs.statSync(thumbOutputPath).size / 1024).toFixed(2) : 'N/A';
      const newSize = (fs.statSync(thumbOutputPath + '.new').size / 1024).toFixed(2);
      
      // Replace the old thumbnail with the new one
      if (fs.existsSync(thumbOutputPath)) {
        fs.unlinkSync(thumbOutputPath);
      }
      fs.renameSync(thumbOutputPath + '.new', thumbOutputPath);
      
      console.log(`✅ Regenerated: ${fileNameWithoutExt}-thumb.webp (Old: ${oldSize} KB, New: ${newSize} KB)`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
}

// Execute the script
reoptimizeThumbnails().then(() => {
  console.log('✨ Thumbnail reoptimization complete! All thumbnails now have 90% quality instead of 75%.');
}).catch(err => {
  console.error('Error during thumbnail reoptimization:', err);
  process.exit(1);
});
