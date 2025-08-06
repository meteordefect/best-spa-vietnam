# Maps Implementation Documentation

## Static Maps Implementation with Geoapify API

We've implemented static maps using the Geoapify Static Maps API, which provides high-quality OpenStreetMap-based images with customizable markers, zoom levels, and map styles.

### Why Geoapify?

- **High-quality maps**: Professional-looking maps based on OpenStreetMap data
- **Customizable markers**: Ability to add multiple markers with custom colors and sizes
- **Flexible parameters**: Control over zoom level, image size, and map style
- **Reliable service**: Stable API with good uptime and performance
- **Generous free tier**: 3,000 requests per day on the free plan

### Implementation Details

Our implementation is in the `download-maps.js` script, which:

1. Loads restaurant data from JSON files
2. For each restaurant, generates a static map URL with the restaurant's coordinates
3. Downloads the map image and saves it to the `public/maps` directory
4. Also generates city-level maps showing multiple restaurants

### Key Features

- **Accurate representation**: Deduplication ensures maps show the true distribution of restaurants
- **Fallback mechanism**: Graceful degradation if the API is unavailable
- **SEO-friendly**: Static images are easily indexed by search engines
- **URL Handling**: Automatic conversion of Vietnamese characters to URL-friendly English characters

### Fallback Mechanism

We've implemented a fallback mechanism that creates a simple HTML-based map if the Geoapify API request fails.
