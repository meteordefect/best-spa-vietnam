# SearchBar Component Documentation

This document provides comprehensive documentation for the SearchBar component, which can be integrated into other sites.

## Overview

The SearchBar component is a reusable Astro component that provides a search input field with real-time filtering functionality. It's designed to filter restaurant cards based on user input, with special handling for Vietnamese characters.

![Search Bar Component](../screenshots/components/searchbar.png)

## Component Structure

### UI Elements
- Search input field with placeholder text
- Search icon (SVG) positioned on the left side of the input

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Search for restaurants..." | Custom placeholder text for the search input |

## HTML Structure

```html
<div class="search-container mb-6">
  <div class="relative">
    <input 
      type="text" 
      id="restaurant-search" 
      placeholder={placeholder}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pl-10"
    />
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>
</div>
```

## JavaScript Functionality

The component includes client-side JavaScript that handles the search functionality:

### Key Functions

1. **normalizeVietnamese(str)**
   - Removes diacritics (accent marks) from Vietnamese text
   - Converts text to lowercase and trims whitespace
   - Improves search matching for Vietnamese characters

2. **debounce(func, wait)**
   - Limits how often the search function runs
   - Improves performance by preventing excessive DOM updates
   - Default debounce time: 250ms

3. **initializeSearch()**
   - Main function that sets up the search functionality
   - Gets the search input element
   - Attaches event listeners
   - Performs initial search if there's a value

4. **getRestaurantCards()**
   - Finds all elements with the class `.restaurant-card`
   - Logs a warning if no cards are found

5. **performSearch(searchTerm)**
   - Filters restaurant cards based on the search term
   - Normalizes both the search term and restaurant data
   - Shows/hides cards based on matches
   - Displays a "No results" message when no matches are found

### Initialization Strategy

The component uses multiple approaches to ensure the search is initialized properly:

1. DOMContentLoaded event
2. Immediate initialization if DOM is already loaded
3. Backup initialization with a 500ms delay
4. Window load event as a final fallback

This multi-layered approach ensures the search works reliably across different browsers and devices.

## Integration Guide

To integrate this SearchBar component into another site:

### 1. Copy the Component

Copy the `SearchBar.astro` file to your project's components directory.

### 2. Import and Use the Component

```astro
---
import SearchBar from '../components/SearchBar.astro';
---

<div class="container">
  <h1>Restaurant Listings</h1>
  
  <!-- Basic usage with default placeholder -->
  <SearchBar />
  
  <!-- With custom placeholder -->
  <SearchBar placeholder="Find your favorite restaurant..." />
  
  <!-- Restaurant cards container -->
  <div class="restaurant-grid">
    <!-- Restaurant cards go here -->
  </div>
</div>
```

### 3. Structure Your Restaurant Cards

For the search to work properly, your restaurant cards must:

1. Have the class `.restaurant-card`
2. Include `data-name` and `data-address` attributes

Example:

```html
<div class="restaurant-card" data-name="Pho Delicious" data-address="123 Main St, City">
  <h3>Pho Delicious</h3>
  <p>123 Main St, City</p>
  <!-- Other restaurant information -->
</div>
```

### 4. CSS Dependencies

The component uses Tailwind CSS classes. If your project doesn't use Tailwind, you'll need to add equivalent CSS styles.

## Browser Compatibility

The search functionality is designed to work across modern browsers and includes special handling for mobile devices:

- Multiple event listeners for better mobile compatibility
- Backup initialization strategies for unpredictable timing issues
- Debouncing to improve performance on lower-powered devices

## Customization Options

### Styling

The component uses Tailwind CSS classes that can be customized:
- Change the border color by modifying the `border-gray-300` class
- Adjust the focus ring color by changing `focus:ring-orange-500` and `focus:border-orange-500`
- Modify padding and spacing with the `px-4`, `py-2`, and `pl-10` classes

### Search Behavior

You can customize the search behavior by modifying the JavaScript:
- Adjust the debounce time (default: 250ms) for different performance characteristics
- Modify the search logic to include additional fields or different matching criteria
- Change the "No results" message text or styling

## Troubleshooting

Common issues and solutions:

1. **Search not working**
   - Check browser console for errors
   - Ensure restaurant cards have the correct class and data attributes
   - Verify the DOM structure matches what the search function expects

2. **Performance issues**
   - Increase the debounce time for large numbers of restaurant cards
   - Consider implementing pagination for very large datasets

3. **Mobile compatibility issues**
   - The component includes multiple initialization strategies, but if issues persist, try adjusting the timing of the backup initialization

## Advanced Usage

### Adding Additional Search Fields

To search through additional fields beyond name and address:

1. Add more data attributes to your restaurant cards:
   ```html
   <div class="restaurant-card" 
        data-name="Pho Delicious" 
        data-address="123 Main St, City"
        data-cuisine="Vietnamese"
        data-rating="4.5">
     <!-- Card content -->
   </div>
   ```

2. Modify the `performSearch` function to include these fields:
   ```javascript
   const normalizedCuisine = normalizeVietnamese(card.getAttribute('data-cuisine') || '');
   const normalizedRating = normalizeVietnamese(card.getAttribute('data-rating') || '');
   
   const isMatch = 
     normalizedName.includes(normalizedSearchTerm) || 
     normalizedAddress.includes(normalizedSearchTerm) ||
     normalizedCuisine.includes(normalizedSearchTerm) ||
     normalizedRating.includes(normalizedSearchTerm);
   ```

### Adding Search Filters

To add category filters alongside the text search:

1. Add filter buttons to your HTML
2. Add event listeners to these buttons
3. Combine the text search with the filter criteria

## Performance Considerations

- The search uses debouncing to limit DOM updates
- Consider implementing virtual scrolling for very large lists
- For extremely large datasets, consider server-side search instead
