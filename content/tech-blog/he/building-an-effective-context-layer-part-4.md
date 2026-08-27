---
draft: true
title: "Context Layer #4: קליטת דאטה תפעולי"
slug: "building-an-effective-context-layer-part-4"
excerpt: "בנו את שכבה 1 עם Ingestion אמין, מודל Domain ואינדקסים ייעודיים שמאחדים דאטה תפעולי עבור AI Agents."
date: "2026-08-01"
coverImage: "/layer1-vendor-agnostic-model.webp"
techStack: ["AI Agents", "Context Layer", "Data Engineering", "PostgreSQL", "Elasticsearch", "Redis", "Kafka"]
language: "he"
series: "context-layer"
seriesTitle: "Context Layer"
seriesOrder: 4
---

*זהו חלק 4 בסדרה בת 7 חלקים על Context Layers עבור AI Agents. אם עדיין לא קראתם את החלקים הקודמים, התחילו עם [חלק 1: מהו Context Layer](/he/tech/building-an-effective-context-layer-part-1), [חלק 2: איך מגדירים ומודדים Context Layer אפקטיבי](/he/tech/building-an-effective-context-layer-part-2), ועם [חלק 3: ארכיטקטורת Context בארבע שכבות](/he/tech/building-an-effective-context-layer-part-3).*

**TL;DR**: שכבה 1 מעתיקה דאטה תפעולי מספקים חיצוניים למאגר שבשליטתכם. היא מנרמלת את הדאטה לישויות של המוצר, כמו אנשי קשר, הודעות ושרשורים. קודם שומרים את האירוע הגולמי, אחר כך פותרים זהויות דרך Projection משותף, ולבסוף בונים אינדקס לכל שאלה שה-Agent צריך לענות עליה.

## למה שכבה 1 קיימת

נניח שה-Agent צריך למצוא את כל השיחות עם `janet@example.com` על הצעת חידוש. הוא יכול לחפש ב-Gmail, ב-WhatsApp ובתמלילי שיחות בזמן שהמשתמש מחכה. כך תשובה אחת תלויה בכמה APIs, סכמות, Rate Limits וקריאות רשת.

שכבה 1 מוציאה את העבודה הזאת מהשיחה. היא קולטת אירועים, מנרמלת אותם ושומרת אותם מאחורי Contract פנימי אחד. ה-Agent מתשאל את ה-Contract במקום ללמוד איך כל ספק עובד.

אותו דאטה מפעיל גם את שאר ה-CRM: כרטיס איש הקשר של ג׳אנט, ציר הזמן של התקשורת ותיבת הדואר המאוחדת. ה-Agent הוא עוד צרכן של מודל ה-Domain של המוצר.

<figure class="article-screenshot-figure">
  <img src="/layer1-janet-unified-inbox.webp" alt="ציר התקשורת של ג׳אנט ב-CRM" class="article-screenshot" />
  <figcaption>ציר התקשורת של ג׳אנט מאחד Gmail, WhatsApp ויומני שיחות לפיד אחד שאינו תלוי בספק.</figcaption>
</figure>

## מתחילים מהשאלות

אל תתחילו מבחירה בין PostgreSQL, Kafka ו-Elasticsearch. התחילו מהשאלות שהמוצר צריך לענות עליהן:

1. **חיפוש איש קשר**: מי זאת `janet@example.com`, ולאיזה Account היא שייכת?
2. **חיפוש בציר הזמן**: אילו הודעות, שיחות ופגישות שייכות לג׳אנט?
3. **חיפוש טקסט**: אילו שיחות מזכירות את הצעת החידוש?
4. **Identity Resolution**: האם השולחת מ-Gmail והמשתתפת ב-WhatsApp הן אותה אישה?

> **מתחילים מ-Access Patterns**: השאלות מגדירות את מודל הדאטה, האינדקסים וכלי ה-Agent. אם אי אפשר לענות דרך שאילתה מוגבלת ומאונדקסת, התכנון עדיין לא שלם.

## שומרים את האירוע לפני שמעבדים אותו

השתמשו ב-Webhooks או ב-Change Data Capture כאשר המקור תומך בהם. קריאה חיה לספק עדיין יכולה להיות מוצדקת כאשר הבקשה דורשת דאטה חדש יותר מה-Sync המוצלח האחרון. הכלי צריך לחשוף את החריגה הזאת במקום לעקוף את שכבה 1 בשקט.

מסלול ה-Ingestion כולל חמישה שלבים:

