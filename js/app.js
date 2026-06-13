function renderHome() {
  try {
  // Welcome card
  const welcome = document.getElementById('home-welcome');
  const profileName = document.getElementById('p-name')?.value;
  const displayName = isGuest ? 'Guest' : (profileName || currentUser?.email || '');
  if (welcome && displayName) {
    welcome.style.display = 'inline-block';
    welcome.innerHTML = `👋 Welcome back, <strong style="color:var(--accent)">${displayName}</strong>`;
  }

  // Today's workout card
  const todayCard = document.getElementById('home-today-card');
  if (todayCard) {
    const todayPPL = getTodayPPL();
    const dayName = DAY_NAMES[new Date().getDay()];
    const typeLabels = {push:'Push Day 💪 — Chest · Shoulders · Triceps', pull:'Pull Day 🔥 — Back · Biceps · Rear Delts', legs:'Legs Day 🦵 — Quads · Glutes · Hamstrings'};
    const typeColors = {push:'rgba(255,107,68,.08)', pull:'rgba(68,136,255,.08)', legs:'rgba(68,255,136,.08)'};
    const typeBorder = {push:'rgba(255,107,68,.25)', pull:'rgba(68,136,255,.25)', legs:'rgba(68,255,136,.25)'};
    const typeText = {push:'var(--accent3)', pull:'var(--blue)', legs:'var(--green)'};
    if (todayPPL) {
      todayCard.innerHTML = `<div style="display:inline-block;background:${typeColors[todayPPL]};border:1px solid ${typeBorder[todayPPL]};border-radius:13px;padding:14px 24px;cursor:pointer" onclick="showScreen('gym')">
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px">TODAY — ${dayName}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;color:${typeText[todayPPL]}">${typeLabels[todayPPL]}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">Tap to open workout →</div>
      </div>`;
    } else {
      todayCard.innerHTML = `<div style="display:inline-block;background:rgba(170,68,255,.06);border:1px solid rgba(170,68,255,.2);border-radius:13px;padding:14px 24px">
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px">TODAY — ${dayName}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;color:var(--purple)">😴 Rest & Recovery Day</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">Muscles grow during rest — enjoy it</div>
      </div>`;
    }
  }

  // Quick stats
  const totals = typeof getTotals === 'function' ? getTotals() : {cal:0, p:0};
  const calEl = document.getElementById('home-cal-today');
  const protEl = document.getElementById('home-prot-today');
  const calTargetEl = document.getElementById('home-cal-target');
  const protTargetEl = document.getElementById('home-prot-target');
  const calBar = document.getElementById('home-cal-bar');
  const protBar = document.getElementById('home-prot-bar');
  if (calEl) calEl.textContent = totals.cal || 0;
  if (protEl) protEl.innerHTML = `${totals.p || 0}<span style="font-size:14px">g</span>`;
  if (calTargetEl) calTargetEl.textContent = `/ ${targetCal} kcal target`;
  if (protTargetEl) protTargetEl.textContent = `/ ${targetProtein}g target`;
  if (calBar) calBar.style.width = Math.min(100, Math.round(((totals.cal||0)/targetCal)*100)) + '%';
  if (protBar) protBar.style.width = Math.min(100, Math.round(((totals.p||0)/targetProtein)*100)) + '%';
  } catch(e) { console.error('renderHome error:', e); }
}

function syncProfileToDiet() {
  const profileWeight = document.getElementById('p-weight')?.value;
  const dietWeight = document.getElementById('diet-weight');
  if (profileWeight && dietWeight) {
    dietWeight.value = profileWeight;
  }
  const goalText = document.querySelector('#goal-tags .tag.selected')?.textContent.toLowerCase();
  const dietGoal = document.getElementById('diet-goal');
  if (goalText && dietGoal) {
    let mapped = '';
    if (goalText.includes('gain')) mapped = 'gain';
    else if (goalText.includes('lose') || goalText.includes('fat')) mapped = 'loss';
    else if (goalText.includes('stronger') || goalText.includes('strength') || goalText.includes('athletic')) mapped = 'strength';
    if (mapped) dietGoal.value = mapped;
  }
}
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  const ntNames = ['home','profile','gym','diet','recovery','myths'];
  const mnNames = ['home','profile','gym','diet','recovery'];
  document.querySelectorAll('.nav-tab').forEach((t,i) => t.classList.toggle('active', ntNames[i] === name));
  document.querySelectorAll('.mobile-nav-btn').forEach((b,i) => b.classList.toggle('active', mnNames[i] === name));
  window.scrollTo({top:0,behavior:'smooth'});
  if (name === 'home') renderHome();
  if (name === 'gym') { checkDailyWorkoutReset(); renderPPL(); renderWeeklySplit(); }
  if (name === 'myths') renderMyths();
  if (name === 'recovery') renderRecovery();
  if (name === 'diet') {
    syncProfileToDiet();
    updateNutritionDisplay();
  }
}

