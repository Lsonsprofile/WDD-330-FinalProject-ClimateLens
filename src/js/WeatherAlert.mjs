import { fetchForecast, getLastForecastData } from './WeatherService.mjs';

export async function getWeatherAlerts(lat, lon, cityName, rawForecastData = null) {
  try {
    // Use provided raw data, or cache, or fetch fresh
    const data = rawForecastData || getLastForecastData() || await fetchForecast(lat, lon, 1);
    
    const alerts = [];
    const hourly = data.forecast?.forecastday?.[0]?.hour || [];
    const now = new Date();
    const currentHour = now.getHours();

    const upcomingHours = hourly.slice(currentHour, currentHour + 12);
    
    const rainPeriods = [];
    upcomingHours.forEach(h => {
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

    if (rainPeriods.length > 0) {
      const firstPeriod = rainPeriods[0];
      const lastPeriod = rainPeriods[rainPeriods.length - 1];
      
      let alertMessage;
      if (rainPeriods.length === 1) {
        alertMessage = `Possible rain in ${cityName} around ${firstPeriod.time} (${firstPeriod.chance}% chance)`;
      } else {
        alertMessage = `Possible rain in ${cityName} from ${firstPeriod.time} to ${lastPeriod.time} (${firstPeriod.chance}% chance)`;
      }
      
      alerts.push({
        type: 'rain',
        severity: rainPeriods[0].chance > 70 ? 'high' : 'medium',
        message: alertMessage,
        icon: '&#127783;',
        periods: rainPeriods
      });
    }

    const maxUv = Math.max(...upcomingHours.map(h => h.uv || 0));
    if (maxUv >= 8) {
      alerts.push({
        type: 'uv',
        severity: 'high',
        message: `High UV index (${maxUv}) in ${cityName} today. Wear sunscreen!`,
        icon: '&#9728;'
      });
    }

    const maxWind = Math.max(...upcomingHours.map(h => h.wind_kph || 0));
    if (maxWind >= 50) {
      alerts.push({
        type: 'wind',
        severity: 'high',
        message: `Strong winds up to ${Math.round(maxWind)} km/h expected in ${cityName}`,
        icon: '&#127788;'
      });
    }

    const snowHours = upcomingHours.filter(h => (h.chance_of_snow || 0) >= 30);
    if (snowHours.length > 0) {
      alerts.push({
        type: 'snow',
        severity: 'medium',
        message: `Possible snow in ${cityName} today (${snowHours[0].chance_of_snow}% chance)`,
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
        <span class="alerts-title">Weather Alerts for Today</span>
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