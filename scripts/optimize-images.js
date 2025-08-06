import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Directories to process
const directories = [
  {
    sourceDir: path.join(process.cwd(), 'public', 'phostyle'),
    outputDir: path.join(process.cwd(), 'public', 'phostyle', 'optimized')
  },
  {
    sourceDir: path.join(process.cwd(), 'public'),
    outputDir: path.join(process.cwd(), 'public', 'optimized'),
    // Only process specific files in the public directory
    specificFiles: ['phostore1.jpg', 'phostore2.jpg', 'phostreet.jpg']
  }
];

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
    
    // Skip if the file is in the optimized directory
    if (inputPath.includes('optimized')) continue;
    
    // Create WebP version
    const webpOutputPath = path.join(outputDir, `${fileNameWithoutExt}.webp`);
    console.log(`Optimizing: ${file} -> ${path.basename(webpOutputPath)}`);
    
    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .resize({ width: 1200, withoutEnlargement: true })
        .toFile(webpOutputPath);
      
      // Also create a smaller thumbnail version for cards
      const thumbOutputPath = path.join(outputDir, `${fileNameWithoutExt}-thumb.webp`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .resize({ width: 600, height: 400, fit: 'cover' })
        .toFile(thumbOutputPath);
      
      console.log(`✅ Created: ${path.basename(webpOutputPath)} and ${path.basename(thumbOutputPath)}`);
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
