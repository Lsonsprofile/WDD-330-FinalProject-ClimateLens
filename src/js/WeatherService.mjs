// API config
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;
const UNITS = import.meta.env.VITE_WEATHER_UNITS;

// fetch current weather
export async function fetchCurrentWeather(lat, lon) {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return await response.json();
}

// get weather icon url
export function getWeatherIconUrl(iconCode, size = '2x') {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}

// fetch 5-day forecast
export async function fetchForecast(lat, lon) {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`);
  }

  return await response.json();
}

// get city and country name from weather data
export function getLocationNameFromWeather(weatherData) {
  const city = weatherData.name || 'Unknown Location';
  const country = weatherData.sys?.country || '';
  return country ? `${city}, ${country}` : city;
}

// format sunrise and sunset time
export function formatSunTime(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// convert m/s to km/h
export function windSpeedToKmH(windSpeedMs) {
  return Math.round(windSpeedMs * 3.6);
}

// convert meters to km
export function visibilityToKm(visibilityMeters) {
  if (!visibilityMeters) return 'N/A';
  return Math.round(visibilityMeters / 1000);
}

// convert wind degrees to direction
export function windDegToDirection(degrees) {
  if (degrees === undefined || degrees === null) return 'N/A';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// get all weather data in one object
export async function getCompleteWeatherData(lat, lon) {
  const currentWeather = await fetchCurrentWeather(lat, lon);
  const forecastData = await fetchForecast(lat, lon);
  
  const cloudCover = currentWeather.clouds?.all || 0;
  
  let dewPoint = null;
  if (currentWeather.main.dew_point) {
    dewPoint = Math.round(currentWeather.main.dew_point);
  } else {
    const temp = currentWeather.main.temp;
    const humidity = currentWeather.main.humidity;
    dewPoint = Math.round(temp - ((100 - humidity) / 5));
  }
  
  // rain chance from forecast
  let rainChance = 0;
  if (forecastData && forecastData.list && forecastData.list[0]) {
    const nextForecast = forecastData.list[0];
    rainChance = nextForecast.pop ? Math.round(nextForecast.pop * 100) : 0;
  }
  
  return {
    temp: Math.round(currentWeather.main.temp),
    feelsLike: Math.round(currentWeather.main.feels_like),
    tempMin: Math.round(currentWeather.main.temp_min),
    tempMax: Math.round(currentWeather.main.temp_max),
    humidity: currentWeather.main.humidity,
    pressure: currentWeather.main.pressure,
    dewPoint: dewPoint,
    windSpeed: windSpeedToKmH(currentWeather.wind.speed),
    windGust: currentWeather.wind.gust ? windSpeedToKmH(currentWeather.wind.gust) : null,
    windDeg: currentWeather.wind.deg,
    windDirection: windDegToDirection(currentWeather.wind.deg),
    visibility: visibilityToKm(currentWeather.visibility),
    cloudCover: cloudCover,
    rainChance: rainChance,
    condition: currentWeather.weather[0].main,
    description: currentWeather.weather[0].description,
    iconCode: currentWeather.weather[0].icon,
    sunrise: currentWeather.sys.sunrise,
    sunriseFormatted: formatSunTime(currentWeather.sys.sunrise),
    sunset: currentWeather.sys.sunset,
    sunsetFormatted: formatSunTime(currentWeather.sys.sunset),
    cityName: currentWeather.name,
    countryCode: currentWeather.sys?.country || '',
    locationName: getLocationNameFromWeather(currentWeather)
  };
}