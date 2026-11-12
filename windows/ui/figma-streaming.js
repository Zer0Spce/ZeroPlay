/* Figma Streaming UI (Test) — ZeroPlay Windows desktop implementation.
   Based on Figma file XpbbpluD5CBaKu9nNV6Fm6, first Desktop frame 6445:5383.
   Layout only: all playback, profiles, settings and sources remain in the existing app. */
(() => {
  'use strict';
  const discovery = window.ZeroFigmaDiscovery;
  const PREFIX = 'zeroplay-figma-streaming-v1:';
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  let generation = 0, activeHero = null, currentSeasons = [], activeSeason = 1;
  let activeProfile = 'Default';

  const encoded = text => escape(text == null ? '' : text);
  const identity = discovery.id;
  function profileKey() {
    return String(state?.activeProfile || 'Default').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 70);
  }
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function cycleInfo(manual) {
    const base = Math.floor(Date.now() / SIX_HOURS);
    const key = PREFIX + activeProfile + ':rotation';
    const old = read(key, { base, bump: 0 });
    const bump = old.base !== base ? 0 : (manual ? Number(old.bump || 0) + 1 : Number(old.bump || 0));
    write(key, { base, bump });
    return { base, bump, seed: String(base) + ':' + bump + ':' + activeProfile };
  }
  function historySeen(seed) {
    const seen = discovery.cleanSeen(read(PREFIX + activeProfile + ':seen', {}), Date.now());
    const last = read(PREFIX + activeProfile + ':last', {});
    // The same six-hour cycle must not visibly reshuffle when returning from a detail page.
    if (last.seed === seed) for (const id of last.ids || []) delete seen[id];
    return seen;
  }
  function recordExposure(seed, chosen) {
    const seen = discovery.cleanSeen(read(PREFIX + activeProfile + ':seen', {}), Date.now());
    const values = [chosen.hero, ...Object.values(chosen.rails).flat()].filter(Boolean);
    const ids = values.map(identity);
    // Store one exposure for each unique title. IDs are scoped to this local ZeroPlay profile.
    for (const id of ids) seen[id] = Date.now();
    write(PREFIX + activeProfile + ':seen', seen);
    write(PREFIX + activeProfile + ':last', { seed, ids });
  }

  function heroMarkup(item) {
    const id = identity(item);
    const year = String(item.date || '').slice(0,4);
    const isTv = item.type === 'tv';
    const seasonsLabel = isTv ? '<span id="figma-hero-season-count">Series</span>' : '<span>Movie</span>';
    const tags = isTv ? 'TV SERIES' : 'MOVIE';
    const favorited = (state.favorites || []).some(x => identity(x) === id);
    return '<div class="figma-featured">' +
      (item.backdrop ? '<img class="figma-hero-art" src="' + encoded(item.backdrop) + '" alt="">' : '') +
      '<div class="figma-image-shade"></div>' +
      '<div class="figma-hero-copy">' +
      '<div class="figma-original"><span class="figma-original-symbol">Z</span>' +
      '<b>ZeroPlay</b><span class="figma-original-secondary">FEATURED</span></div>' +
      '<h1>' + encoded(item.title) + '</h1>' +
      '<div class="figma-hero-meta"><b>' + encoded(year || 'Featured') + '</b>' +
      seasonsLabel + '<span class="figma-genre-chip">' + tags + '</span>' +
      (Number(item.rating) > 0 ? '<span class="figma-stars" aria-label="TMDB rating">★</span>' +
      '<b>' + Number(item.rating).toFixed(1) + '</b>' : '') + '</div>' +
      '<p class="figma-synopsis">' + encoded(item.overview || 'Discover a new story with ZeroPlay.') + '</p>' +
      '<div class="figma-featured-actions">' +
      '<button class="figma-play-btn" data-play="' + encoded(id) + '">▶ <span>Play Now</span></button>' +
      '<button class="figma-round-btn" data-favorite="' + encoded(id) + '" aria-label="' + (favorited ? 'Remove from list' : 'Add to my list') + '">' +
      (favorited ? '✓' : '+') + '</button>' +
      '<button class="figma-round-btn" data-detail="' + encoded(id) + '" aria-label="More information">ⓘ</button>' +
      '</div></div></div>';
  }

  function topbar() {
    return '<header class="figma-topbar">' +
      '<nav class="figma-nav" aria-label="ZeroPlay navigation">' +
      '<button class="active" data-nav="Home">Home</button>' +
      '<button data-nav="Movies">Browse</button>' +
      '<button data-nav="Series">TV Series</button>' +
      '<button data-action="anime">Anime</button>' +
      '<button data-nav="LiveTV">Live PPV</button>' +
      '<button data-nav="IPTV">Live TV</button>' +
      '<button data-nav="Live Sports">Sports</button>' +
      '</nav><div class="figma-top-actions">' +
      '<button class="figma-top-circle" data-nav="Search" aria-label="Search">⌕</button>' +
      '<button class="figma-top-circle" data-nav="Library" aria-label="My library">♧</button>' +
      '<button class="figma-top-avatar" data-action="settings" aria-label="Settings and profile">Z</button>' +
      '</div></header>';
  }

  function landscapeCard(item) {
    const id = identity(item);
    const source = item.backdrop || item.poster;
    return '<button class="figma-landscape-card" data-detail="' + encoded(id) + '" ' +
      'aria-label="Details for ' + encoded(item.title) + '">' +
      '<img src="' + encoded(source) + '" loading="lazy" decoding="async" alt="">' +
      '<span class="figma-card-gradient"></span>' +
      '<span class="figma-card-logo" aria-hidden="true">Z</span>' +
      '<strong>' + encoded(item.title) + '</strong></button>';
  }

  function rail(name, items) {
    if (!items || !items.length) return '';
    return '<section class="figma-content-row"><div class="figma-row-heading">' +
      '<h2>' + encoded(name) + '</h2>' +
      (name === 'Fresh Picks For You' ? '<button class="figma-refresh-btn" data-figma-refresh>↻ Refresh Picks</button>' : '') +
      '</div><div class="figma-carousel" role="group" aria-label="' + encoded(name) + '">' +
      items.map(landscapeCard).join('') + '</div></section>';
  }

  function episodesMarkup(episodes, season) {
    const id = identity(activeHero);
    const position = state.positions?.[id] || {};
    return (episodes || []).filter(ep => Number(ep.episode_number) > 0).slice(0,24).map(ep => {
      const num = Number(ep.episode_number);
      const img = art(ep.still_path, 'w500') || activeHero.backdrop || activeHero.poster;
      const progress = Number(position.season) === season && Number(position.episode) === num ?
        Number(position.percent) || 0 : 0;
      return '<button class="figma-landscape-card figma-episode-card" data-play="' + encoded(id) +
        '" data-season="' + season + '" data-episode="' + num + '"' +
        ' aria-label="Play season ' + season + ' episode ' + num + ': ' + encoded(ep.name || '') + '">' +
        '<img src="' + encoded(img) + '" loading="lazy" decoding="async" alt="">' +
        '<span class="figma-card-gradient"></span><span class="figma-card-logo" aria-hidden="true">Z</span>' +
        '<strong>Episode ' + num + ': ' + encoded(ep.name || 'Untitled') + '</strong>' +
        (progress > 0 && progress < 95 ? '<span class="figma-ep-progress"><i style="width:' +
          Math.min(100,Math.max(0,progress)) + '%"></i></span>' : '') +
        '</button>';
    }).join('');
  }

  function seasonTabs() {
    if (!activeHero || activeHero.type !== 'tv') return;
    const seasonHost = document.querySelector('#figma-seasons');
    if (!seasonHost) return;
    const real = currentSeasons.filter(x => Number(x.season_number) > 0 && Number(x.episode_count) > 0);
    if (!real.length) {
      seasonHost.innerHTML = '';
      document.querySelector('#figma-season-block')?.remove();
      return;
    }
    seasonHost.innerHTML = real.slice(0,15).map(s =>
      '<button data-figma-season="' + Number(s.season_number) + '"' +
      (Number(s.season_number) === activeSeason ? ' class="selected"' : '') +
      '>Season ' + Number(s.season_number) + '</button>').join('');
  }

  async function loadSeason(season, token = generation) {
    if (!activeHero || activeHero.type !== 'tv') return;
    const current = activeHero;
    const seasonNumber = Number(season);
    if (!Number.isInteger(seasonNumber) || seasonNumber < 1 || seasonNumber > 99) return;
    activeSeason = seasonNumber;
    seasonTabs();
    const body = document.querySelector('#figma-episodes');
    if (!body) return;
    body.innerHTML = '<div class="figma-episode-message">Loading episodes…</div>';
    try {
      const data = await api('/tv/' + current.id + '/season/' + seasonNumber);
      if (token !== generation || current !== activeHero || activeSeason !== seasonNumber ||
          document.documentElement.dataset.layout !== 'figma-streaming') return;
      body.innerHTML = episodesMarkup(data.episodes, seasonNumber) ||
        '<p class="figma-episode-message">Episode artwork is not available.</p>';
    } catch (error) {
      if (token === generation && body.isConnected) body.innerHTML =
        '<p class="figma-episode-message">Episodes are temporarily unavailable.</p>';
    }
  }

  async function loadSeriesInfo(token = generation) {
    if (activeHero?.type !== 'tv') return;
    const current = activeHero;
    try {
      const detail = await api('/tv/' + current.id);
      if (token !== generation || current !== activeHero) return;
      currentSeasons = detail.seasons || [];
      const count = currentSeasons.filter(x => Number(x.season_number) > 0 && Number(x.episode_count) > 0).length;
      const label = document.querySelector('#figma-hero-season-count');
      if (label) label.textContent = count + (count === 1 ? ' Season' : ' Seasons');
      const available = currentSeasons.filter(x => Number(x.season_number) > 0 && Number(x.episode_count) > 0);
      activeSeason = available[0]?.season_number || 1;
      seasonTabs();
      if (available.length) await loadSeason(activeSeason, token);
    } catch (error) {
      if (token === generation) document.querySelector('#figma-season-block')?.remove();
    }
  }

  function updateFavorites() {
    if (!activeHero || document.documentElement.dataset.layout !== 'figma-streaming') return;
    const button = document.querySelector('.figma-hero-copy [data-favorite]');
    if (!button) return;
    const selected = (state.favorites || []).some(x => identity(x) === identity(activeHero));
    button.textContent = selected ? '✓' : '+';
    button.setAttribute('aria-label', selected ? 'Remove from list' : 'Add to my list');
  }

  async function render({ fresh = false, token } = {}) {
    const own = ++generation;
    activeProfile = profileKey();
    const cycle = cycleInfo(false);
    const offset = (base, count) => base + (cycle.bump + cycle.base) % count;
    const queries = [
      ['day','/trending/all/day', { page: 1 }, null],
      ['day','/trending/all/day', { page: 2 }, null],
      ['week','/trending/all/week',{ page: offset(1,4) },null],
      ['week','/trending/all/week',{ page: 1 },null],
      ['tv','/tv/popular',{ page: offset(1,4) },'tv'],
      ['tv','/tv/popular',{ page: 1 },'tv'],
      ['movies','/movie/popular',{ page: offset(1,5) },'movie'],
      ['movies','/movie/popular',{ page: 1 },'movie'],
      ['now','/movie/now_playing',{ page: 1 },'movie'],
      ['rated','/movie/top_rated',{ page: offset(1,5) },'movie'],
      ['gems','/discover/movie',{
        sort_by:'vote_average.desc','vote_count.gte':120,'vote_average.gte':6.8,page:offset(1,5)
      },'movie'],
      ['classics','/discover/movie',{
        sort_by:'vote_count.desc','primary_release_date.lte':new Date().getFullYear()-8+'-12-31',
        page:offset(1,4)
      },'movie']
    ];
    const genre = (state.history || []).find(x => (x.genreIds || []).length)?.genreIds?.[0];
    if (genre) queries.push(['similar','/discover/movie',{
      with_genres:String(genre),sort_by:'popularity.desc',page:offset(1,3)
    },'movie']);
    const answers = await Promise.allSettled(queries.map(async ([kind,path,params,type]) =>
      ({ kind, items:list(await api(path,params,fresh),type) })));
    if (token !== request || own !== generation ||
        state.settings.uiLayout !== 'figma-streaming' || category !== 'Home') return;
    const pools = {};
    for (const answer of answers) if (answer.status === 'fulfilled') {
      const { kind,items } = answer.value;
      (pools[kind] ||= []).push(...items);
    }
    if (!Object.keys(pools).length) {
      $('#content').innerHTML = empty('Discovery is unavailable','Check your TMDB connection and try Refresh.');
      status('TMDB catalog unavailable');
      return;
    }
    const chosen = discovery.prepare({
      pools, seen: historySeen(cycle.seed), history: state.history || [],
      positions: state.positions || {}, hidden: state.notInterested || [],
      seed:cycle.seed, perRail:16
    });
    if (!chosen.hero) {
      $('#content').innerHTML = empty('No movies found','Try another region or refresh the catalog.');
      return;
    }
    activeHero = chosen.hero;
    currentSeasons = [];
    activeSeason = 1;
    const shelves = Object.entries(chosen.rails).filter(([,values]) => values.length);
    const isSeries = activeHero.type === 'tv';
    $('#content').innerHTML = '<div class="figma-screen">' +
      '<div class="figma-hero-area">' + heroMarkup(activeHero) + topbar() + '</div>' +
      (isSeries ? '<section class="figma-content-row figma-season-block" id="figma-season-block">' +
        '<div class="figma-season-tabs" id="figma-seasons"></div>' +
        '<div class="figma-carousel" id="figma-episodes" role="group" aria-label="Episodes">' +
        '<p class="figma-episode-message">Loading seasons…</p></div></section>' : '') +
      shelves.map(([name,items]) => rail(name,items)).join('') +
      '</div>';
    recordExposure(cycle.seed,chosen);
    status('Figma Streaming UI · real TMDB content · '+chosen.uniqueCount+' distinct recommendations');
    clearInterval(heroTimer);
    if (isSeries) loadSeriesInfo(own);
  }

  document.addEventListener('click', event => {
    const refresh = event.target.closest?.('[data-figma-refresh]');
    const season = event.target.closest?.('[data-figma-season]');
    if (!refresh && !season) return;
    event.preventDefault();event.stopImmediatePropagation();
    if (refresh) {
      cycleInfo(true);
      busy();
      render({ fresh:true,token:++request }).catch(error => {
        $('#content').innerHTML = empty('Unable to refresh recommendations',error.message || 'Try again.');
      });
    } else {
      loadSeason(Number(season.dataset.figmaSeason)).catch(() => {});
    }
  },true);

  window.zeroFigmaStreaming = {render,loadSeason,updateFavorites};
})();
