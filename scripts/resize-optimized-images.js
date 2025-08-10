import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and output directories
const sourceDir = path.join(process.cwd(), 'public');
const outputDir = path.join(process.cwd(), 'public', 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Images to optimize from performance report
const imagesToOptimize = [
  'spa9.webp',    // 217.4 KiB - displayed at 380x207
  'spa1.webp',    // 142.4 KiB - displayed at 380x207
  'spa14.webp',   // 58.4 KiB - displayed at 380x207
  'bestspavietnam.png', // 47.2 KiB - displayed at 64x64
  'spa16.webp',   // 49.0 KiB - displayed at 380x207
  'spa17.webp',   // 36.9 KiB - displayed at 380x207
  'spa5.webp',    // 43.7 KiB - displayed at 832x454
];

// Define target widths for responsive images
const responsiveWidths = [380, 640, 768, 1024];

// Process each image
async function processImages() {
  console.log('Starting image resizing for optimized versions...');
  
  for (const imageName of imagesToOptimize) {
    const inputPath = path.join(sourceDir, imageName);
    
    // Skip if file doesn't exist
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️ File not found: ${imageName}`);
      continue;
    }
    
    const fileExt = path.extname(imageName);
    const baseName = path.basename(imageName, fileExt);
    
    console.log(`Processing: ${imageName}`);
    
    try {
      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
      
      // Create specific sizes for responsive images
      for (const width of responsiveWidths) {
        // Skip if target width is larger than original
        if (width > metadata.width) {
          console.log(`Skipping ${width}px version (larger than original ${metadata.width}px)`);
          continue;
        }
        
        const outputPath = path.join(outputDir, `${baseName}-${width}${fileExt}`);
        
        // Calculate height to maintain aspect ratio
        const height = Math.round((metadata.height / metadata.width) * width);
        
        await sharp(inputPath)
          .resize({ width, height })
          .webp({ quality: 90 }) // Higher quality WebP output
          .toFile(outputPath);
          
        console.log(`✅ Created: ${baseName}-${width}${fileExt} (${width}x${height})`);
      }
      
      // Special case for bestspavietnam.png - create icon size
      if (imageName === 'bestspavietnam.png') {
        const iconPath = path.join(outputDir, `${baseName}-64${fileExt}`);
        await sharp(inputPath)
          .resize(64, 64)
          .toFile(iconPath);
          
        console.log(`✅ Created icon: ${baseName}-64${fileExt} (64x64)`);
        
        // Also create WebP version of the icon for better compression
        const iconWebpPath = path.join(outputDir, `${baseName}-64.webp`);
        await sharp(inputPath)
          .resize(64, 64)
          .webp({ quality: 95, lossless: true }) // Higher quality for logo
          .toFile(iconWebpPath);
          
        console.log(`✅ Created WebP icon: ${baseName}-64.webp (64x64)`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${imageName}:`, error);
    }
  }
}

// Run the processing
processImages()
  .then(() => console.log('Image resizing complete!'))
  .catch(err => console.error('Error during image resizing:', err));
