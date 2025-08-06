# Apify Google Maps Scraping Playbook

This playbook documents the process of using Apify to scrape restaurant data from Google Maps. It provides a step-by-step guide for implementing a similar solution in other projects.

## Overview

Apify is a web scraping and automation platform that provides tools for extracting data from websites. In this project, we used Apify's Google Maps Extractor actor to collect information about restaurants in Vietnam, including their locations, contact details, ratings, and reviews.

This playbook focuses exclusively on the data scraping aspect of our project, detailing how to use Apify to collect restaurant data from Google Maps.


## 1. Setting Up Apify

### 1.1 Create an Apify Account

1. Go to [https://apify.com/sign-up](https://apify.com/sign-up)
2. Sign up for an account
   - The free tier includes 10 actor compute units per month, which is sufficient for initial scraping needs
   - For larger projects, consider upgrading to a paid plan

### 1.2 Get Your API Token

1. After signing up and logging in, go to Account Settings
2. Navigate to the "Integrations" tab
3. Copy your Personal API Token
4. Keep this token secure as it provides access to your Apify account

## 2. Project Setup

### 2.1 Install Required Dependencies

```bash
npm install apify-client dotenv
```

### 2.2 Set Up Environment Variables

1. Create a `.env` file in the root of your project
2. Add your Apify API token:
   ```
   APIFY_API_TOKEN=your_api_token_here
   ```
3. Make sure to add `.env` to your `.gitignore` file to keep your token secure

### 2.3 Create the Basic Script Structure

Create a script (e.g., `scrape-restaurants.js`) with the following structure:

```javascript
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { ApifyClient } = require('apify-client');

// Apify API configuration
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const GOOGLE_MAPS_EXTRACTOR_ACTOR_ID = '2Mdma1N6Fd0y3QEjR';

// Main function to run the scraper
async function scrapeRestaurants() {
  // Implementation will go here
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  scrapeRestaurants()
    .then(() => console.log('Scraping completed'))
    .catch(error => console.error('Scraping failed:', error));
}

module.exports = {
  scrapeRestaurants
};
```

## 3. Implementing the Scraper

### 3.1 Define Target Locations

Define the cities and search queries you want to scrape:

```javascript
// Cities to scrape
const CITIES_TO_SCRAPE = [
  {
    name: 'Da Nang',
    searchQueries: [
      'pho restaurant in Da Nang, Vietnam',
      'best pho in Da Nang, Vietnam'
    ]
  },
  {
    name: 'Hanoi',
    searchQueries: [
      'pho restaurant in Hanoi, Vietnam',
      'best pho in Hanoi, Vietnam'
    ]
  },
  // Add more cities as needed
];
```

### 3.2 Implement Progress Tracking

To handle large scraping jobs and allow resuming from failures:

```javascript
// Progress tracking file
const PROGRESS_FILE = path.join(__dirname, 'scrape-progress.json');

// Function to load progress from file
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progressData = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log(`Loaded progress: ${progressData.completedCities.length} cities and ${progressData.completedQueries.length} queries completed`);
      return progressData;
    }
  } catch (error) {
    console.error('Error loading progress file:', error.message);
  }
  
  // Return default progress object if file doesn't exist or has errors
  return {
    completedCities: [],
    completedQueries: [],
    allRestaurants: []
  };
}

// Function to save progress to file
function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    console.log('Progress saved successfully');
  } catch (error) {
    console.error('Error saving progress:', error.message);
  }
}
```

### 3.3 Implement Data Transformation

Create functions to transform Apify results into your desired data structure:

```javascript
// Function to extract district from address
function extractDistrict(address, city) {
  // This is a simplified version - would need to be enhanced for production
  const districtMatches = address.match(/(?:District|Quận|Huyện)\s*(\w+)/i);
  if (districtMatches && districtMatches[1]) {
    return `District ${districtMatches[1]}`;
  }
  
  // Add logic to check for known districts in each city
  // ...
  
  return 'Unknown District';
}

// Function to generate a unique ID from restaurant name
function generateId(name, city) {
  // Convert to lowercase, remove special characters, replace spaces with hyphens
  const baseId = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  
  // Add city prefix to ensure uniqueness across cities
  const cityPrefix = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  
  return `${cityPrefix}-${baseId}`;
}

// Function to transform Apify results into our data structure
function transformResults(results, city) {
  return results.map(result => {
    // Extract district from address
    const district = extractDistrict(result.address || '', city);
    
    // Generate a unique ID
    const id = generateId(result.name || result.title, city);
    
    // Extract top reviews if available
    const topReviews = result.reviews 
      ? result.reviews.slice(0, 3).map(review => ({
          author: review.reviewerName || 'Anonymous',
          rating: review.stars || review.rating || 5,
          text: review.text || review.reviewText || ''
        }))
      : [];
    
    // Transform to our data structure
    return {
      id,
      name: result.name || result.title,
      address: result.address,
      city,
      district,
      location: {
        coordinates: {
          lat: result.latitude || (result.location ? result.location.lat : 0),
          lng: result.longitude || (result.location ? result.location.lng : 0)
        }
      },
      contact: {
        phone: result.phone || result.phoneNumber || '',
        website: result.website || result.websiteUrl || ''
      },
      rating: {
        average: result.rating || result.totalScore || 4.5,
        count: result.reviewsCount || result.numberOfReviews || 0
      },
      price: result.priceLevel ? '$'.repeat(result.priceLevel) : '$$',
      hours: result.openingHours || result.openingHoursText || [],
      topReviews,
      images: result.imageUrls || result.images || []
    };
  });
}
```

### 3.4 Implement Data Organization

Create functions to organize the scraped data by location:

```javascript
// Function to organize restaurants by city and district
function organizeByLocation(restaurants) {
  const byCity = {};
  const byDistrict = {};
  
  // Organize by city
  restaurants.forEach(restaurant => {
    const { city } = restaurant;
    if (!byCity[city]) {
      byCity[city] = [];
    }
    byCity[city].push(restaurant);
  });
  
  // Organize by district within city
  Object.keys(byCity).forEach(city => {
    byDistrict[city] = {};
    
    byCity[city].forEach(restaurant => {
      const { district } = restaurant;
      if (!byDistrict[city][district]) {
        byDistrict[city][district] = [];
      }
      byDistrict[city][district].push(restaurant);
    });
  });
  
  return { byCity, byDistrict };
}

// Function to save data to JSON files
function saveData(data, byCity, byDistrict) {
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save all restaurants in one file
  fs.writeFileSync(
    path.join(dataDir, 'restaurants.json'),
    JSON.stringify(data, null, 2)
  );
  
  // Save restaurants by city
  Object.keys(byCity).forEach(city => {
    const cityFileName = city.toLowerCase().replace(/\s+/g, '-');
    fs.writeFileSync(
      path.join(dataDir, `${cityFileName}.json`),
      JSON.stringify(byCity[city], null, 2)
    );
  });
  
  // Save restaurants by district within city
  Object.keys(byDistrict).forEach(city => {
    const cityDir = path.join(dataDir, city.toLowerCase().replace(/\s+/g, '-'));
    if (!fs.existsSync(cityDir)) {
      fs.mkdirSync(cityDir, { recursive: true });
    }
    
    Object.keys(byDistrict[city]).forEach(district => {
      const districtFileName = district.toLowerCase().replace(/\s+/g, '-');
      fs.writeFileSync(
        path.join(cityDir, `${districtFileName}.json`),
        JSON.stringify(byDistrict[city][district], null, 2)
      );
    });
  });
  
  console.log('Data saved successfully!');
}
```

### 3.5 Implement the Main Scraper Function

Now, implement the main scraper function that uses the Apify client to run the Google Maps Extractor actor:

```javascript
// Main function to run the scraper
async function scrapeRestaurants(options = {}) {
  const { forceRestart = false } = options;
  
  if (!APIFY_API_TOKEN) {
    console.error('Error: APIFY_API_TOKEN environment variable is not set');
    process.exit(1);
  }
  
  console.log('Starting restaurant data scraping...');
  
  // Initialize the ApifyClient with API token
  const client = new ApifyClient({
    token: APIFY_API_TOKEN,
  });
  
  // Load progress or start fresh if forceRestart is true
  const progress = forceRestart ? {
    completedCities: [],
    completedQueries: [],
    allRestaurants: []
  } : loadProgress();
  
  let allRestaurants = progress.allRestaurants || [];
  
  // Process each city
  for (const city of CITIES_TO_SCRAPE) {
    // Skip if city is already completed
    if (progress.completedCities.includes(city.name) && !forceRestart) {
      console.log(`Skipping ${city.name} (already completed)`);
      continue;
    }
    
    console.log(`Scraping data for ${city.name}...`);
    let cityCompleted = true;
    
    for (const searchQuery of city.searchQueries) {
      // Generate a unique query identifier
      const queryId = `${city.name}:${searchQuery}`;
      
      // Skip if query is already completed
      if (progress.completedQueries.includes(queryId) && !forceRestart) {
        console.log(`  Skipping query: "${searchQuery}" (already completed)`);
        continue;
      }
      
      console.log(`  Query: "${searchQuery}"`);
      
      try {
        // Prepare Actor input
        const input = {
          searchStringsArray: [searchQuery],
          locationQuery: `${city.name}, Vietnam`,
          language: 'en',
          maxCrawledPlaces: 50,
          includeReviews: true,
          includeImages: true,
          includeOpeningHours: true,
          skipClosedPlaces: true
        };
        
        console.log(`  Running actor with input:`, JSON.stringify(input, null, 2));
        
        // Run the Actor and wait for it to finish
        const run = await client.actor(GOOGLE_MAPS_EXTRACTOR_ACTOR_ID).call(input);
        console.log(`  Run finished with ID: ${run.id}`);
        
        // Fetch results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log(`  Retrieved ${items.length} results`);
        
        // Transform and add to all restaurants
        const transformedResults = transformResults(items, city.name);
        allRestaurants = [...allRestaurants, ...transformedResults];
        
        // Mark query as completed
        progress.completedQueries.push(queryId);
        progress.allRestaurants = allRestaurants;
        saveProgress(progress);
        
      } catch (error) {
        console.error(`Error scraping "${searchQuery}":`, error.message);
        if (error.response) {
          console.error(`  Response data:`, error.response.data);
        }
        
        // Mark that city is not completed due to error
        cityCompleted = false;
        
        // Save progress before exiting
        progress.allRestaurants = allRestaurants;
        saveProgress(progress);
        
        // Check if it's a quota error
        if (error.message.includes('quota') || 
            (error.response && error.response.data && 
             (error.response.data.message || '').includes('quota'))) {
          console.error('Quota limit reached. Exiting...');
          console.log('Run the script again later to resume from this point.');
          return { allRestaurants, byCity: null, byDistrict: null, completed: false };
        }
      }
    }
    
    // Mark city as completed if all queries were successful
    if (cityCompleted) {
      progress.completedCities.push(city.name);
      saveProgress(progress);
    }
  }
  
  // Remove duplicates (based on ID)
  const uniqueRestaurants = Array.from(
    new Map(allRestaurants.map(restaurant => [restaurant.id, restaurant])).values()
  );
  
  console.log(`Total unique restaurants found: ${uniqueRestaurants.length}`);
  
  // Organize data by location
  const { byCity, byDistrict } = organizeByLocation(uniqueRestaurants);
  
  // Save data to files
  saveData(uniqueRestaurants, byCity, byDistrict);
  
  // Return the data for further processing if needed
  return { allRestaurants: uniqueRestaurants, byCity, byDistrict, completed: true };
}
```

### 3.6 Add Command Line Arguments Support

Add support for command line arguments to control the scraper behavior:

```javascript
// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    forceRestart: false
  };
  
  for (const arg of args) {
    if (arg === '--force-restart' || arg === '-f') {
      options.forceRestart = true;
    }
  }
  
  return options;
}

// Update the main execution block
if (require.main === module) {
  const options = parseArgs();
  console.log('Options:', options);
  
  scrapeRestaurants(options)
    .then(result => {
      if (result && result.completed === false) {
        console.log('Scraping paused. Run the script again to continue.');
      } else {
        console.log('Scraping completed successfully.');
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      console.log('Scraping failed. Run the script again to continue from the last saved point.');
    });
}
```

## 4. Running the Scraper

### 4.1 Basic Usage

```bash
node scripts/scrape-restaurants.js
```

This will start the scraping process. If a previous run was interrupted, it will resume from where it left off.

### 4.2 Force Restart

To ignore previous progress and start from scratch:

```bash
node scripts/scrape-restaurants.js --force-restart
# or
node scripts/scrape-restaurants.js -f
```

## 5. Handling Common Issues

### 5.1 Quota Limits

Apify's free tier includes 10 actor compute units per month. If you exceed this limit, you'll need to:

1. Wait until your quota resets
2. Upgrade to a paid plan
3. Create a new Apify account (not recommended for production use)

The script is designed to handle quota errors gracefully by saving progress and exiting.

### 5.2 Rate Limiting

To avoid being rate-limited by Google Maps:

1. Add delays between requests
2. Use different search queries for the same location
3. Limit the number of places crawled per query

### 5.3 Data Quality Issues

To improve data quality:

1. Implement more sophisticated district extraction
2. Add validation for coordinates and other critical fields
3. Implement deduplication based on multiple fields (name, address, coordinates)

## 6. Data Structure

The scraper generates the following files:

- `data/restaurants.json`: All unique restaurants
- `data/{city-name}.json`: Restaurants for each city
- `data/{city-name}/{district-name}.json`: Restaurants for each district within a city

Each restaurant object includes:

```json
{
  "id": "da-nang-pho-example",
  "name": "Phở Example",
  "address": "123 Example Street, Hải Châu, Da Nang",
  "city": "Da Nang",
  "district": "Hải Châu",
  "location": {
    "coordinates": {
      "lat": 16.0471,
      "lng": 108.2062
    }
  },
  "contact": {
    "phone": "+84 123 456 789",
    "website": "https://example.com"
  },
  "rating": {
    "average": 4.5,
    "count": 123
  },
  "price": "$$",
  "hours": [
    "Monday: 7:00 AM – 10:00 PM",
    "Tuesday: 7:00 AM – 10:00 PM",
    "..."
  ],
  "topReviews": [
    {
      "author": "John Doe",
      "rating": 5,
      "text": "Best pho in Da Nang!"
    }
  ],
  "images": [
    "https://example.com/image1.jpg"
  ]
}
```

## 7. Best Practices

### 7.1 Error Handling

- Implement robust error handling for API calls
- Save progress frequently to avoid data loss
- Log errors with sufficient context for debugging

### 7.2 Rate Limiting

- Add delays between requests to avoid overloading the API
- Implement exponential backoff for retries
- Monitor API usage to avoid exceeding quotas

### 7.3 Data Validation

- Validate critical fields like coordinates
- Handle missing or incomplete data gracefully
- Implement data cleaning and normalization

### 7.4 Security

- Store API tokens in environment variables
- Do not commit sensitive information to version control
- Use secure connections for API calls

## Conclusion

This playbook outlines how to use Apify to scrape restaurant data from Google Maps. By following these steps, you can implement a similar solution in your own projects, creating a robust system for collecting and organizing location-based data.

The key advantages of this approach include:
- Structured data collection from Google Maps
- Progress tracking and resumability
- Organized data storage by city and district
- Robust error handling and rate limiting

For further improvements, consider:
- Implementing more sophisticated district extraction
- Adding data validation and cleaning
- Enhancing the deduplication logic
- Implementing incremental updates
