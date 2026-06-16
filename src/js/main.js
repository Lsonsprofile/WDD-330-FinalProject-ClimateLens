import '../css/large.css';
import '../css/small.css';
import { loadHeaderFooter, updateHeaderText } from './utils.mjs';
import { getCompleteWeatherData } from './WeatherService.mjs';
import { getProcessedForecast } from './ForecastManager.mjs';
import { getWeatherAlerts, renderWeatherAlerts } from './WeatherAlert.mjs';
import { 
  searchCityByName, 
  getSearchSuggestions, 
  updateLocationFromCoords, 
  onLocationChanged 
} from './LocationManager.mjs';
import { 
  saveCurrentState, 
  getCurrentState, 
  hasCurrentState,
  saveToLocationsList,
  getSavedLocationsList,
  saveRecentSearch      
} from './StorageManager.mjs';
import { renderCurrentWeather, renderLocationBar, renderHourly, renderForecast, renderDayModal, hideDayModal } from './UIController.mjs';

let currentLocation = null;
let currentForecast = null;

function showLoading() {
  const weatherContainer = document.getElementById('weather-container');
  const forecastContainer = document.getElementById('forecast-container');
  const hourlyContainer = document.getElementById('hourly-container');
  
  if (weatherContainer) weatherContainer.innerHTML = '<div class="loading">Loading...</div>';
  if (forecastContainer) forecastContainer.innerHTML = '';
  if (hourlyContainer) hourlyContainer.innerHTML = '';
}

function showError(message) {
  const container = document.getElementById('weather-container');
  if (container) container.innerHTML = `<div class="error">${message}</div>`;
}

function showSearchPrompt() {
  const weatherContainer = document.getElementById('weather-container');
  const forecastContainer = document.getElementById('forecast-container');
  const hourlyContainer = document.getElementById('hourly-container');
  
  if (weatherContainer) {
    weatherContainer.innerHTML = `
      <div class="search-prompt">
        <h2>Welcome to ClimateLens</h2>
        <p>Search for a city to get started</p>
      </div>
    `;
  }
  if (forecastContainer) forecastContainer.innerHTML = '';
  if (hourlyContainer) hourlyContainer.innerHTML = '';
}

async function displayWeather(lat, lon, locationData) {
  try {
    const weatherData = await getCompleteWeatherData(lat, lon);
    
    const enhanced = await updateLocationFromCoords(weatherData.lat, weatherData.lon, weatherData.cityName);
    
    const city = enhanced.city !== 'Unknown' 
      ? enhanced.city 
      : locationData?.city || weatherData.cityName;
    
    const country = enhanced.country !== 'Unknown' 
      ? enhanced.country 
      : locationData?.country || weatherData.countryCode;
    
    const finalLocation = {
      lat: weatherData.lat,
      lon: weatherData.lon,
      city,
      country,
      timezone: weatherData.timezone || locationData?.timezone || enhanced.timezone,
      fullName: `${city}, ${country}`
    };
    
    saveCurrentState(finalLocation);
    currentLocation = finalLocation;
    
    saveRecentSearch({
      lat: finalLocation.lat,
      lon: finalLocation.lon,
      city: finalLocation.city,
      country: finalLocation.country
    });
    
    const forecast = await getProcessedForecast(lat, lon);
    currentForecast = forecast;
    
    updateHeaderText(city, country);
    
    renderLocationBar(finalLocation);
    renderCurrentWeather(weatherData);
    renderHourly(weatherData.hourly);
    renderForecast(forecast);
    setupDayClicks();
    updateSaveBtn();

    // Clear alert dismissal for new weather data
    sessionStorage.removeItem('alertsDismissed');
    
    const alerts = await getWeatherAlerts(lat, lon, city, forecast?.raw);
    renderWeatherAlerts(alerts);

  } catch (error) {
    console.error('Display weather error:', error);
    showError('Failed to load weather. Please try again.');
  }
}

