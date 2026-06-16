// Storage keys
const KEYS = {
  CURRENT: 'climatelens_current',
  SAVED: 'climatelens_locations',
  RECENT: 'climatelens_recent',
  SETTINGS: 'climatelens_settings'
};

// Generic storage handler
class Storage {
  constructor(key, options = {}) {
    this.key = key;
    this.isArray = options.isArray || false;
    this.validate = options.validate || (() => true);
    this.transform = options.transform || ((data) => data);
    this.maxItems = options.maxItems || null;
  }

  save(data) {
    if (!this.validate(data)) {
      return this.isArray ? false : undefined;
    }

    let payload;
    if (this.isArray) {
      const current = this.get();
      payload = [...current, this.transform(data)];
      if (this.maxItems && payload.length > this.maxItems) {
        payload = payload.slice(-this.maxItems);
      }
    } else {
      payload = this.transform(data);
    }

    localStorage.setItem(this.key, JSON.stringify(payload));
    return this.isArray ? true : payload;
  }

  get() {
    const stored = localStorage.getItem(this.key);
    if (!stored) {
      return this.isArray ? [] : null;
    }

    try {
      const parsed = JSON.parse(stored);
      return this.isArray && !Array.isArray(parsed) ? [] : parsed;
    } catch {
      return this.isArray ? [] : null;
    }
  }

  exists() {
    return !!localStorage.getItem(this.key);
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  update(updater) {
    const current = this.get();
    const updated = this.isArray
      ? updater(current)
      : { ...current, ...updater };

    localStorage.setItem(this.key, JSON.stringify(updated));
    return updated;
  }
}

// Current location storage
const currentStore = new Storage(KEYS.CURRENT, {
  validate: (loc) => loc && loc.lat && loc.lon,
  transform: (loc) => ({
    ...loc,
    lat: parseFloat(loc.lat),
    lon: parseFloat(loc.lon),
    timestamp: new Date().toISOString()
  })
});

// Saved locations storage
const savedStore = new Storage(KEYS.SAVED, {
  isArray: true,
  validate: (loc) => loc && loc.lat && loc.lon,
  transform: (loc) => ({
    ...loc,
    lat: parseFloat(loc.lat),
    lon: parseFloat(loc.lon),
    savedAt: new Date().toISOString()
  })
});

// Recent searches storage
const recentStore = new Storage(KEYS.RECENT, {
  isArray: true,
  maxItems: 10,
  validate: (loc) => loc && loc.lat && loc.lon && loc.city,
  transform: (loc) => ({
    ...loc,
    lat: parseFloat(loc.lat),
    lon: parseFloat(loc.lon),
    searchedAt: new Date().toISOString()
  })
});

// User settings storage
const settingsStore = new Storage(KEYS.SETTINGS, {
  transform: (settings) => ({
    ...settings,
    updatedAt: new Date().toISOString()
  })
});

// Current location API
export const saveCurrentState = (loc) => currentStore.save(loc);
export const getCurrentState = () => currentStore.get();
export const hasCurrentState = () => currentStore.exists();
export const clearCurrentState = () => currentStore.clear();

// Saved locations API
export const saveToLocationsList = (loc) => {
  const saved = savedStore.get();
  const exists = saved.some(
    (s) =>
      Math.abs(s.lat - parseFloat(loc.lat)) < 0.001 &&
      Math.abs(s.lon - parseFloat(loc.lon)) < 0.001
  );
  return exists ? false : savedStore.save(loc);
};

export const getSavedLocationsList = () => savedStore.get();
export const removeFromLocationsList = (index) => {
  const saved = savedStore.get();
  if (!saved[index]) {
    return false;
  }
  saved.splice(index, 1);
  localStorage.setItem(KEYS.SAVED, JSON.stringify(saved));
  return true;
};

// Recent searches API
export const saveRecentSearch = (loc) => {
  const recent = recentStore.get();
  const filtered = recent.filter(
    (r) => r.city?.toLowerCase() !== loc.city?.toLowerCase()
  );
  localStorage.setItem(KEYS.RECENT, JSON.stringify(filtered));
  return recentStore.save(loc);
};

export const getRecentSearches = () => {
  const recent = recentStore.get();
  return recent.reverse();
};

export const clearRecentSearches = () => recentStore.clear();

// Settings API
export const saveSettings = (settings) => {
  const current = settingsStore.get() || {};
  // Replace completely with new settings
  const newSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(newSettings));
  return newSettings;
};

// ADD THIS after clearRecentSearches
export const removeRecentSearch = (index) => {
  const recent = recentStore.get();
  if (!recent[index]) {
    return false;
  }
  recent.splice(index, 1);
  localStorage.setItem(KEYS.RECENT, JSON.stringify(recent));
  return true;
};

// Get fresh settings every time (not cached)
export const getSettings = () => {
  const stored = localStorage.getItem(KEYS.SETTINGS);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

// Utility functions
export const clearAllData = () => {
  Object.keys(localStorage)
    .filter(k => k.startsWith('climatelens'))
    .forEach(k => localStorage.removeItem(k));
};

export { KEYS };