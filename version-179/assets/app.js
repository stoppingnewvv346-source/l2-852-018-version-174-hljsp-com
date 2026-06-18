(function() {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }

      if (prev) {
        prev.addEventListener('click', function() {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function() {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
          show(index);
          restart();
        });
      });

      start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = normalize(searchInput ? searchInput.value : '');
      var values = {};

      filters.forEach(function(select) {
        values[select.getAttribute('data-filter')] = normalize(select.value);
      });

      var visible = 0;

      cards.forEach(function(card) {
        var title = normalize(card.getAttribute('data-title'));
        var region = normalize(card.getAttribute('data-region'));
        var year = normalize(card.getAttribute('data-year'));
        var genre = normalize(card.getAttribute('data-genre'));
        var tags = normalize(card.getAttribute('data-tags'));
        var haystack = [title, region, year, genre, tags].join(' ');
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (values.region && region.indexOf(values.region) === -1) {
          matched = false;
        }

        if (values.year && year !== values.year) {
          matched = false;
        }

        if (values.genre && genre.indexOf(values.genre) === -1 && tags.indexOf(values.genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filters.forEach(function(select) {
      select.addEventListener('change', applyFilters);
    });
  });
})();
