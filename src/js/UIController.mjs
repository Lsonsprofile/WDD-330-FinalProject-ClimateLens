import { renderLocationBarHTML, renderCurrentWeatherHTML, renderHourlyHTML, renderForecastHTML, renderDayDetailHTML } from './Renderers.mjs';
import { formatLocalTime, formatFullDate } from './utils.mjs';

export function renderLocationBar(locationData) {
  const time = formatLocalTime(locationData.timezone);
  const date = formatFullDate();
  const html = renderLocationBarHTML(locationData, time, date);
  
  const container = document.getElementById('location-bar');
  if (container) {
    container.innerHTML = html;
  } else {
    document.getElementById('weather-container')?.insertAdjacentHTML('beforebegin', html);
  }
}

export function renderCurrentWeather(weatherData) {
  const container = document.getElementById('weather-container');
  if (container) container.innerHTML = renderCurrentWeatherHTML(weatherData);
}

export function renderHourly(hourlyData) {
  const container = document.getElementById('hourly-container');
  if (container) container.innerHTML = renderHourlyHTML(hourlyData);
}

export function renderForecast(processedForecast) {
  const container = document.getElementById('forecast-container');
  if (container) container.innerHTML = renderForecastHTML(processedForecast);
}

export function renderDayModal(dayData, processedForecast) {
  const modal = document.getElementById('day-detail-modal');
  const content = document.getElementById('day-detail-content');
  if (!modal || !content) return;
  
  content.innerHTML = renderDayDetailHTML(dayData, processedForecast);
  modal.classList.remove('hidden');
}

export function hideDayModal() {
  document.getElementById('day-detail-modal')?.classList.add('hidden');
}