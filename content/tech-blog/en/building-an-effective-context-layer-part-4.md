---
draft: true
title: "Context Layer #4: Ingesting Raw Operational Data"
slug: "building-an-effective-context-layer-part-4"
excerpt: "Build Layer 1 with reliable ingestion, domain modeling, and dedicated indexes that unify operational data for AI Agents."
date: "2026-08-01"
coverImage: "/layer1-vendor-agnostic-model.webp"
techStack: ["AI Agents", "Context Layer", "Data Engineering", "PostgreSQL", "Elasticsearch", "Redis", "Kafka"]
language: "en"
series: "context-layer"
seriesTitle: "Context Layer"
seriesOrder: 4
---

*This is Part 4 of our 7-part technical series on Context Layers for AI Agents. If you have not read the earlier installments, start with [Part 1: What Is a Context Layer](/en/tech/building-an-effective-context-layer-part-1), [Part 2: Defining and Measuring an Effective Context Layer](/en/tech/building-an-effective-context-layer-part-2), and [Part 3: The 4-Layer Context Architecture](/en/tech/building-an-effective-context-layer-part-3).*

**TL;DR**: Layer 1 copies operational data from external vendors into a store you control. Normalize that data into the entities your system understands, such as contacts, messages, and threads. Save raw events first, resolve identities through a shared projection, then build an index for each question the agent needs to answer.

## Why Layer 1 exists

Suppose the agent needs every conversation with `janet@example.com` about a renewal proposal. It could search Gmail, WhatsApp, and call transcripts while the user waits. That makes one answer depend on several APIs, schemas, rate limits, and network calls.

Layer 1 moves that work out of the conversation. It continuously ingests vendor data, normalizes each event, and stores it behind one internal contract. The agent queries that contract instead of learning how every vendor works.

The same data powers the rest of the CRM, including Janet's contact card, communication timeline, and the unified inbox. The agent is another client of the product's core data model.

<figure class="article-screenshot-figure">
  <img src="/layer1-janet-unified-inbox.webp" alt="Janet's Unified CRM Communication Timeline" class="article-screenshot" />
  <figcaption>Janet's unified CRM communication timeline: consolidating Gmail, WhatsApp, and call logs into a single vendor-agnostic feed.</figcaption>
</figure>

## Start with the questions

Do not begin by choosing PostgreSQL, Kafka, or Elasticsearch. Begin with the questions the product must answer:

1. **Contact lookup**: Who is `janet@example.com`, and which account owns that contact?
2. **Timeline lookup**: What messages, calls, and meetings belong to this contact?
3. **Text search**: Which conversations mention the renewal proposal?
4. **Identity resolution**: Do a Gmail sender and a WhatsApp participant represent the same person?

> **Start from access patterns**: These questions define the data model, indexes, and agent tools. If a query cannot be served by a bounded, indexed access pattern, the design is incomplete.

## Ingest and save data before the agent needs it

First, get raw events into a reliable pipeline. Use webhooks or Change Data Capture (CDC) when a source supports them. A live vendor read can still be useful when a request explicitly needs data newer than the last successful sync. That exception should be visible in the tool response instead of silently bypassing Layer 1. [Part 5: Governing Analytical Context](/en/tech/building-an-effective-context-layer-part-5) explains how the stored data becomes governed analytical context.

The ingestion path follows five steps:

1. **Receive**: Accept a webhook or CDC event, or poll from the last saved checkpoint.
2. **Verify**: Authenticate the source, derive the tenant from integration configuration, and validate the event envelope.
3. **Preserve**: Save the raw payload and a unique ingestion key in a replayable event store before acknowledging it.
4. **Process**: Deliver the event through Kafka, SQS, or another durable queue to an idempotent worker.
5. **Reconcile**: Compare saved records with the source on a schedule and backfill anything missing.

Vendors may send the same event twice or send events in the wrong order. Give each event a unique key based on its tenant, source account, external ID, and version. Use that key to ignore duplicates.

Retry temporary failures a limited number of times. Keep events that still fail, together with their payload and error, so you can inspect or replay them. Advance the sync checkpoint only after saving the raw event.

<figure class="article-screenshot-figure">
  <img src="/layer1-system-design-whiteboard.webp" alt="Event-Driven AI Context Architecture" class="article-screenshot" />
  <figcaption>Vendor events pass through webhook receivers and a durable queue before workers process them.</figcaption>
</figure>

Getting events into a queue is only the first half of Layer 1. The most important decision is how your system represents and stores each event after it arrives.

> **This is the core Layer 1 decision**: Store data in your product's domain language, not in the language of Gmail, WhatsApp, or any other vendor.

### Normalize vendors into one domain model

Gmail, WhatsApp, and Twilio describe similar concepts with different payloads. Normalize those payloads into product concepts such as `Contact`, `Message`, and `Thread`.

The domain model must separate internal identities from vendor identities. It must also retain enough source data to trace every record back to the event that produced it:

