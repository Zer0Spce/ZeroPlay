/* ZeroPlay Refreshed discovery selection. Pure UMD module for Node regression tests. */
(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.ZeroRefreshedDiscovery = engine;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000;
  const identity = item => item.type + ':' + item.id;

  function hash(value) {
    let x = 2166136261;
    for (let i = 0; i < value.length; i++) {
      x ^= value.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return x >>> 0;
  }

  function curate(options) {
    const opts = options || {};
    const pools = opts.pools || {};
    const now = Number(opts.now) || Date.now();
    const seen = opts.seen || {};
    const recentThreshold = now - 14 * DAY;
    const hidden = new Set(opts.hidden || []);
    const watched = new Set(Object.keys(opts.positions || {}));
    const seed = String(opts.seed || 'default');
    const rows = {};
    const used = new Set();
    const maxPerRow = Math.max(4, Math.min(24, Number(opts.perRow) || 16));
    const canonical = new Map();

    for (const data of Object.values(pools)) {
      for (const item of Array.isArray(data) ? data : []) {
        if (!item || !['movie', 'tv'].includes(item.type) || !item.id || !item.poster) continue;
        if (item.date && item.date > new Date(now).toISOString().slice(0, 10)) continue;
        const id = identity(item);
        if (hidden.has(id) || watched.has(id)) continue;
        if (!canonical.has(id)) canonical.set(id, item);
      }
    }

    function candidates(names, predicate) {
      const ids = new Set();
      const output = [];
      for (const name of names) {
        for (const item of pools[name] || []) {
          if (!item) continue;
          const id = identity(item);
          if (ids.has(id) || !canonical.has(id)) continue;
          const value = canonical.get(id);
          if (predicate && !predicate(value)) continue;
          ids.add(id);
          output.push(value);
        }
      }
      return output;
    }

    function take(label, names, predicate) {
      const all = candidates(names, predicate).filter(item => !used.has(identity(item)));
      // Stable randomized order per refresh cycle; quality is a mild preference, not a fixed ranking.
      const weight = item => hash(identity(item) + ':' + seed + ':' + label) / 4294967295 +
        Math.min(0.12, Math.max(0, Number(item.rating) - 6) * 0.018);
      all.sort((a, b) => weight(b) - weight(a));
      const fresh = all.filter(item => !(Number(seen[identity(item)]) >= recentThreshold));
      const old = all.filter(item => Number(seen[identity(item)]) >= recentThreshold);
      // Only reintroduce recently exposed movies when the catalog cannot fill the shelf.
      const picked = fresh.concat(old).slice(0, maxPerRow);
      for (const item of picked) used.add(identity(item));
      rows[label] = picked;
    }

    const histGenres = new Set((opts.history || []).slice(0, 20)
      .flatMap(item => Array.isArray(item.genreIds) ? item.genreIds : []));
    const recentCutoff = new Date(now - 30 * DAY).toISOString().slice(0, 10);
    take('Fresh Picks For You', ['weekly', 'daily', 'popular', 'now', 'classics', 'top']);
    take('Trending Now', ['daily', 'weekly', 'series', 'popular']);
    take('Hidden Gems', ['gems', 'classics', 'top'], item =>
      Number(item.rating) >= 6.7 && Number(item.voteCount) >= 60 &&
      Number(item.popularity) < 250);
    if (histGenres.size) {
      take('Because You Watched', ['similar', 'weekly', 'popular', 'top'], item =>
        (item.genreIds || []).some(id => histGenres.has(id)));
    }
    take('New & Noteworthy', ['now', 'daily', 'weekly', 'series'], item =>
      Boolean(item.date && item.date >= recentCutoff));
    take("Tonight's Picks", ['top', 'gems', 'popular', 'classics', 'weekly'], item =>
      Number(item.rating) >= 6.5);
    take('Rediscover Classics', ['classics', 'top'], item =>
      Number(String(item.date || '').slice(0, 4)) > 0 &&
      Number(String(item.date || '').slice(0, 4)) <= new Date(now).getFullYear() - 8);

    return { rows, used: [...used], candidates: canonical.size };
  }

  function pruneSeen(seen, now) {
    const cutoff = now - 30 * DAY;
    return Object.fromEntries(Object.entries(seen || {})
      .filter(([key, value]) => /^(movie|tv):\d+$/.test(key) && Number(value) > cutoff)
      .slice(-1000));
  }
  return Object.freeze({ curate, hash, pruneSeen, identity, DAY });
});
