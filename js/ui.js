// ─── UI HELPERS ───────────────────────────────────────────────────

// ── Placeholder image (no poster)
const PLACEHOLDER = (w = 200, h = 300) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect fill="#2a2a2a" width="${w}" height="${h}"/><text x="50%" y="50%" fill="#555" text-anchor="middle" dominant-baseline="middle" font-size="13" font-family="Arial">No Image</text></svg>`)}`;

// ── Build a single card element
function buildCard(item, overrideType) {
  const type  = overrideType || itemType(item);
  const title = itemTitle(item);
  const thumb = item.backdrop_path
    ? imgUrl(item.backdrop_path, 'w300')
    : item.poster_path
      ? imgUrl(item.poster_path, 'w300')
      : null;
  const rating = itemRating(item);
  const year   = itemYear(item);
  const genres = (item.genre_ids || [])
    .slice(0, 2)
    .map(id => GENRE_MAP[id])
    .filter(Boolean);

  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id   = item.id;
  card.dataset.type = type;
  card.title = title;

  card.innerHTML = `
    <div class="card__thumb-wrap">
      <img class="card__img" src="${thumb || PLACEHOLDER(300, 169)}"
           alt="${title.replace(/"/g, '&quot;')}"
           loading="lazy"
           onerror="this.src='${PLACEHOLDER(300, 169)}'" />
    </div>
    <div class="card__hover-panel">
      <div class="card__hover-actions">
        <button class="card__hover-btn card__hover-btn--play" title="Play" onclick="event.stopPropagation();quickPlay(${item.id},'${type}')">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="card__hover-btn card__hover-btn--add" title="Add to My List">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </button>
        <button class="card__hover-btn card__hover-btn--like" title="Thumbs Up">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
        </button>
        <button class="card__hover-btn card__hover-btn--chevron" title="More Info" onclick="event.stopPropagation();openModal(${item.id},'${type}')">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
        </button>
      </div>
      <div class="card__hover-title">${title}</div>
      <div class="card__hover-meta">
        ${rating ? `<span class="card__hover-match">${rating}% Match</span>` : ''}
        ${year ? `<span class="card__hover-year">${year}</span>` : ''}
        <span class="card__hover-hd">HD</span>
        ${type === 'tv' && item.number_of_seasons ? `<span class="card__hover-seasons">${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}</span>` : ''}
      </div>
      ${genres.length ? `<div class="card__hover-tags">${genres.map(g => `<span class="card__hover-tag">${g}</span>`).join('')}</div>` : ''}
    </div>
  `;

  card.addEventListener('click', () => openModal(item.id, type));
  return card;
}

// ── Build a row
function buildRow(title, items, type, opts = {}) {
  if (!items || !items.length) return null;

  const validItems = items.filter(i =>
    (i.backdrop_path || i.poster_path) && (i.title || i.name)
  );
  if (!validItems.length) return null;

  const row = document.createElement('div');
  row.className = 'row';

  row.innerHTML = `
    <div class="row__header">
      <h2 class="row__title">${title}</h2>
      <span class="row__explore">
        Explore All
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </span>
    </div>
    <div class="row__slider-wrap">
      <button class="row__handle row__handle--left" onclick="slideRow(this, -1)">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
      </button>
      <div class="row__slider"></div>
      <button class="row__handle row__handle--right" onclick="slideRow(this, 1)">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
      </button>
    </div>
  `;

  const slider = row.querySelector('.row__slider');
  validItems.forEach(item => {
    slider.appendChild(buildCard(item, type));
  });

  return row;
}

// ── Slide row left / right
function slideRow(btn, dir) {
  const slider = btn.parentElement.querySelector('.row__slider');
  const cardW  = slider.querySelector('.card')?.offsetWidth || 200;
  const visibleCards = Math.floor(slider.clientWidth / (cardW + 4));
  slider.scrollBy({ left: dir * cardW * visibleCards, behavior: 'smooth' });
}

// ── Navbar scroll behavior
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ── Nav active state
function setActiveNav(e, section) {
  e.preventDefault();
  document.querySelectorAll('.navbar__link').forEach(l => l.classList.remove('active'));
  e.currentTarget.classList.add('active');
  filterSection(section);
}

// ── Quick play (autoplay=true from card play button)
function quickPlay(id, type) {
  openModal(id, type, true);
}

// ── Go Home
function goHome(e) {
  if (e) e.preventDefault();
  document.getElementById('searchSection').classList.remove('active');
  document.getElementById('mainBrowse').classList.remove('hidden');
  document.getElementById('searchInput').value = '';
  document.querySelector('.search-inline')?.classList.remove('open');
}

// ── Toggle search inline
function toggleSearch() {
  const s = document.getElementById('searchInline');
  s.classList.toggle('open');
  if (s.classList.contains('open')) {
    document.getElementById('searchInput').focus();
  }
}

// ── Genres dropdown population
async function populateGenres() {
  try {
    const [mv, tv] = await API.genres();
    const all = [...new Map([...mv.genres, ...tv.genres].map(g => [g.id, g])).values()];
    const dd  = document.getElementById('genreDropdown');
    dd.innerHTML = all.map(g =>
      `<div class="genre-dropdown__item" onclick="filterGenre(${g.id},'${g.name}')">${g.name}</div>`
    ).join('');
  } catch (_) {}
}

function filterGenre(id, name) {}   // placeholder – extended in app.js
function filterSection(section) {}  // placeholder – extended in app.js

// ── Maturity % helper
function matchPercent(voteAvg) {
  if (!voteAvg) return null;
  return Math.round((voteAvg / 10) * 100);
}
