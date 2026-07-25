---
title: "EyeDrop Alarm Clock — Android Backend Architecture & Firebase Care System"
slug: "eyedrop-alarm-clock"
excerpt: "Backend & mobile architectural breakdown of EyeDrop Alarm Clock: Android high-priority exact alarm scheduling, Firebase Cloud Messaging, and Firestore synchronization."
date: "2025-11-05"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno/eyedropreminder"
techStack: ["Kotlin", "Android SDK", "Firebase FCM", "Firestore", "AlarmManager", "WorkManager"]
language: "en"
---

# EyeDrop Alarm Clock — Backend Architecture Design Doc

## Overview

**EyeDrop Alarm Clock** is an Android medical compliance platform engineered for post-operative ophthalmology care. The application guarantees strict interval alarm scheduling and synchronization with Firebase services.

---

## High-Level System Architecture

```mermaid
flowchart TD
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

## Alarm Scheduling State Machine

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

## Key Design Decisions

**Exact Alarm Privileges (`setExactAndAllowWhileIdle`).** Modern Android OS battery optimization (Doze Mode) defers background execution. To prevent missed medical doses, the engine requires exact alarm permissions and executes via `AlarmManager.setExactAndAllowWhileIdle()`.

**Local-First Alarm Resilience.** Alarm triggers do not rely on an active internet connection. Medication schedules are calculated and saved in a local SQLite database, ensuring alarms fire even if the device is offline or in flight mode.

**Firestore Log Auditing.** Dosage logs are asynchronously synced to Firebase Firestore when network connectivity is restored, providing clinicians with verifiable patient adherence metrics.
