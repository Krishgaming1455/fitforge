# FitForge — TODO
Last cleaned up: Session 13

---

## ✅ EVERYTHING BUILT & WORKING SO FAR

**Core fixes:** Auth (login/signup/guest), Supabase save/load, daily resets (food log, workout date), 
calorie/protein math (single shared engine, consistent everywhere), all known crash bugs fixed,
login now degrades gracefully during Supabase outages (timeout + clear error messages).

**Features shipped:**
- Home Dashboard — welcome card, today's workout, 4 live stat cards (calories/protein/water/streak), feature grid, PPL overview
- Water Tracker — 8 tappable glasses, daily auto-reset
- Workout History — Finish Workout button, last 7 sessions log, streak counter
- Progressive Overload — log weight/reps per exercise, shows last session, PR celebration popup
- Workout Timer — 60/90/120s rest timer with audio beep
- Skill Level system — Beginner (6 easier exercises)/Intermediate/Advanced (+finisher exercise)
- Posture correction blend — desk job tag adds posture exercises into every PPL day
- Athletic performance blend — football/sports goal adds sprint & agility work into every PPL day
- Pre-workout nutrition tip banner
- Community Chat — public board + private DMs + report + block (Supabase tables live)
- Invite Friends QR code — dynamically generated, survives hosting changes

**Architecture:** Split into css/ + js/ modules (data, auth, app, gym, diet, recovery, community), 
all synced to Supabase, code split makes future edits much easier.

---

## ⬜ STILL OPEN — Not Yet Built

### Bigger features (from gym app research, none started):
- Muscle heatmap (SVG body diagram showing trained muscles)
- 1RM calculator (Epley formula)

- Exercise history graph (line chart of weight over last 10 sessions)
- Macro donut chart on diet screen
- Meal copy ("copy yesterday's breakfast")
- Micronutrient display (data already exists in FOOD_DB, just needs UI)

- Age group adjustments (Teen/Adult/Mature) — skill level was built, age group was deferred

### Smaller polish items:
- Guest mode warning banner — currently only shows on diet screen, could show globally
- Email confirmation flow — built but never manually tested end-to-end
- Exercise GIF/demo links — nice-to-have, not critical

### Known limitation (not a bug, just a tradeoff):
- Real-time chat updates rely on reload-on-action rather than true push (Supabase Realtime publication setup was ambiguous in current dashboard UI) — works fine, just not instant across devices without reopening the tab

---

## 💡 IDEAS MENTIONED BUT NOT SPEC'D YET
- Nothing pending — last batch (QR invite) was completed this session

---

## 📝 NEXT SESSION
Say: "Check TODO.md, what should we build next" or pick directly from the open list above.

Repo: https://github.com/Krishgaming1455/fitforge.git
Live: (currently being redeployed — Netlify ran out of credits, check current host)
Supabase: tlzymwuoedjyzpkockfe.supabase.co
Stack: HTML + vanilla JS modules + Supabase

### ✅ SESSION 14 BUILT (NOT YET PUSHED):
- Plate Calculator — enter target weight + barbell weight, shows exactly which plates to load per side with color-coded plates, handles odd numbers and shows "closest achievable" warning if exact weight isn't possible with standard plates
- Rest Day Content — on Sunday (or any rest day), gym screen now shows 7 stretches with hold times + 4 recovery tips instead of empty PPL tabs; PPL tabs auto-hide on rest days and reappear on training days
- Both tested with real math scenarios (60kg, 100kg, 47.5kg, 82.5kg) — all correct

### ✅ SESSION 15 BUILT (NOT YET PUSHED):
- REMOVED: Plate Calculator entirely (user feedback: not useful, wasted space) — removed from HTML, gym.js, and data.js
- ADDED: Tap username in public chat → small popup menu (View Profile / Message / Block)
  - View Profile shows a card with display name, message count, first-seen date (no public profiles table yet, so this uses chat history as the data source)
  - Message → switches to DM tab and opens thread with that user directly
  - Block → existing blockUser() function, hides their messages going forward
  - Menu auto-positions on screen and closes on outside tap

### ✅ SESSION 15 (continued) — Chat delay fix:
- Added 4-second polling fallback for public board — guarantees new messages show up even if Supabase Realtime isn't properly configured, without needing manual refresh
- Polling only runs while Community screen is actively open, stops automatically when navigating away (no wasted requests)
- BONUS FIX: nav active-state arrays were missing 'community' and 'myths' — desktop/mobile nav highlighting was broken for those tabs, now fixed