1. **Receive**: מקבלים Webhook או אירוע CDC, או ממשיכים מ-Checkpoint שמור
2. **Verify**: מאמתים את המקור, גוזרים Tenant מהגדרת האינטגרציה ובודקים את מעטפת האירוע
3. **Preserve**: שומרים את ה-Payload הגולמי ומפתח Ingestion ייחודי לפני אישור הקבלה
4. **Process**: מעבירים את האירוע דרך Kafka, SQS או תור אמין אחר ל-Worker שהוא Idempotent
5. **Reconcile**: משווים למקור לפי לוח זמנים ומשלימים רשומות חסרות

ספקים עלולים לשלוח אירוע פעמיים או בסדר שגוי. צרו מפתח ייחודי מה-Tenant, חשבון המקור, ה-ID החיצוני והגרסה. קדמו את ה-Checkpoint רק אחרי שהאירוע נשמר.

<figure class="article-screenshot-figure">
  <img src="/layer1-system-design-whiteboard.webp" alt="צינור Ingestion מונע אירועים" class="article-screenshot" />
  <figcaption>אירועי ספקים עוברים דרך Webhook Receivers ותור אמין לפני העיבוד.</figcaption>
</figure>

> **ההחלטה המרכזית בשכבה 1**: שמרו דאטה בשפה של ה-Domain שלכם, לא בשפה של Gmail, WhatsApp או ספק אחר.

### מנרמלים ספקים למודל Domain אחד

Gmail, WhatsApp ו-Twilio מתארים רעיונות דומים דרך Payloads שונים. נרמלו אותם לישויות כמו `Contact`, `Message` ו-`Thread`.

