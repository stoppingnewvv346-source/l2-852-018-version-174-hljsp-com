(function () {
  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });
    show(0);
    play();
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search"));
    if (!inputs.length || !window.MOVIE_INDEX) {
      return;
    }

    inputs.forEach(function (input) {
      var wrap = input.parentElement;
      var box = wrap ? wrap.querySelector(".global-search-results") : null;
      if (!box) {
        return;
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          box.classList.remove("is-open");
          box.innerHTML = "";
          return;
        }
        var results = window.MOVIE_INDEX.filter(function (movie) {
          return movie.search.indexOf(query) !== -1;
        }).slice(0, 12);
        if (!results.length) {
          box.innerHTML = '<div class="empty-state is-visible">没有找到匹配影片</div>';
          box.classList.add("is-open");
          return;
        }
        box.innerHTML = results.map(function (movie) {
          return '<a class="search-result-link" href="./' + movie.file + '">' +
            '<img src="./' + movie.cover + '.jpg" alt="' + escapeHTML(movie.title) + '" onerror="this.classList.add(\'is-missing\')">' +
            '<span><strong>' + escapeHTML(movie.title) + '</strong>' +
            '<span>' + escapeHTML(movie.year) + ' · ' + escapeHTML(movie.type) + ' · ' + escapeHTML(movie.genre) + '</span></span></a>';
        }).join("");
        box.classList.add("is-open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          var first = box.querySelector("a");
          if (first) {
            window.location.href = first.getAttribute("href");
          }
        }
      });
      document.addEventListener("click", function (event) {
        if (!wrap.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var grid = document.querySelector(panel.getAttribute("data-target"));
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var empty = document.querySelector(panel.getAttribute("data-empty"));
      var keyword = panel.querySelector(".listing-search");
      var year = panel.querySelector(".filter-year");
      var type = panel.querySelector(".filter-type");
      var genre = panel.querySelector(".filter-genre");

      function run() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var g = genre ? genre.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var hay = [card.dataset.title, card.dataset.year, card.dataset.type, card.dataset.genre, card.dataset.tags, card.dataset.category].join(" ").toLowerCase();
          var ok = true;
          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }
          if (g && hay.indexOf(g.toLowerCase()) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, year, type, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", run);
          control.addEventListener("change", run);
        }
      });
      run();
    });
  }

  window.initializeMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initImages();
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initFilters();
  });
})();