// ============================================================
// PROFILE & BMI
// ============================================================

function selectTag(el, group) {
  el.closest('.tag-group').querySelectorAll('.tag').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  calcBMI();
  autoSave();
}

function toggleTag(el) { 
  el.classList.toggle('selected');
  autoSave();
}

function calcBMI() {
  const w = parseFloat(document.getElementById('p-weight').value);
  const h = parseFloat(document.getElementById('p-height').value);
  if (!w || !h) return;
  const age = parseFloat(document.getElementById('p-age').value) || 25;
  // Read goal + activity from diet section to stay consistent
  const goal = document.getElementById('diet-goal')?.value || 'maintenance';
  const activity = document.getElementById('diet-activity')?.value || 'moderate';

  // Use shared engine — same numbers everywhere
  const calc = getCalcValues(w, h, age, goal, activity);
  const { bmi, tdee, calTarget, proteinTarget } = calc;
  targetCal = calTarget;
  targetProtein = proteinTarget;

  const status = bmi < 18.5 ? {l:'Underweight',c:'var(--blue)'} :
    bmi < 25 ? {l:'Normal Weight',c:'var(--green)'} :
    bmi < 30 ? {l:'Overweight',c:'var(--accent)'} : {l:'Obese',c:'var(--red)'};
  const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));

  // Generate smart recommendations based on BMI
  let recommendation = '';
  if (bmi < 18.5) {
    recommendation = `
      <div class="info-box" style="background:rgba(68,136,255,.07);border-color:rgba(68,136,255,.2);color:var(--blue)">
        <strong>⚠️ UNDERWEIGHT STATUS</strong><br>
        Your BMI (${bmi}) is below the normal range. Recommendations:
        <ul style="margin-top:8px;margin-left:18px;font-size:12px;line-height:1.6">
          <li>✅ Focus on <strong>MUSCLE GAIN</strong> — eat in caloric surplus (+400 kcal/day)</li>
          <li>✅ Increase protein intake: <strong>${targetProtein}g/day</strong> (1.9g/kg)</li>
          <li>✅ Eat 4-5 meals daily with calorie-dense foods: oats, rice, bananas, nuts, whole milk</li>
          <li>✅ Strength training 4-5x/week to build muscle mass</li>
          <li>✅ Protein post-workout within 1 hour: eggs, chicken, dal</li>
          <li>📊 Target: Gain 0.5-1kg per month (mostly muscle)</li>
          <li>💡 Tip: Track weight weekly and adjust calorie intake if no progress in 2 weeks</li>
        </ul>
      </div>
    `;
  } else if (bmi >= 18.5 && bmi < 25) {
    recommendation = `
      <div class="info-box" style="background:rgba(68,255,136,.07);border-color:rgba(68,255,136,.2);color:var(--green)">
        <strong>✅ NORMAL WEIGHT — MAINTENANCE & OPTIMIZATION</strong><br>
        Your BMI (${bmi}) is in the healthy normal range. Recommendations:
        <ul style="margin-top:8px;margin-left:18px;font-size:12px;line-height:1.6">
          <li>✅ Goal: <strong>BODY COMPOSITION</strong> — build lean muscle while staying lean</li>
          <li>✅ Eat at TDEE (${tdee} kcal) for maintenance, or slight surplus (+200 kcal) for lean gains</li>
          <li>✅ Moderate protein: <strong>${targetProtein}g/day</strong> (1.6g/kg) for lean muscle building</li>
          <li>✅ Balanced macros: 30-35% protein, 40% carbs, 25-30% fats</li>
          <li>✅ Strength training 4x/week + 1-2 cardio sessions (perfect for muscle-building phase)</li>
          <li>✅ Focus on compound lifts: squats, deadlifts, bench press, rows</li>
          <li>📊 Track progress: recomposition (lose fat, gain muscle) = stable weight, increasing strength</li>
          <li>💡 Tip: Get 7-9 hours sleep daily — critical for muscle recovery and hormonal balance</li>
        </ul>
      </div>
    `;
  } else if (bmi >= 25 && bmi < 30) {
    recommendation = `
      <div class="info-box" style="background:rgba(240,255,68,.07);border-color:rgba(240,255,68,.2);color:var(--accent)">
        <strong>⚠️ OVERWEIGHT STATUS</strong><br>
        Your BMI (${bmi}) is in the overweight range. Recommendations:
        <ul style="margin-top:8px;margin-left:18px;font-size:12px;line-height:1.6">
          <li>✅ Primary goal: <strong>FAT LOSS</strong> — eat in caloric deficit (-400 kcal/day)</li>
          <li>✅ Increase protein to preserve muscle: <strong>${targetProtein}g/day</strong> (1.4g/kg)</li>
          <li>✅ Reduce refined carbs; focus on: chicken, fish, eggs, dal, soya chunks, roti</li>
          <li>✅ Cardio 2-3x/week: 20-30 min brisk walk or cycling (low impact)</li>
          <li>✅ Resistance training 3-4x/week to prevent muscle loss during deficit</li>
          <li>📊 Target: Lose 0.5kg per week (fat loss, preserve muscle)</li>
          <li>💡 Tip: Increase vegetable intake to stay full without extra calories</li>
          <li>⏰ Expected timeline: 10-15 weeks to reach normal BMI (if following plan consistently)</li>
        </ul>
      </div>
    `;
  } else if (bmi >= 30) {
    recommendation = `
      <div class="info-box" style="background:rgba(255,68,102,.07);border-color:rgba(255,68,102,.2);color:var(--red)">
        <strong>🚨 OBESE STATUS — PRIORITY ACTION NEEDED</strong><br>
        Your BMI (${bmi}) indicates obesity. Immediate recommendations:
        <ul style="margin-top:8px;margin-left:18px;font-size:12px;line-height:1.6">
          <li>✅ <strong>URGENT: Caloric deficit of 500 kcal/day</strong> (target: ${Math.round(tdee - 500)} kcal)</li>
          <li>✅ High protein is critical: <strong>${targetProtein}g/day</strong> (1.3g/kg) to preserve muscle</li>
          <li>✅ Medical check-up recommended before starting intense exercise</li>
          <li>✅ Start with LOW-IMPACT cardio: brisk walking 30-45 min daily, swimming, cycling</li>
          <li>✅ Resistance training 2-3x/week (lighter weights, focus on form)</li>
          <li>✅ Strict diet: eliminate sugary drinks, fried food, processed snacks</li>
          <li>✅ Focus on whole foods: chicken, fish, eggs, dal, vegetables, whole grains</li>
          <li>📊 Target: Lose 1kg per week (aggressive but sustainable with discipline)</li>
          <li>⚠️ Important: Consult doctor if you have joint pain, diabetes, or heart concerns</li>
          <li>⏰ Timeline: 6-9 months to reach overweight, 12-18 months for normal BMI</li>
        </ul>
      </div>
    `;
  }

  document.getElementById('profile-results').innerHTML = `
    <div class="bmi-display">
      <div class="bmi-number" style="color:${status.c}">${bmi}</div>
      <div class="bmi-label" style="color:${status.c}">${status.l}</div>
      <div class="bmi-scale">
        <div style="flex:1;background:#4488ff;opacity:.8"></div>
        <div style="flex:1.8;background:#44ff88;opacity:.8"></div>
        <div style="flex:1.5;background:#f0ff44;opacity:.8"></div>
        <div style="flex:1.5;background:#ff4466;opacity:.8"></div>
      </div>
      <div class="bmi-pointer-wrap"><div class="bmi-pointer" style="left:${pct}%">▲ ${bmi}</div></div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-top:3px"><span>&lt;18.5</span><span>18.5–24.9</span><span>25–29.9</span><span>30+</span></div>
    </div>
    <div class="stat-strip">
      <div class="stat-box"><div class="stat-box-label">Weight</div><div class="stat-box-value">${w}<span class="stat-box-unit"> kg</span></div></div>
      <div class="stat-box"><div class="stat-box-label">Height</div><div class="stat-box-value">${h}<span class="stat-box-unit"> cm</span></div></div>
      <div class="stat-box"><div class="stat-box-label">TDEE</div><div class="stat-box-value">${tdee}<span class="stat-box-unit"> kcal</span></div></div>
      <div class="stat-box"><div class="stat-box-label">Protein Target</div><div class="stat-box-value">${targetProtein}<span class="stat-box-unit"> g/day</span></div></div>
    </div>
    ${recommendation}
    <div id="ai-advice-area"><div style="text-align:center;padding:28px;color:var(--muted);font-size:13px">Click "Get AI Analysis" for personalised recommendations</div></div>`;
}

