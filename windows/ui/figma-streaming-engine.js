/* ZeroPlay x Figma discovery engine — immutable, testable, no production side effects. */
((scope, factory) => {
  const exported = factory();
  if (typeof module === 'object' && module.exports) module.exports = exported;
  else scope.ZeroFigmaDiscovery = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  const DAY = 24 * 60 * 60 * 1000;
  const id = item => String(item.type) + ':' + String(item.id);
  function hash(text) {
    let h = 2166136261;
    for (const char of String(text)) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function prepare({ pools = {}, seen = {}, history = [], positions = {}, hidden = [],
    now = Date.now(), seed = '', perRail = 16 } = {}) {
    const seenCutoff = now - 14 * DAY;
    const excluded = new Set(hidden);
    const watched = new Set(Object.keys(positions).filter(k => /^(movie|tv):\d+$/.test(k)));
    const distinct = new Map();
    for (const group of Object.values(pools)) {
      for (const item of group || []) {
        if (!item || !['movie', 'tv'].includes(item.type) || !item.id || !item.poster ||
            !item.backdrop && !item.poster || item.date > new Date(now).toISOString().slice(0, 10)) continue;
        const k = id(item);
        if (!excluded.has(k) && !watched.has(k) && !distinct.has(k)) distinct.set(k, item);
      }
    }
    const used = new Set();
    const sources = names => {
      const map = new Map();
      for (const name of names) for (const x of pools[name] || []) {
        if (!x) continue;
        const k = id(x);
        if (distinct.has(k) && !map.has(k) && !used.has(k)) map.set(k, distinct.get(k));
      }
      return [...map.values()];
    };
    const sort = (items, label) => items.sort((a, b) => {
      const weight = x => hash(seed + ':' + label + ':' + id(x)) / 4294967295
        + Math.min(0.12, Math.max(0, Number(x.rating) - 6) * .024);
      return weight(b) - weight(a);
    });
    const pick = (names, label, predicate = () => true, limit = perRail) => {
      const all = sort(sources(names).filter(predicate), label);
      const fresh = all.filter(x => Number(seen[id(x)]) < seenCutoff || !seen[id(x)]);
      const recycled = all.filter(x => Number(seen[id(x)]) >= seenCutoff);
      const selected = fresh.concat(recycled).slice(0, limit);
      for (const x of selected) used.add(id(x));
      return selected;
    };
    const hero = pick(['tv','day','week','movies','now','rated'], 'featured',
      item => Boolean(item.backdrop), 1)[0] || null;
    const genres = new Set(history.slice(0, 30).flatMap(item => item.genreIds || []));
    const rails = {
      'Popular on ZeroPlay': pick(['day','week','movies','tv','now'], 'popular'),
      'Fresh Picks For You': pick(['movies','now','rated','week','tv'], 'fresh'),
      'Hidden Gems': pick(['gems','classics','rated'], 'hidden',
        x => Number(x.rating) >= 6.8 && Number(x.voteCount) >= 80 && Number(x.popularity) < 300),
      'Because You Watched': genres.size ?
        pick(['similar','rated','week','movies'], 'because',
          x => (x.genreIds || []).some(g => genres.has(g))) : [],
      'Rediscover the Classics': pick(['classics','rated'], 'classic',
        x => Number(String(x.date || '').slice(0, 4)) > 0 &&
          Number(String(x.date || '').slice(0, 4)) < new Date(now).getFullYear()-5)
    };
    return { hero, rails, uniqueCount: distinct.size };
  }
  function cleanSeen(seen, now = Date.now()) {
    return Object.fromEntries(Object.entries(seen || {})
      .filter(([key, time]) => /^(movie|tv):\d+$/.test(key) && Number(time) >= now - 30*DAY)
      .slice(-1200));
  }
  return { id, prepare, hash, cleanSeen, DAY };
});
