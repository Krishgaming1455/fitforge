function checkDailyWorkoutReset() {
  // C4 FIX: use window._showWorkoutResetPrompt set by loadUserData (cross-device via Supabase)
  if (window._showWorkoutResetPrompt) {
    window._showWorkoutResetPrompt = false;
    // N3 FIX: only prompt if user actually checked something
    const hasChecked = Object.values(pplChecked).some(day => Object.values(day).some(v => v));
    if (hasChecked) {
      showResetPromptModal();
    }
  }
}

function showResetPromptModal() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9700;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div class="card" style="max-width:320px;width:100%;text-align:center">
      <div style="font-size:32px;margin-bottom:10px">☀️</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;margin-bottom:8px">NEW DAY!</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px">Reset yesterday's workout checkboxes for a fresh start today?</p>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">Keep</button>
        <button onclick="confirmWorkoutReset(this)" style="flex:1;background:var(--accent);border:none;color:#000;padding:10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">Reset</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function confirmWorkoutReset(btn) {
  pplChecked = { push: {}, pull: {}, legs: {} };
  autoSave();
  if (typeof renderPPL === 'function') renderPPL();
  btn.closest('div[style*=fixed]')?.remove();
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
    renderRestDayContent();
    const restContent = document.getElementById('rest-day-content');
    const pplTabsWrap = document.getElementById('ppl-tabs-wrap');
    if (restContent) restContent.style.display = 'block';
    if (pplTabsWrap) pplTabsWrap.style.display = 'none';
    document.querySelectorAll('.ppl-panel').forEach(p => p.style.display = 'none');
  } else {
    const restContent = document.getElementById('rest-day-content');
    const pplTabsWrap = document.getElementById('ppl-tabs-wrap');
    if (restContent) restContent.style.display = 'none';
    if (pplTabsWrap) pplTabsWrap.style.display = 'flex';
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

function renderRestDayContent() {
  const stretchEl = document.getElementById('rest-day-stretches');
  const tipsEl = document.getElementById('rest-day-tips');
  if (stretchEl) {
    stretchEl.innerHTML = REST_DAY_STRETCHES.map(s => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:rgba(170,68,255,.05);border:1px solid rgba(170,68,255,.15);border-radius:10px">
        <span style="font-size:20px;flex-shrink:0">${s.icon}</span>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <span style="font-size:13px;font-weight:700">${s.name}</span>
            <span style="font-size:11px;color:var(--purple);font-weight:700;white-space:nowrap">${s.duration}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.4">${s.note}</div>
        </div>
      </div>`).join('');
  }
  if (tipsEl) {
    tipsEl.innerHTML = REST_DAY_TIPS.map(t => `
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px">
        <div style="font-size:20px;margin-bottom:6px">${t.icon}</div>
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">${t.title}</div>
        <div style="font-size:11px;color:var(--muted);line-height:1.4">${t.note}</div>
      </div>`).join('');
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

function getExperienceLevel() {
  const tag = document.querySelector('#experience-tags .tag.selected');
  if (!tag) return 'intermediate';
  const txt = tag.textContent.toLowerCase();
  if (txt.includes('beginner')) return 'beginner';
  if (txt.includes('advanced')) return 'advanced';
  return 'intermediate';
}

function hasDeskJobTag() {
  return [...document.querySelectorAll('#injury-tags .tag.selected')].some(t => t.textContent.includes('Desk Job'));
}

function hasAthleticGoal() {
  const tag = document.querySelector('#goal-tags .tag.selected');
  return tag && tag.textContent.includes('Athletic Performance');
}

function getAdjustedExercises(day) {
  let exs = [...PPL_DATA[day]]; // copy
  const level = getExperienceLevel();
  const ageGroup = getAgeGroupFromAge(document.getElementById('p-age')?.value);

  if (level === 'beginner') {
    // Swap harder exercises for easier ones, trim to 6
    exs = exs.map(ex => {
      const swap = BEGINNER_SWAPS[ex.name];
      return swap ? { ...ex, ...swap } : ex;
    }).slice(0, 6);
  } else if (level === 'advanced') {
    // Add bonus finisher exercise
    exs = [...exs, ADVANCED_BONUS[day]];
  }

  // Age group adjustments — applied after level swaps
  if (ageGroup === 'teen') {
    exs = exs.map(ex => {
      const swap = TEEN_SWAPS[ex.name];
      return swap ? { ...ex, ...swap } : ex;
    });
  } else if (ageGroup === 'mature') {
    exs = exs.map(ex => {
      const swap = MATURE_SWAPS[ex.name];
      return swap ? { ...ex, ...swap } : ex;
    });
  }

  // Posture add-on
  if (hasDeskJobTag() && POSTURE_ADDON[day]) {
    exs = [...exs, ...POSTURE_ADDON[day]];
  }

  // Athletic add-on
  if (hasAthleticGoal() && ATHLETIC_ADDON[day]) {
    let athleticExs = [...ATHLETIC_ADDON[day]];
    // Apply mature swaps to athletic add-ons too (sprints/bounds are high-impact)
    if (ageGroup === 'mature') {
      athleticExs = athleticExs.map(ex => {
        const swap = MATURE_SWAPS[ex.name];
        return swap ? { ...ex, ...swap } : ex;
      });
    }
    exs = [...exs, ...athleticExs];
  }

  // User's own custom exercises — always included regardless of level
  if (customExercises[day] && customExercises[day].length) {
    exs = [...exs, ...customExercises[day]];
  }

  return exs;
}

// ── ADD CUSTOM EXERCISE MODAL ─────────────────────────────────
let currentCustomExerciseDay = null;

function openAddExerciseModal(day) {
  currentCustomExerciseDay = day;
  const modal = document.getElementById('custom-exercise-modal');
  if (modal) modal.style.display = 'flex';
  ['ce-name','ce-sets','ce-muscles','ce-equipment','ce-note'].forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== 'ce-sets') el.value = '';
  });
  document.getElementById('ce-sets').value = '3';
  document.getElementById('ce-reps').value = '12-15';
}

function closeAddExerciseModal() {
  const modal = document.getElementById('custom-exercise-modal');
  if (modal) modal.style.display = 'none';
  currentCustomExerciseDay = null;
}

function saveCustomExercise() {
  const name = document.getElementById('ce-name')?.value.trim();
  if (!name) { alert('Exercise name is required'); return; }
  const sets = document.getElementById('ce-sets')?.value.trim() || '3';
  const reps = document.getElementById('ce-reps')?.value.trim() || '12';
  const muscles = document.getElementById('ce-muscles')?.value.trim() || 'Custom';
  const equipment = document.getElementById('ce-equipment')?.value.trim() || '';
  const note = document.getElementById('ce-note')?.value.trim() || 'Custom exercise added by you.';

  if (!currentCustomExerciseDay) return;
  if (!customExercises[currentCustomExerciseDay]) customExercises[currentCustomExerciseDay] = [];
  customExercises[currentCustomExerciseDay].push({ name, sets, reps, muscles, equipment, note, isCustom: true });

  closeAddExerciseModal();
  renderPPL();
  autoSave();
  syncPublicRoutine();
}

function removeCustomExercise(day, index) {
  if (!confirm('Remove this custom exercise?')) return;
  customExercises[day].splice(index, 1);
  renderPPL();
  autoSave();
  syncPublicRoutine();
}

function renderPPL() {
  try {
  renderTodayBanner();
  ['push','pull','legs'].forEach(day => {
    renderWarmup(day);
    const exs = getAdjustedExercises(day);
    const container = document.getElementById(`${day}-exercises`);
    if (!container) return;
    container.innerHTML = exs.map((ex, i) => {
      const key = ex.name;
      const done = (pplChecked[day] && pplChecked[day][key]) || false;
      const safeId = 'ol-btn-' + ex.name.replace(/[^a-zA-Z0-9]/g, '_');
      const prev = (overloadLog && overloadLog[ex.name]) || null;
      const customIdx = ex.isCustom ? customExercises[day].findIndex(c => c.name === ex.name) : -1;
      return `
      <div class="workout-exercise-item" id="${day}-ex-${i}">
        <div class="workout-checkbox ${done ? 'done' : ''}" onclick="toggleExercise('${day}','${key}')"></div>
        <div class="workout-ex-info">
          <div class="workout-ex-name" style="${done ? 'text-decoration:line-through;opacity:.5' : ''}">${ex.name} ${ex.isCustom ? '<span style="font-size:9px;background:var(--accent);color:#000;padding:1px 6px;border-radius:4px;font-weight:700;vertical-align:middle">YOURS</span>' : ''}</div>
          <div class="workout-ex-meta" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:3px">
            <span style="font-size:10px;color:var(--muted);background:var(--bg3);border:1px solid var(--border);padding:2px 7px;border-radius:4px">🎯 ${ex.muscles}</span>
            ${ex.equipment ? `<span style="font-size:10px;color:var(--accent2);background:rgba(68,255,204,.07);border:1px solid rgba(68,255,204,.2);padding:2px 7px;border-radius:4px">🏋️ ${ex.equipment}</span>` : ''}
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:5px;line-height:1.4">${ex.note}</div>
          ${prev ? `<div class="overload-prev">📊 Last: ${prev.weight}kg × ${prev.reps} (${prev.date}) <span onclick="viewExerciseHistory('${ex.name.replace(/'/g,"\\'")}')" style="text-decoration:underline;cursor:pointer;color:var(--accent2)">View History</span></div>` : ''}
          <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
            <button class="overload-log-btn" id="${safeId}" onclick="toggleOverloadInput('${ex.name.replace(/'/g,"\\'")}')">+ Log Weight</button>
            ${customIdx >= 0 ? `<button onclick="removeCustomExercise('${day}',${customIdx})" style="background:none;border:none;color:#ff4466;font-size:10px;cursor:pointer;text-decoration:underline">Remove</button>` : ''}
          </div>
        </div>
        <div class="workout-ex-badge">${ex.sets} × ${ex.reps}</div>
      </div>`;
    }).join('');
    updatePPLProgress(day, exs.length);
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

function updatePPLProgress(day, totalOverride) {
  const total = totalOverride || PPL_DATA[day].length;
  const done = Object.values(pplChecked[day] || {}).filter(Boolean).length;
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
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
  if (!w || !r) {
    const inputW = document.getElementById(safeId + '-w');
    const inputR = document.getElementById(safeId + '-r');
    if (!w && inputW) inputW.style.borderColor = '#ff4466';
    if (!r && inputR) inputR.style.borderColor = '#ff4466';
    setTimeout(() => {
      if (inputW) inputW.style.borderColor = 'var(--border)';
      if (inputR) inputR.style.borderColor = 'var(--border)';
    }, 1500);
    return;
  }
  const today = new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short'});
  const prev = overloadLog[exName];
  overloadLog[exName] = { weight: w, reps: r, date: today };

  // Append to full history (capped at last 15 entries per exercise)
  if (!overloadHistory[exName]) overloadHistory[exName] = [];
  overloadHistory[exName].push({ weight: w, reps: r, date: today, ts: Date.now() });
  if (overloadHistory[exName].length > 15) overloadHistory[exName].shift();

  // PR detection
  if (prev && w > prev.weight) {
    showPRCelebration(exName, w);
  }
  autoSave();
  document.getElementById(safeId)?.remove();
  renderPPL(); // refresh to show updated prev
}

function viewExerciseHistory(exName) {
  const history = overloadHistory[exName] || [];
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9600;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  if (!history.length) {
    modal.innerHTML = `<div class="card" style="max-width:320px;width:100%;text-align:center;position:relative">
      <button onclick="this.closest('div[style*=fixed]').remove()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">✕</button>
      <div style="font-size:14px;font-weight:700;margin-bottom:10px">${escapeHtmlGym(exName)}</div>
      <div style="color:var(--muted);font-size:12px;padding:20px 0">No history yet — log a weight to start tracking progress.</div>
    </div>`;
    document.body.appendChild(modal);
    return;
  }

  const maxWeight = Math.max(...history.map(h => h.weight));
  const minWeight = Math.min(...history.map(h => h.weight));
  const range = maxWeight - minWeight || 1;

  modal.innerHTML = `<div class="card" style="max-width:380px;width:100%;position:relative">
    <button onclick="this.closest('div[style*=fixed]').remove()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">✕</button>
    <div style="font-size:14px;font-weight:700;margin-bottom:4px">${escapeHtmlGym(exName)}</div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:18px">Last ${history.length} session${history.length>1?'s':''}</div>
    <div style="display:flex;align-items:flex-end;gap:6px;height:120px;margin-bottom:10px;padding:0 4px">
      ${history.map(h => {
        const heightPct = 15 + ((h.weight - minWeight) / range) * 85;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
          <div style="font-size:9px;color:var(--accent);margin-bottom:3px;font-weight:700">${h.weight}</div>
          <div style="width:100%;background:linear-gradient(180deg,var(--accent),var(--accent2));border-radius:4px 4px 0 0;height:${heightPct}%"></div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:6px;padding:0 4px">
      ${history.map(h => `<div style="flex:1;text-align:center;font-size:8px;color:var(--muted)">${h.date}</div>`).join('')}
    </div>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;font-size:11px;color:var(--muted)">
      <span>Best: <strong style="color:var(--accent)">${maxWeight}kg</strong></span>
      <span>Latest: <strong style="color:var(--text)">${history[history.length-1].weight}kg × ${history[history.length-1].reps}</strong></span>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function escapeHtmlGym(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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
  const exs = getAdjustedExercises(dayType);
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
  if (typeof renderMuscleHeatmap === 'function') renderMuscleHeatmap();
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

// ============================================================
// 1RM CALCULATOR (Epley Formula)
// ============================================================
function calculate1RM() {
  const weightEl = document.getElementById('orm-weight');
  const repsEl = document.getElementById('orm-reps');
  const resultEl = document.getElementById('orm-result');
  if (!weightEl || !repsEl || !resultEl) return;

  const weight = parseFloat(weightEl.value);
  const reps = parseInt(repsEl.value);

  if (!weight || !reps || reps < 1 || reps > 20) {
    resultEl.innerHTML = `<div style="color:var(--muted);font-size:12px;text-align:center;padding:14px">Enter weight and reps (1-20) to calculate</div>`;
    return;
  }

  // Epley formula: 1RM = weight × (1 + reps/30)
  const oneRM = weight * (1 + reps / 30);
  const rounded = Math.round(oneRM * 2) / 2; // round to nearest 0.5

  // Percentage breakdown table — common training percentages
  const percentages = [
    {pct: 100, label: '1RM (Max)'},
    {pct: 95, label: '~2 reps'},
    {pct: 90, label: '~4 reps'},
    {pct: 85, label: '~6 reps'},
    {pct: 80, label: '~8 reps'},
    {pct: 75, label: '~10 reps'},
    {pct: 70, label: '~12 reps'},
  ];

  resultEl.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:40px;letter-spacing:1px;color:var(--accent)">${rounded}<span style="font-size:16px;color:var(--muted)">kg</span></div>
      <div style="font-size:11px;color:var(--muted)">Estimated 1 Rep Max</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      ${percentages.map(p => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 12px;background:var(--bg3);border-radius:6px">
          <span style="font-size:11px;color:var(--muted)">${p.pct}% — ${p.label}</span>
          <span style="font-size:13px;font-weight:700;color:${p.pct===100?'var(--accent)':'var(--text)'}">${(rounded * p.pct / 100).toFixed(1)}kg</span>
        </div>`).join('')}
    </div>
    <div style="font-size:10px;color:var(--muted);margin-top:10px;text-align:center">Based on the Epley formula — estimate only, actual performance varies</div>`;
}

// ============================================================
// MUSCLE HEATMAP
// ============================================================
function getTrainedMuscleGroups() {
  // Determine which muscle groups were trained this week based on workoutHistory
  const groups = { chest: 0, shoulders: 0, triceps: 0, back: 0, biceps: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0, abs: 0 };
  const dayToGroups = {
    push: ['chest', 'shoulders', 'triceps'],
    pull: ['back', 'biceps', 'shoulders'],
    legs: ['quads', 'hamstrings', 'glutes', 'calves']
  };
  const recentHistory = workoutHistory.filter(h => {
    const daysAgo = (Date.now() - new Date(h.dateRaw).getTime()) / 86400000;
    return daysAgo <= 7;
  });
  recentHistory.forEach(h => {
    const intensity = h.completed / h.total; // 0 to 1
    (dayToGroups[h.dayType] || []).forEach(g => {
      groups[g] = Math.min(1, groups[g] + intensity * 0.4); // accumulate, cap at 1
    });
  });
  return groups;
}

function renderMuscleHeatmap() {
  const container = document.getElementById('muscle-heatmap-container');
  if (!container) return;
  const groups = getTrainedMuscleGroups();

  const heat = (g) => {
    const v = groups[g] || 0;
    if (v === 0) return 'rgba(120,120,130,.25)';
    if (v < 0.3) return 'rgba(68,170,255,.4)';
    if (v < 0.6) return 'rgba(240,255,68,.55)';
    return 'rgba(255,107,68,.75)';
  };

  container.innerHTML = `
    <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap">
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:700">FRONT</div>
        <svg width="110" height="220" viewBox="0 0 110 220">
          <!-- Head -->
          <circle cx="55" cy="18" r="14" fill="rgba(120,120,130,.15)"/>
          <!-- Shoulders -->
          <ellipse cx="30" cy="42" rx="13" ry="9" fill="${heat('shoulders')}"/>
          <ellipse cx="80" cy="42" rx="13" ry="9" fill="${heat('shoulders')}"/>
          <!-- Chest -->
          <rect x="32" y="40" width="46" height="32" rx="8" fill="${heat('chest')}"/>
          <!-- Abs -->
          <rect x="38" y="74" width="34" height="38" rx="6" fill="${heat('abs')}"/>
          <!-- Biceps -->
          <rect x="14" y="48" width="13" height="34" rx="6" fill="${heat('biceps')}"/>
          <rect x="83" y="48" width="13" height="34" rx="6" fill="${heat('biceps')}"/>
          <!-- Quads -->
          <rect x="34" y="115" width="18" height="55" rx="7" fill="${heat('quads')}"/>
          <rect x="58" y="115" width="18" height="55" rx="7" fill="${heat('quads')}"/>
          <!-- Calves -->
          <rect x="36" y="175" width="14" height="35" rx="6" fill="${heat('calves')}"/>
          <rect x="60" y="175" width="14" height="35" rx="6" fill="${heat('calves')}"/>
        </svg>
      </div>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:700">BACK</div>
        <svg width="110" height="220" viewBox="0 0 110 220">
          <circle cx="55" cy="18" r="14" fill="rgba(120,120,130,.15)"/>
          <ellipse cx="30" cy="42" rx="13" ry="9" fill="${heat('shoulders')}"/>
          <ellipse cx="80" cy="42" rx="13" ry="9" fill="${heat('shoulders')}"/>
          <!-- Back/Lats -->
          <rect x="30" y="40" width="50" height="48" rx="8" fill="${heat('back')}"/>
          <!-- Triceps -->
          <rect x="14" y="48" width="13" height="34" rx="6" fill="${heat('triceps')}"/>
          <rect x="83" y="48" width="13" height="34" rx="6" fill="${heat('triceps')}"/>
          <!-- Glutes -->
          <rect x="36" y="92" width="38" height="22" rx="8" fill="${heat('glutes')}"/>
          <!-- Hamstrings -->
          <rect x="34" y="116" width="18" height="50" rx="7" fill="${heat('hamstrings')}"/>
          <rect x="58" y="116" width="18" height="50" rx="7" fill="${heat('hamstrings')}"/>
          <!-- Calves -->
          <rect x="36" y="175" width="14" height="35" rx="6" fill="${heat('calves')}"/>
          <rect x="60" y="175" width="14" height="35" rx="6" fill="${heat('calves')}"/>
        </svg>
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:14px;margin-top:14px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(120,120,130,.25)"></div>Not trained</div>
      <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(68,170,255,.4)"></div>Light</div>
      <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(240,255,68,.55)"></div>Moderate</div>
      <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(255,107,68,.75)"></div>Heavy</div>
    </div>
    <div style="font-size:10px;color:var(--muted);text-align:center;margin-top:10px">Based on workouts finished in the last 7 days</div>`;
}

// ============================================================
// FULLY CUSTOM ROUTINE BUILDER
// ============================================================
let _selectedRoutineIcon = '💪';
let _editingRoutineDayId = null;

function toggleCustomRoutineMode() {
  customRoutineEnabled = document.getElementById('custom-routine-toggle')?.checked || false;
  const builder = document.getElementById('custom-routine-builder');
  const pplTabsWrap = document.getElementById('ppl-tabs-wrap');
  document.querySelectorAll('.ppl-panel').forEach(p => p.style.display = customRoutineEnabled ? 'none' : '');

  if (builder) builder.style.display = customRoutineEnabled ? 'block' : 'none';
  if (pplTabsWrap) pplTabsWrap.style.display = customRoutineEnabled ? 'none' : 'flex';

  if (customRoutineEnabled) {
    renderCustomRoutineDays();
  } else {
    renderPPL();
  }
  autoSave();
}

function selectRoutineIcon(icon, btn) {
  _selectedRoutineIcon = icon;
  document.querySelectorAll('.rd-icon-btn').forEach(b => { b.classList.remove('selected'); b.style.borderColor = 'var(--border)'; });
  btn.classList.add('selected');
  btn.style.borderColor = 'var(--accent)';
}

function openAddRoutineDayModal() {
  const modal = document.getElementById('routine-day-modal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('rd-name').value = '';
  _selectedRoutineIcon = '💪';
}

function closeRoutineDayModal() {
  const modal = document.getElementById('routine-day-modal');
  if (modal) modal.style.display = 'none';
}

function saveRoutineDay() {
  const name = document.getElementById('rd-name')?.value.trim();
  if (!name) { alert('Day name is required'); return; }
  customRoutineDays.push({
    id: 'day_' + Date.now(),
    name,
    icon: _selectedRoutineIcon,
    exercises: []
  });
  closeRoutineDayModal();
  renderCustomRoutineDays();
  autoSave();
  syncPublicRoutine();
}

function deleteRoutineDay(dayId) {
  if (!confirm('Delete this entire day and its exercises?')) return;
  customRoutineDays = customRoutineDays.filter(d => d.id !== dayId);
  renderCustomRoutineDays();
  autoSave();
  syncPublicRoutine();
}

function openAddRoutineExerciseModal(dayId) {
  _editingRoutineDayId = dayId;
  const modal = document.getElementById('routine-exercise-modal');
  if (modal) modal.style.display = 'flex';
  ['rde-name','rde-muscles','rde-equipment','rde-note'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('rde-sets').value = '3';
  document.getElementById('rde-reps').value = '12-15';
}

function closeRoutineExerciseModal() {
  const modal = document.getElementById('routine-exercise-modal');
  if (modal) modal.style.display = 'none';
  _editingRoutineDayId = null;
}

function saveRoutineExercise() {
  const name = document.getElementById('rde-name')?.value.trim();
  if (!name) { alert('Exercise name is required'); return; }
  const sets = document.getElementById('rde-sets')?.value.trim() || '3';
  const reps = document.getElementById('rde-reps')?.value.trim() || '12';
  const muscles = document.getElementById('rde-muscles')?.value.trim() || 'Custom';
  const equipment = document.getElementById('rde-equipment')?.value.trim() || '';
  const note = document.getElementById('rde-note')?.value.trim() || 'Custom exercise.';

  const day = customRoutineDays.find(d => d.id === _editingRoutineDayId);
  if (!day) return;
  day.exercises.push({ name, sets, reps, muscles, equipment, note });

  closeRoutineExerciseModal();
  renderCustomRoutineDays();
  autoSave();
  syncPublicRoutine();
}

function removeRoutineExercise(dayId, exIndex) {
  const day = customRoutineDays.find(d => d.id === dayId);
  if (!day) return;
  day.exercises.splice(exIndex, 1);
  renderCustomRoutineDays();
  autoSave();
  syncPublicRoutine();
}

function toggleCustomRoutineCheck(dayId, exName) {
  const key = `custom_${dayId}_${exName}`;
  if (!pplChecked.custom) pplChecked.custom = {};
  pplChecked.custom[key] = !pplChecked.custom[key];
  renderCustomRoutineDays();
  autoSave();
}

function renderCustomRoutineDays() {
  const listEl = document.getElementById('custom-routine-days-list');
  const emptyEl = document.getElementById('custom-routine-empty');
  if (!listEl) return;

  if (!customRoutineDays.length) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  if (!pplChecked.custom) pplChecked.custom = {};

  listEl.innerHTML = customRoutineDays.map(day => {
    const doneCount = day.exercises.filter(ex => pplChecked.custom[`custom_${day.id}_${ex.name}`]).length;
    return `
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:15px;font-weight:700">${day.icon} ${escapeHtmlGym(day.name)}</div>
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:11px;color:var(--muted)">${doneCount}/${day.exercises.length}</span>
          <button onclick="deleteRoutineDay('${day.id}')" style="background:none;border:none;color:#ff4466;font-size:11px;cursor:pointer">Delete Day</button>
        </div>
      </div>
      ${day.exercises.map((ex, i) => {
        const done = pplChecked.custom[`custom_${day.id}_${ex.name}`] || false;
        return `<div class="workout-exercise-item">
          <div class="workout-checkbox ${done ? 'done' : ''}" onclick="toggleCustomRoutineCheck('${day.id}','${ex.name.replace(/'/g,"\\'")}')"></div>
          <div class="workout-ex-info">
            <div class="workout-ex-name" style="${done ? 'text-decoration:line-through;opacity:.5' : ''}">${escapeHtmlGym(ex.name)}</div>
            <div class="workout-ex-meta" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:3px">
              <span style="font-size:10px;color:var(--muted);background:var(--bg);border:1px solid var(--border);padding:2px 7px;border-radius:4px">🎯 ${escapeHtmlGym(ex.muscles)}</span>
              ${ex.equipment ? `<span style="font-size:10px;color:var(--accent2);background:rgba(68,255,204,.07);border:1px solid rgba(68,255,204,.2);padding:2px 7px;border-radius:4px">🏋️ ${escapeHtmlGym(ex.equipment)}</span>` : ''}
            </div>
            ${ex.note ? `<div style="font-size:11px;color:var(--muted);margin-top:5px">${escapeHtmlGym(ex.note)}</div>` : ''}
            <button onclick="removeRoutineExercise('${day.id}',${i})" style="background:none;border:none;color:#ff4466;font-size:10px;cursor:pointer;text-decoration:underline;margin-top:4px">Remove</button>
          </div>
          <div class="workout-ex-badge">${escapeHtmlGym(ex.sets)} × ${escapeHtmlGym(ex.reps)}</div>
        </div>`;
      }).join('')}
      <button onclick="openAddRoutineExerciseModal('${day.id}')" style="width:100%;background:var(--bg);border:1px dashed var(--border);color:var(--accent2);padding:8px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-top:8px">+ Add Exercise</button>
    </div>`;
  }).join('');
}

// ============================================================
// ROUTINE PRESET SELECTOR (PPL / Bro Split / Upper-Lower)
// ============================================================
const PRESET_INFO = {
  ppl: { label: 'Push / Pull / Legs', icon: '💪', desc: '6 days, hits each muscle 2x/week. Best for most lifters and beginners.' },
  broSplit: { label: 'Bro Split (Back/Chest/Arms/Back/Shoulders/Legs)', icon: '🏋️', desc: '6 days, one muscle group focus per day. High volume per session — popular for muscle gain.' },
  upperLower: { label: 'Upper / Lower', icon: '⚡', desc: '4 days, hits each muscle ~2x/week with less time in the gym. Good if you have limited days available.' }
};

function getRecommendedPreset() {
  const weight = parseFloat(document.getElementById('p-weight')?.value);
  const height = parseFloat(document.getElementById('p-height')?.value);
  const level = typeof getExperienceLevel === 'function' ? getExperienceLevel() : 'intermediate';
  const goalTag = document.querySelector('#goal-tags .tag.selected')?.textContent || '';

  if (level === 'beginner') return 'ppl'; // simplest split to learn movement patterns

  let bmi = null;
  if (weight && height) bmi = weight / ((height/100) ** 2);

  if (goalTag.includes('Gain Muscle') && level === 'advanced') return 'broSplit';
  if (bmi && bmi >= 25) return 'ppl'; // higher frequency favors fat-loss-friendly splits
  if (goalTag.includes('Athletic') || goalTag.includes('Stronger')) return 'upperLower';

  return 'ppl'; // safe default
}

function renderPresetSelector() {
  const labelEl = document.getElementById('current-preset-label');
  const cardsWrap = document.getElementById('preset-cards-wrap');
  if (!labelEl || !cardsWrap) return;

  const info = PRESET_INFO[activePreset];
  labelEl.innerHTML = `Currently on: <strong style="color:var(--accent)">${info.icon} ${info.label}</strong>`;

  const recommended = getRecommendedPreset();
  cardsWrap.innerHTML = Object.entries(PRESET_INFO).map(([key, p]) => {
    const isActive = key === activePreset;
    const isRecommended = key === recommended && key !== activePreset;
    return `
    <div onclick="switchPreset('${key}')" style="cursor:pointer;background:${isActive ? 'rgba(240,255,68,.08)' : 'var(--bg3)'};border:1px solid ${isActive ? 'var(--accent)' : 'var(--border)'};border-radius:12px;padding:16px;position:relative">
      ${isRecommended ? '<div style="position:absolute;top:-9px;right:10px;background:var(--accent2);color:#000;font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px">RECOMMENDED FOR YOU</div>' : ''}
      <div style="font-size:24px;margin-bottom:6px">${p.icon}</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:4px">${p.label}</div>
      <div style="font-size:11px;color:var(--muted);line-height:1.4">${p.desc}</div>
      ${isActive ? '<div style="font-size:10px;color:var(--accent);font-weight:700;margin-top:8px">✓ ACTIVE</div>' : ''}
    </div>`;
  }).join('');
}

function togglePresetSelector() {
  const wrap = document.getElementById('preset-cards-wrap');
  const btn = document.getElementById('preset-toggle-btn');
  if (!wrap) return;
  const isOpen = wrap.style.display === 'grid';
  wrap.style.display = isOpen ? 'none' : 'grid';
  if (btn) btn.textContent = isOpen ? 'Change' : 'Close';
  if (!isOpen) renderPresetSelector();
}

function switchPreset(presetKey) {
  activePreset = presetKey;
  renderPresetSelector();
  renderActivePresetDays();
  autoSave();
  syncPublicRoutine();
  // Collapse selector after choosing
  const wrap = document.getElementById('preset-cards-wrap');
  const btn = document.getElementById('preset-toggle-btn');
  if (wrap) wrap.style.display = 'none';
  if (btn) btn.textContent = 'Change';
}

function getActivePresetData() {
  if (activePreset === 'broSplit') return BRO_SPLIT_DATA;
  if (activePreset === 'upperLower') return UPPER_LOWER_DATA;
  return null; // PPL uses existing PPL_DATA system, handled separately
}

function renderActivePresetDays() {
  const pplTabsWrap = document.getElementById('ppl-tabs-wrap');
  const builder = document.getElementById('custom-routine-builder');
  const mappingSection = document.getElementById('day-mapping-section');

  if (activePreset === 'ppl') {
    // Restore original PPL view
    if (pplTabsWrap) pplTabsWrap.style.display = customRoutineEnabled ? 'none' : 'flex';
    document.querySelectorAll('.ppl-panel').forEach(p => p.style.display = customRoutineEnabled ? 'none' : '');
    if (!customRoutineEnabled) renderPPL();
    removePresetDayPanels();
    if (mappingSection) mappingSection.style.display = 'none';
    return;
  }

  // Bro Split or Upper/Lower — hide PPL tabs/panels, hide custom builder, show preset days instead
  if (pplTabsWrap) pplTabsWrap.style.display = 'none';
  document.querySelectorAll('.ppl-panel').forEach(p => p.style.display = 'none');
  if (builder) builder.style.display = 'none';

  renderDayMappingUI();
  renderPresetDayPanels();
}

function togglePresetDayCard(dayKey) {
  const card = document.getElementById(`preset-day-${dayKey}`);
  if (!card) return;
  const body = card.querySelector('.preset-day-body');
  const chevron = card.querySelector('.preset-chevron');
  const isExpanded = card.classList.contains('expanded');

  if (isExpanded) {
    card.classList.remove('expanded');
    if (body) body.style.display = 'none';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } else {
    card.classList.add('expanded');
    if (body) body.style.display = 'block';
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }
}

function removePresetDayPanels() {
  const existing = document.getElementById('preset-day-panels');
  if (existing) existing.remove();
}

function renderPresetDayPanels() {
  removePresetDayPanels();
  const presetData = getActivePresetData();
  if (!presetData) return;

  const wrap = document.createElement('div');
  wrap.id = 'preset-day-panels';

  if (!pplChecked.preset) pplChecked.preset = {};
  const todaysKey = getTodaysPresetDayKey();

  wrap.innerHTML = Object.entries(presetData).map(([dayKey, day]) => {
    const doneCount = day.exercises.filter(ex => pplChecked.preset[`${activePreset}_${dayKey}_${ex.name}`]).length;
    const isToday = dayKey === todaysKey;
    // Accordion: only today's day starts expanded, all others start collapsed
    const expanded = isToday;
    return `
    <div class="preset-day-card ${expanded ? 'expanded' : ''}" id="preset-day-${dayKey}" style="background:var(--card);border:1px solid ${isToday ? 'var(--accent)' : 'var(--border)'};border-radius:14px;margin-bottom:14px;overflow:hidden;${isToday ? 'box-shadow:0 0 18px rgba(240,255,68,.08)' : ''}">
      <div onclick="togglePresetDayCard('${dayKey}')" style="display:flex;justify-content:space-between;align-items:center;padding:18px 20px;cursor:pointer">
        <div>
          <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.6px">${day.day} ${isToday ? '<span style="background:var(--accent);color:#000;padding:1px 7px;border-radius:4px;font-weight:800;margin-left:4px">TODAY</span>' : ''}</div>
          <div style="font-size:18px;font-weight:700">${day.icon} ${day.label}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:12px;color:var(--muted)">${doneCount}/${day.exercises.length}</span>
          <span style="color:var(--muted);font-size:13px;transition:transform .2s;${expanded ? 'transform:rotate(180deg)' : ''}" class="preset-chevron">▼</span>
        </div>
      </div>
      <div class="preset-day-body" style="display:${expanded ? 'block' : 'none'};padding:0 20px 20px">
        <div class="workout-progress"><div class="workout-progress-fill" style="width:${Math.round((doneCount/day.exercises.length)*100)}%"></div></div>
        <div style="margin-top:12px">
          ${day.exercises.map(ex => {
            const checkKey = `${activePreset}_${dayKey}_${ex.name}`;
            const done = pplChecked.preset[checkKey] || false;
            const prev = (overloadLog && overloadLog[ex.name]) || null;
            const safeId = 'ol-btn-' + ex.name.replace(/[^a-zA-Z0-9]/g, '_');
            return `<div class="workout-exercise-item">
              <div class="workout-checkbox ${done ? 'done' : ''}" onclick="event.stopPropagation();togglePresetExercise('${dayKey}','${ex.name.replace(/'/g,"\\'")}')"></div>
              <div class="workout-ex-info">
                <div class="workout-ex-name" style="${done ? 'text-decoration:line-through;opacity:.5' : ''}">${escapeHtmlGym(ex.name)}</div>
                <div class="workout-ex-meta" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:3px">
                  <span style="font-size:10px;color:var(--muted);background:var(--bg3);border:1px solid var(--border);padding:2px 7px;border-radius:4px">🎯 ${escapeHtmlGym(ex.muscles)}</span>
                  <span style="font-size:10px;color:var(--accent2);background:rgba(68,255,204,.07);border:1px solid rgba(68,255,204,.2);padding:2px 7px;border-radius:4px">🏋️ ${escapeHtmlGym(ex.equipment)}</span>
                </div>
                <div style="font-size:11px;color:var(--muted);margin-top:5px;line-height:1.4">${escapeHtmlGym(ex.note)}</div>
                ${prev ? `<div class="overload-prev">📊 Last: ${prev.weight}kg × ${prev.reps} (${prev.date})</div>` : ''}
                <button class="overload-log-btn" onclick="event.stopPropagation();toggleOverloadInput('${ex.name.replace(/'/g,"\\'")}')">+ Log Weight</button>
              </div>
              <div class="workout-ex-badge">${ex.sets} × ${ex.reps}</div>
            </div>`;
          }).join('')}
        </div>
        ${isToday
          ? `<button class="finish-workout-btn" onclick="event.stopPropagation();finishPresetDay('${dayKey}')">✅ FINISH WORKOUT</button>`
          : `<div style="text-align:center;padding:12px;font-size:11px;color:var(--muted);background:var(--bg3);border-radius:8px;margin-top:8px">This isn't today's workout — switch to ${day.day} to log it here</div>`
        }
      </div>
    </div>`;
  }).join('');

  const anchor = document.getElementById('custom-routine-builder');
  if (anchor) anchor.insertAdjacentElement('afterend', wrap);
}

function togglePresetExercise(dayKey, exName) {
  if (!pplChecked.preset) pplChecked.preset = {};
  const key = `${activePreset}_${dayKey}_${exName}`;
  pplChecked.preset[key] = !pplChecked.preset[key];
  renderPresetDayPanels();
  autoSave();
}

function finishPresetDay(dayKey) {
  const presetData = getActivePresetData();
  if (!presetData) return;
  const day = presetData[dayKey];
  const doneCount = day.exercises.filter(ex => pplChecked.preset[`${activePreset}_${dayKey}_${ex.name}`]).length;
  if (doneCount === 0) { alert('Complete at least one exercise before finishing!'); return; }

  workoutHistory.unshift({
    date: new Date().toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'}),
    dateRaw: new Date().toDateString(),
    dayType: day.label,
    week: '',
    completed: doneCount,
    total: day.exercises.length,
    icon: day.icon
  });
  if (workoutHistory.length > 30) workoutHistory.pop();
  autoSave();
  renderWorkoutHistory();
  renderHome();
  alert(`${day.label} workout saved! 💪`);
}

// ============================================================
// CUSTOM DAY MAPPING — let user override which weekday = which body part
// ============================================================
function getDefaultDayMapping(presetKey) {
  // Default Mon-Sat order matching the original layout (0=Sun..6=Sat)
  if (presetKey === 'broSplit') {
    return { back1: 1, chest: 2, arms: 3, back2: 4, shoulders: 5, legs: 6 };
  }
  if (presetKey === 'upperLower') {
    return { upperA: 1, lowerA: 2, upperB: 4, lowerB: 5 };
  }
  return {};
}

function renderDayMappingUI() {
  const section = document.getElementById('day-mapping-section');
  const grid = document.getElementById('day-mapping-grid');
  if (!section || !grid) return;

  const presetData = getActivePresetData();
  if (!presetData) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  if (!Object.keys(customDayMapping).length) {
    customDayMapping = getDefaultDayMapping(activePreset);
  }

  grid.innerHTML = Object.entries(presetData).map(([dayKey, day]) => {
    const currentVal = customDayMapping[dayKey] ?? getDefaultDayMapping(activePreset)[dayKey];
    return `
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px">${day.icon} ${escapeHtmlGym(day.label)}</div>
      <select class="form-select" style="width:100%;font-size:12px;padding:6px 8px" onchange="setDayMapping('${dayKey}', this.value)">
        ${WEEKDAY_OPTIONS.map(w => `<option value="${w.val}" ${w.val === currentVal ? 'selected' : ''}>${w.label}</option>`).join('')}
      </select>
    </div>`;
  }).join('');
}

function setDayMapping(dayKey, weekdayVal) {
  customDayMapping[dayKey] = parseInt(weekdayVal);
  autoSave();
  renderActivePresetDays(); // refresh so "today" highlighting matches new mapping
}

function resetDayMapping() {
  customDayMapping = getDefaultDayMapping(activePreset);
  autoSave();
  renderDayMappingUI();
  renderActivePresetDays();
}

function getTodaysPresetDayKey() {
  const presetData = getActivePresetData();
  if (!presetData) return null;
  const todayWeekday = new Date().getDay();
  const mapping = Object.keys(customDayMapping).length ? customDayMapping : getDefaultDayMapping(activePreset);
  const match = Object.entries(mapping).find(([key, weekday]) => weekday === todayWeekday);
  return match ? match[0] : null;
}

// ============================================================
// EXERCISE LIBRARY SEARCH (search-to-assign for Custom Routine Builder)
// ============================================================
let _exerciseLibraryCache = null;

function buildExerciseLibrary() {
  if (_exerciseLibraryCache) return _exerciseLibraryCache;
  const pool = [];
  const seen = new Set();

  const addFrom = (sourceObj) => {
    Object.values(sourceObj).forEach(dayOrWeek => {
      const exercises = Array.isArray(dayOrWeek) ? dayOrWeek : dayOrWeek.exercises;
      if (!exercises) return;
      exercises.forEach(ex => {
        if (!seen.has(ex.name)) {
          seen.add(ex.name);
          pool.push(ex);
        }
      });
    });
  };

  // Pull from PPL Week A & B
  if (typeof PPL_DATA_WEEK !== 'undefined') {
    addFrom(PPL_DATA_WEEK.A);
    addFrom(PPL_DATA_WEEK.B);
  }
  // Pull from Bro Split
  if (typeof BRO_SPLIT_DATA !== 'undefined') addFrom(BRO_SPLIT_DATA);
  // Pull from Upper/Lower
  if (typeof UPPER_LOWER_DATA !== 'undefined') addFrom(UPPER_LOWER_DATA);

  _exerciseLibraryCache = pool;
  return pool;
}

function searchExerciseLibrary() {
  const input = document.getElementById('exercise-search-input');
  const resultsEl = document.getElementById('exercise-search-results');
  if (!input || !resultsEl) return;
  const raw = input.value.trim().toLowerCase();

  if (!raw) { resultsEl.style.display = 'none'; return; }

  // Support multiple terms: "biceps triceps" or "biceps, triceps, shoulders"
  // splits into separate search terms, matches if ANY term is found (OR logic)
  const terms = raw.split(/[\s,]+/).filter(t => t.length > 0);

  const library = buildExerciseLibrary();
  const matches = library.filter(ex => {
    const nameLower = ex.name.toLowerCase();
    const musclesLower = (ex.muscles || '').toLowerCase();
    return terms.some(term => nameLower.includes(term) || musclesLower.includes(term));
  }).slice(0, 20);

  if (!matches.length) {
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = `<div style="padding:14px;text-align:center;color:var(--muted);font-size:12px">No exercises found for "${escapeHtmlGym(raw)}"</div>`;
    return;
  }

  resultsEl.style.display = 'block';
  resultsEl.innerHTML = matches.map((ex, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600">${escapeHtmlGym(ex.name)}</div>
        <div style="font-size:10px;color:var(--muted)">${escapeHtmlGym(ex.muscles)} · ${escapeHtmlGym(ex.equipment||'')}</div>
      </div>
      <button onclick="openAssignExerciseModal(${i})" style="background:var(--accent);color:#000;border:none;padding:6px 12px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0;margin-left:8px">+ Add</button>
    </div>`).join('');

  // Stash matches for the assign modal to reference by index
  window._lastSearchMatches = matches;
}

function openAssignExerciseModal(matchIndex) {
  const ex = window._lastSearchMatches?.[matchIndex];
  if (!ex) return;
  window._pendingAssignExercise = ex;

  const modal = document.getElementById('assign-exercise-modal');
  const nameEl = document.getElementById('assign-exercise-name');
  const optionsEl = document.getElementById('assign-day-options');
  if (!modal || !optionsEl) return;

  nameEl.textContent = ex.name;

  if (!customRoutineDays.length) {
    optionsEl.innerHTML = `<div style="font-size:12px;color:var(--muted);text-align:center;padding:10px">No custom days yet — tap "+ Add Day" first to create one, then come back and add this exercise.</div>`;
  } else {
    optionsEl.innerHTML = customRoutineDays.map(day => `
      <button onclick="assignExerciseToDay('${day.id}')" style="display:flex;align-items:center;gap:10px;width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-size:13px;cursor:pointer;text-align:left">
        <span style="font-size:18px">${day.icon}</span> ${escapeHtmlGym(day.name)}
      </button>`).join('');
  }

  modal.style.display = 'flex';
}

function closeAssignExerciseModal() {
  const modal = document.getElementById('assign-exercise-modal');
  if (modal) modal.style.display = 'none';
  window._pendingAssignExercise = null;
}

function assignExerciseToDay(dayId) {
  const ex = window._pendingAssignExercise;
  const day = customRoutineDays.find(d => d.id === dayId);
  if (!ex || !day) return;

  // Copy the exercise into this day (don't mutate the shared library object)
  day.exercises.push({ ...ex });

  closeAssignExerciseModal();
  renderCustomRoutineDays();
  autoSave();
  syncPublicRoutine();

  // Clear search so user can search for the next exercise
  const input = document.getElementById('exercise-search-input');
  const resultsEl = document.getElementById('exercise-search-results');
  if (input) input.value = '';
  if (resultsEl) resultsEl.style.display = 'none';
}
