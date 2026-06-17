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

---

## 🔍 REPLIT REACT VERSION ANALYSIS (Session 8)

### What Replit did differently (valuable findings):

#### ✅ Already have in our version:
- showScreen with mobile nav active state ✅
- window.scrollTo on screen change ✅
- updateNutritionDisplay on diet tab ✅
- visibilitychange + beforeunload save ✅
- foodLogDate daily reset ✅
- lastWorkoutDate cross-device ✅

#### ⬜ Things Replit improved we should port:

### ⬜ Profile saved as object not DOM reads
- Replit saves profile as `{ name, age, weight, height, goalTag, injuryTags[] }`
- Ours reads DOM elements at save time — fragile if DOM not ready
- Fix: maintain profile state object in data.js, update it on input change, save object directly
- File: js/auth.js saveUserData(), js/app.js profile inputs

### ⬜ goalTag is single string not array
- Replit uses single goalTag string (only one goal can be selected)
- Ours tries to save multiple goal tags but selectTag() deselects others anyway
- Fix: store as single string, simplify save/load logic

### ⬜ HomeScreen feature grid with cards
- Replit has 6 feature cards on home screen (PPL Tracker, Diet Planner, BMI, Recovery, Myths, Food Tracker)
- Each card has icon, title, description, clicks to navigate
- Our home screen just shows hero text — empty
- Fix: BUILD HOME DASHBOARD (already in TODO features #1)
- Add: welcome back message with user name
- Add: today's workout card  
- Add: feature grid cards
- Add: PPL system explanation section

### ⬜ React version has cleaner auth (no race conditions)
- Uses useRef for currentUser so saveUserData always has latest value
- Our vanilla JS version can have stale closure issues in setInterval
- Fix: store currentUser reference separately for interval callbacks

### ⬜ DietScreen has micronutrient display
- Replit's DietScreen.tsx shows fi (fibre), vitC, vitD, ca, fe, k per food
- Our food log only shows cal/protein/carbs/fat
- FOOD_DB already has these fields! Just need to display them
- Fix: add expandable micronutrient row in renderFoodLog()

### ⬜ ProfileScreen saves profile to Supabase on every field change
- Replit calls saveUserData() on every profile input change
- Ours only saves on calcBMI (weight/height) or page unload
- Fix: add autoSave() to all profile input onchange handlers

---

## 🏠 HOME SCREEN DASHBOARD — IMPLEMENTATION PLAN

Based on Replit's HomeScreen.tsx, here's exactly what to build:

### Section 1: Hero
- FITFORGE title (already there)
- Welcome back card: "👋 Welcome back, [name]"
- Two CTA buttons: "💪 Today's Workout" → gym, "🥗 Diet Planner" → diet
- Today's workout card (push/pull/legs or rest day)

### Section 2: Feature Grid (6 cards)
- 💪 PPL TRACKER → gym
- 🥗 DIET PLANNER → diet  
- ⚖️ BMI & PROFILE → profile
- 🩹 RECOVERY DESK → recovery
- 🧠 MYTH BUSTERS → myths
- 🍎 FOOD TRACKER → diet

### Section 3: PPL System Overview
- 3 cards: Push (Mon/Thu), Pull (Tue/Fri), Legs (Wed/Sat)
- Sunday rest note

### Section 4 (our addition, not in Replit): Quick Stats
- Calories today vs target
- Protein today vs target
- Water intake (when built)


---

## 🔬 SESSION 9 — Gym Screen Blank Bug Investigation

### Confirmed NOT the bug (tested in isolation):
- PPL_DATA getter works correctly (returns 8 exercises per day) ✅
- getCurrentWeek() returns 'A' correctly ✅
- getTodayPPL() returns correct day type ✅
- Exercise names have no apostrophes/quotes that would break onclick ✅
- toggleExercise, autoSave guard for guest mode ✅
- overloadLog/pplChecked initialized for guest mode ✅

### Debug version deployed (commit 2e928f2):
- Added try/catch to renderPPL with visible on-screen error display
- If a real JS error exists, it will now show as red box on the gym screen
- NEED: screenshot of the error message once user tests

### Hypothesis if still blank with no error shown:
- CDN/browser caching old JS file specifically (js/gym.js) even after HTML updated
- Cloudflare Workers cache headers might be too aggressive for /js/*.js files
- Fix to try: add cache-busting query string to script tags, e.g. js/gym.js?v=2
- Or: check Cloudflare cache settings / purge cache manually

### Next session action items:
1. Get screenshot of red error box (if shown) — tells us exact crash
2. If NO error box shown but still blank — it's a caching issue, add ?v= cache busting to all script tags in index.html
3. Consider adding a visible console.log('gym.js loaded') at top of gym.js to verify file is even loading

---

## 🆕 SESSION 10 — MAJOR FEATURE: Custom Plans + Skill Level + Posture/Football

### Context: User feedback
- Wants skill level (Beginner/Intermediate/Advanced) AND age-based plans
- Posture correction (desk job) + football speed/stamina should BLEND into existing PPL days, not separate sections
- Build order: 1) Skill level toggle FIRST, then posture/football blended in

### ⚠️ IMPORTANT HEALTH NOTE (for context, not a feature):
- User reports sharp strength drop after 3 sets (5kg dumbbell becomes too heavy)
- Likely cause: training fasted/light meal at 56kg bodyweight — low glycogen, not muscle issue
- Recommended: eat carbs+protein 1-1.5hr before training, stay hydrated
- ACTION ITEM: Add a "pre-workout nutrition tip" banner/reminder somewhere in gym screen (low priority, simple add)

---

## 📐 FEATURE SPEC: Skill Level System

### Data structure changes needed (js/data.js):
- Add `experienceLevel` to profile: 'beginner' | 'intermediate' | 'advanced'
- Add `ageGroup` to profile: 'teen' (13-17) | 'adult' (18-40) | 'mature' (40+)
- PPL_DATA_WEEK exercises need a per-exercise difficulty variant OR separate exercise pools per level

### Beginner adjustments (vs current Intermediate-level data):
- Fewer exercises per day (5-6 instead of 8) — avoid overwhelm/injury from doing too much too soon
- Lower starting sets (3 instead of 4) on compound lifts
- Replace some free-weight compounds with machine/assisted versions (e.g. Assisted Pull-up instead of Pull-up, Goblet Squat instead of Barbell Squat)
- Add extra form-cue notes (more detailed than intermediate notes)
- Longer rest time suggestions (90-120s vs 60-90s)

### Advanced adjustments:
- Add intensity techniques: drop sets, rest-pause, supersets (pair 2 exercises back to back)
- Slightly higher volume (9-10 exercises possible)
- Add optional "finisher" exercise per day

### Age group adjustments:
- Teen (13-17): emphasize form/technique over heavy weight, avoid max-effort lifts, more bodyweight/moderate-rep work, growth-plate-safe exercise notes
- Adult (18-40): current default programming (no change)
- Mature (40+): more warm-up time, lower-impact exercise swaps (e.g. Leg Press instead of high-impact jumps), joint-friendly notes, slightly higher rep/lower weight emphasis

### UI changes needed:
- Add to Profile screen: "Experience Level" tag group (Beginner/Intermediate/Advanced) — similar style to existing Goal tags
- Add to Profile screen: "Age Group" auto-detected from age field, or manual override tag
- Save experienceLevel + ageGroup to Supabase profile object
- gym.js renderPPL() needs to filter/select exercise variant based on experienceLevel

### Implementation approach (simplest path):
- Rather than full duplicate exercise databases per level, use a MULTIPLIER + SWAP approach:
  - Beginner: take Week A/B data, slice to first 5-6 exercises, reduce sets by -1, swap specific "hard" exercises for "easy" ones via a SWAP_MAP lookup
  - Advanced: take Week A/B data, add 1-2 extra exercises from a BONUS_EXERCISES pool, add "+ Drop Set" note to last exercise
  - This avoids tripling the entire PPL_DATA_WEEK object

---

## 📐 FEATURE SPEC: Posture Correction (Blended)

### Goal: desk-job posture fix blended into existing Push/Pull/Legs days
### Approach: Add 2-3 "posture exercises" as bonus mini-section at END of each day's exercise list (not separate tab)

- Push day posture add-on: Wall Slides, Doorway Chest Stretch (counters forward shoulder roll from desk work)
- Pull day posture add-on: Face Pulls (already have!), Band Pull-Aparts, Chin Tucks (counters neck forward-head posture)
- Legs day posture add-on: Hip Flexor Stretch (already have warmup version), Glute Bridges (counters anterior pelvic tilt from sitting)
- Show as a collapsible "🪑 Desk Posture Fix (2 min)" section similar to warmup section, auto-shown if user has 'Posture' or desk-job tag selected in profile

### Profile addition needed:
- Add new injury/lifestyle tag option: "💻 Desk Job / Posture" alongside existing Back Pain, Knee Issues etc.

---

## 📐 FEATURE SPEC: Football Speed & Stamina (Blended)

### Goal: blend speed/agility/stamina work into existing PPL days for football athletes
### Approach: Add a "⚡ Athletic Conditioning" bonus block at end of each day (similar pattern to posture)

- Push day addition: Plyo Push-ups (explosive upper power) — optional/advanced only
- Pull day addition: Band Resisted Sprints in place, or just stamina note
- Legs day addition (most relevant for football): 
  - Sprint intervals (e.g. "6 x 20m sprints, walk back recovery")
  - Lateral bounds / agility ladder note
  - Box jumps (explosive power for sprint speed)
- Add a dedicated "Match Day Stamina" cardio note: suggest 2x/week extra conditioning (shuttle runs, interval running) outside the PPL split

### Profile addition needed:
- Add new goal tag: "⚽ Athletic Performance (Football/Sports)" — may already exist as "Get Stronger" or "Improve Athletic Performance", verify and reuse if present

---

## 🔢 BUILD ORDER (per user's answer)
1. Beginner/Intermediate/Advanced exercise difficulty toggle (BUILD FIRST)
2. Age group adjustments
3. Posture correction blended add-on
4. Football speed/stamina blended add-on
5. Pre-workout nutrition tip banner (small, can slot in anytime)


---

## ✅ SESSION 10 COMPLETE — Built & Verified Locally (NOT PUSHED)

- Experience Level tag group added to Profile (Beginner/Intermediate/Advanced)
- Desk Job/Posture injury tag added
- BEGINNER_SWAPS: 8 harder exercises auto-swapped for easier ones + trimmed to 6 exercises/day
- ADVANCED_BONUS: drop set/rest-pause/finisher exercise added per day for advanced users
- POSTURE_ADDON: 2 posture-fixing exercises blended into each PPL day if Desk Job tag selected
- ATHLETIC_ADDON: speed/agility/sprint work blended into each PPL day if Athletic Performance goal selected
- getAdjustedExercises(day) — central function combining all the above logic
- updatePPLProgress and finishWorkout updated to use dynamic exercise count (not fixed 8)
- Pre-workout nutrition tip banner added to gym screen
- All verified working via Node VM testing (beginner push = 6 exercises confirmed correct)

### Still TODO from this feature set:
- Age group (Teen/Adult/Mature) adjustments — NOT YET BUILT (deferred, skill level was priority)
- Save experienceLevel explicitly to profile save data (currently re-read from DOM each render — works but verify it persists across reload)

### NEXT: push this batch when ready, then test on phone:
1. Select Beginner on profile → check Push tab shows 6 exercises with swapped names
2. Select Advanced → check Push tab shows 9th bonus exercise (Drop Set Finisher)
3. Select Desk Job/Posture tag → check Push/Pull/Legs each show +2 posture exercises at end
4. Select Athletic Performance goal → check Push/Pull/Legs show sprint/agility additions

---

## 🆕 SESSION 11 — MAJOR FEATURE: Community Chat (Public Board + DMs)

### Decision: Both public board AND private DMs, with report button (no profanity filter for v1)

### ⚠️ SAFETY NOTES (important, keep in mind for implementation):
- Public chat = real risk of spam/harassment/inappropriate content with zero moderation
- MUST include: report button (user requested), block user capability, and basic rate-limiting to prevent spam flooding
- Should NOT store/display real email as the public display name — use profile name only, fallback to "Anonymous Lifter" if not set
- Should add a "be respectful" community guideline note shown once or pinned at top
- No editing/deleting others' messages — only own messages can be deleted by the sender
- Consider: should reports go anywhere? Since there's no backend admin panel, reports should at minimum be stored in Supabase for the developer (Krish) to review manually for now

### Database changes needed (Supabase):

```sql
-- Public community board messages
create table community_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  display_name text,
  message text,
  created_at timestamp default now()
);
alter table community_messages enable row level security;
create policy "Anyone can read community messages" on community_messages for select using (true);
create policy "Users can insert own messages" on community_messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages" on community_messages for delete using (auth.uid() = user_id);

-- Private DMs
create table direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users on delete cascade,
  recipient_id uuid references auth.users on delete cascade,
  message text,
  read boolean default false,
  created_at timestamp default now()
);
alter table direct_messages enable row level security;
create policy "Users see own sent/received DMs" on direct_messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Users can send DMs" on direct_messages for insert with check (auth.uid() = sender_id);

-- Reports
create table message_reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references auth.users on delete cascade,
  reported_message_id uuid,
  reported_message_text text,
  reason text,
  created_at timestamp default now()
);
alter table message_reports enable row level security;
create policy "Users can insert reports" on message_reports for insert with check (auth.uid() = reporter_id);

-- Blocks
create table user_blocks (
  blocker_id uuid references auth.users on delete cascade,
  blocked_id uuid references auth.users on delete cascade,
  created_at timestamp default now(),
  primary key (blocker_id, blocked_id)
);
alter table user_blocks enable row level security;
create policy "Users manage own blocks" on user_blocks for all using (auth.uid() = blocker_id);
```

### Realtime setup needed:
- Enable Supabase Realtime replication on `community_messages` and `direct_messages` tables (toggle in Supabase dashboard → Database → Replication)

### UI changes needed:
- New nav item: "💬 Community" (6th tab — may need to fit into mobile nav scroll or replace an icon)
- Community screen: 
  - Public board feed (auto-scroll, newest at bottom, like simple group chat)
  - Message input + send button
  - Report icon per message (opens small reason picker: Spam / Harassment / Inappropriate / Other)
  - Block user option (tap username → Block)
  - DM tab/section: list of conversations, tap to open thread
- Rate limiting: client-side cooldown (e.g. 1 message every 3 seconds) to deter spam flooding — note this is NOT robust security, just a basic deterrent

### Build order:
1. Supabase tables + RLS policies (user needs to run SQL)
2. Enable Realtime replication (user needs to toggle in dashboard)
3. Community public board UI + send/receive
4. Report button + report storage
5. Block user feature
6. Private DMs (separate, more complex — conversation list + threads)

### Omega-3 supplement note (from user, unrelated to chat):
- People in some community/forum suggested user take Omega-3
- This is supplement/health advice — NOT something to build into the app as a recommendation engine
- If user wants general info: Omega-3 (fish oil) is commonly used for joint/heart health and reducing inflammation; reasonable doses are typically 1-3g/day combined EPA+DHA, but should not be presented as personalized medical advice
- ACTION: if user asks again, give balanced factual info and suggest consulting a doctor before starting any supplement, especially given user is a minor/young athlete (Class 12 student per memory)
