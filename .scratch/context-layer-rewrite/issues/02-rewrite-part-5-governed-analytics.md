# 02: Rewrite Part 5 around governed analytical context

**What to build:** Rewrite Part 5 as an accessible but technically deep explanation of how the CRM determines whether Janet's current silence is unusual. Derive the design from the question, define the metric contract, and separate analytical evidence from the policy that chooses an action.

**Blocked by:** 01: Establish the Part 4 series benchmark.

**Status:** ready-for-human

- [x] The article opens with Janet's unanswered conversation and includes a concise TL;DR.
- [x] Layer 2 is defined as a governed analytical interface rather than a batch pipeline.
- [x] Response latency has explicit pairing, business hours, cohort, sample size, event time, window, version, and freshness semantics.
- [x] Right censored silence and survival probability are explained in concrete language without turning the article into a statistics textbook.
- [x] A bounded agent payload returns the metric value, method, cohort, sample size, uncertainty, freshness, version, and lineage.
- [x] The article clearly separates analytical evidence from a versioned business policy that decides whether to wait or escalate.
- [x] PostgreSQL, warehouse queries, ClickHouse, and maintained serving tables are compared by access pattern and workload.
- [x] Late events, corrected records, contact merges, backfills, failed refreshes, and point in time reproducibility are covered.
- [x] Janet's opening question is resolved through explicit tool calls and a restrained recommendation.
- [x] The article ends with a Layer 2 Rule and links factual claims to primary sources.
