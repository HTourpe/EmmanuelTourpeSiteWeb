// Generic loader for CSV-based publication pages

function parseIntOrNull(x) {
  const n = parseInt(x, 10);
  return isNaN(n) ? null : n;
}

let pubItems = [];
let pubObserver = null;

function initPubObserver() {
  if (!('IntersectionObserver' in window)) return;
  pubObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('pub-item--hidden');
          pubObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
}

function loadPublications(config) {
  const { csvPath, delimiter } = config;

  const options = {
    header: true,
    skipEmptyLines: true,
    download: true,
    complete: results => {
  pubItems = (results.data || []).map(row => ({
    id: row.ID || '',
    title: row.Title || '',
    outlet: row.Outlet || '',
    year: parseIntOrNull(row.Year),
    reference: row.Reference || ''
  }));

  // sort newest first
  pubItems.sort((a, b) => (b.year || 0) - (a.year || 0));

  // populate the select ONCE, now that we know all years
  populateYearFilter();

  // initial render + filter wiring
  renderPublications();
  initFilters();
},

    error: err => {
      console.error('Erreur de chargement CSV publications :', err);
    }
  };

  // If a delimiter is explicitly provided in config, use it.
  // Otherwise let PapaParse auto-detect the delimiter.
  if (delimiter) {
    options.delimiter = delimiter;
  }

  Papa.parse(csvPath, options);
}

function getFilteredItems() {
  const yearSel = document.getElementById('pub-year');
  const queryInput = document.getElementById('pub-query');
  const yearVal = yearSel ? yearSel.value : 'all';
  const query = queryInput ? queryInput.value.toLowerCase().trim() : '';

  return pubItems.filter(item => {
    if (yearVal !== 'all' && String(item.year) !== yearVal) {
      return false;
    }
    if (query) {
      const haystack = (item.title + ' ' + item.outlet + ' ' + item.reference).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function renderPublications() {
  const container = document.getElementById('pub-list');
  if (!container) return;
  container.innerHTML = '';

  const items = getFilteredItems();
  const groups = new Map();

  items.forEach(it => {
    const key = it.year || 'Sans date';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(it);
  });

  const sortedYears = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'Sans date') return 1;
    if (b === 'Sans date') return -1;
    return b - a;
  });

  sortedYears.forEach(year => {
    const groupEl = document.createElement('div');
    groupEl.className = 'pub-year-group';

    const h = document.createElement('div');
    h.className = 'pub-year-heading';
    h.textContent = year;
    groupEl.appendChild(h);

    groups.get(year).forEach(it => {
      const itemEl = document.createElement('div');
      itemEl.className = 'pub-item pub-item--hidden';

      itemEl.innerHTML = `
        <div class="pub-item-title">${it.title}</div>
        <div class="pub-item-outlet">${it.outlet}${it.reference ? ' — ' + it.reference : ''}</div>
      `;

      groupEl.appendChild(itemEl);

      if (pubObserver) {
        pubObserver.observe(itemEl);
      } else {
        itemEl.classList.remove('pub-item--hidden');
      }
    });

    container.appendChild(groupEl);
  });

  populateYearFilter();
}

function populateYearFilter() {
  const sel = document.getElementById('pub-year');
  if (!sel) return;
  const years = [...new Set(pubItems.map(it => it.year).filter(Boolean))].sort((a, b) => b - a);

  sel.innerHTML = '<option value="all">Toutes</option>';
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  });
}

function initFilters() {
  const sel = document.getElementById('pub-year');
  const queryInput = document.getElementById('pub-query');

  if (sel) {
    sel.addEventListener('change', () => renderPublications());
  }
  if (queryInput) {
    queryInput.addEventListener('input', () => renderPublications());
  }
}

// bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initPubObserver();
  if (window.PUBLICATION_CONFIG) {
    loadPublications(window.PUBLICATION_CONFIG);
  }
});
