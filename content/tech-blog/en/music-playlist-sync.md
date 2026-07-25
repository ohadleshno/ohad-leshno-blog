---
title: "Music Sync — Cross-Platform Playlist Engine Backend Design Doc"
slug: "music-playlist-sync"
excerpt: "Backend architectural breakdown of Music Sync: ISRC track resolution pipeline, dual OAuth token lifecycle management, fuzzy string search fallback, and OpenAPI design."
date: "2026-02-20"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno/music-playlist-sync"
techStack: ["Node.js", "TypeScript", "Spotify Web API", "Apple MusicKit JS", "TSOA", "Supabase", "Express"]
language: "en"
---

# Music Sync — Backend Architecture Design Doc

## Overview

Music Sync is a high-performance TypeScript backend service designed to extract music tracks from raw text and sync playlists bi-directionally between **Spotify** and **Apple Music**. It addresses catalog fragmentation across streaming services using strict ISRC resolution and fallback fuzzy matching.

---

## High-Level Request Pipeline

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

## Track Resolution Pipeline — State Transitions

```mermaid
flowchart LR
    S1[Raw Text Input] -->|Regex Extraction| S2[Track Identifiers]
    S2 -->|ISRC Query| S3{Exact ISRC Match?}
    
    S3 -- Match Found --> S4[Confidence 1.0\nDirect Catalog Pairing]
    S3 -- No ISRC --> S5[Fuzzy Search Engine]

    subgraph S5 Detail
        direction TB
        F1[Normalize Title & Artist] --> F2[Query Catalog Search API]
        F2 --> F3[Compute Levenshtein Distance]
        F3 --> F4{Distance < Threshold?}
        F4 -- Pass --> F5[Confidence Score 0.8-0.95]
        F4 -- Fail --> F6[Flag Unmatched Track]
    end

    S4 --> S7[Final Match Record]
    F5 --> S7
    F6 --> S7
```

---

## Authentication & Token Rotation Engine

```mermaid
flowchart TD
    REQ([API Operation]) --> AUTH{Token Valid?}

    AUTH -- Spotify Valid --> SP[Execute Spotify Web API]
    AUTH -- Spotify Expired --> SPR[OAuth Refresh Token Flow] --> SP

    AUTH -- Apple Valid --> AP[Execute MusicKit JWT API]
    AUTH -- Apple Expired --> APR[ES256 Private Key JWT Signer] --> AP
```

---

## Key Design Decisions

**ISRC First, Fuzzy Second.** Catalog track IDs are strictly platform-dependent. The engine requires ISRC (International Standard Recording Code) matching as the primary key. Fuzzy string matching is only invoked on cache/ISRC miss to prevent false positive track pairings.

**Decoupled Extractor Architecture.** Link extraction runs as an isolated stateless parser prior to any API calls. This avoids consuming API rate-limit quotas on invalid or malformed input text.

**Asynchronous Token Self-Healing.** Spotify OAuth tokens and Apple MusicKit Developer JWTs are managed by a centralized singleton token service (`AuthTokenService`) that handles rotation and rate-limit backoff independently of HTTP route controllers.
