function initNavDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dd => {
    const toggle = dd.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.nav-dropdown.open').forEach(other => {
        if (other !== dd) other.classList.remove('open');
      });
      dd.classList.toggle('open');
    });

    dd.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
      link.addEventListener('click', () => {
        dd.classList.remove('open');
      });
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavDropdown();
});
