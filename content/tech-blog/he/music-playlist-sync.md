---
title: "Music Sync — מסמך תכנון ארכיטקטוני (Backend Design Doc)"
slug: "music-playlist-sync"
excerpt: "ניתוח עומק ארכיטקטוני של Backend המערכת: מנוע סנכרון מוזיקה רב-פלטפורמי, זיהוי קטעים ב-ISRC, ניהול אסינכרוני של Tokens ומנגנוני Fallback."
date: "2026-02-20"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno/music-playlist-sync"
techStack: ["Node.js", "TypeScript", "Spotify Web API", "Apple MusicKit JS", "TSOA", "Supabase", "Express"]
language: "he"
---

# Music Sync — מסמך תכנון ארכיטקטוני (Backend Design Doc)

## סקירה כללית (Overview)

Music Sync הוא שירות Backend ב-TypeScript המיועד לחלץ קישורים ומידע מוזיקלי מטקסט חופשי ולסנכרן פלייליסטים באופן דו-כיווני בין **Spotify** ל-**Apple Music**. השירות פותר את בעיית הפרגמנטציה של קטלוגי המוזיקה בעזרת זיהוי חד-ערכי ב-ISRC ומנגנוני חיפוש פאזי (Fuzzy Search).

---

## צינור עיבוד הבקשות (High-Level Request Pipeline)

```mermaid
flowchart TD
    A([Client POST /api/v1/sync]) --> B[Text & Link Extraction Service]
    B --> C[Extract Spotify & Apple Track IDs]

    C --> D[Metadata Hydration Worker]
    D -->|Parallel Fetch| E1[Spotify Web API]
    D -->|Parallel Fetch| E2[Apple MusicKit API]

    E1 --> F{ISRC Available?}
    E2 --> F

    F -- Yes --> G[Exact ISRC Matching Engine]
    F -- No --> H[Fuzzy Metadata Matcher\nLevenshtein Title + Artist]

    G --> I[Playlist Reconciliation Engine]
    H --> I

    I --> J1[Update Spotify Playlist]
    I --> J2[Update Apple Music Playlist]

    J1 --> K[(Supabase Storage\nSync Execution Logs)]
    J2 --> K
    K --> L([Return Sync Summary])
```

---

## מנגנון חידוש Tokens ואבטחה (Authentication Engine)

```mermaid
flowchart TD
    REQ([API Operation]) --> AUTH{Token Valid?}

    AUTH -- Spotify Valid --> SP[Execute Spotify Web API]
    AUTH -- Spotify Expired --> SPR[OAuth Refresh Token Flow] --> SP

    AUTH -- Apple Valid --> AP[Execute MusicKit JWT API]
    AUTH -- Apple Expired --> APR[ES256 Private Key JWT Signer] --> AP
```

---

## החלטות ארכיטקטוניות מרכזיות (Key Design Decisions)

1. **זיהוי ב-ISRC תחילה**: מזהי שירים שונים בין הפלטפורמות. המערכת מחייבת שימוש בקוד ISRC (International Standard Recording Code) כקריטריון ראשי, ומשתמשת ב-Fuzzy Search רק במקרה של חוסר במזהה כדי למנוע התאמות שגויות.
2. **מנוע חילוץ מופרד וסטייטלס**: חילוץ הקישורים מתבצע בשכבה מבודדת לפני פנייה ל-APIs חיצוניים למניעת חריגה מכמות הקריאות המותרת (Rate Limits).
3. **ניהול אסינכרוני של ה-Tokens**: מנגנון ה-OAuth של Spotify וה-JWT של Apple Music נהולים ע"י Singleton Service המחדש אישורים ברקע בצורה שקופה למשתמש.
