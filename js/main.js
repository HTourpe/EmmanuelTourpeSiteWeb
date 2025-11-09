// -----------------------------
// Utility functions
// -----------------------------

function parseCsvDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (y < 100) y = 2000 + y;
  return new Date(y, m - 1, d);
}

function formatDateFr(dateStr) {
  const d = parseCsvDate(dateStr);
  if (!d || isNaN(d)) return '';
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function truncate(text, n) {
  if (!text) return '';
  return text.length > n ? text.substring(0, n) + '…' : text;
}

// -----------------------------
// Global variables
// -----------------------------
let allBooks = [];

// -----------------------------
// Data loading
// -----------------------------

async function loadBooks() {
  try {
    // Fetch the CSV file (served from /public/ on Cloudflare Pages)
    const response = await fetch('/Books.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('CSV not found');
    const text = await response.text();

    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    allBooks = parsed.data || [];

    // Sort by date descending
    allBooks.sort((a, b) => {
      return parseCsvDate(b['Publication Date']) - parseCsvDate(a['Publication Date']);
    });

    renderFeatured();
    renderGrid();
    populateFilter();
  } catch (err) {
    console.error('Error loading Books.csv:', err);
  }
}

// -----------------------------
// Rendering functions
// -----------------------------

function renderFeatured() {
  const featured = allBooks.slice(0, 5);
  const wrapper = document.getElementById('featured-swiper-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  featured.forEach(book => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <div class="featured-card">
        <div class="featured-cover-wrap">
          <img src="${book['Cover Image'] || book['CoverImage'] || ''}" alt="${book.Title}">
        </div>
        <div class="featured-meta">
          <h3>${book.Title}</h3>
          <p class="book-date">${formatDateFr(book['Publication Date'])}</p>
          <p>${truncate(book.Abstract || '', 200)}</p>
          <a href="${book['Publication URL']}" target="_blank" rel="noopener" class="featured-link">
            Voir sur l'éditeur
          </a>
        </div>
      </div>`;
    wrapper.appendChild(slide);
  });

  // Initialize Swiper carousel
  new Swiper('.featured-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
  });
}

function renderGrid(books = allBooks) {
  const container = document.getElementById('books-grid');
  if (!container) return;
  container.innerHTML = '';

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book['Cover Image'] || book['CoverImage'] || ''}" alt="${book.Title}">
      <h3>${book.Title}</h3>
      <p>${formatDateFr(book['Publication Date'])}</p>
      <p>${truncate(book.Abstract || '', 180)}</p>
      <a href="${book['Publication URL']}" target="_blank" rel="noopener">
        Voir sur l'éditeur
      </a>`;
    container.appendChild(card);
  });
}

function populateFilter() {
  const select = document.getElementById('year-filter');
  if (!select) return;
  const years = [
    ...new Set(
      allBooks.map(b => parseCsvDate(b['Publication Date'])?.getFullYear()).filter(Boolean)
    )
  ].sort((a, b) => b - a);

  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    select.appendChild(opt);
  });

  select.addEventListener('change', e => {
    const year = e.target.value;
    if (year === 'all') {
      renderGrid(allBooks);
    } else {
      const filtered = allBooks.filter(
        b => parseCsvDate(b['Publication Date'])?.getFullYear() == year
      );
      renderGrid(filtered);
    }
  });
}

// -----------------------------
// Parallax scrolling
// -----------------------------
function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  window.addEventListener('scroll', () => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offset = rect.top * 0.4; // smaller value = more subtle
      el.style.backgroundPosition = `center ${offset}px`;
    });
  });
}


// -----------------------------
// Initialization
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year-span');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  initParallax();
  loadBooks();
});
