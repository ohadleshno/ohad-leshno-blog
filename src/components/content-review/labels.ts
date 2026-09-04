type ReviewLabels = {
  barTitle: string;
  baseline: string;
  working: string;
  revision: string;
  unresolved: string;
  approval: string;
  approved: string;
  pending: string;
  changesRequested: string;
  viewArticle: string;
  viewDiff: string;
  viewDiscussion: string;
  viewPrompt: string;
  viewEditor: string;
  unified: string;
  split: string;
  compare: string;
  workingFile: string;
  createRevision: string;
  approve: string;
  requestChanges: string;
  copyPrompt: string;
  copied: string;
  copyFailed: string;
  saveFile: string;
  saving: string;
  saved: string;
  confirmSaveTitle: string;
  confirmSaveBody: string;
  confirmSave: string;
  cancel: string;
  conflictTitle: string;
  conflictBody: string;
  keepDraft: string;
  loadDisk: string;
  clearDraft: string;
  unsaved: string;
  comment: string;
  proposeEdit: string;
  replacement: string;
  addComment: string;
  addEdit: string;
  resolve: string;
  open: string;
  resolved: string;
  outdated: string;
  selectedLines: string;
  includeResolved: string;
  serverDown: string;
  serverDownHelp: string;
  noChanges: string;
  editorLabel: string;
  promptLabel: string;
  headColumn: string;
  draftColumn: string;
  uncommittedTitle: string;
  renderedPreview: string;
  renderingPreview: string;
  previewError: string;
  previewView: string;
  changesView: string;
  viewFullArticle: string;
  approveChange: string;
  revertChange: string;
  changeApproved: string;
  markdownView: string;
  editChange: string;
  applyEdit: string;
  unsavedChange: string;
  allReviewed: string;
  allChanges: string;
  unsavedChanges: string;
  noUnsavedChanges: string;
};

const EN: ReviewLabels = {
  barTitle: 'Content review',
  baseline: 'Baseline',
  working: 'Working',
  revision: 'Revision',
  unresolved: 'Unresolved',
  approval: 'Approval',
  approved: 'Approved',
  pending: 'Pending',
  changesRequested: 'Changes requested',
  viewArticle: 'Article',
  viewDiff: 'Diff',
  viewDiscussion: 'Discussion',
  viewPrompt: 'Prompt',
  viewEditor: 'Edit file',
  unified: 'Unified',
  split: 'Side by side',
  compare: 'Compare',
  workingFile: 'Working file',
  createRevision: 'Save revision',
  approve: 'Approve',
  requestChanges: 'Request changes',
  copyPrompt: 'Copy AI prompt',
  copied: 'Copied to clipboard',
  copyFailed: 'Could not copy',
  saveFile: 'Save to file',
  saving: 'Saving',
  saved: 'Saved',
  confirmSaveTitle: 'Save Markdown to disk?',
  confirmSaveBody:
    'This writes the editor contents to the source Markdown file. A review revision is stored first so you can still compare.',
  confirmSave: 'Save file',
  cancel: 'Cancel',
  conflictTitle: 'The file changed on disk',
  conflictBody: 'Your draft was not written and is still in the editor.',
  keepDraft: 'Keep my draft',
  loadDisk: 'Load disk version',
  clearDraft: 'Clear draft',
  unsaved: 'Unsaved edits',
  comment: 'Comment',
  proposeEdit: 'Propose replacement',
  replacement: 'Replacement Markdown',
  addComment: 'Add comment',
  addEdit: 'Save proposed edit',
  resolve: 'Resolve',
  open: 'Open',
  resolved: 'Resolved',
  outdated: 'Outdated',
  selectedLines: 'Selected lines',
  includeResolved: 'Include resolved comments',
  serverDown: 'Review server is not running',
  serverDownHelp: 'Start it with npm run review:dev, then refresh this page.',
  noChanges: 'No uncommitted changes vs Git HEAD.',
  editorLabel: 'Article Markdown',
  promptLabel: 'AI handoff prompt',
  headColumn: 'Git HEAD',
  draftColumn: 'Uncommitted draft',
  uncommittedTitle: 'Changes vs Git HEAD',
  renderedPreview: 'Rendered preview',
  renderingPreview: 'Updating preview',
  previewError: 'The Markdown preview could not be rendered.',
  previewView: 'Preview',
  changesView: 'Changes',
  viewFullArticle: 'View full article',
  approveChange: 'Approve change',
  revertChange: 'Revert change',
  changeApproved: 'Approved',
  markdownView: 'Markdown',
  editChange: 'Edit change',
  applyEdit: 'Apply edit',
  unsavedChange: 'Unsaved',
  allReviewed: 'All saved changes have been reviewed.',
  allChanges: 'All changes',
  unsavedChanges: 'Unsaved edits',
  noUnsavedChanges: 'No browser edits are waiting to be saved.',
};

