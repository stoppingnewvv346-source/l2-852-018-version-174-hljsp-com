(function() {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('open');
    });
  }

  qsa('[data-site-search]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  var filterInput = qs('[data-filter-input]');
  var cards = qsa('[data-card]');
  var chips = qsa('[data-filter-chip]');

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    if (queryValue) {
      filterInput.value = queryValue;
    }

    function applyFilter(extra) {
      var query = text(filterInput.value + ' ' + (extra || ''));
      cards.forEach(function(card) {
        var haystack = text([
          card.getAttribute('data-title'),
          card.getAttribute('data-meta'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' '));
        card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    }

    filterInput.addEventListener('input', function() {
      chips.forEach(function(chip) {
        chip.classList.remove('active');
      });
      applyFilter('');
    });

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        chips.forEach(function(item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        filterInput.value = chip.getAttribute('data-filter-chip') || '';
        applyFilter('');
      });
    });

    applyFilter('');
  }
})();
