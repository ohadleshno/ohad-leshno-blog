import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldEnableReview } from './flags';

describe('review mode flags', () => {
  it('enables review in development by default', () => {
    assert.equal(shouldEnableReview('development', null), true);
    assert.equal(shouldEnableReview('development', 'true'), true);
    assert.equal(shouldEnableReview('development', 'false'), false);
    assert.equal(shouldEnableReview('production', null), false);
    assert.equal(shouldEnableReview('production', 'true'), false);
  });
});
