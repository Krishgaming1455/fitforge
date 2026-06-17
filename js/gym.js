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
  try {
  renderTodayBanner();
  ['push','pull','legs'].forEach(day => {
    renderWarmup(day);
    const exs = PPL_DATA[day];
    const container = document.getElementById(`${day}-exercises`);
    if (!container) return;
    container.innerHTML = exs.map((ex, i) => {
      const key = ex.name;
      const done = (pplChecked[day] && pplChecked[day][key]) || false;
      const safeId = 'ol-btn-' + ex.name.replace(/[^a-zA-Z0-9]/g, '_');
      const prev = (overloadLog && overloadLog[ex.name]) || null;
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
          ${prev ? `<div class="overload-prev">📊 Last: ${prev.weight}kg × ${prev.reps} (${prev.date})</div>` : ''}
          <button class="overload-log-btn" id="${safeId}" onclick="toggleOverloadInput('${ex.name.replace(/'/g,"\\'")}')">+ Log Weight</button>
        </div>
        <div class="workout-ex-badge">${ex.sets} × ${ex.reps}</div>
      </div>`;
    }).join('');
    updatePPLProgress(day);
  });
  } catch(e) {
    console.error('renderPPL CRASHED:', e);
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'background:rgba(255,68,102,.1);border:1px solid rgba(255,68,102,.3);color:#ff4466;padding:12px;border-radius:8px;margin:10px;font-size:12px;font-family:monospace';
    errDiv.textContent = '⚠️ Gym render error: ' + e.message;
    document.querySelector('.ppl-panel.active')?.prepend(errDiv);
  }
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

// ============================================================
// WORKOUT TIMER
// ============================================================
function startTimer(seconds) {
  clearInterval(timerInterval);
  timerSeconds = seconds;
  const pill = document.getElementById('timer-pill');
  const display = document.getElementById('timer-display');
  if (!pill || !display) return;
  pill.style.display = 'flex';
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      // Audio beep using Web Audio API
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.15, 0.3].forEach(t => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.3, ctx.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.15);
          o.start(ctx.currentTime + t);
          o.stop(ctx.currentTime + t + 0.15);
        });
      } catch(e) {}
      display.textContent = 'DONE!';
      display.style.color = 'var(--green)';
      setTimeout(() => { pill.style.display = 'none'; display.style.color = 'var(--accent)'; }, 2500);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  display.textContent = `${m}:${s.toString().padStart(2,'0')}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  const pill = document.getElementById('timer-pill');
  if (pill) pill.style.display = 'none';
}

// ============================================================
// PROGRESSIVE OVERLOAD
// ============================================================
function toggleOverloadInput(exName) {
  const safeId = 'ol-' + exName.replace(/[^a-zA-Z0-9]/g, '_');
  const existing = document.getElementById(safeId);
  if (existing) { existing.remove(); return; }
  const prev = overloadLog[exName];
  const div = document.createElement('div');
  div.id = safeId;
  div.className = 'overload-inline';
  div.innerHTML = `
    ${prev ? `<div class="overload-prev" style="width:100%">Last: <strong>${prev.weight}kg × ${prev.reps} reps</strong> on ${prev.date}</div>` : ''}
    <input class="overload-input" id="${safeId}-w" type="number" placeholder="kg" min="0" max="500" step="0.5">
    <span style="font-size:11px;color:var(--muted)">×</span>
    <input class="overload-input" id="${safeId}-r" type="number" placeholder="reps" min="1" max="100">
    <button onclick="saveOverload('${exName.replace(/'/g,"\\'")}','${safeId}')" style="background:var(--accent);color:#000;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Save</button>
    <button onclick="document.getElementById('${safeId}').remove()" style="background:transparent;border:1px solid var(--border);color:var(--muted);padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer">✕</button>`;
  // Insert after the exercise card
  const btn = document.getElementById('ol-btn-' + exName.replace(/[^a-zA-Z0-9]/g, '_'));
  if (btn) btn.closest('.workout-exercise-item').appendChild(div);
}

function saveOverload(exName, safeId) {
  const w = parseFloat(document.getElementById(safeId + '-w')?.value);
  const r = parseInt(document.getElementById(safeId + '-r')?.value);
  if (!w || !r) return;
  const today = new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short'});
  const prev = overloadLog[exName];
  overloadLog[exName] = { weight: w, reps: r, date: today };
  // PR detection
  if (prev && w > prev.weight) {
    showPRCelebration(exName, w);
  }
  autoSave();
  document.getElementById(safeId)?.remove();
  renderPPL(); // refresh to show updated prev
}

function showPRCelebration(exName, weight) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent),var(--accent2));color:#000;padding:12px 24px;border-radius:12px;font-family:Bebas Neue,sans-serif;font-size:20px;letter-spacing:1.5px;z-index:9999;animation:fadeIn .3s ease;text-align:center';
  el.innerHTML = `🏆 NEW PR! ${exName.split(' ')[0].toUpperCase()}<br><span style="font-size:14px;font-weight:800">${weight}kg</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ============================================================
// WORKOUT HISTORY
// ============================================================
function finishWorkout(dayType) {
  const exs = PPL_DATA[dayType];
  const completed = Object.values(pplChecked[dayType] || {}).filter(Boolean).length;
  const total = exs.length;
  if (completed === 0) {
    alert('Complete at least one exercise before finishing!');
    return;
  }
  const week = getCurrentWeek();
  const entry = {
    date: new Date().toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'}),
    dateRaw: new Date().toDateString(),
    dayType,
    week,
    completed,
    total,
    icon: {push:'💪', pull:'🔥', legs:'🦵'}[dayType]
  };
  workoutHistory.unshift(entry);
  if (workoutHistory.length > 30) workoutHistory.pop(); // keep last 30
  autoSave();
  renderWorkoutHistory();
  renderHome();
  // Show confirmation
  const btn = document.getElementById('finish-btn-' + dayType);
  if (btn) { btn.textContent = '✅ WORKOUT SAVED!'; btn.disabled = true; setTimeout(() => { btn.textContent = '✅ FINISH WORKOUT'; btn.disabled = false; }, 3000); }
}

function renderWorkoutHistory() {
  const el = document.getElementById('workout-history-list');
  if (!el) return;
  if (!workoutHistory.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">No workouts logged yet — finish your first session!</div>';
    return;
  }
  const typeLabels = {push:'Push Day', pull:'Pull Day', legs:'Legs Day'};
  const typeColors = {push:'var(--accent3)', pull:'var(--blue)', legs:'var(--green)'};
  el.innerHTML = workoutHistory.slice(0, 7).map(h => `
    <div class="history-item">
      <div class="history-icon">${h.icon}</div>
      <div class="history-info">
        <div class="history-date">${h.date} · Week ${h.week}</div>
        <div class="history-type" style="color:${typeColors[h.dayType]}">${typeLabels[h.dayType]}</div>
        <div class="history-meta">${h.completed}/${h.total} exercises completed</div>
      </div>
      <div style="font-size:11px;font-weight:700;color:${h.completed===h.total?'var(--green)':'var(--muted)'}">${h.completed===h.total?'💯 FULL':'PARTIAL'}</div>
    </div>`).join('');
}

function getStreak() {
  if (!workoutHistory.length) return 0;
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const dates = [...new Set(workoutHistory.map(h => h.dateRaw))];
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0;
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const expected = new Date(Date.now() - i * 86400000).toDateString();
    if (d.toDateString() === expected) streak++;
    else break;
  }
  return streak;
}
