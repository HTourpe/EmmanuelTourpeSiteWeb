import { parseCSV } from './csv.js';

function toFR(dateStr) {
  if(!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' });
}

function trunc(s, n=160) { if(!s) return ''; return s.length>n ? s.slice(0,n)+'…' : s; }

async function main() {
  const res = await fetch('/data/books.csv');
  const txt = await res.text();
  const books = parseCSV(txt);
  books.sort((a,b)=> new Date(b.publishDate||0) - new Date(a.publishDate||0));
  const grid = document.getElementById('grid');
  grid.innerHTML = books.map(b => {
    const href = `/book.html?slug=${encodeURIComponent(b.slug)}`;
    const date = toFR(b.publishDate);
    return `
      <a class="card" href="${href}">
        <img class="cover" src="${b.coverUrl}" alt="Couverture — ${b.title}">
        <h2>${b.title}</h2>
        <div class="meta">${b.author||''}${date ? ' · ' + date : ''}</div>
        <span class="trunc">${trunc(b.description, 160)}</span>
      </a>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', main);
