---
name: linkedin-post-authoring
description: Guidelines, voice, tone, formulas, and strict formatting rules for authoring technical LinkedIn posts based on Ohad's writing style.
---

# Technical LinkedIn Post Authoring Guidelines

This skill documents the structure, voice, tone, structural formula, and strict constraints for drafting technical LinkedIn posts for blog articles and engineering insights.

---

## 1. Core Voice and Persona

* **Senior AI / Software Engineering Perspective**: Authoritative, direct, pragmatic, and grounded in real production engineering.
* **Zero Hype and Zero Fluff**: Avoid generic marketing buzzwords, AI hype, or surface level advice. Focus on architecture, trade offs, and root causes.
* **First Principles Reductionism**: Demystify complex topics by breaking them down to basic primitives (for example: execution loops, context windows, deterministic business logic).
* **Myth Busting and Counter-Intuitive Truths**: Challenge industry fads and lazy shortcuts directly.

---

## 2. Post Blueprint Formula

Every post should follow this 6 step narrative arc:

1. **The Hook (Lines 1 to 2)**
   * A bold, provocative thesis statement or myth busting premise.
   * *Example*: "Your AI agent is not broken because of the model. It is broken because the data going into the context window is garbage."

2. **The Industry Obsession or Shortcut**
   * Call out what most teams focus on versus the actual bottleneck or mistake.
   * *Example*: "Everyone is obsessing over which LLM to use and which framework to pick. Meanwhile, the actual bottleneck is sitting right in front of them."

3. **The First Principles Definition**
   * Reduce the complex system to its fundamental execution loop or mechanics.
   * *Example*: "An AI agent is just an execution loop calling an LLM with a context window. That is it."

4. **The Naïve Failure Pattern**
   * Expose what teams do when they try to bypass real engineering work.
   * *Example*: "So teams dump raw API responses, unindexed logs, and entire database exports into the prompt and pray the model will 'figure it out.' It will not."

5. **The Paradigm Shift or Engineering Solution**
   * Introduce the core thesis or system fix clearly.
   * *Example*: "The fix is not a better model. It is a Context Layer: a system that resolves entities, curates facts, and pre-indexes patterns before the model ever sees a single token."

6. **Punchy Closing and Call to Action**
   * Short, rhythmic staccato summary, followed by a link reference.
   * *Example*: "Same model. Clean context. Completely different output.\n(Link to full post in the first comment)"

---

## 3. Strict Formatting Rules

* **Length Target**: Keep posts concise, around 70 to 90 words total (5 to 7 short paragraphs), matching the author's reference style.
* **STRICT RULE: NO GENERIC SLOGANS OR TAGLINES**: Never use cheesy LinkedIn slogans, dramatic triadic taglines, or buzzword summaries (for example: NEVER write "No X. No Y. No Z."). End with a direct engineering call to action or a crisp comparison of inputs versus outputs.
* **STRICT RULE: NO EMOJIS**: Never use emojis under any circumstances in post content, headers, bullet points, or comments.
* **STRICT RULE: NO DASHES OR EM DASHES IN PROSE**: Never use em dashes (—) or hyphens/dashes (-) as punctuation in written prose. Use colons, commas, or parentheses instead.
* **Short Paragraphs**: Restrict paragraphs to 1 to 3 sentences maximum with double line breaks between paragraphs for maximum readability.
* **No Hashtag Spam**: Keep posts clean without trailing walls of hashtags.
* **First Comment Link Pattern**: End promotional posts with `(Link to full post in the first comment)`.
