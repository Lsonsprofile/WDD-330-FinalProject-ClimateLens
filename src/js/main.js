import '../css/large.css';
import '../css/small.css';
import { loadHeaderFooter, initHamburgerMenu } from './utils.mjs';
import { fetchCurrentWeather } from './WeatherAPI.mjs';
import { getCityFromIP, getSavedLocations } from './LocationManager.mjs';
import { renderCurrentWeather, renderLocationBar } from './UIController.mjs';

// Initialize the application
async function init() {
  try {
    await loadHeaderFooter();
    initHamburgerMenu();
    
    // Show loading state
    showLoading();
    
    await loadInitialWeather();
    
    console.log('ClimateLens initialized successfully');
  } catch (error) {
    console.error('Failed to initialize ClimateLens:', error);
    showError('Failed to load app. Please refresh.');
  }
}

// Show loading spinner in weather container
function showLoading() {
  const container = document.getElementById('weather-container');
  if (container) {
    container.innerHTML = '<div class="loading">Loading weather...</div>';
  }
}

// Show error message
function showError(message) {
  const container = document.getElementById('weather-container');
  if (container) {
    container.innerHTML = `<div class="error">${message}</div>`;
  }
}

// Load weather on first visit
async function loadInitialWeather() {
  const saved = getSavedLocations();

  if (saved.length > 0) {
    const loc = saved[0];
    await displayWeather(loc.lat, loc.lon, loc);
  } else {
    try {
      // BigDataCloud IP geolocation — no browser GPS, no permission needed
      const location = await getCityFromIP();
      await displayWeather(location.lat, location.lon, location);
    } catch (error) {
      console.error('Location detection failed:', error);
      // Fallback to Lagos with full location object
      await displayWeather(6.5244, 3.3792, {
        fullName: 'Lagos, Nigeria',
        timezone: 'Africa/Lagos'
      });
    }
  }
}

// Fetch weather and update the display
async function displayWeather(lat, lon, locationData) {
  try {
    const weather = await fetchCurrentWeather(lat, lon);

    // Update header location text (fallback to fullName if name doesn't exist)
    const locationText = document.getElementById('header-location-text');
    if (locationText) {
      locationText.textContent = locationData.fullName || locationData.name || 'Unknown Location';
    }

    // Render location bar with 📍 and 🕒
    renderLocationBar(locationData);

    // Render the weather card with all data
    renderCurrentWeather(weather, null);

  } catch (error) {
    console.error('Weather display failed:', error);
    showError('Failed to load weather. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', init);