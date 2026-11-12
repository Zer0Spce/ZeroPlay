'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../windows/ui/refreshed-engine.js');

const now = Date.parse('2026-11-12T10:00:00Z');
function movie(id, overrides = {}) {
  return {
    id, type: 'movie', title: 'Film ' + id, date: '2018-06-10',
    rating: 8.0, voteCount: 1000, popularity: 20, poster: '/poster/' + id,
    genreIds: [28], ...overrides
  };
}
function payload() {
  return {
    pools: {
      daily: Array.from({ length: 48 }, (_, i) => movie(i + 1)),
      weekly: Array.from({ length: 48 }, (_, i) => movie(i + 30)),
      popular: Array.from({ length: 48 }, (_, i) => movie(i + 70)),
      now: Array.from({ length: 36 }, (_, i) => movie(i + 130, { date: '2026-11-01' })),
      top: Array.from({ length: 48 }, (_, i) => movie(i + 160)),
      gems: Array.from({ length: 48 }, (_, i) => movie(i + 200)),
      classics: Array.from({ length: 48 }, (_, i) => movie(i + 250)),
      series: Array.from({ length: 48 }, (_, i) => movie(i + 310, { type: 'tv' }))
    },
    now, seed: 'one', perRow: 16
  };
}
test('all recommendation rails are deduplicated within a homepage', () => {
  const result = engine.curate(payload());
  const ids = Object.values(result.rows).flat().map(engine.identity);
  assert.ok(ids.length > 30, 'enough real candidates for useful shelves');
  assert.equal(new Set(ids).size, ids.length);
});
test('hidden, watched, future and posterless titles never appear', () => {
  const input = payload();
  input.hidden = ['movie:1'];
  input.positions = { 'movie:2': { percent: 100 } };
  input.pools.daily.push(movie(900, { date: '2027-01-01' }));
  input.pools.daily.push(movie(901, { poster: '' }));
  const ids = new Set(Object.values(engine.curate(input).rows).flat().map(engine.identity));
  for (const id of ['movie:1', 'movie:2', 'movie:900', 'movie:901']) {
    assert.ok(!ids.has(id), id + ' must not appear');
  }
});
test('recently exposed titles are not repeated when fresh alternatives exist', () => {
  const input = payload();
  input.seen = Object.fromEntries(
    Array.from({ length: 48 }, (_, i) => ['movie:' + (i + 1), now - engine.DAY]));
  const result = engine.curate(input);
  for (const item of result.rows['Fresh Picks For You']) {
    assert.ok(!input.seen[engine.identity(item)], 'a previously shown movie was reused');
  }
});
test('a short catalog permits fallback rather than leaving the screen empty', () => {
  const input = { pools: { daily: [movie(1), movie(2)] },
    now, seen: { 'movie:1': now - 500, 'movie:2': now - 500 } };
  assert.equal(engine.curate(input).rows['Fresh Picks For You'].length, 2);
});
test('personalized shelf matches recorded genre history', () => {
  const input = payload();
  input.history = [{ genreIds: [28], title: 'History movie' }];
  const result = engine.curate(input);
  assert.ok(result.rows['Because You Watched'].length);
  for (const item of result.rows['Because You Watched']) {
    assert.ok(item.genreIds.includes(28));
  }
});
test('varying selection seed actually rotates the homepage', () => {
  const a = payload(), b = payload();
  b.seed = 'two';
  const sample = result => result.rows['Fresh Picks For You'].map(engine.identity);
  assert.notDeepEqual(sample(engine.curate(a)), sample(engine.curate(b)));
});
test('profile exposure history is kept bounded and expires', () => {
  const cleaned = engine.pruneSeen({
    'movie:1': now - 2 * engine.DAY,
    'movie:2': now - 60 * engine.DAY,
    'random': now
  }, now);
  assert.deepEqual(cleaned, { 'movie:1': now - 2 * engine.DAY });
});
test('Refreshed stays opt-in: Windows native settings and renderer recognize it', () => {
  const root = path.join(__dirname, '..');
  const contents = file => fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(contents('windows/main.cjs'), /'refreshed'\]\.includes\(value\.uiLayout\)/);
  assert.match(contents('windows/ui/layouts.js'), /'refreshed'\]\.includes\(value\)/);
  assert.match(contents('windows/ui/index.html'), /value="refreshed">ZeroPlay Refreshed/);
  assert.match(contents('windows/ui/app.js'), /window\.zeroRefreshed\.render\(\{fresh,token\}\)/);
  assert.match(contents('windows/ui/refreshed.css'), /aspect-ratio:9\/16/);
  assert.match(contents('windows/ui/refreshed.js'), /data-refreshed-refresh/);
  assert.match(contents('windows/ui/index.html'), /src="refreshed\.js"/);
});
