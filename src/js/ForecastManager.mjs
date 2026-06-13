import { fetchForecast } from './WeatherService.mjs';

// process forecast into daily cards
export async function getProcessedForecast(lat, lon) {
  const data = await fetchForecast(lat, lon, 5);
  
  if (!data.forecast?.forecastday) return null;
  
  return {
    daily: data.forecast.forecastday.map(day => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tempMax: Math.round(day.day.maxtemp_c),
      tempMin: Math.round(day.day.mintemp_c),
      condition: day.day.condition?.text || '',
      iconCode: day.day.condition?.icon || '',
      humidityAvg: day.day.avghumidity,
      windSpeedAvg: Math.round(day.day.maxwind_kph),
      rainChanceMax: day.day.daily_chance_of_rain || 0,
      uvValue: day.day.uv
    }))
  };
}

// get specific day details
export function getForecastForDay(forecastData, dayIndex) {
  if (!forecastData?.daily || !forecastData.daily[dayIndex]) return null;
  return forecastData.daily[dayIndex];
}