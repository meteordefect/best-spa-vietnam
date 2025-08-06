# Pho Near Me - Video Rebuild Guide

## Video Structure

### 1. Project Overview (5-7 minutes)
- Show the complete live site walkthrough
- Demonstrate key features:
  - Homepage layout and animations
  - City navigation
  - Restaurant listings
  - Individual restaurant pages
  - Mobile responsiveness

### 2. Setup & Configuration (10 minutes)
- Development environment setup
- Installing dependencies
- Project structure explanation
- Configuration files walkthrough

### 3. Component Building (15-20 minutes)
- MainLayout component
- Homepage sections:
  - Hero section
  - Features grid
  - Popular cities
  - Blog preview
  - About section
- Restaurant card component
- City page template
- Restaurant detail page

### 4. Styling Implementation (10-15 minutes)
- Tailwind configuration
- Custom color scheme
- Responsive design patterns
- Component-specific styles
- Animation implementation

### 5. Data Management (10 minutes)
- Data structure explanation
- JSON file organization
- Utility functions
- Static map integration

### 6. Deployment & Optimization (10 minutes)
- Build process
- Performance optimization
- SEO implementation
- AWS deployment walkthrough

## Recording Guidelines

1. Screen Setup
- Browser window at 1920x1080
- Dev tools docked to right (400px width)
- VSCode with file tree visible
- Terminal at bottom split

2. Key Demonstration Points
- Live coding of core components
- Real-time style adjustments
- Mobile view testing
- Performance testing
- Build process

3. Visual Aids
- Component tree diagram
- Data flow diagram
- Deployment architecture diagram

## Supplementary Materials

1. Create the following diagrams (using tools like draw.io):
```
docs/diagrams/
├── component-structure.svg    # Visual component hierarchy
├── data-flow.svg             # Data management flow
└── deployment-arch.svg       # AWS deployment architecture
```

2. Create checkpoints in code:
```
git-checkpoints/
├── 01-initial-setup/         # Basic project structure
├── 02-core-components/       # Main components implemented
├── 03-styling-complete/      # All styles added
├── 04-data-integration/      # Data management done
└── 05-deployment-ready/      # Final optimized version
```

3. Resource Links
- Astro documentation references
- Tailwind CSS examples
- AWS deployment guides
- Performance optimization tools

## Recording Sections in Detail

### 1. Project Overview
- Start with the completed site
- Show the responsive design in action
- Demonstrate the user flow
- Highlight key features and interactions

### 2. Setup & Configuration
```bash
# Show these commands in action
npm create astro@latest
npm install @astrojs/tailwind @astrojs/sitemap
npm install sharp axios
```

### 3. Component Building
- Start with base layout
- Build components incrementally
- Show component reuse
- Demonstrate props and data flow

### 4. Styling Deep Dive
- Show Tailwind utility classes
- Demonstrate responsive breakpoints
- Implement animations
- Optimize for mobile

### 5. Data Integration
- Create data structure
- Implement data loading
- Add static maps
- Optimize performance

### 6. Deployment
- Build optimization
- AWS configuration
- CloudFront setup
- Performance testing

## Post-Production

1. Chapter Markers
- Add timestamps for each section
- Include links to specific code points
- Reference relevant documentation

2. Resources Package
- Provide starter templates
- Include complete code repository
- Share utility scripts
- Add configuration files

3. Troubleshooting Guide
- Common issues and solutions
- Performance optimization tips
- Browser compatibility notes
- Development environment setup
