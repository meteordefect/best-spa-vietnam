#!/usr/bin/env node

/**
 * Optimize Spa Images Script
 * 
 * This script converts all JPG images in the public directory to WebP format
 * at 80% quality without creating thumbnails, preserving original dimensions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if cwebp is installed
try {
  execSync('which cwebp', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: cwebp is not installed. Please install it first:');
  console.error('  brew install webp');
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, '../public');

// Function to process a directory recursively
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
      // Process JPG files
      const baseName = path.basename(file, path.extname(file));
      const webpPath = path.join(directory, `${baseName}.webp`);
      
      // Skip if webp already exists
      if (fs.existsSync(webpPath)) {
        console.log(`Skipping ${filePath} (WebP already exists)`);
        return;
      }
      
      try {
        // Convert to WebP at 80% quality
        console.log(`Converting ${filePath} to WebP...`);
        execSync(`cwebp -q 80 "${filePath}" -o "${webpPath}"`);
        console.log(`Created ${webpPath}`);
      } catch (error) {
        console.error(`Error converting ${filePath}:`, error.message);
      }
    }
  });
}

console.log('Starting image optimization...');
processDirectory(PUBLIC_DIR);
console.log('Image optimization complete!');
