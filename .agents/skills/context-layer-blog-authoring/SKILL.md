---
name: context-layer-blog-authoring
description: Guidelines, structural principles, and formatting rules for writing technical blog posts on Context Layers for AI Agents.
---

# Context Layer Technical Blog Post Authoring Guidelines

This skill documents the complete structure, content focus, visual design rules, and language constraints for authoring and maintaining the 7-part technical blog series on Context Layers for AI Agents.

---

## 1. The 7-Part Series Structure

Every Context Layer series post must fit strictly into one of the seven designated parts:

* **Part 1: Context Layer #1: Why Your Agent Fails**
  * Core agent execution loop architecture (`System Prompt + Environment Context + History -> LLM -> Tool Call`).
  * Prompt wrappers vs environment context precision.
* **Part 2: Context Layer #2: Evals, Evals, Evals**
  * The 4-tier Evals testing framework (Unit, Integration, Simulation Sandbox, Human Feedback).
  * Evaluation metrics matrix: Precision, recall, latency, cost per token.
* **Part 3: Context Layer #3: The 4 Layer Architecture Blueprint**
  * **Series Architecture Hub**: Janet CRM story, naive ad-hoc API integration flowchart, 5 problems with ad-hoc API calls, 4-layer architecture flowchart, and core value proposition comparison table.
  * **Layer Narrative Structure**:
    1. **Raw Data Layer**: Fetch raw data as is without calling external APIs. Consolidate multi-vendor data into a **Relational Database** with dedicated indices for every question type.
    2. **Analytical Data Layer**: Provide dedicated analytical engines/tools (like ClickHouse or pre-computed rollups) so the AI Agent queries metrics directly instead of calculating numbers on demand inside the prompt.
    3. **Preprocessed Signal Layer**: Asking what data can be processed in advance. Asynchronously extracting sentiment/intent and multimodal OCR image text (PDF invoice line items).
    4. **Semantic High-Level Layer (The Brain)**: Answering hard human questions (*"How do I usually answer?"*, *"What do I think about Janet?"*). Semantic layer over underlying data consumed from system interaction history (Memory) and live operational data.
  * **Links**: Links to Parts 4-7 for low-level data engineering implementations.
* **Part 4: Context Layer #4: Ingesting Raw Operational Data**
  * Real-time ingestion pipelines (Webhooks / CDC / Kafka) vs scheduled ETL.
  * Domain modeling (`OperationalMessage`, `OperationalContact`) and 3 core access patterns (B-Tree contact lookup, GIN full-text search, identity resolution).
* **Part 5: Context Layer #5: Precomputing Analytical Intelligence**
  * Analytical query engines (ClickHouse / Apache Spark / dbt rollups).
  * Quantitative baselines: Deal volume/velocity, p50/p90 client response latency silence detection, ARR triage ratios.
* **Part 6: Context Layer #6: Preprocessed Data & Multimodal OCR**
  * Asynchronous Kafka feature extraction before LLM invocation.
  * Sentiment/intent classification, document/PDF invoice OCR parsing into clean JSON fields, action-required flags.
* **Part 7: Context Layer #7: The Brain (Graph RAG & Memory)**
  * Long-term organizational memory, persona voice alignment, hybrid vector search, Graph RAG entity linking, dual memory streams.

---

## 2. Article Focus & Content Guidelines

### Part 3 Specific Guidelines
* **Narrative & Question-Driven Structure**: Part 3 must explain each layer intuitively using Janet's CRM business story and the exact question types that layer enables the AI Agent to answer.
* **Ad-Hoc API Integration Breakdown**:
  - Section heading: `## The Problems with Ad-Hoc API Integration` (EN) / `## הבעיות בחיבור APIs ישיר` (HE).
  - Break down engineering bottlenecks cleanly without generic listicle H3 headers.
* **Layer Takeaway Blockquotes**:
  - Every layer section (Layer 1, Layer 2, Layer 3, Layer 4) MUST end with a takeaway blockquote formatted as:
    `> **The Layer X Rule**: [Concise 1-sentence engineering takeaway]`
* **Layer 2 Core Principle**:
  - Layer 2 is NOT about forcing a specific calculation mechanism (like batch pipelines vs real-time OLAP engines); it is about providing the AI Agent with a dedicated analytical engine/tool (like ClickHouse or pre-computed rollups) so it queries pre-calculated metrics directly without calculating them on demand inside the prompt.

---

## 3. Visual & Diagramming Rules

