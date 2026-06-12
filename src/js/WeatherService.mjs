import { 
  API_KEY, 
  BASE_URL, 
  ICON_MAP, 
  CONDITION_MAP, 
  getUVIndexText, 
  windDegToDirection, 
  calculateDewPoint 
} from './config.mjs';

export function getWeatherIconUrl(iconCode, size = '2x') {
  if (!iconCode) return `https://openweathermap.org/img/wn/01d@${size}.png`;
  const mappedCode = ICON_MAP[iconCode.toLowerCase()] ?? '01d';
  return `https://openweathermap.org/img/wn/${mappedCode}@${size}.png`;
}

export async function fetchWeatherData(lat, lon) {
  const location = `${lat},${lon}`;
  const days = 5;
  const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=${days}&aqi=no&alerts=no`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Weather API error: ${response.status} - ${errorText}`);
  }
  return await response.json();
}

export function formatTime(timeString) {
  if (!timeString) return 'N/A';
  const [hour, minute] = timeString.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export async function getCompleteWeatherData(lat, lon) {
  const data = await fetchWeatherData(lat, lon);
  
  const current = data.current;
  const forecast = data.forecast.forecastday[0];
  const location = data.location;
  
  const condition = CONDITION_MAP[current.condition?.text] ?? current.condition?.text ?? 'Unknown';
  const iconCode = current.condition?.text ?? 'clear';
  
  return {
    temp: Math.round(current.temp_c ?? 0),
    feelsLike: Math.round(current.feelslike_c ?? 0),
    tempMin: Math.round(forecast.day?.mintemp_c ?? 0),
    tempMax: Math.round(forecast.day?.maxtemp_c ?? 0),
    humidity: current.humidity ?? 0,
    pressure: Math.round(current.pressure_mb ?? 0),
    dewPoint: calculateDewPoint(current.temp_c, current.humidity),
    windSpeed: Math.round(current.wind_kph ?? 0),
    windGust: current.gust_kph ? Math.round(current.gust_kph) : null,
    windDeg: current.wind_degree ?? 0,
    windDirection: windDegToDirection(current.wind_degree),
    visibility: Math.round(current.vis_km ?? 0),
    cloudCover: current.cloud ?? 0,
    rainChance: forecast.day?.daily_chance_of_rain ?? 0,
    condition: condition,
    description: current.condition?.text ?? 'Unknown',
    iconCode: iconCode,
    sunrise: forecast.astro?.sunrise ?? '',
    sunriseFormatted: formatTime(forecast.astro?.sunrise),
    sunset: forecast.astro?.sunset ?? '',
    sunsetFormatted: formatTime(forecast.astro?.sunset),
    cityName: location.name ?? 'Unknown',
    countryCode: location.country ?? '',
    locationName: `${location.name ?? 'Unknown'}, ${location.country ?? ''}`,
    uvIndex: current.uv ?? 0,
    uvIndexText: getUVIndexText(current.uv),
    lat: location.lat,
    lon: location.lon
  };
}

export async function getRawForecast(lat, lon) {
  return await fetchWeatherData(lat, lon);
}