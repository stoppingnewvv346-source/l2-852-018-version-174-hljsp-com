
import { H as Hls } from './video-player-dru42stk.js';

const escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => escMap[ch]);
}

function splitLines(text, maxLen) {
  const clean = String(text ?? '').trim();
  if (!clean) return [''];
  const parts = [];
  let line = '';
  for (const ch of clean) {
    line += ch;
    if (line.length >= maxLen) {
      parts.push(line);
      line = '';
    }
  }
  if (line) parts.push(line);
  return parts.slice(0, 3);
}

function paletteFromSeed(seed) {
  const palettes = [
    ['#14b8a6', '#2563eb', '#0f172a'],
    ['#0ea5e9', '#8b5cf6', '#0f172a'],
    ['#16a34a', '#06b6d4', '#0f172a'],
    ['#f59e0b', '#ef4444', '#111827'],
    ['#7c3aed', '#ec4899', '#111827'],
    ['#0f766e', '#1d4ed8', '#0f172a']
  ];
  const idx = Math.abs(Number(seed) || 0) % palettes.length;
  return palettes[idx];
}

function posterSvgDataUri(movie, wide = false) {
  const title = escapeHTML(movie.title || movie.TITLE || '');
  const year = escapeHTML(movie.year || movie.YEAR || '');
  const type = escapeHTML(movie.type || movie.TYPE || '');
  const region = escapeHTML(movie.region || movie.REGION || '');
  const genre = escapeHTML(movie.genre || movie.GENRE || '');
  const id = movie.id || movie.ID || '0000';
  const [c1, c2, dark] = paletteFromSeed(id);
  const lines = splitLines(title, wide ? 12 : 10);

  const titleLines = lines.map((line, i) => {
    const y = 118 + i * 54;
    return `<text x="64" y="${y}" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="${wide ? 40 : 34}" font-weight="800" fill="#ffffff">${line}</text>`;
  }).join('');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${wide ? 960 : 640}" height="${wide ? 540 : 900}" viewBox="0 0 ${wide ? 960 : 640} ${wide ? 540 : 900}">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="${dark}" flood-opacity="0.34"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" rx="${wide ? 42 : 36}" fill="url(#g)"/>
    <circle cx="${wide ? 820 : 470}" cy="${wide ? 110 : 150}" r="${wide ? 160 : 120}" fill="rgba(255,255,255,0.18)"/>
    <circle cx="${wide ? 790 : 515}" cy="${wide ? 410 : 700}" r="${wide ? 180 : 160}" fill="rgba(255,255,255,0.10)"/>
    <circle cx="${wide ? 140 : 110}" cy="${wide ? 430 : 760}" r="${wide ? 140 : 120}" fill="rgba(255,255,255,0.12)"/>
    <rect x="${wide ? 46 : 42}" y="${wide ? 46 : 50}" width="${wide ? 420 : 220}" height="42" rx="21" fill="rgba(255,255,255,0.16)"/>
    <text x="${wide ? 66 : 58}" y="${wide ? 74 : 78}" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="700" fill="#ffffff">${region}</text>
    <g filter="url(#shadow)">
      <rect x="${wide ? 46 : 46}" y="${wide ? 104 : 126}" width="${wide ? 320 : 214}" height="${wide ? 390 : 580}" rx="${wide ? 30 : 28}" fill="rgba(15,23,42,0.30)" stroke="rgba(255,255,255,0.16)"/>
      <rect x="${wide ? 390 : 42}" y="${wide ? 104 : 726}" width="${wide ? 520 : 214}" height="${wide ? 52 : 52}" rx="26" fill="rgba(255,255,255,0.16)"/>
    </g>
    ${titleLines}
    <text x="64" y="${wide ? 270 : 430}" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif" font-size="${wide ? 26 : 22}" fill="rgba(255,255,255,0.90)">${type}</text>
    <text x="64" y="${wide ? 314 : 478}" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif" font-size="${wide ? 22 : 20}" fill="rgba(255,255,255,0.82)">${genre}</text>
    <text x="64" y="${wide ? 380 : 560}" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif" font-size="${wide ? 22 : 20}" fill="rgba(255,255,255,0.82)">${year ? `${year} · ${id}` : id}</text>
    <text x="64" y="${wide ? 816 : 790}" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif" font-size="${wide ? 22 : 20}" fill="rgba(255,255,255,0.70)">静态精选片单</text>
    <rect x="${wide ? 406 : 50}" y="${wide ? 718 : 764}" width="${wide ? 166 : 180}" height="54" rx="27" fill="rgba(255,255,255,0.92)"/>
    <text x="${wide ? 454 : 98}" y="${wide ? 752 : 798}" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="800" fill="#0f172a">点击播放预览</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function cardsFromMovie(movie, wide = false) {
  const poster = posterSvgDataUri(movie, wide);
  const title = escapeHTML(movie.title || movie.TITLE || '');
  const type = escapeHTML(movie.type || movie.TYPE || '');
  const region = escapeHTML(movie.region || movie.REGION || '');
  const year = escapeHTML(movie.year || movie.YEAR || '');
  const genre = escapeHTML(movie.genre || movie.GENRE || '');
  const score = Number(movie.score || 0).toFixed(1);
  const summaryRaw = movie.summary || movie.SUMMARY || movie.one_line || movie.ONE_LINE || '';
  const summary = escapeHTML(summaryRaw);

  return `
    <a class="search-result" href="video-${String(movie.id || movie.ID || '0000')}.html">
      <div class="search-result__poster">
        <img src="${poster}" alt="${title}" loading="lazy">
      </div>
      <div>
        <h3 class="movie-card__title">${title}</h3>
        <div class="movie-meta">${year} · ${type}</div>
        <div class="chips">
          <span class="chip">${region}</span>
          <span class="chip">${genre.split(/[，,/、\s]+/).filter(Boolean).slice(0, 2).join(' / ')}</span>
        </div>
        <div class="movie-card__footer">
          <span class="score">热度 ${score}</span>
          <span>${escapeHTML(summaryRaw.slice(0, 36))}${summaryRaw.length > 36 ? '…' : ''}</span>
        </div>
      </div>
    </a>`;
}

function attachSearchForms() {
  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"], input[type="search"], input');
      const query = input ? input.value.trim() : '';
      const target = form.getAttribute('data-search-form') || 'search.html';
      const url = new URL(target, window.location.href);
      if (query) url.searchParams.set('q', query);
      window.location.href = url.pathname + url.search + url.hash;
    });
  });
}

