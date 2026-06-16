import { convert, getAllConversions, getLabel, getUnits } from './WeatherConverter.mjs';

export function renderConverter(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = `
    <div class="converter-dashboard">
      <div class="converter-header">
        <h2 class="converter-title">Weather Converter</h2>
        <p class="converter-subtitle">Convert between different weather measurement units</p>
      </div>
      <div class="converter-grid">
        ${renderCategory('temperature', 'Temperature')}
        ${renderCategory('wind', 'Wind Speed')}
        ${renderCategory('pressure', 'Pressure')}
        ${renderCategory('precipitation', 'Precipitation')}
      </div>
    </div>
  `;

  attachListeners();
}

function renderCategory(category, title) {
  const units = getUnits(category);
  const defaultFrom = units[0];
  const defaultTo = units[1] || units[0];

  return `
    <div class="converter-card" data-category="${category}">
      <div class="card-header">
        <h3 class="card-title">${title}</h3>
      </div>
      
      <div class="converter-row">
        <div class="input-group">
          <label class="input-label">Value</label>
          <input type="number" id="${category}-value" class="converter-input" value="1" step="any">
        </div>
        
        <div class="input-group">
          <label class="input-label">From</label>
          <select id="${category}-from" class="converter-select">
            ${units.map(u => `<option value="${u}" ${u === defaultFrom ? 'selected' : ''}>${getLabel(u)}</option>`).join('')}
          </select>
        </div>
        
        <button class="swap-btn" data-category="${category}" title="Swap units">Swap</button>
        
        <div class="input-group">
          <label class="input-label">To</label>
          <select id="${category}-to" class="converter-select">
            ${units.map(u => `<option value="${u}" ${u === defaultTo ? 'selected' : ''}>${getLabel(u)}</option>`).join('')}
          </select>
        </div>
        
        <div class="input-group result-group">
          <label class="input-label">Result</label>
          <input id="${category}-result" class="converter-result" readonly value="-">
        </div>
      </div>
      
      <div class="quick-convert">
        <div class="quick-header">
          <span class="quick-title">Quick Conversions</span>
        </div>
        <div id="${category}-quick" class="quick-chips">
          ${renderQuickView(category, 1, defaultFrom)}
        </div>
      </div>
    </div>
  `;
}

function renderQuickView(category, value, from) {
  const all = getAllConversions(value, from, category);

  return Object.entries(all).map(([unit, data]) => `
    <div class="quick-chip" title="${data.label}">
      <span class="chip-value">${formatNumber(data.value)}</span>
      <span class="chip-unit">${data.symbol || unit}</span>
    </div>
  `).join('');
}

function formatNumber(num) {
  if (num === null || isNaN(num)) return '-';

  return Number.isInteger(num)
    ? num.toString()
    : num.toFixed(2);
}

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

      if (quickView) {
        quickView.innerHTML = renderQuickView(category, value, from);
      }
    };

    valueInput.addEventListener('input', update);
    fromSelect.addEventListener('change', update);
    toSelect.addEventListener('change', update);

    const swapBtn = document.querySelector(`.swap-btn[data-category="${category}"]`);

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        update();
      });
    }

    update();
  });
}