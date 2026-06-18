(function () {
  function attachPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-player-cover]');
    var playButtons = Array.prototype.slice.call(box.querySelectorAll('[data-player-play]'));
    var muteButton = box.querySelector('[data-player-mute]');
    var fullButton = box.querySelector('[data-player-fullscreen]');
    var message = box.querySelector('[data-player-message]');
    var stream = box.getAttribute('data-stream');
    var hls = null;
    var attached = false;
    var pendingPlay = false;

    if (!video || !stream) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-visible');
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            video.play().catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频加载失败，请稍后重试');
          }
        });
        return;
      }

      showMessage('当前浏览器无法播放该视频');
    }

    function startPlayback() {
      pendingPlay = true;
      attachStream();
      if (video.src || video.currentSrc) {
        video.play().catch(function () {});
      }
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        togglePlayback();
      });
    });

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
      if (cover) {
        cover.classList.add('is-hidden');
      }
      playButtons.forEach(function (button) {
        button.textContent = '❚❚';
      });
    });
    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
      playButtons.forEach(function (button) {
        button.textContent = '▶';
      });
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (box.requestFullscreen) {
          box.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-video-player]')).forEach(attachPlayer);
})();
