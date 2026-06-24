function generateDietPlan() {
  const rawWeight = document.getElementById('diet-weight').value;
  const weight = parseFloat(rawWeight);
  const height = parseFloat(document.getElementById('p-height').value) || 175;
  const goal = document.getElementById('diet-goal').value;
  const activity = document.getElementById('diet-activity').value;
  const dietType = document.getElementById('diet-type').value;
  const resultsEl = document.getElementById('diet-results');

  // BUG FIX: weight validation
  if (!weight || weight < 20 || weight > 300) {
    if (resultsEl) resultsEl.innerHTML = `<div class="info-box" style="border-color:rgba(255,68,102,.3);color:#ff4466">⚠️ Please enter a valid weight (20–300 kg) before generating your plan.</div>`;
    return;
  }

  // BUG FIX: sanitize weight to prevent XSS
  const safeWeight = parseFloat(weight.toFixed(1));

  // Calculate BMI for smart warnings — use safeWeight
  const bmi = (safeWeight / ((height/100)**2)).toFixed(1);
  const isUnderweight = bmi < 18.5;
  const isNormal = bmi >= 18.5 && bmi < 25;
  const isOverweight = bmi >= 25 && bmi < 30;
  const isObese = bmi >= 30;

  // Generate BMI-based warning if goal doesn't match BMI
  let bmiWarning = '';
  if (isUnderweight && goal === 'loss') {
    bmiWarning = `<div class="info-box" style="background:rgba(255,100,100,.15);border-color:rgba(255,100,100,.3);color:#ff6464;margin-bottom:16px">
      ⚠️ <strong>NOT RECOMMENDED FOR YOUR BMI</strong><br>
      Your BMI is ${bmi} (Underweight). Losing weight could harm your health.
      <br><strong>✅ HIGHLY RECOMMENDED:</strong> Weight Gain (+400 kcal/day) — Build muscle first!
    </div>`;
  } else if (isUnderweight && goal === 'maintenance') {
    bmiWarning = `<div class="info-box" style="background:rgba(255,200,100,.15);border-color:rgba(255,200,100,.3);color:#ffb844;margin-bottom:16px">
      ⚠️ <strong>NOT IDEAL FOR YOUR BMI</strong><br>
      Your BMI is ${bmi} (Underweight). Maintenance won't help you gain needed weight.
      <br><strong>✅ BETTER CHOICE:</strong> Weight Gain (+400 kcal/day) — Gain 0.5–1kg monthly!
    </div>`;
  } else if ((isOverweight || isObese) && goal === 'gain') {
    bmiWarning = `<div class="info-box" style="background:rgba(255,200,100,.15);border-color:rgba(255,200,100,.3);color:#ffb844;margin-bottom:16px">
      ⚠️ <strong>RISKY FOR YOUR BMI</strong><br>
      Your BMI is ${bmi} (${isOverweight ? 'Overweight' : 'Obese'}). Weight gain could increase fat instead of muscle.
      <br><strong>✅ BETTER CHOICE:</strong> Fat Loss (-400 kcal/day) — Lose fat, then gain lean muscle!
    </div>`;
  } else if (isUnderweight && goal === 'gain') {
    bmiWarning = `<div class="info-box" style="background:rgba(68,255,136,.07);border-color:rgba(68,255,136,.2);color:var(--green);margin-bottom:16px">
      ✅ <strong>PERFECT FOR YOUR BMI</strong><br>
      Your BMI is ${bmi} (Underweight). Weight gain is exactly what you need!
      <br>Focus: Gain 0.5–1kg monthly with 1.9g protein/kg for maximum muscle.
    </div>`;
  } else if ((isOverweight || isObese) && goal === 'loss') {
    bmiWarning = `<div class="info-box" style="background:rgba(68,255,136,.07);border-color:rgba(68,255,136,.2);color:var(--green);margin-bottom:16px">
      ✅ <strong>PERFECT FOR YOUR BMI</strong><br>
      Your BMI is ${bmi} (${isOverweight ? 'Overweight' : 'Obese'}). Fat loss is exactly what you need!
      <br>Focus: Lose 0.5–1kg weekly while preserving muscle with high protein.
    </div>`;
  }

  const age = parseFloat(document.getElementById('p-age').value) || 25;

  // Use shared engine — same numbers as profile screen
  const calc = getCalcValues(safeWeight, height, age, goal, activity);
  const { tdee, calTarget, proteinTarget, proteinFactor, fatTarget, carbTarget } = calc;

  // Update global targets so food tracker ring matches
  targetCal = calTarget;
  targetProtein = proteinTarget;

  let logicNote = '';
  if (goal === 'gain') {
    logicNote = `For muscle gain at ${safeWeight}kg: TDEE ${tdee} kcal + 400 kcal surplus = <strong>${calTarget} kcal/day</strong>. Protein at ${proteinFactor}g/kg = <strong>${proteinTarget}g</strong>. Carbs fuel training.`;
  } else if (goal === 'loss') {
    logicNote = `For fat loss at ${safeWeight}kg: TDEE ${tdee} kcal − 400 kcal deficit = <strong>${calTarget} kcal/day</strong>. Protein at ${proteinFactor}g/kg = <strong>${proteinTarget}g</strong>. Carbs reduced, fat moderate.`;
  } else if (goal === 'strength') {
    logicNote = `For strength at ${safeWeight}kg: +200 kcal surplus = <strong>${calTarget} kcal/day</strong>. Protein at ${proteinFactor}g/kg = <strong>${proteinTarget}g</strong>. Moderate carbs for performance.`;
  } else {
    logicNote = `Maintenance at ${safeWeight}kg: eating at TDEE = <strong>${calTarget} kcal/day</strong>. Protein at ${proteinFactor}g/kg = <strong>${proteinTarget}g</strong>. Balanced macros.`;
  }

  const isHighWeight = safeWeight > 75;
  const isLoss = goal === 'loss';
  const isGain = goal === 'gain';
  const hasNonVeg = dietType === 'nonveg' || dietType === 'fullnonveg';
  const hasEggs = dietType !== 'veg';

  const eggsCount = isLoss ? (weight > 85 ? 3 : weight > 70 ? 3 : 2) : (isGain ? (weight > 85 ? 4 : weight > 70 ? 3 : 3) : 3);
  const chickenG = hasNonVeg ? (isLoss ? Math.round(weight * 1.2) : Math.round(weight * 1.4)) : 0;
  const dalG = isLoss ? Math.round(120 + weight * 0.3) : (isGain ? Math.round(140 + weight * 0.5) : 130);
  const soyaG = isLoss && weight > 70 ? 80 : (isLoss ? 60 : 0);
  const riceG = isLoss ? Math.round(70 + weight * 0.2) : (isGain ? Math.round(120 + weight * 0.6) : 100);
  const rotiCount = isLoss ? (safeWeight > 80 ? 3 : 2) : (isGain ? (safeWeight > 80 ? 6 : safeWeight > 65 ? 5 : 4) : 3);
  const oatsG = isGain ? Math.round(50 + weight * 0.4) : (isLoss ? 0 : 50);
  const bananaCount = isGain ? (safeWeight > 80 ? 3 : weight > 65 ? 2 : 2) : (isLoss ? 1 : 1);
  const milkMl = isGain ? Math.round(250 + weight * 1.5) : (isLoss ? 250 : 350);
  const paneerG = !hasNonVeg ? (isLoss ? 80 : 120) : 0;

  const meals = [
    {
      title:"Breakfast", em:"🍳", time:"7:00–8:00 AM",
      foods: [
        hasEggs ? {name:`Boiled Eggs ×${eggsCount}`, p: eggsCount*6, c: 0, f: eggsCount*5, cal: eggsCount*78} : {name:`Paneer ${paneerG}g`, p:Math.round(paneerG*0.18), c:1, f:Math.round(paneerG*0.21), cal:Math.round(paneerG*2.65)},
        isGain && oatsG > 0 ? {name:`Oats ${oatsG}g with milk`, p:Math.round(oatsG*0.17), c:Math.round(oatsG*0.66), f:Math.round(oatsG*0.07), cal:Math.round(oatsG*3.89)} : null,
        {name:`Banana ×${bananaCount}`, p:Math.round(bananaCount*1.1), c:Math.round(bananaCount*23), f:0, cal:Math.round(bananaCount*89)},
        {name:`Whole Milk ${milkMl}ml`, p:Math.round(milkMl*0.032), c:Math.round(milkMl*0.048), f:Math.round(milkMl*0.033), cal:Math.round(milkMl*0.61)},
        {name:"Soaked Almonds ×10", p:2, c:2, f:5, cal:58}
      ].filter(Boolean)
    },
    {
      title: isLoss ? "Mid-Morning Protein Snack" : "Mid-Morning Snack", em:"🥛", time:"10:30–11:00 AM",
      foods: [
        isLoss && soyaG > 0 ? {name:`Spiced Boiled Soya Chunks ${soyaG}g`, p:Math.round(soyaG*0.52), c:Math.round(soyaG*0.33), f:0, cal:Math.round(soyaG*3.45)} : null,
        isLoss ? {name:"Dahi 150g", p:5, c:7, f:5, cal:92} : null,
        !isLoss ? {name:`Banana ×1`, p:1, c:23, f:0, cal:89} : null
      ].filter(Boolean)
    },
    {
      title:"Lunch", em:"🍱", time:"1:00–1:30 PM",
      foods: [
        hasNonVeg && !isLoss ? {name:`Grilled Chicken Breast ${Math.round(chickenG*0.5)}g`, p:Math.round(chickenG*0.5*0.31), c:0, f:Math.round(chickenG*0.5*0.036), cal:Math.round(chickenG*0.5*1.65)} : null,
        hasNonVeg && isLoss ? {name:`Grilled Chicken / Paneer ${Math.round(chickenG*0.4)}g`, p:Math.round(chickenG*0.4*0.31), c:0, f:Math.round(chickenG*0.4*0.036), cal:Math.round(chickenG*0.4*1.65)} : null,
        !hasNonVeg ? {name:`Paneer ${Math.round(paneerG*0.7)}g`, p:Math.round(paneerG*0.7*0.18), c:1, f:Math.round(paneerG*0.7*0.21), cal:Math.round(paneerG*0.7*2.65)} : null,
        {name:`Dal ${dalG}g`, p:Math.round(dalG*0.09), c:Math.round(dalG*0.2), f:0, cal:Math.round(dalG*1.16)},
        {name:`Cooked Rice ${riceG}g`, p:Math.round(riceG*0.027), c:Math.round(riceG*0.28), f:0, cal:Math.round(riceG*1.3)},
        {name:`Roti ×${Math.ceil(rotiCount*0.4)}`, p:Math.round(Math.ceil(rotiCount*0.4)*3.5), c:Math.round(Math.ceil(rotiCount*0.4)*20), f:Math.round(Math.ceil(rotiCount*0.4)*1.5), cal:Math.round(Math.ceil(rotiCount*0.4)*104)},
        {name:"Sabzi / Salad 100g", p:2, c:9, f:1, cal:50},
        isLoss ? {name:"Dahi 100g", p:3.5, c:5, f:3, cal:61} : null
      ].filter(Boolean)
    },
    {
      title:"Pre-Workout Meal", em:"⚡", time:"4:30–5:00 PM",
      foods: [
        {name:`Roti ×${Math.max(1,Math.floor(rotiCount*0.25))}`, p:Math.max(1,Math.floor(rotiCount*0.25))*3.5, c:Math.max(1,Math.floor(rotiCount*0.25))*20, f:Math.max(1,Math.floor(rotiCount*0.25))*1.5, cal:Math.max(1,Math.floor(rotiCount*0.25))*104},
        isGain ? {name:"Banana ×1", p:1, c:23, f:0, cal:89} : null,
        {name:"Dal 80g", p:7, c:16, f:0, cal:93}
      ].filter(Boolean)
    },
    {
      title:"Post-Workout (Critical)", em:"🔥", time:"7:30–8:00 PM",
      foods: [
        hasEggs ? {name:`Eggs ×${Math.max(2,Math.floor(eggsCount*0.7))}`, p:Math.max(2,Math.floor(eggsCount*0.7))*6, c:0, f:Math.max(2,Math.floor(eggsCount*0.7))*5, cal:Math.max(2,Math.floor(eggsCount*0.7))*78} : null,
        {name:`Whole Milk ${Math.round(milkMl*0.5)}ml`, p:Math.round(milkMl*0.5*0.032), c:Math.round(milkMl*0.5*0.048), f:Math.round(milkMl*0.5*0.033), cal:Math.round(milkMl*0.5*0.61)},
        isGain ? {name:"Banana ×1", p:1, c:23, f:0, cal:89} : null,
        hasNonVeg && isLoss ? {name:`Grilled Chicken ${Math.round(chickenG*0.3)}g`, p:Math.round(chickenG*0.3*0.31), c:0, f:Math.round(chickenG*0.3*0.036), cal:Math.round(chickenG*0.3*1.65)} : null
      ].filter(Boolean)
    },
    {
      title:"Dinner", em:"🍽️", time:"9:00–9:30 PM",
      foods: [
        hasNonVeg ? {name:`Grilled Chicken / Fish ${Math.round(chickenG*0.3)}g`, p:Math.round(chickenG*0.3*0.31), c:0, f:Math.round(chickenG*0.3*0.036), cal:Math.round(chickenG*0.3*1.65)} : null,
        !hasNonVeg ? {name:`Paneer / Dal mix 120g`, p:12, c:10, f:8, cal:160} : null,
        {name:`Roti ×${Math.max(1,Math.floor(rotiCount*0.35))}`, p:Math.max(1,Math.floor(rotiCount*0.35))*3.5, c:Math.max(1,Math.floor(rotiCount*0.35))*20, f:Math.max(1,Math.floor(rotiCount*0.35))*1.5, cal:Math.max(1,Math.floor(rotiCount*0.35))*104},
        isLoss ? {name:"Spinach / Broccoli 100g", p:3, c:4, f:0.5, cal:40} : {name:"Sabzi 100g", p:2, c:9, f:1, cal:50},
        {name:`Warm Milk ${Math.round(milkMl*0.3)}ml`, p:Math.round(milkMl*0.3*0.032), c:Math.round(milkMl*0.3*0.048), f:Math.round(milkMl*0.3*0.033), cal:Math.round(milkMl*0.3*0.61)}
      ].filter(Boolean)
    }
  ];

  let totalCal=0, totalP=0, totalC=0, totalF=0;
  meals.forEach(m => m.foods.forEach(f => { totalCal+=f.cal||0; totalP+=f.p||0; totalC+=f.c||0; totalF+=f.f||0; }));

  // targetCal and targetProtein already set by getCalcValues above
  document.getElementById('nt-prot-t').textContent = proteinTarget;
  document.getElementById('cal-target-display').textContent = calTarget;

  document.getElementById('diet-macro-summary').style.display = 'block';
  document.getElementById('diet-stats').innerHTML = `
    <div class="stat-box"><div class="stat-box-label">Daily Calories</div><div class="stat-box-value">${calTarget}<span class="stat-box-unit"> kcal</span></div></div>
    <div class="stat-box"><div class="stat-box-label">Protein</div><div class="stat-box-value">${proteinTarget}<span class="stat-box-unit"> g</span></div></div>
    <div class="stat-box"><div class="stat-box-label">Carbs</div><div class="stat-box-value">${carbTarget}<span class="stat-box-unit"> g</span></div></div>
    <div class="stat-box"><div class="stat-box-label">Fat</div><div class="stat-box-value">${fatTarget}<span class="stat-box-unit"> g</span></div></div>`;
  document.getElementById('diet-logic-note').innerHTML = `📊 <strong>How these numbers were calculated:</strong> ${logicNote}`;

  document.getElementById('diet-meals-output').innerHTML = `${bmiWarning}` + meals.map(m => {
    const mealCal = Math.round(m.foods.reduce((a,f) => a + (f.cal||0), 0));
    const mealP = Math.round(m.foods.reduce((a,f) => a + (f.p||0), 0));
    return `<div class="diet-meal-card">
      <div class="diet-meal-header">
        <div class="diet-meal-title">${m.em} ${m.title}<span style="font-size:11px;color:var(--muted);font-weight:400">${m.time}</span></div>
        <div class="diet-meal-cals">~${mealCal} kcal · P:${mealP}g</div>
      </div>
      ${m.foods.map(f => `<div class="diet-food-row">
        <span class="diet-food-name">${f.name}</span>
        <span class="diet-food-macros">P:${Math.round(f.p||0)}g C:${Math.round(f.c||0)}g F:${Math.round(f.f||0)}g · ${Math.round(f.cal||0)}kcal</span>
      </div>`).join('')}
    </div>`;
  }).join('');
  
  autoSave();
}

