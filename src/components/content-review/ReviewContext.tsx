'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchReview,
  postApproval,
  postChangeApproval,
  postComment,
  postProposedEdit,
  postResolveComment,
  postRevision,
  postSaveMarkdown,
  ReviewApiError,
} from '@/lib/content-review/api';
import { buildReviewPayload } from '@/lib/content-review/payload';
import { compileReviewPrompt } from '@/lib/content-review/prompt';
import type { ApprovalStatus, LineRange, ReviewPayload } from '@/lib/content-review/types';
import { copyText } from './copy-text';
import { reviewLabels } from './labels';
import {
  createReviewUiState,
  isEditorDirty,
  reduceReviewUi,
  type CompareTarget,
  type ChangeFilter,
  type DiffLayout,
  type ReviewUiState,
  type ReviewView,
} from './review-state';

type ReviewContextValue = {
  state: {
    payload: ReviewPayload | null;
    ui: ReviewUiState;
    loading: boolean;
    unreachable: boolean;
    error: string | null;
    dirty: boolean;
    prompt: string;
  };
  actions: {
    setView: (view: ReviewView) => void;
    setDiffLayout: (layout: DiffLayout) => void;
    setCompareTo: (compareTo: CompareTarget) => void;
    setChangeFilter: (filter: ChangeFilter) => void;
    selectLine: (line: number, extend: boolean) => void;
    clearRange: () => void;
    setCommentDraft: (text: string) => void;
    setReplacementDraft: (text: string) => void;
    setEditorDraft: (text: string) => void;
    addComment: () => Promise<void>;
    addProposedEdit: () => Promise<void>;
    resolveComment: (commentId: string) => Promise<void>;
    createRevision: () => Promise<void>;
    setApproval: (approval: ApprovalStatus) => void;
    setChangeApproval: (changeId: string, approved: boolean) => Promise<void>;
    requestSave: () => void;
    cancelSave: () => void;
    confirmSave: () => Promise<void>;
    keepDraft: () => void;
    loadDiskVersion: () => Promise<void>;
    clearDraft: () => void;
    copyPrompt: () => Promise<void>;
    toggleIncludeResolved: () => void;
    refresh: () => Promise<void>;
  };
  meta: {
    lang: 'en' | 'he';
    slug: string;
    isHe: boolean;
    labels: ReturnType<typeof reviewLabels>;
  };
};

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function useReview(): ReviewContextValue {
  const value = useContext(ReviewContext);
  if (!value) {
    throw new Error('useReview must be used inside ContentReview.Provider');
  }
  return value;
}

