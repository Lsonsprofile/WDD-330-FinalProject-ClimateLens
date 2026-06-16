// load HTML file and return contents
export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return await response.text();
}

// insert template into element
export function renderWithTemplate(template, parentElement, callback, data) {
  if (!parentElement) return;
  parentElement.innerHTML = template;
  if (callback) callback(data);
}


export function updateHeaderText(city, country) {
  const el = document.getElementById('header-location-text');
  if (!el) return;
  
  if (city && country) {
    el.textContent = `${city}, ${country}`;
  } else if (city) {
    el.textContent = city;
  } else {
    el.textContent = 'Search for a city';
  }
}

// load saved location and update header
export function loadHeaderLocation() {
  const stored = localStorage.getItem('climatelens_current');
  if (!stored) {
    updateHeaderText(null, null); // shows "Search for a city"
    return;
  }
  
  try {
    const location = JSON.parse(stored);
    updateHeaderText(location.city, location.country);
  } catch {
    updateHeaderText(null, null);
  }
}

// load header and footer partials
export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate('/partials/header.html');
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement, () => {
        initHamburgerMenu();
        loadHeaderLocation(); // update header text after header loads
      });
    }

    const footerTemplate = await loadTemplate('/partials/footer.html');
    const footerElement = document.getElementById('main-footer');
    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
    }
  } catch (error) {
    // failed to load header/footer
  }
}

// handle mobile navigation menu
export function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  if (!hamburgerBtn) return;

  if (hamburgerBtn.dataset.initialized === 'true') return;
  hamburgerBtn.dataset.initialized = 'true';

  const hamburgerIcon = hamburgerBtn.querySelector('img');
  const mobileNav = document.getElementById('nav-bar');
  if (!mobileNav) return;

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileNav.classList.contains('active');
    if (hamburgerIcon) {
      hamburgerIcon.src = isOpen
        ? '/icons/hamburger-open.svg'
        : '/icons/hamburger-close.svg';
    }
    mobileNav.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    const isClickInside = hamburgerBtn.contains(e.target) || mobileNav.contains(e.target);
    if (!isClickInside && mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');
      if (hamburgerIcon) {
        hamburgerIcon.src = '/icons/hamburger-open.svg';
      }
    }
  });
}

// format current time using timezone
export function formatLocalTime(timezone = 'UTC') {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone !== 'UTC' ? timezone : undefined
  });
}

// format today's date
export function formatFullDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}