// ============================================================
// PPL WORKOUT TRACKER
// ============================================================

// N5 FIX: debounce food search
let _foodSearchTimer = null;
function searchFood() {
  clearTimeout(_foodSearchTimer);
  _foodSearchTimer = setTimeout(_doSearchFood, 200);
}
function _doSearchFood() {
  const q = document.getElementById('food-search-input')?.value?.trim().toLowerCase();
  const sugg = document.getElementById('food-suggestions');
  if (!sugg) return;
  if (!q || q.length < 1) { sugg.style.display = 'none'; return; }
  const results = FOOD_DB.filter(f => f.n.toLowerCase().includes(q) || f.s.toLowerCase().includes(q)).slice(0, 8);
  if (!results.length) { sugg.style.display = 'none'; return; }
  sugg.style.display = 'block';
  sugg.innerHTML = results.map((f, idx) => `
    <div class="food-suggestion-item" style="flex-direction:column;align-items:stretch;gap:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="food-item-name">${f.n}</div><div class="food-item-sub">${f.s} · P:${f.p}g · C:${f.c}g · F:${f.f}g</div></div>
        <div class="food-item-cal">${f.cal}kcal</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="number" min="0.5" max="20" step="0.5" value="1" id="food-qty-${idx}"
          style="width:70px;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:7px;font-size:13px;font-family:'DM Sans',sans-serif"
          onclick="event.stopPropagation()" />
        <span style="font-size:11px;color:var(--muted)">servings</span>
        <button data-fname="${f.n.replace(/"/g,'&quot;')}" data-idx="${idx}" onclick="addFood(this.dataset.fname, parseInt(this.dataset.idx))" style="flex:1;background:var(--accent);color:#000;border:none;padding:6px 12px;border-radius:7px;font-weight:700;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif">+ Add</button>
      </div>
    </div>`).join('');
}

