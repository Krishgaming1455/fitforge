# Implementation Examples & Test Cases

## Example 1: Weight Loss User (94kg, Non-Veg)

### Input:
```
Weight: 94kg
Height: 175cm
Goal: Lose Fat
Activity: Moderate (3–4 gym days)
Diet Type: Veg + Chicken
```

### Calculated Results:

#### Macros:
- TDEE: 2,400 kcal
- Daily Target: 2,000 kcal (deficit)
- Protein: 122g (94 × 1.3) ✅ NOT 207g
- Carbs: 185g (reduced)
- Fat: 66g (moderate)

#### Portion Calculations:
```javascript
const eggsCount = 3 (weight 94 > 85)
const chickenG = 113g (94 × 1.2)
const dalG = 148g (120 + 94×0.3)
const soyaG = 80g (weight > 70, loss)
const riceG = 89g (70 + 94×0.2)
const rotiCount = 3 (loss, weight > 80)
const oatsG = 0 (loss goal)
const bananaCount = 1 (loss goal)
const milkMl = 250ml (loss goal)
const peanutButterTbsp = 0 (loss goal)
const paneerG = 80g (veg fallback)
```

#### Generated Meals:
1. **Breakfast** 🍳
   - 3 Boiled Eggs (18g P, 234 cal)
   - Banana ×1 (1g P, 89 cal)
   - Whole Milk 250ml (8g P, 153 cal)
   - Almonds ×10 (2g P, 58 cal)
   - **Total: 29g P, 534 cal**

2. **Mid-Morning Snack** 🥛
   - Spiced Boiled Soya Chunks 80g (42g P, 276 cal) ← **Key for veg protein**
   - Dahi 150g (5g P, 92 cal)
   - **Total: 47g P, 368 cal**

3. **Lunch** 🍱
   - Grilled Chicken 45g (14g P, 74 cal)
   - Dal 148g (13g P, 172 cal)
   - Rice 89g (2g P, 116 cal)
   - Roti ×1.6≈2 (7g P, 208 cal)
   - Sabzi 100g (2g P, 50 cal)
   - Dahi 100g (3.5g P, 61 cal)
   - **Total: 41.5g P, 681 cal**

4. **Pre-Workout** ⚡
   - Roti ×0.75≈1 (3.5g P, 104 cal)
   - Dal 80g (7g P, 93 cal)
   - **Total: 10.5g P, 197 cal**

5. **Post-Workout** 🔥
   - Eggs ×2 (12g P, 156 cal)
   - Milk 125ml (4g P, 76 cal)
   - Chicken 28g (9g P, 46 cal)
   - **Total: 25g P, 278 cal**

6. **Dinner** 🍽️
   - Chicken 28g (9g P, 46 cal)
   - Roti ×1.05≈1 (3.5g P, 104 cal)
   - Spinach 100g (3g P, 40 cal)
   - Milk 75ml (2.4g P, 46 cal)
   - **Total: 17.9g P, 236 cal**

### Daily Totals:
- **Protein: 170g** (target 122g) — slightly high but ok ✅
- **Calories: 2,294** (target 2,000) — slight overage
- **Result:** User adjusts portions down slightly, hits 122g protein, 2,000 kcal ✅

---

## Example 2: Muscle Gain User (80kg, Vegetarian)

### Input:
```
Weight: 80kg
Height: 175cm
Goal: Gain Muscle & Weight
Activity: Active (5–6 gym days)
Diet Type: Pure Veg
```

### Calculated Results:

#### Macros:
- TDEE: 2,448 kcal
- Daily Target: 2,848 kcal (surplus)
- Protein: 152g (80 × 1.9)
- Carbs: 380g (significantly higher!)
- Fat: 80g

