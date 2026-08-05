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
    1. **Raw Data Layer**: Fetch raw data as is without calling external APIs. Solve multi-vendor queries (*"Get all emails from avi@gmail.com"*, *"Search 'coca cola'"*, *"Find Janet's phone number"*). Structured data with dedicated indices for every question type.
    2. **Analytical Data Layer**: Purely analytical questions on aggregated metrics. Deal volume & impact (1 deal/day vs 100 deals/day), silence detection via baseline response time (p50/p90 latency), and ARR triage effort allocation ($10k ARR vs $100k p50 benchmark).
    3. **Preprocessed Signal Layer**: Asking what data can be processed in advance. Asynchronously extracting sentiment/intent (frustrated client, price negotiation) and multimodal OCR image text (PDF invoice line items).
    4. **Semantic High-Level Layer (The Brain)**: Answering hard human questions (*"How do I usually answer?"*, *"What do I think about Janet?"*). Semantic layer over underlying data consumed from system interaction history (Memory) and live operational data.
  * **Links**: Links to Parts 4-7 for low-level data engineering implementations.
* **Part 4: Context Layer #4: Ingesting Raw Operational Data**
  * Real-time ingestion pipelines (Webhooks / CDC / Kafka) vs scheduled ETL.
  * Domain modeling (`OperationalMessage`, `OperationalContact`) and 3 core access patterns (B-Tree contact lookup, GIN full-text search, identity resolution).
* **Part 5: Context Layer #5: Precomputing Analytical Intelligence**
  * Batch data pipelines (Apache Spark / dbt rollups).
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
* **The Problems with Ad-Hoc API Integration**:
  - Section heading: `### The Problems with Ad-Hoc API Integration` (EN) / `### הבעיות בחיבור APIs ישיר` (HE).
  - Break down 5 problems:
    1. Multi-Vendor Rate Limits & Latency
    2. Inconsistent Schemas
    3. Cross-Vendor Search Inability
    4. Analytical Blindness
    5. Entity Ambiguity and Data Structure Ignorance (Internal `account_user_id` vs external `google_sub_id` / `whatsapp_sender_id` as explained in the *Agents vs Workflows* guide).

---

## 3. Visual & Diagramming Rules

### Mermaid Flowcharts
* **Clean Subgraph Structure**: Always use subgraphs (`subgraph Vendors["Ad-Hoc External REST API Calls"]`) with clean top-to-bottom or left-to-right node flows.
* **No Overlapping Arrows**: Never create bi-directional curved loops between the same pair of nodes. Ensure text labels on arrows do not overlap or collide.

### Image Performance
* **No Pixel Caps in CSS**: Never squeeze high-res images using hacky CSS pixel caps (`max-width: 320px !important`).
* **Container Bounds**: Maintain `width: 100%; height: auto` on `<img>` elements while bounding article `<figure>` containers to `max-width: 560px` centered on desktop (`margin: 2rem auto !important`).

---

## 4. Strict Communication & Writing Rules

### Rule 1: NO EMOJIS
* **STRICT RULE**: Never use emojis under any circumstances in assistant messages, user interface code, Markdown content files, headers, code comments, or commit messages.

### Rule 2: NO DASHES OR EM DASHES IN PROSE
* **STRICT RULE**: Never use em dashes (—) or hyphens/dashes (-) as punctuation in written prose, headers, assistant responses, or markdown content files. Use colons, commas, or parentheses instead.

### Rule 3: HEBREW TECHNICAL TERMS
* **STRICT RULE**: In Hebrew markdown files, keep all technical jargon in clean English:
  - `Data Engineering`, `Apache Airflow`, `Apache Spark`, `Context Layer`, `Raw Operational Data`, `Analytical Data`, `ETL`, `SQL`, `ARR`, `p50/p90 Latency`, `Index`, `Schema`, `Pipeline`, `AI Agent`, `LLM`, `CRM`, `dbt`, `Parquet`, `Vector Search`, `Elasticsearch`, `Graph RAG`, `OCR`, `Kafka`, `Webhooks`, `CDC`, `Change Data Capture`.

### Rule 4: DRAFT STATUS
* Mark work-in-progress posts with `draft: true` in the YAML frontmatter:
  ```yaml
  ---
  draft: true
  title: "Building an Effective Context Layer for AI Agents..."
  slug: "building-an-effective-context-layer-part-3"
  ---
  ```
