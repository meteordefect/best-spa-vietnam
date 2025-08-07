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
  // Support both old and new data structures
  rating?: number | {
    average: number;
    count: number;
  };
  reviewCount?: number;
  price?: string;
  // Direct properties for new data structure
  phone?: string;
  website?: string;
  // Old structure
  contact?: {
    phone?: string;
    website?: string;
  };
  hours?: Array<{
    day: string;
    hours: string;
  }>;
  // Support both old and new location structures
  location?: {
    lat?: number;
    lng?: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  combinedScore?: number;
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
  // Handle both old and new data structures
  let average = 0;
  let count = 0;
  
  // Check if rating is an object with average property (old structure)
  if (typeof restaurant.rating === 'object' && restaurant.rating !== null && 'average' in restaurant.rating) {
    average = restaurant.rating.average;
    count = restaurant.rating.count;
  } else {
    // New structure with direct rating number and reviewCount
    average = typeof restaurant.rating === 'number' ? restaurant.rating : 0;
    count = restaurant.reviewCount ?? 0;
  }
  
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
    // Handle both old and new data structures
    const isOldRatingStructure = typeof r.rating === 'object' && r.rating !== null && 'average' in r.rating;
    
    // Extract rating and count from either structure
    const ratingValue = isOldRatingStructure ? (r.rating as {average: number}).average : (r.rating as number) || 0;
    const reviewCountValue = isOldRatingStructure ? (r.rating as {count: number}).count : r.reviewCount || 0;
    
    // Handle both old and new location structures
    const locationCoordinates = r.location?.coordinates || { 
      lat: r.location?.lat || 0, 
      lng: r.location?.lng || 0 
    };
    
    const normalizedRestaurant = {
      id: r.id,
      name: r.name || "Restaurant",
      address: r.address || "Address not available",
      city: r.city || "",
      price: r.price || "$",
      // Use consistent structure for rating
      rating: ratingValue,
      reviewCount: reviewCountValue,
      // Handle both direct properties and nested contact object
      phone: r.phone || r.contact?.phone,
      website: r.website || r.contact?.website,
      hours: r.hours || [],
      location: {
        lat: locationCoordinates.lat,
        lng: locationCoordinates.lng
      },
      district: r.district || "",
      districtOrWard: r.districtOrWard || r.district || "Unknown District"
    };
    
    // Calculate and add the combined score
    const combinedScore = calculateCombinedScore({
      ...r,
      rating: ratingValue,
      reviewCount: reviewCountValue
    });
    
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
  return normalized.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
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
