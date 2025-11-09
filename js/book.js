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

async function loadBookDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    console.error('Aucun ID de livre fourni.');
    return;
  }

  try {
    const response = await fetch('/Books.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('Books.csv not found');

    const text = await response.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    const books = parsed.data || [];

    const book = books.find(b => (b.ID || b.Id || '') === id);
    if (!book) {
      console.error('Livre introuvable pour ID:', id);
      return;
    }

    const title = book.Title || '';
    const abstract = book.Abstract || '';
    const publicationDate = book['Publication Date'] || '';
    const publicationUrl = book['Publication URL'] || '';
    const coverImage = book['Cover Image'] || book['CoverImage'] || '';

    document.title = `${title} – Emmanuel Tourpe`;

    const titleEl = document.getElementById('book-title');
    const dateEl = document.getElementById('book-date');
    const abstractEl = document.getElementById('book-abstract');
    const coverEl = document.getElementById('book-cover');
    const publisherEl = document.getElementById('book-publisher-link');

    if (titleEl) titleEl.textContent = title;
    if (dateEl) dateEl.textContent = formatDateFr(publicationDate);
    if (abstractEl) abstractEl.textContent = abstract;
    if (coverEl) {
      coverEl.src = coverImage;
      coverEl.alt = title;
    }
    if (publisherEl) {
      if (publicationUrl) {
        publisherEl.href = publicationUrl;
        publisherEl.textContent = "Voir sur l'éditeur";
      } else {
        publisherEl.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Erreur de chargement du livre :', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year-span');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const overlay = document.getElementById('page-transition');
  if (overlay) {
    // fade overlay out on entry
    requestAnimationFrame(() => {
      overlay.classList.remove('is-active');
    });
  }

  loadBookDetail();
});
