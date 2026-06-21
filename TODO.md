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

### ✅ SESSION 16 — DM speed fix:
- Added 3-second polling for open DM thread — fixes slow message delivery in private chats, same pattern as public board fix
- Polling preserves scroll position (only auto-scrolls to bottom if user was already at the bottom — won't yank you down if you're reading older messages)
- Polling stops automatically when closing the thread or navigating away from Community screen entirely
- Fixed sendDM to refresh without creating duplicate polling intervals (was calling openDMThread again, which re-created the interval each send)

---

## 🆕 SESSION 17 — Custom Exercise Routines + Public Routine Visibility

### Decision:
- Custom exercises: BOTH — can add extra exercises to existing PPL days AND build a fully separate custom routine that replaces PPL
- Routine visibility: PUBLIC by default — anyone can view anyone's current routine (no privacy toggle needed per user's choice)

### Feature 1: Add Custom Exercise (to existing PPL day)
- Small "+ Add Custom Exercise" button at bottom of each PPL panel (Push/Pull/Legs)
- Opens inline form: Exercise Name, Sets, Reps, Muscles worked, Equipment, Notes (all optional except name)
- Saves to Supabase per user, merged into that day's exercise list alongside the built-in ones
- Should work with existing checkbox/overload-log system (treat custom exercises identically to built-in ones)

### Feature 2: Fully Custom Routine (replace PPL entirely)
- New "Custom Routine" mode toggle on Gym screen (alongside Beginner/Intermediate/Advanced)
- If enabled: user builds their own day structure from scratch — name each day (not limited to Push/Pull/Legs), add exercises per day
- Should still support: checkboxes, progress bar, finish workout, history logging, overload tracking
- This is a bigger UI build — needs a "day builder" interface (add day → name it → add exercises to it)

