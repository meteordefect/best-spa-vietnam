# "Pho Near Me" Vietnam Website

Welcome to the documentation for the "Pho Near Me" Vietnam website project. This repository contains a Next.js-based static website designed to help people find authentic pho restaurants across Vietnam.

## Quick Start

1. Clone this repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Build and Deploy

The site uses a three-phase build process to handle its large scale (17,767 restaurants) efficiently:

```bash
# Phase 1: Build and deploy homepage + city pages (31 cities)
npm run deploy:cities

# Phase 2: Build and deploy district pages (165 districts)
npm run deploy:districts

# Phase 3: Build and deploy restaurant pages in batches
npm run deploy:restaurants -- <batch_number>  # 0-177 (100 restaurants per batch)
```

For detailed build documentation, see [README-phased-build.md](infra/README-phased-build.md).

## Documentation Structure

Our documentation is organized into several specialized files:

- [Technical Documentation](TECHNICAL.md) - Platform, architecture, and technical foundation
- [Design Documentation](DESIGN.md) - Design principles and content strategy
- [Data Documentation](DATA.md) - Data management and static page generation
- [Maps Documentation](MAPS.md) - Static maps implementation with Geoapify
- [Business Documentation](BUSINESS.md) - Monetization strategy
- [Phased Build Documentation](infra/README-phased-build.md) - Detailed build and deployment process

## Project Overview

"Pho Near Me" is a static website built with Next.js that helps users find authentic pho restaurants across Vietnam. The site features:

### Administrative Structure

The site recognizes two distinct administrative structures in Vietnamese cities:

- **Two-Tier Cities** (City → Wards): Cities like Vũng Tàu, Đà Lạt, and Nha Trang have wards (phường) and communes (xã) directly under city government without district-level divisions.
- **Three-Tier Cities** (City → Districts → Wards): Major cities like Hà Nội, Hồ Chí Minh City, Đà Nẵng, Hải Phòng, and Cần Thơ maintain district-level administration.

This distinction affects how we organize location data and generate pages. For detailed information, see [Data Documentation](DATA.md) and [data/DATA-README.md](data/DATA-README.md).

### Important Git Waypoints

- **Pre-Data Structure Optimization**: If you need to revert to the state before major data structure changes, use:
  ```bash
  git checkout try-to-optimise-client-side
  ```
  This branch represents the last stable version before optimizing the client-side data handling.


- Pre-rendered static pages for optimal performance
- Mobile-first design for tourists and locals
- Integrated maps for easy restaurant location
- Comprehensive restaurant information
- SEO-optimized content structure
- Google AdSense integration for monetization

### Site Structure

- Homepage with featured cities and search
- 31 city pages with local specialties and guides
- For three-tier cities: District pages with neighborhood insights
- For two-tier cities: Ward/commune pages with local information
- 17,767 detailed restaurant pages
- Each page optimized for SEO and performance

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting any changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
