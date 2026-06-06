// Base URL for BigDataCloud reverse geocoding API
const GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// Get city info from GPS coordinates
export async function getCityFromCoords(lat, lon) {
  const url = `${GEOCODE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding error: ${response.status}`);
  
  const data = await response.json();
  
  // Build full location name with locality, city, state, country
  const locality = data.locality;
  const city = data.city;
  const state = data.principalSubdivision;
  const country = data.countryName;
  
  // Format: "Ojodu Berger, Lagos, Nigeria" or "Lagos, Nigeria"
  let fullName;
  if (locality && city && locality !== city) {
    fullName = `${locality}, ${city}, ${country}`;
  } else if (city) {
    fullName = `${city}, ${country}`;
  } else if (locality) {
    fullName = `${locality}, ${country}`;
  } else {
    fullName = country || 'Unknown Location';
  }
  
  // Extract timezone from localityInfo
  const timezone = data.localityInfo?.informative?.find(
    item => item.description === 'time zone'
  )?.name || 'UTC';
  
  return {
    locality: locality || city || 'Unknown Area',
    city: city || locality || 'Unknown City',
    state: state || '',
    country: country || 'Unknown Country',
    fullName: fullName,
    lat: data.latitude,
    lon: data.longitude,
    timezone: timezone
  };
}

// Get city info from IP address (fallback when GPS denied)
export async function getCityFromIP() {
  const url = `${GEOCODE_URL}?localityLanguage=en`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`IP geocoding error: ${response.status}`);
  
  const data = await response.json();
  
  // Build full location name with locality, city, state, country
  const locality = data.locality;
  const city = data.city;
  const state = data.principalSubdivision;
  const country = data.countryName;
  
  // Format: "Ojodu Berger, Lagos, Nigeria" or "Lagos, Nigeria"
  let fullName;
  if (locality && city && locality !== city) {
    fullName = `${locality}, ${city}, ${country}`;
  } else if (city) {
    fullName = `${city}, ${country}`;
  } else if (locality) {
    fullName = `${locality}, ${country}`;
  } else {
    fullName = country || 'Unknown Location';
  }
  
  // Extract timezone from localityInfo
  const timezone = data.localityInfo?.informative?.find(
    item => item.description === 'time zone'
  )?.name || 'UTC';
  
  return {
    locality: locality || city || 'Unknown Area',
    city: city || locality || 'Unknown City',
    state: state || '',
    country: country || 'Unknown Country',
    fullName: fullName,
    lat: data.latitude,
    lon: data.longitude,
    timezone: timezone
  };
}

// Save a location to localStorage
export function saveLocation(location) {
  const saved = getSavedLocations();
  if (!saved.find(loc => loc.lat === location.lat && loc.lon === location.lon)) {
    saved.push(location);
    localStorage.setItem('climatelens_locations', JSON.stringify(saved));
  }
}

// Get all saved locations from localStorage
export function getSavedLocations() {
  const stored = localStorage.getItem('climatelens_locations');
  return stored ? JSON.parse(stored) : [];
}

// Remove a saved location by index
export function removeLocation(index) {
  const saved = getSavedLocations();
  saved.splice(index, 1);
  localStorage.setItem('climatelens_locations', JSON.stringify(saved));
}