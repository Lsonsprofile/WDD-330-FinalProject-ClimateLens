import { getWeatherIconUrl } from './WeatherService.mjs';
import { formatLocalTime, formatFullDate } from './utils.mjs';

// display location and current time
export function renderLocationBar(locationData) {
  const time = formatLocalTime(locationData.timezone);
  const date = formatFullDate();

  const html = `
    <div class="location-bar">
      <div class="location-info">
        <img src="/icons/location.svg" alt="Location icon" class="location-icon">
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

// display current weather card
export function renderCurrentWeather(weatherData) {
  const temp = weatherData.temp;
  const feelsLike = weatherData.feelsLike;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.windSpeed;
  const visibility = weatherData.visibility;
  const displayCondition = weatherData.condition === 'Clear' ? 'Sunny' : weatherData.condition;
  const iconUrl = getWeatherIconUrl(weatherData.iconCode, '4x');
  const sunrise = weatherData.sunriseFormatted;
  const sunset = weatherData.sunsetFormatted;
  
  const pressure = weatherData.pressure;
  const cloudCover = weatherData.cloudCover || 0;
  const dewPoint = weatherData.dewPoint || 'N/A';
  const windDirection = weatherData.windDirection || 'N/A';
  const rainChance = weatherData.rainChance || 0;

  // uv index - always N/A on free tier
  const uvText = 'N/A';

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
          <p class="feels-like">Feels like ${feelsLike}°C</p>
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
            <p class="stat-sub">${windDirection}</p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">☀️</span>
          <div class="stat-text">
            <p class="stat-label">UV Index</p>
            <p class="stat-value">${uvText}</p>
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

      <div class="stats-row second-row">
        <div class="stat">
          <span class="stat-icon">📊</span>
          <div class="stat-text">
            <p class="stat-label">Pressure</p>
            <p class="stat-value">${pressure} hPa</p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">☁️</span>
          <div class="stat-text">
            <p class="stat-label">Cloud Cover</p>
            <p class="stat-value">${cloudCover}%</p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">💧</span>
          <div class="stat-text">
            <p class="stat-label">Dew Point</p>
            <p class="stat-value">${dewPoint}°C</p>
          </div>
        </div>

        <div class="stat">
          <span class="stat-icon">🌧️</span>
          <div class="stat-text">
            <p class="stat-label">Rain Chance</p>
            <p class="stat-value">${rainChance}%</p>
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
  }
}

// render compact weather for saved locations
export function renderCompactWeather(weatherData, locationData) {
  const temp = weatherData.temp;
  const iconUrl = getWeatherIconUrl(weatherData.iconCode, '2x');
  
  return `
    <div class="compact-weather-card" data-lat="${locationData.lat}" data-lon="${locationData.lon}">
      <div class="compact-location">${locationData.city || locationData.fullName}</div>
      <div class="compact-temp">${temp}°C</div>
      <img src="${iconUrl}" alt="${weatherData.condition}" class="compact-icon">
      <div class="compact-condition">${weatherData.condition}</div>
    </div>
  `;
}