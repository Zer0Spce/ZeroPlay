/* ZeroPlay Figma One UI — deterministic and testable discovery engine.
 * Catalogue is live TMDB data, never hardcoded template titles.
 */
((root, factory) => {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.ZeroFigmaOneDiscovery = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  const DAY = 86400000;
  const id = item => item.type + ':' + item.id;
  function hash(str) {
    let n = 2166136261;
    for (const char of String(str)) {
      n ^= char.charCodeAt(0);
      n = Math.imul(n, 16777619);
    }
    return n >>> 0;
  }
  function cleanSeen(seen, now = Date.now()) {
    return Object.fromEntries(Object.entries(seen || {})
      .filter(([key, ts]) => /^(movie|tv):\d+$/.test(key) &&
        Number(ts) > now - 30 * DAY && Number(ts) <= now + DAY)
      .slice(-1200));
  }
  function select({ pools = {}, positions = {}, hidden = [], history = [],
    seen = {}, seed = 'default', now = Date.now(), limit = 16 } = {}) {
    const used = new Set();
    const excluded = new Set(hidden);
    const watched = new Set(Object.keys(positions).filter(k => /^(movie|tv):\d+$/.test(k)));
    const unique = new Map();
    const today = new Date(now).toISOString().slice(0,10);
    for (const group of Object.values(pools)) for (const x of group || []) {
      if (!x || !['movie','tv'].includes(x.type) || !x.id || !x.poster ||
          (x.date && x.date > today)) continue;
      const key = id(x);
      if (!excluded.has(key) && !watched.has(key) && !unique.has(key)) unique.set(key,x);
    }
    const rank = (x, label) =>
      hash(seed + ':' + label + ':' + id(x))/4294967295 +
      Math.min(.1, Math.max(0,Number(x.rating)-6)*.015);
    const pool = (names, rule=()=>true) => {
      const rows = new Map();
      for (const name of names) for (const item of pools[name] || []) {
        if (!item) continue;
        const key = id(item);
        if (unique.has(key) && !used.has(key) && !rows.has(key) && rule(unique.get(key))) {
          rows.set(key, unique.get(key));
        }
      }
      return [...rows.values()];
    };
    function pick(label, names, rule, count=limit) {
      const list = pool(names, rule);
      list.sort((a,b)=>rank(b,label)-rank(a,label));
      const threshold=now-14*DAY;
      const fresh=list.filter(x=>!(Number(seen[id(x)])>=threshold));
      const old=list.filter(x=>Number(seen[id(x)])>=threshold);
      const chosen=fresh.concat(old).slice(0,count);
      chosen.forEach(x=>used.add(id(x)));
      return chosen;
    }
    const hero=pick('featured',['day','week','now','tv','movies','top'],
      x=>Boolean(x.backdrop),1)[0] || null;
    const genres=new Set(history.slice(0,25).flatMap(x=>x.genreIds||[]));
    const rails={
      'Recommended For You': pick('recommended',
        ['similar','week','top','movies','tv'], x=>!genres.size ||
        (x.genreIds||[]).some(g=>genres.has(g))),
      'Trending Now': pick('trending',['day','week','tv','movies']),
      'New & Noteworthy': pick('new',['now','day','week','tv','movies'],
        x=>Boolean(x.date && x.date >= new Date(now-365*DAY).toISOString().slice(0,10))),
      'Top Rated Movies': pick('top',['top','gems','classics','movies'],
        x=>x.type==='movie' && Number(x.rating)>=7),
      'Hidden Gems': pick('hidden',['gems','classics','top'],
        x=>Number(x.rating)>=6.8&&Number(x.voteCount)>=80&&Number(x.popularity)<300),
      'Rediscover the Classics':pick('classics',['classics','top'],
        x=>x.type==='movie'&&Number((x.date||'').slice(0,4))>0&&
           Number((x.date||'').slice(0,4))<=new Date(now).getFullYear()-8)
    };
    if (!rails['Recommended For You'].length)
      rails['Recommended For You'] = pick('recommended-fallback',['week','top','movies','tv']);
    return {hero,rails,uniqueCount:unique.size};
  }
  return Object.freeze({DAY,id,hash,cleanSeen,select});
});
