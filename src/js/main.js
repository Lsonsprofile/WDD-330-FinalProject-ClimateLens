import '../css/large.css';
import '../css/small.css';
import { loadHeaderFooter } from './utils.mjs';
import { getCompleteWeatherData } from './WeatherService.mjs';
import { 
  getProcessedForecast, 
  getRainForecast, 
  renderForecastHTML 
} from './ForecastManager.mjs';
import { 
  getLocation, 
  getSavedLocations, 
  saveLocation, 
  updateUserLocation,
  onLocationChanged
} from './LocationManager.mjs';
import { renderCurrentWeather, renderLocationBar } from './UIController.mjs';

// current location state
let currentLocation = null;

// show loading spinner
function showLoading() {
  const container = document.getElementById('weather-container');
  if (container) {
    container.innerHTML = '<div class="loading">Loading weather...</div>';
  }
  
  const forecastContainer = document.getElementById('forecast-container');
  if (forecastContainer) {
    forecastContainer.innerHTML = '<div class="loading">Loading forecast...</div>';
  }
}

// show error message
function showError(message) {
  const container = document.getElementById('weather-container');
  if (container) {
    container.innerHTML = `<div class="error">${message}</div>`;
  }
}

// render forecast to page
function renderForecast(processedForecast) {
  const forecastContainer = document.getElementById('forecast-container');
  if (!forecastContainer) return;
  
  if (!processedForecast || !processedForecast.daily) {
    forecastContainer.innerHTML = '<div class="error">No forecast data</div>';
    return;
  }
  
  forecastContainer.innerHTML = renderForecastHTML(processedForecast);
}

// update header location text
function updateHeaderLocation(locationData) {
  const locationText = document.getElementById('header-location-text');
  if (!locationText) return;
  
  if (locationData) {
    let displayName = locationData.fullName;
    
    if (locationData.city && locationData.country) {
      displayName = `${locationData.city}, ${locationData.country}`;
    } else if (locationData.fullName) {
      const parts = locationData.fullName.split(',');
      if (parts.length >= 2) {
        displayName = `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
      } else {
        displayName = locationData.fullName;
      }
    }
    
    locationText.textContent = displayName;
  }
}

// fetch weather and update display
async function displayWeather(lat, lon, locationData) {
  try {
    // fetch forecast
    const processedForecast = await getProcessedForecast(lat, lon);
    renderForecast(processedForecast);
    
    // fetch current weather
    const weatherData = await getCompleteWeatherData(lat, lon);
    
    // attach forecast data to weather object
    weatherData.forecast = processedForecast;
    weatherData.rainForecast = processedForecast ? getRainForecast(processedForecast) : null;
    
    currentLocation = locationData;
    updateHeaderLocation(locationData);

    const locationWithTimezone = {
      ...locationData,
      timezone: locationData.timezone || 'UTC'
    };
    
    renderLocationBar(locationWithTimezone);
    renderCurrentWeather(weatherData);
    updateSaveButtonState(locationData);

  } catch (error) {
    showError('Failed to load weather. Please try again.');
  }
}

// check if location is saved
function updateSaveButtonState(locationData) {
  const saveBtn = document.getElementById('save-location-btn');
  if (!saveBtn || !locationData) return;
  
  const savedLocations = getSavedLocations();
  const isSaved = savedLocations.some(loc => 
    Math.abs(loc.lat - locationData.lat) < 0.001 && 
    Math.abs(loc.lon - locationData.lon) < 0.001
  );
  
  const saveText = saveBtn.querySelector('.save-text');
  if (saveText) {
    saveText.textContent = isSaved ? 'Saved' : 'Save';
  }
}

// save current location
async function saveCurrentLocation() {
  if (!currentLocation) {
    showError('No location to save');
    return;
  }
  
  saveLocation(currentLocation);
  updateSaveButtonState(currentLocation);
  
  const saveText = document.querySelector('#save-location-btn .save-text');
  if (saveText) {
    saveText.textContent = 'Saved!';
    setTimeout(() => {
      updateSaveButtonState(currentLocation);
    }, 1500);
  }
}

// load initial weather
async function loadInitialWeather() {
  const saved = getSavedLocations();

  if (saved.length > 0) {
    const loc = saved[0];
    await displayWeather(loc.lat, loc.lon, loc);
  } else {
    try {
      const location = await getLocation();
      await displayWeather(location.lat, location.lon, location);
    } catch (error) {
      showError('Unable to detect location. Please allow location access.');
    }
  }
}

// setup event listeners
function setupEventListeners() {
  onLocationChanged(async (newLocation) => {
    showLoading();
    await displayWeather(newLocation.lat, newLocation.lon, newLocation);
  });
  
  // save button
  const saveBtn = document.getElementById('save-location-btn');
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', saveCurrentLocation);
  }
  
  // current location button
  const locationBtn = document.getElementById('current-location-btn');
  if (locationBtn) {
    const newLocationBtn = locationBtn.cloneNode(true);
    locationBtn.parentNode.replaceChild(newLocationBtn, locationBtn);
    
    newLocationBtn.addEventListener('click', async () => {
      showLoading();
      try {
        const location = await getLocation();
        await displayWeather(location.lat, location.lon, location);
      } catch (error) {
        showError('Could not refresh location');
      }
    });
  }
  
  // dropdown
  const dropdownSelect = document.querySelector('.dropdown-select');
  if (dropdownSelect) {
    dropdownSelect.addEventListener('change', (e) => {
      if (e.target.value === 'download-map') {
        alert('Map download feature coming soon!');
      }
      e.target.value = '';
    });
  }
}

// initialize
async function init() {
  try {
    await loadHeaderFooter();
    setupEventListeners();
    showLoading();
    await loadInitialWeather();
  } catch (error) {
    showError('Failed to load app. Please refresh.');
  }
}

init();