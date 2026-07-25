---
title: "Visual Field Analyzer — Multi-Tenant AWS Infrastructure & DICOM Processing Engine"
slug: "al-vf-analyzer"
excerpt: "Backend architectural breakdown of Visual Field Analyzer: AWS il-central-1 data residency compliance, asynchronous DICOM parsing pipeline, Terraform IaC, and Prisma ORM."
date: "2026-01-10"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno/AL_VF_Analyzer"
techStack: ["AWS (il-central-1)", "Terraform", "Node.js 22", "Prisma", "Express", "PostgreSQL", "Docker", "DICOM"]
language: "en"
---

# Visual Field Analyzer — Backend Architecture Design Doc

## Overview

The **Visual Field Analyzer (AL VF Analyzer)** is a multi-tenant clinical cloud platform engineered for Sheba Medical Center and the Goldschleger Eye Institute. It processes, analyzes, and tracks progression for Humphrey Visual Field ophthalmology diagnostic exams under strict Israeli data residency requirements.

---

## High-Level Cloud Architecture (AWS `il-central-1`)

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

## Asynchronous DICOM Processing Pipeline

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

## Security & Multi-Tenant Authorization Model

```mermaid
flowchart LR
    REQ[Client Request + JWT] --> AUTH{Cognito JWT Valid?}
    AUTH -- Invalid --> R401[401 Unauthorized]
    AUTH -- Valid --> RLS{Prisma Tenant Isolation Check}
    
    RLS -- Tenant Match --> PERM{Clinical Role Permissions?}
    RLS -- Tenant Mismatch --> R403[403 Forbidden]
    
    PERM -- Authorized --> EXEC[Execute DB Operation]
    PERM -- Unauthorized --> R403
```

---

## Key Design Decisions

**Strict AWS Israel (`il-central-1`) Placement.** To comply with medical data residency regulations for Israeli hospital infrastructure, all compute (ECS), storage (S3), and database (Aurora) resources are strictly provisioned in `il-central-1` using modular Terraform code.

**Asynchronous DICOM Parsing via SQS.** Decoding binary DICOM visual field scans and calculating progression matrices is computationally intensive. Uploads return `202 Accepted` immediately, delegating parsing to worker tasks via SQS to prevent HTTP connection timeouts.

**Prisma Multi-Tenant Isolation.** Database queries enforce mandatory `tenantId` filtering across all tables to guarantee complete clinical data isolation between medical institutions.
