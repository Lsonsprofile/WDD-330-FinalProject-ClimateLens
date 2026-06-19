export function setActiveNavLink() {
  const currentPath = window.location.pathname;
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Match current page — handles various path formats
    if (currentPath === linkPath || 
        currentPath === linkPath.replace('index.html', '') ||
        currentPath === linkPath.replace('/index.html', '/') ||
        (currentPath === '/' && linkPath === '/') ||
        (currentPath === '/' && linkPath === '/index.html') ||
        (currentPath.startsWith(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}