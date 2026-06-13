const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;

// fetch current weather from WeatherAPI
export async function fetchCurrentWeather(lat, lon) {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    throw new Error(`Invalid coordinates: lat=${lat}, lon=${lon}`);
  }
  
  const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${latNum},${lonNum}&aqi=yes`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('WeatherAPI error:', response.status, errorText);
    throw new Error(`WeatherAPI error: ${response.status}`);
  }
  
  return await response.json();
}

// fetch forecast from WeatherAPI
export async function fetchForecast(lat, lon, days = 5) {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    throw new Error(`Invalid coordinates: lat=${lat}, lon=${lon}`);
  }
  
  const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${latNum},${lonNum}&days=${days}&aqi=yes&alerts=yes`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Forecast API error:', response.status, errorText);
    throw new Error(`Forecast API error: ${response.status}`);
  }
  
  return await response.json();
}

// get weather icon URL from WeatherAPI
export function getWeatherIconUrl(iconCode, size = 64) {
  if (!iconCode) return '/icons/weather.svg';
  // WeatherAPI returns icons starting with //, add https:
  return iconCode.startsWith('http') ? iconCode : `https:${iconCode}`;
}

// get location name from weather data
export function getLocationNameFromWeather(weatherData) {
  const city = weatherData.location?.name || 'Unknown';
  const country = weatherData.location?.country || '';
  return country ? `${city}, ${country}` : city;
}

// format time from WeatherAPI format
export function formatTime(timeString) {
  if (!timeString) return '&#10060;';
  const date = new Date(`2000-01-01 ${timeString}`);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// convert wind direction from degrees to cardinal
export function windDegToDirection(degrees) {
  if (degrees === undefined || degrees === null) return '&#10060;';
  const directions = ['&#11014;', '&#11013;&#11014;', '&#11013;', '&#11014;&#11015;', '&#11015;', '&#11014;&#11015;', '&#11014;', '&#11013;&#11014;',
                      '&#11014;', '&#11013;&#11015;', '&#11013;', '&#11013;&#11014;', '&#11014;', '&#11013;&#11015;', '&#11013;', '&#11013;&#11014;'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// get all weather data in one object
export async function getCompleteWeatherData(lat, lon) {
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(lat, lon),
    fetchForecast(lat, lon, 5)
  ]);
  
  const currentData = current.current;
  const location = current.location;
  const forecastDay = forecast.forecast?.forecastday?.[0];
  
  return {
    // Temperature
    temp: Math.round(currentData.temp_c),
    feelsLike: Math.round(currentData.feelslike_c),
    tempMin: Math.round(forecastDay?.day?.mintemp_c || currentData.temp_c),
    tempMax: Math.round(forecastDay?.day?.maxtemp_c || currentData.temp_c),
    
    // Humidity & Pressure
    humidity: currentData.humidity,
    pressure: Math.round(currentData.pressure_mb),
    
    // Wind
    windSpeed: Math.round(currentData.wind_kph),
    windDeg: currentData.wind_degree,
    windDirection: currentData.wind_dir || windDegToDirection(currentData.wind_degree),
    
    // Visibility
    visibility: Math.round(currentData.vis_km),
    
    // Clouds & Rain
    cloudCover: currentData.cloud,
    rainChance: forecastDay?.day?.daily_chance_of_rain || 0,
    uvValue: currentData.uv,
    
    // Condition
    condition: currentData.condition?.text || 'Unknown',
    description: currentData.condition?.text || 'Unknown',
    iconCode: currentData.condition?.icon || '',
    
    // Sun times
    sunrise: forecastDay?.astro?.sunrise || '',
    sunriseFormatted: formatTime(forecastDay?.astro?.sunrise),
    sunset: forecastDay?.astro?.sunset || '',
    sunsetFormatted: formatTime(forecastDay?.astro?.sunset),
    
    // Location (ensure numbers)
    lat: parseFloat(location.lat),
    lon: parseFloat(location.lon),
    cityName: location.name,
    countryCode: location.country,
    locationName: getLocationNameFromWeather(current),
    timezone: location.tz_id || 'UTC',
    
    // Hourly forecast data
    hourly: forecast.forecast?.forecastday?.[0]?.hour?.map(h => ({
      time: h.time?.split(' ')[1] || '',
      temp: Math.round(h.temp_c),
      condition: h.condition?.text || '',
      iconCode: h.condition?.icon || '',
      humidity: h.humidity,
      windSpeed: Math.round(h.wind_kph),
      rainChance: h.chance_of_rain || 0,
      uvValue: h.uv
    })) || []
  };
}