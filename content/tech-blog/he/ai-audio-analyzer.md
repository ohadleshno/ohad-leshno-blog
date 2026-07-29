---
title: "AI Audio Analyzer & Music Transcription Engine"
slug: "ai-audio-analyzer"
excerpt: "מערכת AI מתקדמת לניתוח אותות קול, חילוץ אקורדים ותזמור אוטומטי של יצירות מוזיקליות."
date: "2026-06-15"
coverImage: "/hero-cover.webp"
projectUrl: "https://github.com/ohadleshno"
techStack: ["PyTorch", "Librosa", "FastAPI", "Next.js", "Python"]
language: "he"
---

# ארכיטקטורת המערכת: AI Audio Analyzer

פרויקט זה מציע מערכת ניתוח אותות קול (DSP) המשלבת מודלים למידה עמוקה (Deep Learning) לחילוץ הרמוני של אקורדים ומקצב מתוך קבצי אודיו.

## ארכיטקטורה טכנית

```
[Audio Input (WAV/MP3)] -> [Librosa STFT / CQT] -> [PyTorch Harmonic Net] -> [Chord & Rhythm Output]
```

1. **עיבוד מקדים של האות**: התמרת Fourier מהירה (STFT) והתמרת Q קבועה (CQT) לייצוג ספקטרלי של צלילים מוזיקליים.
2. **מודל PyTorch**: שרשרת שכבות קונבולוציה (CNN) ו-LSTM לזיהוי רצפי אקורדים בזמן אמת.
3. **ממשק API**: שרת FastAPI המגיש תוצאות בזמן אמת לאפליקציית Next.js.
