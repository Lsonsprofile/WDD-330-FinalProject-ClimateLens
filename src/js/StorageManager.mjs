// Storage keys
const KEYS = {
  CURRENT: 'climatelens_current',
  SAVED: 'climatelens_locations',
  SETTINGS: 'climatelens_settings'
};

// Save current location state
export function saveCurrentState(location) {
  if (!location || !location.lat || !location.lon) return;
  
  localStorage.setItem(KEYS.CURRENT, JSON.stringify({
    ...location,
    lat: parseFloat(location.lat),
    lon: parseFloat(location.lon),
    timestamp: new Date().toISOString()
  }));
}

// Get current location state
export function getCurrentState() {
  const stored = localStorage.getItem(KEYS.CURRENT);
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    // Ensure lat/lon are numbers
    return {
      ...parsed,
      lat: parseFloat(parsed.lat),
      lon: parseFloat(parsed.lon)
    };
  } catch {
    return null;
  }
}

// Check if state exists
export function hasCurrentState() {
  return !!localStorage.getItem(KEYS.CURRENT);
}

// Clear current state
export function clearCurrentState() {
  localStorage.removeItem(KEYS.CURRENT);
}

// Save location to saved list
export function saveToLocationsList(location) {
  if (!location || !location.lat || !location.lon) return false;
  
  const saved = getSavedLocationsList();
  const exists = saved.some(loc => 
    Math.abs(parseFloat(loc.lat) - parseFloat(location.lat)) < 0.001 && 
    Math.abs(parseFloat(loc.lon) - parseFloat(location.lon)) < 0.001
  );
  
  if (!exists) {
    saved.push({
      ...location,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(KEYS.SAVED, JSON.stringify(saved));
    return true;
  }
  return false;
}

// Get saved locations list
export function getSavedLocationsList() {
  const stored = localStorage.getItem(KEYS.SAVED);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Remove location from saved list
export function removeFromLocationsList(index) {
  const saved = getSavedLocationsList();
  if (saved[index]) {
    saved.splice(index, 1);
    localStorage.setItem(KEYS.SAVED, JSON.stringify(saved));
    return true;
  }
  return false;
}

// Save user settings
export function saveSettings(settings) {
  const current = getSettings();
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  }));
}

// Get user settings
export function getSettings() {
  const stored = localStorage.getItem(KEYS.SETTINGS);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// Clear all app data
export function clearAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

// Export keys for direct access if needed
export { KEYS };