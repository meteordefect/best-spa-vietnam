#!/usr/bin/env node
/**
 * This script ensures that both sitemap.xml and sitemap-index.xml exist
 * It checks if sitemap-index.xml exists, and if not, copies sitemap.xml to sitemap-index.xml
 * It also checks if sitemap.xml exists, and if not, copies sitemap-index.xml to sitemap.xml
 */

import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const sitemapPath = path.join(distDir, 'sitemap.xml');
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');

console.log('Ensuring both sitemap.xml and sitemap-index.xml exist...');

// Check if the dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run build first.');
  process.exit(1);
}

// Check if sitemap.xml exists
const sitemapExists = fs.existsSync(sitemapPath);
// Check if sitemap-index.xml exists
const sitemapIndexExists = fs.existsSync(sitemapIndexPath);

if (sitemapExists && !sitemapIndexExists) {
  // Copy sitemap.xml to sitemap-index.xml
  console.log('Creating sitemap-index.xml from sitemap.xml');
  fs.copyFileSync(sitemapPath, sitemapIndexPath);
} else if (!sitemapExists && sitemapIndexExists) {
  // Copy sitemap-index.xml to sitemap.xml
  console.log('Creating sitemap.xml from sitemap-index.xml');
  fs.copyFileSync(sitemapIndexPath, sitemapPath);
} else if (!sitemapExists && !sitemapIndexExists) {
  console.error('Error: Neither sitemap.xml nor sitemap-index.xml exist after build.');
  process.exit(1);
} else {
  console.log('Both sitemap.xml and sitemap-index.xml already exist.');
}

console.log('Sitemap files check completed successfully.');
