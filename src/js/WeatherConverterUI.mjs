import { convert, getAllConversions, getLabel, getUnits } from './WeatherConverter.mjs';

// Render the weather converter
export function renderConverter(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = `
    <div class="converter-dashboard">
      <div class="converter-header">
        <h2 class="converter-title">&#127780; Weather Converter</h2>
        <p class="converter-subtitle">Convert between different weather measurement units</p>
      </div>
      <div class="converter-grid">
        ${renderCategory('temperature', 'Temperature', '&#127777;')}
        ${renderCategory('wind', 'Wind Speed', '&#128168;')}
        ${renderCategory('pressure', 'Pressure', '&#128202;')}
        ${renderCategory('precipitation', 'Precipitation', '&#127754;')}
      </div>
    </div>
  `;

  attachListeners();
}

// Render a converter category card
function renderCategory(category, title, icon) {
  const units = getUnits(category);
  const defaultFrom = units[0];
  const defaultTo = units[1] || units[0];

  return `
    <div class="converter-card" data-category="${category}">
      <div class="card-header">
        <span class="card-icon">${icon}</span>
        <h3 class="card-title">${title}</h3>
      </div>
      
      <div class="converter-row">
        <div class="input-group">
          <label class="input-label"> Value</label>
          <input type="number" id="${category}-value" class="converter-input" value="1" step="any">
        </div>
        
        <div class="input-group">
          <label class="input-label">&#128279; From</label>
          <select id="${category}-from" class="converter-select">
            ${units.map(u => `<option value="${u}" ${u === defaultFrom ? 'selected' : ''}>${getLabel(u)}</option>`).join('')}
          </select>
        </div>
        
        <button class="swap-btn" data-category="${category}" title="Swap units">&#8646;</button>
        
        <div class="input-group">
          <label class="input-label">&#127919; To</label>
          <select id="${category}-to" class="converter-select">
            ${units.map(u => `<option value="${u}" ${u === defaultTo ? 'selected' : ''}>${getLabel(u)}</option>`).join('')}
          </select>
        </div>
        
        <div class="input-group result-group">
          <label class="input-label">&#128204; Result</label>
          <input id="${category}-result" class="converter-result" readonly value="-">
        </div>
      </div>
      
      <div class="quick-convert">
        <div class="quick-header">
          <span class="quick-icon">&#9889;</span>
          <span class="quick-title">Quick Conversions</span>
        </div>
        <div id="${category}-quick" class="quick-chips">
          ${renderQuickView(category, 1, defaultFrom)}
        </div>
      </div>
    </div>
  `;
}

// Render all quick conversion values
function renderQuickView(category, value, from) {
  const all = getAllConversions(value, from, category);

  return Object.entries(all).map(([unit, data]) => `
    <div class="quick-chip" title="${data.label}">
      <span class="chip-value">${formatNumber(data.value)}</span>
      <span class="chip-unit">${data.symbol || unit}</span>
    </div>
  `).join('');
}

// Get icon for a category (using entities)
function getIcon(name) {
  const icons = {
    thermometer: '&#127777;',
    wind: '&#128168;',
    gauge: '&#128202;',
    droplet: '&#128167;'
  };

  return icons[name] || '&#9889;';
}

// Format numbers for display
function formatNumber(num) {
  if (num === null || isNaN(num)) return '-';

  return Number.isInteger(num)
    ? num.toString()
    : num.toFixed(2);
}

// Attach all converter event listeners
function attachListeners() {
  const categories = ['temperature', 'wind', 'pressure', 'precipitation'];
  
  categories.forEach(category => {
    const valueInput = document.getElementById(`${category}-value`);
    const fromSelect = document.getElementById(`${category}-from`);
    const toSelect = document.getElementById(`${category}-to`);
    const resultOutput = document.getElementById(`${category}-result`);
    const quickView = document.getElementById(`${category}-quick`);

    if (!valueInput || !fromSelect || !toSelect) {
      return;
    }

    // Update conversion results
    const update = () => {
      const value = parseFloat(valueInput.value);
      const from = fromSelect.value;
      const to = toSelect.value;

      if (isNaN(value)) {
        if (resultOutput) resultOutput.value = '-';
        return;
      }

      const converted = convert(value, from, to, category);

      if (resultOutput) {
        resultOutput.value = formatNumber(converted);
      }

      // Refresh quick conversion chips
      if (quickView) {
        quickView.innerHTML = renderQuickView(category, value, from);
      }
    };

    valueInput.addEventListener('input', update);
    fromSelect.addEventListener('change', update);
    toSelect.addEventListener('change', update);

    // Swap selected units
    const swapBtn = document.querySelector(`.swap-btn[data-category="${category}"]`);

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        update();
      });
    }

    // Run initial conversion
    update();
  });
}