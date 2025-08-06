/**
 * Sort restaurants by average rating in descending order.
 * 
 * This means:
 * - Restaurants with higher ratings will appear first
 * - Restaurants with no ratings (0) will appear last
 * 
 * @param restaurants Array of restaurant objects
 * @returns Sorted array of normalized restaurant objects
 */
interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  districtOrWard?: string;
  ward?: string;
  adminDivision?: string;
  rating?: {
    average: number;
    count: number;
  };
  price: string;
  contact?: {
    phone?: string;
    website?: string;
  };
  hours?: Array<{
    day: string;
    hours: string;
  }>;
  location?: {
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Calculate a combined score for a restaurant based on both rating average and count.
 * 
 * This algorithm uses a weighted approach that:
 * 1. Gives primary weight to the average rating
 * 2. Factors in the number of ratings to boost restaurants with more reviews
 * 3. Ensures restaurants with high ratings but few reviews can still rank well
 * 4. Handles restaurants with no ratings appropriately
 * 
 * @param restaurant Restaurant object with rating data
 * @returns Combined score between 0-5
 */
function calculateCombinedScore(restaurant: Restaurant): number {
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

export function sortRestaurantsByScore(restaurants: Restaurant[]) {
  // First normalize all restaurants and filter out invalid ones
  const normalized = restaurants.map((r: Restaurant) => {
    const normalizedRestaurant = {
      id: r.id,
      name: r.name || "Restaurant",
      address: r.address || "Address not available",
      city: r.city || "",
      price: r.price || "$",
      rating: {
        average: r.rating?.average ?? 0,
        count: r.rating?.count ?? 0
      },
      contact: r.contact || { phone: undefined, website: undefined },
      hours: r.hours || [],
      location: {
        coordinates: r.location?.coordinates || { lat: 0, lng: 0 }
      },
      district: r.district || "",
      districtOrWard: r.districtOrWard || r.district || "Unknown District"
    };
    
    // Calculate and add the combined score
    const combinedScore = calculateCombinedScore(normalizedRestaurant);
    return {
      ...normalizedRestaurant,
      combinedScore
    };
  }).filter(r => {
    // Basic validation
    if (!r.id || !r.name || !r.address) return false;
    
    // Basic validation only - don't filter by district/ward
    // We want to show all restaurants regardless of district/ward
    
    return true;
  });
  
  // Sort by combined score in descending order
  return normalized.sort((a, b) => {
    return (b.combinedScore || 0) - (a.combinedScore || 0);
  });
}

/**
 * Generate a URL-safe slug from a restaurant name
 * 
 * @param name The restaurant name
 * @returns The URL-safe slug
 */
export function generateRestaurantSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
