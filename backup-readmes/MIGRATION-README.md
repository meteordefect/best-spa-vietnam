# Migration to Astro: Design and Implementation Guide

## Overview

This document outlines the plan for migrating the Vietnamese Pho restaurant directory site from Next.js to Astro, while preserving the current design, layout, and functionality.

## What to Preserve

- **Data Structure**: Keep the existing data organization with city and administrative division (district/ward) structure
- **Visual Design**: Maintain the current UI design, color scheme, and layout
- **URL Structure**: Preserve the existing URL patterns for SEO purposes
- **Assets**: Retain all images, maps, and other static assets

## Migration Process

1. **Backup Current Project**:
   ```bash
   # Create a backup directory
   mkdir -p nextjs-backup
   
   # Copy everything except data, maps, and public images
   rsync -av --exclude='/data' --exclude='/public/maps' --exclude='/public/images' nextjs-project/ nextjs-backup/
   ```

2. **Initialize New Astro Project**:
   ```bash
   # Create new Astro project
   npm create astro@latest pho-astro -- --template minimal
   
   # Move into the project directory
   cd pho-astro
   
   # Install dependencies
   npm install
   ```

3. **Copy Preserved Directories**:
   ```bash
   # Create necessary directories
   mkdir -p public/maps public/images data
   
   # Copy data and assets from original project
   cp -r ../nextjs-project/data/* data/
   cp -r ../nextjs-project/public/maps/* public/maps/
   cp -r ../nextjs-project/public/images/* public/images/
   ```

4. **Set Up Project Structure** according to the structure outlined below

## Data Structure

The data follows two administrative structures:

1. **Two-Tier Administrative Structure (City → Wards)**:
   - For smaller cities (Vũng Tàu, Đà Lạt, Nha Trang, etc.)
   - Data organized by ward/commune rather than district

2. **Three-Tier Administrative Structure (City → Districts → Wards)**:
   - For major cities (Hà Nội, Hồ Chí Minh City, Đà Nẵng, etc.)
   - Data organized by district

Data files are organized as:
- `/data/cities/[city-slug].json` - All restaurants in a city
- `/data/divisions/[city-slug]/[division-slug].json` - Restaurants in a specific division (district or ward)
- `/data/divisions/[city-slug]/divisions.json` - List of all divisions in a city
- `/data/stats/[city-slug]-extraction-stats.json` - Ward extraction statistics

## Astro Project Structure

```
pho-astro/
├── public/
│   ├── maps/           # Map images for each restaurant
│   ├── images/         # Site images and restaurant photos
│   ├── logo.png        # Site logo
│   └── favicon.svg     # Site favicon
├── src/
│   ├── components/     # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── RestaurantCard.astro
│   │   ├── ImageWithFallback.astro
│   │   ├── AdSense.astro
│   │   └── ...
│   ├── layouts/        # Page layouts
│   │   ├── MainLayout.astro
│   │   └── ...
│   ├── pages/          # Routes
│   │   ├── index.astro                                # Homepage
│   │   ├── cities/
│   │   │   ├── index.astro                            # All cities page
│   │   │   ├── [city].astro                           # City page
│   │   │   └── [city]/
│   │   │       ├── districts/[district].astro         # District page (for 3-tier cities)
│   │   │       └── wards/[ward].astro                 # Ward page (for 2-tier cities)
│   │   └── restaurants/
│   │       └── [id].astro                             # Restaurant page
│   ├── utils/          # Utility functions
│   │   ├── vietnameseUtils.ts                         # Vietnamese text handling
│   │   ├── cityUtils.ts                               # City data processing
│   │   └── dataUtils.ts                               # Data loading utilities
│   └── styles/         # Global styles
│       └── global.css
├── data/               # Data files (copied from Next.js project)
│   ├── cities/
│   ├── divisions/
│   └── stats/
├── astro.config.mjs    # Astro configuration
└── package.json
```

## Design Specifications

### Color Scheme

