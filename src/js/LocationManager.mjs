const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_BASE_URL = import.meta.env.VITE_LOCATIONIQ_BASE_URL;

// Default location: Lagos, Nigeria
const DEFAULT_LOCATION = {
  lat: 6.5244,
  lon: 3.3792,
  city: 'Lagos',
  country: 'Nigeria',
  timezone: 'Africa/Lagos'
};

function getTimezoneFromCoords(lat, lon) {
  const offset = Math.round(lon / 15);
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  return `Etc/GMT${sign}${absOffset}`;
}

// LocationIQ reverse geocoding
async function reverseGeocode(lat, lon) {
  if (!LOCATIONIQ_API_KEY) return null;
  
  const url = `${LOCATIONIQ_BASE_URL}/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`LocationIQ error: ${response.status}`);
    
    const data = await response.json();
    
    const city = data.address?.city 
      || data.address?.town 
      || data.address?.county 
      || data.address?.village 
      || data.address?.suburb 
      || '';
    
    const country = data.address?.country || '';
    
    if (city && country) {
      return {
        lat,
        lon,
        city,
        country,
        timezone: getTimezoneFromCoords(lat, lon)
      };
    }
    return null;
  } catch (error) {
    console.error('LocationIQ reverse geocode failed:', error);
    return null;
  }
}

// LocationIQ autocomplete
export async function getSearchSuggestions(query) {
  if (!LOCATIONIQ_API_KEY || !query || query.length < 2) return [];
  
  const url = `${LOCATIONIQ_BASE_URL}/autocomplete.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=5&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`LocationIQ autocomplete error: ${response.status}`);
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data.map(item => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        city: item.display_name?.split(',')[0] || item.name || '',
        country: item.display_name?.split(',').pop()?.trim() || '',
        displayName: item.display_name || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('LocationIQ autocomplete failed:', error);
    return [];
  }
}

// LocationIQ forward geocoding
async function forwardGeocode(cityName) {
  if (!LOCATIONIQ_API_KEY) return null;
  
  const url = `${LOCATIONIQ_BASE_URL}/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(cityName)}&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`LocationIQ error: ${response.status}`);
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const city = result.display_name?.split(',')[0] || result.name || cityName;
      const country = result.display_name?.split(',').pop()?.trim() || '';
      
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        city,
        country,
        timezone: getTimezoneFromCoords(parseFloat(result.lat), parseFloat(result.lon))
      };
    }
    return null;
  } catch (error) {
    console.error('LocationIQ forward geocode failed:', error);
    return null;
  }
}

// Search city by name
export async function searchCityByName(cityName) {
  const result = await forwardGeocode(cityName);
  if (!result) {
    throw new Error('City not found. Please try again.');
  }
  return result;
}

// Get location: try GPS first, fallback to default
export async function getLocation() {
  try {
    // Try browser GPS first
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const location = await reverseGeocode(lat, lon);
    if (location) return location;

    return {
      lat,
      lon,
      city: 'Unknown',
      country: 'Unknown',
      timezone: getTimezoneFromCoords(lat, lon)
    };
  } catch (error) {
    console.error('Geolocation failed, using default location:', error);
    // GPS failed or denied — use default location
    return { ...DEFAULT_LOCATION };
  }
}

// Update location from coordinates
export async function updateLocationFromCoords(lat, lon, weatherCity) {
  const location = await reverseGeocode(lat, lon);
  
  if (location) {
    if (weatherCity && weatherCity !== 'Unknown' && location.city !== weatherCity) {
      location.city = weatherCity;
    }
    return location;
  }
  
  return {
    lat,
    lon,
    city: weatherCity || 'Unknown',
    country: 'Unknown',
    timezone: getTimezoneFromCoords(lat, lon)
  };
}

export function saveLocation(location) {
  const saved = getSavedLocations();
  const exists = saved.some(loc => 
    Math.abs(loc.lat - location.lat) < 0.001 && 
    Math.abs(loc.lon - location.lon) < 0.001
  );
  
  if (!exists) {
    saved.push({
      ...location,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('climatelens_locations', JSON.stringify(saved));
    return true;
  }
  return false;
}

export function getSavedLocations() {
  const stored = localStorage.getItem('climatelens_locations');
  return stored ? JSON.parse(stored) : [];
}

export function removeLocation(index) {
  const saved = getSavedLocations();
  if (saved[index]) {
    saved.splice(index, 1);
    localStorage.setItem('climatelens_locations', JSON.stringify(saved));
    return true;
  }
  return false;
}

export function onLocationChanged(callback) {
  window.addEventListener('locationChanged', (event) => {
    callback(event.detail);
  });
}