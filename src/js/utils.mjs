// ============================================
// utils.mjs — Template loading, header/footer, hamburger menu, time formatters
// ============================================

/**
 * Load an HTML template from a file path
 * @param {string} path — Path to the HTML file (e.g., '/partials/header.html')
 * @returns {Promise<string>} HTML string
 */
export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return await response.text();
}

/**
 * Render a template string into a DOM element
 * @param {string} template — HTML string
 * @param {HTMLElement} parentElement — Element to inject into
 * @param {Function} callback — Optional callback after render
 * @param {*} data — Optional data to pass to callback
 */
export function renderWithTemplate(template, parentElement, callback, data) {
  if (!parentElement) {
    console.warn('renderWithTemplate: parentElement not found');
    return;
  }
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

/**
 * Load header and footer partials into the page
 */
export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate('/partials/header.html');
    const headerElement = document.getElementById('main-header');
    if (headerElement) renderWithTemplate(headerTemplate, headerElement);

    const footerTemplate = await loadTemplate('/partials/footer.html');
    const footerElement = document.getElementById('main-footer');
    if (footerElement) renderWithTemplate(footerTemplate, footerElement);
  } catch (error) {
    console.error('Failed to load header/footer:', error);
  }
}

/**
 * Initialize hamburger menu toggle for mobile navigation
 */
export function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  if (!hamburgerBtn) return;

  const hamburgerIcon = hamburgerBtn.querySelector('img');
  const mobileNav = document.getElementById('nav-bar');
  if (!mobileNav) return;

  // Toggle on hamburger click
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent closing immediately
    const isOpen = mobileNav.classList.contains('active');

    // Toggle icon
    hamburgerIcon.src = isOpen
      ? '/icons/hamburger-open.svg'
      : '/icons/hamburger-close.svg';

    // Toggle nav
    mobileNav.classList.toggle('active');
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInside =
      hamburgerBtn.contains(e.target) || mobileNav.contains(e.target);

    if (!isClickInside && mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');
      hamburgerIcon.src = '/icons/hamburger-open.svg'; // reset icon
    }
  });
}

// ============================================
// TIME FORMATTERS — For location bar display
// ============================================

/**
 * Format current time for display (e.g., "2:45 PM")
 * @param {string} timezone — IANA timezone name (e.g., "Africa/Lagos")
 * @returns {string} Formatted time string
 */
export function formatLocalTime(timezone = 'UTC') {
  const now = new Date();

  // Use timezone from BigDataCloud if available, fallback to local
  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone !== 'UTC' ? timezone : undefined
  };

  return now.toLocaleTimeString('en-US', options);
}

/**
 * Format full date for display (e.g., "Monday, June 6, 2026")
 * @returns {string} Formatted date string
 */
export function formatFullDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time from Unix timestamp (for sunrise/sunset)
 * @param {number} unixTimestamp — Seconds since epoch
 * @returns {string} Formatted time like "6:24 AM"
 */
export function formatUnixTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}