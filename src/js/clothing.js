import '../css/large.css';
import '../css/small.css';
import { loadHeaderFooter, updateHeaderText } from './utils.mjs';
import { getCompleteWeatherData } from './WeatherService.mjs';
import { 
  searchCityByName, 
  getSearchSuggestions, 
  updateLocationFromCoords 
} from './LocationManager.mjs';
import { 
  saveCurrentState, 
  getCurrentState, 
  hasCurrentState,
  saveRecentSearch
} from './StorageManager.mjs';
import { getClothingRecommendation } from './ClothingAdvisor.mjs';
import { renderLocationBar } from './UIController.mjs';
import { formatTemp, getTempUnit } from './UnitConverter.mjs';

let climateStore = null;

function showLoading() {
  const container = document.getElementById('clothing-container');
  if (container) {
    container.innerHTML = '<div class="wardrobe-loading">Consulting the wardrobe oracle...</div>';
  }
}

function showError(message) {
  const container = document.getElementById('clothing-container');
  if (container) {
    container.innerHTML = `<div class="wardrobe-error">${message}</div>`;
  }
}

function showSearchPrompt() {
  const container = document.getElementById('clothing-container');
  if (container) {
    container.innerHTML = `
      <div class="wardrobe-prompt">
        <h2>What to Wear Today</h2>
        <p>Search for a city to get your personalized outfit guide</p>
      </div>
    `;
  }
}

function renderWardrobeGuide(weatherData) {
  const revelation = getClothingRecommendation(weatherData);
  if (!revelation || !revelation.outfit) {
    showError('Unable to decode wardrobe wisdom.');
    return;
  }

  const { rule, outfit, extras, summary, warnings } = revelation;
  const container = document.getElementById('clothing-container');
  if (!container) return;

  const extrasList = extras.length > 0 
    ? extras.map(e => e.name).join(' & ')
    : 'None needed';

  // Use converted temperature
  const displayTemp = formatTemp(weatherData.temp);

  container.innerHTML = `
    <div class="wardrobe-atlas">
      <h1 class="atlas-title">What to Wear Today</h1>
      <p class="atlas-subtitle">Recommended Outfit for ${displayTemp}&#127777;</p>
      
      <div class="ensemble-gallery">
        <div class="ensemble-card">
          <div class="card-header-bar">Top</div>
          <div class="card-body">
            <img src="${outfit.topImage}" alt="${outfit.top}" class="card-image" loading="lazy" onerror="this.src='/icons/weather.svg'">
            <h3 class="card-item-name">${outfit.top}</h3>
            <p class="card-item-desc">${getItemDescription(outfit.top, weatherData.temp)}</p>
          </div>
        </div>
        
        <div class="ensemble-card">
          <div class="card-header-bar">Bottom</div>
          <div class="card-body">
            <img src="${outfit.bottomImage}" alt="${outfit.bottom}" class="card-image" loading="lazy" onerror="this.src='/icons/weather.svg'">
            <h3 class="card-item-name">${outfit.bottom}</h3>
            <p class="card-item-desc">${getItemDescription(outfit.bottom, weatherData.temp)}</p>
          </div>
        </div>
        
        <div class="ensemble-card">
          <div class="card-header-bar">Footwear</div>
          <div class="card-body">
            <img src="${outfit.footwearImage}" alt="${outfit.footwear}" class="card-image" loading="lazy" onerror="this.src='/icons/weather.svg'">
            <h3 class="card-item-name">${outfit.footwear}</h3>
            <p class="card-item-desc">${getItemDescription(outfit.footwear, weatherData.temp)}</p>
          </div>
        </div>
        
        <div class="ensemble-card">
          <div class="card-header-bar">Extras</div>
          <div class="card-body">
            <div class="extras-visual">
              ${extras.slice(0, 2).map(extra => `
                <img src="${extra.image}" alt="${extra.name}" class="extra-thumbnail" loading="lazy" onerror="this.style.display='none'">
              `).join('')}
            </div>
            <h3 class="card-item-name">${extrasList}</h3>
            <p class="card-item-desc">${getExtrasDescription(extras, weatherData)}</p>
          </div>
        </div>
      </div>
      
      ${warnings.length > 0 ? `
        <div class="weather-alerts">
          ${warnings.map(w => `<p class="alert-item">&#9888; ${w}</p>`).join('')}
        </div>
      ` : ''}
      
      <p class="atlas-tagline">Dress Smart & Stay Comfortable</p>
      <p class="atlas-footer">&#127781; Weather-Ready Tips | Your Daily Style Guide</p>
    </div>
  `;
}

