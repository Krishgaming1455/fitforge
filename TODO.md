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