```typescript
type SourceIdentity = {
  provider: string;
  sourceAccountId: string;
  externalId: string;
};

interface Contact {
  id: string;
  tenantId: string;
  displayName: string;
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

ה-IDs של `Contact` ושל `Message` הם פנימיים. `SourceIdentity` שומר את חשבון המקור ואת ה-ID החיצוני לצורך Deduplication ו-Lineage. ספק חדש דורש Adapter חדש, אבל לא משנה את כלי אנשי הקשר וההודעות של ה-Agent.

### פותרים זהות דרך צינור ה-Ingestion

אחרי שהאירוע הגולמי נשמר, הצינור יכול לבדוק אם ג׳אנט מ-Gmail וג׳אנט מ-WhatsApp הן אותה אישה. התהליך יכול להיות אסינכרוני כדי שמקרה לא ודאי לא יחסום Ingestion.

התחילו מאימיילים מאומתים, מזהי מקור, מספרי טלפון והקשר של Account. שמרו את הראיות, שיטת ההתאמה וה-Confidence של כל קישור. כאשר הראיות חלשות, השאירו אנשי קשר נפרדים והעבירו את ההצעה ל-Review.

> **פותרים זהות פעם אחת**: כל הצרכנים צריכים להשתמש באותו Canonical Projection במקום להחליט על זהות בעצמם.

### שומרים מצב נוכחי והיסטוריה

ישות יכולה להשתנות אחרי Ingestion. איש קשר או הערת CRM הם Mutable. הודעה שנשלחה היא בדרך כלל Append Only, אבל ספק יכול לערוך או למחוק אותה. שלב עסקה הוא רצף של מעברי מצב.

שמרו Projection נוכחי לשאלות על מה שנכון עכשיו, והיסטוריה לשאלות על מה השתנה. עדכון צריך לשאת Source Version או זמן עדכון. מחיקה צריכה להתפשט ל-Projections, לאינדקסים, ל-Caches ולשכבות הנגזרות.

> **שומרים את המצב ואת ההיסטוריה שלו**: כל תוצאה צריכה לכלול מקור וזמן עדכון, כדי שה-Agent יוכל להבדיל בין עובדה נוכחית לבין אירוע היסטורי.

### מתאימים כל שאלה למסלול אחסון

| שאלת מוצר | מסלול אחסון | אינדקס נדרש |
|---|---|---|
| מי זה איש הקשר? | Relational Database | Tenant, ספק, חשבון מקור ו-ID חיצוני |
| מה קרה בשרשור? | Relational Database | Tenant, שרשור, זמן ו-ID |
| אילו הודעות מזכירות את החידוש? | PostgreSQL או Elasticsearch | GIN או Lucene Inverted Index |
| האם זו שליפה חמה שחוזרת? | Redis אחרי מדידה | Cache Key עם תפוגה |

התחילו עם PostgreSQL או Relational Database אחר כ-System of Record. הוסיפו Elasticsearch רק כאשר צריך Scale נפרד, Fuzzy Matching או כוונון רלוונטיות עמוק יותר. Elasticsearch משתמש ב-[Lucene indexes](https://www.elastic.co/docs/manage-data/data-store/index-basics), לא ב-GIN.

> **כל שאילתה צריכה אינדקס ו-Cursor**: Limit בלי Continuation Cursor מסתיר רשומות ישנות ונותן ל-Agent היסטוריה חלקית.

### הרשאות ו-Retention הם חלק מה-Contract

העתקת דאטה מספק חיצוני מעתיקה גם את חובות האבטחה והפרטיות שלו. כל שורה, מסמך חיפוש, Cache ו-Payload גולמי צריכים גבול Tenant. כלי Agent חייבים להפעיל Authorization לפני שהמידע נכנס ל-Context של המודל.

שמרו Payloads גולמיים רק כל עוד Replay, Audit או דרישה משפטית מצדיקים זאת. הצפינו שדות רגישים והפיצו בקשות מחיקה לכל העותקים וה-Projections.

> **ההרשאה נעה עם הדאטה**: כל Projection צריך לשמור Tenant Scope, הרשאות מקור, Retention ומצב מחיקה.

## מתחילים קטן בלי לסגור אפשרויות

לא צריך Kafka, Elasticsearch ו-Redis ביום הראשון. Webhook Worker ו-PostgreSQL יכולים להספיק. הוסיפו תשתית כאשר מדידה מראה מגבלה: Search Engine כאשר חיפוש במסד הנתונים כבר לא עומד בדרישה, ו-Cache כאשר קריאות חוזרות הופכות לצוואר בקבוק.

<figure class="article-screenshot-figure">
  <img src="/layer1-start-small.avif" alt="ארכיטקטורת שכבה 1 שגדלה לפי מגבלות מדודות" class="article-screenshot" />
  <figcaption>מתחילים במערכת השלמה הקטנה ביותר ומוסיפים Search, Cache ותור לפי צורך מדוד.</figcaption>
</figure>

## חושפים ל-Agent כלים צרים

ה-Agent לא צריך לדעת איזה ספק, מסד נתונים או אינדקס משרתים את הבקשה. תנו לו כלי Domain קטנים:

* `findContact`: פותר אימייל, טלפון או Source Identity ל-Contact קנוני
* `listContactMessages`: מחזיר עמוד כרונולוגי של הודעות
* `searchMessages`: מחפש טקסט בתוך Tenant, Contact, Account או טווח זמן

כל תשובה צריכה לכלול Continuation Cursor, טריות ומזהי מקור.

## טעויות בשכבה 1 שיוצרות Context גרוע

1. שדות של ספק דולפים למודל ה-Domain
2. Identity Resolution מסתמך על שם תצוגה או ראיה חלשה
3. שאילתות מחזירות היסטוריה חלקית ללא Pagination
4. אירועים שנכשלו נעלמים בלי Payload, Error Type ו-Retry Count
5. התשתית גדלה לפני שהעומס מצדיק אותה

## חוזרים לחידוש של ג׳אנט

המשתמש מבקש: *"תביא לי את כל התקשורת עם `janet@example.com` על הצעת החידוש."*

שכבה 1 מטפלת בבקשה בשלוש פעולות מוגבלות:

1. `findContact` פותר את האימייל ל-Contact ID קנוני
2. `searchMessages` מחפש "הצעת חידוש" בתוך הרשומות של ג׳אנט
3. הכלי מחזיר עמוד אחד עם Lineage, טריות ו-Cursor

ה-Agent מקבל רשומות מכמה ספקים דרך Contract אחד. הוא לא מתרגם סכמות ולא מנחש אם הרשומות שייכות לאותה אישה.

## מודל ההפעלה של שכבה 1

שכבה 1 אינה אוסף אינטגרציות. היא ה-Contract התפעולי המשותף למוצר ול-Agent.

> **הכלל של שכבה 1**: קלטו דאטה לפני השיחה, פתרו זהויות פעם אחת, שמרו Authorization ו-Lineage, וענו לכל שאלה דרך כלי מוגבל ומאונדקס. השתמשו בקריאה חיה לספק רק כאשר דרישת הטריות מחייבת זאת.

המשיכו ל-[חלק 5: ניהול Context אנליטי](/he/tech/building-an-effective-context-layer-part-5) כדי לראות איך מטריקות מנוהלות נותנות ל-Agent ראיות כמותיות בלי להסתיר אי ודאות או מדיניות עסקית.
