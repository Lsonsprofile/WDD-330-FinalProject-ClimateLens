import '../css/large.css';
import '../css/small.css';
import { loadHeaderFooter } from './utils.mjs';
import { getCompleteWeatherData } from './WeatherService.mjs';
import { getProcessedForecast, getHourlyForecast, getForecastForDay } from './ForecastManager.mjs';
import { getLocation, searchCityByName, getSearchSuggestions, updateLocationFromCoords, getSavedLocations, saveLocation, onLocationChanged } from './LocationManager.mjs';
import { renderCurrentWeather, renderLocationBar, renderHourly, renderForecast, renderDayModal, hideDayModal } from './UIController.mjs';

let currentLocation = null;
let currentForecast = null;

function showLoading() {
  document.getElementById('weather-container').innerHTML = '<div class="loading">Loading...</div>';
  document.getElementById('forecast-container').innerHTML = '';
  document.getElementById('hourly-container').innerHTML = '';
}

function showError(message) {
  document.getElementById('weather-container').innerHTML = `<div class="error">${message}</div>`;
}

function updateHeader(city, country) {
  const el = document.getElementById('header-location-text');
  if (el) el.textContent = `${city}, ${country}`;
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
      timezone: locationData?.timezone || enhanced.timezone,
      fullName: `${city}, ${country}`
    };
    
    const forecast = await getProcessedForecast(lat, lon);
    currentForecast = forecast;
    
    currentLocation = finalLocation;
    updateHeader(city, country);
    
    renderLocationBar(finalLocation);
    renderCurrentWeather(weatherData);
    renderHourly(getHourlyForecast(forecast, 24));
    renderForecast(forecast);
    setupDayClicks();
    updateSaveBtn();

  } catch (error) {
    console.error('Display weather error:', error);
    showError('Failed to load weather. Please try again.');
  }
}

function setupDayClicks() {
  document.querySelectorAll('.forecast-card').forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const day = getForecastForDay(currentForecast, i);
      if (day) renderDayModal(day, currentForecast);
    });
  });
}

function updateSaveBtn() {
  const btn = document.getElementById('save-location-btn');
  if (!btn || !currentLocation) return;
  
  const saved = getSavedLocations();
  const isSaved = saved.some(l => 
    Math.abs(l.lat - currentLocation.lat) < 0.001 && 
    Math.abs(l.lon - currentLocation.lon) < 0.001
  );
  
  const text = btn.querySelector('.save-text');
  if (text) text.textContent = isSaved ? 'Saved' : 'Save';
}

async function saveCurrent() {
  if (!currentLocation) return;
  saveLocation(currentLocation);
  updateSaveBtn();
  
  const text = document.querySelector('#save-location-btn .save-text');
  if (text) {
    text.textContent = 'Saved!';
    setTimeout(updateSaveBtn, 1500);
  }
}

// AUTOCOMPLETE
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
  
  const result = await searchCityByName(cityName);
  
  if (result) {
    await displayWeather(result.lat, result.lon, result);
    input.value = '';
  } else {
    showError('City not found. Please try again.');
  }
}

// FIXED: Added loadInitial() function
async function loadInitial() {
  const saved = getSavedLocations();
  
  if (saved.length > 0) {
    await displayWeather(saved[0].lat, saved[0].lon, saved[0]);
  } else {
    showLoading();
    const loc = await getLocation();
    if (loc) {
      await displayWeather(loc.lat, loc.lon, loc);
    } else {
      showError('Unable to load location. Please search for your city.');
    }
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
    showError('Failed to initialize app. Please refresh.');
  }
}

init();