function getItemDescription(item, temp) {
  const descMap = {
    'Sweater': 'Cozy and Warm',
    'Knitted Sweater': 'Cozy and Warm',
    'Long Sleeve Cotton Shirt': 'Light and Breezy',
    'Polo Shirt': 'Smart and Cool',
    'Cotton T-Shirt': 'Cool and Casual',
    'Light Breathable T-Shirt': 'Airflow Optimized',
    'Sleeveless Tank Top': 'Minimal Coverage',
    'Ultra Lightweight Tank Top': 'Barely There',
    'Insulated Winter Coat': 'Maximum Warmth',
    'Winter Jacket': 'Heavy Protection',
    'Warm Padded Jacket': 'Cozy Shield',
    'Heavy Winter Coat': 'Arctic Ready',
    'Jacket': 'Wind Resistant',
    
    'Jeans': 'Comfortable Fit',
    'Slim Jeans': 'Sleek Fit',
    'Thick Denim': 'Rugged Warmth',
    'Denim Jeans': 'Classic Style',
    'Chinos': 'Smart Casual',
    'Light Chinos': 'Breathable Comfort',
    'Shorts': 'Freedom of Movement',
    'Athletic Shorts': 'Active Ready',
    'Light Shorts': 'Breezy Comfort',
    'Breathable Shorts': 'Air Circulation',
    'Thermal Pants': 'Heat Locked In',
    
    'Sneakers': 'Casual Style',
    'Casual Sneakers': 'All-Day Comfort',
    'Light Sneakers': 'Weightless Step',
    'Boots': 'Sturdy Grip',
    'Ankle Boots': 'Urban Ready',
    'Leather Winter Boots': 'Snow Proof',
    'Winter Boots': 'Ice Traction',
    'Insulated Snow Boots': 'Sub-Zero Ready',
    'Sandals': 'Open Air',
    'Open Sandals': 'Maximum Ventilation',
    'Flip-Flops': 'Beach Ready',
    
    'None needed': 'Perfect as is'
  };
  
  return descMap[item] || 'Weather Appropriate';
}

function getExtrasDescription(extras, weatherData) {
  if (extras.length === 0) return 'No extras needed today';
  
  const rain = weatherData.rainChance > 30;
  const hot = weatherData.temp > 30;
  const cold = weatherData.temp < 5;
  
  if (rain && hot) return 'Stay dry and cool';
  if (rain && cold) return 'Waterproof warmth';
  if (rain) return 'Stay dry out there';
  if (hot) return 'Sun protection essential';
  if (cold) return 'Layer up for warmth';
  return 'Complete your look';
}

async function displayClothing(lat, lon, locationData) {
  showLoading();
  try {
    const weatherData = await getCompleteWeatherData(lat, lon);
    
    const enhanced = await updateLocationFromCoords(weatherData.lat, weatherData.lon, weatherData.cityName);
    
    const city = enhanced.city !== 'Unknown' ? enhanced.city : locationData?.city || weatherData.cityName;
    const country = enhanced.country !== 'Unknown' ? enhanced.country : locationData?.country || weatherData.countryCode;
    
    const finalLocation = {
      lat: weatherData.lat,
      lon: weatherData.lon,
      city,
      country,
      timezone: weatherData.timezone || locationData?.timezone || enhanced.timezone,
      fullName: `${city}, ${country}`
    };
    
    saveCurrentState(finalLocation);
    climateStore = finalLocation;
    
    saveRecentSearch({
      lat: finalLocation.lat,
      lon: finalLocation.lon,
      city: finalLocation.city,
      country: finalLocation.country
    });
    
    updateHeaderText(city, country);
    renderLocationBar(finalLocation);
    renderWardrobeGuide(weatherData);

  } catch (error) {
    console.error('Display clothing error:', error);
    showError('Failed to load wardrobe guide. Please try again.');
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
        
        displayClothing(lat, lon, { lat, lon, city, country });
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
    
    await displayClothing(result.lat, result.lon, result);
    input.value = '';
  } catch (error) {
    showError('City not found. Please try again.');
  }
}

async function loadInitial() {
  if (hasCurrentState()) {
    const lastLocation = getCurrentState();
    try {
      await displayClothing(lastLocation.lat, lastLocation.lon, lastLocation);
    } catch (error) {
      console.error('Failed to load saved location:', error);
      showSearchPrompt();
    }
  } else {
    showSearchPrompt();
  }
}

function setupEvents() {
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
}

async function init() {
  try {
    await loadHeaderFooter();
    setupEvents();
    await loadInitial();
  } catch (error) {
    console.error('Init error:', error);
    showError('Failed to initialize. Please refresh.');
  }
}

init();