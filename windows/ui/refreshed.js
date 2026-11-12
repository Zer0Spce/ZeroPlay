/* ZeroPlay Refreshed — real Windows homepage, no placeholder movies. */
(() => {
  'use strict';
  const discovery = window.ZeroRefreshedDiscovery;
  const keyPrefix = 'zeroplay-refreshed-v1:';
  let generation = 0, slides = [], slide = 0, activeProfile = 'Default';

  function profileName() {
    return String(state?.activeProfile || 'Default').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  }
  function readJSON(storageKey, fallback) {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null') || fallback; }
    catch { return fallback; }
  }
  function rotateSeed() {
    const k = keyPrefix + activeProfile + ':cycle';
    const next = (Number(localStorage.getItem(k)) || 0) + 1;
    localStorage.setItem(k, String(next));
    return new Date().toISOString().slice(0, 10) + ':' + next + ':' + activeProfile;
  }
  function filteredProfileSeen() {
    return discovery.pruneSeen(readJSON(keyPrefix + activeProfile + ':seen', {}), Date.now());
  }
  function saveExposures(rows, hero) {
    const seen = filteredProfileSeen(), now = Date.now();
    for (const item of hero) seen[discovery.identity(item)] = now;
    for (const items of Object.values(rows)) {
      for (const item of items.slice(0, 8)) seen[discovery.identity(item)] = now;
    }
    try { localStorage.setItem(keyPrefix + activeProfile + ':seen', JSON.stringify(seen)); } catch {}
  }
  function poster(item) {
    const id = discovery.identity(item);
    return '<button type="button" class="card refreshed-poster" data-detail="' + escape(id) +
      '" data-card-key="' + escape(id) + '" aria-label="More about ' + escape(item.title) + '">' +
      '<span class="refreshed-poster-art"><img src="' + escape(item.poster) +
      '" alt="" loading="lazy" decoding="async"><span class="refreshed-poster-caption">' +
      escape(item.title) + '</span></span></button>';
  }
  function shelf(label, items) {
    if (!items?.length) return '';
    const icon = {
      'Fresh Picks For You': '✦', 'Trending Now': '↗', 'Hidden Gems': '◇',
      'Because You Watched': '▶', 'New & Noteworthy': '✧',
      "Tonight's Picks": '☾', 'Rediscover Classics': '★'
    }[label] || '✦';
    const shuffle = label === 'Fresh Picks For You' ?
      '<button type="button" class="refreshed-refresh" data-refreshed-refresh>⤨ Refresh Picks</button>' : '';
    return '<section class="row-section refreshed-shelf"><div class="section-head"><h3><span class="refreshed-icon" aria-hidden="true">' +
      icon + '</span>' + escape(label) + '</h3>' + shuffle + '</div><div class="cards refreshed-posters" role="group" aria-label="' +
      escape(label) + '">' + items.map(poster).join('') + '</div></section>';
  }
  function heroHTML() {
    const item = slides[slide];
    if (!item) return '';
    const id = discovery.identity(item);
    const year = escape(String(item.date || '').slice(0, 4) || 'Featured');
    const rating = item.rating ? ' <span class="refreshed-rating">★ ' + Number(item.rating).toFixed(1) + '</span>' : '';
    const inList = (state?.favorites || []).some(row => discovery.identity(row) === id);
    return '<section class="hero refreshed-hero" id="hero" data-featured="' + escape(id) + '" aria-label="Featured movie">' +
      (item.backdrop ? '<img class="hero-art" src="' + escape(item.backdrop) + '" alt="">' : '') +
      '<div class="hero-shade"></div><div class="hero-content"><div class="eyebrow">FEATURED ON ZEROPLAY</div>' +
      '<div class="detail-heading"><h2>' + escape(item.title) + '</h2></div>' +
      '<div class="refreshed-meta">' + year + rating + '<span class="refreshed-meta-pill">' +
      (item.type === 'tv' ? 'TV SERIES' : 'MOVIE') + '</span></div>' +
      '<p>' + escape(item.overview || 'Discover something worth watching.') + '</p>' +
      '<div class="actions"><button class="primary" data-play="' + escape(id) + '">▶ Watch Now</button>' +
      '<button data-detail="' + escape(id) + '">More Info</button>' +
      '<button data-favorite="' + escape(id) + '">' + (inList ? '✓ My List' : '+ My List') +
      '</button></div></div><div class="refreshed-slide-controls">' +
      '<button type="button" data-refreshed-hero="prev" aria-label="Previous featured title">‹</button>' +
      slides.map((_, index) => '<button type="button" data-refreshed-hero="' + index +
      '" class="refreshed-dot' + (slide === index ? ' active' : '') +
      '" aria-label="Featured title ' + (index + 1) + '" aria-current="' + (slide === index) + '"></button>').join('') +
      '<button type="button" data-refreshed-hero="next" aria-label="Next featured title">›</button></div></section>';
  }
  function redrawHero() {
    const node = document.querySelector('#hero');
    if (!node || document.documentElement.dataset.layout !== 'refreshed') return;
    node.outerHTML = heroHTML();
  }
  function changeSlide(value) {
    if (!slides.length) return;
    slide = value === 'next' ? (slide + 1) % slides.length :
      value === 'prev' ? (slide + slides.length - 1) % slides.length :
      Math.max(0, Math.min(slides.length - 1, Number(value) || 0));
    redrawHero();
  }

  async function render({ fresh = false, token } = {}) {
    const current = ++generation;
    activeProfile = profileName();
    const seed = rotateSeed();
    const cycle = Number(seed.split(':')[1]) || 1;
    const offsetPage = (base, range) => base + cycle % range;
    const history = state.history || [];
    const lastWithGenres = history.find(item => item?.genreIds?.length);
    const year = new Date().getFullYear();
    const sources = [
      ['daily', '/trending/all/day', {}, null],
      ['daily', '/trending/all/day', { page: 2 }, null],
      ['weekly', '/trending/all/week', {}, null],
      ['weekly', '/trending/all/week', { page: offsetPage(2, 4) }, null],
      ['popular', '/movie/popular', { page: offsetPage(1, 5) }, 'movie'],
      ['popular', '/movie/popular', { page: 1 }, 'movie'],
      ['top', '/movie/top_rated', { page: offsetPage(1, 5) }, 'movie'],
      ['top', '/movie/top_rated', { page: 1 }, 'movie'],
      ['now', '/movie/now_playing', {}, 'movie'],
      ['series', '/tv/popular', { page: offsetPage(1, 3) }, 'tv'],
      ['gems', '/discover/movie', { sort_by: 'vote_average.desc', 'vote_count.gte': 150, 'vote_average.gte': 6.8, page: offsetPage(1, 4) }, 'movie'],
      ['classics', '/discover/movie', { sort_by: 'vote_count.desc', 'primary_release_date.lte': (year - 8) + '-12-31', page: offsetPage(1, 4) }, 'movie']
    ];
    if (lastWithGenres) sources.push(['similar', '/discover/' + (lastWithGenres.type === 'tv' ? 'tv' : 'movie'), {
      with_genres: String(lastWithGenres.genreIds[0]), sort_by: 'popularity.desc', page: offsetPage(1, 3)
    }, lastWithGenres.type === 'tv' ? 'tv' : 'movie']);

    const settled = await Promise.allSettled(sources.map(async ([bucket, path, params, type]) =>
      ({ bucket, items: list(await api(path, params, fresh), type) })));
    if (token !== request || current !== generation ||
        document.documentElement.dataset.layout !== 'refreshed' || category !== 'Home') return;
    const pools = {};
    for (const result of settled) if (result.status === 'fulfilled') {
      const { bucket, items } = result.value;
      (pools[bucket] ||= []).push(...items);
    }
    if (!Object.keys(pools).length) {
      $('#content').innerHTML = empty('The catalog is unavailable', 'Check the TMDB connection, then try Refresh.');
      status('Could not load movie recommendations');
      return;
    }

    const selected = discovery.curate({
      pools, history, positions: state.positions, hidden: state.notInterested,
      seen: filteredProfileSeen(), seed, now: Date.now(), perRow: 16
    });
    const rows = selected.rows;
    // Featured carousel is excluded from the visible shelves: no duplicate title on the same screen.
    const heroCandidates = [...(rows['Fresh Picks For You'] || []), ...(rows['Trending Now'] || [])];
    slides = heroCandidates.slice(0, 5);
    const slideIds = new Set(slides.map(discovery.identity));
    for (const [name, items] of Object.entries(rows)) rows[name] = items.filter(item => !slideIds.has(discovery.identity(item)));
    slide = 0;

    $('#content').innerHTML = '<div class="refreshed-home">' + heroHTML() +
      Object.entries(rows).map(([name, items]) => shelf(name, items)).join('') + '</div>';
    status('ZeroPlay Refreshed · ' + selected.candidates + ' distinct TMDB titles considered');
    saveExposures(rows, slides);
    clearInterval(heroTimer);
    if (slides.length > 1 && state.settings.uiAnimations !== false && !state.settings.performanceMode) {
      heroTimer = setInterval(() => {
        if (category === 'Home' && !document.hidden && !document.querySelector('dialog[open]') &&
            !document.querySelector('#hero:focus-within')) changeSlide('next');
      }, 15000);
    }
  }

  document.addEventListener('click', event => {
    const refreshButton = event.target.closest?.('[data-refreshed-refresh]');
    const carouselButton = event.target.closest?.('[data-refreshed-hero]');
    if (!refreshButton && !carouselButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (refreshButton) {
      busy();
      render({ fresh: true, token: ++request }).catch(error => {
        $('#content').innerHTML = empty('Unable to refresh recommendations', error.message || 'Try again.');
      });
    } else changeSlide(carouselButton.dataset.refreshedHero);
  }, true);

  window.zeroRefreshed = { render, redrawHero, changeSlide };
})();
