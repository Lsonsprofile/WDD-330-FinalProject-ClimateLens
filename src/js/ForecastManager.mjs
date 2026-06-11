import { fetchForecast, getWeatherIconUrl } from './WeatherService.mjs';

// process raw forecast data from OpenWeather API
export function processForecastData(forecastData) {
  if (!forecastData || !forecastData.list) {
    return null;
  }

  const dailyForecasts = {};
  const hourlyForecasts = [];

  // process each 3-hour forecast
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    // hourly data
    hourlyForecasts.push({
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      hour: date.getHours(),
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      iconCode: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6),
      rainChance: item.pop ? Math.round(item.pop * 100) : 0,
      dt: item.dt
    });

    // aggregate daily data
    if (!dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = {
        day: dayKey,
        fullDate: fullDate,
        temps: [],
        feelsLike: [],
        conditions: [],
        humidity: [],
        windSpeed: [],
        rainChance: [],
        iconCodes: [],
        dt: item.dt
      };
    }

    dailyForecasts[dayKey].temps.push(item.main.temp);
    dailyForecasts[dayKey].feelsLike.push(item.main.feels_like);
    dailyForecasts[dayKey].conditions.push(item.weather[0].main);
    dailyForecasts[dayKey].humidity.push(item.main.humidity);
    dailyForecasts[dayKey].windSpeed.push(item.wind.speed * 3.6);
    dailyForecasts[dayKey].rainChance.push(item.pop || 0);
    dailyForecasts[dayKey].iconCodes.push(item.weather[0].icon);
  });

  // calculate daily averages
  const processedDaily = Object.keys(dailyForecasts).map(dayKey => {
    const day = dailyForecasts[dayKey];
    
    // most frequent condition
    const conditionCount = {};
    day.conditions.forEach(cond => {
      conditionCount[cond] = (conditionCount[cond] || 0) + 1;
    });
    const mostCommonCondition = Object.keys(conditionCount).reduce((a, b) => 
      conditionCount[a] > conditionCount[b] ? a : b
    );
    
    // most frequent icon
    const iconCount = {};
    day.iconCodes.forEach(icon => {
      iconCount[icon] = (iconCount[icon] || 0) + 1;
    });
    const mostCommonIcon = Object.keys(iconCount).reduce((a, b) => 
      iconCount[a] > iconCount[b] ? a : b
    );

    return {
      day: day.day,
      fullDate: day.fullDate,
      tempMin: Math.round(Math.min(...day.temps)),
      tempMax: Math.round(Math.max(...day.temps)),
      tempAvg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
      feelsLikeAvg: Math.round(day.feelsLike.reduce((a, b) => a + b, 0) / day.feelsLike.length),
      condition: mostCommonCondition,
      iconCode: mostCommonIcon,
      humidityAvg: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeedAvg: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      rainChanceMax: Math.round(Math.max(...day.rainChance) * 100),
      dt: day.dt
    };
  });

  // next 4 days excluding today
  const next5Days = processedDaily.slice(1);;

  return {
    daily: next5Days,
    hourly: hourlyForecasts,
    city: forecastData.city?.name || 'Unknown',
    country: forecastData.city?.country || '',
    lastUpdated: new Date().toISOString()
  };
}

// get forecast for specific day
export function getForecastForDay(processedForecast, dayIndex) {
  if (!processedForecast || !processedForecast.daily) return null;
  
  if (dayIndex === 0) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    return processedForecast.daily.find(d => d.day === today) || processedForecast.daily[0];
  }
  
  return processedForecast.daily[dayIndex - 1] || null;
}

// get hourly forecast for time range
export function getHourlyForecast(processedForecast, hours = 24) {
  if (!processedForecast || !processedForecast.hourly) return [];
  
  const now = new Date();
  const currentHour = now.getHours();
  
  let startIndex = processedForecast.hourly.findIndex(h => h.hour > currentHour);
  if (startIndex === -1) startIndex = 0;
  
  return processedForecast.hourly.slice(startIndex, startIndex + Math.ceil(hours / 3));
}

// get rain forecast for next 24 hours
export function getRainForecast(processedForecast) {
  if (!processedForecast || !processedForecast.hourly) {
    return { willRain: false, chance: 0, times: [] };
  }
  
  const next24Hours = getHourlyForecast(processedForecast, 24);
  const rainTimes = next24Hours.filter(h => h.rainChance > 30);
  const maxRainChance = Math.max(...next24Hours.map(h => h.rainChance), 0);
  
  return {
    willRain: rainTimes.length > 0,
    chance: maxRainChance,
    times: rainTimes.map(r => ({
      time: r.time,
      chance: r.rainChance
    })),
    summary: rainTimes.length > 0 
      ? `Rain expected in the next 24 hours (${maxRainChance}% chance)`
      : 'No rain expected in the next 24 hours'
  };
}

