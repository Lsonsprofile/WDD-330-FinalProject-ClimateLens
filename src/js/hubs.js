import '../css/large.css';
import '../css/small.css';
import '../css/hub.css';
import '../css/hub-small.css';
import { loadHeaderFooter, updateHeaderText } from './utils.mjs';
import { renderSimpleConverter } from './WeatherConverter.mjs';
import { renderMap } from './WeatherMap.mjs';
import { renderRecentSearches } from './RecentSearches.mjs';
import { 
  getCurrentState, 
  hasCurrentState,
  saveRecentSearch        // ADD THIS IMPORT
} from './StorageManager.mjs';

function renderHubs() {
  const container = document.getElementById('hubs-container');
  if (!container) return;

  container.innerHTML = `
    <div class="hubs-welcome">
      <h1>Weather Hub</h1>
      <p>Your centralized weather dashboard.</p>
    </div>
    
    <div class="hub-dashboard">
      <div class="hub-left">
        <div id="converter-nexus"></div>
      </div>
      <div class="hub-right">
        <div id="map-nexus"></div>
      </div>
    </div>
    
    <div class="hub-bottom">
      <div id="recent-nexus"></div>
    </div>
  `;

  renderSimpleConverter('converter-nexus');
  renderMap('map-nexus');
  renderRecentSearches('recent-nexus');
}

// ADD THIS FUNCTION: Handle location changes from recent searches
function handleLocationChange(event) {
  const { lat, lon, city, country } = event.detail;
  
  // Save to recent searches
  saveRecentSearch({
    lat,
    lon,
    city,
    country
  });
  
  // Update the page with new location data
  updateHeaderText(city, country);
  
  // You can also trigger weather data fetch here if needed
  // For example: fetchWeatherData(lat, lon);
}

async function init() {
  try {
    await loadHeaderFooter();
    
    // Listen for location changes from recent searches
    window.addEventListener('locationChanged', handleLocationChange);
    
    if (hasCurrentState()) {
      const loc = getCurrentState();
      updateHeaderText(loc.city, loc.country);
      
      // Also save current location to recent on init
      saveRecentSearch({
        lat: loc.lat,
        lon: loc.lon,
        city: loc.city,
        country: loc.country
      });
    }
    
    renderHubs();
  } catch (error) {
    console.error('Hubs init error:', error);
  }
}

init();