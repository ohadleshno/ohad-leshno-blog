---
title: "EyeDrop Alarm Clock — מסמך תכנון ארכיטקטוני (Backend Design Doc)"
slug: "eyedrop-alarm-clock"
excerpt: "ניתוח עומק ארכיטקטוני: מנוע התראות מרווחי בעדיפות רפואית גבוהה ב-Android, ניהול משימות רקע, וסנכרון ענן ב-Firebase."
date: "2025-11-05"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno/eyedropreminder"
techStack: ["Kotlin", "Android SDK", "Firebase FCM", "Firestore", "AlarmManager", "WorkManager"]
language: "he"
---

# EyeDrop Alarm Clock — מסמך תכנון ארכיטקטוני (Backend Design Doc)

## סקירה כללית (Overview)

מערכת **EyeDrop Alarm Clock** הינה פלטפורמת מובייל וענן לאנדרואיד שנבנתה במיוחד עבור מטופלי עיניים לאחר ניתוחים וטיפולים קליניים מורכבים. המערכת מבטיחה רצף טיפולי קפדני באמצעות מנוע התראות אמין וסנכרון נתונים מול Firebase.

---

## ארכיטקטורת המערכת (System Architecture)

```mermaid
graph TD
    Client["Android Native Runtime (Kotlin)"] --> AlarmEngine["Interval Alarm Scheduling Engine"]
    
    AlarmEngine -->|Exact Alarm Intent| AlarmMgr["Android AlarmManager"]
    AlarmEngine -->|Deferred Cleanup| WorkMgr["Android WorkManager"]

    AlarmMgr -->|Trigger Alert| NotifService["High-Priority Notification Manager"]
    
    Client -->|Sync Dosage Logs| Firestore[("Firebase Firestore DB")]
    
    subgraph Cloud Notification Pipeline
        AdminPortal[Clinical Admin Console] -->|Send Dosage Alert| FCM["Firebase Cloud Messaging (FCM)"]
        FCM -->|Push Payload| Client
    end
```

---

## דיאגרמת מצבים להפעלת התראות (Alarm State Machine)

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Patient sets care schedule
    Scheduled --> AlarmFired: AlarmManager triggers exact time
    
    state AlarmFired {
        [*] --> HighPriorityNotification
        HighPriorityNotification --> ActionTaken
    }
    
    ActionTaken --> LoggedCompleted: Patient confirms dose
    ActionTaken --> LoggedSnoozed: Patient snoozes 15m
    ActionTaken --> LoggedMissed: Timeout after 30m
    
    LoggedCompleted --> FirestoreSync: Push log to Firestore
    LoggedSnoozed --> AlarmEngine: Reschedule snooze alarm
    LoggedMissed --> FirestoreSync: Flag missed dose alert
```

---

## החלטות ארכיטקטוניות מרכזיות (Key Design Decisions)

1. **תזמון התראות בעדיפות רפואית גבוהה (`setExactAndAllowWhileIdle`)**: מערכות אנדרואיד משתמשות במנגנון Doze Mode להשהיית התראות. כדי להבטיח נטילת טיפות עיניים בזמן, המנוע עושה שימוש בהרשאות Exact Alarm המופעלות גם במצב חיסכון בסוללה.
2. **ארכיטקטורת Local-First למניעת קריסות**: תזמון ההתראות אינו תלוי בחיבור אינטרנט פעיל. הלו"ז נשמר במסד נתונים מקומי ופועל גם במצב טיסה.
3. **תיעוד וסנכרון ענן אסינכרוני**: יומן הטיפולים מסתנכרן מול Firebase Firestore ברקע רק בעת זמינות רשת, ומאפשר לצוות הקליני לצפות בדיווח הטיפולים.
