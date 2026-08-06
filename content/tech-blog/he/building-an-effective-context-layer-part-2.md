---
title: "Context Layer #2: Evals, Evals, Evals"
slug: "building-an-effective-context-layer-part-2"
excerpt: "לפני שנכנסים לבניית Data Pipelines או Context Abstractions מורכבים, חייבים לענות על שאלה אחת מרכזית: איך מודדים מה באמת אפקטיבי? גלה את 4 רמות ה-Evals לבניית Context Layer מונחה ביצועים."
date: "2026-08-01"
coverImage: "/evals-four-tiers.png"
projectUrl: "https://github.com/ohadleshno"
techStack: ["AI Agents", "Context Layer", "Evals", "LLM Architecture", "Python", "Prompt Engineering"]
language: "he"
draft: false
series: "context-layer"
seriesTitle: "Context Layer"
seriesOrder: 2
---

*זהו חלק 2 בסדרה הטכנית על Context Layers עבור AI Agents. אם עניין אותך לקרוא את המאמר הראשון, התחל מ[חלק 1: מה זה Context Layer ולמה אתה חייב כזה](/he/tech/building-an-effective-context-layer-part-1).*

---

<figure class="article-screenshot-figure">
  <img src="/evals-four-tiers.png" alt="4 רמות ה-Evals עבור AI Agents" class="article-screenshot" />
  <figcaption>מערך ה-Evals ב-4 רמות: מבחני יחידה, בדיקות אינטגרציה, סימולציות Sandbox ומשוב אנושי.</figcaption>
</figure>

## מה זה בעצם אומר "אפקטיבי"?

בחלק הראשון של הסדרה, הגדרנו שכל AI Agent הוא בסופו של דבר execution loop המעבירה נתונים לצינורות של כפל מטריצות. הגורם המבדל בין Prototype שביר לבין מערכת Production אינו ה-Syntax של ה-Framework: אלא האיכות והמבנה של ה-Data שאתה מספק.

זה מוביל אותנו לאתגר המרכזי של חלק 2. כדי לבנות Context Layer אפקטיבי, אנחנו חייבים להתחיל מהשאלה החשובה ביותר בהנדסת AI: **איך אנחנו מזהים מה באמת אפקטיבי?**

נחזור לתרחיש העוגן שלנו: לבקש מסייען AI לשלוח מייל תודה לג'אנט על מתנת יום ההולדת שלה. לפני שכותבים שורת קוד אחת של הרכבת Context, חייבים להעריך איך נראים הצלחה וכישלון בדומיין הספציפי שלך:
* מה קורה אם ה-Agent שולח את המייל לג'אנט הלא נכונה?
* מה קורה אם הוא מודה על ספל קפה כאשר היא בעצם הביאה בלנדר?
* מה קורה אם הוא משתמש ב-Tone הלא נכון?

למוצרים שונים יש סדר עדיפויות שונה לחלוטין:
* **הגישה הקפדנית של Directory Strict**: עבור אפליקציית HR ארגונית, זיהוי ג'אנט הנכונה (ג'אנט מניהול מול ג'אנט המתמחה) הוא בסדר עדיפויות עליון. נמען שגוי הוא דליפת אבטחה חמורה.
* **גישת Human In The Loop**: עבור כלי לסייען ניהולי, לבחור מזהה פנימי שגוי בזמן טיוטת ההודעה זה נסבל, כל עוד המערכת מציגה את הבחירה לפני השליחה כך שהמשתמש יכול לתקן אותה ("תכננתי לג'אנט מניהול, לא לג'אנט המתמחה").
* **גישת Tone First**: עבור אפליקציה המבוססת על אישיות, העדיפות העליונה עשויה להיות ה-Tone הפסיבי אגרסיבי של ההודעה. מייל התודה צריך לפגוע ב-Tone הסיינפלדי המדויק ("תודה על המתנה, אשתדל למצוא לזה פינה בארון בסופו של דבר.") כדי שג'אנט תבין שהמתנה בסדר, אבל לא מעבר.

לפני שבונים פיצ'רים של Context, חייבים להעריך: אילו פונקציות קריטיות המערכת שלך חייבת לבצע בצורה מעולה, אילו פונקציות יכולות להיות רק בסדר, ואיפה אפשר להשלים עם פשרות?

