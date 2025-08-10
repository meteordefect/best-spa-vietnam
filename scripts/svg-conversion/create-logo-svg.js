#!/usr/bin/env node

/**
 * Simple Logo SVG Creator
 * 
 * This script creates a simple SVG wrapper for the logo image
 * that maintains proper proportions and quality.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Original logo dimensions (from the file command)
  width: 788,
  height: 600,
  
  // Paths
  outputPath: path.join(process.cwd(), 'public', 'logo.svg'),
};

// Main function
async function createLogoSVG() {
  try {
    console.log('Creating SVG wrapper for logo...');
    
    // Create an SVG that embeds the PNG as an image
    const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" 
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Best Spa Vietnam Logo</title>
  <image width="${config.width}" height="${config.height}" xlink:href="/logo.png" />
</svg>`;
    
    // Write the SVG to file
    fs.writeFileSync(config.outputPath, svgContent);
    console.log(`SVG successfully created at: ${config.outputPath}`);
    
  } catch (error) {
    console.error('Error creating SVG:', error);
  }
}

// Run the function
createLogoSVG();
