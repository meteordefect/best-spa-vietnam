# Technical Documentation

## Technical Foundation

- **Platform**: Next.js with static export (next export)
- **Hosting**: GitHub Pages or Netlify (free tier)
- **Domain**: phonearme.net (primary)
- **SEO Approach**: Static pre-rendered pages for all locations
- **GitHub Actions**: Automated build and deploy workflow

## Site Architecture

**URL Structure**:

- phonearme.net/ (homepage)
- phonearme.net/cities/[city-name]/ (city pages)
- phonearme.net/cities/[city-name]/districts/[district-name]/ (district pages)
- phonearme.net/restaurants/[restaurant-id]/ (restaurant pages)

> **Note**: We've moved away from dynamic routes (`[slug]`) to fully static pages for improved reliability and SEO. All pages are pre-rendered at build time.
