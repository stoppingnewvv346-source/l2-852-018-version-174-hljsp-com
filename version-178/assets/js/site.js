(function() {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function textValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-menu-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  selectAll("[data-site-search]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  selectAll("[data-hero]").forEach(function(hero) {
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  function filterGrid(root, query, category) {
    var cards = selectAll("[data-movie-card]", root);
    var q = textValue(query);
    var selected = category || "all";

    cards.forEach(function(card) {
      var haystack = textValue([
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.textContent
      ].join(" "));
      var cardCategory = card.getAttribute("data-category") || "";
      var matchText = !q || haystack.indexOf(q) !== -1;
      var matchCategory = selected === "all" || cardCategory === selected;
      card.classList.toggle("is-hidden", !(matchText && matchCategory));
    });
  }

  selectAll("[data-filter-grid]").forEach(function(grid) {
    var container = grid.closest("section") || document;
    var input = container.querySelector("[data-grid-search]");
    var chips = selectAll("[data-category-chip]", container);
    var category = "all";

    if (input && input.hasAttribute("data-query-sync")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      input.value = q;
      filterGrid(grid, q, category);
    }

    if (input) {
      input.addEventListener("input", function() {
        filterGrid(grid, input.value, category);
      });
    }

    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chips.forEach(function(item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        category = chip.getAttribute("data-category-chip") || "all";
        filterGrid(grid, input ? input.value : "", category);
      });
    });
  });
}());
