// th-strings-who-chart-patch.js — ละมุน Growth chart · WHO LMS (Handoff #15)
// Designer → Dev. Merge into web/locales/th.json by key. Axes + curve labels +
// today-marker + citation + sex-required prompt. Chart math + LMS bundle is
// engineering (see who_lms.js + spec §08). No schema change.
window.TH_WHO_CHART = {
  // axes
  "growth.axis.age":     "อายุ",
  "growth.axis.weeks":   "สัปดาห์",
  "growth.axis.months":  "เดือน",
  "growth.axis.weight":  "น้ำหนัก",
  "growth.axis.height":  "ส่วนสูง",
  "growth.axis.kg":      "กก.",
  "growth.axis.cm":      "ซม.",

  // today marker + age caption
  "growth.todayWeeks":   "อายุ {n} สัปดาห์",
  "growth.todayMonths":  "อายุ {n} เดือน",
  "growth.ageCaption":   "วันนี้ลูก",

  // curve + citation
  "growth.percentileLabel": "เปอร์เซ็นไทล์ที่ {n}",   // a11y / legend; on-chart uses the bare number
  "growth.chartAria":       "กราฟเปอร์เซ็นไทล์การเติบโตตามมาตรฐาน WHO",
  "growth.citation":        "ข้อมูลอ้างอิงจาก WHO Child Growth Standards",

  // sex-required graceful degrade
  "growth.sexRequired.title": "ระบุเพศของลูก",
  "growth.sexRequired.body":  "เพื่อแสดงเส้นเปอร์เซ็นไทล์จาก WHO ที่แม่นยำสำหรับลูก",
  "growth.sexRequired.cta":   "ตั้งค่าตอนนี้",

  // out-of-range (>60 months) — v1 rarely shown; included for completeness
  "growth.outOfRange":        "เกินช่วงอ้างอิงของ WHO (0–60 เดือน)",
};

// No removals. NOTE: #13's growth.chartLabel ("กราฟเปอร์เซ็นไทล์ของ WHO") is
// superseded by the real axes + citation; keep it only if referenced elsewhere,
// otherwise Dev may retire it once the new chart lands.
window.TH_WHO_CHART_REMOVE = [];