### Mermaid Flowcharts
* **Ultra-Short Node Labels**: Keep node labels short (1-3 words max). Avoid parenthetical walls of text (e.g., write `Relational Database` instead of `Unified Operational Store (PostgreSQL / Elasticsearch)`).
* **No Arrow Label Overlaps**: Do NOT put long text labels on flowchart arrows that collide or overlap visually. Keep arrow connections unlabeled (`-->`) unless strictly necessary and short.
* **Agent Node Naming**: Standardize agent nodes to `AI Agent` (do not use `AI Agent Execution Loop`, `AI Agent Execution Engine`, or `AI Agent Analytical Tool`).

### Image Performance & Style
* **Editorial Line-Art Style**: Use custom line-art illustrations matching the reference aesthetic (`public/ai-dev-code-review.webp` style: minimalist line-art, flat colors on light background, developer at desk with clean tech metaphors).
* **No Pixel Caps in CSS**: Never squeeze high-res images using hacky CSS pixel caps (`max-width: 320px !important`).
* **Container Bounds**: Maintain `width: 100%; height: auto` on `<img>` elements while bounding article `<figure>` containers to `max-width: 560px` centered on desktop (`margin: 2rem auto !important`).

---

## 4. Strict Communication & Writing Rules

### Rule 1: NO EMOJIS
* **STRICT RULE**: Never use emojis under any circumstances in assistant messages, user interface code, Markdown content files, headers, code comments, or commit messages.

### Rule 2: NO DASHES OR EM DASHES IN PROSE
* **STRICT RULE**: Never use em dashes (—) or hyphens/dashes (-) as punctuation in written prose, headers, assistant responses, or markdown content files. Use colons, commas, or parentheses instead.

### Rule 3: SIMPLE, CONCRETE LANGUAGE (NO ABSTRACT JARGON OR ACADEMIC BUZZWORDS)
* **STRICT RULE**: Use simple, direct, developer-friendly language.
  - Avoid abstract architectural jargon: write "Relational Database" instead of "Unified Operational Store"; write "AI Agent" instead of "AI Agent Execution Engine".
  - Avoid overly complex academic vocabulary (NEVER write "heterogeneous", "paradigmatic", "ubiquitous", "synergistic", or "dichotomy"). Write in plain, clear engineering terms (for example: write "mixed formats" or "different APIs" instead of "heterogeneous data sources").

### Rule 4: HEBREW TECHNICAL TERMS & PHRASING
* **STRICT RULE**: In Hebrew markdown files, keep all technical jargon, developer terminology, UI states, and concepts in clean English or native Israeli tech phrasing:
  - `Data Engineering`, `Apache Airflow`, `Apache Spark`, `Context Layer`, `Raw Operational Data`, `Analytical Data`, `Relational Database`, `ClickHouse`, `ETL`, `SQL`, `ARR`, `p50/p90 Latency`, `Index`, `Schema`, `Pipeline`, `AI Agent`, `LLM`, `CRM`, `dbt`, `Parquet`, `Vector Search`, `Elasticsearch`, `Graph RAG`, `OCR`, `Kafka`, `Webhooks`, `CDC`, `Change Data Capture`, `Context Switching`, `Refactoring`, `Clean Code`, `Production`, `Domain`, `Review`, `Pagination`, `Over-mocking`, `Assertions`, `Guardrails`, `Linter`, `CI/CD`, `Testcontainers`, `MCP`, `Model Context Protocol`, `Sentry`, `Datadog`, `Telemetry`, `TDD`, `Debugging`, `Debug`, `Open Specs`.
* **NO LITERAL MACHINE TRANSLATIONS OR HEBREW TRANSLITERATIONS**: Never translate developer slang literally or transliterate common English tech terms into awkward Hebrew script (e.g., NEVER write "דיבאגינג" or "לדיבאג" — write "debugging" or "לעשות debugging"; NEVER write "גלגלי טעינה" — write "ספינר"; NEVER write "קוד מומצא" — write "הזיות של AI").
* **NEVER USE ARCHAIC/MEDIEVAL SYNTAX**: Never write "לקוח זה", "תמונה מצורפת זו", or "אימייל נכנס זה". Always use modern Hebrew demonstratives: "הלקוח הזה", "התמונה המצורפת", "האימייל הנכנס הזה".
* **HEBREW PHRASING & PROPER GERESH**:
  - Always use natural, idiomatic Hebrew possessive phrasing: write `התרחיש של ג׳אנט` instead of `תרחיש ג'אנט`.
  - Use proper geresh/gershayim for non-Hebrew names: write `ג׳אנט` with geresh `׳`.

### Rule 5: DRAFT STATUS
* Mark work-in-progress posts with `draft: true` in the YAML frontmatter:
  ```yaml
  ---
  draft: true
  title: "Building an Effective Context Layer for AI Agents..."
  slug: "building-an-effective-context-layer-part-3"
  ---
  ```
