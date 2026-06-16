export function renderMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Get current location or default to world view
  const stored = localStorage.getItem('climatelens_current');
  let lat = 0, lon = 0, zoom = 2;
  
  if (stored) {
    try {
      const loc = JSON.parse(stored);
      lat = loc.lat || 0;
      lon = loc.lon || 0;
      zoom = 10;
    } catch {
      // use defaults
    }
  }

  container.innerHTML = `
    <div class="map-card">
      <div class="map-header">
        <span class="map-icon">&#128510;</span>
        <h3 class="map-title">Location Map</h3>
      </div>
      <div class="map-body">
        <iframe 
          id="weather-map"
          width="100%" 
          height="100%" 
          style="border:0; border-radius: 12px;"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.1}%2C${lat-0.1}%2C${lon+0.1}%2C${lat+0.1}&layer=mapnik&marker=${lat}%2C${lon}">
        </iframe>
        <a 
          href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}" 
          target="_blank" 
          class="map-link"
        >
          View Larger Map →
        </a>
      </div>
    </div>
  `;
}