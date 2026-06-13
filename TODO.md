# FitForge — Bugs & Features TODO
Last updated: Session 7

---

## ✅ ALL CONFIRMED WORKING (Audit Verified)

- initAuth called correctly (readyState check at bottom of auth.js) ✅
- Supabase sb client created correctly ✅
- getCalcValues() shared engine in data.js ✅
- diet.js uses getCalcValues ✅
- app.js calcBMI uses getCalcValues ✅
- foodLogDate daily reset saved ✅
- lastWorkoutDate cross-device via Supabase ✅
- auth.js loads last in script order ✅
- No double body tag ✅
- Loading overlay outside screen-auth ✅
- No initAuth call conflict in app.js ✅
- renderWeeklySplit null check ✅
- syncProfileToDiet defined ✅
- No bare supabase. calls (all use sb.) ✅
- weight variable in diet.js is correct — used for food quantity scaling not macro math ✅

---

## ⬜ REMAINING BUGS

### ⬜ BUG: calcBMI TDEE uses moderate activity always
- Profile screen TDEE shows based on moderate (1.55) regardless
- Because diet-activity dropdown not always filled when calcBMI runs
- Fix: add activity dropdown on profile screen OR show "based on moderate activity" note
- File: js/app.js, function calcBMI

### ⬜ BUG: diet tab activity change doesn't refresh profile TDEE
- When user changes activity level on diet tab, profile screen TDEE is stale
- Fix: add onchange="calcBMI()" to diet-activity dropdown in index.html

### ⬜ BUG: bmi variable conflict in diet.js
- diet.js destructures `bmi: calcBmi` from getCalcValues but earlier code uses `bmi` variable for BMI checks
- Line 20: `const bmi = (weight / ...)` — this is the raw weight not safeWeight
- Line 63: `const { bmi: calcBmi }` — this uses safeWeight via getCalcValues
- Both exist in same function — calcBmi is unused, bmi is used for underweight checks
- Fix: remove `const bmi` line 20, use `calcBmi` everywhere, rename to `bmi` for clarity

### ⬜ BUG: food name with single quote breaks onclick
- `addFood('${f.n}', ${idx})` — if food name has apostrophe (e.g. "McDonald's") breaks JS
- Fix: use data attribute instead: `data-name="${f.n}" onclick="addFoodByIndex(${idx})"`

### ⬜ BUG: duplicate searchFood function defined twice in diet.js
- First definition ends with closing brace, then _doSearchFood and a second full searchFood defined
- Will cause "already defined" warning, second definition wins — first is dead code
- Fix: remove duplicate, keep debounced version only

### ⬜ BUG: guest mode warning only on diet screen
- guest-warning div only exists in diet section HTML
- Guest users on gym/profile/recovery see no indication they're in guest mode
- Fix: add persistent top banner when isGuest is true, shown on all screens

### ⬜ BUG: email confirmation flow untested
- After Supabase sends confirmation email and user clicks link
- They land back on site with token in URL — INITIAL_SESSION event should handle it
- Needs manual testing to confirm it works

### ⬜ BUG: calcBMI recommendation text still shows old protein values
- Profile recommendation HTML has hardcoded protein % text ("90g/day (1.6g/kg)")
- Should use targetProtein variable instead of hardcoded numbers
- Fix: replace hardcoded protein in recommendation with ${targetProtein}g

---

## ✨ FEATURES TO BUILD (Priority Order)

### ⬜ 1. Home Screen Dashboard
- Today's workout card (push/pull/legs/rest with day name)
- Calories logged today vs target (progress bar)
- Water intake progress
- Workout streak counter 🔥
- Quick nav cards to each section
- Files: js/app.js, index.html, css/styles.css

### ⬜ 2. Water Intake Tracker
- 8 glass buttons (250ml each)
- Daily total (1.5L / 2L goal)
- Saved in Supabase under waterLog: { date, glasses }
- Auto-reset each new day
- Show on home dashboard + diet screen

### ⬜ 3. Workout History Log
- "✅ Finish Workout" button at bottom of PPL panel
- Saves { date, dayType, week, exercisesCompleted, totalExercises }
- Shows last 7 sessions on gym screen
- Streak counter on home dashboard
- Files: js/gym.js, js/auth.js (saveUserData)

### ⬜ 4. Progressive Overload Tracker
- Small "Log" button per exercise card
- Inline input: weight (kg) + reps
- Shows "Last: 20kg × 10" under exercise name
- Saved to Supabase keyed by exerciseName
- Files: js/gym.js

### ⬜ 5. Rest Day Content
- When today = Sunday, show stretching/mobility routine instead of empty gym
- 6-8 stretches with hold time
- Sleep and recovery tips
- Files: js/gym.js, js/data.js

### ⬜ 6. Workout Timer
- 60s / 90s / 120s buttons
- Floating pill at bottom of screen when active
- Audio beep when done (AudioContext API)
- Files: js/gym.js, css/styles.css

---

## 🏋️ GYM APP RESEARCH FEATURES (Later)

### From MyFitnessPal
- ⬜ Macro donut chart (protein/carb/fat visual)
- ⬜ Meal copy — "Copy yesterday's breakfast"
- ⬜ Net calories = eaten − burned
- ⬜ Weekly nutrition report (7 day average)

### From Jefit
- ⬜ Muscle heatmap — SVG body diagram highlighting trained muscles
- ⬜ 1RM calculator (Epley: weight × (1 + reps/30))
- ⬜ Workout volume tracker (sets × reps × weight)
- ⬜ Exercise swap suggestions

### From Fitbod
- ⬜ Fatigue warning — same muscle too soon
- ⬜ Progressive overload nudge (+5% after 2 easy sessions)
- ⬜ Workout rating 1–5 stars
- ⬜ Body part recovery % indicator

### From Strong App
- ⬜ Plate calculator (which plates to load each side)
- ⬜ Personal records (PRs) — celebrate new bests 🏆
- ⬜ Session notes (free text per workout)
- ⬜ Exercise history graph (line chart last 10 sessions)

### From Cronometer
- ⬜ Micronutrient gap alerts (data already in FOOD_DB!)
- ⬜ Protein per meal distribution check
- ⬜ Hydration reminder every 2 hours

### From Nike Training Club
- ⬜ Beginner/Intermediate/Advanced mode
- ⬜ Workout streak with flame 🔥
- ⬜ Exercise GIF/demo link per exercise

### From Whoop
- ⬜ Daily recovery score (1–10 user input)
- ⬜ High load warning after 5 sessions in 6 days

---

## 📝 NEXT SESSION INSTRUCTIONS

Say: "Continue FitForge — check TODO.md, fix remaining bugs first then build Home Dashboard"

Fix order:
1. Duplicate searchFood in diet.js (5 min)
2. bmi/calcBmi variable conflict in diet.js (5 min)
3. food name apostrophe bug in onclick (5 min)
4. diet-activity onchange calls calcBMI (1 line)
5. calcBMI recommendation hardcoded protein (5 min)
6. Then build Home Dashboard

Repo: https://github.com/Krishgaming1455/fitforge.git
Live: https://fiteasy.netlify.app
Supabase: tlzymwuoedjyzpkockfe.supabase.co
Stack: HTML + vanilla JS modules + Supabase
Files: index.html, css/styles.css, js/data.js, js/auth.js, js/app.js, js/diet.js, js/gym.js, js/recovery.js

⚠️ NETLIFY CREDITS: Batch all fixes into ONE push per session!