const HE: ReviewLabels = {
  barTitle: 'סקירת תוכן',
  baseline: 'בסיס',
  working: 'קובץ עבודה',
  revision: 'גרסה',
  unresolved: 'פתוחים',
  approval: 'אישור',
  approved: 'אושר',
  pending: 'ממתין',
  changesRequested: 'נדרשים שינויים',
  viewArticle: 'מאמר',
  viewDiff: 'השוואה',
  viewDiscussion: 'דיון',
  viewPrompt: 'פרומפט',
  viewEditor: 'עריכת קובץ',
  unified: 'מאוחד',
  split: 'זה לצד זה',
  compare: 'השוואה מול',
  workingFile: 'קובץ עבודה',
  createRevision: 'שמירת גרסה',
  approve: 'אישור',
  requestChanges: 'בקשת שינויים',
  copyPrompt: 'העתקת פרומפט ל-AI',
  copied: 'הועתק ללוח',
  copyFailed: 'ההעתקה נכשלה',
  saveFile: 'שמירה לקובץ',
  saving: 'שומר',
  saved: 'נשמר',
  confirmSaveTitle: 'לשמור את ה-Markdown לדיסק?',
  confirmSaveBody:
    'הפעולה כותבת את תוכן העורך לקובץ המקור. גרסת סקירה נשמרת קודם כדי שאפשר יהיה להשוות.',
  confirmSave: 'שמירת קובץ',
  cancel: 'ביטול',
  conflictTitle: 'הקובץ השתנה בדיסק',
  conflictBody: 'הטיוטה לא נכתבה לקובץ והיא עדיין בעורך.',
  keepDraft: 'להשאיר את הטיוטה',
  loadDisk: 'לטעון את גרסת הדיסק',
  clearDraft: 'ניקוי טיוטה',
  unsaved: 'שינויים שלא נשמרו',
  comment: 'הערה',
  proposeEdit: 'הצעת החלפה',
  replacement: 'Markdown להחלפה',
  addComment: 'הוספת הערה',
  addEdit: 'שמירת הצעת עריכה',
  resolve: 'סגירה',
  open: 'פתוח',
  resolved: 'סגור',
  outdated: 'לא מעודכן',
  selectedLines: 'שורות נבחרות',
  includeResolved: 'לכלול הערות שנסגרו',
  serverDown: 'שרת הסקירה לא רץ',
  serverDownHelp: 'הפעילו אותו עם npm run review:dev, ואז רעננו את העמוד.',
  noChanges: 'אין שינויים לא מחויבים מול Git HEAD.',
  editorLabel: 'Markdown של המאמר',
  promptLabel: 'פרומפט להעברה ל-AI',
  headColumn: 'Git HEAD',
  draftColumn: 'טיוטה לא מחויבת',
  uncommittedTitle: 'שינויים מול Git HEAD',
  renderedPreview: 'תצוגה מקדימה',
  renderingPreview: 'מעדכן תצוגה',
  previewError: 'לא ניתן היה להציג את ה-Markdown.',
  previewView: 'תצוגה',
  changesView: 'שינויים',
  viewFullArticle: 'צפייה במאמר המלא',
  approveChange: 'אישור שינוי',
  revertChange: 'ביטול שינוי',
  changeApproved: 'אושר',
  markdownView: 'Markdown',
  editChange: 'עריכת שינוי',
  applyEdit: 'החלת עריכה',
  unsavedChange: 'לא נשמר',
  allReviewed: 'כל השינויים השמורים נבדקו.',
  allChanges: 'כל השינויים',
  unsavedChanges: 'עריכות שלא נשמרו',
  noUnsavedChanges: 'אין עריכות דפדפן שממתינות לשמירה.',
};

export function reviewLabels(lang: 'en' | 'he'): ReviewLabels {
  return lang === 'he' ? HE : EN;
}
