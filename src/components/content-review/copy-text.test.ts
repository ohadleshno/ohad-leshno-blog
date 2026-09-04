import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { copyText } from './copy-text';

describe('clipboard copying', () => {
  it('returns true when the copier succeeds', async () => {
    const copied: string[] = [];
    const ok = await copyText('hello prompt', async (value) => {
      copied.push(value);
    });
    assert.equal(ok, true);
    assert.deepEqual(copied, ['hello prompt']);
  });

  it('returns false when the copier fails', async () => {
    const ok = await copyText('hello prompt', async () => {
      throw new Error('denied');
    });
    assert.equal(ok, false);
  });
});
