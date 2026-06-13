// get weather icon URL
export function getWeatherIconUrl(iconCode) {
  if (!iconCode) return '/icons/weather.svg';
  return iconCode.startsWith('http') ? iconCode : `https:${iconCode}`;
}

// location bar
export function renderLocationBar(locationData) {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div class="location-bar">
      <div class="location-info">
        <img src="/icons/location.svg" alt="Location" class="location-icon" onerror="this.style.display='none'">
        <span class="location-name">${locationData.fullName || `${locationData.city}, ${locationData.country}`}</span>
      </div>
      <div class="time-info">
        <img src="/icons/time.svg" alt="Time" class="time-icon" onerror="this.style.display='none'">
        <span class="local-time">${time}</span>
        <span class="local-date">${date}</span>
      </div>
    </div>
  `;

  const container = document.getElementById('location-bar');
  if (container) {
    container.innerHTML = html;
  }
}

// current weather card
export function renderCurrentWeather(data) {
  const displayCondition = data.condition === 'Clear' || data.condition === 'Sunny' ? 'Sunny' : data.condition;
  const iconUrl = getWeatherIconUrl(data.iconCode);
  
  const html = `
    <div class="weather-card">
      <div class="card-header">
        <img src="/icons/weather.svg" alt="Weather" class="header-icon" onerror="this.style.display='none'">
        <span class="header-title">CURRENT WEATHER</span>
      </div>
      <div class="main-section">
        <div class="temp-info">
          <h1 class="temp-value">${data.temp}<span class="temp-unit">°C</span></h1>
          <p class="condition">${displayCondition}</p>
          <p class="feels-like">Feels like ${data.feelsLike}°C</p>
        </div>
        <img src="${iconUrl}" alt="${displayCondition}" class="weather-icon-large" onerror="this.src='/icons/weather.svg'">
      </div>
      <div class="stats-row">
        ${renderStat('/icons/humidity.svg', 'Humidity', `${data.humidity}%`)}
        ${renderStat('/icons/wind.svg', 'Wind', `${data.windSpeed} km/h ${data.windDirection}`)}
        ${renderStat('/icons/uv-index.svg', 'UV Index', data.uvValue || 'N/A')}
        ${renderStat('/icons/visibility.svg', 'Visibility', `${data.visibility} km`)}
      </div>
      <div class="stats-row second-row">
        ${renderStat('/icons/pressure.svg', 'Pressure', `${data.pressure} hPa`)}
        ${renderStat('/icons/clouds.svg', 'Cloud Cover', `${data.cloudCover}%`)}
        ${renderStat('/icons/rain-chance.svg', 'Rain Chance', `${data.rainChance}%`)}
        ${renderStat('/icons/dew-point.svg', 'Dew Point', `${data.feelsLike}°C`)}
      </div>
      <div class="footer-times">
        ${renderTimeSlot('/icons/sunrise.svg', 'Sunrise', data.sunriseFormatted)}
        ${renderTimeSlot('/icons/sunset.svg', 'Sunset', data.sunsetFormatted)}
      </div>
    </div>
  `;

  const container = document.getElementById('weather-container');
  if (container) {
    container.innerHTML = html;
  }
}

function renderStat(icon, label, value) {
  return `
    <div class="stat">
      <img src="${icon}" alt="${label}" class="stat-icon" onerror="this.style.display='none'">
      <div class="stat-text">
        <p class="stat-label">${label}</p>
        <p class="stat-value">${value}</p>
      </div>
    </div>
  `;
}

function renderTimeSlot(icon, label, value) {
  return `
    <div class="time-slot">
      <img src="${icon}" alt="${label}" class="time-icon" onerror="this.style.display='none'">
      <span class="time-label">${label}</span>
      <span class="time-value">${value}</span>
    </div>
  `;
}

// hourly forecast
export function renderHourly(hourlyData) {
  if (!hourlyData?.length) return;
  
  const hours = hourlyData.slice(0, 8);
  
  const html = `
    <div class="hourly-container">
      <h4 class="hourly-title">Hourly Forecast</h4>
      <div class="hourly-scroll">
        ${hours.map(h => {
          const iconUrl = getWeatherIconUrl(h.iconCode);
          return `
            <div class="hourly-item">
              <span class="hourly-time">${h.time}</span>
              <img src="${iconUrl}" alt="${h.condition}" class="hourly-icon" width="40" height="40" onerror="this.src='/icons/weather.svg'">
              <span class="hourly-temp">${h.temp}°</span>
              ${h.rainChance > 0 ? `<span class="hourly-rain">${h.rainChance}%</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const container = document.getElementById('hourly-container');
  if (container) {
    container.innerHTML = html;
  }
}

// forecast cards
export function renderForecast(forecastData) {
  if (!forecastData?.daily?.length) {
    const container = document.getElementById('forecast-container');
    if (container) container.innerHTML = '<div class="forecast-error">No forecast data</div>';
    return;
  }
  
  const html = `
    <div class="forecast-container">
      <h3 class="forecast-title">Future Forecast</h3>
      <div class="forecast-grid">
        ${forecastData.daily.map(day => renderForecastCard(day)).join('')}
      </div>
    </div>
  `;

  const container = document.getElementById('forecast-container');
  if (container) {
    container.innerHTML = html;
  }
}

function renderForecastCard(day) {
  const iconUrl = getWeatherIconUrl(day.iconCode);
  
  return `
    <div class="forecast-card" data-day="${day.day}">
      <div class="forecast-day">${day.day}</div>
      <div class="forecast-date">${day.fullDate}</div>
      <img src="${iconUrl}" alt="${day.condition}" class="forecast-icon" onerror="this.src='/icons/weather.svg'">
      <div class="forecast-temp">
        <span class="temp-high">${day.tempMax}°</span>
        <span class="temp-low">${day.tempMin}°</span>
      </div>
      <div class="forecast-condition">${day.condition}</div>
      <div class="forecast-details">
        <span class="detail-item">
          <img src="/icons/humidity.svg" alt="humidity" class="detail-icon" onerror="this.style.display='none'">
          ${day.humidityAvg}%
        </span>
        <span class="detail-item">
          <img src="/icons/wind.svg" alt="wind" class="detail-icon" onerror="this.style.display='none'">
          ${day.windSpeedAvg} km/h
        </span>
        ${day.rainChanceMax > 0 ? `
          <span class="detail-item">
            <img src="/icons/rain-chance.svg" alt="rain" class="detail-icon" onerror="this.style.display='none'">
            ${day.rainChanceMax}%
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

// day detail modal
export function renderDayModal(dayData, forecastData) {
  if (!dayData) return;
  
  const modal = document.createElement('div');
  modal.id = 'day-detail-modal';
  modal.className = 'modal-overlay';
  
  const iconUrl = getWeatherIconUrl(dayData.iconCode);
  
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-btn">&times;</button>
      <h3>${dayData.day} - ${dayData.fullDate}</h3>
      <div class="detail-main">
        <img src="${iconUrl}" alt="${dayData.condition}" onerror="this.src='/icons/weather.svg'">
        <div class="detail-temps">
          <span class="detail-high">${dayData.tempMax}°</span>
          <span class="detail-low">${dayData.tempMin}°</span>
        </div>
        <p class="detail-condition">${dayData.condition}</p>
      </div>
      <div class="detail-stats">
        <div class="detail-stat"><span>Humidity</span><span>${dayData.humidityAvg}%</span></div>
        <div class="detail-stat"><span>Wind</span><span>${dayData.windSpeedAvg} km/h</span></div>
        <div class="detail-stat"><span>Rain Chance</span><span>${dayData.rainChanceMax}%</span></div>
        <div class="detail-stat"><span>UV Index</span><span>${dayData.uvValue || 'N/A'}</span></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

export function hideDayModal() {
  const modal = document.getElementById('day-detail-modal');
  if (modal) modal.remove();
}