# 03: Rewrite Part 6 around versioned materialized claims

**What to build:** Rewrite Part 6 around an invoice dispute involving Janet. Explain how the CRM materializes expensive derived claims before the interactive agent path while preserving evidence, versions, operating state, and safe failure behavior.

**Blocked by:** 01: Establish the Part 4 series benchmark.

**Status:** ready-for-human

- [x] The article opens with Janet's invoice dispute and includes a concise TL;DR.
- [x] A preprocessed signal is defined as a versioned derived claim linked to source evidence, not an unquestionable fact.
- [x] The preprocessing decision considers expected use, avoided latency, freshness, refresh cost, storage cost, privacy, and error cost.
- [x] The processing flow uses a source transaction, outbox, dispatcher, correct task fanout, idempotent workers, validation, and a signal store.
- [x] The agent contract distinguishes `ready`, `pending`, `stale`, `failed`, and `review_required`, with fallback behavior for each state.
- [x] The signal payload includes source version, extractor version, schema version, evidence, confidence, produced time, and review state.
- [x] Bedrock, Anthropic, and OpenAI batch and caching economics are described separately and dated.
- [x] Evaluation covers precision, recall, field accuracy, confidence thresholds, important slices, abstention, and downstream agent outcomes.
- [x] Storage guidance distinguishes typed relational fields, JSONB details, large artifacts, and ML feature stores by access pattern.
- [x] Janet's opening question is resolved through materialized evidence while preserving uncertainty and human review.
- [x] The article ends with a Layer 3 Rule and links factual claims to primary sources.