function addFood(name, idx) {
  const food = FOOD_DB.find(f => f.n === name);
  if (!food) return;
  const qtyEl = document.getElementById(`food-qty-${idx}`);
  const q = qtyEl ? parseFloat(qtyEl.value) : 1;
  if (!q || isNaN(q) || q <= 0) return;
  foodLog.push({...food, qty:q, uid: generateUniqueId()});
  document.getElementById('food-search-input').value = '';
  document.getElementById('food-suggestions').style.display = 'none';
  updateNutritionDisplay();
  renderFoodLog();
  autoSave();
}

function removeFood(uid) {
  foodLog = foodLog.filter(f => f.uid !== uid);
  updateNutritionDisplay();
  renderFoodLog();
  autoSave();
}

function clearFoodLog() {
  if (confirm('Clear all food entries?')) { foodLog=[]; updateNutritionDisplay(); renderFoodLog(); autoSave(); }
}

function getTotals() {
  return foodLog.reduce((a,f) => ({
    cal: a.cal + f.cal*f.qty, p: a.p + f.p*f.qty, c: a.c + f.c*f.qty,
    f: a.f + f.f*f.qty, fi: a.fi + (f.fi||0)*f.qty,
    vitC: a.vitC + (f.vitC||0)*f.qty, vitD: a.vitD + (f.vitD||0)*f.qty,
    ca: a.ca + (f.ca||0)*f.qty, fe: a.fe + (f.fe||0)*f.qty, k: a.k + (f.k||0)*f.qty
  }), {cal:0,p:0,c:0,f:0,fi:0,vitC:0,vitD:0,ca:0,fe:0,k:0});
}

