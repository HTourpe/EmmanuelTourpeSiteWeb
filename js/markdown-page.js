function renderMarkdownPage() {
  const markdownPath = window.MARKDOWN_PAGE_SOURCE;
  const content = document.getElementById('markdown-content');

  if (!markdownPath || !content) return;

  fetch(markdownPath, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Markdown file not found');
      return response.text();
    })
    .then(markdown => {
      content.innerHTML = markdownToHtml(markdown);
    })
    .catch(error => {
      console.error(error);
      content.innerHTML = '<p>Impossible de charger le contenu pour le moment.</p>';
    });
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listItems = [];

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${paragraph.join(' ')}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      html.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`);
      listItems = [];
    }
  }

  function formatInline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  lines.forEach(rawLine => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^#{1,3}\s+/.test(line)) {
      flushParagraph();
      flushList();
      const level = line.match(/^#{1,3}/)[0].length;
      html.push(`<h${level}>${formatInline(line.replace(/^#{1,3}\s+/, ''))}</h${level}>`);
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listItems.push(formatInline(line.replace(/^[-*]\s+/, '')));
      return;
    }

    flushList();
    paragraph.push(formatInline(line));
  });

  flushParagraph();
  flushList();

  return html.join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderMarkdownPage();
});