async function generateAIAdvice() {
  const name = document.getElementById('p-name').value || 'there';
  const age = document.getElementById('p-age').value || '19';
  const weight = document.getElementById('p-weight').value || '56';
  const height = document.getElementById('p-height').value || '175';
  const area = document.getElementById('ai-advice-area');
  if (!area) { calcBMI(); setTimeout(generateAIAdvice, 200); return; }

  area.innerHTML = `<div class="ai-response"><div style="display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-size:13px"><div style="width:5px;height:5px;border-radius:50%;background:var(--accent);animation:ldBounce 1s ease infinite"></div><div style="width:5px;height:5px;border-radius:50%;background:var(--accent);animation:ldBounce 1s ease infinite;animation-delay:.14s"></div><div style="width:5px;height:5px;border-radius:50%;background:var(--accent);animation:ldBounce 1s ease infinite;animation-delay:.28s"></div> Generating your plan…</div></div>`;

  // N6 FIX: AbortController with 10s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {"Content-Type": "application/json", "x-api-key": ""},
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", max_tokens: 1000,
        messages: [{role:"user",content:`You are a professional gym trainer. Provide advice for: Name: ${name}, Age: ${age}, Weight: ${weight}kg, Height: ${height}cm. Provide structure with <h4> tags. Keep it under 300 words.`}]
      })
    });
    clearTimeout(timeout);
    const data = await res.json();
    // F7 FIX: check for API errors
    if (data.error || !data.content) throw new Error(data.error?.message || 'No response');
    const txt = data.content?.map(c => c.text||'').join('') || '';
    if (!txt) throw new Error('Empty response');
    area.innerHTML = `<div style="font-size:11px;color:var(--accent2);font-weight:700;letter-spacing:.8px;margin-bottom:8px">🤖 AI ANALYSIS FOR ${name.toUpperCase()}</div><div class="ai-response">${txt}</div>`;
  } catch(e) {
    clearTimeout(timeout);
    // F7 FIX: always show useful fallback
    const safeWeight = parseFloat(weight) || 60;
    area.innerHTML = `<div class="ai-response">
      <h4>📊 Quick Analysis for ${name}</h4>
      <p>At <strong>${safeWeight}kg</strong>, here's your personalised plan:</p>
      <h4>🥩 Daily Protein Target</h4>
      <p><strong>${targetProtein || Math.round(safeWeight * 1.8)}g protein/day</strong> — eggs, dal, paneer, chicken breast, Greek yoghurt.</p>
      <h4>💪 Training Priority</h4>
      <p>3–4 sessions/week. Progressive overload every 2 weeks (+2.5kg). Sleep 7–9hrs — muscles grow during rest, not in the gym.</p>
      <h4>⚡ Quick Wins</h4>
      <p>Eat within 45 min post-workout. Drink 3L water daily. Creatine monohydrate 5g/day is the most proven supplement.</p>
    </div>`;
  }
}

// ============================================================
// DYNAMIC DIET PLAN GENERATOR
// ============================================================


function renderMyths() {
  const el = document.getElementById('myths-grid');
  if (!el) return;
  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
    ${MYTHS.map(m => `<div style="display:flex;flex-direction:column;gap:10px">
      <div class="myth-card"><p style="font-size:13px;font-weight:600;color:var(--red);line-height:1.5;padding-right:48px">"${m.m}"</p></div>
      <div class="fact-card"><div style="font-size:9px;color:var(--green);font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;padding-right:42px">THE TRUTH:</div><p style="font-size:12px;color:var(--muted);line-height:1.55;padding-right:42px">${m.f}</p></div>
    </div>`).join('')}
  </div>`;
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', e => {
    if (!e.target.closest('.food-search-wrap')) {
      const s = document.getElementById('food-suggestions');
      if (s) s.style.display = 'none';
    }
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.food-search-wrap')) {
    const s = document.getElementById('food-suggestions'); if(s) s.style.display='none';
  }
});