```typescript
type SourceProvider =
  | "gmail" | "outlook" | "whatsapp"
  | "slack" | "twilio" | "google_calendar";
type SourceIdentity = {
  provider: SourceProvider;
  sourceAccountId: string;
  externalId: string;
};

interface Contact {
  id: string;
  tenantId: string;
  displayName: string;
  emails: string[];
  phoneNumbers: string[];
  identities: SourceIdentity[];
}

interface Message {
  id: string;
  tenantId: string;
  threadId: string;
  senderContactId: string;
  source: SourceIdentity;
  body: string;
  occurredAt: string;
  ingestedAt: string;
}
```

`Contact.id` and `Message.id` are internal identifiers. `SourceIdentity` preserves the upstream account and record identifiers used for deduplication and lineage. Adding a vendor requires a new adapter and a new `SourceProvider` value, but it does not change the agent's contact or message tools.

The array above shows the relationship in code, not how the database stores it. Store each vendor identity separately and use a unique index to prevent duplicates. This also keeps identities from different vendor accounts separate.

<figure class="article-screenshot-figure">
  <img src="/layer1-vendor-agnostic-model.webp" alt="Vendor-Agnostic Domain Schema Normalization" class="article-screenshot" />
  <figcaption>Normalizing Gmail, WhatsApp, and Twilio payloads into contacts, messages, and threads.</figcaption>
</figure>

### Resolve identity through the ingestion pipeline

After the raw event is safely stored, the ingestion pipeline should determine whether Janet from Gmail and Janet from WhatsApp are the same contact. This can happen asynchronously so uncertain matching does not block ingestion. Start with verified email addresses, source identifiers, phone numbers, and account context. Store the evidence, matching method, and confidence behind every link.

When the evidence is strong, link both vendor records to the same internal `Contact.id`. Keep the source identity rows separate so the merge remains reversible. When the evidence is ambiguous, preserve separate contacts and route the proposed match to a classifier or human review.

> **Resolve identity once**: Every consumer should use the same canonical projection instead of deciding identity independently.

### Model each entity's lifecycle

The storage model must also answer whether an entity can change after ingestion. Treating every record as immutable leaves edited notes and contacts stale. Treating every record as mutable can overwrite the history the agent needs to explain what happened.

| Source data | Typical lifecycle | Storage behavior |
|---|---|---|
| Sent email body | Usually append only | Store once and update mutable metadata separately |
| CRM note or contact | Mutable | Keep the current record and retain version history |
| Slack or WhatsApp message | Vendor dependent | Apply edits or deletion markers while retaining source lineage |
| Deal stage | State transitions | Store each transition and maintain a current projection |

Immutable does not mean that a record can never be deleted. A provider may retract an event or require data deletion. It means the original content is not normally edited in place. Represent deletion with a tombstone or lifecycle event instead of silently removing the history.

Mutable entities need a source version or update timestamp. The ingestion worker should reject stale updates, retain the previous version when history matters, and update the current projection used by agent tools.

<figure class="article-screenshot-figure">
  <img src="/layer1-data-lifecycle.avif" alt="Immutable events stored as history beside mutable records with retained versions" class="article-screenshot" />
  <figcaption>Immutable events remain in history, while mutable records keep a current projection and retained versions.</figcaption>
</figure>

> **Keep the current state and its history**: Use the current record for questions about what is true now. Use its history for questions about what changed. Include the source and last update time in every result.

### Match each question to a storage path

The access patterns from the opening now determine the storage design:

| Product question | Storage path | Required index |
|---|---|---|
| Who is this contact? | Relational database | Index on tenant, provider, source account, and external ID |
| What happened in this thread? | Relational database | Index on tenant, thread, time, and ID |
| Which messages mention this renewal? | PostgreSQL or Elasticsearch | GIN or Lucene inverted index |
| Is this a repeated hot lookup? | Redis after measurement | Expiring cache key |

**Use PostgreSQL or another relational database as the system of record.** Contacts, messages, and threads have clear relationships and transactional updates. A relational database keeps those relationships explicit and supports the exact lookups and chronological queries Layer 1 needs.

> **Every query needs an index and a cursor**: A result limit without a continuation cursor hides older records and gives the agent an incomplete history.

### Keep access control and retention in the data contract

Copying vendor data into your system also copies its security and privacy obligations. Every row, search document, cache entry, and raw payload needs a tenant boundary. Agent tools must apply authorization before retrieval, not after results have already entered the model context.

Retain raw payloads only as long as replay, audit, or legal requirements justify them. Encrypt sensitive fields, record deletion requests, and propagate provider deletions into current projections, search indexes, caches, and derived layers. A tombstone can preserve the fact that a record was deleted without preserving content that must be removed.

> **Authorization travels with the data**: A unified store must preserve tenant scope, source permissions, retention rules, and deletion state in every projection.

## Start small without closing future options

You do not need Kafka, Elasticsearch, and Redis on the first day. A webhook worker and a relational database may be enough. Add infrastructure when you reach a measured limit: add a search engine when database search no longer meets the requirement, or add a cache when repeated reads become a bottleneck.

