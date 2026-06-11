# FitForge — Bugs & Features TODO
Last updated: Session 4

---

## 🐛 BUGS

### ✅ BMI / TDEE hardcoded age & height — FIXED
### ✅ Profile tags not saving — FIXED
### ✅ pplChecked index mismatch — FIXED
### ✅ Food entry uses prompt() — FIXED
### ✅ Supabase global name conflict — FIXED
### ✅ Duplicate state declarations crashing auth — FIXED
### ✅ Mobile nav missing user display + logout — FIXED

### ✅ saveUserData / loadUserData broken syntax — FIXED THIS SESSION
- Had leftover `await supabase` line above `sb.from()` — syntax error meant data never saved or loaded

### ⬜ Data sync on mobile not confirmed working yet
- Fix pushed — needs testing after deploy
- If still broken: check Supabase dashboard → Table Editor → user_profiles → see if rows exist

### ⬜ Gym section today's workout not auto-showing on mobile
- renderTodayBanner() runs but DOM elements may not exist yet on mobile
- Fix: add null checks and delay render until DOM ready

### ⬜ Home screen is empty — no summary
- Currently just shows "BUILD YOUR BEST BODY" static text
- Needs: today's workout type, calories logged, water intake, streak

---

## ✨ FEATURES TO ADD (Priority Order)

### ⬜ 1. Home Screen Dashboard (HIGH PRIORITY)
- Today's workout card (push/pull/legs/rest with day name)
- Calories logged today vs target
- Water intake progress
- Workout streak counter
- Quick links to each section

### ⬜ 2. Water Intake Tracker
- 8 glass buttons (250ml each)
- Daily total display (e.g. 1.5L / 2L goal)
- Save in Supabase with date key
- Auto-reset each new day

### ⬜ 3. Workout History Log
- "Finish Workout" button at bottom of each PPL panel
- Saves { date, dayType, week, exercisesCompleted } to Supabase
- Shows last 7 sessions on gym screen
- Streak counter

### ⬜ 4. Progressive Overload Tracker
- "Log Weight" button per exercise
- Inline input: weight (kg) + reps
- Saves to Supabase keyed by exerciseName
- Shows "Last session: 20kg × 10" under each exercise

### ⬜ 5. Rest Day Content
- Dedicated panel when today is Sunday
- Stretching routine, foam rolling guide, sleep tips

### ⬜ 6. Workout Timer
- 60s / 90s / 120s rest timer buttons
- Floating pill UI at bottom when counting down
- Audio beep when done

---

## 🏋️ FEATURES FROM TOP GYM APPS

### From MyFitnessPal
- ⬜ Macro pie chart — donut chart showing protein/carb/fat split
- ⬜ Meal copy — "Copy yesterday's breakfast" button
- ⬜ Net calories = eaten − burned
- ⬜ Weekly nutrition report — 7 day average macros

### From Jefit
- ⬜ Muscle heatmap — SVG body diagram highlighting trained muscles
- ⬜ 1RM calculator — weight + reps → Epley formula
- ⬜ Workout volume tracker — sets × reps × weight trend
- ⬜ Exercise swap suggestions
- ⬜ Rest timer with sound

### From Fitbod
- ⬜ Fatigue-based warnings — warn if hitting same muscle too soon
- ⬜ Progressive overload nudge — suggest +5% after 2 easy sessions
- ⬜ Workout rating 1–5 stars
- ⬜ Body part recovery indicator

### From Strong App
- ⬜ Plate calculator — show which plates to load each side
- ⬜ Personal records (PRs) — celebrate when user beats best
- ⬜ Session notes — free text per workout
- ⬜ Exercise history graph — line chart over last 10 sessions

### From Cronometer
- ⬜ Micronutrient gap alerts
- ⬜ Protein per meal distribution check
- ⬜ Hydration reminder every 2 hours

### From Nike Training Club
- ⬜ Experience level mode (Beginner/Intermediate/Advanced)
- ⬜ Workout streak counter with flame 🔥
- ⬜ Exercise GIF/demo link per exercise

### From Whoop / Garmin
- ⬜ Daily recovery score (1–10 user input)
- ⬜ High training load warning after 5 sessions in 6 days

---

## 🎨 UI FIXES REMAINING

### ⬜ Mobile food search hidden behind keyboard
- Scroll suggestion list into view on input focus

### ⬜ Warmup auto-open on today's tab
- If it's user's workout day, warmup section should expand automatically

### ⬜ Gym screen today banner elements missing on mobile
- Add null checks before accessing today-banner DOM elements

---

## 📝 NEXT SESSION INSTRUCTIONS

Say: "Continue FitForge — check TODO.md, start with Home Screen Dashboard then Water Tracker"

Repo: https://github.com/Krishgaming1455/fitforge.git
Stack: HTML + vanilla JS split into css/ and js/ modules + Supabase backend
Files: index.html, css/styles.css, js/data.js, js/auth.js, js/app.js, js/diet.js, js/gym.js, js/recovery.js
Live: https://fiteasy.netlify.app
Supabase project: tlzymwuoedjyzpkockfe.supabase.co
