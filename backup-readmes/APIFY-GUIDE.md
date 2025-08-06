# Using Apify to Scrape Restaurant Data for "Pho Near Me"

This guide will walk you through the process of using Apify to scrape restaurant data for the "Pho Near Me" website.

## What is Apify?

[Apify](https://apify.com/) is a web scraping and automation platform that provides tools for extracting data from websites. For our project, we'll use Apify's Google Maps scraper to collect information about pho restaurants in Vietnam.

## Setting Up Apify

1. **Create an Apify Account**:
   - Go to [https://apify.com/sign-up](https://apify.com/sign-up)
   - Sign up for a free account (the free tier includes 10 actor compute units per month, which should be sufficient for our initial scraping needs)

2. **Get Your API Token**:
   - After signing up and logging in, go to your Account Settings
   - Navigate to the "Integrations" tab
   - Copy your Personal API Token (you'll need this for the scraping script)

## Running the Scraper

We've created a script (`scripts/scrape-restaurants.js`) that uses Apify's Google Maps scraper to collect restaurant data. Here's how to use it:

1. **Install Dependencies**:
   ```bash
   npm install axios
   ```

2. **Set Up Your API Token**:
   - Create a `.env` file in the root of the project (if it doesn't exist)
   - Add your Apify API token:
     ```
     APIFY_API_TOKEN=your_api_token_here
     ```
   - Alternatively, you can set the environment variable when running the script:
     ```bash
     APIFY_API_TOKEN=your_api_token_here npm run scrape-data
     ```

3. **Configure the Scraper**:
   - Open `scripts/scrape-restaurants.js`
   - Modify the `CITIES_TO_SCRAPE` array to include the cities you want to scrape:
     ```javascript
     const CITIES_TO_SCRAPE = [
       {
         name: 'Da Nang',
         searchQueries: [
           'pho restaurant in Da Nang, Vietnam',
           'best pho in Da Nang, Vietnam'
         ]
       },
       // Add more cities as needed
       {
         name: 'Hanoi',
         searchQueries: [
           'pho restaurant in Hanoi, Vietnam',
           'best pho in Hanoi, Vietnam'
         ]
       }
     ];
     ```

4. **Run the Scraper**:
   ```bash
   npm run scrape-data
   ```

5. **Monitor Progress**:
   - The script will output progress information as it scrapes each city
   - You can also monitor the run in the Apify Console: [https://console.apify.com/actors/runs](https://console.apify.com/actors/runs)

## Understanding the Output

The scraper will generate several JSON files:

1. **`data/restaurants.json`**: Contains all restaurants from all cities
2. **`data/[city-name].json`**: Contains restaurants for a specific city (e.g., `data/da-nang.json`)
3. **`data/[city-name]/[district-name].json`**: Contains restaurants for a specific district within a city (e.g., `data/da-nang/hai-chau.json`)

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

## Generating Maps

After scraping the data, the build process will automatically generate static map images for each restaurant:

```bash
npm run download-maps
```

This will create PNG files in the `public/maps` directory, which will be used by the `RestaurantCard` component to display location maps.

## Building the Site

To build the complete site with the scraped data and generated maps:

```bash
npm run build
```

This will:
1. Run the data scraper (if not already run)
2. Generate the maps
3. Generate static pages for cities, districts, and restaurants
4. Build and export the Next.js site as static HTML

### Static Page Generation

We've implemented a fully static approach for all pages:

1. **Static City Pages**: Each city has a dedicated static page at `/cities/[city-name]/` that is pre-rendered at build time.
2. **Static District Pages**: Each district has a dedicated static page at `/cities/[city-name]/districts/[district-name]/` that is pre-rendered at build time.
3. **Static Restaurant Pages**: Each restaurant has a dedicated static page at `/restaurants/[restaurant-id]/` that is pre-rendered at build time.
4. **No Dynamic Routes**: We've moved away from dynamic routes (`[slug]`) to fully static pages for improved reliability and SEO.

The `generate-static-pages.js` script handles this process by:

1. Reading restaurant data from JSON files
2. Creating static city pages with embedded data
3. Creating static district pages with embedded data
4. Creating static restaurant pages with embedded data

This approach provides several benefits:
- Better SEO performance with fully pre-rendered HTML
- Improved reliability across different hosting environments
- Faster page loads with no client-side data fetching
- Simplified deployment with static files only

## Performance Considerations

### JSON File Size

With the current approach of splitting data by city and district, the JSON files will remain manageable even with 100+ restaurants. Here's why:

1. **Efficient Loading**: Each page only needs to load the data relevant to it
   - Homepage: Loads a subset of featured restaurants
   - City page: Loads only restaurants in that city
   - District page: Loads only restaurants in that district

2. **File Size Estimates**:
   - A typical restaurant JSON object is ~2-5KB
   - 100 restaurants would be ~200-500KB total
   - Split across multiple files, each file would be much smaller
   - For example, a district with 10 restaurants would have a ~20-50KB JSON file

3. **Static Generation**: Since Next.js pre-renders the pages at build time, the JSON loading happens during build, not when users visit the site

4. **Caching**: The static files are efficiently cached by browsers and CDNs

### Scaling Beyond 100 Restaurants

If the site grows to include hundreds or thousands of restaurants:

1. **Continue with the current approach**: The file structure scales well up to several hundred restaurants
2. **Implement pagination**: For districts with many restaurants, implement pagination to load restaurants in batches
3. **Consider a database**: For very large datasets (1000+ restaurants) or if you need dynamic features, consider migrating to a database as mentioned in the long-term plan

## Next Steps

1. Run the scraper for Da Nang to collect initial data
2. Review and clean up the data if needed
3. Add more cities to the scraper configuration
4. Build and deploy the site
5. Monitor performance and user feedback
