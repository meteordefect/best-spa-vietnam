/**
 * Test script to compare the new combined score sorting algorithm
 * with the previous rating-only sorting method.
 * 
 * This script:
 * 1. Loads restaurant data from a specified city
 * 2. Sorts using both the old and new methods
 * 3. Displays the top restaurants from each method for comparison
 * 4. Shows how the ranking has changed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CITY_TO_TEST = 'da-nang'; // Change this to test different cities
const NUM_RESTAURANTS_TO_SHOW = 10;

// Calculate the combined score (same as in restaurantUtils.ts)
function calculateCombinedScore(restaurant) {
  const average = restaurant.rating?.average ?? 0;
  const count = restaurant.rating?.count ?? 0;
  
  if (average === 0 || count === 0) return 0;
  
  // Constants for the algorithm
  const MAX_RATING = 5;
  const COUNT_WEIGHT = 0.3;
  const RATING_WEIGHT = 0.7;
  const COUNT_SCALING = 100;
  
  // Normalize count to a 0-1 scale with diminishing returns
  const normalizedCount = Math.min(count / COUNT_SCALING, 1);
  
  // Normalize rating to a 0-1 scale
  const normalizedRating = average / MAX_RATING;
  
  // Calculate weighted score components
  const ratingComponent = normalizedRating * RATING_WEIGHT;
  const countComponent = normalizedCount * COUNT_WEIGHT;
  
  // Combined score (0-1 scale)
  const combinedScore = ratingComponent + countComponent;
  
  // Convert back to the original rating scale (0-5)
  return combinedScore * MAX_RATING;
}

// Load restaurant data
const cityDataPath = path.join(__dirname, '..', 'data', 'cities', `${CITY_TO_TEST}.json`);
let restaurants = [];

try {
  const data = fs.readFileSync(cityDataPath, 'utf8');
  restaurants = JSON.parse(data);
  console.log(`Loaded ${restaurants.length} restaurants from ${CITY_TO_TEST}`);
} catch (error) {
  console.error(`Error loading data for city ${CITY_TO_TEST}:`, error);
  process.exit(1);
}

// Sort by rating only (old method)
const sortedByRatingOnly = [...restaurants].sort((a, b) => {
  const aRating = a.rating?.average ?? 0;
  const bRating = b.rating?.average ?? 0;
  return bRating - aRating;
});

// Sort by combined score (new method)
const restaurantsWithScore = restaurants.map(r => {
  const combinedScore = calculateCombinedScore(r);
  return { ...r, combinedScore };
});

const sortedByCombinedScore = [...restaurantsWithScore].sort((a, b) => {
  return (b.combinedScore || 0) - (a.combinedScore || 0);
});

// Print comparison table
console.log('\n=== COMPARISON OF SORTING METHODS ===\n');
console.log('| Rank | Rating-Only Method                  | Combined Score Method                |');
console.log('|------|--------------------------------------|-------------------------------------|');

for (let i = 0; i < NUM_RESTAURANTS_TO_SHOW; i++) {
  if (i >= sortedByRatingOnly.length || i >= sortedByCombinedScore.length) break;
  
  const ratingOnlyRestaurant = sortedByRatingOnly[i];
  const combinedScoreRestaurant = sortedByCombinedScore[i];
  
  // Find the position change
  const oldPosition = sortedByRatingOnly.findIndex(r => r.id === combinedScoreRestaurant.id);
  const positionChange = oldPosition - i;
  let positionIndicator = '';
  
  if (positionChange > 0) {
    positionIndicator = `↑${positionChange}`; // Moved up
  } else if (positionChange < 0) {
    positionIndicator = `↓${Math.abs(positionChange)}`; // Moved down
  } else {
    positionIndicator = '―'; // No change
  }
  
  console.log(
    `| ${(i + 1).toString().padEnd(4)} | ` +
    `${ratingOnlyRestaurant.name.substring(0, 25).padEnd(25)} ` +
    `(${ratingOnlyRestaurant.rating?.average || 0}★, ${ratingOnlyRestaurant.rating?.count || 0}) | ` +
    `${combinedScoreRestaurant.name.substring(0, 25).padEnd(25)} ` +
    `(${combinedScoreRestaurant.rating?.average || 0}★, ${combinedScoreRestaurant.rating?.count || 0}) ${positionIndicator.padStart(3)} |`
  );
}

// Print detailed analysis of the top restaurants with combined score
console.log('\n=== DETAILED ANALYSIS OF TOP RESTAURANTS (COMBINED SCORE) ===\n');
console.log('| Rank | Restaurant                      | Rating | Reviews | Combined Score | Details                  |');
console.log('|------|--------------------------------|--------|---------|----------------|--------------------------|');

for (let i = 0; i < NUM_RESTAURANTS_TO_SHOW; i++) {
  if (i >= sortedByCombinedScore.length) break;
  
  const restaurant = sortedByCombinedScore[i];
  const rating = restaurant.rating?.average || 0;
  const count = restaurant.rating?.count || 0;
  
  // Calculate the components of the score for explanation
  const MAX_RATING = 5;
  const COUNT_WEIGHT = 0.3;
  const RATING_WEIGHT = 0.7;
  const COUNT_SCALING = 100;
  
  const normalizedCount = Math.min(count / COUNT_SCALING, 1);
  const normalizedRating = rating / MAX_RATING;
  
  const ratingComponent = normalizedRating * RATING_WEIGHT * MAX_RATING;
  const countComponent = normalizedCount * COUNT_WEIGHT * MAX_RATING;
  
  console.log(
    `| ${(i + 1).toString().padEnd(4)} | ` +
    `${restaurant.name.substring(0, 30).padEnd(30)} | ` +
    `${rating.toFixed(1).padEnd(6)} | ` +
    `${count.toString().padEnd(7)} | ` +
    `${restaurant.combinedScore.toFixed(2).padEnd(14)} | ` +
    `${ratingComponent.toFixed(2)} (rating) + ${countComponent.toFixed(2)} (count) |`
  );
}

console.log('\nNote: The combined score algorithm weights rating at 70% and review count at 30%');
console.log('Review count is normalized with diminishing returns after 100 reviews');
