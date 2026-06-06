import { getWeatherIconUrl } from './WeatherAPI.mjs';
import { formatLocalTime, formatFullDate } from './utils.mjs';

/**
 * Render the location and time bar
 * @param {Object} locationData - From LocationManager (fullName, timezone, etc.)
 */
export function renderLocationBar(locationData) {
  const time = formatLocalTime(locationData.timezone);
  const date = formatFullDate();
  
  const html = `
    <div class="location-bar">
      <div class="location-info">
        <span class="location-icon">📍</span>
        <span class="location-name">${locationData.fullName}</span>
      </div>
      <div class="time-info">
        <span class="time-icon">🕒</span>
        <span class="local-time">${time}</span>
        <span class="local-date">${date}</span>
      </div>
    </div>
  `;
  
  const container = document.getElementById('location-bar');
  if (container) {
    container.innerHTML = html;
  } else {
    // Fallback: prepend to weather container if no dedicated bar
    const weatherContainer = document.getElementById('weather-container');
    if (weatherContainer) {
      weatherContainer.insertAdjacentHTML('beforebegin', html);
    }
  }
}

/**
 * Render the current weather card with all data points
 * @param {Object} weatherData - Response from OpenWeather API
 * @param {number|null} uvIndex - UV index value (null if unavailable)
 */
export function renderCurrentWeather(weatherData, uvIndex = null) {
  // Extract and format all data from API response
  const temp = Math.round(weatherData.main.temp);                    // 32
  const feelsLike = Math.round(weatherData.main.feels_like);        // 35
  const humidity = weatherData.main.humidity;                        // 55
  const windSpeed = Math.round(weatherData.wind.speed * 3.6);       // 10 km/h
  const visibility = Math.round((weatherData.visibility || 10000) / 1000); // 10 km
  const weatherMain = weatherData.weather[0].main;                   // "Clear"
  const iconCode = weatherData.weather[0].icon;                      // "01d"
  const iconUrl = getWeatherIconUrl(iconCode, '4x');                // Large icon

  // Convert "Clear" to "Sunny" for display
  const displayCondition = weatherMain === 'Clear' ? 'Sunny' : weatherMain;

  // Convert Unix timestamps to readable times (6:24 AM, 6:48 PM)
  const sunrise = new Date(weatherData.sys.sunrise * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(weatherData.sys.sunset * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Build the HTML matching your image exactly
  const html = `
    <div class="weather-card">
      <!-- Header: CURRENT WEATHER -->
      <div class="card-header">
        <span class="header-icon">☀️</span>
        <span class="header-title">CURRENT WEATHER</span>
      </div>

      <!-- Main: Temperature + Big Icon -->
      <div class="main-section">
        <div class="temp-info">
          <h1 class="temp-value">${temp}<span class="temp-unit">°C</span></h1>
          <p class="condition">${displayCondition}</p>
          <p class="feels-like">Feels like ${feelsLike}°C</p>
        </div>
        <img src="${iconUrl}" alt="${displayCondition}" class="weather-icon-large">
      </div>

      <!-- Stats Row: 4 boxes -->
      <div class="stats-row">
        <div class="stat">
          <span class="stat-icon">💧</span>
          <p class="stat-label">Humidity</p>
          <p class="stat-value">${humidity}%</p>
        </div>
        <div class="stat">
          <span class="stat-icon">💨</span>
          <p class="stat-label">Wind</p>
          <p class="stat-value">${windSpeed} km/h</p>
        </div>
        <div class="stat">
          <span class="stat-icon">☀️</span>
          <p class="stat-label">UV Index</p>
          <p class="stat-value">${uvIndex !== null ? `High (${uvIndex})` : 'N/A'}</p>
        </div>
        <div class="stat">
          <span class="stat-icon">👁️</span>
          <p class="stat-label">Visibility</p>
          <p class="stat-value">${visibility} km</p>
        </div>
      </div>

      <!-- Footer: Sunrise / Sunset -->
      <div class="footer-times">
        <div class="time-slot">
          <span class="time-icon">🌅</span>
          <span class="time-label">Sunrise</span>
          <span class="time-value">${sunrise}</span>
        </div>
        <div class="time-slot">
          <span class="time-icon">🌇</span>
          <span class="time-label">Sunset</span>
          <span class="time-value">${sunset}</span>
        </div>
      </div>
    </div>`;

  // Insert into page
  const container = document.getElementById('weather-container');
  if (container) {
    container.innerHTML = html;
  } else {
    console.error('Weather container not found in DOM');
  }
}