function updateNutritionDisplay() {
  const t = getTotals();
  const circumference = 427;
  const pct = Math.min(1, t.cal / targetCal);
  const ring = document.getElementById('cal-ring');
  if (ring) ring.style.strokeDashoffset = circumference - pct * circumference;
  const setEl = (id, val) => { const e=document.getElementById(id); if(e) e.textContent=Math.round(val); };
  const setW = (id, val, max) => { const e=document.getElementById(id); if(e) e.style.width=Math.min(100,(val/max)*100)+'%'; };
  setEl('cal-consumed', t.cal);
  const calTDisp = document.getElementById('cal-target-display');
  if (calTDisp) calTDisp.textContent = targetCal;
  const rem = targetCal - t.cal;
  const remEl = document.getElementById('cal-remaining-display');
  if (remEl) { remEl.textContent = rem>0?`${Math.round(rem)} left`:`${Math.round(-rem)} over!`; remEl.style.color=rem>0?'var(--accent2)':'var(--red)'; }
  setEl('nt-prot',t.p); setEl('nt-carb',t.c); setEl('nt-fat',t.f); setEl('nt-fiber',t.fi);
  setW('pb-prot',t.p,targetProtein); setW('pb-carb',t.c,350); setW('pb-fat',t.f,90); setW('pb-fiber',t.fi,30);
  renderMacroDonut(t.p, t.c, t.f);
  const vitamins = [
    {n:'Vitamin C',v:t.vitC,tg:90,u:'mg',c:'#ff8844'},
    {n:'Vitamin D',v:t.vitD,tg:600,u:'IU',c:'#f0ff44'},
    {n:'Calcium',v:t.ca,tg:1000,u:'mg',c:'#44ffcc'},
    {n:'Iron',v:t.fe,tg:18,u:'mg',c:'#ff4466'},
    {n:'Potassium',v:t.k,tg:4700,u:'mg',c:'#4d8fff'}
  ];
  const vd = document.getElementById('vit-display');
  if (vd) vd.innerHTML = vitamins.map(v => {
    const p = Math.min(100,(v.v/v.tg)*100);
    const st = p>=80?{t:'✅ Good',c:'var(--green)'}:p>=40?{t:'⚠️ Low',c:'var(--accent)'}:{t:'❌ Very Low',c:'var(--red)'};
    return `<div class="vitamin-row"><div class="vitamin-name">${v.n}</div><div class="vitamin-bar-wrap"><div class="vitamin-bar"><div class="vitamin-bar-fill" style="width:${p}%;background:${v.c}"></div></div></div><div class="vitamin-amount">${Math.round(v.v)}/${v.tg}${v.u}</div><div class="vitamin-status" style="color:${st.c}">${st.t}</div></div>`;
  }).join('');
}

