'use strict';
(() => {
  const video = document.getElementById('media');
  let player = null;
  let seq = 0;
  const notify = (name, detail = '') => {
    if (window.ZeroPpvBridge) window.ZeroPpvBridge.state(String(name), String(detail).slice(0,80));
  };
  function errorText(error) {
    const e = error && error.detail ? error.detail : error;
    if (!e) return 'Unknown browser error';
    if (e.message === 'WebView cannot play adaptive video' || e.message === 'Shaka library unavailable') return e.message;
    const code = Number(e.code);
    const category = Number(e.category);
    if (Number.isFinite(code) && code > 0) return 'Shaka ' + code + (Number.isFinite(category) ? ' · category ' + category : '');
    return e.name === 'NotAllowedError' ? 'Playback permission needed' : 'Browser playback error';
  }
  async function createPlayer() {
    if (player) return player;
    if (!window.shaka || !shaka.Player) throw new Error('Shaka library unavailable');
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) throw new Error('WebView cannot play adaptive video');
    player = new shaka.Player();
    await player.attach(video);
    const retry = {timeout:30000,stallTimeout:15000,connectionTimeout:15000,maxAttempts:3,baseDelay:1000,backoffFactor:2,fuzzFactor:.3};
    player.configure({streaming:{retryParameters:retry},manifest:{retryParameters:retry}});
    player.addEventListener('error', e => { if (e.detail && !e.detail.handled) notify('error', errorText(e)); });
    return player;
  }
  video.addEventListener('playing',()=>notify('playing'));
  video.addEventListener('waiting',()=>notify('buffering'));
  video.addEventListener('stalled',()=>notify('buffering'));
  video.addEventListener('pause',()=>notify('paused'));
  video.addEventListener('error',()=>notify('error','HTML5 media decoder'));
  window.ZeroPpv = {
    async load(url, mime) {
      const task = ++seq;
      notify('buffering');
      try {
        const instance = await createPlayer();
        if (task !== seq) return;
        await instance.unload();
        if (task !== seq) return;
        // WebView does not provide Electron's network interception or CORS overrides.
        // Browser security and provider authentication requirements are preserved.
        await instance.load(url, null, mime || undefined);
        if (task !== seq) return;
        try { await video.play(); } catch(error) { notify('error',errorText(error)); }
      } catch (error) {
        if (task === seq) notify('error',errorText(error));
      }
    },
    play() { video.play().catch(error => notify('error',errorText(error))); },
    pause() { video.pause(); },
    live() { if (player) { const range = player.seekRange(); if (range && Number.isFinite(range.end)) video.currentTime = range.end; } video.play().catch(()=>{}); },
    fit() { video.style.objectFit = video.style.objectFit === 'cover' ? 'contain' : 'cover'; },
    stop() { ++seq; video.pause(); if (player) player.unload().catch(()=>{}); },
    tracks(kind) {
      if (!player) { notify('tracks', 'No available tracks'); return; }
      const collection = kind === 'audio' ? player.getAudioTracks() : player.getTextTracks();
      const labels = collection.map(t => (t.label || t.language || 'Track')).slice(0,8);
      notify('tracks', labels.join(' | ') || 'No alternate tracks');
    },
  };
  notify('ready');
})();
