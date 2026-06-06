const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;
const UNITS = import.meta.env.VITE_WEATHER_UNITS;

// DEBUG: Check if env variables loaded
console.log('API_KEY loaded:', API_KEY ? 'YES (hidden)' : 'NO');
console.log('BASE_URL:', BASE_URL);
console.log('UNITS:', UNITS);

export async function fetchCurrentWeather(lat, lon) {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;
  
  // DEBUG: Log the actual URL (hide key for security)
  console.log('Fetching URL:', url.replace(API_KEY, 'HIDDEN_KEY'));
  
  const response = await fetch(url);
  
  // DEBUG: Log response status and content type
  console.log('Response status:', response.status);
  console.log('Content-Type:', response.headers.get('content-type'));
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  return await response.json();
}

export function getWeatherIconUrl(iconCode, size = '2x') {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}

export async function fetchForecast(lat, lon) {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
  return await response.json();
}