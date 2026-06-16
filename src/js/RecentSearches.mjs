import { getRecentSearches, removeRecentSearch, clearRecentSearches } from './StorageManager.mjs';

// MOVE formatTime to the top, before renderRecentSearches
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

export function renderRecentSearches(containerId, onDelete) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const recent = getRecentSearches();

  container.innerHTML = `
    <div class="recent-card">
      <div class="recent-header">
        <div class="recent-header-left">
          <span class="recent-icon">&#128269;</span>
          <h3 class="recent-title">Recent Searches</h3>
          <span class="recent-count">${recent.length}/20</span>
        </div>
        ${recent.length > 0 ? `
          <button class="recent-clear-all" id="clear-all-recent" title="Clear all recent searches">
            Clear All
          </button>
        ` : ''}
      </div>
      <div class="recent-body">
        ${recent.length > 0 ? `
          <div class="recent-list">
            ${recent.map((loc, index) => `
              <div class="recent-item" data-index="${index}" data-lat="${loc.lat}" data-lon="${loc.lon}" data-city="${loc.city}" data-country="${loc.country || ''}">
                <div class="recent-info">
                  <span class="recent-name">${loc.city}${loc.country ? `, ${loc.country}` : ''}</span>
                  <span class="recent-time">${formatTime(loc.searchedAt)}</span>
                </div>
                <div class="recent-actions">
                  <span class="recent-arrow">→</span>
                  <button class="recent-delete" data-index="${index}" title="Remove from recent">×</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="recent-empty">No recent searches. Search for a city to see it here.</p>
        `}
      </div>
    </div>
  `;

  // Click to navigate (only on the item itself, not delete button)
  container.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.recent-delete')) return;
      
      const lat = parseFloat(item.dataset.lat);
      const lon = parseFloat(item.dataset.lon);
      const city = item.dataset.city;
      const country = item.dataset.country;

      window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: { lat, lon, city, country }
      }));
    });
  });

  // Delete individual item
  container.querySelectorAll('.recent-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      removeRecentSearch(index);
      renderRecentSearches(containerId, onDelete);
      if (onDelete) onDelete();
    });
  });

  // Clear all
  const clearAllBtn = container.querySelector('#clear-all-recent');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Clear all recent searches?')) {
        clearRecentSearches();
        renderRecentSearches(containerId, onDelete);
        if (onDelete) onDelete();
      }
    });
  }
}