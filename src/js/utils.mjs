// load an HTML file and return its contents
export async function loadTemplate(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return await response.text();
}

// insert template into an element and run callback if provided
export function renderWithTemplate(template, parentElement, callback, data) {
  if (!parentElement) {
    return;
  }

  parentElement.innerHTML = template;

  if (callback) {
    callback(data);
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
// handle mobile navigation menu
export function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-toggle');

  if (!hamburgerBtn) {
    return;
  }

  const mobileNav = document.getElementById('nav-bar');

  if (!mobileNav) {
    return;
  }

  // check if already initialized to prevent duplicate listeners
  if (hamburgerBtn.dataset.initialized === 'true') {
    return;
  }
  hamburgerBtn.dataset.initialized = 'true';

  const hamburgerIcon = hamburgerBtn.querySelector('img');

  // open and close menu
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

  // close menu when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInside =
      hamburgerBtn.contains(e.target) ||
      mobileNav.contains(e.target);

    if (!isClickInside && mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');

      if (hamburgerIcon) {
        hamburgerIcon.src = '/icons/hamburger-open.svg';
      }
    }
  });
}

// format current time using a timezone
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

// convert Unix timestamp to readable time
export function formatUnixTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}