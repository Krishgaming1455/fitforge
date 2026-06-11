# FitForge — Bugs & Features TODO

## 🐛 BUGS TO FIX (Priority Order)

### ✅ 1. BMI / TDEE Uses Hardcoded Age & Height — FIXED
- Read actual `p-age` and `p-height` in both `calcBMI()` and `generateDiet()`

### ✅ 2. Profile Tags Not Saving to localStorage — FIXED
- `saveUserData()` now serializes selected goal + injury tags
- `loadUserData()` re-applies `.selected` class on restore

### ✅ 3. pplChecked Index Mismatch on Week A/B Change — FIXED
- pplChecked now uses `ex.name` as key instead of array index

### ✅ 4. Food Entry Uses Native `prompt()` Popup — FIXED
- Replaced with inline quantity input + Add button in suggestion list

### 5. Diet Generation Ignores User Height from Profile
- **Status:** Partially fixed in Bug #1 — height is already read from `p-height`
- **Remaining:** If user hasn't filled profile height, diet defaults to 175cm fallback (acceptable)

---

## ✨ FEATURES TO ADD

### ⬜ 1. Water Intake Tracker (Easy/Quick)
- Add to Diet or Home screen
- 8 glass buttons (250ml each), tap to fill
- Show daily total (e.g. 1.5L / 2L)
- Save to localStorage per day
- Reset at midnight (check date on load)

### ⬜ 2. Workout History Log (Medium)
- Add "✅ Finish Workout" button at bottom of each PPL panel
- On click: save `{ date, dayType, week, exercisesCompleted }` to localStorage array
- Show last 7 sessions as simple list on gym screen
- Helps user see streak and consistency

### ⬜ 3. Progressive Overload Tracker (Medium)
- Each exercise card gets a small "Log Weight" button
- Opens inline input: weight (kg) + reps done
- Saves to localStorage keyed by `exerciseName + date`
- Shows previous session's weight below exercise name
- e.g. "Last session: 20kg × 10"

### ⬜ 4. Rest Day Content (Easy)
- Sunday shows nothing useful currently
- Add dedicated rest day panel with stretching routine, foam rolling, sleep tips

### ⬜ 5. Workout Timer (Easy)
- Rest timer between sets: 60s / 90s / 120s buttons
- Floating pill at bottom of screen when counting down
- Saves preferred rest time to localStorage

---

## 🎨 UI IMPROVEMENTS

### ✅ Weekly Split — Highlight Today's Day — FIXED
- Today's day auto-expands and shows "TODAY" badge

### ✅ Auth Screen — Password Show/Hide Toggle — FIXED
- Eye icon added to all password fields

### ✅ Daily Workout Reset — FIXED
- On gym screen load, if date changed since last visit → prompts to reset checkboxes

### ⬜ Mobile Food Search Keyboard Issue
- Suggestions dropdown gets hidden behind keyboard on mobile
- Fix: scroll suggestion list into view on focus

### ⬜ Warmup Section Auto-Open on Today's Tab
- If it's the user's workout day, warmup should be expanded automatically

---

## 📝 NOTES FOR NEXT SESSION

When starting next Claude session, paste this file + say:
"Continue FitForge fixes — start with Feature #1 (Water Tracker) then Feature #2 (Workout History)"

Repo: https://github.com/Krishgaming1455/fitforge.git
Main file: index.html (single file app, ~1800 lines)
Stack: Vanilla HTML/CSS/JS, localStorage for data, no frameworks

---

## 🏋️ FEATURES FROM TOP GYM APPS (Research)

### From MyFitnessPal
- ⬜ **Calorie burn from workout** — subtract estimated calories burned when user logs a workout session
- ⬜ **Macro pie chart** — visual donut chart showing protein/carb/fat split for the day
- ⬜ **Meal copy** — "Copy yesterday's breakfast" button to avoid re-logging same foods daily
- ⬜ **Net calories display** = calories eaten − calories burned (show separately from gross intake)
- ⬜ **Weekly nutrition report** — average macros over 7 days, not just today's snapshot

### From Jefit
- ⬜ **Muscle heatmap** — SVG front+back body diagram, highlight which muscles trained today/this week
- ⬜ **1RM calculator** — input weight + reps → auto-calculates 1 rep max (Epley formula: weight × (1 + reps/30))
- ⬜ **Workout volume tracker** — total sets × reps × weight per session, show weekly volume trend
- ⬜ **Exercise swap** — if user can't do an exercise, suggest equivalent (e.g. no cable? → dumbbell version)
- ⬜ **Rest timer with sound** — audio beep when rest period ends, not just visual countdown

### From Fitbod (Paid ~$12/mo)
- ⬜ **Fatigue-based selection** — track which muscles worked recently, auto-warn if hitting same muscle too soon
- ⬜ **Progressive overload nudge** — if user completes all reps 2 sessions in a row, suggest +5% weight
- ⬜ **Workout rating** — rate session 1–5 stars after finishing. Track trend over time
- ⬜ **Body part recovery indicator** — "Chest: 80% recovered" based on days since last push session

### From Strong App
- ⬜ **Plate calculator** — enter target barbell weight, show which plates to load each side
- ⬜ **Personal records (PRs)** — auto-detect when user beats previous best weight/reps, show celebration 🏆
- ⬜ **Session notes** — free text per workout ("felt tired", "left knee issue today")
- ⬜ **Exercise history graph** — line chart of weight used over last 10 sessions per exercise

### From Cronometer
- ⬜ **Micronutrient gap alert** — if Vitamin D or Iron below 50% for 3 consecutive days, show warning banner
- ⬜ **Protein per meal check** — show if protein is distributed well across meals (aim 30–40g per meal)
- ⬜ **Hydration reminder** — on-screen reminder to drink water every 2 hours while app is open

### From Nike Training Club
- ⬜ **Experience level mode** — Beginner / Intermediate / Advanced toggle in profile, show different exercise variations
- ⬜ **Workout streak counter** — consecutive days with a logged workout, streak flame 🔥 display
- ⬜ **Exercise GIF/demo link** — small "How to" button per exercise linking to a form demo

### From Whoop / Garmin
- ⬜ **Daily recovery score** — simple 1–10 score user inputs (sleep quality + energy level), shown on home screen
- ⬜ **High training load warning** — if 5 workouts logged in 6 days, show "Consider rest tomorrow" alert

---

## 📝 UPDATED NOTES FOR NEXT SESSION

Start with remaining features in order:
1. Water Tracker (easy)
2. Workout History Log (medium)
3. Progressive Overload Tracker (medium)
4. Rest Day Content (easy)
5. Workout Timer with sound (easy)
6. Then pick from gym app research list above

Repo: https://github.com/Krishgaming1455/fitforge.git
Main file: index.html (~1800 lines), Stack: Vanilla HTML/CSS/JS + localStorage
