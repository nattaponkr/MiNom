# ละมุน — Beta Comms (Thai)

> Finalizes `BETA_PLAN.md` §6 (feedback loops) and §11 (comms plan). All templates are in Thai and pass the brand voice filter: *warm, plain, ละมุน feeling.*

| Field | Value |
|---|---|
| Owner | PM (Claude) |
| Date | 2026-06-02 |
| Status | Drafted; ready to send once provisioning + dry-run clear |

---

## 0. Voice rules for everything below

- Speak like a calm friend who's done this before.
- Never sound like a marketer or a manual.
- Own mistakes softly. No blame on the parent.
- Short. New parents have no spare seconds.
- Honest. We're asking them to help us build — say that.

---

## 1. Recruitment — warm-intro template

**Channel:** LINE or DM, person-to-person from CPO.
**Goal:** 25 warm intros → 15–20 active beta households.
**Selection criteria:** Thai-speaking parent of a baby aged 0–12 months. Mix of first-time / experienced, solo / multi-caregiver, Bangkok / upcountry, iOS / Android.

### Template (LINE / DM)

```
สวัสดีค่ะคุณ[ชื่อ] 🙂

เราทำแอปชื่อ "ละมุน" — แอปบันทึกการดูแลลูกที่ทำเพื่อครอบครัวไทย
ตอนนี้กำลังจะเปิดทดลองรอบเบต้ากับครอบครัวจำนวนเล็ก ๆ ก่อนเปิดให้คนทั่วไป

อยากชวนคุณ[ชื่อ]มาช่วยลอง เพราะ [เหตุผลเฉพาะตัวที่ทำไมเขาเหมาะ — มีลูกอายุ 4 เดือน /
มีคุณยายช่วยดูแล / ฯลฯ]

ใช้ฟรีตลอดเลย ขอแค่ลองใช้ 4–6 สัปดาห์ แล้วช่วยตอบคำถามสั้น ๆ ของเรา
ถ้าสนใจ ผมส่งลิงก์เชิญทาง email ให้ได้ไหมครับ

— [ชื่อ CPO]
```

Notes for CPO:
- One ask per message. Don't dump links yet.
- If they say yes, capture their email and add to the recruitment list. PM sends the actual invite from the app once dry-run clears.

---

## 2. Beta invite email (sent when account-ready)

**Sender:** `ละมุน <noreply@lamoon.app>` (or Resend onboarding domain)
**Subject:** `[ชื่อ CPO] ชวนคุณมาทดลองใช้ละมุน — แอปบันทึกการดูแลลูกสำหรับครอบครัวไทย`

### Body

```
สวัสดีค่ะคุณ[ชื่อ]

ขอบคุณที่ตกลงมาช่วยเราทดลองใช้ "ละมุน" ในช่วงเบต้านี้
ละมุนคือแอปบันทึกการดูแลลูก — ให้นม การนอน ผ้าอ้อม การเติบโต —
ทำขึ้นเพื่อครอบครัวไทยที่มักจะดูแลลูกกันหลายคน คุณพ่อคุณแม่ คุณยาย พี่เลี้ยง
ทุกคนเห็นและบันทึกร่วมกันได้แบบเรียลไทม์

สิ่งที่อยากขอจากคุณ
- ลองใช้สัก 4–6 สัปดาห์
- ตอบแบบสอบถามสั้น ๆ ทุกสัปดาห์ (ไม่เกิน 5 นาที)
- ถ้าสะดวก ขอคุยกับเรา 20 นาทีในสัปดาห์ที่ 2 และ 6
- เจออะไรติดขัด กดปุ่ม "ส่งฟีดแบ็ค" ในแอปได้เลย

สิ่งที่คุณจะได้
- ใช้ละมุนฟรีตลอดชีพ (ขอบคุณที่ช่วยเรา build)
- ลองฟีเจอร์ใหม่ก่อนใคร
- คุยกับทีมตรง ๆ ในกลุ่ม LINE ของเบต้า

[ปุ่ม] เริ่มใช้ละมุน
ลิงก์: https://minom-production.up.railway.app/invite/{token}

ลิงก์นี้ใช้ได้ภายใน 14 วัน ถ้าหมดอายุไปก่อนแจ้งเราได้

ก่อนเริ่ม ขอแนะนำให้อ่าน
- นโยบายความเป็นส่วนตัวฉบับเบต้า: https://minom-production.up.railway.app/privacy
- ข้อมูลของลูกคุณ เก็บไว้สำหรับครอบครัวคุณเท่านั้น เราไม่ขายข้อมูล

ขอบคุณที่ช่วยกัน

ทีมละมุน
nattaponkraisingkorn@gmail.com
```

