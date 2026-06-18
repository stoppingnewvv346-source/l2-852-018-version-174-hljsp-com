(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        activate(current);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    if (!form) {
      return;
    }
    var input = form.querySelector("[data-search-input]");
    var regionSelect = form.querySelector("[data-region-select]");
    var typeSelect = form.querySelector("[data-type-select]");
    var categorySelect = form.querySelector("[data-category-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function getText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" "));
    }

    function applyFilter() {
      var query = normalize(input && input.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = getText(card);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
        var matchType = !type || normalize(card.getAttribute("data-type")) === type;
        var matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
        var show = matchQuery && matchRegion && matchType && matchCategory;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, regionSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var layer = shell.querySelector("[data-layer]");
    var playButton = shell.querySelector("[data-play]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    if (layer) {
      layer.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
