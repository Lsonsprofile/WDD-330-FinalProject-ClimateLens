// location bar
export function renderLocationBarHTML(locationData, time, date) {
  return `
    <div class="location-bar">
      <div class="location-info">
        <img src="/icons/location.svg" alt="Location" class="location-icon">
        <span class="location-name">${locationData.fullName}</span>
      </div>
      <div class="time-info">
        <img src="/icons/time.svg" alt="Time" class="time-icon">
        <span class="local-time">${time}</span>
        <span class="local-date">${date}</span>
      </div>
    </div>
  `;
}

// current weather card
export function renderCurrentWeatherHTML(data) {
  const displayCondition = data.condition === 'Clear' ? 'Sunny' : data.condition;
  
  return `
    <div class="weather-card">
      <div class="card-header">
        <img src="/icons/weather.svg" alt="Weather" class="header-icon">
        <span class="header-title">CURRENT WEATHER</span>
      </div>
      <div class="main-section">
        <div class="temp-info">
          <h1 class="temp-value">${data.temp}<span class="temp-unit">°C</span></h1>
          <p class="condition">${displayCondition}</p>
          <p class="feels-like">Feels like ${data.feelsLike}°C</p>
        </div>
        <img src="/icons/weather.svg" alt="${displayCondition}" class="weather-icon-large">
      </div>
      <div class="stats-row">
        ${renderStat('/icons/humidity.svg', 'Humidity', `${data.humidity}%`)}
        ${renderStat('/icons/wind.svg', 'Wind', `${data.windSpeed} km/h`)}
        ${renderStat('/icons/uv-index.svg', 'UV Index', data.uvIndex, data.uvIndexText)}
        ${renderStat('/icons/visibility.svg', 'Visibility', `${data.visibility} km`)}
      </div>
      <div class="stats-row second-row">
        ${renderStat('/icons/pressure.svg', 'Pressure', `${data.pressure} hPa`)}
        ${renderStat('/icons/clouds.svg', 'Cloud Cover', `${data.cloudCover}%`)}
        ${renderStat('/icons/dew-point.svg', 'Dew Point', `${data.dewPoint}°C`)}
        ${renderStat('/icons/rain-chance.svg', 'Rain Chance', `${data.rainChance}%`)}
      </div>
      <div class="footer-times">
        ${renderTimeSlot('/icons/sunrise.svg', 'Sunrise', data.sunriseFormatted)}
        ${renderTimeSlot('/icons/sunset.svg', 'Sunset', data.sunsetFormatted)}
      </div>
    </div>
  `;
}

function renderStat(icon, label, value, sub = '') {
  return `
    <div class="stat">
      <img src="${icon}" alt="${label}" class="stat-icon">
      <div class="stat-text">
        <p class="stat-label">${label}</p>
        <p class="stat-value">${value}</p>
        ${sub ? `<p class="stat-sub">${sub}</p>` : ''}
      </div>
    </div>
  `;
}

function renderTimeSlot(icon, label, value) {
  return `
    <div class="time-slot">
      <img src="${icon}" alt="${label}" class="time-icon">
      <span class="time-label">${label}</span>
      <span class="time-value">${value}</span>
    </div>
  `;
}