---

## פילוסופיית "Evals, Evals, Evals"

אם סטיב באלמר היה מעביר כיום הרצאה מרכזית על הנדסת AI Agents, הוא לא היה צועק "Developers, developers, developers!". הוא היה מזיע דרך החולצה שלו וצועק מילה אחת: **Evals! Evals! Evals!**

<iframe src="https://www.youtube.com/embed/Vhh_GeBPOhs" width="100%" height="450" style="border:none;border-radius:12px;" loading="lazy" title="Steve Ballmer Developers" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

בניית Context Layer ללא מערך Evaluation היא כמו ניווט ספינה ללא מצפן. אתה תבלה שבועות בבניית צינורות Graph RAG מורכבים או טריקים של Vector Retrieval מבלי לדעת אם באמת שיפרת את המערכת או הכנסת רגרסיות שקטות. הערכה (Evaluation) היא עולם שלם, אבל כשבונים Context Layers עבור Agents, הבדיקות מתחלקות לארבע רמות מעשיות.

---

## 4 הרמות של הערכת Agents ו-Context

<figure class="article-screenshot-figure">
  <img src="/evals-four-tiers-pyramid.png" alt="פירמידת 4 רמות ה-Evals עבור AI Agents" class="article-screenshot" />
  <figcaption>פירמידת 4 רמות ה-Evals עבור AI Agents: בדיקות יחידה, בדיקות אינטגרציה, סימולציות Sandbox ומשוב אנושי.</figcaption>
</figure>

### רמה 1: בדיקות דטרמיניסטיות ותכנותיות (Functional and Execution)

בדיקות ברמה 1 מתמקדות אך ורק במכניקת הביצוע. האם המערכת ביצעה את הפעולה המבוקשת מבלי לזרוק שגיאות או להפר מגבלות פורמט?

הבדיקות המרכזיות כוללות:
* **תקינות Payload ו-Syntax**: האם המודל הפיק JSON תקין התואם ל-Schema המבוקש?
* **קריאה ל-Tools (Tool Invocation)**: האם המערכת הפעילה את כלי היעד או עדכנה את מצב ה-Database?
* **מגבלות בטיחות ו-PII**: האם המערכת נמנעה מדליפת מידע רגיש או מפעולות מחוץ לתחום?

**התרחיש של ג׳אנט**: האם ה-Agent חיפש ב-Directory, מצא רשומה, ובנה Payload תקין של מייל מבלי לקרוס? בדיקה זו מאמתת שהמערכת רצה, אך היא אינה אומרת אם היא עשתה את הדבר הנכון.

```python
from pydantic import BaseModel, EmailStr

class EmailPayload(BaseModel):
    recipient_email: EmailStr
    subject: str
    body: str

# Tool Execution Sequence
def assert_tool_sequence(agent_trace: list[dict], required_tools: list[str]):
    called_tools = [s.get("tool") for s in agent_trace if "tool" in s]
    for tool in required_tools:
        assert tool in called_tools, f"Missing required tool call: '{tool}'"

# Output Schema Validation
def assert_output_schema(agent_output: dict) -> EmailPayload:
    return EmailPayload(**agent_output)

# PII Leak Prevention
def assert_no_pii_leak(body_text: str, blocked_fields: list[str]):
    body_lower = body_text.lower()
    for field in blocked_fields:
        assert field not in body_lower, f"PII Leak: '{field}' detected in body"
```

---

### רמה 2: בדיקות הקשר ונאמנות (Data Fidelity ו-RAG Triad)

בדיקות ברמה 2 מעריכות את דיוק המידע ומניעת הזיות (Hallucinations) באמצעות עקרונות מתוך ה-RAG Triad:
* **Retrieved Relevance**: האם ה-Context Layer שלף מידע שבאמת מכיל את הפרטים הנדרשים לפעולה?
* **Groundedness / Faithfulness**: האם כל טענה בתשובה נשענת strictly על ה-Context שנשלף?
* **Answer Relevance**: האם הפלט מענה ישירות לכוונה של המשתמש מבלי להוסיף רעש לא רלוונטי?

**התרחיש של ג׳אנט**: האם המערכת חילצה את קבלת הקנייה המקורית עבור הבלנדר, או שהיא המציאה סיפור על ספל קפה שלא הוזכר כלל בהקשר?