- **Primary**: Orange (#f97316)
- **Primary Hover**: Dark Orange (#c2410c)
- **Secondary**: Gray (#6b7280)
- **Background**: White (#ffffff)
- **Background Alt**: Light Orange (#fff7ed)
- **Text**: Dark Gray (#1f2937)
- **Text Light**: Gray (#6b7280)

### Typography

- **Primary Font**: System font stack (sans-serif)
- **Headings**: Bold weight
- **Body**: Regular weight
- **Base Size**: 16px

### Component Designs

#### Header

- Logo on left (height: 64px)
- Site title next to logo
- Navigation links on right
- Orange background with white text
- Sticky position on scroll

#### Footer

- Simple design with site info and links
- Light gray background
- Padding: 2rem

#### Restaurant Card

- White background
- Shadow: sm
- Border radius: lg (0.5rem)
- Image at top (height: 160px, object-fit: cover)
- Padding: 1rem
- Rating stars in yellow (#facc15)
- Price in green (#16a34a)
- Hover effect: slight scale and shadow increase

#### City/District/Ward Pages

- Hero section with city/division name and description
- Grid of restaurant cards (3 columns on desktop, 2 on tablet, 1 on mobile)
- Sections divided by headings and spacing
- "Top Restaurants" section at top
- Price category sections below
- Content cards with light orange background

#### Restaurant Page

- Two-column layout on desktop (single column on mobile)
- Left column: Location, contact info, hours
- Right column: Reviews, photos
- Map image displayed prominently
- Rating stars in yellow
- Back navigation link at top

### Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Implementation Notes

### Data Loading in Astro

Astro makes it easy to load data at build time. Use the following pattern:

```astro
---
// src/pages/cities/[city].astro
import { readFile } from 'fs/promises';
import { join } from 'path';
import MainLayout from '../../layouts/MainLayout.astro';
import RestaurantCard from '../../components/RestaurantCard.astro';
import { isTwoTierCity, getCityInfo } from '../../utils/cityUtils';

export async function getStaticPaths() {
  // Read all city files and return paths
  const cityFiles = await readdir(join(process.cwd(), 'data', 'cities'));
  return cityFiles.map(file => {
    const citySlug = file.replace('.json', '');
    return { params: { city: citySlug } };
  });
}

const { city } = Astro.params;
const cityInfo = getCityInfo(city);

// Load city data
const cityDataPath = join(process.cwd(), 'data', 'cities', `${city}.json`);
const cityData = JSON.parse(await readFile(cityDataPath, 'utf-8'));

// Get top restaurants
const topRestaurants = [...cityData]
  .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
  .slice(0, 5);

// Get divisions based on city type
const isTwoTier = isTwoTierCity(city);
const divisionType = isTwoTier ? 'ward' : 'district';
const divisions = isTwoTier 
  ? [...new Set(cityData.map(r => r.ward))].filter(Boolean).sort()
  : [...new Set(cityData.map(r => r.district))].filter(Boolean).sort();
---

<MainLayout title={`Best Pho in ${cityInfo.name}`}>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">{cityInfo.name} Pho Guide</h1>
    <!-- Rest of the template -->
  </div>
</MainLayout>
```

### Vietnamese Text Handling

Port the existing Vietnamese text utilities to the Astro project:

```typescript
// src/utils/vietnameseUtils.ts
export function convertToSlug(text: string): string {
  if (!text) return '';
  
  // Vietnamese character mappings
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    // ... rest of the mapping
  };

  // Replace Vietnamese characters
  const normalized = text.split('').map(char => vietnameseMap[char] || char).join('');

  // Convert to lowercase and replace spaces and special characters with hyphens
  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### Tailwind CSS Integration

Astro works well with Tailwind CSS. Set it up with:

```bash
npx astro add tailwind
```

## Performance Optimizations

Astro's partial hydration model ("Islands Architecture") is perfect for this site:

- Most content is static and doesn't need JavaScript
- Interactive elements can be isolated as islands of hydration
- Use client directives only where needed:

```astro
<RestaurantFilter client:load />
```

## SEO Considerations

- Implement proper meta tags for each page
- Use Astro's built-in support for generating sitemaps
- Preserve existing URL structure
- Add structured data (JSON-LD) for restaurants

## Next Steps

1. Set up the basic Astro project structure
2. Implement the main layout and components
3. Create the homepage and city listing page
4. Implement the dynamic routes for cities, divisions, and restaurants
5. Add styling and responsive design
6. Test and optimize performance
7. Deploy the site

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Astro + Tailwind Integration](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
