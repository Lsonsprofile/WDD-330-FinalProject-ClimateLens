import { getRawForecast, getWeatherIconUrl } from './WeatherService.mjs';
import { CONDITION_MAP, getUVIndexText, windDegToDirection } from './config.mjs';

// process forecast data
export function processForecastData(weatherData) {
  if (!weatherData || !weatherData.forecast) return null;

  const forecastDays = weatherData.forecast.forecastday;
  const today = new Date().toISOString().split('T')[0];
  
  const daily = forecastDays
    .filter(day => day.date !== today)
    .slice(0, 5)
    .map(day => {
      const date = new Date(day.date);
      const condition = CONDITION_MAP[day.day.condition.text] ?? day.day.condition.text;
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tempMin: Math.round(day.day.mintemp_c),
        tempMax: Math.round(day.day.maxtemp_c),
        tempAvg: Math.round(day.day.avgtemp_c),
        condition: condition,
        iconCode: day.day.condition.text,
        humidityAvg: day.day.avghumidity,
        windSpeedAvg: Math.round(day.day.maxwind_kph),
        rainChanceMax: day.day.daily_chance_of_rain,
        uvIndex: day.day.uv
      };
    });

  const hourly = [];
  forecastDays.forEach(day => {
    day.hour.forEach(hour => {
      const hourDate = new Date(hour.time);
      hourly.push({
        time: hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        hour: hourDate.getHours(),
        temp: Math.round(hour.temp_c),
        feelsLike: Math.round(hour.feelslike_c),
        condition: CONDITION_MAP[hour.condition.text] ?? hour.condition.text,
        iconCode: hour.condition.text,
        humidity: hour.humidity,
        windSpeed: Math.round(hour.wind_kph),
        rainChance: hour.chance_of_rain,
        dt: hourDate.getTime() / 1000
      });
    });
  });

  return {
    daily,
    hourly,
    city: weatherData.location.name,
    country: weatherData.location.country,
    lastUpdated: weatherData.current.last_updated
  };
}

// get forecast for specific day
export function getForecastForDay(processedForecast, dayIndex) {
  if (!processedForecast?.daily) return null;
  return processedForecast.daily[dayIndex] || null;
}

// get hourly forecast
export function getHourlyForecast(processedForecast, hours = 24) {
  if (!processedForecast?.hourly) return [];
  
  const now = new Date();
  const currentHour = now.getHours();
  
  let startIndex = processedForecast.hourly.findIndex(h => h.hour > currentHour);
  if (startIndex === -1) startIndex = 0;
  
  return processedForecast.hourly.slice(startIndex, startIndex + Math.ceil(hours));
}

// get rain forecast
export function getRainForecast(processedForecast) {
  if (!processedForecast?.hourly) {
    return { willRain: false, chance: 0, times: [] };
  }
  
  const next24Hours = getHourlyForecast(processedForecast, 24);
  const rainTimes = next24Hours.filter(h => h.rainChance > 30);
  const maxRainChance = Math.max(...next24Hours.map(h => h.rainChance), 0);
  
  return {
    willRain: rainTimes.length > 0,
    chance: maxRainChance,
    times: rainTimes.slice(0, 3).map(r => ({ time: r.time, chance: r.rainChance })),
    summary: rainTimes.length > 0 
      ? `Rain expected (${maxRainChance}% chance)`
      : 'No rain expected'
  };
}

// get temperature trend
export function getTemperatureTrend(processedForecast) {
  if (!processedForecast?.daily || processedForecast.daily.length < 2) {
    return { trend: 'stable', direction: 0, message: 'Temperature stable' };
  }
  
  const temps = processedForecast.daily.map(d => d.tempAvg);
  const diff = temps[temps.length - 1] - temps[0];
  
  let trend = 'stable';
  let message = 'Temperature stable';
  
  if (diff > 3) { trend = 'warming'; message = `Warming by ${Math.round(diff)}°C`; }
  else if (diff < -3) { trend = 'cooling'; message = `Cooling by ${Math.round(Math.abs(diff))}°C`; }
  else if (diff > 0) { trend = 'slightly-warming'; message = `Warming slightly`; }
  else if (diff < 0) { trend = 'slightly-cooling'; message = `Cooling slightly`; }
  
  return { trend, difference: Math.round(diff), message, high: Math.max(...temps), low: Math.min(...temps) };
}

// get best outdoor days
export function getBestOutdoorDays(processedForecast) {
  if (!processedForecast?.daily) return [];
  
  return processedForecast.daily
    .map(day => ({ ...day, score: calculateOutdoorScore(day) }))
    .filter(day => day.score >= 70)
    .sort((a, b) => b.score - a.score);
}

function calculateOutdoorScore(day) {
  let score = 100;
  if (day.rainChanceMax > 70) score -= 40;
  else if (day.rainChanceMax > 40) score -= 20;
  else if (day.rainChanceMax > 20) score -= 10;
  
  if (day.windSpeedAvg > 40) score -= 30;
  else if (day.windSpeedAvg > 25) score -= 15;
  
  if (day.tempAvg > 35 || day.tempAvg < 5) score -= 30;
  else if (day.tempAvg > 30 || day.tempAvg < 10) score -= 15;
  
  const bad = ['Thunderstorm', 'Snow'];
  if (bad.includes(day.condition)) score -= 50;
  else if (day.condition === 'Rain') score -= 30;
  
  return Math.max(0, Math.min(100, score));
}

// get forecast summary
export function getForecastSummary(processedForecast) {
  if (!processedForecast?.daily?.length) {
    return { summary: 'No forecast', icon: '❓' };
  }
  
  const tomorrow = processedForecast.daily[0];
  const rain = getRainForecast(processedForecast);
  const trend = getTemperatureTrend(processedForecast);
  
  let summary = '';
  let icon = '☀️';
  
  if (rain.willRain) { summary = `Rain ${rain.chance}%`; icon = '🌧️'; }
  else if (tomorrow.condition === 'Clear') { summary = `Sunny, ${tomorrow.tempMax}°C`; }
  else if (tomorrow.condition === 'Clouds') { summary = `Cloudy, ${tomorrow.tempMax}°C`; icon = '☁️'; }
  else { summary = `${tomorrow.condition}, ${tomorrow.tempMax}°C`; icon = '🌤️'; }
  
  if (trend.trend.includes('warming')) summary += `. ${trend.message}`;
  else if (trend.trend.includes('cooling')) summary += `. ${trend.message}`;
  
  return { summary, icon, rainForecast: rain, tempTrend: trend };
}

// fetch and process
export async function getProcessedForecast(lat, lon) {
  try {
    const raw = await getRawForecast(lat, lon);
    return processForecastData(raw);
  } catch {
    return null;
  }
}