function setupDayClicks() {
  document.querySelectorAll('.forecast-card').forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const day = currentForecast?.daily?.[i];
      if (day) renderDayModal(day, currentForecast);
    });
  });
}

function updateSaveBtn() {
  const btn = document.getElementById('save-location-btn');
  if (!btn || !currentLocation) return;
  
  const saved = getSavedLocationsList();
  const isSaved = saved.some(l => 
    Math.abs(parseFloat(l.lat) - currentLocation.lat) < 0.001 && 
    Math.abs(parseFloat(l.lon) - currentLocation.lon) < 0.001
  );
  
  const text = btn.querySelector('.save-text');
  if (text) text.textContent = isSaved ? 'Saved' : 'Save';
}

async function saveCurrent() {
  if (!currentLocation) return;
  saveToLocationsList(currentLocation);
  updateSaveBtn();
  
  const text = document.querySelector('#save-location-btn .save-text');
  if (text) {
    text.textContent = 'Saved!';
    setTimeout(updateSaveBtn, 1500);
  }
}

let debounceTimer;
async function handleInput(e) {
  const query = e.target.value.trim();
  const suggestionsBox = document.getElementById('search-suggestions');
  
  if (!suggestionsBox) return;
  
  if (query.length < 2) {
    suggestionsBox.innerHTML = '';
    suggestionsBox.classList.add('hidden');
    return;
  }
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const suggestions = await getSearchSuggestions(query);
    
    if (suggestions.length === 0) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.add('hidden');
      return;
    }
    
    suggestionsBox.innerHTML = suggestions.map(s => `
      <div class="suggestion-item" data-lat="${s.lat}" data-lon="${s.lon}" data-city="${s.city}" data-country="${s.country}">
        <span class="suggestion-name">${s.city}</span>
        <span class="suggestion-country">${s.country}</span>
      </div>
    `).join('');
    
    suggestionsBox.classList.remove('hidden');
    
    suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        const city = item.dataset.city;
        const country = item.dataset.country;
        
        document.getElementById('city-search').value = `${city}, ${country}`;
        suggestionsBox.innerHTML = '';
        suggestionsBox.classList.add('hidden');
        
        saveRecentSearch({ lat, lon, city, country });
        
        showLoading();
        displayWeather(lat, lon, { lat, lon, city, country });
      });
    });
  }, 300);
}

async function handleSearch() {
  const input = document.getElementById('city-search');
  if (!input || !input.value.trim()) return;
  
  const cityName = input.value.trim();
  showLoading();
  
  try {
    const result = await searchCityByName(cityName);
    
    saveRecentSearch({
      lat: result.lat,
      lon: result.lon,
      city: result.city,
      country: result.country
    });
    
    await displayWeather(result.lat, result.lon, result);
    input.value = '';
  } catch (error) {
    showError('City not found. Please try again.');
  }
}

async function loadInitial() {
  if (hasCurrentState()) {
    const lastLocation = getCurrentState();
    try {
      await displayWeather(lastLocation.lat, lastLocation.lon, lastLocation);
    } catch (error) {
      console.error('Failed to load saved location:', error);
      showSearchPrompt();
    }
  } else {
    showSearchPrompt();
  }
}

function setupEvents() {
  onLocationChanged(loc => {
    showLoading();
    displayWeather(loc.lat, loc.lon, loc);
  });
  
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }
  
  const searchInput = document.getElementById('city-search');
  if (searchInput) {
    searchInput.addEventListener('input', handleInput);
    
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        document.getElementById('search-suggestions')?.classList.add('hidden');
      }, 200);
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
  
  document.getElementById('save-location-btn')?.addEventListener('click', saveCurrent);
  
  document.addEventListener('click', e => {
    if (e.target.classList.contains('close-btn') || e.target.id === 'day-detail-modal') {
      hideDayModal();
    }
  });
}

async function init() {
  try {
    await loadHeaderFooter();
    setupEvents();
    await loadInitial();
  } catch (error) {
    console.error('Init error:', error);
    showError('Failed to initialize app. Please refresh.');
  }
}

init();