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
  return text.length > n ? text.substring(0, n) + '…' : text;
}

let allBooks = [];

async function loadBooks() {
  const response = await fetch('/data/Books.csv', { cache: 'no-store' });
  const text = await response.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  allBooks = parsed.data || [];

  allBooks.sort((a, b) => parseCsvDate(b['Publication Date']) - parseCsvDate(a['Publication Date']));

  renderFeatured();
  renderGrid();
  populateFilter();
}

function renderFeatured() {
  const featured = allBooks.slice(0, 5);
  const wrapper = document.getElementById('featured-swiper-wrapper');
  wrapper.innerHTML = '';

  featured.forEach(book => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <div class="featured-card">
        <div class="featured-cover-wrap">
          <img src="${book['Cover Image']}" alt="${book.Title}">
        </div>
        <div class="featured-meta">
          <h3>${book.Title}</h3>
          <p class="book-date">${formatDateFr(book['Publication Date'])}</p>
          <p>${truncate(book.Abstract, 200)}</p>
          <a href="${book['Publication URL']}" target="_blank">Voir sur l’éditeur</a>
        </div>
      </div>`;
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

function renderGrid(books = allBooks) {
  const container = document.getElementById('books-grid');
  container.innerHTML = '';
  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book['Cover Image']}" alt="${book.Title}">
      <h3>${book.Title}</h3>
      <p>${formatDateFr(book['Publication Date'])}</p>
      <p>${truncate(book.Abstract, 180)}</p>
      <a href="${book['Publication URL']}" target="_blank">Voir sur l’éditeur</a>`;
    container.appendChild(card);
  });
}

function populateFilter() {
  const select = document.getElementById('year-filter');
  const years = [...new Set(allBooks.map(b => parseCsvDate(b['Publication]()]()
