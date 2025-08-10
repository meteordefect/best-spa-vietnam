#!/usr/bin/env node

/**
 * copy-data-to-dist.js
 * Copies data files to the dist directory during build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  sourceDataDir: path.join(process.cwd(), 'data'),
  targetDataDir: path.join(process.cwd(), 'dist', 'data')
};

// Create target directory if it doesn't exist
function createTargetDirectory() {
  if (!fs.existsSync(config.targetDataDir)) {
    fs.mkdirSync(config.targetDataDir, { recursive: true });
    console.log(`Created directory: ${config.targetDataDir}`);
  }
}

// Copy directory recursively
function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${sourcePath} -> ${targetPath}`);
    }
  }
}

// Main function
function copyDataToDist() {
  console.log('=== Copying Data Files to Dist ===');
  
  try {
    // Create target directory
    createTargetDirectory();
    
    // Copy cities directory
    const citiesSourceDir = path.join(config.sourceDataDir, 'cities');
    const citiesTargetDir = path.join(config.targetDataDir, 'cities');
    
    if (fs.existsSync(citiesSourceDir)) {
      copyDirectory(citiesSourceDir, citiesTargetDir);
      console.log(`✅ Copied cities data to: ${citiesTargetDir}`);
    } else {
      console.error(`❌ Cities data directory not found: ${citiesSourceDir}`);
    }
    
    // Copy any other necessary data directories
    // Add more directories as needed
    
    console.log(`\n🎉 Data Copy Complete!`);
    
  } catch (error) {
    console.error(`❌ Error copying data files:`, error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  copyDataToDist();
}

export { copyDataToDist };
