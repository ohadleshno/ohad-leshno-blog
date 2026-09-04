import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { wordDiff } from './word-diff';

describe('word-level diffs', () => {
  it('marks only changed words and punctuation', () => {
    const result = wordDiff(
      'Normalize that data into the entities your system understands, using your own domain language.',
      'Normalize that data into the entities your system understands, such as contacts and messages.',
    );

    assert.equal(result.oldParts.map((part) => part.text).join(''), 'Normalize that data into the entities your system understands, using your own domain language.');
    assert.equal(result.newParts.map((part) => part.text).join(''), 'Normalize that data into the entities your system understands, such as contacts and messages.');
    assert.deepEqual(
      result.oldParts.filter((part) => part.changed).map((part) => part.text),
      ['using your own domain language'],
    );
    assert.deepEqual(
      result.newParts.filter((part) => part.changed).map((part) => part.text),
      ['such as contacts and messages'],
    );
  });
});
