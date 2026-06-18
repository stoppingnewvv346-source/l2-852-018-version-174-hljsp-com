
(function () {
  const DATA = window.MOVIES_DATA || [];
  const PAGE = document.body?.dataset.page || 'index';

  function byId(id) {
    return DATA.find(item => item.id === String(id).padStart(4, '0'));
  }

  function q(sel, root = document) {
    return root.querySelector(sel);
  }

  function qa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function esc(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function hashHue(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (h << 5) - h + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) % 360;
  }

  function cardStyle(movie) {
    const hue = hashHue(movie.title || movie.id);
    const hue2 = (hue + 40) % 360;
    const hue3 = (hue + 150) % 360;
    return `--accent:hsl(${hue} 85% 55%);--accent2:hsl(${hue2} 82% 48%);--accent3:hsl(${hue3} 72% 42%)`;
  }

  function tagList(tags, limit = 3) {
    return (tags || []).slice(0, limit).map(tag => `<span class="chip chip-soft">${esc(tag)}</span>`).join('');
  }

  function movieCard(movie, compact = false) {
    const style = cardStyle(movie);
    const oneLine = (movie.oneLine || '').replace(/\s+/g, '');
    const meta = [movie.region, movie.genre].filter(Boolean).join(' · ');
    return `
      <a class="movie-card ${compact ? 'movie-card--compact' : ''}" href="${movie.slug}" style="${style}">
        <div class="movie-card__poster">
          <span class="movie-card__year">${esc(movie.year)}</span>
          <span class="movie-card__type">${esc(movie.type)}</span>
          <div class="movie-card__poster-inner">
            <div class="movie-card__title">${esc(movie.title)}</div>
            <div class="movie-card__subtitle">${esc(meta)}</div>
          </div>
        </div>
        <div class="movie-card__body">
          <div class="movie-card__meta">${esc(movie.tags?.join(' · ') || '')}</div>
          <h3>${esc(movie.title)}</h3>
          <p>${esc(oneLine.slice(0, compact ? 52 : 64))}${oneLine.length > (compact ? 52 : 64) ? '…' : ''}</p>
          <div class="movie-card__chips">${tagList(movie.tags || [], compact ? 2 : 3)}</div>
        </div>
      </a>
    `;
  }

  function navActive() {
    const page = PAGE;
    qa('[data-nav]').forEach(el => {
      const key = el.getAttribute('data-nav');
      if (key === page) el.classList.add('is-active');
    });
  }

  function mobileNav() {
    const nav = q('.nav');
    const btn = q('.menu-toggle');
    if (!nav || !btn) return;
    btn.addEventListener('click', () => nav.classList.toggle('is-open'));
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('is-open');
      }
    });
  }

  function heroSlider() {
    const slides = qa('[data-hero-slide]');
    const dots = qa('[data-hero-dot]');
    if (!slides.length || !dots.length) return;
    let active = 0;
    let timer = null;

    function show(i) {
      active = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === active));
      dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === active));
    }

    dots.forEach((dot, idx) => dot.addEventListener('click', () => {
      show(idx);
      restart();
    }));

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(active + 1), 5200);
    }

    show(0);
    restart();
  }

  function initSearchPage() {
    const grid = q('[data-search-grid]');
    const input = q('[data-search-input]');
    const filters = qa('[data-filter]');
    const counter = q('[data-search-count]');
    const pager = q('[data-pagination]');
    if (!grid || !input || !counter || !pager) return;

    const state = {
      query: new URLSearchParams(location.search).get('q') || '',
      region: new URLSearchParams(location.search).get('region') || '',
      type: new URLSearchParams(location.search).get('type') || '',
      year: new URLSearchParams(location.search).get('year') || '',
      page: Number(new URLSearchParams(location.search).get('page') || '1'),
      pageSize: 36,
    };

    input.value = state.query;

    function matches(movie) {
      const q = state.query.trim().toLowerCase();
      if (state.region && movie.region !== state.region) return false;
      if (state.type && movie.type !== state.type) return false;
      if (state.year && String(movie.year) !== state.year) return false;
      if (!q) return true;
      const hay = [
        movie.title, movie.region, movie.type, movie.genre,
        ...(movie.tags || []), movie.oneLine, movie.summary, movie.review
      ].join(' ').toLowerCase();
      return hay.includes(q);
    }

    function filtered() {
      return DATA.filter(matches).sort((a, b) => b.score - a.score);
    }

    function syncUrl() {
      const params = new URLSearchParams();
      if (state.query) params.set('q', state.query);
      if (state.region) params.set('region', state.region);
      if (state.type) params.set('type', state.type);
      if (state.year) params.set('year', state.year);
      if (state.page > 1) params.set('page', String(state.page));
      const url = location.pathname + (params.toString() ? `?${params.toString()}` : '');
      history.replaceState(null, '', url);
    }

    function render() {
      const list = filtered();
      const total = list.length;
      const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
      state.page = Math.min(state.page, totalPages);
      const start = (state.page - 1) * state.pageSize;
      const view = list.slice(start, start + state.pageSize);
      grid.innerHTML = view.map(movieCard).join('') || `
        <div class="panel">
          <div class="panel__inner">
            <h3 style="margin-top:0">没有找到匹配影片</h3>
            <p style="color:var(--muted);line-height:1.8;margin-bottom:0">试试更换关键词、地区、年份或类型筛选。</p>
          </div>
        </div>`;
      counter.textContent = `共 ${total} 部影片 · 第 ${state.page} / ${totalPages} 页`;
      pager.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const b = document.createElement('button');
        b.textContent = String(i);
        b.className = i === state.page ? 'is-active' : '';
        b.addEventListener('click', () => {
          state.page = i;
          syncUrl();
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pager.appendChild(b);
      }
      syncUrl();
    }

    input.addEventListener('input', () => {
      state.query = input.value.trim();
      state.page = 1;
      render();
    });

    filters.forEach(filter => {
      filter.addEventListener('change', () => {
        const key = filter.dataset.filter;
        state[key] = filter.value;
        state.page = 1;
        render();
      });
    });

    render();
  }

  function initTopicPage() {
    const list = q('[data-topic-list]');
    if (!list) return;
    const bucket = Number(list.dataset.topicBucket || '0');
    const title = q('[data-topic-count]');
    const items = DATA.filter(item => item.bucket === bucket).sort((a, b) => b.score - a.score);
    if (title) title.textContent = `${items.length} 部影片`;
    // if static render is already embedded, keep it. we only update counter.
  }

  function initRankingPage() {
    const list = q('[data-ranking-list]');
    if (!list) return;
    const items = DATA.slice().sort((a, b) => b.score - a.score).slice(0, 100);
    const html = items.map((movie, idx) => `
      <a class="list__item" href="${movie.slug}">
        <span class="list__index">${idx + 1}</span>
        <div class="list__content">
          <b>${esc(movie.title)}</b>
          <span>${esc(movie.year)} · ${esc(movie.region)} · ${esc(movie.genre)} · ${esc((movie.tags || []).slice(0, 3).join(' / '))}</span>
        </div>
      </a>
    `).join('');
    list.innerHTML = html;
  }

  function setupPlayer() {
    const screen = q('[data-player]');
    if (!screen) return;
    const video = q('video', screen);
    const playBtn = q('[data-play-preview]');
    const mp4Btn = q('[data-play-mp4]');
    const reloadBtn = q('[data-reload]');
    const status = q('[data-player-status]');
    const mp4 = screen.dataset.mp4;
    const m3u8 = screen.dataset.m3u8;

    let mode = 'mp4';
    let hlsInstance = null;

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    function useMp4() {
      mode = 'mp4';
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      video.removeAttribute('src');
      video.src = mp4;
      video.load();
      setStatus('当前播放：本地 MP4 预览源');
    }

    function useM3U8() {
      mode = 'm3u8';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        setStatus('当前播放：原生 HLS / m3u8 预览源');
        return;
      }
      // graceful fallback when HLS.js is unavailable
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        if (hlsInstance) hlsInstance.destroy();
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(m3u8);
        hlsInstance.attachMedia(video);
        setStatus('当前播放：HLS.js 预览源');
      } else {
        video.src = mp4;
        setStatus('当前浏览器不支持 HLS，已切换为本地 MP4 预览源');
      }
    }

    function play() {
      if (!video.src) useMp4();
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }

    playBtn?.addEventListener('click', () => {
      useM3U8();
      play();
    });

    mp4Btn?.addEventListener('click', () => {
      useMp4();
      play();
    });

    reloadBtn?.addEventListener('click', () => {
      if (mode === 'm3u8') useM3U8(); else useMp4();
      play();
    });

    // default source
    useMp4();
  }


  function initHeroFeatured() {
    const root = q('[data-hero-root]');
    if (!root) return;
    const featuredIds = (root.dataset.featured || '').split(',').map(s => s.trim()).filter(Boolean);
    const slides = q('[data-hero-slides]');
    const side = q('[data-hero-side]');
    if (!slides || !side) return;
    const featured = featuredIds.map(id => byId(id)).filter(Boolean);
    if (!featured.length) return;
    slides.innerHTML = featured.map((movie, idx) => {
      const style = cardStyle(movie);
      const bg = `linear-gradient(135deg, hsl(${hashHue(movie.title)} 85% 46%) 0%, hsl(${(hashHue(movie.title)+34)%360} 80% 42%) 50%, hsl(${(hashHue(movie.title)+146)%360} 72% 36%) 100%)`;
      return `
        <div class="hero__slide ${idx === 0 ? 'is-active' : ''}" data-hero-slide style="--slide-bg:${bg};${style}">
          <div class="hero__topline">
            <span class="chip">热度推荐</span>
            <span class="chip">${esc(movie.year)} · ${esc(movie.region)}</span>
            <span class="chip">${esc(movie.type)}</span>
          </div>
          <div class="hero__slide-panel">
            <h3 class="hero__slide-title">${esc(movie.title)}</h3>
            <p class="hero__slide-text">${esc(movie.oneLine || movie.summary)}</p>
            <div class="hero__slide-meta">
              ${(movie.tags || []).slice(0, 4).map(t => `<span class="chip chip-soft">${esc(t)}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // dot controls
    const dotsWrap = q('[data-hero-dots]');
    if (dotsWrap) {
      dotsWrap.innerHTML = featured.map((movie, idx) =>
        `<button class="hero__slide-dot ${idx === 0 ? 'is-active' : ''}" type="button" data-hero-dot aria-label="切换到第 ${idx + 1} 张"></button>`
      ).join('');
    }

    heroSlider();
  }

  function initDetailPage() {
    const root = q('[data-detail-root]');
    if (!root) return;
    const id = root.dataset.movieId;
    const movie = byId(id);
    if (!movie) return;
    const relatedWrap = q('[data-related-wrap]');
    if (relatedWrap) {
      const ids = (root.dataset.relatedIds || '').split(',').map(s => s.trim()).filter(Boolean);
      const relatedMovies = ids.map(byId).filter(Boolean).slice(0, 12);
      relatedWrap.innerHTML = relatedMovies.map(m => movieCard(m, true)).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    navActive();
    mobileNav();
    initHeroFeatured();
    initSearchPage();
    initTopicPage();
    initRankingPage();
    initDetailPage();
    setupPlayer();
  });
})();