// hourly forecast - detailed version
export function renderHourlyHTML(hourlyData) {
  if (!hourlyData?.length) return '';
  
  const hours = hourlyData.slice(0, 8);
  
  return `
    <div class="hourly-container">
      <h4 class="hourly-title">Hourly Forecast</h4>
      <div class="hourly-scroll">
        ${hours.map(h => {
          // determine icon based on condition and time
          const iconName = getIconForCondition(h.condition, h.isDaytime);
          const windDirection = h.windDirection || '';
          const windDisplay = windDirection ? `${h.windSpeed} ${windDirection}` : `${h.windSpeed}`;
          
          return `
            <div class="hourly-item">
              <span class="hourly-time">${h.time}</span>
              <div class="hourly-icon-wrap">
                <img src="/icons/${iconName}.svg" alt="${h.condition}" class="hourly-icon" width="40" height="40" onerror="this.src='/icons/weather.svg'">
              </div>
              <span class="hourly-temp">${h.temp}°</span>
              <span class="hourly-feels">feels ${h.feelsLike}°</span>
              <div class="hourly-details">
                <span class="hourly-humidity" title="Humidity">
                  <img src="/icons/humidity.svg" alt="" width="12" height="12">
                  ${h.humidity}%
                </span>
                <span class="hourly-wind" title="Wind">
                  <img src="/icons/wind.svg" alt="" width="12" height="12">
                  ${windDisplay}
                </span>
              </div>
              ${h.rainChance > 0 ? `<span class="hourly-pop">${h.rainChance}%</span>` : ''}
              ${h.description ? `<span class="hourly-desc">${h.description}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// helper to pick icon based on condition
function getIconForCondition(condition, isDaytime = true) {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return isDaytime ? 'sun' : 'moon';
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloud';
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rain';
  }
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return 'thunder';
  }
  if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
    return 'snow';
  }
  if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
    return 'fog';
  }
  
  return 'weather';
}


// forecast cards
export function renderForecastHTML(processedForecast) {
  if (!processedForecast?.daily?.length) {
    return '<div class="forecast-error">No forecast data</div>';
  }
  
  return `
    <div class="forecast-container">
      <h3 class="forecast-title">Future Forecast</h3>
      <div class="forecast-grid">
        ${processedForecast.daily.map(day => renderForecastCard(day)).join('')}
      </div>
    </div>
  `;
}

function renderForecastCard(day) {
  return `
    <div class="forecast-card" data-day="${day.day}">
      <div class="forecast-day">${day.day}</div>
      <div class="forecast-date">${day.fullDate}</div>
      <img src="/icons/weather.svg" alt="${day.condition}" class="forecast-icon">
      <div class="forecast-temp">
        <span class="temp-high">${day.tempMax}°</span>
        <span class="temp-low">${day.tempMin}°</span>
      </div>
      <div class="forecast-condition">${day.condition}</div>
      <div class="forecast-details">
        <span class="detail-item">
          <img src="/icons/humidity.svg" alt="humidity" class="detail-icon">
          ${day.humidityAvg}%
        </span>
        <span class="detail-item">
          <img src="/icons/wind.svg" alt="wind" class="detail-icon">
          ${day.windSpeedAvg} km/h
        </span>
        ${day.rainChanceMax > 0 ? `
          <span class="detail-item">
            <img src="/icons/rain-chance.svg" alt="rain" class="detail-icon">
            ${day.rainChanceMax}%
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

// day detail modal
export function renderDayDetailHTML(dayData, processedForecast) {
  if (!dayData) return '<div class="error">No data</div>';
  
  return `
    <div class="day-detail">
      <h3>${dayData.day} - ${dayData.fullDate}</h3>
      <div class="detail-main">
        <img src="/icons/weather.svg" alt="${dayData.condition}">
        <div class="detail-temps">
          <span class="detail-high">${dayData.tempMax}°</span>
          <span class="detail-low">${dayData.tempMin}°</span>
        </div>
        <p class="detail-condition">${dayData.condition}</p>
      </div>
      <div class="detail-stats">
        <div class="detail-stat"><span>💧 Humidity</span><span>${dayData.humidityAvg}%</span></div>
        <div class="detail-stat"><span>💨 Wind</span><span>${dayData.windSpeedAvg} km/h</span></div>
        <div class="detail-stat"><span>🌧️ Rain</span><span>${dayData.rainChanceMax}%</span></div>
      </div>
    </div>
  `;
}

// compact weather card
export function renderCompactWeatherHTML(weatherData, locationData) {
  return `
    <div class="compact-weather-card" data-lat="${locationData.lat}" data-lon="${locationData.lon}">
      <div class="compact-location">${locationData.city || locationData.fullName}</div>
      <div class="compact-temp">${weatherData.temp}°C</div>
      <img src="/icons/weather.svg" alt="${weatherData.condition}" class="compact-icon">
      <div class="compact-condition">${weatherData.condition}</div>
    </div>
  `;
}