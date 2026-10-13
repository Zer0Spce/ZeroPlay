'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../core.cjs');

test('Embedwave stays protected from learned/static ad blocking',()=>{
  assert.equal(core.providerAllowed('embedwave.cc'),true);
  assert.equal(core.providerAllowed('sub.embedwave.cc'),true);
  assert.equal(core.blocked('embedwave.cc'),false);
  assert.equal(core.learnAdHost('embedwave.cc','test'),false);
  assert.equal(core.blockReason('embedwave.cc'),null);
});