function renderMacroDonut(protein, carbs, fat) {
  const container = document.getElementById('macro-donut-container');
  if (!container) return;

  // Convert grams to calories for proportional chart (protein=4, carbs=4, fat=9 kcal/g)
  const pCal = protein * 4, cCal = carbs * 4, fCal = fat * 9;
  const total = pCal + cCal + fCal;

  if (total === 0) {
    container.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">Log food to see your macro breakdown</div>`;
    return;
  }

  const pPct = (pCal/total)*100, cPct = (cCal/total)*100, fPct = (fCal/total)*100;
  // Build conic-gradient stops
  const gradient = `conic-gradient(var(--accent2) 0% ${pPct}%, var(--accent) ${pPct}% ${pPct+cPct}%, #ff6644 ${pPct+cPct}% 100%)`;

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center">
      <div style="width:110px;height:110px;border-radius:50%;background:${gradient};position:relative;flex-shrink:0">
        <div style="position:absolute;inset:14px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;flex-direction:column">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:18px">${Math.round(total)}</div>
          <div style="font-size:8px;color:var(--muted)">kcal</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:8px"><div style="width:10px;height:10px;border-radius:3px;background:var(--accent2)"></div><span style="font-size:12px">Protein <strong>${Math.round(pPct)}%</strong> (${Math.round(protein)}g)</span></div>
        <div style="display:flex;align-items:center;gap:8px"><div style="width:10px;height:10px;border-radius:3px;background:var(--accent)"></div><span style="font-size:12px">Carbs <strong>${Math.round(cPct)}%</strong> (${Math.round(carbs)}g)</span></div>
        <div style="display:flex;align-items:center;gap:8px"><div style="width:10px;height:10px;border-radius:3px;background:#ff6644"></div><span style="font-size:12px">Fat <strong>${Math.round(fPct)}%</strong> (${Math.round(fat)}g)</span></div>
      </div>
    </div>`;
}

function copyYesterday() {
  if (!yesterdayFoodLog || !yesterdayFoodLog.length) {
    alert('No food logged yesterday to copy.');
    return;
  }
  if (!confirm(`Copy ${yesterdayFoodLog.length} item(s) from yesterday into today's log?`)) return;
  yesterdayFoodLog.forEach(f => {
    foodLog.push({ ...f, uid: generateUniqueId() });
  });
  renderFoodLog();
  updateNutritionDisplay();
  autoSave();
}

