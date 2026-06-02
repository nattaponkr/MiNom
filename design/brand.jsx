// brand.jsx — ละมุน (Lamoon) wordmark, app icon, and Brand section (Part 0)

// Reusable Thai wordmark. size = font-size in px. onClay for use on the clay primary.
function LamoonWordmark({ size = 22, onClay = false, weight = 500 }) {
  return (
    <span className={'lamoon-wm' + (onClay ? ' on-clay' : '')} style={{ fontSize: size }}>
      <span className="lm-dot" />
      <span className="lm-word" lang="th" style={{ fontWeight: weight }}>ละมุน</span>
    </span>
  );
}

// App icon — rounded-square monogram (ล), the first letter of ละมุน.
function LamoonIcon({ size = 64 }) {
  return (
    <span className="lamoon-icon" style={{ width: size, height: size, fontSize: size * 0.56 }}>
      <span className="glyph" lang="th">ล</span>
    </span>
  );
}

function SectionBrand() {
  return (
    <section className="section" id="brand">
      <div className="wrap">
        <p className="eyebrow">00 · Brand identity</p>
        <h2 className="section-title">ละมุน — the name is the brief</h2>
        <p className="section-desc"><b>ละมุน</b> (Lamoon) means <i>soft, gentle, tender</i>. It names the feeling every interaction should leave behind — at 3am, with one thumb, carrying a tired parent. So the identity is quiet by design: a soft typographic wordmark, the warm-clay dot carried over from the v0.2 system, and no hard edges. <b>If it isn’t ละมุน, it’s off-brand.</b></p>

        <div className="subhead">Wordmark · light + dark</div>
        <div className="brand-hero">
          <div className="brand-stage light">
            <div className="bs-cap">Primary · Thai · on warm paper</div>
            <div className="bs-body" style={{ flexDirection: 'column', gap: 22 }}>
              <LamoonWordmark size={62} />
              <LamoonWordmark size={30} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><LamoonIcon size={34} /><LamoonWordmark size={22} /></div>
            </div>
          </div>
          <div className="brand-stage dark" data-theme="dark">
            <div className="bs-cap" style={{ background: 'var(--surface)', color: 'var(--fg-muted)', borderColor: 'var(--border)' }}>On dark · 3am</div>
            <div className="bs-body" style={{ flexDirection: 'column', gap: 22, background: 'var(--bg)' }}>
              <LamoonWordmark size={62} />
              <LamoonWordmark size={30} />
              <div className="lamoon-latin" style={{ fontSize: 22 }}>Lamoon</div>
            </div>
          </div>
        </div>

        <div className="note" style={{ margin: '18px 0 0', maxWidth: 680 }}>
          <span className="tag">Construction</span>
          Set in <b>Anuphan Medium (500)</b> — the same face as the UI, so the logo and the product share one voice (no second type personality). The ละมุน script has an even horizontal rhythm with no tall ascenders, so it locks up cleanly beside the clay dot. <b>Latin “Lamoon”</b> is the alternate for footers, legal and social handles only — never the headliner.
        </div>

        <div className="subhead">App icon · placeholder for staging</div>
        <div className="spec-card">
          <div className="icon-row">
            <div className="icon-spec"><LamoonIcon size={120} /><div className="cap">1024 / @full</div></div>
            <div className="icon-spec"><LamoonIcon size={72} /><div className="cap">180 · iOS</div></div>
            <div className="icon-spec"><LamoonIcon size={48} /><div className="cap">48 · min</div></div>
            <div className="icon-spec" style={{ alignSelf: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: 30, height: 30, borderRadius: 7, overflow: 'hidden', display: 'inline-flex' }}><LamoonIcon size={30} /></span>
              </div>
              <div className="cap">home-screen</div>
            </div>
          </div>
          <div className="gal-d" style={{ marginTop: 16, marginBottom: 0 }}>The monogram <b lang="th" style={{ fontFamily: "'Anuphan',sans-serif" }}>ล</b> (first letter of ละมุน) in cream on warm clay, with a soft top-left light. Holds shape down to 48px where the full word would blur. <b>Placeholder</b> — final mark lands Phase 4 (beta).</div>
        </div>

        <div className="subhead">Tagline</div>
        <div style={{ display: 'grid', gap: 10, maxWidth: 680 }}>
          <div className="tagline-opt pick">
            <span className="badge">Pick</span>
            <span><span className="th" lang="th">ดูแลลูกอย่างละมุนละไม</span><span className="en">“Care for your baby, exquisitely gently.” — uses the ละมุนละไม compound, so the tagline echoes the name. Warm, declarative, not advertising-loud.</span></span>
          </div>
          <div className="tagline-opt">
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)' }}>Alt</span>
            <span><span className="th" lang="th">ทุกบันทึกของลูก ในแบบที่ละมุนที่สุด</span><span className="en">“Every record of your baby, in the gentlest way.” — longer; good for a splash or store listing.</span></span>
          </div>
          <div className="tagline-opt">
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)' }}>Alt</span>
            <span><span className="th" lang="th">บันทึกการดูแลลูก ง่ายและละมุน</span><span className="en">“Baby tracking — simple and gentle.” — pairs the v0.2 ‘simplest’ promise with the new brand word.</span></span>
          </div>
        </div>

        <div className="subhead">Brand voice — the copy filter</div>
        <p className="section-desc" style={{ marginBottom: 16 }}>One rule for every future string: <b>warm, plain Thai that leaves a ละมุน feeling.</b> Speak like a calm friend who’s done this before — never a manual, never baby-talk, never a marketer. Own mistakes softly; never blame the parent.</p>
        <div className="voice-grid">
          <div className="voice-col on">
            <div className="vh"><IcCheck size={16} /> On-brand · ละมุน</div>
            <div className="voice-row"><div className="q" lang="th">“แตะเริ่ม เมื่อลูกเริ่มหลับ”</div><div className="note">Gentle, present, trusts the parent. (Sleep idle hint)</div></div>
            <div className="voice-row"><div className="q" lang="th">“มีอะไรอยากจดไว้ไหม…”</div><div className="note">Soft invitation, optional. (Notes placeholder)</div></div>
            <div className="voice-row"><div className="q" lang="th">“บันทึกไม่สำเร็จ — กำลังลองใหม่…”</div><div className="note">Owns the error, no blame, reassures. (Save error)</div></div>
          </div>
          <div className="voice-col off">
            <div className="vh"><IcX size={16} /> Off-brand · redo it</div>
            <div className="voice-row"><div className="q" lang="th">“กรุณากดปุ่มเริ่มต้นการจับเวลาการนอนหลับ”</div><div className="note">Stiff, bureaucratic, “กรุณา…” form-speak.</div></div>
            <div className="voice-row"><div className="q" lang="th">“หนูง่วงแล้วน้า~ 🍼😴”</div><div className="note">Baby-talk + emoji — infantilizing, the brief forbids it.</div></div>
            <div className="voice-row"><div className="q" lang="th">“ผิดพลาด! คุณกรอกข้อมูลไม่ถูกต้อง”</div><div className="note">Shouts, blames the parent. Never.</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LamoonWordmark, LamoonIcon, SectionBrand });
