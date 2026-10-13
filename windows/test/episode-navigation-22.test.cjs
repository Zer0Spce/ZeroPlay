const {test}=require('node:test'),assert=require('node:assert/strict');
const {target}=require('../episode-navigation.cjs');
const show={seasons:[{season_number:0,episode_count:2},{season_number:1,episode_count:3},{season_number:2,episode_count:2}]};
test('episode navigation moves within and across regular seasons',()=>{assert.deepEqual(target(show,{season:1,episode:1},1),{season:1,episode:2});assert.deepEqual(target(show,{season:1,episode:3},1),{season:2,episode:1});assert.deepEqual(target(show,{season:2,episode:1},-1),{season:1,episode:3});assert.equal(target(show,{season:2,episode:2},1),null);});
test('specials stay in the season-zero path without leaking into regular previous',()=>{assert.deepEqual(target(show,{season:0,episode:1},1),{season:0,episode:2});assert.deepEqual(target(show,{season:0,episode:2},1),{season:1,episode:1});assert.equal(target(show,{season:1,episode:1},-1),null);});
test('invalid episode metadata is rejected',()=>{assert.equal(target(null,{season:1,episode:1},1),null);assert.equal(target(show,{season:-1,episode:1},1),null);assert.equal(target(show,{season:1,episode:0},1),null);assert.equal(target(show,{season:1,episode:1},0),null);});
