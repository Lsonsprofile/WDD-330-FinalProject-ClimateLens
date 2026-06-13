import '../css/large.css';
import '../css/small.css';
import '../css/settings.css';
import { loadHeaderFooter, updateHeaderText } from './utils.mjs';
import { 
  getCurrentState, 
  hasCurrentState,
  getSettings,
  saveSettings,
  clearAllData,
  KEYS                    // ADD THIS IMPORT
} from './StorageManager.mjs';

const DEFAULT_SETTINGS = {
  tempUnit: 'c',
  windUnit: 'kph'
};

function renderSettings() {
  const container = document.getElementById('settings-container');
  if (!container) return;

  const settings = getSettings();
  const currentLoc = getCurrentState();

  container.innerHTML = `
    <div class="settings-panel">
      <h1 class="settings-title">Settings</h1>
      
      <div class="settings-group">
        <label class="setting-field">
          <span class="field-label">Temperature Unit</span>
          <span class="field-sublabel">SELECT</span>
          <select class="field-select" id="temp-unit">
            <option value="c" ${settings.tempUnit === 'c' ? 'selected' : ''}>Celsius (°C)</option>
            <option value="f" ${settings.tempUnit === 'f' ? 'selected' : ''}>Fahrenheit (°F)</option>
          </select>
        </label>
        
        <label class="setting-field">
          <span class="field-label">Wind Speed Unit</span>
          <span class="field-sublabel">SELECT</span>
          <select class="field-select" id="wind-unit">
            <option value="kph" ${settings.windUnit === 'kph' ? 'selected' : ''}>Kilometers Per Hour</option>
            <option value="mph" ${settings.windUnit === 'mph' ? 'selected' : ''}>Miles Per Hour</option>
            <option value="ms" ${settings.windUnit === 'ms' ? 'selected' : ''}>Meters Per Second</option>
            <option value="knots" ${settings.windUnit === 'knots' ? 'selected' : ''}>Knots</option>
          </select>
        </label>
        
        <label class="setting-field">
          <span class="field-label">Latitude</span>
          <span class="field-sublabel">READ ONLY</span>
          <input type="text" class="field-input" id="latitude" value="${currentLoc?.lat ?? ''}" readonly>
        </label>
        
        <label class="setting-field">
          <span class="field-label">Longitude</span>
          <span class="field-sublabel">READ ONLY</span>
          <input type="text" class="field-input" id="longitude" value="${currentLoc?.lon ?? ''}" readonly>
        </label>
      </div>
      
      <div class="settings-actions">
        <button class="reset-btn" id="reset-defaults">
          <span class="reset-icon">&#8634;</span>
          Reset to Default
        </button>
        <button class="save-btn" id="save-settings">
          <span class="save-icon">&#128190;</span>
          Save
        </button>
      </div>
      
      <div class="settings-divider"></div>
      
      <div class="settings-group">
        <h2 class="group-title">Data</h2>
        <button class="clear-btn" id="clear-data">Clear All Data</button>
      </div>
      
      <div class="settings-divider"></div>
      
      <div class="settings-group">
        <h2 class="group-title">About</h2>
        <p class="about-text">ClimateLens is your personal weather companion, providing accurate forecasts and smart clothing recommendations tailored to your location.</p>
        <div class="about-meta">
          <span class="about-version">v1.0.0</span>
          <a href="https://github.com/Lsonsprofile/WDD-330-FinalProject-ClimateLens" class="about-link">GitHub</a>
          <a href="https://wa.me/2349133472692" class="about-link" target="_blank">Contact</a>
        </div>
      </div>
    </div>
  `;

  attachListeners();
}

function attachListeners() {
  // Save button
  document.getElementById('save-settings')?.addEventListener('click', () => {
    const tempUnit = document.getElementById('temp-unit').value;
    const windUnit = document.getElementById('wind-unit').value;
    
    // Overwrite settings completely
    saveSettings({ tempUnit, windUnit });
    
    // Notify other tabs
    notifyOtherTabs();
    
    showButtonFeedback('save-settings', '&#10003;', 'Saved');
  });

  // Reset to defaults
  document.getElementById('reset-defaults')?.addEventListener('click', () => {
    // Clear settings from localStorage first
    localStorage.removeItem(KEYS.SETTINGS);
    
    // Then save defaults
    saveSettings({ ...DEFAULT_SETTINGS });
    
    // Update dropdowns to show defaults
    document.getElementById('temp-unit').value = DEFAULT_SETTINGS.tempUnit;
    document.getElementById('wind-unit').value = DEFAULT_SETTINGS.windUnit;
    
    // Notify other tabs
    notifyOtherTabs();
    
    showButtonFeedback('reset-defaults', '&#10003;', 'Reset');
  });

  // Clear all data
  document.getElementById('clear-data')?.addEventListener('click', () => {
    if (confirm('Are you sure? This will delete all saved locations, recent searches, and settings.')) {
      clearAllData();
      location.reload();
    }
  });
}

function showButtonFeedback(buttonId, icon, text) {
  const btn = document.getElementById(buttonId);
  const originalHTML = btn.innerHTML;
  
  btn.innerHTML = `<span class="save-icon">${icon}</span> ${text}`;
  btn.classList.add('saved');
  
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.classList.remove('saved');
  }, 2000);
}

function notifyOtherTabs() {
  const settings = getSettings();
  // Use standard storage event for cross-tab communication
  localStorage.setItem('climatelens_settings_notify', Date.now().toString());
  localStorage.removeItem('climatelens_settings_notify');
}

async function init() {
  try {
    await loadHeaderFooter();
    
    if (hasCurrentState()) {
      const loc = getCurrentState();
      updateHeaderText(loc.city, loc.country);
    }
    
    renderSettings();
  } catch (error) {
    console.error('Settings init error:', error);
  }
}

init();