```python
from pydantic import BaseModel

class StructuredDraft(BaseModel):
    body: str
    referenced_item: str

# Retrieved Relevance
def assert_retrieval_relevance(retrieved_docs: list[dict]):
    assert len(retrieved_docs) > 0, "Retrieval miss: no documents fetched"

# Groundedness via Structured Output
def assert_groundedness(referenced_item: str, retrieved_docs: list[dict]):
    doc_text = " ".join(d.get("content", "") for d in retrieved_docs).lower()
    assert referenced_item.lower() in doc_text, \
        f"Ungrounded claim: '{referenced_item}' not supported by retrieved docs"

# Answer Relevance
def assert_answer_relevance(draft_body: str):
    body_lower = draft_body.lower()
    assert any(token in body_lower for token in ["thank", "appreciation", "grateful"]), \
        "Off-topic: draft does not fulfill gratitude intent"
```

---

### רמה 3: בדיקות מסלול ולוגיקה (Execution History)

בדיקות ברמה 3 בוחנות איך ה-Agent הגיע להחלטה שלו על ידי ניתוח ה-Trace Logs וצעדי החשיבה שבדרך:
* **Entity Selection Accuracy**: האם המערכת מיפתה פרמטרים עמומים לישות הנכונה בעולם האמיתי?
* **Step Efficiency**: האם ה-Agent פתר את המשימה ב-2 צעדים לוגיים, או שהוא נכנס ללולאה של 10 צעדים עם קריאות API כפולות?
* **Reasoning Coherence**: האם כל פעולת ביניים נובעת לוגית מהמצב של הצעד הקודם?

**התרחיש של ג׳אנט**: האם המערכת בחרה בג'אנט מניהול על בסיס היסטוריית המיילים, או שהיא בחרה בג'אנט המתמחה בגלל שהיא התעלמה מרמזי ה-Context?

```python
# Step Efficiency and Duplicate Loop Detection
def assert_step_efficiency(tool_calls: list[dict], max_allowed: int = 5):
    assert len(tool_calls) <= max_allowed, \
        f"Inefficient: executed {len(tool_calls)} steps (max {max_allowed})"
    seen_calls = set()
    for call in tool_calls:
        signature = (call.get("tool"), str(call.get("args")))
        assert signature not in seen_calls, \
            f"Redundant loop: duplicate call to {signature[0]}"
        seen_calls.add(signature)

# Entity Selection Accuracy
def assert_entity_selection(tool_calls: list[dict], expected_recipient_id: str):
    send_step = next((s for s in tool_calls if s.get("tool") == "SendEmail"), None)
    assert send_step is not None, "Missing action: SendEmail tool never called"
    selected_id = send_step.get("args", {}).get("recipient_id")
    assert selected_id == expected_recipient_id, \
        f"Entity error: selected '{selected_id}', expected '{expected_recipient_id}'"

# Reasoning Coherence and Tool Order
def assert_reasoning_coherence(tool_calls: list[dict]):
    tool_names = [s.get("tool") for s in tool_calls]
    assert "SearchDirectory" in tool_names, "Incoherent: directory search missing"
    assert tool_names.index("SearchDirectory") < tool_names.index("SendEmail"), \
        "Incoherent: email sent before searching directory"
```

---

### רמה 4: בדיקות איכות וטון (Tone and Persona)

בדיקות ברמה 4 מעריכות איכות סובייקטיבית, התאמת Tone ועמידה בחוקים מורכבים:
* **Tone and Persona Alignment**: האם סגנון הכתיבה מתאים ל-Persona המבוקשת?
* **Constraint Satisfaction**: האם הפלט כיבד הנחיות משתמעות (כמו "שמור על זה מתחת לשלושה משפטים" או "אל תישמע נלהב מדי")?
* **Completeness and Task Success**: אישור מקצה לקצה שהמטרה המרכזית הושגה כראוי מנקודת המבט של המשתמש.

**התרחיש של ג׳אנט**: האם המייל פגע ברמת ה-Tone הפסיבי אגרסיבי הנדרשת?

