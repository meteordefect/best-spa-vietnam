# Restaurant Sorting Algorithm

This document explains the smart scoring system used to rank restaurants on the Pho Near Me website.

## Overview

Our restaurant ranking algorithm uses a combined score that balances both the quality of ratings (average star rating) and the quantity of ratings (number of reviews). This approach ensures that:

1. Restaurants with excellent ratings are prominently featured
2. Restaurants with substantial customer feedback are given appropriate weight
3. New or less-reviewed restaurants with perfect scores don't automatically outrank established favorites
4. The system is resistant to manipulation from a small number of reviews

## The Combined Score Algorithm

The algorithm calculates a weighted score using the following approach:

```javascript
function calculateCombinedScore(restaurant) {
  const average = restaurant.rating?.average ?? 0;
  const count = restaurant.rating?.count ?? 0;
  
  if (average === 0 || count === 0) return 0;
  
  // Constants for the algorithm
  const MAX_RATING = 5;           // Maximum possible rating
  const COUNT_WEIGHT = 0.3;       // Weight given to the count component (0-1)
  const RATING_WEIGHT = 0.7;      // Weight given to the rating component (0-1)
  const COUNT_SCALING = 100;      // Value at which count reaches diminishing returns
  
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
```

## Key Features

### 1. Weighted Balance (70/30)

- **70% weight** is given to the average rating
- **30% weight** is given to the review count
- This balance ensures quality remains the primary factor while still considering popularity

### 2. Diminishing Returns for Review Count

- Review count is normalized with a cap at 100 reviews
- This prevents extremely popular restaurants from dominating solely based on review quantity
- Once a restaurant reaches 100 reviews, it has achieved the maximum "popularity boost"

### 3. Scale Normalization

- Both rating and count are normalized to a 0-1 scale before weighting
- The final score is converted back to the familiar 5-star scale for consistency

## Example Calculations

| Restaurant | Rating | Reviews | Rating Component | Count Component | Combined Score |
|------------|--------|---------|------------------|-----------------|---------------|
| Restaurant A | 5.0 | 150 | 3.50 | 1.50 | 5.00 |
| Restaurant B | 4.9 | 500 | 3.43 | 1.50 | 4.93 |
| Restaurant C | 5.0 | 10 | 3.50 | 0.30 | 3.80 |
| Restaurant D | 4.5 | 200 | 3.15 | 1.50 | 4.65 |

## Testing and Validation

A test script is available to compare the new combined score algorithm with the previous rating-only method:

```bash
node scripts/test-combined-score.js
```

This script:
1. Loads restaurant data from a specified city
2. Sorts using both the old and new methods
3. Displays the top restaurants from each method for comparison
4. Shows how the ranking has changed

## Implementation

The algorithm is implemented in `src/utils/restaurantUtils.ts` and is used by default on all city and district pages to provide the most relevant restaurant recommendations to users.
