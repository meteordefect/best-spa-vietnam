import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an axios instance with longer timeout and keep-alive
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {
    'User-Agent': 'PhoneArMe/1.0 (Static Map Generator for Educational Project)'
  }
});

// Map provider options
let MAP_PROVIDER = process.env.MAP_PROVIDER || 'geoapify';
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || '0282c7ff858b40a7bd344b654a71fd25';

// Progress tracking file
const PROGRESS_FILE = path.join(__dirname, 'download-maps-progress.json');

// Command line arguments
const args = process.argv.slice(2);
const FORCE_REDOWNLOAD = args.includes('--force') || args.includes('-f');
const RESUME = args.includes('--resume') || args.includes('-r');
const FRESH_BATCH = args.includes('--fresh-batch');

// Log which provider we're using and options
console.log(`Using map provider: ${MAP_PROVIDER}`);
if (FORCE_REDOWNLOAD) {
  console.log('Force redownload mode: Will overwrite existing images');
}
if (RESUME) {
  console.log('Resume mode: Will continue from last saved progress');
}
if (FRESH_BATCH) {
  console.log('Fresh batch mode: Starting a new batch today, ignoring previous batch timing');
}

// Function to get map URL based on provider
function getMapUrl(lat, lng, zoom, width, height, markers = null) {
  switch (MAP_PROVIDER) {
    case 'geoapify':
      return getGeoapifyMapUrl(lat, lng, zoom, width, height, markers);
    default:
      console.warn(`Unknown map provider: ${MAP_PROVIDER}, falling back to Geoapify`);
      return getGeoapifyMapUrl(lat, lng, zoom, width, height, markers);
  }
}

/**
 * Generate a Geoapify static map URL
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (1-20)
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {Array|string|null} markers - Array of marker strings or single marker string
 * @returns {string} - Geoapify static map URL
 */
function getGeoapifyMapUrl(lat, lng, zoom, width, height, markers = null) {
  // Base URL with required parameters
  let url = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${lng},${lat}&zoom=${zoom}&format=png`;
  
  // Add markers
  if (markers) {
    if (Array.isArray(markers)) {
      // Add multiple markers (up to 20 for better performance)
      const markerLimit = 20;
      const limitedMarkers = markers.slice(0, markerLimit);
      
      // Create marker parameter string
      const markerParams = limitedMarkers.map((marker, index) => {
        // Parse the marker string (format: "lat,lng,color")
        const parts = marker.split(',');
        if (parts.length >= 2) {
          const markerLat = parts[0];
          const markerLng = parts[1];
          const color = parts[2] || 'red';
          
          // Convert color name to hex and URL encode
          const colorHex = color === 'red' ? '%23ff0000' : '%230000ff';
          
          // Return marker definition
          return `lonlat:${markerLng},${markerLat};color:${colorHex};size:medium`;
        }
        return null;
      }).filter(Boolean).join('|');
      
      if (markerParams) {
        url += `&marker=${markerParams}`;
      }
    } else {
      // Single marker string
      const parts = markers.split(',');
      if (parts.length >= 2) {
        const markerLat = parts[0];
        const markerLng = parts[1];
        const color = parts[2] || 'red';
        
        // Convert color name to hex and URL encode
        const colorHex = color === 'red' ? '%23ff0000' : '%230000ff';
        
        // Add marker to URL
        url += `&marker=lonlat:${markerLng},${markerLat};color:${colorHex};size:medium`;
      }
    }
  } else {
    // Default marker at the center
    url += `&marker=lonlat:${lng},${lat};color:%23ff0000;size:medium`;
  }
  
  // Add API key
  url += `&apiKey=${GEOAPIFY_API_KEY}`;
  
  return url;
}

// Function to create a fallback HTML map that also generates a PNG version
function createFallbackMap(outputPath, title, cityName = null, lat = null, lng = null) {
  // Use provided coordinates or default to central Vietnam
  const latitude = lat || 16.0;
  const longitude = lng || 108.0;
  const zoomLevel = lat && lng ? 14 : 6; // Zoom in more if we have specific coordinates
  
  // Create HTML version with OpenStreetMap as background
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Map for ${title}</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 600px;
      height: 400px;
      overflow: hidden;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .map-title {
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 1000;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 5px 10px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: #333;
      max-width: 80%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-title">${cityName || title}</div>
  
  <script>
    // Use the coordinates provided
    const map = L.map('map').setView([${latitude}, ${longitude}], ${zoomLevel});
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add a marker at the center
    L.marker([${latitude}, ${longitude}]).addTo(map)
      .bindPopup("${cityName || title}")
      .openPopup();
  </script>
</body>
</html>`;

  // Create a PNG version with the same base name
  const pngPath = outputPath;
  const htmlPath = outputPath.replace(/\.png$/, '.html');
  
  // Write the HTML file
  fs.writeFileSync(htmlPath, htmlContent);
  
  // Create a simple PNG fallback (1x1 transparent pixel)
  const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(pngPath, transparentPixel);
  
  console.log(`✓ Created fallback maps for ${title} (HTML and PNG)`);
  return { htmlPath, pngPath };
}

