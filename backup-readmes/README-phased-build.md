# Phased Build & Deployment Process

This document describes the three-phase build and deployment process implemented to optimize the build time and deployment of the phonearme.net website.

## Overview

The site is built and deployed in three distinct phases:

### Phase 1: Homepage and Cities
- Homepage with featured content
- All 31 city pages
- Core site structure and navigation

### Phase 2: District Pages
- All 165 district pages
- District-specific content and listings
- Local area guides

### Phase 3: Restaurant Pages
- 17,767 restaurant detail pages
- Built and deployed in batches of 100 pages
- Maximum 5 concurrent batch builds

## Build Process

### Phase 1: Homepage and Cities
```bash
# Build homepage and city pages
npm run build:cities

# Deploy Phase 1
cd infra && ./deploy-phased.sh cities
```

### Phase 2: Districts
```bash
# Build district pages
npm run build:districts

# Deploy Phase 2
cd infra && ./deploy-phased.sh districts
```

### Phase 3: Restaurants
```bash
# Build and deploy restaurant pages in batches
# <batch_number> is 0-177 (for ~17,767 restaurants with 100 per batch)
npm run build:restaurants -- <batch_number>
cd infra && ./deploy-phased.sh restaurants <batch_number>
```

## Memory Management

The build process has been optimized to handle memory constraints:

1. Reduced Batch Size
   - Restaurant pages built in batches of 100 (down from 500)
   - Prevents out-of-memory errors
   - More manageable chunk sizes

2. Memory Cleanup
   - Cleanup between builds: `rm -rf .next out`
   - Increased Node.js heap size: `NODE_OPTIONS="--max-old-space-size=8192"`
   - Garbage collection optimization

3. Parallel Processing
   - Maximum 5 concurrent batch builds
   - Balances speed and resource usage
   - Continues on batch failures

## Deployment Process

The deployment is handled by GitHub Actions and includes:

1. Infrastructure Setup
   - CloudFormation stack creation/update
   - S3 bucket configuration
   - CloudFront distribution setup

2. Sequential Deployment
   - Phase 1: Homepage and cities (immediate deployment)
   - Phase 2: Districts (after Phase 1 completes)
   - Phase 3: Restaurant batches (parallel deployment with limits)

3. Cache Control
   - Static Assets (images, CSS, JS)
     * Cache-Control: max-age=31536000,public
     * Cached for 1 year
   - HTML Pages
     * Cache-Control: max-age=0,no-cache,no-store,must-revalidate
     * No caching to ensure content freshness

## Progress Tracking

Build progress is tracked in build-progress.json:
```json
{
  "phase": 3,
  "lastProcessedIndex": 100,
  "totalRestaurants": 17767,
  "timestamp": "2024-03-07T07:45:00.000Z"
}
```

## GitHub Actions Workflow

The workflow is configured to:

1. Run phases sequentially:
   - Phase 1 (cities) must complete before Phase 2 (districts)
   - Phase 2 must complete before Phase 3 (restaurants)

2. Handle restaurant batches efficiently:
   - Parallel matrix strategy for batches
   - Maximum 5 concurrent jobs
   - Continues on batch failures

3. Manage resources:
   - 8GB Node.js heap size
   - Cleanup between builds
   - Proper error handling

## Manual Deployment

1. Deploy homepage and cities:
```bash
npm run deploy:cities
```

2. Deploy district pages:
```bash
npm run deploy:districts
```

3. Deploy restaurant batches:
```bash
npm run deploy:restaurants -- <batch_number>  # 0-177
```

## Benefits

1. Faster Initial Deployment
   - Core site structure available quickly
   - Users can start browsing immediately
   - Progressive enhancement of content

2. Resource Optimization
   - Reduced memory usage
   - Better error handling
   - Efficient parallel processing
   - Prevents build failures

3. Better Cache Management
   - Targeted invalidations
   - Optimized cache settings
   - Reduced CDN costs

4. Improved Monitoring
   - Detailed progress tracking
   - Batch-level error handling
   - Build logs per phase

5. Maintainability
   - Clear separation of concerns
   - Easy to debug specific phases
   - Simple rollback capabilities
