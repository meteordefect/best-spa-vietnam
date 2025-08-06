#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load and parse a JSON file
function loadJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error.message);
    return null;
  }
}

// Test loading a city file
function testCityDataLoading(citySlug) {
  console.log(`\n=== Testing data loading for city: ${citySlug} ===`);
  
  const cityFilePath = path.join(path.resolve(__dirname, '..'), 'data', 'cities', `${citySlug}.json`);
  console.log(`Loading file: ${cityFilePath}`);
  
  if (!fs.existsSync(cityFilePath)) {
    console.error(`File does not exist: ${cityFilePath}`);
    return;
  }
  
  const restaurants = loadJsonFile(cityFilePath);
  if (!restaurants) {
    console.error('Failed to load or parse the file');
    return;
  }
  
  console.log(`Successfully loaded ${restaurants.length} restaurants`);
  
  // Check if restaurants have the expected properties
  if (restaurants.length > 0) {
    const firstRestaurant = restaurants[0];
    console.log('\nFirst restaurant properties:');
    console.log('- id:', firstRestaurant.id);
    console.log('- name:', firstRestaurant.name);
    console.log('- city:', firstRestaurant.city);
    console.log('- district:', firstRestaurant.district);
    console.log('- districtOrWard:', firstRestaurant.districtOrWard);
    
    // Count restaurants by district/ward
    const districtCounts = {};
    restaurants.forEach(r => {
      const district = r.districtOrWard || r.district || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });
    
    console.log('\nRestaurants by district/ward:');
    Object.entries(districtCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([district, count]) => {
        console.log(`- ${district}: ${count} restaurants`);
      });
  }
}

// Get the city slug from command line arguments or use a default
const citySlug = process.argv[2] || 'ho-chi-minh-city';
testCityDataLoading(citySlug);