```python
import json
from openai import OpenAI

client = OpenAI()

# Structural Constraint (Sentence Count)
def assert_sentence_constraint(draft_text: str, max_sentences: int = 3):
    sentences = [s for s in draft_text.split(".") if s.strip()]
    assert len(sentences) <= max_sentences, \
        f"Verbosity error: {len(sentences)} sentences (max {max_sentences})"

# Qualitative Tone and Persona Alignment
def assert_persona_tone(draft_text: str, target_persona: str) -> dict:
    sys_prompt = (
        f"The user's communication style is: {target_persona}.\n"
        "Rate how well this draft matches that style.\n"
        "Score 1-5: 1=completely wrong tone, 5=perfect match.\n"
        'Return JSON: {"score": int, "reasoning": str}'
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": draft_text}
        ]
    )
    result = json.loads(response.choices[0].message.content)
    assert result["score"] >= 4, f"Tone mismatch ({result['score']}/5): {result['reasoning']}"
    return result
```

### מטריצת סיכום ההערכה

חיבור כל ארבע הרמות יחד עבור תרחיש המייל לג'אנט יוצר מטריצת Evaluation שלמה:

<figure class="article-screenshot-figure">
  <img src="/evals-metrics-dashboard.png" alt="Dashboard של מטריקות הערכה עבור Context Layer" class="article-screenshot" />
  <figcaption>מטריצת הערכה ומעקב עבור Context Layer: מדדי Precision, Recall, Latency וחיסכון בעלויות Tokens.</figcaption>
</figure>

| Tier | מה נבדק? | שאלת הבדיקה בתרחיש של ג'אנט |
|------|--------|---------------------|
| **Tier 1** (Execution) | Tool Sequence, Schema, PII | האם ה-Agent הפעיל `SearchDirectory` ואז `SendEmail` עם Payload תקין וללא דליפת PII? |
| **Tier 2** (Context) | Retrieved Relevance, Groundedness | האם ה-Draft מזכיר את הבלנדר מתוך הקבלה שנשלפה, ללא פריטים שהומצאו? |
| **Tier 3** (Trajectory) | Entity Selection, Step Count, Order | האם ה-Trace אישר שג'אנט מניהול נבחרה, מתחת ל-5 צעדים, עם Search לפני Send? |
| **Tier 4** (Qualitative) | Tone, Persona, Constraints | האם ה-Tone תאם את ה-Persona הפסיבית אגרסיבית של המשתמש, ומתחת ל-3 משפטים? |

---

## מלכודות ואסטרטגיות מתקדמות: מה עוד אפשר לעשות?

4 הרמות שתיארנו הן נקודת ההתחלה, לא הסוף. יש עשרות גישות Evaluation נוספות שעובדות טוב יותר או גרוע יותר בהתאם לדומיין שלך. יש צוותים שמדלגים על כל מה שתואר למעלה ומסתמכים אך ורק על A/B Testing מול משתמשים חיים: לחכות לפידבק שלילי ב-Production היא הגישה העצלנית והמסוכנת ביותר, אבל היא קיימת כשהמערכת חסרה בדיקות אוטומטיות.

ככל שה-Context Layer שלך גדל ב-Production, תיתקל בארבע מלכודות Evals נפוצות:

```mermaid
flowchart TD
    TRAP["Evals Pitfalls"] --> P1["1. Single-Run Flakiness<br/>(אקראיות של LLM בדיקות CI)"]
    TRAP --> P2["2. הטיות של LLM-as-a-Judge<br/>(העדפת מודלים מאותה משפחה)"]
    TRAP --> P3["3. עיוורון לעלויות ו-Latency<br/>(ריצה של 12 שניות בעלות $0.40)"]
    TRAP --> P4["4. Output-Only Myopia<br/>(התעלמות מכשלי שליפת Context)"]
```

### 1. מלכודת הריצה הבודדת (Single-Run Flakiness)
בגלל ש-LLMs הם אינם דטרמיניסטיים, הרצת סבב בדיקה בודד בצינור ה-CI/CD מעניקה תחושת ביטחון מוטעית. Agent עשוי לעבור בדיקת מסלול ברמה 3 בפעם אחת מתוך 5 בגלל מזל בלבד. חייבים להריץ Evals לאורך מספר איטרציות כדי למדוד אחוזי מעבר סטטיסטיים.