function renderFoodLog() {
  const list = document.getElementById('food-log-list');
  if (!list) return;
  if (!foodLog.length) { list.innerHTML='<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">Search and add foods above to track today</div>'; return; }
  list.innerHTML = foodLog.map(f => `
    <div class="food-log-item">
      <div><div class="food-log-name">${f.n}${f.qty!==1?` ×${f.qty}`:''}</div><div class="food-log-amount">${f.s} × ${f.qty} = ${Math.round(f.cal*f.qty)} kcal</div></div>
      <div style="display:flex;align-items:center;gap:7px">
        <div class="food-log-macros">
          <span class="macro-pill macro-p">P:${Math.round(f.p*f.qty)}g</span>
          <span class="macro-pill macro-c">C:${Math.round(f.c*f.qty)}g</span>
          <span class="macro-pill macro-f">F:${Math.round(f.f*f.qty)}g</span>
        </div>
        <button class="remove-food" onclick="removeFood(${f.uid})">×</button>
      </div>
    </div>`).join('');
}

// ============================================================
// MYTHS
// ============================================================


// ============================================================
// WATER TRACKER
// ============================================================
function renderWaterTracker() {
  const el = document.getElementById('water-tracker');
  if (!el) return;
  const total = (waterGlasses * 250 / 1000).toFixed(1);
  const goal = 8;
  const pct = Math.round((waterGlasses / goal) * 100);
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:1px;color:#4af">${total}<span style="font-size:14px;font-weight:400;color:var(--muted)"> L</span></div>
        <div style="font-size:11px;color:var(--muted)">of 2L daily goal · ${pct}%</div>
      </div>
      <button onclick="resetWater()" style="background:transparent;border:1px solid var(--border);color:var(--muted);padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer">Reset</button>
    </div>
    <div class="water-glasses">
      ${Array.from({length: goal}, (_, i) => `
        <div class="water-glass ${i < waterGlasses ? 'filled' : ''}" onclick="toggleWaterGlass(${i})" title="${(i+1)*250}ml">
          💧
        </div>`).join('')}
    </div>
    <div style="margin-top:10px;height:4px;background:var(--bg3);border-radius:2px">
      <div style="height:4px;background:#4af;border-radius:2px;width:${pct}%;transition:width .4s"></div>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-top:6px">${waterGlasses >= goal ? '✅ Daily goal reached!' : `${goal - waterGlasses} more glass${goal - waterGlasses !== 1 ? 'es' : ''} to reach goal`}</div>`;
}

function toggleWaterGlass(idx) {
  // Click filled glass = unfill from that point, click empty = fill to that point
  waterGlasses = idx < waterGlasses ? idx : idx + 1;
  renderWaterTracker();
  renderHome();
  autoSave();
}

function resetWater() {
  waterGlasses = 0;
  renderWaterTracker();
  renderHome();
  autoSave();
}
