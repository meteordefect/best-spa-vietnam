# "Pho Near Me" Vietnam Website

A comprehensive directory of authentic pho restaurants across Vietnam, built with Astro for optimal performance and SEO.

## Overview

"Pho Near Me" helps users discover authentic pho restaurants throughout Vietnam, featuring:

- 17,767 curated restaurant listings across Vietnam
- Detailed location information with static maps
- Mobile-first design for tourists and locals
- Comprehensive restaurant details and photos
- SEO-optimized content structure
- Integrated monetization through Google AdSense

## Project Structure

The site is organized hierarchically with individual pages for cities, administrative divisions, and restaurants:

### Navigation Structure
1. Cities Index → Lists all available cities
2. City Pages → Overview of restaurants in each city
3. Administrative Division Pages:
   - Districts (for three-tier cities)
   - Wards (for two-tier cities)
4. Restaurant Pages → Detailed information about each location:
   - Interactive cards on listing pages
   - Click-through to full restaurant details
   - Future integration of customer reviews


### Two-Tier Cities (City → Wards)
- Cities like Vũng Tàu, Đà Lạt, and Nha Trang
- Organized by wards (phường) and communes (xã)
- Direct city-to-ward navigation

### Three-Tier Cities (City → Districts → Wards)
- Major cities like Hà Nội, Hồ Chí Minh City, Đà Nẵng
- Organized by districts then wards
- Hierarchical navigation structure

## Data Organization

Our data structure is organized by administrative divisions:

```
data/
├── cities/              # City-level restaurant data
├── divisions/           # District/ward level data
└── stats/              # Statistical information
```

Each restaurant entry includes:
- Basic information (name, address, phone)
- Location data (coordinates, ward, district)
- Business details (hours, price range)
- Photos and static maps
- Ratings and reviews

## Quick Start

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Technical Documentation

For detailed technical information, see our specialized documentation:

- [Migration Guide](backup-readmes/MIGRATION-README.md) - Astro migration details
- [Data Structure](DATA.md) - Data management and organization
- [Maps Implementation](MAPS.md) - Static maps integration
- [AWS Deployment Guide](infra/AWS-DEPLOYMENT-GUIDE.md) - Complete AWS deployment instructions
  - **Important:** See the [CloudFront URL Handling section](infra/AWS-DEPLOYMENT-GUIDE.md#cloudfront-url-handling-for-astro-sites) for critical configuration to handle URLs without .html extensions

## Features

- Static site generation with Astro for optimal performance
- Individual restaurant pages with detailed information:
  - Location details with static maps
  - Business hours and contact information
  - Price range and specialties
  - Photos and reviews (coming soon)
- Interactive restaurant cards with hover effects
- Responsive design optimized for all devices
- Vietnamese language support and search
- SEO-optimized URL structure and content
- Efficient data organization by administrative divisions
- Smart restaurant ranking system based on rating and popularity:
  - Restaurants are sorted first by their rating (highest first)
  - When ratings are equal, restaurants with more reviews rank higher
  - This ensures the highest-quality restaurants appear first
  - Review count serves as a tiebreaker for equally-rated restaurants
  - Robust data validation ensures consistent display even with incomplete data

## Search Functionality

⚠️ **IMPORTANT: The search implementation is critical and should not be modified or removed** ⚠️

The search functionality is implemented in `src/components/SearchBar.astro` and includes several key features:

- **Vietnamese Character Support**: Normalizes Vietnamese diacritics for flexible matching
- **Debounced Search**: Implements a 250ms delay to prevent excessive searches and improve performance
- **Multi-device Compatibility**: Uses multiple initialization approaches to ensure reliable operation across devices:
  - DOMContentLoaded event
  - Immediate initialization if DOM is already loaded
  - 500ms delayed backup initialization for mobile devices
  - Window load event as final fallback
  - Mutation observer for dynamically loaded content
- **Robust Search Logic**:
  - Case-insensitive matching
  - Searches both restaurant names and addresses
  - Works with both original text and normalized (without diacritics) text
  - Shows/hides restaurant cards based on matches
  - Displays "No results" message when needed

The implementation ensures reliable search functionality across all devices while handling Vietnamese character specifics. The multiple initialization approaches are necessary to handle various loading scenarios and device behaviors.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
