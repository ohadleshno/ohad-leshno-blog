import type { LineRange } from '@/lib/content-review/types';

export type ReviewView = 'article' | 'diff' | 'discussion' | 'prompt' | 'editor';
export type DiffLayout = 'unified' | 'split';
export type CompareTarget = 'working' | number;
export type SavePhase = 'idle' | 'confirming' | 'saving' | 'saved' | 'conflict' | 'error';
export type CopyPhase = 'idle' | 'copied' | 'failed';
export type ChangeFilter = 'all' | 'unsaved';

export type ReviewUiState = {
  view: ReviewView;
  diffLayout: DiffLayout;
  compareTo: CompareTarget;
  selectedRange: LineRange | null;
  commentDraft: string;
  replacementDraft: string;
  editorDraft: string;
  editorBaseline: string;
  includeResolved: boolean;
  savePhase: SavePhase;
  saveError: string | null;
  conflictDiskMarkdown: string | null;
  copyPhase: CopyPhase;
  dir: 'ltr' | 'rtl';
  changeFilter: ChangeFilter;
};

export type ReviewUiAction =
  | { type: 'setView'; view: ReviewView }
  | { type: 'setDiffLayout'; layout: DiffLayout }
  | { type: 'setCompareTo'; compareTo: CompareTarget }
  | { type: 'selectRange'; range: LineRange | null }
  | { type: 'extendRange'; line: number }
  | { type: 'setCommentDraft'; text: string }
  | { type: 'setReplacementDraft'; text: string }
  | { type: 'setEditorDraft'; text: string }
  | { type: 'requestSave' }
  | { type: 'cancelSave' }
  | { type: 'saveStarted' }
  | { type: 'saveSucceeded'; markdown: string }
  | { type: 'saveConflict'; diskMarkdown: string }
  | { type: 'saveFailed'; message: string }
  | { type: 'loadDiskVersion' }
  | { type: 'clearDraft' }
  | { type: 'copySucceeded' }
  | { type: 'copyFailed' }
  | { type: 'clearCopyPhase' }
  | { type: 'toggleIncludeResolved' }
  | { type: 'syncFromSession'; markdown: string }
  | { type: 'commentSaved' }
  | { type: 'editSaved' }
  | { type: 'setChangeFilter'; filter: ChangeFilter };

export function createReviewUiState(input: { markdown: string; lang: 'en' | 'he' }): ReviewUiState {
  return {
    view: 'article',
    diffLayout: 'split',
    compareTo: 'working',
    selectedRange: null,
    commentDraft: '',
    replacementDraft: '',
    editorDraft: input.markdown,
    editorBaseline: input.markdown,
    includeResolved: false,
    savePhase: 'idle',
    saveError: null,
    conflictDiskMarkdown: null,
    copyPhase: 'idle',
    dir: input.lang === 'he' ? 'rtl' : 'ltr',
    changeFilter: 'all',
  };
}

export function isEditorDirty(state: ReviewUiState): boolean {
  return state.editorDraft !== state.editorBaseline;
}

export function reduceReviewUi(state: ReviewUiState, action: ReviewUiAction): ReviewUiState {
  switch (action.type) {
    case 'setView':
      return { ...state, view: action.view };
    case 'setDiffLayout':
      return { ...state, diffLayout: action.layout };
    case 'setCompareTo':
      return { ...state, compareTo: action.compareTo };
    case 'selectRange':
      return { ...state, selectedRange: action.range };
    case 'extendRange': {
      if (!state.selectedRange) {
        return { ...state, selectedRange: { startLine: action.line, endLine: action.line } };
      }
      const startLine = Math.min(state.selectedRange.startLine, action.line);
      const endLine = Math.max(state.selectedRange.endLine, action.line);
      return { ...state, selectedRange: { startLine, endLine } };
    }
    case 'setCommentDraft':
      return { ...state, commentDraft: action.text };
    case 'setReplacementDraft':
      return { ...state, replacementDraft: action.text };
    case 'setEditorDraft':
      return {
        ...state,
        editorDraft: action.text,
        savePhase: state.savePhase === 'saved' ? 'idle' : state.savePhase,
      };
    case 'requestSave':
      return { ...state, savePhase: 'confirming', saveError: null };
    case 'cancelSave':
      if (state.savePhase === 'saving') return state;
      return { ...state, savePhase: 'idle' };
    case 'saveStarted':
      return { ...state, savePhase: 'saving', saveError: null };
    case 'saveSucceeded':
      return {
        ...state,
        editorDraft: action.markdown,
        editorBaseline: action.markdown,
        savePhase: 'saved',
        saveError: null,
        conflictDiskMarkdown: null,
      };
    case 'saveConflict':
      return {
        ...state,
        savePhase: 'conflict',
        conflictDiskMarkdown: action.diskMarkdown,
        saveError: 'The file changed on disk. Your draft is still here.',
      };
    case 'saveFailed':
      return { ...state, savePhase: 'error', saveError: action.message };
    case 'loadDiskVersion':
      if (!state.conflictDiskMarkdown) return state;
      return {
        ...state,
        editorDraft: state.conflictDiskMarkdown,
        editorBaseline: state.conflictDiskMarkdown,
        savePhase: 'idle',
        saveError: null,
        conflictDiskMarkdown: null,
      };
    case 'clearDraft':
      return {
        ...state,
        editorDraft: state.editorBaseline,
        savePhase: 'idle',
        saveError: null,
        conflictDiskMarkdown: null,
      };
    case 'copySucceeded':
      return { ...state, copyPhase: 'copied' };
    case 'copyFailed':
      return { ...state, copyPhase: 'failed' };
    case 'clearCopyPhase':
      return { ...state, copyPhase: 'idle' };
    case 'toggleIncludeResolved':
      return { ...state, includeResolved: !state.includeResolved };
    case 'syncFromSession':
      if (isEditorDirty(state)) {
        return { ...state, editorBaseline: action.markdown };
      }
      return {
        ...state,
        editorDraft: action.markdown,
        editorBaseline: action.markdown,
      };
    case 'commentSaved':
      return { ...state, commentDraft: '' };
    case 'editSaved':
      return { ...state, replacementDraft: '' };
    case 'setChangeFilter':
      return { ...state, changeFilter: action.filter };
    default:
      return state;
  }
}
