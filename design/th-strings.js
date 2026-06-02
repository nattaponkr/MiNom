// th-strings.js — MiNom Thai microcopy. Source of truth for locales/th.json.
// Voice: warm, plain, polite-neutral Thai. Native, not translated.
// Numerals stay Arabic (1/2/3); times are 24h; {tokens} are interpolated by Dev.
window.TH = {
  brand: {
    wordmark: 'ละมุน',
    latin: 'Lamoon',
    tagline: 'ดูแลลูกอย่างละมุนละไม',          // care for your baby, exquisitely gently (uses ละมุนละไม compound)
    positioning: 'แอปบันทึกการดูแลลูก ที่ทำเพื่อครอบครัวไทย', // simple baby tracker, made for Thai families
  },

  common: {
    save: 'บันทึก', saving: 'กำลังบันทึก…', saved: 'บันทึกแล้ว',
    cancel: 'ยกเลิก', continue: 'ต่อไป', gotIt: 'เข้าใจแล้ว',
    edit: 'แก้ไข', delete: 'ลบ', optional: 'ไม่บังคับ', now: 'ตอนนี้',
  },

  auth: {
    tagline: 'ดูแลลูกอย่างละมุนละไม',
    nameLabel: 'ชื่อของคุณ',
    namePlaceholder: 'เช่น แม่ พ่อ พี่เลี้ยง',
    nameError: 'บอกเราหน่อยว่าให้เรียกคุณว่าอะไร',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'you@email.com',
    emailError: 'กรอกอีเมลให้ถูกต้อง (เช่น fai@email.com)',
    passwordLabel: 'รหัสผ่าน',
    passwordPlaceholder: 'อย่างน้อย 6 ตัวอักษร',
    passwordError: 'ใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร',
    signIn: 'เข้าสู่ระบบ',
    createAccount: 'สร้างบัญชี',
    toSignUp: 'ยังไม่มีบัญชี?', toSignUpCta: 'สร้างบัญชี',
    toSignIn: 'มีบัญชีอยู่แล้ว?', toSignInCta: 'เข้าสู่ระบบ',
  },

  // PDPA — plain-Thai, ≤4 short sentences on signup
  consent: {
    line1: 'ข้อมูลของลูกเก็บไว้สำหรับครอบครัวคุณเท่านั้น เราไม่ขายข้อมูล',
    line2: 'เข้ารหัสและจัดเก็บอย่างปลอดภัยในสิงคโปร์',
    line3: 'คุณขอดู ส่งออก หรือลบข้อมูลได้ทุกเมื่อ',
    line4: 'การสร้างบัญชีถือว่ายอมรับนโยบายความเป็นส่วนตัว',
    readFull: 'อ่านนโยบายฉบับเต็ม',
  },

  setup: {
    title: 'เพิ่มข้อมูลลูกน้อย',
    subtitle: 'เริ่มแค่ชื่อกับวันเกิดก็พอ',
    nameLabel: 'ชื่อลูก',
    namePlaceholder: 'เช่น น้องฟ้า',
    nameError: 'ต้องมีชื่อ (หรือชื่อเล่น)',
    birthdayLabel: 'วันเกิด',
    birthdayError: 'เลือกวันเกิด (วันนี้หรือก่อนหน้า)',
    photoHint: 'เพศ น้ำหนัก ส่วนสูงแรกเกิด และรูป เพิ่มทีหลังได้ใน “ตั้งค่า”',
    continue: 'ต่อไป',
  },

  home: {
    welcomeSub: 'ยินดีต้อนรับ — มาบันทึกช่วงเวลาแรกกัน',
    by: 'โดย {name}',          // attribution on card
    ago: 'ที่แล้ว',            // unit suffix: "{dur} ที่แล้ว"
    // verb card names (the four verbs, as Thai parents say them)
    eatName: 'ให้นม',
    sleepName: 'การนอน',
    diaperName: 'ผ้าอ้อม',
    growName: 'การเติบโต',
    // states
    eatEmptyStat: 'ยังไม่มีบันทึก',
    eatEmptyUnit: 'แตะเพื่อเริ่ม',
    sleepAsleep: 'กำลังหลับ',
    comingSoon: 'เร็วๆ นี้',
    // first-run ghost hints
    ghostEat: 'ยังไม่มีบันทึก — แตะเพื่อบันทึก',
    ghostSleep: 'เริ่มจับเวลานอน',
    ghostDiaper: 'บันทึกการเปลี่ยนครั้งแรก',
    tip: 'เคล็ดลับ: ชวนคู่ของคุณหรือพี่เลี้ยงเข้ามาใน “ครอบครัว” เพื่อบันทึกข้อมูลลูกคนเดียวกัน',
  },

  eat: {
    title: 'ให้นม',
    whenLabel: 'เวลา',
    whenNow: 'ตอนนี้ · {time}',
    detailsToggle: 'รายละเอียด · ไม่บังคับ',
    amountLabel: 'ปริมาณ',
    amountUnit: 'มล.',
    whatLabel: 'ประเภท',
    whatMilk: 'นม',
    whatFood: 'อาหาร',
    sourceLabel: 'แหล่ง',
    sourceBreastL: 'เต้าซ้าย',
    sourceBreastR: 'เต้าขวา',
    sourceBottle: 'ขวดนม',
    sourceSolid: 'อาหารแข็ง',
    notesLabel: 'บันทึกเพิ่มเติม',
    notesPlaceholder: 'มีอะไรอยากจดไว้ไหม…',
    save: 'บันทึกการให้นม',
  },

  sleep: {
    title: 'การนอน',
    awake: 'ตื่นมาแล้ว {dur}',
    idleZero: '00:00:00',
    idleHint: 'แตะเริ่ม เมื่อลูกเริ่มหลับ',
    sleeping: 'กำลังหลับ',
    startedBy: 'เริ่ม {time} โดย {name}',
    start: 'เริ่มจับเวลานอน',
    stop: 'หยุดจับเวลา',
    manual: 'กรอกเวลาเอง',
  },

  diaper: {
    title: 'ผ้าอ้อม',
    wet: 'ฉี่',          // native child-word, not clinical "ปัสสาวะ"
    dirty: 'อึ',         // native child-word, not clinical "อุจจาระ"
    both: 'ทั้งคู่',
    whenLabel: 'เวลา',
    save: 'บันทึกผ้าอ้อม',
  },

  timeline: {
    title: 'ไทม์ไลน์',
    today: 'วันนี้',
    you: 'คุณ',
    emptyTitle: 'วันนี้ยังไม่มีบันทึก',
    emptyBody: 'กิจกรรมที่คุณและคนอื่นๆ บันทึก จะแสดงที่นี่ เรียงจากล่าสุด',
    eatAmount: 'ให้นม · {n} มล.',
    eatFood: 'ให้นม · อาหาร',
    eatPlain: 'ให้นม',
  },

  growth: {
    title: 'การเติบโต',
    emptyTitle: 'ยังไม่มีการบันทึก',
    emptyBody: 'เพิ่มน้ำหนักและส่วนสูงของ {baby} เพื่อดูบนกราฟเปอร์เซ็นไทล์ของ WHO',
    emptyCta: 'เพิ่มการวัดครั้งแรก',
  },

  sync: {
    queued: 'รอซิงค์',
    synced: 'ซิงค์แล้ว',
    onlineChip: 'ออนไลน์',
    offlineChip: 'ออฟไลน์',
    offlineBanner: 'ออฟไลน์ · บันทึกไว้ในเครื่องนี้แล้ว',
    onlineBanner: 'ออนไลน์ · ซิงค์แล้ว',
  },

  feedback: {
    eatLogged: 'บันทึกให้นมแล้ว',
    undo: 'เลิกทำ',
    saved: 'บันทึกแล้ว',
    saveError: 'บันทึกไม่สำเร็จ — กำลังลองใหม่…',
    caregiverAdded: '{name} เพิ่งเพิ่มการให้นม · ตอนนี้',
  },

  concurrency: {
    title: 'มีคนบันทึกไปแล้ว',
    body: '{name} เพิ่งบันทึกการให้นมไปเมื่อ {dur} ที่แล้ว จะดูรายการนั้น หรือบันทึกเพิ่ม?',
    view: 'ดูรายการนั้น',
    logAnyway: 'บันทึกเพิ่มอีกรายการ',
  },

  del: {
    title: 'ลบรายการนี้?',
    body: 'การลบจะนำรายการให้นมเวลา {time} ออกสำหรับทุกคนที่ดูแล {baby} และกู้คืนไม่ได้',
    confirm: 'ลบรายการ',
    keep: 'เก็บไว้',
    deleted: 'ลบรายการแล้ว',
  },

  comingSoon: {
    title: '{verb} กำลังจะมาในเฟส 3',
    body: 'ตอนนี้เราพิสูจน์ระบบด้วย “ให้นม” ก่อน เมื่อการซิงค์และออฟไลน์เสถียรแล้ว {verb} ก็แค่ทำซ้ำรูปแบบเดิม',
    gotIt: 'เข้าใจแล้ว',
  },

  tab: {
    home: 'หน้าหลัก',
    timeline: 'ไทม์ไลน์',
    grow: 'การเติบโต',
    care: 'ครอบครัว',
    settings: 'ตั้งค่า',
  },

  // duration unit labels for ago()/timers (Dev renders via locale, Arabic numerals)
  units: { h: 'ชม.', m: 'นาที', justNow: 'เพิ่งเมื่อกี้' },
};
