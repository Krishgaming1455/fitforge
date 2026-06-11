# FitForge — Bugs & Features TODO

## 🐛 BUGS TO FIX (Priority Order)

### 1. BMI / TDEE Uses Hardcoded Age & Height (CRITICAL)
- **File:** `index.html`
- **Lines:** ~1123 (calcBMI), ~1302 (generateDiet)
- **Problem:** BMR formula uses hardcoded `5*25` (age 25) and `6.25*170` (height 170cm) instead of actual user profile values
- **Fix:** Read `p-age` and `p-height` input values in both `calcBMI()` and `generateDiet()` before calculating BMR
- **Impact:** TDEE and calorie targets are wrong for anyone not exactly 25 years old and 170cm tall

### 2. Profile Tags Not Saving to localStorage
- **File:** `index.html`
- **Lines:** `saveUserData()` ~860, `loadUserData()` ~900
- **Problem:** Goal tags (Gain Muscle, Lose Fat, etc.) and injury tags (Back Pain, Knee Issues, etc.) are NOT included in the save/load data object — only text inputs are saved
- **Fix:** In `saveUserData()`, serialize selected tag classes. In `loadUserData()`, re-apply `.selected` class to matching tags
- **Impact:** User loses their goal and injury selections on every page refresh

### 3. pplChecked Index Mismatch on Week A/B Change
- **File:** `index.html`
- **Lines:** `loadUserData()`, `renderPPL()`
- **Problem:** Week A has 8 exercises, Week B has 8 but different order. Saved checkbox indices from Week A apply to wrong exercises in Week B
- **Fix:** Save pplChecked with exercise name as key (not index). Match by `ex.name` instead of array index `i`
- **Example fix:** `pplChecked[day][ex.name]` instead of `pplChecked[day][i]`

### 4. Food Entry Uses Native `prompt()` Popup
- **File:** `index.html`
- **Lines:** `addFood()` ~1648
- **Problem:** `prompt()` is ugly, blocks the page, and doesn't work well on mobile
- **Fix:** Replace with inline quantity input that appears in the suggestion item itself, or a small modal card using existing CSS styles

### 5. Diet Generation Ignores User Height from Profile
- **File:** `index.html`
- **Lines:** `generateDiet()` ~1302
- **Problem:** Same hardcoded height issue as Bug #1 but in the diet section separately
- **Fix:** Read `diet-weight` and also pull height from `p-height` profile field for accurate BMR

---

## ✨ FEATURES TO ADD

### 1. Water Intake Tracker (Easy/Quick)
- Add to Diet or Home screen
- 8 glass buttons (250ml each), tap to fill
- Show daily total (e.g. 1.5L / 2L)
- Save to localStorage per day
- Reset at midnight (check date on load)

### 2. Workout History Log (Medium)
- Add "✅ Finish Workout" button at bottom of each PPL panel
- On click: save `{ date, dayType (push/pull/legs), week, exercisesCompleted }` to localStorage array
- Show last 7 sessions as a simple list on gym screen
- Helps user see streak and consistency

### 3. Progressive Overload Tracker (Medium)
- Each exercise card gets a small "Log Weight" button
- Opens inline input: weight (kg) + reps done
- Saves to localStorage keyed by `exerciseName + date`
- Shows previous session's weight in small text below exercise name
- e.g. "Last session: 20kg × 10" — so user knows to try 22.5kg today

### 4. Rest Day Content (Easy)
- Currently Sunday shows nothing useful in gym tracker
- Add a dedicated rest day panel with:
  - Full body stretching routine (6–8 stretches with hold time)
  - Foam rolling guide
  - Sleep/recovery tips
  - "Active recovery" walk reminder

### 5. Workout Timer (Easy)
- Add a rest timer between sets
- Simple 60s / 90s / 120s buttons that countdown
- Show as a floating pill at bottom of screen when active
- Saves preferred rest time to localStorage

### 6. Daily Reset for Workout Checkboxes (Easy)
- Currently checkboxes never auto-reset
- On gym screen load, check if `lastWorkoutDate` in localStorage !== today's date
- If new day: clear pplChecked and save new date
- Prompt user: "New day! Reset yesterday's workout? [Yes] [Keep]"

### 7. Home Screen Progress Summary (Medium)
- Currently home screen is mostly static
- Add a "Today's Summary" card showing:
  - Today's workout type (from daily sync)
  - Calories logged today vs target
  - Water intake
  - Last workout date + streak count

---

## 🎨 UI IMPROVEMENTS

### 1. Mobile Food Search Keyboard Issue
- On mobile, food suggestions dropdown gets hidden behind keyboard
- Fix: scroll suggestion list into view on focus

### 2. Warmup Section Should Default Open on Today's Tab
- Currently warmup is collapsed by default
- If it's the user's workout day, warmup should be expanded automatically

### 3. Weekly Split — Highlight Today's Day
- In the weekly split accordion, auto-expand and highlight today's day card
- Add a "TODAY" badge next to the day name

### 4. Auth Screen — Password Show/Hide Toggle
- Password fields have no visibility toggle
- Add eye icon button to show/hide password (common UX pattern)

---

## 📝 NOTES FOR NEXT SESSION

When starting next Claude session, paste this file + say:
"Continue FitForge fixes — start with Bug #1 (hardcoded BMR) then Bug #2 (tags not saving)"

Repo: https://github.com/Krishgaming1455/fitforge.git
Main file: index.html (single file app, ~1756 lines)
Stack: Vanilla HTML/CSS/JS, localStorage for data, no frameworks
