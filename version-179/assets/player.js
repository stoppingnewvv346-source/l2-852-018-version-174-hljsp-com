function initMoviePlayer(streamUrl) {
  var shell = document.querySelector('.player-shell');
  var video = document.querySelector('.movie-video');
  var button = document.querySelector('.player-start');
  var hls = null;
  var attached = false;

  if (!shell || !video || !button || !streamUrl) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    shell.classList.add('is-playing');
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function() {});
    }
  }

  button.addEventListener('click', function(event) {
    event.preventDefault();
    play();
  });

  video.addEventListener('click', function() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function() {
    shell.classList.add('is-playing');
  });

  window.addEventListener('pagehide', function() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
