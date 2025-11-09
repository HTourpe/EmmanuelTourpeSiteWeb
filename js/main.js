// ------------------------------------------------------
// Utility functions
// ------------------------------------------------------

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

// ------------------------------------------------------
// Global variables
// ------------------------------------------------------
let allBooks = [];

// ------------------------------------------------------
// Load and parse Books.csv
// ------------------------------------------------------

async function loadBooks() {
  try {
    const response = await fetch('/Books.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('Books.csv not found');

    const text = await response.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    allBooks = (parsed.data || []).map(b => ({
      Title: b.Title || '',
      Abstract: b.Abstract || '',
      PublicationDate: b['Publication Date'] || '',
      PublicationUrl: b['Publication URL'] || '',
      CoverImage: b['Cover Image'] || b['CoverImage'] || '',
      Id: b.ID || b.Id || ''
    }));

    allBooks.sort((a, b) => {
      return parseCsvDate(b.PublicationDate) - parseCsvDate(a.PublicationDate);
    });

    renderFeatured();
    renderGrid();
    populateFilter();
  } catch (err) {
    console.error('Erreur de chargement du fichier CSV :', err);
  }
}

// ------------------------------------------------------
// Render Featured Books Carousel
// ------------------------------------------------------

function renderFeatured() {
  const featured = allBooks.slice(0, 5);
  const wrapper = document.getElementById('featured-swiper-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  featured.forEach(book => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    const bookId = book.Id;
    const detailUrl = bookId ? `/book.html?id=${encodeURIComponent(bookId)}` : (book.PublicationUrl || '#');

    slide.innerHTML = `
      <div class="featured-card">
        <div class="featured-cover-wrap">
          <a href="${detailUrl}" data-book-link class="featured-cover-link">
            <img src="${book.CoverImage}" alt="${book.Title}">
          </a>
        </div>
        <div class="featured-meta">
          <h3>${book.Title}</h3>
          <p class="book-date">${formatDateFr(book.PublicationDate)}</p>
          <p>${truncate(book.Abstract, 200)}</p>
          ${
            book.PublicationUrl
              ? `<a href="${book.PublicationUrl}" target="_blank" rel="noopener" class="featured-link">
                   Voir sur l'éditeur
                 </a>`
              : ''
          }
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  new Swiper('.featured-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
  });
}

// ------------------------------------------------------
// Render Full Book Catalog Grid
// ------------------------------------------------------

function renderGrid(books = allBooks) {
  const container = document.getElementById('books-grid');
  if (!container) return;
  container.innerHTML = '';

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';

    const bookId = book.Id;
    const detailUrl = bookId ? `/book.html?id=${encodeURIComponent(bookId)}` : (book.PublicationUrl || '#');

    card.innerHTML = `
      <a href="${detailUrl}" data-book-link class="book-cover-link">
        <img src="${book.CoverImage}" alt="${book.Title}">
      </a>
      <h3>${book.Title}</h3>
      <p>${formatDateFr(book.PublicationDate)}</p>
      <p>${truncate(book.Abstract, 180)}</p>
      ${
        book.PublicationUrl
          ? `<a href="${book.PublicationUrl}" target="_blank" rel="noopener">
               Voir sur l'éditeur
             </a>`
          : ''
      }
    `;
    container.appendChild(card);
  });
}

// ------------------------------------------------------
// Populate Year Filter Dropdown
// ------------------------------------------------------

function populateFilter() {
  const select = document.getElementById('year-filter');
  if (!select) return;

  const years = [
    ...new Set(
      allBooks
        .map(b => parseCsvDate(b.PublicationDate)?.getFullYear())
        .filter(Boolean)
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
        b => parseCsvDate(b.PublicationDate)?.getFullYear() == year
      );
      renderGrid(filtered);
    }
  });
}

// ------------------------------------------------------
// Page transition on navigation to book.html
// ------------------------------------------------------

function setupPageTransition() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-book-link]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    event.preventDefault();

    overlay.classList.add('is-active');
    setTimeout(() => {
      window.location.href = href;
    }, 350);
  });
}

// ------------------------------------------------------
// Initialization on page load
// ------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year-span');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  setupPageTransition();
  loadBooks();
});
