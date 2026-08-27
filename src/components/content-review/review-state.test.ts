import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createReviewUiState, isEditorDirty, reduceReviewUi } from './review-state';

describe('review UI state', () => {
  it('creates a Hebrew RTL layout', () => {
    const state = createReviewUiState({ markdown: '# Hello\n', lang: 'he' });
    assert.equal(state.dir, 'rtl');
    assert.equal(state.view, 'article');
  });

  it('creates comments and proposed edits from a selected range', () => {
    let state = createReviewUiState({ markdown: 'line\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'selectRange', range: { startLine: 2, endLine: 4 } });
    state = reduceReviewUi(state, { type: 'setCommentDraft', text: 'Sharpen this.' });
    state = reduceReviewUi(state, { type: 'setReplacementDraft', text: 'Better line\n' });
    state = reduceReviewUi(state, { type: 'commentSaved' });
    assert.equal(state.selectedRange?.startLine, 2);
    assert.equal(state.commentDraft, '');
    assert.equal(state.replacementDraft, 'Better line\n');
    state = reduceReviewUi(state, { type: 'editSaved' });
    assert.equal(state.replacementDraft, '');
  });

  it('tracks unsaved editor state and save confirmation', () => {
    let state = createReviewUiState({ markdown: 'original\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'setEditorDraft', text: 'draft\n' });
    assert.equal(isEditorDirty(state), true);
    state = reduceReviewUi(state, { type: 'requestSave' });
    assert.equal(state.savePhase, 'confirming');
    state = reduceReviewUi(state, { type: 'cancelSave' });
    assert.equal(state.savePhase, 'idle');
    assert.equal(state.editorDraft, 'draft\n');
  });

  it('keeps the draft after a disk conflict', () => {
    let state = createReviewUiState({ markdown: 'original\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'setEditorDraft', text: 'browser draft\n' });
    state = reduceReviewUi(state, { type: 'saveConflict', diskMarkdown: 'disk version\n' });
    assert.equal(state.savePhase, 'conflict');
    assert.equal(state.editorDraft, 'browser draft\n');
    assert.equal(isEditorDirty(state), true);

    const kept = reduceReviewUi(state, { type: 'cancelSave' });
    assert.equal(kept.editorDraft, 'browser draft\n');
    assert.equal(kept.savePhase, 'idle');

    const loaded = reduceReviewUi(state, { type: 'loadDiskVersion' });
    assert.equal(loaded.editorDraft, 'disk version\n');
    assert.equal(isEditorDirty(loaded), false);
  });

  it('clears an abandoned draft', () => {
    let state = createReviewUiState({ markdown: 'original\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'setEditorDraft', text: 'abandoned\n' });
    state = reduceReviewUi(state, { type: 'clearDraft' });
    assert.equal(state.editorDraft, 'original\n');
    assert.equal(isEditorDirty(state), false);
  });

  it('switches revisions and approval views without dropping editor drafts', () => {
    let state = createReviewUiState({ markdown: 'original\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'setEditorDraft', text: 'draft\n' });
    state = reduceReviewUi(state, { type: 'setCompareTo', compareTo: 2 });
    state = reduceReviewUi(state, { type: 'setView', view: 'discussion' });
    assert.equal(state.compareTo, 2);
    assert.equal(state.view, 'discussion');
    assert.equal(state.editorDraft, 'draft\n');
  });

  it('records clipboard success and failure', () => {
    let state = createReviewUiState({ markdown: 'original\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'copySucceeded' });
    assert.equal(state.copyPhase, 'copied');
    state = reduceReviewUi(state, { type: 'copyFailed' });
    assert.equal(state.copyPhase, 'failed');
  });

  it('does not clobber a dirty editor when the session refreshes', () => {
    let state = createReviewUiState({ markdown: 'original\n', lang: 'en' });
    state = reduceReviewUi(state, { type: 'setEditorDraft', text: 'draft\n' });
    state = reduceReviewUi(state, { type: 'syncFromSession', markdown: 'from disk\n' });
    assert.equal(state.editorDraft, 'draft\n');
    assert.equal(state.editorBaseline, 'from disk\n');
  });
});
