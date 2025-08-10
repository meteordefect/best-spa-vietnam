#!/usr/bin/env node

/**
 * Logo Compression Script
 * 
 * Compresses logo-col.jpg to WebP format at multiple sizes for optimal usage
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

// Use require for sharp since it has better CommonJS support
const require = createRequire(import.meta.url);
const sharp = require('sharp');

// Configuration
const config = {
  inputFile: path.join(process.cwd(), 'public', 'logo-col.jpg'),
  outputDir: path.join(process.cwd(), 'public', 'optimized'),
  
  // Logo sizes to generate
  sizes: [
    { width: 64, height: 49, suffix: '64' },   // Header logo (small)
    { width: 80, height: 61, suffix: '80' },   // Header logo (medium)
    { width: 128, height: 98, suffix: '128' }, // Header logo (large/retina)
    { width: 200, height: 152, suffix: '200' }, // Hero sections
    { width: 400, height: 305, suffix: '400' }, // Large displays/retina
  ]
};

// Main function
async function compressLogo() {
  try {
    console.log('Starting logo compression...');
    console.log(`Input file: ${config.inputFile}`);
    
    // Check if input file exists
    if (!fs.existsSync(config.inputFile)) {
      throw new Error(`Input file not found: ${config.inputFile}`);
    }
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
      console.log(`Created output directory: ${config.outputDir}`);
    }
    
    // Process each size
    for (const size of config.sizes) {
      const outputFile = path.join(config.outputDir, `logo-${size.suffix}.webp`);
      
      console.log(`Generating ${size.width}x${size.height} version...`);
      
      await sharp(config.inputFile)
        .resize(size.width, size.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
          kernel: sharp.kernel.lanczos3, // Use high-quality Lanczos3 resampling
          withoutEnlargement: false
        })
        .sharpen(0.5, 1, 2) // Apply subtle sharpening
        .webp({
          quality: 95, // Higher quality
          effort: 6,
          smartSubsample: false, // Disable subsampling for better quality
          nearLossless: true // Use near-lossless compression
        })
        .toFile(outputFile);
      
      // Get file size
      const stats = fs.statSync(outputFile);
      console.log(`✓ Created ${outputFile} (${Math.round(stats.size / 1024)}KB)`);
    }
    
    console.log('\n🎉 Logo compression completed successfully!');
    console.log('\nGenerated files:');
    config.sizes.forEach(size => {
      console.log(`  - logo-${size.suffix}.webp (${size.width}x${size.height})`);
    });
    
    console.log('\nRecommended usage:');
    console.log('  Header logo: logo-64.webp or logo-80.webp');
    console.log('  Hero sections: logo-200.webp');
    console.log('  High-DPI displays: logo-128.webp or logo-400.webp');
    
  } catch (error) {
    console.error('Error compressing logo:', error);
    process.exit(1);
  }
}

// Run the compression
compressLogo();