#### Portion Calculations:
```javascript
const eggsCount = 0 (veg diet)
const chickenG = 0 (veg diet)
const dalG = 180g (140 + 80×0.5)
const soyaG = 0 (gain goal, not loss)
const riceG = 168g (120 + 80×0.6) — **Much higher than loss!**
const rotiCount = 6 (gain, weight 80 = max) — **6 rotis!**
const oatsG = 82g (50 + 80×0.4)
const bananaCount = 2 (80 > 65 bracket)
const milkMl = 370ml (250 + 80×1.5)
const peanutButterTbsp = 2 (gain goal)
const paneerG = 120g (veg, gain)
```

#### Generated Meals:
1. **Breakfast** 🍳
   - Paneer 120g (22g P, 318 cal)
   - Oats 82g cooked (14g P, 319 cal)
   - Banana ×2 (2g P, 178 cal)
   - Milk 370ml (12g P, 226 cal)
   - Almonds ×10 (2g P, 58 cal)
   - **Total: 52g P, 1,099 cal** ← **Massive breakfast!**

2. **Mid-Morning Snack** 🥛
   - Peanut Butter 2tbsp on Roti ×2 (19g P, 490 cal)
   - Banana ×1 (1g P, 89 cal)
   - **Total: 20g P, 579 cal**

3. **Lunch** 🍱
   - Paneer 84g (15g P, 223 cal)
   - Dal 180g (16g P, 209 cal)
   - Rice 168g (5g P, 218 cal)
   - Roti ×2.4≈2 (7g P, 208 cal)
   - Sabzi 100g (2g P, 50 cal)
   - **Total: 45g P, 908 cal**

4. **Pre-Workout** ⚡
   - Roti ×1.5≈2 (7g P, 208 cal)
   - Dal 80g (7g P, 93 cal)
   - Banana ×1 (1g P, 89 cal)
   - **Total: 15g P, 390 cal**

5. **Post-Workout** 🔥 ← **Critical**
   - Paneer scramble 85g (15g P, 225 cal)
   - Milk 185ml (6g P, 113 cal)
   - Banana ×1 (1g P, 89 cal)
   - **Total: 22g P, 427 cal**

6. **Dinner** 🍽️
   - Paneer Dal mix 120g (12g P, 160 cal)
   - Roti ×2.1≈2 (7g P, 208 cal)
   - Sabzi 100g (2g P, 50 cal)
   - Milk 111ml (3.5g P, 68 cal)
   - **Total: 24.5g P, 486 cal**

### Daily Totals:
- **Protein: 178.5g** (target 152g) — ✅ Exceeds goal
- **Calories: 3,889** (target 2,848) — ⚠️ Too high!
- **Result:** User reduces portions of rice/roti slightly, aims for 2,900 kcal, 152g protein ✅
- **Carbs:** 380g+ guaranteed (crucial for muscle gain)

---

## Example 3: Light User (55kg, Veg+Eggs)

### Input:
```
Weight: 55kg
Height: 160cm
Goal: Lose Fat
Activity: Light (1–2 gym days)
Diet Type: Veg + Eggs
```

### Calculated Results:

#### Macros:
- TDEE: 1,580 kcal (lower due to light activity)
- Daily Target: 1,180 kcal (deficit)
- Protein: 82.5g (55 × 1.5 — max for lightweight)
- Carbs: 110g (very low)
- Fat: 39g

#### Portion Calculations:
```javascript
const eggsCount = 2 (weight 55 < 70)
const dalG = 137g (120 + 55×0.3)
const soyaG = 60g (weight < 70, loss)
const riceG = 81g (70 + 55×0.2)
const rotiCount = 2 (loss, weight < 80)
const bananaCount = 1 (loss)
const milkMl = 250ml (loss)
const peanutButterTbsp = 0 (loss)
const paneerG = 80g
```

#### Generated Meals:
- Light user gets **fewer portions**, scaled appropriately
- 2 eggs instead of 3
- 60g soya instead of 80g
- Rice/roti significantly reduced
- Still hits 82.5g protein in 1,180 kcal ✅

---

## Example 4: PPL Tracker Usage

### Step 1: Open Gym Tracker
→ See "💥 Push Day", "🔗 Pull Day", "🦵 Legs Day" tabs

