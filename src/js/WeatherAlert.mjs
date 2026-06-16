import { fetchForecast, getLastForecastData } from './WeatherService.mjs';

export async function getWeatherAlerts(lat, lon, cityName, rawForecastData = null) {
  try {
    const data = rawForecastData || getLastForecastData() || await fetchForecast(lat, lon, 1);
    
    const alerts = [];
    const hourly = data.forecast?.forecastday?.[0]?.hour || [];
    const forecastDay = data.forecast?.forecastday?.[0]?.day;
    const now = new Date();
    const currentHour = now.getHours();

    const relevantHours = hourly.slice(currentHour, currentHour + 2);
    
    const rainPeriods = [];
    relevantHours.forEach(h => {
      const rainChance = h.chance_of_rain || 0;
      if (rainChance >= 40) {
        const hourTime = new Date(h.time);
        rainPeriods.push({
          time: hourTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          chance: rainChance,
          condition: h.condition?.text || 'Rain'
        });
      }
    });

    const dailyRainChance = forecastDay?.daily_chance_of_rain || 0;
    
    if (dailyRainChance >= 40 || rainPeriods.length > 0) {
      const maxRainChance = Math.max(dailyRainChance, ...rainPeriods.map(r => r.chance));
      
      let alertMessage;
      if (rainPeriods.length > 0) {
        const firstPeriod = rainPeriods[0];
        const lastPeriod = rainPeriods[rainPeriods.length - 1];
        if (rainPeriods.length === 1) {
          alertMessage = `Possible rain in ${cityName} around ${firstPeriod.time} (${maxRainChance}% chance)`;
        } else {
          alertMessage = `Possible rain in ${cityName} from ${firstPeriod.time} to ${lastPeriod.time} (${maxRainChance}% chance)`;
        }
      } else {
        alertMessage = `Rain likely in ${cityName} today (${dailyRainChance}% chance). Current conditions are dry.`;
      }
      
      alerts.push({
        type: 'rain',
        severity: maxRainChance > 70 ? 'high' : 'medium',
        message: alertMessage,
        icon: '&#127783;',
        periods: rainPeriods
      });
    }

    const dailyMaxUv = Math.max(...hourly.map(h => h.uv || 0));
    const currentUv = relevantHours[0]?.uv || 0;

    if (dailyMaxUv >= 8) {
      const message = currentUv >= 8
        ? `High UV index (${currentUv}) in ${cityName} now. Wear sunscreen!`
        : `High UV index (${dailyMaxUv}) reached in ${cityName} today. Current UV is ${currentUv}.`;
      
      alerts.push({
        type: 'uv',
        severity: 'high',
        message: message,
        icon: '&#9728;'
      });
    }

    const currentWind = relevantHours[0]?.wind_kph || 0;
    if (currentWind >= 50) {
      alerts.push({
        type: 'wind',
        severity: 'high',
        message: `Strong winds ${Math.round(currentWind)} km/h in ${cityName} now`,
        icon: '&#127788;'
      });
    }

    const snowHours = relevantHours.filter(h => (h.chance_of_snow || 0) >= 30);
    if (snowHours.length > 0) {
      const isSnowingNow = new Date(snowHours[0].time).getHours() === currentHour;
      const message = isSnowingNow 
        ? `Snow in ${cityName} now (${snowHours[0].chance_of_snow}% chance)`
        : `Snow starting in ${cityName} soon (${snowHours[0].chance_of_snow}% chance)`;
      
      alerts.push({
        type: 'snow',
        severity: 'medium',
        message: message,
        icon: '&#10052;'
      });
    }

    return alerts;

  } catch (error) {
    console.error('Alert check failed:', error);
    return [];
  }
}

export function renderWeatherAlerts(alerts, containerId = 'weather-alerts') {
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    const main = document.querySelector('main');
    if (main) main.insertBefore(container, main.firstChild);
  }

  container.innerHTML = '';

  if (!alerts || alerts.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  const severityColors = {
    high: 'alert-high',
    medium: 'alert-medium',
    low: 'alert-low'
  };

  container.innerHTML = `
    <div class="alerts-banner" role="alert" aria-live="polite">
      <div class="alerts-header">
        <span class="alerts-icon">&#9888;</span>
        <span class="alerts-title">Weather Alerts</span>
        <button class="alerts-dismiss" aria-label="Dismiss alerts">&#10005;</button>
      </div>
      <div class="alerts-list">
        ${alerts.map(alert => `
          <div class="alert-item ${severityColors[alert.severity] || 'alert-medium'}">
            <span class="alert-icon">${alert.icon}</span>
            <span class="alert-message">${alert.message}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const dismissBtn = container.querySelector('.alerts-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      container.style.display = 'none';
      sessionStorage.setItem('alertsDismissed', 'true');
    });
  }
}