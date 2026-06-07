import { getWeatherIconUrl } from './WeatherAPI.mjs';
import { formatLocalTime, formatFullDate } from './utils.mjs';

// Display the location and current time
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
    const weatherContainer = document.getElementById('weather-container');

    if (weatherContainer) {
      weatherContainer.insertAdjacentHTML('beforebegin', html);
    }
  }
}

// Display the current weather card
export function renderCurrentWeather(weatherData, uvIndex = null) {

  // Weather values
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const humidity = weatherData.main.humidity;
  const windSpeed = Math.round(weatherData.wind.speed * 3.6);
  const visibility = Math.round((weatherData.visibility || 10000) / 1000);

  // Weather condition
  const weatherMain = weatherData.weather[0].main;
  const iconCode = weatherData.weather[0].icon;

  // OpenWeather icon
  const iconUrl = getWeatherIconUrl(iconCode, '4x');

  // Change "Clear" to "Sunny"
  const displayCondition =
    weatherMain === 'Clear' ? 'Sunny' : weatherMain;

  // Sunrise and sunset
  const sunrise = new Date(weatherData.sys.sunrise * 1000)
    .toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  const sunset = new Date(weatherData.sys.sunset * 1000)
    .toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  // Weather card HTML
  const html = `
    <div class="weather-card">

      <div class="card-header">
        <span class="header-icon">☀️</span>
        <span class="header-title">CURRENT WEATHER</span>
      </div>

      <div class="main-section">
        <div class="temp-info">
          <h1 class="temp-value">
            ${temp}<span class="temp-unit">°C</span>
          </h1>

          <p class="condition">${displayCondition}</p>

          <p class="feels-like">
            Feels like ${feelsLike}°C
          </p>
        </div>

        <img
          src="${iconUrl}"
          alt="${displayCondition}"
          class="weather-icon-large"
        >
      </div>

      <div class="stats-row">

        <div class="stat">
          <span class="stat-icon">💧</span>

          <div class="stat-text">
            <p class="stat-label">Humidity</p>
            <p class="stat-value">${humidity}%</p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">💨</span>

          <div class="stat-text">
            <p class="stat-label">Wind</p>
            <p class="stat-value">${windSpeed} km/h</p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">☀️</span>

          <div class="stat-text">
            <p class="stat-label">UV Index</p>
            <p class="stat-value">
              ${uvIndex !== null ? `High (${uvIndex})` : 'N/A'}
            </p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">👁️</span>

          <div class="stat-text">
            <p class="stat-label">Visibility</p>
            <p class="stat-value">${visibility} km</p>
          </div>
        </div>

      </div>

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

    </div>
  `;

  const container = document.getElementById('weather-container');

  if (container) {
    container.innerHTML = html;
  } else {
    console.error('Weather container not found');
  }
}