function attachMobileMenu() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
  });
}

function initPlayer() {
  const video = document.querySelector('[data-hls-src]');
  if (!video) return;

  const hlsSrc = video.getAttribute('data-hls-src');
  const mp4Fallback = video.getAttribute('data-mp4-fallback') || '';
  if (!hlsSrc) return;

  const nativeCanPlay = video.canPlayType('application/vnd.apple.mpegurl');

  if (nativeCanPlay) {
    video.src = hlsSrc;
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false
    });
    hls.loadSource(hlsSrc);
    hls.attachMedia(video);
    video.addEventListener('loadedmetadata', () => {
      if (video.paused) {
        // no-op
      }
    });
    window.__pageHls = hls;
    return;
  }

  if (mp4Fallback) {
    video.src = mp4Fallback;
  }
}

function updateSearchUrl(query) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set('q', query);
  } else {
    url.searchParams.delete('q');
  }
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

function initSearchPage() {
  const shell = document.querySelector('[data-search-shell]');
  if (!shell || !Array.isArray(window.__MOVIES__)) return;

  const results = document.querySelector('[data-search-results]');
  const pager = document.querySelector('[data-search-pagination]');
  const queryInput = document.querySelector('[data-search-input]');
  const sortSelect = document.querySelector('[data-search-sort]');
  const typeSelect = document.querySelector('[data-search-type]');
  const countLabel = document.querySelector('[data-search-count]');

  if (!results || !pager || !queryInput) return;

  const pageSize = 24;
  let page = 1;

  const initialQuery = new URL(window.location.href).searchParams.get('q') || '';
  queryInput.value = initialQuery;

  function filterData() {
    const q = queryInput.value.trim().toLowerCase();
    const sort = sortSelect ? sortSelect.value : 'relevance';
    const type = typeSelect ? typeSelect.value : 'all';

    let list = window.__MOVIES__.filter((movie) => {
      const haystack = [
        movie.title,
        movie.type,
        movie.region,
        movie.genre,
        movie.summary,
        movie.review,
        movie.one_line
      ].join(' ').toLowerCase();

      const matchesQ = !q || haystack.includes(q);
      const matchesType = type === 'all' || movie.type === type || movie.type.includes(type);
      return matchesQ && matchesType;
    });

    if (sort === 'year') {
      list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    } else if (sort === 'score') {
      list.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    } else {
      list.sort((a, b) => {
        const ql = q.length || 1;
        const ah = [a.title, a.type, a.region, a.genre, a.summary, a.review, a.one_line].join(' ').toLowerCase();
        const bh = [b.title, b.type, b.region, b.genre, b.summary, b.review, b.one_line].join(' ').toLowerCase();
        const aIdx = q ? ah.indexOf(q) : 0;
        const bIdx = q ? bh.indexOf(q) : 0;
        if (aIdx !== bIdx) return aIdx - bIdx;
        return (Number(b.score) || 0) - (Number(a.score) || 0);
      });
    }

    return list;
  }

  function render() {
    const list = filterData();
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    page = Math.min(page, totalPages);
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);

    if (countLabel) {
      countLabel.textContent = `共 ${list.length} 条结果`;
    }

    results.innerHTML = slice.length
      ? slice.map((movie) => cardsFromMovie(movie)).join('')
      : `<div class="section-panel" style="grid-column:1/-1"><h3 class="panel-title">没有找到匹配内容</h3><p class="section-note">试试更换关键词、类型或排序方式。</p></div>`;

    pager.innerHTML = '';
    if (totalPages > 1) {
      const prev = document.createElement('button');
      prev.textContent = '上一页';
      prev.disabled = page <= 1;
      prev.addEventListener('click', () => {
        page = Math.max(1, page - 1);
        render();
      });
      pager.appendChild(prev);

      const startPage = Math.max(1, page - 2);
      const endPage = Math.min(totalPages, page + 2);

      if (startPage > 1) {
        const first = document.createElement('button');
        first.textContent = '1';
        first.addEventListener('click', () => { page = 1; render(); });
        pager.appendChild(first);
      }

      for (let p = startPage; p <= endPage; p++) {
        const btn = document.createElement('button');
        btn.textContent = String(p);
        btn.className = p === page ? 'is-active' : '';
        btn.addEventListener('click', () => { page = p; render(); });
        pager.appendChild(btn);
      }

      if (endPage < totalPages) {
        const last = document.createElement('button');
        last.textContent = String(totalPages);
        last.addEventListener('click', () => { page = totalPages; render(); });
        pager.appendChild(last);
      }

      const next = document.createElement('button');
      next.textContent = '下一页';
      next.disabled = page >= totalPages;
      next.addEventListener('click', () => {
        page = Math.min(totalPages, page + 1);
        render();
      });
      pager.appendChild(next);
    }

    updateSearchUrl(queryInput.value.trim());
  }

  queryInput.addEventListener('input', () => {
    page = 1;
    render();
  });
  if (sortSelect) sortSelect.addEventListener('change', () => { page = 1; render(); });
  if (typeSelect) typeSelect.addEventListener('change', () => { page = 1; render(); });

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  attachSearchForms();
  attachMobileMenu();
  initPlayer();
  initSearchPage();
});
