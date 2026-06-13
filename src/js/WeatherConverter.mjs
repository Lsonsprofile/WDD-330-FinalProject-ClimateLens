const CONVERSIONS = {
  temperature: {
    c: { f: (v) => (v * 9/5) + 32, k: (v) => v + 273.15 },
    f: { c: (v) => (v - 32) * 5/9, k: (v) => (v - 32) * 5/9 + 273.15 },
    k: { c: (v) => v - 273.15, f: (v) => (v - 273.15) * 9/5 + 32 }
  },
  wind: {
    kph: { mph: (v) => v * 0.621371, ms: (v) => v / 3.6, knots: (v) => v * 0.539957 },
    mph: { kph: (v) => v / 0.621371, ms: (v) => v * 0.44704, knots: (v) => v * 0.868976 },
    ms: { kph: (v) => v * 3.6, mph: (v) => v / 0.44704, knots: (v) => v * 1.94384 },
    knots: { kph: (v) => v / 0.539957, mph: (v) => v / 0.868976, ms: (v) => v / 1.94384 }
  },
  pressure: {
    hpa: { mb: (v) => v, inhg: (v) => v * 0.02953, mmhg: (v) => v * 0.750062 },
    mb: { hpa: (v) => v, inhg: (v) => v * 0.02953, mmhg: (v) => v * 0.750062 },
    inhg: { hpa: (v) => v / 0.02953, mb: (v) => v / 0.02953, mmhg: (v) => v * 25.4 },
    mmhg: { hpa: (v) => v / 0.750062, mb: (v) => v / 0.750062, inhg: (v) => v / 25.4 }
  },
  precipitation: {
    mm: { cm: (v) => v / 10, inches: (v) => v * 0.0393701 },
    cm: { mm: (v) => v * 10, inches: (v) => v * 0.393701 },
    inches: { mm: (v) => v / 0.0393701, cm: (v) => v / 0.393701 }
  }
};

const UNITS = {
  temperature: [
    { id: 'c', label: 'Celsius', badge: '°C' },
    { id: 'f', label: 'Fahrenheit', badge: '°F' },
    { id: 'k', label: 'Kelvin', badge: 'K' }
  ],
  wind: [
    { id: 'kph', label: 'Kilometers per Hour', badge: 'km/h' },
    { id: 'mph', label: 'Miles per Hour', badge: 'mph' },
    { id: 'ms', label: 'Meters per Second', badge: 'm/s' },
    { id: 'knots', label: 'Knots', badge: 'knots' }
  ],
  pressure: [
    { id: 'hpa', label: 'Hectopascals', badge: 'hPa' },
    { id: 'mb', label: 'Millibars', badge: 'mb' },
    { id: 'inhg', label: 'Inches of Mercury', badge: 'inHg' },
    { id: 'mmhg', label: 'Millimeters of Mercury', badge: 'mmHg' }
  ],
  precipitation: [
    { id: 'mm', label: 'Millimeters', badge: 'mm' },
    { id: 'cm', label: 'Centimeters', badge: 'cm' },
    { id: 'inches', label: 'Inches', badge: 'inches' }
  ]
};

function formatNumber(num) {
  if (num === null || isNaN(num)) return '';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

function convert(value, from, to, category) {
  if (from === to) return value;
  const converters = CONVERSIONS[category];
  if (!converters || !converters[from] || !converters[from][to]) return null;
  return converters[from][to](value);
}

export function renderSimpleConverter(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="simple-converter">
      <h2 class="converter-headline">&#9729; Weather Unit Converter</h2>
      
      <select id="category-select" class="category-dropdown">
        <option value="temperature">Temperature</option>
        <option value="wind">Wind Speed</option>
        <option value="pressure">Pressure</option>
        <option value="precipitation">Precipitation</option>
      </select>
      
      <div id="converter-sections">
        ${Object.entries(UNITS).map(([category, units]) => `
          <div class="converter-section ${category === 'temperature' ? 'active' : ''}" data-category="${category}">
            ${units.map(u => `
              <div class="input-row">
                <label for="${category}-${u.id}">${u.label}</label>
                <div class="input-wrap">
                  <input type="number" id="${category}-${u.id}" data-category="${category}" data-unit="${u.id}" placeholder="0" step="any">
                  <span class="unit-badge">${u.badge}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  attachListeners();
}

function attachListeners() {
  const categorySelect = document.getElementById('category-select');
  const sections = document.querySelectorAll('.converter-section');

  // Switch category
  categorySelect.addEventListener('change', (e) => {
    sections.forEach(s => s.classList.remove('active'));
    document.querySelector(`.converter-section[data-category="${e.target.value}"]`).classList.add('active');
  });

  // Input conversions
  const inputs = document.querySelectorAll('.converter-section input');

  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const category = e.target.dataset.category;
      const unit = e.target.dataset.unit;

      if (isNaN(val)) {
        // Clear all in this section
        document.querySelectorAll(`.converter-section[data-category="${category}"] input`).forEach(i => {
          if (i !== e.target) i.value = '';
        });
        return;
      }

      const units = UNITS[category];
      units.forEach(u => {
        if (u.id !== unit) {
          const converted = convert(val, unit, u.id, category);
          const target = document.getElementById(`${category}-${u.id}`);
          if (target) target.value = formatNumber(converted);
        }
      });
    });
  });
}