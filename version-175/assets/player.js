function startMoviePlayer(video, button, overlay, mediaUrl) {
  if (!video || !mediaUrl) {
    return;
  }

  var loaded = false;
  var hlsInstance = null;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function playVideo() {
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  function loadMedia() {
    if (loaded) {
      playVideo();
      return;
    }
    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
          video.src = mediaUrl;
          playVideo();
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      playVideo();
      return;
    }

    video.src = mediaUrl;
    playVideo();
  }

  function begin() {
    hideOverlay();
    loadMedia();
  }

  if (button) {
    button.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
