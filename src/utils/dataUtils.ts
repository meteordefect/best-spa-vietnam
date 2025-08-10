import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always use the original data directory, not the dist directory
// This ensures data is accessible during both development and build
const dataDir = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'data') // Use absolute path in production
  : path.join(__dirname, '../../data'); // Use relative path in development

// Log the data directory path for debugging
console.log(`Data directory path: ${dataDir}`);

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  console.error(`Data directory not found: ${dataDir}`);
  console.error(`Current working directory: ${process.cwd()}`);
  console.error(`__dirname: ${__dirname}`);
}

/**
 * Load city data from JSON file
 * @param {string} citySlug - The city slug
 * @returns {any[]} Array of restaurants in the city
 */
export function loadCityData(citySlug: string): any[] {
  try {
    const filePath = path.join(dataDir, 'cities', `${citySlug}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error loading data for city ${citySlug}:`, error);
    return [];
  }
}

/**
 * Load division data from JSON file
 * @param {string} citySlug - The city slug
 * @param {string} divisionSlug - The division slug
 * @returns {any[]} Array of restaurants in the division
 */
export function loadDivisionData(citySlug: string, divisionSlug: string): any[] {
  try {
    const filePath = path.join(dataDir, 'divisions', citySlug, `${divisionSlug}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error loading data for division ${divisionSlug} in city ${citySlug}:`, error);
    return [];
  }
}

/**
 * Get all city slugs
 * @returns {string[]} Array of city slugs
 */
export function getAllCitySlugs(): string[] {
  try {
    const citiesDir = path.join(dataDir, 'cities');
    return fs.readdirSync(citiesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error getting city slugs:', error);
    return [];
  }
}

/**
 * Get all division slugs for a city
 * @param {string} citySlug - The city slug
 * @returns {string[]} Array of division slugs
 */
export function getAllDivisionSlugs(citySlug: string): string[] {
  try {
    const divisionsDir = path.join(dataDir, 'divisions', citySlug);
    return fs.readdirSync(divisionsDir)
      .filter(file => file.endsWith('.json') && file !== 'divisions.json')
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error(`Error getting division slugs for city ${citySlug}:`, error);
    return [];
  }
}
