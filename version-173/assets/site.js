(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      showSlide(dotIndex);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        return;
      }
      event.preventDefault();
      var prefix = form.getAttribute('data-prefix') || './';
      window.location.href = prefix + 'search.html?q=' + encodeURIComponent(value);
    });
  });

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var searchInput = document.querySelector('[data-filter-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var resetButton = document.querySelector('[data-filter-reset]');
    var empty = document.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function matches(card) {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();

      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        return false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        return false;
      }
      if (region && card.getAttribute('data-region') !== region) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }
})();
