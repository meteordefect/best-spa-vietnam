import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to process
const directories = [
  {
    sourceDir: path.join(process.cwd(), 'public'),
    outputDir: path.join(process.cwd(), 'public', 'optimized'),
    // Specific files mentioned in performance report
    specificFiles: ['spa9.webp', 'spa1.webp', 'spa14.webp', 'bestspavietnam.png', 'spa16.webp', 'spa17.webp', 'spa5.webp']
  }
];

// Define responsive image widths
const RESPONSIVE_WIDTHS = [380, 640, 768, 1024, 1280];

// Define quality settings
const QUALITY_SETTINGS = {
  webp: 75,  // Slightly more aggressive compression for WebP
  jpg: 80,   // Good quality for JPG
  png: 85    // Higher quality for PNG to maintain transparency
};

// Process each directory
async function processDirectories() {
  for (const { sourceDir, outputDir, specificFiles } of directories) {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get all image files in the source directory
    let imageFiles = fs.readdirSync(sourceDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext) && !file.startsWith('.');
    });

    // If specificFiles is provided, only process those files
    if (specificFiles) {
      imageFiles = imageFiles.filter(file => specificFiles.includes(file));
    }

    console.log(`Found ${imageFiles.length} images to optimize in ${sourceDir}`);
    
    // Process each image in this directory
    await processImages(sourceDir, outputDir, imageFiles);
  }
}


// Process each image in a directory
async function processImages(sourceDir, outputDir, imageFiles) {
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const fileExt = path.extname(file).toLowerCase().substring(1);
    
    // Skip if the file is in the optimized directory
    if (inputPath.includes('optimized')) continue;
    
    console.log(`Optimizing: ${file} for responsive sizes`);
    
    try {
      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
      
      // Create responsive versions for each width
      for (const width of RESPONSIVE_WIDTHS) {
        // Skip if target width is larger than original (to avoid upscaling)
        if (width > metadata.width) continue;
        
        // Create WebP version (always create WebP as it's most efficient)
        const webpOutputPath = path.join(outputDir, `${fileNameWithoutExt}-${width}.webp`);
        await sharp(inputPath)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: QUALITY_SETTINGS.webp })
          .toFile(webpOutputPath);
        
        // If original is not WebP, also create a version in the original format
        if (fileExt !== 'webp') {
          const originalFormatPath = path.join(outputDir, `${fileNameWithoutExt}-${width}.${fileExt}`);
          await sharp(inputPath)
            .resize({ width, withoutEnlargement: true })
            [fileExt === 'png' ? 'png' : 'jpeg']({ 
              quality: fileExt === 'png' ? QUALITY_SETTINGS.png : QUALITY_SETTINGS.jpg 
            })
            .toFile(originalFormatPath);
        }
      }
      
      // Create special sizes for common use cases
      
      // Thumbnail for cards (380x207 as mentioned in performance report)
      const thumbOutputPath = path.join(outputDir, `${fileNameWithoutExt}-thumb.webp`);
      await sharp(inputPath)
        .resize({ width: 380, height: 207, fit: 'cover' })
        .webp({ quality: QUALITY_SETTINGS.webp })
        .toFile(thumbOutputPath);
      
      // Icon size (64x64 as mentioned in performance report)
      if (file === 'bestspavietnam.png') {
        const iconOutputPath = path.join(outputDir, `${fileNameWithoutExt}-icon.webp`);
        await sharp(inputPath)
          .resize({ width: 64, height: 64, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
          .webp({ quality: QUALITY_SETTINGS.webp, lossless: true })
          .toFile(iconOutputPath);
      }
      
      console.log(`✅ Created responsive versions for: ${file}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
}

processDirectories().then(() => {
  console.log('Image optimization complete!');
}).catch(err => {
  console.error('Error during image optimization:', err);
});
