#!/usr/bin/env node

/**
 * copy-data-to-dist.js
 * Copies data files to the dist directory during build
 * Enhanced with better error handling and verification
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

// Set NODE_ENV to production if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Create target directory if it doesn't exist
function createTargetDirectory() {
  if (!fs.existsSync(config.targetDataDir)) {
    fs.mkdirSync(config.targetDataDir, { recursive: true });
    console.log(`Created directory: ${config.targetDataDir}`);
  }
}

// Copy directory recursively with verification
function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log(`Created directory: ${target}`);
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  console.log(`Found ${entries.length} entries in ${source}`);

  let filesCopied = 0;
  let directoriesCopied = 0;

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourcePath, targetPath);
      directoriesCopied++;
    } else {
      try {
        // Copy files
        fs.copyFileSync(sourcePath, targetPath);
        
        // Verify the file was copied correctly
        if (fs.existsSync(targetPath)) {
          const sourceSize = fs.statSync(sourcePath).size;
          const targetSize = fs.statSync(targetPath).size;
          
          if (sourceSize === targetSize) {
            console.log(`✅ Copied: ${sourcePath} -> ${targetPath} (${sourceSize} bytes)`);
            filesCopied++;
          } else {
            console.error(`⚠️ File size mismatch: ${sourcePath} (${sourceSize} bytes) vs ${targetPath} (${targetSize} bytes)`);
          }
        } else {
          console.error(`❌ Failed to copy: ${sourcePath} -> ${targetPath}`);
        }
      } catch (error) {
        console.error(`❌ Error copying file ${sourcePath}: ${error.message}`);
      }
    }
  }

  console.log(`📊 Summary for ${source}: Copied ${filesCopied} files and processed ${directoriesCopied} directories`);
  return { filesCopied, directoriesCopied };
}

// Verify JSON files are valid
function verifyJsonFiles(directory) {
  const jsonFiles = [];
  
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.json')) {
        jsonFiles.push(fullPath);
      }
    }
  }
  
  scanDir(directory);
  console.log(`Found ${jsonFiles.length} JSON files to verify in ${directory}`);
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      JSON.parse(content); // Try to parse the JSON
      validCount++;
    } catch (error) {
      console.error(`❌ Invalid JSON file: ${file}`);
      console.error(`   Error: ${error.message}`);
      invalidCount++;
    }
  }
  
  console.log(`📊 JSON Verification: ${validCount} valid, ${invalidCount} invalid`);
  return { validCount, invalidCount };
}

// Main function
function copyDataToDist() {
  console.log('=== Copying Data Files to Dist ===');
  console.log(`Source: ${config.sourceDataDir}`);
  console.log(`Target: ${config.targetDataDir}`);
  
  try {
    // Verify source directory exists
    if (!fs.existsSync(config.sourceDataDir)) {
      console.error(`❌ Source data directory not found: ${config.sourceDataDir}`);
      process.exit(1);
    }
    
    // Create target directory
    createTargetDirectory();
    
    // Copy cities directory
    const citiesSourceDir = path.join(config.sourceDataDir, 'cities');
    const citiesTargetDir = path.join(config.targetDataDir, 'cities');
    
    if (fs.existsSync(citiesSourceDir)) {
      console.log(`🔍 Verifying source JSON files before copying...`);
      verifyJsonFiles(citiesSourceDir);
      
      const { filesCopied, directoriesCopied } = copyDirectory(citiesSourceDir, citiesTargetDir);
      console.log(`✅ Copied cities data to: ${citiesTargetDir} (${filesCopied} files in ${directoriesCopied} directories)`);
      
      console.log(`🔍 Verifying target JSON files after copying...`);
      verifyJsonFiles(citiesTargetDir);
    } else {
      console.error(`❌ Cities data directory not found: ${citiesSourceDir}`);
    }
    
    // Copy all-spas-final.json if it exists
    const allSpasSourcePath = path.join(config.sourceDataDir, 'all-spas-final.json');
    if (fs.existsSync(allSpasSourcePath)) {
      const allSpasTargetPath = path.join(config.targetDataDir, 'all-spas-final.json');
      fs.copyFileSync(allSpasSourcePath, allSpasTargetPath);
      console.log(`✅ Copied: ${allSpasSourcePath} -> ${allSpasTargetPath}`);
    }
    
    // Copy any other necessary data files or directories
    // Add more as needed
    
    console.log(`
🎉 Data Copy Complete!`);
    
    // List files in target directory to verify
    console.log(`
🔍 Verifying target directory contents:`);
    if (fs.existsSync(citiesTargetDir)) {
      const cityFiles = fs.readdirSync(citiesTargetDir);
      console.log(`Found ${cityFiles.length} files in ${citiesTargetDir}:`);
      cityFiles.forEach(file => console.log(` - ${file}`));
    } else {
      console.error(`❌ Target cities directory not found after copy: ${citiesTargetDir}`);
    }
    
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
