---
title: "Visual Field Analyzer — מסמך תכנון ארכיטקטוני (Backend Design Doc)"
slug: "al-vf-analyzer"
excerpt: "ניתוח עומק ארכיטקטוני של Backend המערכת: תשתית ענן רפואית ב-AWS il-central-1, מעבד בדיקות DICOM אסינכרוני, ואבטחת נתונים רב-דיירית."
date: "2026-01-10"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno/AL_VF_Analyzer"
techStack: ["AWS (il-central-1)", "Terraform", "Node.js 22", "Prisma", "Express", "PostgreSQL", "Docker", "DICOM"]
language: "he"
---

# Visual Field Analyzer — מסמך תכנון ארכיטקטוני (Backend Design Doc)

## סקירה כללית (Overview)

מערכת **Visual Field Analyzer (AL VF Analyzer)** הינה פלטפורמת ענן רפואית מרובת דיירים (Multi-Tenant) שנבנתה עבור המרכז הרפואי שיבא בתל השומר ומכון גולדשלגר לעיניים. המערכת מיועדת לעיבוד, פענוח וניתוח בדיקות שדות ראייה מסוג Humphrey Visual Field תחת תקני תושבות מידע ואבטחה רפואית מחמירים.

---

## ארכיטקטורת ענן ותשתית AWS (`il-central-1`)

```mermaid
flowchart TD
    Client[Clinical API Request] --> WAF[AWS WAF / CloudFront]
    WAF --> ALB[Application Load Balancer]
    
    subgraph VPC [AWS VPC - il-central-1]
        ALB -->|HTTP Route| ECS[Express API Cluster Node 22]
        ECS -->|Metadata Query| DB[(Aurora PostgreSQL - KMS Encrypted)]
        
        ECS -->|FileUpload Event| S3[(S3 DICOM Bucket - Encrypted)]
        ECS -->|Enqueue Parse Job| SQS[AWS SQS Processing Queue]
        
        SQS --> Worker[DICOM Extraction Worker]
        Worker -->|Read Binary DICOM| S3
        Worker -->|Compute Retinal Matrix & Progression| DB
    end

    subgraph Security & Identity
        Cognito[AWS Cognito User Pools] -->|JWT Verification| ECS
        KMS[AWS KMS] -->|Data-at-Rest Encryption| DB
        KMS -->|Data-at-Rest Encryption| S3
    end
```

---

## צינור עיבוד אסינכרוני לקובצי DICOM

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Clinic / Device
    participant API as Express API Server
    participant S3 as S3 DICOM Storage
    participant SQS as SQS Worker Queue
    participant Worker as DICOM Processing Engine
    participant DB as Aurora PostgreSQL

    Clinician->>API: POST /api/v1/exams/upload (DICOM File)
    API->>S3: PutObject (Encrypted DICOM Blob)
    API->>SQS: SendMessage { examId, s3Key }
    API-->>Clinician: 202 Accepted { status: "processing" }

    SQS->>Worker: Consume Message
    Worker->>S3: GetObject (DICOM File)
    Worker->>Worker: Parse DICOM Datasets & Extract dB Matrices
    Worker->>Worker: Calculate Mean Deviation (MD) & Pattern Standard Deviation (PSD)
    Worker->>DB: Update Exam Record & Retinal Grid Points
```

---

## החלטות ארכיטקטוניות מרכזיות (Key Design Decisions)

1. **עמידה בתושבות מידע (AWS Israel `il-central-1`)**: בהתאם לרגולציה הרפואית בישראל, כל המשאבים (ECS, S3, Aurora) מופעלים בלעדית ב-VPC סגור באזור `il-central-1` ומוגדרים כקוד ב-Terraform.
2. **עיבוד אסינכרוני של DICOM דרך SQS**: פענוח קובצי DICOM מורכבים וחישוב מטריצות רגישות רטינלית דורשים משאבי עיבוד. העלאת הקובץ מחזירה תגובה מיידית `202 Accepted` והעיבוד מועבר ל-Worker ייעודי דרך SQS למניעת Timeouts.
3. **הפרדת דיירים ברמת Prisma**: כל שאילתות ה-DB מחייבות סינון לפי `tenantId` למניעת זליגת מידע רפואי בין מוסדות קליניים.