// Function to load progress from file
function loadProgress() {
  let progress = {
    batchIndex: 0,
    completedRestaurants: [],
    totalRestaurants: 0,
    lastBatchTime: null,
    lastRunDate: null
  };
  
  // Create maps directory if it doesn't exist
  const mapsDir = path.join(__dirname, '..', 'public', 'maps');
  if (!fs.existsSync(mapsDir)) {
    fs.mkdirSync(mapsDir, { recursive: true });
  }

  // Check for existing valid maps in the directory (excluding 68-byte fallbacks)
  const existingMaps = fs.readdirSync(mapsDir)
    .filter(file => file.endsWith('.png'))
    .filter(file => {
      try {
        const stats = fs.statSync(path.join(mapsDir, file));
        return stats.size !== 68; // Exclude fallback PNGs which are exactly 68 bytes
      } catch (error) {
        return false;
      }
    })
    .map(file => file.replace('.png', ''));
  
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    try {
      const savedProgress = JSON.parse(fs.readFileSync(PROGRESS_FILE));
      
      // Validate the progress data
      if (
        typeof savedProgress === 'object' &&
        typeof savedProgress.batchIndex === 'number' &&
        Array.isArray(savedProgress.completedRestaurants)
      ) {
        progress = savedProgress;
        console.log(`Resuming from batch ${progress.batchIndex}`);
        console.log(`Previously completed: ${progress.completedRestaurants.length} restaurants`);
      } else {
        console.warn('Invalid progress file format, starting fresh');
      }
    } catch (error) {
      console.warn('Error reading progress file, starting fresh:', error.message);
    }
  } else if (!RESUME) {
    console.log('Starting fresh download (not resuming)');
  }

  // Add existing maps to completed list if not already there
  existingMaps.forEach(id => {
    if (!progress.completedRestaurants.includes(id)) {
      progress.completedRestaurants.push(id);
    }
  });

  console.log(`Found ${existingMaps.length} existing maps`);
  return progress;
}

// Function to save progress to file
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  console.log('Progress saved to file');
}

// Function to handle user input for pausing
function setupPauseHandler(onPause) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n=== Press CTRL+C or type "pause" to pause the download process ===\n');
  
  // Handle CTRL+C
  process.on('SIGINT', () => {
    console.log('\nPausing download process...');
    onPause();
    rl.close();
    process.exit(0);
  });
  
  // Handle "pause" command
  rl.on('line', (input) => {
    if (input.trim().toLowerCase() === 'pause') {
      console.log('\nPausing download process...');
      onPause();
      rl.close();
      process.exit(0);
    }
  });
  
  return rl;
}

