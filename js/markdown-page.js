function getMarkdownSourceFromPath(pathname) {
  if (pathname.endsWith('mes-theses-cles.html')) {
    return '/data/mes-theses-cles.md';
  }

  if (pathname.endsWith('mes-reponses.html')) {
    return '/data/mes-reponses.md';
  }

  return null;
}

function renderMarkdownPage() {
  const markdownPath = getMarkdownSourceFromPath(window.location.pathname);
  const content = document.getElementById('markdown-content');
  const title = document.getElementById('page-title');

  if (!markdownPath || !content) return;

  fetch(markdownPath, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Markdown file not found');
      return response.text();
    })
    .then(markdown => {
      const lines = markdown.split(/\r?\n/);
      const headingLine = lines.find(line => /^#\s+/.test(line));
      if (title && headingLine) {
        title.textContent = headingLine.replace(/^#\s+/, '').trim();
      }
      content.innerHTML = marked.parse(markdown);
    })
    .catch(error => {
      console.error(error);
      content.innerHTML = '<p>Impossible de charger le contenu pour le moment.</p>';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  renderMarkdownPage();
});
