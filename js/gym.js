function checkDailyWorkoutReset() {
  // C4 FIX: use window._showWorkoutResetPrompt set by loadUserData (cross-device via Supabase)
  if (window._showWorkoutResetPrompt) {
    window._showWorkoutResetPrompt = false;
    // N3 FIX: only prompt if user actually checked something
    const hasChecked = Object.values(pplChecked).some(day => Object.values(day).some(v => v));
    if (hasChecked && confirm('New day! Reset yesterday\'s workout checkboxes?\n[OK] = Reset  [Cancel] = Keep')) {
      pplChecked = { push: {}, pull: {}, legs: {} };
      autoSave();
    }
  }
}

function renderTodayBanner() {
  const todayPPL = getTodayPPL();
  const dayName = DAY_NAMES[new Date().getDay()];
  const week = getCurrentWeek();
  const banner = document.getElementById('today-banner');
  const label = document.getElementById('today-label');
  const weekLabel = document.getElementById('today-week-label');
  const icon = document.getElementById('today-icon');
  // Null check ALL elements before use
  if (!label || !icon) return;

  if (!todayPPL) {
    icon.textContent = '😴';
    label.textContent = `${dayName} — Rest & Recovery Day`;
    label.style.color = 'var(--purple)';
    if (weekLabel) weekLabel.textContent = 'Light stretch or walk only. Muscles grow during rest.';
    if (banner) banner.style.borderColor = 'rgba(170,68,255,.3)';
  } else {
    const typeLabels = {push:'Push Day — Chest · Shoulders · Triceps', pull:'Pull Day — Back · Biceps · Rear Delts', legs:'Legs Day — Quads · Glutes · Hamstrings'};
    const typeIcons = {push:'💪', pull:'🔥', legs:'🦵'};
    icon.textContent = typeIcons[todayPPL];
    label.textContent = `${dayName} — ${typeLabels[todayPPL]}`;
    if (weekLabel) weekLabel.textContent = `Week ${week} programme · ${PPL_DATA[todayPPL].length} exercises + warmup`;
    // Auto-switch tab to today's type
    const todayTab = document.getElementById(`tab-${todayPPL}`);
    if (todayTab) switchPPL(todayPPL, todayTab);
    // Auto-open warmup on today's day
    setTimeout(() => {
      const warmupBody = document.querySelector(`#ppl-${todayPPL} .warmup-body`);
      if (warmupBody) warmupBody.style.display = 'block';
    }, 200);
  }
}

function renderWarmup(day) {
  const container = document.getElementById(`warmup-${day}`);
  if (!container) return;
  const warmups = WARMUP_DATA[day] || [];
  container.innerHTML = `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:pointer" onclick="this.parentElement.querySelector('.warmup-body').style.display = this.parentElement.querySelector('.warmup-body').style.display==='none'?'block':'none'">
        <span style="font-size:18px">🔥</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--accent3)">WARM-UP PROTOCOL <span style="font-size:10px;color:var(--muted);font-weight:400">(~5–7 min) — tap to expand</span></div>
          <div style="font-size:11px;color:var(--muted)">Never skip — cold muscles tear, warm muscles grow</div>
        </div>
      </div>
      <div class="warmup-body" style="display:none">
        ${warmups.map(w => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:rgba(255,107,68,.06);border:1px solid rgba(255,107,68,.15);border-radius:10px;margin-bottom:8px">
            <span style="font-size:20px;flex-shrink:0">${w.icon}</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;margin-bottom:2px">${w.name}</div>
              <div style="font-size:11px;color:var(--accent3);font-weight:700;margin-bottom:4px">${w.duration}</div>
              <div style="font-size:11px;color:var(--muted);line-height:1.4">${w.note}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderPPL() {
  renderTodayBanner();
  ['push','pull','legs'].forEach(day => {
    renderWarmup(day);
    const exs = PPL_DATA[day];
    const container = document.getElementById(`${day}-exercises`);
    if (!container) return;
    container.innerHTML = exs.map((ex, i) => {
      const key = ex.name;
      const done = pplChecked[day][key] || false;
      return `
      <div class="workout-exercise-item" id="${day}-ex-${i}">
        <div class="workout-checkbox ${done ? 'done' : ''}" onclick="toggleExercise('${day}','${key}')"></div>
        <div class="workout-ex-info">
          <div class="workout-ex-name" style="${done ? 'text-decoration:line-through;opacity:.5' : ''}">${ex.name}</div>
          <div class="workout-ex-meta" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:3px">
            <span style="font-size:10px;color:var(--muted);background:var(--bg3);border:1px solid var(--border);padding:2px 7px;border-radius:4px">🎯 ${ex.muscles}</span>
            <span style="font-size:10px;color:var(--accent2);background:rgba(68,255,204,.07);border:1px solid rgba(68,255,204,.2);padding:2px 7px;border-radius:4px">🏋️ ${ex.equipment}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:5px;line-height:1.4">${ex.note}</div>
        </div>
        <div class="workout-ex-badge">${ex.sets} × ${ex.reps}</div>
      </div>`;
    }).join('');
    updatePPLProgress(day);
  });
}

function toggleExercise(day, key) {
  pplChecked[day][key] = !pplChecked[day][key];
  renderPPL();
  autoSave();
}

function updatePPLProgress(day) {
  const total = PPL_DATA[day].length;
  const done = Object.values(pplChecked[day]).filter(Boolean).length;
  const pct = Math.round((done/total)*100);
  const bar = document.getElementById(`${day}-progress`);
  const label = document.getElementById(`${day}-progress-label`);
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${total} exercises completed${done===total ? ' — Great work! 💪' : ''}`;
}

function switchPPL(day, btn) {
  document.querySelectorAll('.ppl-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ppl-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('ppl-' + day).classList.add('active');
  btn.classList.add('active');
}

function renderWeeklySplit() {
  const el = document.getElementById('weekly-split');
  if (!el) return;
  const todayName = DAY_NAMES[new Date().getDay()];
  el.innerHTML = WEEKLY_SPLIT.map((d,i) => {
    const isToday = d.day === todayName;
    return `
    <div class="plan-day-card ${isToday ? 'open' : ''}" id="wday-${i}" style="${isToday ? `border-color:${d.color};box-shadow:0 0 18px rgba(68,255,204,.08)` : ''}">
      <div class="plan-day-header" onclick="this.parentElement.classList.toggle('open')">
        <div style="display:flex;align-items:center;gap:10px">
          <div>
            <div class="plan-day-name" style="color:${d.color}">${d.day}${isToday ? ' <span style="font-size:10px;background:'+d.color+';color:#000;padding:2px 7px;border-radius:4px;font-weight:800;vertical-align:middle">TODAY</span>' : ''}</div>
            <div class="plan-day-focus">${d.focus}</div>
          </div>
        </div>
        <span style="color:var(--muted);font-size:13px">▼</span>
      </div>
      <div class="plan-day-body">
        ${d.exs.map(e => `<div class="plan-exercise-row"><span class="plan-ex-name">${e.n}</span><span class="plan-ex-sets">${e.s}</span></div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// RECOVERY DESK
// ============================================================
