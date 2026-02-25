// ─── PLAYER ───────────────────────────────────────────────────────

const Player = {
  // Build the iframe src
  movieSrc(id, autoplay = false, progress = 0) {
    const p = new URLSearchParams({
      color: CONFIG.VIDKING_COLOR,
      autoPlay: autoplay,
    });
    if (progress > 0) p.set('progress', Math.floor(progress));
    return `${CONFIG.VIDKING}/embed/movie/${id}?${p}`;
  },

  tvSrc(id, season, episode, autoplay = false, progress = 0) {
    const p = new URLSearchParams({
      color:           CONFIG.VIDKING_COLOR,
      autoPlay:        autoplay,
      nextEpisode:     true,
      episodeSelector: true,
    });
    if (progress > 0) p.set('progress', Math.floor(progress));
    return `${CONFIG.VIDKING}/embed/tv/${id}/${season}/${episode}?${p}`;
  },

  // Return the iframe element
  createIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.allowFullscreen = true;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
    return iframe;
  },

  // Mount player into a wrapper div
  mountMovie(wrapEl, id, autoplay = false) {
    const saved = this._getSaved('movie', id);
    const src   = this.movieSrc(id, autoplay, saved?.t || 0);
    wrapEl.innerHTML = '';
    wrapEl.appendChild(this.createIframe(src));
  },

  mountTV(wrapEl, showId, season, episode, autoplay = false) {
    const saved = this._getSaved('tv', showId, season, episode);
    const src   = this.tvSrc(showId, season, episode, autoplay, saved?.t || 0);
    wrapEl.innerHTML = '';
    wrapEl.appendChild(this.createIframe(src));
  },

  unmount(wrapEl) {
    wrapEl.innerHTML = '';
  },

  // Progress persistence
  _getSaved(type, id, s, e) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY(type, id, s, e));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  _setSaved(type, id, s, e, t, dur) {
    try {
      localStorage.setItem(PROGRESS_KEY(type, id, s, e), JSON.stringify({ t, dur }));
    } catch { }
  },
};

// Listen for progress events from VidKing player
window.addEventListener('message', (ev) => {
  if (typeof ev.data !== 'string') return;
  try {
    const msg = JSON.parse(ev.data);
    if (msg?.type !== 'PLAYER_EVENT') return;
    const d = msg.data;
    if (d?.event === 'timeupdate' && d.id) {
      Player._setSaved(
        d.mediaType, d.id,
        d.season, d.episode,
        d.currentTime, d.duration
      );
    }
  } catch { }
});