### Feature 3: Public Routine Visibility (via Community)
- On the user-profile-card popup (built in Session 15 for chat), add a new section: "Current Routine" 
- Shows their PPL day exercises (or custom routine if they're using one) — read-only view
- Data needed: must store user's routine in a way that's queryable by OTHER users, not just themselves
  - Currently pplChecked/PPL_DATA customization lives in user_profiles.data (private JSONB per user)
  - Need: either (a) make user_profiles readable by all via RLS policy change, or (b) create a separate `public_routines` table that's explicitly public
  - RECOMMENDATION: separate `public_routines` table — keeps user_profiles private (good practice) while making routine sharing opt-in by nature of what's stored there

### Database changes needed:
```sql
create table public_routines (
  user_id uuid references auth.users on delete cascade primary key,
  display_name text,
  experience_level text,
  custom_exercises jsonb default '{}'::jsonb,  -- { push: [...], pull: [...], legs: [...] }
  custom_routine jsonb default null,            -- fully custom routine if enabled, null otherwise
  updated_at timestamp default now()
);
alter table public_routines enable row level security;
create policy "Anyone can view public routines" on public_routines for select using (true);
create policy "Users can update own routine" on public_routines for all using (auth.uid() = user_id);
```

### Build order:
1. Custom Exercise (add-on to existing days) — smaller, build first
2. Public routine sync (push custom exercises + experience level to public_routines table on save)
3. View partner's routine from chat profile card
4. Fully custom routine builder (bigger, do last)


### ✅ SESSION 17 BUILT (NOT YET PUSHED) — Custom Exercises + Public Routine Viewing:

**Feature 1 — Add Custom Exercise (DONE):**
- "+ Add Custom Exercise" button on each PPL day (Push/Pull/Legs)
- Modal form: name, sets, reps, muscles, equipment, notes
- Custom exercises merge into the day's list, work with checkboxes/overload-log identically to built-in exercises
- "YOURS" badge + Remove button shown only on custom exercises
- Saved to Supabase per-user, restored on login

**Feature 3 — View Partner's Routine (DONE):**
- New `public_routines` Supabase table — separate from private user_profiles, explicitly public-readable
- Auto-syncs (display name, experience level, custom exercises) every time user saves their profile
- "💪 View Routine" option added to the chat username popup menu
- Shows their experience level + any custom exercises they've added per day

**Feature 2 — Fully Custom Routine Builder (DEFERRED — bigger build):**
- This is the "build your own days from scratch" mode — NOT built this session
- Needs: day builder UI, custom day naming, full replacement of PPL structure
- Bigger scope, doing Feature 1+3 first was the right call to ship something useful sooner

### ⚠️ ACTION NEEDED FROM USER:
- Run the NEW SQL block in supabase_chat_setup.sql (the public_routines table) in Supabase SQL Editor
- It's appended at the bottom of the same file — just the new table this time, don't need to re-run the chat tables

---

## 🆕 SESSION 18 — Privacy Settings + User Search for DM

### Decision:
- Privacy: individual toggles — "Hide my routine" and "Hide my stats" separately (Instagram-style granular privacy)
- Search: must find ANY registered user (not just people who've posted in public chat), search by partial name match

### Database changes needed:
- `public_routines` table needs 2 new boolean columns: `hide_routine`, `hide_stats` (default false = public)
- Need a searchable users list — since `auth.users` isn't directly queryable by other users via RLS by default,
  the `public_routines` table doubles as our "user directory" (it already has display_name + user_id)
  IMPORTANT: this means user search will only find people who have saved their profile at least once
  (since that's what creates their public_routines row) — acceptable tradeoff, no extra table needed

```sql
alter table public_routines add column hide_routine boolean default false;
alter table public_routines add column hide_stats boolean default false;
```

### Stats to show (when not hidden) — keep it light, nothing sensitive:
- Experience level, workout streak, total workouts logged (from workoutHistory length)
- NOT shown ever regardless of privacy: weight, height, age, email — those stay fully private always

### UI changes:
1. Profile screen — new "🔒 Privacy" section with 2 toggles: "Hide my routine from others" / "Hide my stats from others"
2. Community screen — new search bar above the Public Board tabs: "🔍 Find someone to message"
   - Typing searches public_routines.display_name (case-insensitive partial match)
   - Results show as tappable rows → opens user menu (View Profile / Message / Block) same as chat username tap
3. viewPartnerRoutine() and viewUserProfile() must respect hide_routine/hide_stats flags — show "This user has kept their routine private" instead

### Build order:
1. SQL columns (user runs)
2. Privacy toggles on profile screen + save to public_routines
3. Update viewPartnerRoutine/viewUserProfile to check privacy flags
4. User search bar + search function

---

## 🆕 SESSION 18 — Privacy Controls + User Search for DMs

### Decisions:
- Privacy: individual toggles (hide routine separately from hide stats) — not all-or-nothing
- Search: must find ANY registered user, even if they've never posted in public chat (not limited to chat history like before)

### Problem with current search approach:
- Previously, DM conversation list only showed people you'd already messaged — there was no way to discover/search NEW people
- Need: a proper user directory search, which means we need a searchable public user list
- public_routines table (built last session) is a good base — but need to ensure EVERY user gets a row there on signup/profile-save, not just ones who've customized their routine

### Feature: Privacy Toggles
- Add to Profile screen: two toggles — "🔒 Hide my routine from others" and "🔒 Hide my stats from others"
- Stored in public_routines table as new columns: hide_routine boolean, hide_stats boolean
- When viewing someone's profile/routine: respect these flags — show "This user has made their routine private" instead of data if hidden

### Feature: User Search for DMs
- New search bar in the Messages (DM) tab — search by display name
- Searches public_routines table (since it has display_name for every user, regardless of chat activity)
- Shows matching users with a "Message" button → opens/starts DM thread directly
- Respects privacy: if hide_stats is on, search result just shows name + message button, no extra info

### Database changes needed:
```sql
alter table public_routines add column hide_routine boolean default false;
alter table public_routines add column hide_stats boolean default false;
```

### Important: every user needs a public_routines row, not just customizers
- Currently syncPublicRoutine() only runs on profile save — need to also call it right after signup/first login
- Otherwise users who never touch their profile won't be searchable at all
