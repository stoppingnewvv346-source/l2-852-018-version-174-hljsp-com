(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('.menu-toggle');
  var panel = qs('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  var carousel = qs('[data-hero-carousel]');
  if (carousel) {
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('.hero-dot', carousel);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    qsa('[data-hero-prev]', carousel).forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    });

    qsa('[data-hero-next]', carousel).forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
        restart();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  var filterArea = qs('[data-filter-area]');
  if (filterArea) {
    var grid = qs('[data-card-grid]');
    var search = qs('[data-card-search]', filterArea);
    var genre = qs('[data-genre-filter]', filterArea);
    var yearSort = qs('[data-year-sort]', filterArea);
    var cards = qsa('.movie-card', grid);

    function applyFilters() {
      var keyword = (search && search.value || '').trim().toLowerCase();
      var genreValue = genre && genre.value || '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var cardGenre = card.getAttribute('data-genre') || '';
        var textMatch = !keyword || title.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1 || cardGenre.toLowerCase().indexOf(keyword) !== -1;
        var genreMatch = !genreValue || cardGenre === genreValue;
        card.hidden = !(textMatch && genreMatch);
      });
    }

    function sortCards() {
      if (!grid || !yearSort) {
        return;
      }
      var mode = yearSort.value;
      if (mode === 'default') {
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        return;
      }
      var sorted = cards.slice().sort(function (a, b) {
        var ay = parseInt(a.getAttribute('data-year') || '0', 10);
        var by = parseInt(b.getAttribute('data-year') || '0', 10);
        return mode === 'desc' ? by - ay : ay - by;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }
    if (genre) {
      genre.addEventListener('change', applyFilters);
    }
    if (yearSort) {
      yearSort.addEventListener('change', sortCards);
    }
  }

  var searchResults = qs('#search-results');
  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('#search-page-input');
    var title = qs('#search-title');
    if (input) {
      input.value = query;
    }

    function createResult(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="poster-link" href="./' + movie.file + '" aria-label="' + escapeText(movie.title) + '">',
        '<img src="' + movie.cover + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-mark">▶</span>',
        '<span class="movie-meta-pill">' + escapeText(movie.region) + ' · ' + escapeText(movie.type) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<h3><a href="./' + movie.file + '">' + escapeText(movie.title) + '</a></h3>',
        '<p>' + escapeText(movie.one_line) + '</p>',
        '<div class="movie-card-info"><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.genre) + '</span></div>',
        '</div>'
      ].join('');
      return article;
    }

    function escapeText(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    if (!query) {
      if (title) {
        title.textContent = '请输入关键词';
      }
      searchResults.innerHTML = '<div class="empty-state">输入关键词后即可查看匹配影片。</div>';
    } else {
      var lower = query.toLowerCase();
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line].join(' ').toLowerCase().indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = '“' + query + '”的匹配结果';
      }
      if (results.length) {
        var fragment = document.createDocumentFragment();
        results.forEach(function (movie) {
          fragment.appendChild(createResult(movie));
        });
        searchResults.innerHTML = '';
        searchResults.appendChild(fragment);
      } else {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片，可尝试更换关键词。</div>';
      }
    }
  }
})();
