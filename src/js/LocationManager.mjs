// API URLs
const OPENWEATHER_GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/reverse';
const CSV2GEO_URL = 'https://csv2geo.com/api/v1/reverse';
const OSM_URL = 'https://nominatim.openstreetmap.org/reverse';

// API Keys
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CSV2GEO_API_KEY = import.meta.env.VITE_CSV2GEO_API_KEY;

// IP geolocation fallback (no API key needed)
const IP_API_URL = 'https://ipapi.co/json/';

// get timezone from coordinates using longitude
function getTimezoneFromCoords(lat, lon) {
  const offset = Math.round(lon / 15);
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  return `Etc/GMT${sign}${absOffset}`;
}

// OpenStreetMap Nominatim
async function getCityFromCoordsOSM(lat, lon) {
  const url = `${OSM_URL}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ClimateLens-App/1.0' }
    });
    
    if (!response.ok) throw new Error(`OSM error: ${response.status}`);
    
    const data = await response.json();
    
    if (data && data.address) {
      const neighbourhood = data.address.neighbourhood || '';
      const suburb = data.address.suburb || '';
      const quarter = data.address.quarter || '';
      const city = data.address.city || data.address.town || data.address.village || '';
      const state = data.address.state || '';
      const country = data.address.country || '';
      
      const timezone = getTimezoneFromCoords(lat, lon);
      
      const specificArea = neighbourhood || suburb || quarter;
      let displayName;
      
      if (specificArea && city && specificArea !== city) {
        displayName = `${specificArea}, ${city}, ${country}`;
      } else if (city) {
        displayName = `${city}, ${country}`;
      } else if (specificArea) {
        displayName = `${specificArea}, ${country}`;
      } else {
        displayName = data.display_name.split(',')[0] || `${city}, ${country}`;
      }
      
      return {
        fullName: displayName,
        locality: specificArea || city,
        city: city,
        state: state,
        country: country,
        lat: lat,
        lon: lon,
        timezone: timezone,
        source: 'OpenStreetMap'
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// CSV2GEO - Commercial data fallback
async function getCityFromCoordsCSV2GEO(lat, lon) {
  if (!CSV2GEO_API_KEY) {
    return null;
  }
  
  const url = `${CSV2GEO_URL}?lat=${lat}&lon=${lon}&api_key=${CSV2GEO_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CSV2GEO error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components || {};
      
      const neighbourhood = components.neighbourhood || components.suburb || components.quarter || '';
      const city = components.city || components.town || components.village || '';
      const state = components.state || components.province || '';
      const country = components.country || '';
      
      const timezone = getTimezoneFromCoords(lat, lon);
      
      let displayName;
      if (neighbourhood && city && neighbourhood !== city) {
        displayName = `${neighbourhood}, ${city}, ${country}`;
      } else if (city) {
        displayName = `${city}, ${country}`;
      } else if (neighbourhood) {
        displayName = `${neighbourhood}, ${country}`;
      } else {
        displayName = result.formatted_address || `${city}, ${country}`;
      }
      
      return {
        fullName: displayName,
        locality: neighbourhood || city,
        city: city,
        state: state,
        country: country,
        lat: lat,
        lon: lon,
        timezone: timezone,
        source: 'CSV2GEO'
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// OpenWeather Geocoding
async function getCityFromCoordsOpenWeather(lat, lon) {
  const url = `${OPENWEATHER_GEOCODE_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OpenWeather error: ${response.status}`);
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const location = data[0];
      const name = location.name || '';
      const state = location.state || '';
      const country = location.country || '';
      
      const timezone = getTimezoneFromCoords(lat, lon);
      
      let displayName;
      if (name && state && name !== state) {
        displayName = `${name}, ${state}, ${country}`;
      } else if (name) {
        displayName = `${name}, ${country}`;
      } else {
        displayName = `${state}, ${country}`;
      }
      
      return {
        locality: name,
        city: name,
        state: state,
        country: country,
        fullName: displayName,
        lat: lat,
        lon: lon,
        timezone: timezone,
        source: 'OpenWeather'
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// IP Geolocation (last resort)
async function getLocationFromIP() {
  try {
    const response = await fetch(IP_API_URL);
    if (!response.ok) throw new Error(`IP API error: ${response.status}`);
    
    const data = await response.json();
    
    const lat = data.latitude;
    const lon = data.longitude;
    const city = data.city || '';
    const region = data.region || '';
    const country = data.country_name || '';
    
    // timezone from IP API or calculate from coordinates
    const timezone = data.timezone || getTimezoneFromCoords(lat, lon);
    
    let displayName;
    if (city && region && city !== region) {
      displayName = `${city}, ${region}, ${country}`;
    } else if (city) {
      displayName = `${city}, ${country}`;
    } else if (region) {
      displayName = `${region}, ${country}`;
    } else {
      displayName = country;
    }
    
    return {
      fullName: displayName,
      locality: city || region,
      city: city,
      state: region,
      country: country,
      lat: lat,
      lon: lon,
      timezone: timezone,
      source: 'IP Geolocation'
    };
  } catch (error) {
    return null;
  }
}

// Browser Geolocation (GPS)
function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error.message);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Main function - get location (GPS → OSM → CSV2GEO → OpenWeather → IP)
export async function getLocation() {
  let lat, lon;
  
  // try browser GPS for exact coordinates
  try {
    const gpsPosition = await getBrowserLocation();
    lat = gpsPosition.lat;
    lon = gpsPosition.lon;
    
    const osmLocation = await getCityFromCoordsOSM(lat, lon);
    if (osmLocation) {
      return osmLocation;
    }
    
    const csv2geoLocation = await getCityFromCoordsCSV2GEO(lat, lon);
    if (csv2geoLocation) {
      return csv2geoLocation;
    }
    
    const openweatherLocation = await getCityFromCoordsOpenWeather(lat, lon);
    if (openweatherLocation) {
      return openweatherLocation;
    }
  } catch (gpsError) {
    // GPS not available or denied
  }
  
  // no GPS, try IP geolocation
  const ipLocation = await getLocationFromIP();
  if (ipLocation) {
    lat = ipLocation.lat;
    lon = ipLocation.lon;
    
    const osmLocation = await getCityFromCoordsOSM(lat, lon);
    if (osmLocation) {
      return osmLocation;
    }
    
    const csv2geoLocation = await getCityFromCoordsCSV2GEO(lat, lon);
    if (csv2geoLocation) {
      return csv2geoLocation;
    }
    
    const openweatherLocation = await getCityFromCoordsOpenWeather(lat, lon);
    if (openweatherLocation) {
      return openweatherLocation;
    }
    
    return ipLocation;
  }
  
  // ultimate fallback
  return {
    fullName: 'Lagos, Nigeria',
    locality: 'Lagos',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    lat: 6.5244,
    lon: 3.3792,
    timezone: 'Africa/Lagos',
    source: 'Default Fallback'
  };
}

// Get location from coordinates (for saved locations)
export async function getLocationFromCoords(lat, lon) {
  const osmLocation = await getCityFromCoordsOSM(lat, lon);
  if (osmLocation) {
    return osmLocation;
  }
  
  const csv2geoLocation = await getCityFromCoordsCSV2GEO(lat, lon);
  if (csv2geoLocation) {
    return csv2geoLocation;
  }
  
  const openweatherLocation = await getCityFromCoordsOpenWeather(lat, lon);
  if (openweatherLocation) {
    return openweatherLocation;
  }
  
  const timezone = getTimezoneFromCoords(lat, lon);
  
  return {
    fullName: `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    locality: 'Unknown',
    city: 'Unknown',
    state: 'Unknown',
    country: 'Unknown',
    lat: lat,
    lon: lon,
    timezone: timezone,
    source: 'Coordinate Fallback'
  };
}

// Save/Get locations from localStorage
export function saveLocation(location) {
  const saved = getSavedLocations();
  const exists = saved.some(loc => 
    Math.abs(loc.lat - location.lat) < 0.001 && 
    Math.abs(loc.lon - location.lon) < 0.001
  );
  
  if (!exists) {
    const locationToSave = {
      ...location,
      savedAt: new Date().toISOString()
    };
    saved.push(locationToSave);
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
    const removed = saved.splice(index, 1);
    localStorage.setItem('climatelens_locations', JSON.stringify(saved));
    return true;
  }
  return false;
}

// Update location when user changes it
export async function updateUserLocation(lat, lon) {
  const locationData = await getLocationFromCoords(lat, lon);
  
  if (locationData) {
    const locationChangeEvent = new CustomEvent('locationChanged', {
      detail: locationData
    });
    window.dispatchEvent(locationChangeEvent);
    
    return locationData;
  }
  
  throw new Error('Failed to update location');
}

// Watch for location changes
export function onLocationChanged(callback) {
  window.addEventListener('locationChanged', (event) => {
    callback(event.detail);
  });
}