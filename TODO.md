# FitForge — TODO
Last updated: Session 19 — ALL PLANNED FEATURES COMPLETE

---

## ✅ EVERYTHING BUILT

**Core:** Auth (login/signup/guest), Supabase sync, daily resets, single calculation engine 
(consistent calories/protein everywhere), outage-resilient login (timeouts + clear errors), 
email confirmation flow fixed.

**Gym features:** Home dashboard, water tracker, workout history, progressive overload + PR 
celebrations, exercise history graph, 1RM calculator, workout timer with audio, skill levels 
(Beginner/Intermediate/Advanced), posture & athletic blends, custom exercises (add-on to PPL days), 
fully custom routine builder (build entire days from scratch, replaces PPL when enabled), 
rest day content, muscle heatmap.

**Diet features:** Macro donut chart, meal copy, micronutrient display.

**Community:** Public chat board + private DMs, report + block, clickable usernames (View Profile / 
View Routine / Message / Block), user search (finds anyone, not just chat history), privacy toggles 
(hide routine / hide stats independently), public routine viewing, chat polling for near-instant delivery.

**Growth:** Invite Friends QR code (dynamic, survives hosting changes).

**Architecture:** Split into css/ + js/ modules, fully synced to Supabase, verified syntax-clean 
at every step.

---

## ⬜ NOTHING PLANNED IS LEFT OPEN

All items from the original feature wishlist have been built and verified. 

## ⚠️ ACTION NEEDED FROM USER (if not done yet):
1. Run supabase_chat_setup.sql in full (includes chat tables + public_routines + privacy columns)
2. Test custom routine builder: Profile → toggle "Build my own routine" → Gym screen should show day builder instead of Push/Pull/Legs tabs

## 💡 IDEAS FOR FUTURE (not requested, just notes if useful later)
- Could let custom routine days also get "Finish Day" → workout history logging (currently only PPL days log to history)
- Could let users follow/favorite other users for quick access instead of re-searching each time

---

## 📝 NEXT SESSION
The app is feature-complete relative to everything discussed so far. Best next step is real usage 
testing rather than building more — said this last session too, still true.

Repo: https://github.com/Krishgaming1455/fitforge.git
Supabase: tlzymwuoedjyzpkockfe.supabase.co
Stack: HTML + vanilla JS modules (css/, js/) + Supabase

---

## 🆕 SESSION 20 — DM Notifications (Toast + Persistent Badge)

### Decisions:
- Global lightweight polling for new DMs (checks even when not on Community screen)
- Toast notification: shows for 2 seconds, swipe-to-dismiss
- Nav tab badge: persists until user actually opens the Community/Messages screen (not time-based)

### Approach:
- Global poll every 8-10s (lighter than the 3-4s in-screen polling) checks for unread DMs across the app
- Need a way to know "is this message unread" — direct_messages table already has a `read` boolean column
- On new unread DM detected: show toast (top of screen, slide in/out, swipe to dismiss) + add red dot badge to Community nav tab (desktop + mobile)
- Badge clears when user opens Community screen and views Messages tab
- Mark messages as read when DM thread is opened (update read=true in Supabase)

### Implementation notes:
- Toast should not stack — if multiple new messages arrive, show one toast that updates/queues rather than spamming
- Swipe gesture: touch-based drag detection, dismiss if dragged far enough horizontally
- Badge: small red dot, no need for unread count for v1 (keep it simple)

### ✅ SESSION 20 BUILT — DM Notifications:
- Global lightweight polling (9s interval) checks for new DMs even when not on Community screen
- Red dot badge on Community nav tab (desktop + mobile) appears on new unread DM, persists until Messages tab/thread opened
- 2-second toast notification slides in from top, shows sender name + message preview, tappable to jump straight into that DM thread
- Swipe-to-dismiss: drag toast left/right past 80px threshold to dismiss early; snaps back + resumes timer if swipe wasn't far enough
- Messages marked as read in Supabase when thread is opened — badge clears automatically
- Polling starts on login, stops cleanly on logout (guests excluded — can't receive DMs anyway)