### 2. הטיית LLM-as-a-Judge
כאשר משתמשים במודלים כמו `gpt-4o` כדי לשפוט פלטים ברמה 4, המעריכים מציגים הטיות שיטתיות: העדפת תשובות ארוכות, מתן ציון גבוה לפלטים מזהים של אותה משפחת מודלים, או המצאת נימוקים לציון.

### 3. התעלמות מעלות, Latency ויעילות Tokens
נכונות היא רק מחצית מהמשוואה. אם ה-Context Layer שלך שולף 50,000 Tokens של היסטוריה גולמית, לוקח 12 שניות ועולה $0.40 לכל הרצה רק כדי לשלוח מייל תודה פשוט לג'אנט, הארכיטקטורה שלך שבורה ב-Production.

### 4. הערכת הפלט בלבד (Output-Only Myopia)
בדיקת המייל הסופי בלבד מסווה את הסיבה לכישלון. האם זה היה כשל שליפה (ה-Context Layer שלף את ג'אנט הלא נכונה), כשל דחיסת Context (נתונים הושמטו), או כשל במעקב אחר הנחיות (ה-LLM התעלם מהמידע שנשלף)?

---

## מאיפה מתחילים? פיתוח מונחה Benchmark Simulation

<figure class="article-screenshot-figure">
  <img src="/evals-benchmark-simulation.png" alt="פיתוח מונחה Benchmark Simulation: גיבוש Baseline ומדידת אימפקט לפני בניית כלים" class="article-screenshot" />
  <figcaption>פיתוח מונחה Benchmark Simulation: גיבוש Baseline ומדידת אימפקט לפני בניית כלים.</figcaption>
</figure>

עכשיו כשאתה יודע איך לבדוק את המערכת שלך, איך מחליטים מה לבנות קודם? בדיוק כמו בכל פיתוח תוכנה ב-Production, מתחילים עם **Benchmark Simulation Driven Development**:
1. **אוספים נתוני אמת**: מגבשים Dataset ריאליסטי של אינטראקציות Production או בדיקות משתמשים.
2. **מריצים הערכת בסיס (Baseline)**: מריצים את המערכת הנוכחית מול ה-Benchmark ומקבלים ניקוד בסיסי בכל ארבע הרמות.
3. **מתעדפים צווארי בקבוק**: מזהים באיזו רמה מתקבל הניקוד הנמוך ביותר או הסיכון הגבוה ביותר עבור יעדי המוצר שלך.

לפני שכותבים קוד עבור פיצ'ר Context חדש, אתה חייב להיות מסוגל להגיד:

> *"אם אני אבנה את כלי ה-Entity Resolution הספציפי הזה, ניקוד ה-Trajectory Accuracy שלנו יעלה ב-30%."*

אם אתה לא יכול להגיד את המשפט הזה כשהוא מגובה בנתוני Evaluation, אתה מבזבז את זמן הפיתוח שלך על תשתיות שלא הוכחו.

---

## Offline Evals מול ניטור בזמן אמת ב-Online

הערכה ב-Offline בזמן פיתוח וב-CI/CD היא חיונית, אך הערכת Offline בלבד אינה מספיקה. חייבים לבצע הערכה רציפה גם ב-Online במערכת הייצור.

בדיקות Offline מאמתות את הנחות היסוד לפני העלאת הקוד. ניטור Online מפקח על Prompts של משתמשים אמיתיים, מזהה קפיצות ב-Latency, מגלה סטיות שליפה, ולוכד פידבק משתמשים בזמן אמת.

לצלילה עמוקה למסגרות הערכה ב-Production ו-Online Observability, מומלץ לקרוא את המדריכים הבאים:
* [Datadog LLM Evaluation Framework & Best Practices](https://www.datadoghq.com/blog/llm-evaluation-framework-best-practices/)
* [Langfuse Evals & Production Monitoring Guide](https://langfuse.com/blog/2025-11-12-evals)

---

## מה הצעד הבא?

ברגע שבנית את מערך ה-Evaluation שלך וזיהית את צווארי הבקבוק המרכזיים, אתה מוכן לבנות Context Abstractions שמשנות באופן ישיר את התוצאות.

ב-[חלק 3: ארכיטקטורת 4 השכבות של ה-Context Layer](/he/tech/building-an-effective-context-layer-part-3), נצלול לארכיטקטורת התשתית המלאה ונבין איך לבנות Data Layer רב-שכבתי עבור AI Agents.