export function ReviewProvider({
  lang,
  slug,
  children,
}: {
  lang: 'en' | 'he';
  slug: string;
  children: ReactNode;
}) {
  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreachable, setUnreachable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ui, dispatch] = useReducer(reduceReviewUi, { markdown: '', lang }, createReviewUiState);
  const labels = reviewLabels(lang);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchReview(lang, slug);
      setPayload(next);
      dispatch({ type: 'syncFromSession', markdown: next.session.workingMarkdown });
      setUnreachable(false);
      setError(null);
    } catch (caught) {
      if (caught instanceof ReviewApiError && caught.status === 0) {
        setUnreachable(true);
      } else {
        setError(caught instanceof Error ? caught.message : 'Could not load review');
      }
    } finally {
      setLoading(false);
    }
  }, [lang, slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutate = useCallback(async (operation: () => Promise<ReviewPayload>) => {
    try {
      const next = await operation();
      setPayload(next);
      dispatch({ type: 'syncFromSession', markdown: next.session.workingMarkdown });
      setError(null);
      return next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Review request failed');
      throw caught;
    }
  }, []);

  const actions = useMemo<ReviewContextValue['actions']>(
    () => ({
      setView: (view) => dispatch({ type: 'setView', view }),
      setDiffLayout: (layout) => dispatch({ type: 'setDiffLayout', layout }),
      setCompareTo: (compareTo) => dispatch({ type: 'setCompareTo', compareTo }),
      setChangeFilter: (filter) => dispatch({ type: 'setChangeFilter', filter }),
      selectLine: (line, extend) => {
        if (extend) dispatch({ type: 'extendRange', line });
        else dispatch({ type: 'selectRange', range: { startLine: line, endLine: line } });
      },
      clearRange: () => dispatch({ type: 'selectRange', range: null }),
      setCommentDraft: (text) => dispatch({ type: 'setCommentDraft', text }),
      setReplacementDraft: (text) => dispatch({ type: 'setReplacementDraft', text }),
      setEditorDraft: (text) => dispatch({ type: 'setEditorDraft', text }),
      addComment: async () => {
        if (!ui.selectedRange || !ui.commentDraft.trim()) return;
        await mutate(() => postComment(lang, slug, ui.selectedRange!, ui.commentDraft, ui.editorDraft));
        dispatch({ type: 'commentSaved' });
      },
      addProposedEdit: async () => {
        if (!ui.selectedRange) return;
        await mutate(() => postProposedEdit(lang, slug, ui.selectedRange!, ui.replacementDraft));
        dispatch({ type: 'editSaved' });
      },
      resolveComment: async (commentId) => {
        await mutate(() => postResolveComment(lang, slug, commentId));
      },
      createRevision: async () => {
        await mutate(() => postRevision(lang, slug, 'comments'));
      },
      setApproval: (approval) => {
        void mutate(() => postApproval(lang, slug, approval));
      },
      setChangeApproval: async (changeId, approved) => {
        await mutate(() => postChangeApproval(lang, slug, changeId, approved));
      },
      requestSave: () => dispatch({ type: 'requestSave' }),
      cancelSave: () => dispatch({ type: 'cancelSave' }),
      confirmSave: async () => {
        if (!payload) return;
        dispatch({ type: 'saveStarted' });
        try {
          const next = await postSaveMarkdown(lang, slug, ui.editorDraft, payload.session.workingHash);
          setPayload(next);
          dispatch({ type: 'saveSucceeded', markdown: next.session.workingMarkdown });
        } catch (caught) {
          if (caught instanceof ReviewApiError && caught.conflict) {
            dispatch({ type: 'saveConflict', diskMarkdown: caught.conflict.diskMarkdown });
            return;
          }
          dispatch({
            type: 'saveFailed',
            message: caught instanceof Error ? caught.message : 'Save failed',
          });
        }
      },
      keepDraft: () => dispatch({ type: 'cancelSave' }),
      loadDiskVersion: async () => {
        dispatch({ type: 'loadDiskVersion' });
        await refresh();
      },
      clearDraft: () => dispatch({ type: 'clearDraft' }),
      copyPrompt: async () => {
        const text = payload
          ? compileReviewPrompt(payload.session, { includeResolved: ui.includeResolved })
          : '';
        const ok = await copyText(text);
        dispatch({ type: ok ? 'copySucceeded' : 'copyFailed' });
        window.setTimeout(() => dispatch({ type: 'clearCopyPhase' }), 2000);
      },
      toggleIncludeResolved: () => dispatch({ type: 'toggleIncludeResolved' }),
      refresh,
    }),
    [lang, mutate, payload, refresh, slug, ui.commentDraft, ui.editorDraft, ui.includeResolved, ui.replacementDraft, ui.selectedRange],
  );

  const derivedPayload = useMemo(() => {
    if (!payload) return null;
    return buildReviewPayload(payload.session, ui.compareTo, ui.includeResolved);
  }, [payload, ui.compareTo, ui.includeResolved]);

  const value = useMemo<ReviewContextValue>(
    () => ({
      state: {
        payload: derivedPayload,
        ui,
        loading,
        unreachable,
        error,
        dirty: isEditorDirty(ui),
        prompt: derivedPayload?.prompt ?? '',
      },
      actions,
      meta: { lang, slug, isHe: lang === 'he', labels },
    }),
    [actions, derivedPayload, error, labels, lang, loading, slug, ui, unreachable],
  );

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}