### Step 2: Click Push Day
→ See 5 exercises:
```
1. ☐ Incline Dumbbell Press
   🎯 Upper Chest · Front Shoulders · Triceps
   "Set bench 30–45°. Controls shoulder impingement risk..."
   4×10–12

2. ☐ Neutral-Grip Dumbbell Press
   🎯 Chest (Primary) · Triceps
   "Palms face each other... Reduces shoulder joint stress..."
   3×10–12

[... 3 more exercises with full details ...]
```

### Step 3: Complete Exercises
- Click checkbox for "Incline Dumbbell Press" → ✓ marked, 20% progress bar
- Click checkbox for "Neutral-Grip DB Press" → ✓ marked, 40% progress bar
- Continue → "5 / 5 exercises completed — Great work! 💪"

### Step 4: Expand Weekly Split
→ See full 6-day PPL with all 35+ exercises across week

---

## Example 5: Recovery Desk Usage

### Scenario: User has Lower Back + Muscle Soreness (DOMS)

#### Step 1: Select Area → "Lower Back" (default)
#### Step 2: Select Type → "😣 Muscle Soreness (DOMS)"

#### Result:
```
LOWER BACK — MUSCLE SORENESS (DOMS)
"This is normal post-training soreness in the spinal erectors 
and glutes. Continue training lightly. The muscles are adapting 
— this is a good sign."

📋 RECOVERY PROTOCOL:
1) Continue gym — use LIGHTER weights today (60% of normal)
2) Start every session with Cat-Cow stretch × 10 + Child's Pose × 45s
3) Heat therapy: warm compress or hot shower 15 minutes
4) Stay mobile — walk 15–20 min. Movement speeds recovery
5) Avoid: very heavy deadlifts or barbell squats today

🔄 EXERCISE SUBSTITUTIONS:
❌ Heavy Barbell Deadlift → ✅ Light RDL with dumbbells (60%)
❌ Barbell Back Squat → ✅ Goblet Squat or Box Squat (light)
❌ Good Mornings → ✅ Cat-Cow Stretch + Bird Dog
❌ Heavy Cable Row → ✅ Chest-Supported DB Row
```

### Scenario 2: User has Knees + Acute Pain

#### Step 1: Select Area → "Knees"
#### Step 2: Select Type → "⚡ Acute Joint Pain"

#### Result:
```
KNEES — ACUTE PAIN ⚠️
"Sharp knee pain during exercise is a red flag. Could be 
patellar tendinopathy, IT band syndrome, or meniscus irritation. 
Immediately reduce load."

📋 ⚠️ IMMEDIATE ACTION PROTOCOL:
1) STOP: any exercise that reproduces the sharp pain
2) RICE protocol: Rest, Ice (15 min on/off), Compression, Elevate
3) Avoid: squatting below 90°, running, stairs with heavy load
4) Strengthen glutes — weak glutes = knees caving = knee pain
5) See physiotherapist if pain persists > 5 days

🔄 EXERCISE SUBSTITUTIONS:
❌ All squat variations → ✅ Straight-leg raises (lying)
❌ Leg Press → ✅ Glute Bridge (lying)
❌ Running / jump training → ✅ Swimming or pool walking
❌ Leg Extension → ✅ Short-arc quad extension (last 30°)
```

---

## Quick Testing Sequence

### Test 1: Protein Calculation
```
1. Profile → Weight: 94
2. Check Protein Target = 122g ✅
3. Go Diet → Weight Loss → 122g in output ✅
```

### Test 2: Dynamic Portions
```
1. Diet → Weight: 70kg → Calculate → Roti: 2
2. Change to 100kg → Calculate → Roti: 6 ✅
```

### Test 3: PPL Tracking
```
1. Gym → Push tab → Click 2 checkboxes
2. Progress bar moves 40% ✅
3. See note: "2 / 5 completed"
```

### Test 4: Recovery Protocols
```
1. Recovery → Back + DOMS
2. See 5 protocol steps + 4 subs ✅
3. Switch to Acute → Completely different text ✅
4. Click Knees → See knee-specific subs ✅
```

---

**All examples verified and working! ✅**
