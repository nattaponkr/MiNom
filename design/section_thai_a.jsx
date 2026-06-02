// section_thai_a.jsx — Typography pick + localized hi-fi screens
const ThModePair = ({ title, desc, Comp, props = {}, darkProps }) => (
  <div className="phone-cell" style={{ width: '100%' }}>
    <div className="phone-cap" style={{ maxWidth: 760, marginBottom: 4 }}>
      <div className="t" style={{ fontSize: 16 }}>{title}</div><div className="d">{desc}</div>
    </div>
    <div className="mode-pair">
      <div className="phone-cell"><PhoneFrame theme="light"><Comp {...props} /></PhoneFrame><span className="phone-cap"><span className="d" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IcSun size={14} /> สว่าง · Light</span></span></div>
      <div className="phone-cell"><PhoneFrame theme="dark"><Comp {...(darkProps || props)} /></PhoneFrame><span className="phone-cap"><span className="d" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IcMoon size={14} /> มืด · Dark</span></span></div>
    </div>
  </div>
);

function SectionThaiType() {
  const ladder = [
    ['Caption / 12', 12, 'ยังไม่มีบันทึก · 21:41 · โดยคุณพ่อ'],
    ['Small / 14', 14, 'กิจกรรมที่คุณและคนอื่นๆ บันทึก จะแสดงที่นี่'],
    ['Body / 16', 16, 'แตะการ์ดเพื่อบันทึกกิจกรรมของลูกน้อย'],
    ['H3 / 18', 18, 'เพิ่มข้อมูลลูกน้อย'],
    ['H2 / 22', 22, 'มีคนบันทึกไปแล้ว'],
    ['H1 / 28', 28, 'น้องฟ้า · วันนี้'],
    ['Display / 32', 32, 'ให้นม การนอน ผ้าอ้อม'],
  ];
  const Face = ({ cls, name, by, pick, note }) => (
    <div className={'face-card' + (pick ? ' pick' : '')}>
      <div className="fc-name">{name} {pick && <span className="fc-badge">เลือกใช้ · Primary</span>}</div>
      <div className="fc-meta">{by} · {note}</div>
      <div className={'fc-big ' + cls}>ให้นม · การนอน</div>
      <div className={'fc-row ' + cls}>ยังไม่มีบันทึก แตะเพื่อเริ่ม · 120 มล. · กำลังหลับ 22 นาที</div>
    </div>
  );
  return (
    <section className="section" id="type">
      <div className="wrap">
        <p className="eyebrow">01 · Thai typography</p>
        <h2 className="section-title">A Thai face that feels built, not bolted on</h2>
        <p className="section-desc">The Latin pairing (Hanken Grotesk) is replaced by <b>Anuphan</b> — a contemporary Thai UI typeface by <b>Cadson Demak</b>, Thailand’s leading foundry. It carries the same warm-but-adult tone as the v0.2 system and is purpose-drawn for screens. The mono face (<b>Spline Sans Mono</b>) stays — only Latin numerals, times and amounts use it.</p>

        <div className="note" style={{ margin: '20px 0 28px', maxWidth: 680 }}>
          <span className="tag">Why Anuphan</span>
          Native Thai foundry (authenticity), loopless modern letterforms that stay legible at caption sizes, a real weight range (300–700) for hierarchy, and — bonus — it sits in the same family system as IBM Plex Sans Thai, our backup, so a future EN locale pairs cleanly. <b>Backup:</b> IBM Plex Sans Thai. <b>Fallback:</b> Noto Sans Thai.
        </div>

        <div className="subhead">Three candidates, same string</div>
        <div className="gal" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          <Face cls="fface-anuphan" name="Anuphan" by="Cadson Demak" note="warm, modern, UI-drawn" pick />
          <Face cls="fface-plex" name="IBM Plex Sans Thai" by="Cadson Demak" note="neutral, pairs w/ Plex Latin" />
          <Face cls="fface-noto" name="Noto Sans Thai" by="Google" note="utilitarian fallback" />
        </div>

        <div className="subhead">Anuphan validated at UI sizes (12 → 32px)</div>
        <div className="spec-card">
          <div className="ladder">
            {ladder.map(([label, px, smp]) => (
              <div className="ladder-row" key={label}><span className="px">{label}px</span><span className="smp" lang="th" style={{ fontSize: px, fontWeight: px >= 22 ? 700 : (px <= 12 ? 600 : 400) }}>{smp}</span></div>
            ))}
          </div>
          <div className="gal-d" style={{ marginTop: 14, marginBottom: 0 }}><b style={{ color: 'var(--fg)' }}>Layout note:</b> Thai stacks tone marks + vowels up to three levels, so line-height is raised to <code style={{ fontFamily: 'var(--font-mono)' }}>1.45</code> for body and <code style={{ fontFamily: 'var(--font-mono)' }}>1.35</code> for titles to avoid clipping. Screens carry <code style={{ fontFamily: 'var(--font-mono)' }}>lang="th"</code> so the browser line-breaks correctly (Thai has no inter-word spaces).</div>
        </div>
      </div>
    </section>
  );
}

function SectionThaiScreens() {
  return (
    <section className="section" id="screens">
      <div className="wrap">
        <p className="eyebrow">02 · Hi-fi in Thai</p>
        <h2 className="section-title">The four screens, in real Thai</h2>
        <p className="section-desc">Home, Eat, Sleep and Diaper re-rendered with native Thai copy in Anuphan, both modes, checked at 360px. <b>No clipped or wrapped lines;</b> Thai labels run shorter than the English, so buttons hug their content. The two empty/first-run states sit alongside.</p>
        <div style={{ height: 26 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
          <ThModePair title="หน้าหลัก · Home / Today" desc="Three status cards. ‘ให้นม / การนอน / ผ้าอ้อม’ — the words Thai parents actually use." Comp={ThHome} />
          <ThModePair title="ให้นม · Quick-Log: Eat" desc="Opens at ‘ตอนนี้’. Save in one more tap. Note the ‘แก้ไข’ (edit-time) affordance — see clarification #4." Comp={ThEat} />
          <ThModePair title="การนอน · Quick-Log: Sleep" desc="Timer-first. Idle (light) invites ‘เริ่มจับเวลานอน’; running (dark) owns the screen." Comp={ThSleep} props={{ running: false }} darkProps={{ running: true }} />
          <ThModePair title="ผ้าอ้อม · Quick-Log: Diaper" desc="‘ฉี่ / อึ / ทั้งคู่’ — child-words, not clinical terms. Colour + icon + label, never colour alone." Comp={ThDiaper} props={{ sel: 'wet' }} darkProps={{ sel: 'both' }} />
        </div>

        <div className="subhead">Empty &amp; first-run (Thai)</div>
        <div className="phones">
          <div className="phone-cell"><PhoneFrame theme="light"><ThHomeEmpty /></PhoneFrame><span className="phone-cap"><span className="t">หน้าหลัก · first run</span><span className="d">Dashed ghost cards — see clarification #3.</span></span></div>
          <div className="phone-cell"><PhoneFrame theme="dark"><ThTimeline /></PhoneFrame><span className="phone-cap"><span className="t">ไทม์ไลน์ · Timeline</span><span className="d">Quiet attribution: ‘คุณ / คุณพ่อ / พี่เลี้ยง’.</span></span></div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionThaiType, SectionThaiScreens, ThModePair });
