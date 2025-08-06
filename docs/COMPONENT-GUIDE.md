# Component Architecture Guide

## Core Components

### 1. RestaurantCard
```
+----------------------------------+
|  [Price Badge]    Restaurant Name|
|----------------------------------+
|  ★★★★☆ 4.5 (1234 reviews)      |
|  Score: 92.5                     |
|----------------------------------+
|  123 Restaurant Street,          |
|  District Name                   |
|----------------------------------+
|  View Details →                  |
+----------------------------------+
```

Key Features:
- Dynamic star rating system
- Price indicator ($ to $$$$)
- Smart text truncation
- Hover animations
- Combined score display
- Responsive layout

Implementation Details:
```astro
<div class="bg-white rounded-lg shadow-md">
  <!-- Price Badge -->
  <span class="bg-orange-50 text-orange-700">
    {priceDisplay}
  </span>

  <!-- Rating Stars -->
  <div class="flex text-yellow-400">
    <!-- Dynamic star generation -->
  </div>

  <!-- Location Info -->
  <div class="text-gray-600">
    <!-- Address and district -->
  </div>
</div>
```

### 2. CityNavigation
```
+----------------------------------+
|  Districts in [City Name]        |
|----------------------------------+
|  [District 1] [District 2]       |
|  [District 3] [District 4]       |
+----------------------------------+
```

Key Features:
- Flexible grid layout
- Interactive district buttons
- Responsive wrapping
- Hover state transitions

Implementation Details:
```astro
<div class="flex flex-wrap gap-2">
  <!-- District buttons with hover effects -->
  <a class="bg-orange-100 hover:bg-white">
    {district.name}
  </a>
</div>
```

## Component Interactions

### Homepage Flow
```
MainLayout
└── Hero Section
    └── Popular Cities
        └── CityNavigation
            └── RestaurantCard Grid
```

### City Page Flow
```
MainLayout
└── CityNavigation
    └── District Sections
        └── RestaurantCard Grid
```

## Styling Guidelines

### Color System
```css
/* Primary Colors */
.orange-primary: #f97316 (orange-500)
.orange-light: #ffedd5 (orange-100)
.orange-dark: #c2410c (orange-700)

/* Background Colors */
.bg-white: #ffffff
.bg-gray-50: #f9fafb
.bg-orange-50: #fff7ed

/* Text Colors */
.text-gray-900: #111827 (headers)
.text-gray-600: #4b5563 (body)
.text-orange-600: #ea580c (links)
```

### Typography Scale
```css
/* Headers */
.text-5xl: 3rem (Hero)
.text-3xl: 1.875rem (Section Headers)
.text-xl: 1.25rem (Card Titles)
.text-base: 1rem (Body Text)
.text-sm: 0.875rem (Meta Info)
```

### Spacing System
```css
/* Component Spacing */
.p-5: 1.25rem (Card Padding)
.gap-2: 0.5rem (Grid Gap)
.mb-4: 1rem (Vertical Spacing)
```

### Interactive States
```css
/* Hover Effects */
.hover:shadow-lg
.hover:bg-orange-50
.hover:text-orange-700
.group-hover:translate-x-1
```

## Animation Specifications

### Transitions
```css
/* Card Hover */
.transition-all
.duration-300

/* Button Hover */
.transition-colors
.duration-200

/* Arrow Movement */
.transition-transform
.duration-300
```

## Responsive Breakpoints
```css
/* Mobile First */
Base: 0-639px
sm: 640px+
md: 768px+
lg: 1024px+
xl: 1280px+
```

## Performance Considerations

1. Image Optimization
- WebP format with fallbacks
- Lazy loading implementation
- Thumbnail generation

2. Component Loading
- Static generation
- Minimal client JavaScript
- Efficient prop passing

3. Style Optimization
- Purged unused styles
- Critical CSS extraction
- Efficient class reuse
