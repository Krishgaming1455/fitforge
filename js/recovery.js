function setRecoveryArea(area, btn) {
  currentRecoveryArea = area;
  document.querySelectorAll('.recovery-area-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRecovery();
}

function setRecoveryType(type, btn) {
  currentRecoveryType = type;
  document.querySelectorAll('.recovery-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRecovery();
}

function renderRecovery() {
  const data = RECOVERY_DATA[currentRecoveryArea]?.[currentRecoveryType];
  if (!data) return;
  const isAcute = currentRecoveryType === 'acute';
  const el = document.getElementById('recovery-protocol-output');
  el.innerHTML = `
    <div class="recovery-protocol">
      <div style="background:${isAcute?'rgba(255,68,102,.07)':'rgba(240,255,68,.06)'};border:1px solid ${isAcute?'rgba(255,68,102,.25)':'rgba(240,255,68,.2)'};border-radius:13px;padding:20px;margin-bottom:20px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;color:${data.color};margin-bottom:8px">${data.title}</div>
        <p style="font-size:13px;color:var(--muted);line-height:1.6">${data.desc}</p>
      </div>
      <div class="card" style="margin-bottom:18px">
        <h3 style="font-size:14px;margin-bottom:14px;color:${data.color}">📋 ${isAcute?'⚠️ Immediate Action Protocol':'Recovery Protocol'}</h3>
        ${data.protocol.map((p,i) => `<div style="display:flex;align-items:start;gap:11px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px">
          <div style="width:22px;height:22px;border-radius:50%;background:${isAcute?'var(--red)':'var(--accent)'};color:${isAcute?'#fff':'#000'};font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
          <span style="color:var(--muted);line-height:1.5">${p}</span>
        </div>`).join('')}
      </div>
      <div class="card">
        <h3 style="font-size:14px;margin-bottom:14px">🔄 Exercise Substitutions</h3>
        <div style="display:flex;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;padding-bottom:8px;border-bottom:1px solid var(--border);margin-bottom:4px">
          <span style="flex:1">❌ AVOID</span>
          <span style="width:24px"></span>
          <span style="flex:1">✅ DO INSTEAD</span>
        </div>
        ${data.subs.map(s => `<div class="substitution-row">
          <span class="sub-avoid">${s.avoid}</span>
          <span class="sub-arrow">→</span>
          <span class="sub-do">${s.do}</span>
        </div>`).join('')}
      </div>
    </div>`;
}

// ============================================================
// FOOD TRACKER
// ============================================================