Notes:
- Replace `{token}` with the actual invite token from the system.
- One CTA. Privacy is mentioned, not hidden.
- "ทีมละมุน" — not "บริษัท" / "ทีม PM" / etc. Voice rule: no internal jargon.

---

## 3. LINE OpenChat — welcome message (when they accept)

Posted in the beta LINE group when each new family joins.

```
ยินดีต้อนรับคุณ[ชื่อ] และน้อง[ชื่อลูก] เข้ากลุ่มเบต้าละมุนค่ะ 🌿

เคล็ดลับเริ่มต้น
1. เพิ่มคุณพ่อ / คุณยาย / พี่เลี้ยง เข้ามาดูแลร่วมกันได้ในเมนู "ครอบครัว"
   (ทำให้บันทึกได้พร้อมกันทุกคน เห็นกันแบบเรียลไทม์)
2. ถ้าเจออะไรงง ๆ หรืออยากเสนอแนะ พิมพ์ในกลุ่มนี้ได้เลย
   เราอ่านทุกข้อความ ทุกวัน
3. ทุกวันจันทร์เราจะส่งสรุปสั้น ๆ ของอาทิตย์ที่ผ่านมา

ขอให้สัปดาห์แรกราบรื่นนะคะ
```

Notes:
- Acknowledge baby by name (their name, not a generic emoji baby).
- Promote the invite flow (#1) — this is the multi-caregiver wedge.
- Set the cadence expectation (#3).

---

## 4. Weekly survey (Google Forms, Thai, ≤5 min)

**When:** Every Sunday evening. Link posted in LINE group on Monday morning.
**Length:** 4–5 questions. Should take under 5 minutes.

### Form title
`แบบสอบถามรายสัปดาห์ — ละมุน (ใช้เวลาไม่เกิน 5 นาที)`

### Questions

**Q1 — "Sean Ellis" PMF question**
> ถ้าละมุนหายไปจากชีวิตคุณพรุ่งนี้ คุณจะรู้สึกอย่างไร?
> ⚪ เสียดายมาก
> ⚪ พอเสียดาย
> ⚪ ไม่ค่อยเป็นไร
> ⚪ ไม่เป็นไรเลย

**Q2 — Frequency**
> สัปดาห์นี้คุณเปิดละมุนถี่แค่ไหน?
> ⚪ หลายครั้งต่อวัน
> ⚪ วันละครั้ง
> ⚪ ไม่กี่ครั้งต่อสัปดาห์
> ⚪ ไม่ค่อยได้เปิด

**Q3 — What works**
> สัปดาห์นี้ เรื่องไหนในละมุนที่ช่วยคุณได้จริง? (ตอบยาวสั้นได้ตามใจ)
> [open text]

**Q4 — What hurts**
> สัปดาห์นี้ มีอะไรในละมุนที่ทำให้รำคาญ ใช้ยาก หรือไม่อยากกลับมาใช้? (พูดตรง ๆ ได้เลย)
> [open text]

**Q5 — Optional wish**
> มีเรื่องไหนที่อยากให้ละมุนทำได้เพิ่ม? (ไม่บังคับตอบ)
> [open text]

Notes:
- Q1 is the only "score" question. Long-term we read >40% "เสียดายมาก" as PMF signal.
- Q2 confirms self-report frequency vs PostHog event data.
- Q3/Q4 are the gold — read every response.
- Keep order Q1 → Q5; if a user only answers the first one, we still get the score.

---

## 5. Week 2 interview guide (20 min, LINE call)

**Goal:** Catch first-week friction. Especially the invite flow — did they actually add a co-caregiver? If not, why?

**Frame at the start:**
> "ขอบคุณที่สละเวลา ไม่มีคำตอบผิดถูก เราอยากฟังว่าใช้แล้วเจออะไรจริง ๆ บ้าง เปิดเผยกับเราได้เลยค่ะ"

**Questions (use as prompts, not a script):**

1. ก่อนใช้ละมุน คุณบันทึกลูกอย่างไรบ้าง? เรื่องไหนยากที่สุด?
2. ตอนเริ่มใช้ครั้งแรก เรื่องไหนงง? เริ่มจากไหน?
3. คุณได้ชวนคนอื่นเข้ามาดูแลร่วมไหม?
   - **ถ้าใช่:** เป็นยังไงบ้าง? เขาใช้ไหม? คุยกันยังไงระหว่างกัน?
   - **ถ้ายังไม่ได้ชวน:** ทำไมคะ? เป็นเพราะ feature ยังไม่เห็น หรือไม่ต้องการ?
4. ในแต่ละวัน คุณเปิดละมุนตอนไหนบ้าง? บันทึกอะไรบ่อยที่สุด?
5. มีอะไรที่ "เกือบจะ" ทำให้คุณเลิกใช้ไหม?
6. ตอนนี้ละมุนช่วยคุณได้แค่ไหน (1–10)? อะไรทำให้ไม่เต็ม 10?
7. อยากเห็นอะไรเพิ่มในอีก 4 สัปดาห์?

**After the call:**
- Within 1 hour, write a 5–8 bullet summary in the journal under `## YYYY-MM-DD — PM — Beta interview: [household initial]`.
- Tag P0 / P1 / P2 on any friction mentioned. P0s go to Dev within the same week.

---

## 6. Week 6 interview guide (20 min)

**Goal:** Did it stick? Would they miss it? Would they recommend it?

**Frame:**
> "ขอบคุณที่อยู่กับเรามาจนถึงตอนนี้ค่ะ ขอ 20 นาทีคุยปิดท้ายเบต้าครั้งนี้"

**Questions:**

1. ตอนนี้ละมุนเป็นส่วนหนึ่งของกิจวัตรของคุณมากน้อยแค่ไหน?
2. ถ้าละมุนหายไปพรุ่งนี้ คุณจะรู้สึกอย่างไร? เพราะอะไร?
3. เรื่องไหนของละมุนที่คุณจะคิดถึงที่สุดถ้าหายไป?
4. คุณบอกต่อใครบ้างเกี่ยวกับละมุน? บอกว่าอะไร?
5. มีเรื่องไหนที่อยากให้เราทำได้ดีกว่านี้?
6. ถ้าเราเปิดให้คนทั่วไปใช้พรุ่งนี้ คุณคิดว่าเราพร้อมไหม? ขาดอะไร?
7. (เปิด) มีเรื่องอื่นไหมที่อยากบอกเรา?

**After the call:**
- Same summary cadence as Week 2.
- The Q2/Q4 answers feed directly into the "I'd be sad if this went away" success criterion in `BETA_PLAN.md` §8.

---

## 7. Weekly digest (LINE OpenChat, every Monday morning)

**Cadence:** Monday 9:00 ICT, posted by PM.
**Format:** Short. 4 bullets. Plain Thai.

### Template

```
🌿 สรุปสัปดาห์ที่ผ่านมา · {dd MMM}

สิ่งที่เราทำไป
- {1–2 บรรทัด อะไรที่ shipped หรือ fix}

สัปดาห์นี้กำลังทำ
- {1–2 บรรทัด อะไรกำลังทำ — โปร่งใส โดยไม่สัญญา}

ตัวเลข (ทั้งกลุ่มเบต้า ไม่ระบุตัวบุคคล)
- {เช่น มีการบันทึก 1,240 ครั้งสัปดาห์ที่แล้ว · 12 ครอบครัวยังเปิดใช้}

ขอบคุณทุกท่านที่ช่วยกันค่ะ
ใครอยากแชร์อะไร หรือเจอ bug เข้ามาคุยในกลุ่มได้เลย

[ลิงก์แบบสอบถามรายสัปดาห์]
```

Notes:
- Numbers from PostHog. **Never per-user** stats in the group.
- Be honest about what shipped and what didn't. If we slipped, say so.
- The survey link goes here, every Monday.

---

## 8. End-of-beta / launch message

**When:** End of week 6, decision point per `BETA_PLAN.md` §8 reached.

### Variant A — going public

```
🌿 ขอบคุณค่ะ — ละมุนกำลังจะเปิดให้คนทั่วไปแล้ว

6 สัปดาห์ที่ผ่านมา ทุกครอบครัวที่อยู่ในกลุ่มนี้ช่วยเรา shape ละมุนเยอะมาก
จากการคุย จาก feedback จากเรื่องเล็ก ๆ ที่บอกในกลุ่ม

สิ่งที่เราเปลี่ยนเพราะคุณ
- {3–5 บรรทัด เรื่องสำคัญที่ปรับเพราะคำของ cohort}

ขั้นต่อไป
- เปิดให้คนทั่วไปใช้ภายใน {กรอบเวลา}
- {อะไรที่ยังตามมาในเดือนต่อ ๆ ไป}

ของคุณ
- บัญชีของคุณยังคงใช้ฟรีตลอดชีพ ตามที่สัญญาตอนเข้าเบต้า
- กลุ่ม LINE นี้จะยังอยู่ — ทีมยังอ่าน ตอบ ปรับให้ละมุนดีขึ้นเรื่อย ๆ

ขอบคุณจากใจค่ะ
ทีมละมุน
```

### Variant B — fix cycle before public

```
🌿 ขอบคุณค่ะ — ขั้นต่อไปของละมุน

ขอบคุณทุกครอบครัวที่อยู่กับเรามา 6 สัปดาห์ค่ะ

จาก feedback ที่ได้ เราเห็นชัดว่าละมุนยังต้อง {1–2 บรรทัด เหตุผล} ก่อนเปิดสาธารณะ
ดังนั้นเราจะใช้เวลาอีก {กรอบเวลา} ปรับเรื่องเหล่านี้แล้วเปิดอีกรอบ

สิ่งที่เราจะทำในระหว่างนี้
- {เรื่องที่จะ fix}

ของคุณ
- บัญชีของคุณยังคงใช้ฟรีตลอดชีพ
- ใช้ต่อได้เลยปกติ และ feedback ของคุณยังมีค่ามาก
- เราจะมาเล่าให้ฟังเรื่อย ๆ

ขอบคุณที่ช่วยกันค่ะ
ทีมละมุน
```

---

## 9. Beta agreement (sent with the invite email)

A short Thai expectations note. Not legal — sets the relationship clearly.

```
ข้อตกลงสำหรับช่วงเบต้า (เวอร์ชันสั้น)

ของเรา
- บัญชีของคุณใช้ฟรีตลอดชีพ
- เราอ่าน feedback ของคุณภายใน 24 ชั่วโมง
- ข้อมูลของลูกคุณจัดการตามนโยบายความเป็นส่วนตัวของละมุน

ของคุณ
- ใช้ละมุนต่อเนื่องอย่างน้อย 4 สัปดาห์
- ตอบแบบสอบถามรายสัปดาห์ (5 นาที)
- ถ้าสะดวก ขอคุย 20 นาทีในสัปดาห์ที่ 2 และ 6
- เจออะไร บอกเราตรง ๆ ได้เลย

หยุดใช้เมื่อไรก็ได้ ไม่ต้องบอกล่วงหน้า
```

Notes:
- Phrased as "ของเรา / ของคุณ" — symmetric, not transactional.
- "หยุดใช้เมื่อไรก็ได้" — important. Don't trap people.

---

## 10. Operating cadence summary (for PM's own checklist)

| When | What | Owner |
|---|---|---|
| Daily | Skim LINE group; reply within 24h | PM |
| Daily | Triage in-app feedback emails | PM |
| Daily | Watch PostHog event volume; catch sync_failed spikes | PM |
| Monday 9:00 | Post weekly digest + survey link | PM |
| Monday 10:00 (30 min) | Team metrics + feedback sync | PM + Designer + Dev |
| Wednesday (30 min, bi-weekly) | UX-friction review | PM + Designer |
| Week 2 (per household) | 20-min interview | PM |
| Week 6 (per household) | 20-min interview | PM |
| End of beta | Decision against `BETA_PLAN.md` §8 success criteria | PM → CPO |

---

## 11. What I still need from CPO before sending

- Recruitment list (~25 households with name + contact + relationship). PM can't reach them; CPO does the warm intro.
- LINE OpenChat created (private, beta-only). PM joins, posts welcomes/digests; CPO is co-admin.
- `nattaponkraisingkorn@gmail.com` forwards to CPO inbox (or shared inbox). Used in the privacy policy, signature, and feedback button.
- CPO's display name in messages — "ทีมละมุน" generic, or named ("จาก [ชื่อ]") for the warm-intro and invite emails?