// get temperature trend for the week
export function getTemperatureTrend(processedForecast) {
  if (!processedForecast || !processedForecast.daily || processedForecast.daily.length < 2) {
    return { trend: 'stable', direction: 0, message: 'Temperature stable' };
  }
  
  const temps = processedForecast.daily.map(d => d.tempAvg);
  const firstTemp = temps[0];
  const lastTemp = temps[temps.length - 1];
  const difference = lastTemp - firstTemp;
  
  let trend = 'stable';
  let message = 'Temperature will remain stable';
  
  if (difference > 3) {
    trend = 'warming';
    message = `Temperature will warm by ${Math.round(difference)}°C over the week`;
  } else if (difference < -3) {
    trend = 'cooling';
    message = `Temperature will cool by ${Math.round(Math.abs(difference))}°C over the week`;
  } else if (difference > 0) {
    trend = 'slightly-warming';
    message = `Temperature will warm slightly by ${Math.round(difference)}°C`;
  } else if (difference < 0) {
    trend = 'slightly-cooling';
    message = `Temperature will cool slightly by ${Math.round(Math.abs(difference))}°C`;
  }
  
  return {
    trend,
    difference: Math.round(difference),
    message,
    high: Math.max(...temps),
    low: Math.min(...temps),
    averages: temps
  };
}

// get best days for outdoor activities
export function getBestOutdoorDays(processedForecast) {
  if (!processedForecast || !processedForecast.daily) return [];
  
  return processedForecast.daily
    .map(day => ({
      day: day.day,
      date: day.fullDate,
      temp: day.tempAvg,
      condition: day.condition,
      rainChance: day.rainChanceMax,
      windSpeed: day.windSpeedAvg,
      score: calculateOutdoorScore(day)
    }))
    .filter(day => day.score >= 70)
    .sort((a, b) => b.score - a.score);
}

// calculate outdoor activity score (0-100)
function calculateOutdoorScore(day) {
  let score = 100;
  
  if (day.rainChanceMax > 70) score -= 40;
  else if (day.rainChanceMax > 40) score -= 20;
  else if (day.rainChanceMax > 20) score -= 10;
  
  if (day.windSpeedAvg > 40) score -= 30;
  else if (day.windSpeedAvg > 25) score -= 15;
  else if (day.windSpeedAvg > 15) score -= 5;
  
  if (day.tempAvg > 35 || day.tempAvg < 5) score -= 30;
  else if (day.tempAvg > 30 || day.tempAvg < 10) score -= 15;
  
  const badConditions = ['Thunderstorm', 'Heavy Rain', 'Snow', 'Extreme'];
  if (badConditions.includes(day.condition)) score -= 50;
  else if (day.condition === 'Rain') score -= 30;
  else if (day.condition === 'Drizzle') score -= 15;
  else if (day.condition === 'Clouds') score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

// get forecast summary for display
export function getForecastSummary(processedForecast) {
  if (!processedForecast || !processedForecast.daily || processedForecast.daily.length === 0) {
    return { summary: 'No forecast available', icon: '❓' };
  }
  
  const tomorrow = processedForecast.daily[0];
  const rainForecast = getRainForecast(processedForecast);
  const tempTrend = getTemperatureTrend(processedForecast);
  
  let summary = '';
  let icon = '☀️';
  
  if (rainForecast.willRain) {
    summary = `Rain expected with ${rainForecast.chance}% chance`;
    icon = '🌧️';
  } else if (tomorrow.condition === 'Clear') {
    summary = `Sunny tomorrow, high of ${tomorrow.tempMax}°C`;
    icon = '☀️';
  } else if (tomorrow.condition === 'Clouds') {
    summary = `Cloudy tomorrow, high of ${tomorrow.tempMax}°C`;
    icon = '☁️';
  } else {
    summary = `${tomorrow.condition} tomorrow, ${tomorrow.tempMax}°C`;
    icon = '🌤️';
  }
  
  if (tempTrend.trend === 'warming') {
    summary += `. Getting warmer by ${tempTrend.difference}°C`;
  } else if (tempTrend.trend === 'cooling') {
    summary += `. Getting cooler by ${Math.abs(tempTrend.difference)}°C`;
  }
  
  return { summary, icon, rainForecast, tempTrend };
}

// fetch and process complete forecast
export async function getProcessedForecast(lat, lon) {
  try {
    const rawForecast = await fetchForecast(lat, lon);
    return processForecastData(rawForecast);
  } catch (error) {
    return null;
  }
}

export function renderForecastHTML(processedForecast) {
  if (!processedForecast || !processedForecast.daily || processedForecast.daily.length === 0) {
    return '<div class="forecast-error">No forecast data available</div>';
  }
  
  return `
    <div class="forecast-container">
      <h3 class="forecast-title">Future Forecast</h3>
      <div class="forecast-grid">
        ${processedForecast.daily.map(day => `
          <div class="forecast-card">
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-date">${day.fullDate}</div>
            
            <img 
              src="${getWeatherIconUrl(day.iconCode, '2x')}" 
              alt="${day.condition}"
              class="forecast-icon"
            >
            
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
        `).join('')}
      </div>
    </div>
  `;
}