async function downloadMapImages() {
  console.log(`Starting individual restaurant map downloads using ${MAP_PROVIDER}...`);
  
  // Log which API we're using
  if (MAP_PROVIDER === 'geoapify') {
    console.log('Using Geoapify Static Maps API with OpenStreetMap data');
  }
  
  // Load progress and check existing maps
  const progress = loadProgress();
  
  // Setup pause handler
  const rl = setupPauseHandler(() => {
    saveProgress(progress);
  });
  
  try {
    // Load your restaurant data from pho-astro/data
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'data', 'restaurants.json'));
    const restaurants = JSON.parse(rawData);
    
    // Update progress with total counts
    progress.totalRestaurants = restaurants.length;
    
    // Create maps directory if it doesn't exist
    const mapsDir = path.join(__dirname, '..', 'public', 'maps');
    if (!fs.existsSync(mapsDir)) {
      fs.mkdirSync(mapsDir, { recursive: true });
    }
    
    // Get remaining restaurants to process
    const remainingRestaurants = restaurants.filter(r => 
      !progress.completedRestaurants.includes(r.id) || FORCE_REDOWNLOAD
    );
    
    console.log(`Total restaurants: ${restaurants.length}`);
    console.log(`Already completed: ${progress.completedRestaurants.length}`);
    console.log(`Remaining to process: ${remainingRestaurants.length}`);

    // Process in batches of 2999 (max allowed per day)
    const BATCH_SIZE = 2999;
    const batches = Math.ceil(remainingRestaurants.length / BATCH_SIZE);

    // Track success and failure counts
    let successCount = 0;
    let failureCount = 0;
    
    // Process only one batch per day
    const batchNum = progress.batchIndex;
    if (batchNum < batches) {
      const now = Date.now();
      
      // Check if we need to wait before starting next batch (2999 per day = 1 every 28.8 seconds)
      // Check if we're running on a new day or forcing a fresh batch
      const today = new Date().toDateString();
      if (progress.lastRunDate !== today || FRESH_BATCH) {
        progress.lastBatchTime = null; // Reset the timer for a new day
        progress.lastRunDate = today;
      }

      // Only wait if we've already done a batch today
      if (progress.lastBatchTime && progress.lastRunDate === today) {
        const timeSinceLastBatch = now - progress.lastBatchTime;
        const requiredWaitTime = 28800 * BATCH_SIZE; // 28.8 seconds * 1000 items
        if (timeSinceLastBatch < requiredWaitTime) {
          const waitTime = requiredWaitTime - timeSinceLastBatch;
          console.log(`Waiting ${Math.ceil(waitTime/1000)} seconds before starting next batch...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      const batchStart = batchNum * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, remainingRestaurants.length);
      const batch = remainingRestaurants.slice(batchStart, batchEnd);
      
      console.log(`\nProcessing batch ${batchNum + 1}/${batches} (${batch.length} restaurants)`);
      
      // Process each restaurant in the batch
      for (const restaurant of batch) {
        const { id, name, location } = restaurant;
        
        if (!location || !location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
          console.warn(`⚠ Skipping restaurant "${name}" (${id}): Missing coordinates`);
          progress.completedRestaurants.push(id);
          continue;
        }
        
        const { lat, lng } = location.coordinates;
        const mapUrl = getMapUrl(lat, lng, 17, 600, 300);
        const imagePath = path.join(mapsDir, `${id}.png`);
        
        try {
          console.log(`Downloading map for ${name}...`);
          const response = await axiosInstance.get(mapUrl, { responseType: 'arraybuffer' });
          
          if (response.headers['content-type'].startsWith('image/')) {
            fs.writeFileSync(imagePath, response.data);
            console.log(`✓ Downloaded map for ${name}`);
            if (!progress.completedRestaurants.includes(id)) {
              progress.completedRestaurants.push(id);
            }
            successCount++;
          } else {
            console.error(`✗ Invalid content type for ${name}`);
            failureCount++;
            // Skip this restaurant but continue with others
            continue;
          }
          
          // Add a small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          // Check if error is related to API limits (HTTP 429 or specific error messages)
          if (error.response?.status === 429 || error.message.includes('quota') || error.message.includes('limit')) {
            console.error('❌ API rate limit reached. Please try again tomorrow.');
            process.exit(1);
          }
          console.error(`✗ Failed to download map for ${name}:`, error.message);
          failureCount++;
          // Skip this restaurant but continue with others
          continue;
        }
      }
      
      // Update batch progress
      progress.batchIndex = batchNum + 1;
      progress.lastBatchTime = Date.now();
      saveProgress(progress);
      
      console.log(`\nBatch ${batchNum + 1} complete!`);
      console.log(`Progress: ${progress.completedRestaurants.length}/${progress.totalRestaurants} restaurants`);
      console.log('\nDaily batch complete! Run the script again tomorrow for the next batch.');
      rl.close();
      return;
    }
    
    // Reset batch index after completing all batches
    progress.batchIndex = 0;
    
    // Close readline interface
    rl.close();
    
    console.log(`\nDownload process complete! Success: ${successCount}, Failures: ${failureCount}`);
    
    // Clear progress file after successful completion
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('Progress file cleared');
    }
  } catch (error) {
    console.error('Error in downloadMapImages:', error);
    saveProgress(progress);
    rl.close();
  }
}

downloadMapImages().catch(console.error);
