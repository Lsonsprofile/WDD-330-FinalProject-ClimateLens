import { getRecentSearches } from './StorageManager.mjs';

export function renderRecentSearches(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const recent = getRecentSearches();

  container.innerHTML = `
    <div class="recent-card">
      <div class="recent-header">
        <span class="recent-icon">&#128269;</span>
        <h3 class="recent-title">Recent Searches</h3>
      </div>
      <div class="recent-body">
        ${recent.length > 0 ? `
          <div class="recent-list">
            ${recent.map((loc) => `
              <div class="recent-item" data-lat="${loc.lat}" data-lon="${loc.lon}" data-city="${loc.city}" data-country="${loc.country || ''}">
                <div class="recent-info">
                  <span class="recent-name">${loc.city}${loc.country ? `, ${loc.country}` : ''}</span>
                  <span class="recent-time">${formatTime(loc.searchedAt)}</span>
                </div>
                <span class="recent-arrow">→</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="recent-empty">No recent searches. Search for a city to see it here.</p>
        `}
      </div>
    </div>
  `;

  // Click to navigate
  container.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const lat = parseFloat(item.dataset.lat);
      const lon = parseFloat(item.dataset.lon);
      const city = item.dataset.city;
      const country = item.dataset.country;

      // Save as current and dispatch event
      window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: { lat, lon, city, country }
      }));
    });
  });
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}