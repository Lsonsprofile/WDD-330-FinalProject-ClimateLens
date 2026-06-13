// ============================================
// UNIT CONVERTER - Used across all pages
// ============================================

import { getSettings } from './StorageManager.mjs';

const DEFAULTS = {
  tempUnit: 'c',
  windUnit: 'kph'
};

// Convert Celsius to display unit
export function formatTemp(celsius) {
  // Handle invalid input
  if (celsius === undefined || celsius === null || isNaN(Number(celsius))) {
    return '--';
  }
  
  const settings = getSettings() || {};
  const unit = settings.tempUnit || DEFAULTS.tempUnit;
  const num = Number(celsius);
  
  if (unit === 'f') {
    return `${Math.round((num * 9/5) + 32)}°F`;
  }
  return `${Math.round(num)}°C`;
}

// Convert km/h to display unit
export function formatWindSpeed(kph) {
  // Handle invalid input
  if (kph === undefined || kph === null || isNaN(Number(kph))) {
    return '--';
  }
  
  const settings = getSettings() || {};
  const unit = settings.windUnit || DEFAULTS.windUnit;
  const num = Number(kph);
  
  const conversions = {
    mph: (v) => v * 0.621371,
    ms: (v) => v / 3.6,
    knots: (v) => v * 0.539957
  };
  
  if (conversions[unit]) {
    const converted = conversions[unit](num);
    const labels = { mph: 'mph', ms: 'm/s', knots: 'knots' };
    return `${Math.round(converted)} ${labels[unit]}`;
  }
  
  return `${Math.round(num)} km/h`;
}

// Get just the numeric temp value
export function getTempValue(celsius) {
  if (celsius === undefined || celsius === null || isNaN(Number(celsius))) {
    return '--';
  }
  
  const settings = getSettings() || {};
  const unit = settings.tempUnit || DEFAULTS.tempUnit;
  const num = Number(celsius);
  
  if (unit === 'f') {
    return Math.round((num * 9/5) + 32);
  }
  return Math.round(num);
}

// Get unit symbol only
export function getTempUnit() {
  const settings = getSettings() || {};
  return settings.tempUnit === 'f' ? '°F' : '°C';
}

// Get wind unit symbol
export function getWindUnit() {
  const settings = getSettings() || {};
  const unit = settings.windUnit || DEFAULTS.windUnit;
  const labels = { kph: 'km/h', mph: 'mph', ms: 'm/s', knots: 'knots' };
  return labels[unit] || 'km/h';
}

// Check if currently using Fahrenheit
export function isFahrenheit() {
  const settings = getSettings() || {};
  return settings.tempUnit === 'f';
}