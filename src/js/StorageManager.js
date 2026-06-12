// Storage keys
const KEYS = {
  CURRENT: 'climatelens_current',
  SAVED: 'climatelens_locations',
  SETTINGS: 'climatelens_settings'
};

// Save current location state
export function saveCurrentState(location) {
  localStorage.setItem(KEYS.CURRENT, JSON.stringify({
    ...location,
    timestamp: new Date().toISOString()
  }));
}

// Get current location state
export function getCurrentState() {
  const stored = localStorage.getItem(KEYS.CURRENT);
  return stored ? JSON.parse(stored) : null;
}

// Check if state exists
export function hasCurrentState() {
  return !!localStorage.getItem(KEYS.CURRENT);
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
  return stored ? JSON.parse(stored) : {};
}

// Clear all app data
export function clearAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

// Export keys for direct access if needed
export { KEYS };