/**
 * Generate a URL-safe slug from a restaurant name
 * 
 * @param name The restaurant name
 * @returns The URL-safe slug
 */
export function generateRestaurantSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
