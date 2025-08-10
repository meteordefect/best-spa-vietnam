#!/usr/bin/env node

/**
 * Logo PNG to SVG Conversion Script
 * 
 * This script converts the logo.png file to a high-quality SVG
 * using the potrace library for vector tracing.
 * 
 * Requirements:
 * npm install potrace jimp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as potrace from 'potrace';
import { promisify } from 'util';

// Use require for Jimp since it has issues with ES modules
const require = createRequire(import.meta.url);
const Jimp = require('jimp');

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify potrace.trace
const tracePromise = promisify(potrace.trace);

// Configuration
const config = {
  // Paths
  inputPath: path.join(process.cwd(), 'public', 'logo.png'),
  outputPath: path.join(process.cwd(), 'public', 'logo.svg'),
  
  // Potrace options
  potraceOptions: {
    turdSize: 2,        // Suppress speckles of this size
    turnPolicy: 'black', // How to resolve ambiguities in path decomposition
    alphaMax: 1,        // Corner threshold parameter
    optCurve: true,     // Optimize curves
    optTolerance: 0.2,  // Curve optimization tolerance
    threshold: 128,     // Threshold below which colors are considered black
    blackOnWhite: true, // Specifies colors (true: black on white, false: white on black)
    color: '#000000',   // Fill color for black parts
    background: 'transparent' // Background color
  }
};

// Main function
async function convertLogoToSVG() {
  let tempPath = '';
  
  try {
    console.log('Starting logo conversion to SVG...');
    console.log(`Input file: ${config.inputPath}`);
    
    // Check if input file exists
    if (!fs.existsSync(config.inputPath)) {
      throw new Error(`Input file not found: ${config.inputPath}`);
    }
    
    // Process the image with Jimp first (for preprocessing if needed)
    const image = await Jimp.read(config.inputPath);
    
    // You can add preprocessing here if needed:
    // image.greyscale(); // for grayscale conversion
    // image.contrast(0.1); // to adjust contrast
    // image.brightness(0.1); // to adjust brightness
    
    // Create a temporary file for the processed image
    tempPath = path.join(process.cwd(), 'temp-logo-processed.png');
    await image.writeAsync(tempPath);
    
    // Trace the image with potrace
    const svg = await tracePromise(tempPath, config.potraceOptions);
    
    // Write the SVG to file
    fs.writeFileSync(config.outputPath, svg);
    console.log(`SVG successfully created at: ${config.outputPath}`);
    
    // Add viewBox attribute to maintain aspect ratio
    const dimensions = `0 0 ${image.getWidth()} ${image.getHeight()}`;
    let svgContent = fs.readFileSync(config.outputPath, 'utf8');
    svgContent = svgContent.replace('<svg', `<svg viewBox="${dimensions}"`);
    fs.writeFileSync(config.outputPath, svgContent);
    console.log('Added viewBox attribute for proper scaling');
    
  } catch (error) {
    console.error('Error converting logo to SVG:', error);
  } finally {
    // Clean up temporary file
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
      console.log('Temporary file cleaned up');
    }
  }
}

// Run the conversion
convertLogoToSVG();
