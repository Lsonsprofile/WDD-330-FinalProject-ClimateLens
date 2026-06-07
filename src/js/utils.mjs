// Load an HTML file and return its contents
export async function loadTemplate(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return await response.text();
}

// Insert template into an element and run callback if provided
export function renderWithTemplate(template, parentElement, callback, data) {
  if (!parentElement) {
    console.warn('renderWithTemplate: parentElement not found');
    return;
  }

  parentElement.innerHTML = template;

  if (callback) {
    callback(data);
  }
}

// Load header and footer partials
export async function loadHeaderFooter() {
  try {
    // Load header
    const headerTemplate = await loadTemplate('/partials/header.html');
    const headerElement = document.getElementById('main-header');

    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement, () => {
        initHamburgerMenu();
      });
    }

    // Load footer
    const footerTemplate = await loadTemplate('/partials/footer.html');
    const footerElement = document.getElementById('main-footer');

    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
    }

  } catch (error) {
    console.error('Failed to load header/footer:', error);
  }
}

// Handle mobile navigation menu
export function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-toggle');

  if (!hamburgerBtn) {
    console.warn('Hamburger button not found');
    return;
  }

  const hamburgerIcon = hamburgerBtn.querySelector('img');
  const mobileNav = document.getElementById('nav-bar');

  if (!mobileNav) {
    console.warn('Navigation element not found');
    return;
  }

  // Replace button to prevent duplicate event listeners
  const newBtn = hamburgerBtn.cloneNode(true);
  hamburgerBtn.parentNode.replaceChild(newBtn, hamburgerBtn);

  const newIcon = newBtn.querySelector('img');

  // Open and close menu
  newBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    const isOpen = mobileNav.classList.contains('active');

    if (newIcon) {
      newIcon.src = isOpen
        ? '/icons/hamburger-open.svg'
        : '/icons/hamburger-close.svg';
    }

    mobileNav.classList.toggle('active');
  });

  // Close menu when clicking outside
  const closeNav = (e) => {
    const isClickInside =
      newBtn.contains(e.target) ||
      mobileNav.contains(e.target);

    if (!isClickInside && mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');

      if (newIcon) {
        newIcon.src = '/icons/hamburger-open.svg';
      }
    }
  };

  document.removeEventListener('click', closeNav);
  document.addEventListener('click', closeNav);
}

// Format current time using a timezone
export function formatLocalTime(timezone = 'UTC') {
  const now = new Date();

  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone !== 'UTC' ? timezone : undefined
  });
}

// Format today's date
export function formatFullDate() {
  const now = new Date();

  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Convert Unix timestamp to readable time
export function formatUnixTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Initialize app when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {

    // Load header/footer if not already rendered
    if (!document.getElementById('main-header')?.children.length) {
      loadHeaderFooter();
    } else {
      initHamburgerMenu();
    }

  });
} else {

  // Page already loaded
  if (!document.getElementById('main-header')?.children.length) {
    loadHeaderFooter();
  } else {
    initHamburgerMenu();
  }

}