// ─── API ──────────────────────────────────────────────────────────
const API = {
  _headers: () => ({
    'Authorization': `Bearer ${CONFIG.TMDB_TOKEN}`,
    'Content-Type': 'application/json',
  }),

  async get(path) {
    const res = await fetch(`${CONFIG.TMDB_BASE}${path}`, {
      headers: this._headers(),
    });
    if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
    return res.json();
  },

  // ── Movies
  trending: (w = 'week')      => API.get(`/trending/all/${w}`),
  popularMovies:  ()           => API.get('/movie/popular'),
  popularTV:      ()           => API.get('/tv/popular'),
  topRatedMovies: ()           => API.get('/movie/top_rated'),
  topRatedTV:     ()           => API.get('/tv/top_rated'),
  newOnKyro:      ()           => API.get('/movie/now_playing'),
  netflixOriginals: ()         => API.get('/discover/tv?with_networks=213'),
  genre: (id, type = 'movie') => API.get(`/discover/${type}?with_genres=${id}&sort_by=popularity.desc`),

  movieDetail: (id)  => API.get(`/movie/${id}?append_to_response=credits,videos,similar,images`),
  tvDetail:    (id)  => API.get(`/tv/${id}?append_to_response=credits,videos,similar,images`),
  season:      (id, s) => API.get(`/tv/${id}/season/${s}`),

  searchMulti: (q) => API.get(`/search/multi?query=${encodeURIComponent(q)}&page=1`),
  searchMovie: (q) => API.get(`/search/movie?query=${encodeURIComponent(q)}&page=1`),
  searchTV:    (q) => API.get(`/search/tv?query=${encodeURIComponent(q)}&page=1`),

  genres: () => Promise.all([
    API.get('/genre/movie/list'),
    API.get('/genre/tv/list'),
  ]),
};

// ── Image helpers
const imgUrl = (path, size = CONFIG.THUMB_SIZE) =>
  path ? `${CONFIG.IMG_BASE}${size}${path}` : null;

const backdropUrl = (path) => imgUrl(path, CONFIG.BACKDROP_SIZE);
const posterUrl   = (path) => imgUrl(path, CONFIG.POSTER_SIZE);

// ── Item helpers
const itemTitle = (item) => item.title || item.name || '';
const itemYear  = (item) => ((item.release_date || item.first_air_date || '')).slice(0, 4);
const itemType  = (item) => item.media_type || (item.first_air_date ? 'tv' : 'movie');
const itemRating = (item) => item.vote_average ? Math.round(item.vote_average * 10) : null;
