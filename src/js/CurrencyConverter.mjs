const RATES = {
  usd: { rate: 1, symbol: '$', name: 'US Dollar' },
  eur: { rate: 0.92, symbol: '€', name: 'Euro' },
  gbp: { rate: 0.79, symbol: '£', name: 'British Pound' },
  ngn: { rate: 1500, symbol: '₦', name: 'Nigerian Naira' },
  jpy: { rate: 150, symbol: '¥', name: 'Japanese Yen' },
  cad: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
  aud: { rate: 1.52, symbol: 'A$', name: 'Australian Dollar' },
  cny: { rate: 7.24, symbol: '¥', name: 'Chinese Yuan' }
};

const CURRENCY_UNITS = Object.keys(RATES);

function convertCurrency(value, from, to) {
  if (from === to) return value;
  const fromRate = RATES[from].rate;
  const toRate = RATES[to].rate;
  return (value / fromRate) * toRate;
}

function formatCurrency(num) {
  if (num === null || isNaN(num)) return '';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function renderCurrencyConverter(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const defaultFrom = 'usd';
  const defaultTo = 'eur';

  container.innerHTML = `
    <section class="converter-card currency-converter" aria-labelledby="currency-title">
      <header class="card-header">
        <figure class="card-icon" aria-hidden="true">&#8652;</figure>
        <h3 id="currency-title" class="card-title">Currency Converter</h3>
      </header>
      
      <fieldset class="converter-fieldset">
        <legend class="visually-hidden">Currency Conversion</legend>
        
        <div class="converter-row">
          <div class="input-group">
            <label class="input-label" for="currency-value">Amount</label>
            <input type="number" id="currency-value" class="converter-input" value="1" step="any" min="0">
          </div>
          
          <div class="input-group">
            <label class="input-label" for="currency-from">From</label>
            <select id="currency-from" class="converter-select">
              ${CURRENCY_UNITS.map(u => `<option value="${u}" ${u === defaultFrom ? 'selected' : ''}>${RATES[u].symbol} ${RATES[u].name}</option>`).join('')}
            </select>
          </div>
          
          <button type="button" class="swap-btn" id="currency-swap" title="Swap currencies" aria-label="Swap currencies">
            &#8646;
          </button>
          
          <div class="input-group">
            <label class="input-label" for="currency-to">To</label>
            <select id="currency-to" class="converter-select">
              ${CURRENCY_UNITS.map(u => `<option value="${u}" ${u === defaultTo ? 'selected' : ''}>${RATES[u].symbol} ${RATES[u].name}</option>`).join('')}
            </select>
          </div>
          
          <div class="input-group result-group">
            <label class="input-label" for="currency-result">Result</label>
            <output id="currency-result" class="converter-result" aria-live="polite">-</output>
          </div>
        </div>
      </fieldset>
      
      <section class="quick-convert" aria-labelledby="currency-quick-title">
        <div class="quick-header">
          <span class="quick-icon" aria-hidden="true">&#8635;</span>
          <span id="currency-quick-title" class="quick-title">Quick Conversions</span>
        </div>
        <div id="currency-quick" class="quick-chips" role="list"></div>
      </section>
    </section>
  `;

  attachCurrencyListeners();
}

function attachCurrencyListeners() {
  const valueInput = document.getElementById('currency-value');
  const fromSelect = document.getElementById('currency-from');
  const toSelect = document.getElementById('currency-to');
  const resultOutput = document.getElementById('currency-result');
  const quickView = document.getElementById('currency-quick');
  const swapBtn = document.getElementById('currency-swap');

  if (!valueInput || !fromSelect || !toSelect) return;

  const update = () => {
    const value = parseFloat(valueInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (isNaN(value) || value < 0) {
      resultOutput.textContent = '-';
      return;
    }

    const converted = convertCurrency(value, from, to);
    const toSymbol = RATES[to].symbol;
    resultOutput.textContent = `${toSymbol}${formatCurrency(converted)}`;

    // Quick conversions
    if (quickView) {
      quickView.innerHTML = CURRENCY_UNITS.map(u => {
        if (u === from) return '';
        const val = convertCurrency(value, from, u);
        return `
          <div class="quick-chip" role="listitem" title="${RATES[u].name}">
            <span class="chip-value">${RATES[u].symbol}${formatCurrency(val)}</span>
            <span class="chip-unit">${u.toUpperCase()}</span>
          </div>
        `;
      }).join('');
    }
  };

  valueInput.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  toSelect.addEventListener('change', update);

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      update();
    });
  }

  update();
}