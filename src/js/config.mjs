// API configuration
export const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
export const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;
export const UNITS = import.meta.env.VITE_WEATHER_UNITS;

// Icon mapping: WeatherAPI → OpenWeather-compatible codes
export const ICON_MAP = Object.freeze({
  'sunny': '01d',
  'clear': '01d',
  'partly cloudy': '02d',
  'cloudy': '03d',
  'overcast': '04d',
  'mist': '50d',
  'patchy rain possible': '09d',
  'patchy snow possible': '13d',
  'patchy sleet possible': '13d',
  'patchy freezing drizzle possible': '13d',
  'thundery outbreaks possible': '11d',
  'blowing snow': '13d',
  'blizzard': '13d',
  'fog': '50d',
  'freezing fog': '50d',
  'patchy light drizzle': '09d',
  'light drizzle': '09d',
  'freezing drizzle': '13d',
  'heavy freezing drizzle': '13d',
  'patchy light rain': '09d',
  'light rain': '10d',
  'moderate rain at times': '10d',
  'moderate rain': '10d',
  'heavy rain at times': '10d',
  'heavy rain': '10d',
  'light freezing rain': '13d',
  'moderate or heavy freezing rain': '13d',
  'light sleet': '13d',
  'moderate or heavy sleet': '13d',
  'patchy light snow': '13d',
  'light snow': '13d',
  'patchy moderate snow': '13d',
  'moderate snow': '13d',
  'patchy heavy snow': '13d',
  'heavy snow': '13d',
  'ice pellets': '13d',
  'light rain shower': '09d',
  'moderate or heavy rain shower': '09d',
  'torrential rain shower': '09d',
  'light sleet showers': '13d',
  'moderate or heavy sleet showers': '13d',
  'light snow showers': '13d',
  'moderate or heavy snow showers': '13d',
  'light showers of ice pellets': '13d',
  'moderate or heavy showers of ice pellets': '13d',
  'patchy light rain with thunder': '11d',
  'moderate or heavy rain with thunder': '11d',
  'patchy light snow with thunder': '11d',
  'moderate or heavy snow with thunder': '11d'
});

// Condition mapping: WeatherAPI → standard names
export const CONDITION_MAP = Object.freeze({
  'Sunny': 'Clear',
  'Clear': 'Clear',
  'Partly cloudy': 'Clouds',
  'Cloudy': 'Clouds',
  'Overcast': 'Clouds',
  'Mist': 'Mist',
  'Patchy rain possible': 'Rain',
  'Patchy snow possible': 'Snow',
  'Patchy sleet possible': 'Snow',
  'Patchy freezing drizzle possible': 'Snow',
  'Thundery outbreaks possible': 'Thunderstorm',
  'Blowing snow': 'Snow',
  'Blizzard': 'Snow',
  'Fog': 'Mist',
  'Freezing fog': 'Mist',
  'Patchy light drizzle': 'Rain',
  'Light drizzle': 'Rain',
  'Freezing drizzle': 'Snow',
  'Heavy freezing drizzle': 'Snow',
  'Patchy light rain': 'Rain',
  'Light rain': 'Rain',
  'Moderate rain at times': 'Rain',
  'Moderate rain': 'Rain',
  'Heavy rain at times': 'Rain',
  'Heavy rain': 'Rain',
  'Light freezing rain': 'Snow',
  'Moderate or heavy freezing rain': 'Snow',
  'Light sleet': 'Snow',
  'Moderate or heavy sleet': 'Snow',
  'Patchy light snow': 'Snow',
  'Light snow': 'Snow',
  'Patchy moderate snow': 'Snow',
  'Moderate snow': 'Snow',
  'Patchy heavy snow': 'Snow',
  'Heavy snow': 'Snow',
  'Ice pellets': 'Snow',
  'Light rain shower': 'Rain',
  'Moderate or heavy rain shower': 'Rain',
  'Torrential rain shower': 'Rain',
  'Light sleet showers': 'Snow',
  'Moderate or heavy sleet showers': 'Snow',
  'Light snow showers': 'Snow',
  'Moderate or heavy snow showers': 'Snow',
  'Light showers of ice pellets': 'Snow',
  'Moderate or heavy showers of ice pellets': 'Snow',
  'Patchy light rain with thunder': 'Thunderstorm',
  'Moderate or heavy rain with thunder': 'Thunderstorm',
  'Patchy light snow with thunder': 'Thunderstorm',
  'Moderate or heavy snow with thunder': 'Thunderstorm'
});

// UV index text
export function getUVIndexText(uvIndex) {
  if (uvIndex === null || uvIndex === undefined) return 'N/A';
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

// Wind direction
export function windDegToDirection(degrees) {
  if (degrees === undefined || degrees === null) return 'N/A';
  const directions = Object.freeze(['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']);
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Dew point calculation (Magnus formula)
const DEW_POINT = Object.freeze({ a: 17.625, b: 243.04 });

export function calculateDewPoint(temp, humidity) {
  if (!temp || !humidity) return null;
  const alpha = Math.log(humidity / 100) + (DEW_POINT.a * temp) / (DEW_POINT.b + temp);
  return Math.round((DEW_POINT.b * alpha) / (DEW_POINT.a - alpha));
}