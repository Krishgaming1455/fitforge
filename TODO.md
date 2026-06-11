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

---

## 🐛 NEW BUGS FOUND (Full Code Audit)

### ⬜ BUG: updateAuthDisplay called too early on load
- Called in showMainApp() before profile data is loaded from Supabase
- So it shows email not name even if user has a saved name
- Fix: call updateAuthDisplay() again AFTER loadUserData() setTimeout completes

### ⬜ BUG: autoSave() is not async-safe
- autoSave() calls saveUserData() which is async but autoSave is not awaited
- The setInterval(autoSave, 30000) will fire and not wait for completion
- Fix: make autoSave async and await saveUserData()

### ⬜ BUG: foodLog daily reset missing
- foodLog is saved to Supabase but never resets for a new day
- User's yesterday food shows today too
- Fix: save foodLog with a date key, reset if date changed on load

### ⬜ BUG: diet screen food log not rendered on login
- renderFoodLog() and updateNutritionDisplay() not called after loadUserData()
- So food log loaded from Supabase is invisible until user visits diet tab
- Fix: call renderFoodLog() and updateNutritionDisplay() at end of loadUserData()

### ⬜ BUG: targetCal and targetProtein reset to defaults on page load
- Set to 2800/100 in data.js but not restored from Supabase
- Diet targets lost after refresh even if diet plan was generated before
- Fix: save targetCal and targetProtein in Supabase data object, restore on load

### ⬜ BUG: gym screen PPL not re-rendered after data load
- pplChecked restored from Supabase but renderPPL() not called after
- Checkboxes show unchecked even if user had checked them
- Fix: call renderPPL() at end of loadUserData() if gym screen is active, or always

### ⬜ BUG: email confirmation flow broken
- After signup Supabase sends confirmation email
- But app shows "Check your email" in the error box (red styled) not a success box
- Fix: style confirmation message green, add separate success div

### ⬜ BUG: food search item IDs break with special characters
- food name used as DOM id: `qty-${f.n.replace(/\s+/g,'_')}`
- Food names with brackets, slashes, commas will create invalid IDs
- Fix: use index instead of name for qty input ID, or sanitize more aggressively

### ⬜ BUG: recovery.js references currentRecoveryArea/Type but they're in data.js
- If scripts load out of order, recovery functions break
- Currently works but fragile — fix: add null checks in renderRecovery()

### ⬜ BUG: beforeunload save is unreliable on mobile
- window beforeunload doesn't reliably fire on iOS Safari / Android Chrome
- Data may not save when user closes tab on phone
- Fix: save on every meaningful action (already doing autoSave on input change) + add visibilitychange event listener

### ⬜ BUG: guest mode has no data persistence at all
- Guest data gone on refresh — expected, but no warning shown during use
- Fix: show a persistent banner "You're in guest mode — data won't be saved" 

### ⬜ BUG: diet screen weight input disconnected from profile weight
- User fills profile weight but diet screen has its own weight input
- syncProfileToDiet() exists but only runs when switching to diet tab
- If user changes profile weight and stays on profile, diet isn't updated
- Fix: call syncProfileToDiet() in calcBMI() too