<figure class="article-screenshot-figure">
  <img src="/layer1-start-small.avif" alt="A Layer 1 architecture growing from PostgreSQL to search, cache, and queue components as demand increases" class="article-screenshot" />
  <figcaption>Start with the smallest complete system, then add search, caching, and queue capacity at measured limits.</figcaption>
</figure>

Start search in PostgreSQL with [GIN indexes](https://www.postgresql.org/docs/current/gin.html). Add Elasticsearch only when you need independent scaling, fuzzy matching, or deeper relevance tuning. Elasticsearch uses [Lucene indexes](https://www.elastic.co/docs/manage-data/data-store/index-basics), not GIN.

Add Redis only for proven hot paths, and keep authorization reads on an authoritative source.

Keep expensive decisions reversible. You can add an index, cache, or search engine later. You cannot recover discarded payloads, lost source identities, or overwritten history. Start with the smallest architecture that serves every defined access pattern, then extend the component that reaches a measured limit.

## Expose narrow tools to the agent

The agent should not know which vendor, database, or index serves a request. Give it a small set of domain tools:

* `findContact`: Resolve an email, phone number, or source identity to a canonical contact.
* `listContactMessages`: Return a chronological page of messages for one contact.
* `searchMessages`: Search message text within a tenant, contact, account, or time range.

Each tool response should include a continuation cursor, source freshness, and source identifiers. These fields tell the agent whether more records exist, whether the data is current, and where each result came from.

<figure class="article-screenshot-figure">
  <img src="/layer1-agent-tools.avif" alt="An agent using narrow contact, timeline, and search tools over a unified data layer" class="article-screenshot" />
  <figcaption>The agent uses domain tools over one data layer instead of calling each vendor directly.</figcaption>
</figure>

## Layer 1 mistakes that produce bad agent context

Bad agent context often starts with these data engineering mistakes:

### 1. Vendor fields leak into the domain model

If `labelIds` or Gmail `threadId` values become core domain fields, every new vendor forces changes throughout the product. Keep raw payloads for audit and debugging, but normalize the fields consumed by product logic.

### 2. Identity resolution uses weak evidence

Display names are not identities. Phone numbers can be reassigned, and email aliases can change. Prefer stable source identifiers, preserve every contributing source, and route ambiguous matches to review.

### 3. Queries return an incomplete history

Unbounded queries fail at scale, while fixed limits silently hide older records. Every list or search tool needs pagination backed by an index that matches its filters and ordering.

### 4. Ingestion failures disappear

A failed event must retain its payload, source identifier, error type, and retry count. The agent also needs freshness metadata so it can distinguish "no matching message" from "Gmail has not synced."

### 5. Infrastructure grows before the workload

PostgreSQL may be enough for the initial operational store and full text search. Add Kafka, Elasticsearch, or Redis when measurements show a requirement that PostgreSQL cannot meet alone.

<figure class="article-screenshot-figure">
  <img src="/layer1-context-mistakes.avif" alt="Duplicate contacts, a broken communication timeline, and a failed ingestion event producing incomplete context" class="article-screenshot" />
  <figcaption>Weak identity resolution, missing records, and lost events produce incomplete context for every consumer.</figcaption>
</figure>

## Returning to Janet's renewal

Now return to Janet's example from the start. A user asks the AI Agent: *"Get all communications with janet@example.com discussing the renewal proposal."* How does Layer 1 solve it?

Layer 1 handles the request in three bounded operations:

1. `findContact` resolves `janet@example.com` to a canonical contact ID.
2. `searchMessages` searches for "renewal proposal" within that contact's records.
3. The tool returns one page with lineage, freshness, and a continuation cursor.

```json
{
  "items": [
    {
      "provider": "whatsapp",
      "sourceId": "wa_7391",
      "content": "Can you check the revised payment schedule in the renewal proposal?",
      "occurredAt": "2026-08-01T14:20:00Z"
    },
    {
      "provider": "gmail",
      "sourceId": "gm_4820",
      "content": "Attached is the signed renewal addendum.",
      "occurredAt": "2026-08-01T11:05:00Z"
    }
  ],
  "nextCursor": null,
  "lastIngestedAt": "2026-08-01T14:21:03Z"
}
```

The agent receives records from two vendors through one tool contract. It does not call Gmail or WhatsApp, translate vendor schemas, or guess whether both records belong to the same person.

## The Layer 1 operating model

Layer 1 is not a collection of vendor integrations. It is the operational data contract shared by the product and the agent.

> **The Layer 1 Rule**: Ingest vendor data before the conversation, resolve identities once, preserve source lineage, and serve every agent question through a bounded indexed tool.

Continue to [Part 5: Governing Analytical Context](/en/tech/building-an-effective-context-layer-part-5) to see how versioned metrics give the AI Agent quantitative evidence without hiding uncertainty or business policy.
