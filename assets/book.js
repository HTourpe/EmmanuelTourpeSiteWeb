import { parseCSV } from './csv.js';

function toFR(dateStr) {
  if(!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' });
}

function getSlug() {
  const params = new URLSearchParams(location.search);
  return params.get('slug') || '';
}

async function main(){
  const slug = getSlug();
  const res = await fetch('/data/books.csv');
  const txt = await res.text();
  const books = parseCSV(txt);
  const b = books.find(x => (x.slug||'') === slug);
  const el = document.getElementById('book');
  if(!b){
    document.title = "introuvable — livre";
    el.innerHTML = '<p class="notice">Livre introuvable.</p>';
    return;
  }
  document.title = `${b.title} — livre`;
  const date = toFR(b.publishDate);
  el.innerHTML = `
    <div class="card" style="padding:20px;">
      <img class="cover" src="${b.coverUrl}" alt="Couverture — ${b.title}">
      <h1>${b.title}</h1>
      <div class="meta">${b.author||""}${date ? " · " + date : ""} ${b.isbn ? " · ISBN " + b.isbn : ""}</div>
      <p>${b.description||""}</p>
    </div>`;
}

document.addEventListener('DOMContentLoaded', main);
