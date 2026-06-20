// DATA
// ============================================================
const FOOD_DB = [
  {n:"Boiled Egg",cal:78,p:6,c:0.6,f:5,fi:0,vitC:0,vitD:44,ca:28,fe:0.9,k:69,s:"1 egg (50g)"},
  {n:"Scrambled Eggs",cal:91,p:6.1,c:0.7,f:6.7,fi:0,vitC:0,vitD:44,ca:28,fe:0.9,k:69,s:"1 egg cooked (55g)"},
  {n:"Banana",cal:89,p:1.1,c:23,f:0.3,fi:2.6,vitC:8.7,vitD:0,ca:5,fe:0.3,k:358,s:"1 medium (100g)"},
  {n:"Whole Milk",cal:61,p:3.2,c:4.8,f:3.3,fi:0,vitC:0,vitD:40,ca:113,fe:0,k:150,s:"100ml"},
  {n:"Cooked Rice",cal:130,p:2.7,c:28,f:0.3,fi:0.4,vitC:0,vitD:0,ca:10,fe:0.2,k:35,s:"100g cooked"},
  {n:"Roti / Chapati",cal:104,p:3.5,c:20,f:1.5,fi:2.4,vitC:0,vitD:0,ca:27,fe:1.6,k:86,s:"1 medium (40g)"},
  {n:"Dal (Cooked)",cal:116,p:9,c:20,f:0.4,fi:8,vitC:0,vitD:0,ca:19,fe:3.3,k:369,s:"100g"},
  {n:"Chicken Breast",cal:165,p:31,c:0,f:3.6,fi:0,vitC:0,vitD:4,ca:15,fe:1,k:256,s:"100g grilled"},
  {n:"Paneer",cal:265,p:18,c:1.2,f:21,fi:0,vitC:0,vitD:7,ca:480,fe:0.5,k:98,s:"100g"},
  {n:"Peanut Butter",cal:188,p:8,c:6.4,f:16,fi:1.9,vitC:0,vitD:0,ca:16,fe:0.6,k:179,s:"2 tbsp (32g)"},
  {n:"Oats",cal:389,p:17,c:66,f:7,fi:11,vitC:0,vitD:0,ca:54,fe:4.7,k:429,s:"100g dry"},
  {n:"Soya Chunks",cal:345,p:52,c:33,f:0.5,fi:13,vitC:0,vitD:0,ca:350,fe:13,k:1950,s:"100g dry"},
  {n:"Fish (Rohu)",cal:97,p:17,c:0,f:3,fi:0,vitC:0,vitD:320,ca:530,fe:1,k:250,s:"100g"},
  {n:"Almonds",cal:58,p:2.1,c:2.2,f:5,fi:1.3,vitC:0,vitD:0,ca:26,fe:0.4,k:73,s:"10 nuts"},
  {n:"Sweet Potato",cal:86,p:1.6,c:20,f:0.1,fi:3,vitC:19.6,vitD:0,ca:30,fe:0.6,k:337,s:"100g"},
  {n:"Spinach",cal:23,p:2.9,c:3.6,f:0.4,fi:2.2,vitC:28.1,vitD:0,ca:99,fe:2.7,k:558,s:"100g"},
  {n:"Dahi / Yogurt",cal:61,p:3.5,c:4.7,f:3.3,fi:0,vitC:0,vitD:3,ca:121,fe:0.1,k:155,s:"100g"},
  {n:"Mixed Nuts",cal:607,p:20,c:21,f:54,fi:7,vitC:0.6,vitD:0,ca:264,fe:3.1,k:660,s:"100g"},
  {n:"Whey Protein",cal:120,p:25,c:3,f:1.5,fi:0,vitC:0,vitD:0,ca:150,fe:0,k:160,s:"1 scoop (30g)"},
  {n:"Broccoli",cal:55,p:3.7,c:11,f:0.6,fi:5.1,vitC:89.2,vitD:0,ca:47,fe:0.7,k:316,s:"100g"},
  {n:"Apple",cal:52,p:0.3,c:14,f:0.2,fi:2.4,vitC:4.6,vitD:0,ca:6,fe:0.1,k:107,s:"1 medium"},
  {n:"Lassi",cal:70,p:3.5,c:8,f:2.5,fi:0,vitC:0,vitD:5,ca:120,fe:0.1,k:160,s:"200ml"}
];

// ── WARMUP PROTOCOLS per day type ──────────────────────────────
const WARMUP_DATA = {
  push: [
    {name:"Arm Circles",duration:"30 sec each direction",icon:"🔄",note:"Big slow circles forward then backward. Lubricates shoulder joint before any pressing."},
    {name:"Band Pull-Aparts",duration:"2 × 20 reps",icon:"🎗️",note:"Light band. Arms straight, pull band to chest. Activates rear delts and rotator cuff — prevents shoulder injury."},
    {name:"Wall Slide",duration:"2 × 10 reps",icon:"🧱",note:"Back flat on wall, slide arms overhead like a snow angel. Teaches shoulder blade control before pressing."},
    {name:"Light DB Press (50% weight)",duration:"1 × 15 reps",icon:"🏋️",note:"First working set at half your normal weight. Gets joints warm before real load."},
    {name:"Chest Stretch (Doorframe)",duration:"30 sec each side",icon:"🚪",note:"Hold doorframe, lean through. Opens the pec minor — improves pressing depth and shoulder health."}
  ],
  pull: [
    {name:"Cat-Cow Stretch",duration:"10 slow reps",icon:"🐱",note:"On hands and knees. Arch up (cat), then drop belly down (cow). Warms up entire spine before pulling."},
    {name:"Scapular Pull-Ups",duration:"2 × 10 reps",icon:"⬆️",note:"Hang from bar, retract and depress shoulder blades without bending elbows. Activates lats before any row or pulldown."},
    {name:"Band Face Pulls",duration:"2 × 15 reps",icon:"🎯",note:"Light band at face height. Pull to ears. Warms up rear delts and rotator cuff — mandatory for back day."},
    {name:"Dead Hang",duration:"3 × 20 sec",icon:"🙌",note:"Just hang from the bar. Decompresses spine, improves grip, stretches lats. Best warm-up for pull day."},
    {name:"Thoracic Rotation Stretch",duration:"5 reps each side",icon:"🔃",note:"Seated, hands behind head. Rotate chest to each side. Opens up mid-back for rowing movements."}
  ],
  legs: [
    {name:"Hip Circles",duration:"10 reps each direction",icon:"🔵",note:"Stand, one hand on wall. Big hip circles. Opens hip joint before any squat or deadlift."},
    {name:"Bodyweight Squat",duration:"2 × 15 reps",icon:"🦵",note:"Slow controlled reps. Sit back, knees track over toes. Warms up entire lower body movement pattern."},
    {name:"Hip Flexor Stretch (Lunge)",duration:"30 sec each side",icon:"🧘",note:"Kneeling lunge, push hips forward. Stretches hip flexors that shorten from sitting — improves squat depth."},
    {name:"Glute Bridge",duration:"2 × 15 reps",icon:"🌉",note:"Lie on back, drive hips up. Activates glutes before loading. Weak glute activation = knees caving = injury."},
    {name:"Leg Swing (Front-Back + Side)",duration:"10 reps each leg each direction",icon:"🏃",note:"Hold wall for balance. Swing leg forward/back then side-to-side. Dynamically opens hip for deep work."}
  ],
  rest: []
};

// ── EXPANDED PPL DATA — Week A & Week B ────────────────────────
const PPL_DATA_WEEK = {
  A: {
    push: [
      {name:"Incline Dumbbell Press",sets:"4",reps:"10–12",muscles:"Upper Chest · Front Shoulders · Triceps",equipment:"Dumbbell + Bench",note:"Set bench 30–45°. Lower slowly — 2s eccentric. Controls shoulder impingement vs flat barbell."},
      {name:"Neutral-Grip Dumbbell Press (Flat)",sets:"3",reps:"10–12",muscles:"Chest · Triceps",equipment:"Dumbbell + Bench",note:"Palms face each other throughout. Reduces shoulder joint stress. Best if you have shoulder history."},
      {name:"Seated Overhead Press (Dumbbell)",sets:"3",reps:"10–12",muscles:"Medial & Front Deltoid · Triceps",equipment:"Dumbbell + Bench",note:"Seated with back support. Start arms at 90°, press overhead. Never behind the neck."},
      {name:"Lateral Raises",sets:"4",reps:"15–20",muscles:"Medial Deltoid (Width)",equipment:"Dumbbell",note:"Very light weight. Lead with elbows. Tilt pinky slightly up at top. Slow 3s lowering = most growth."},
      {name:"Cable Chest Fly (Low-to-High)",sets:"3",reps:"14–16",muscles:"Upper Chest · Front Delt",equipment:"Cable Machine",note:"Cables set low. Pull upward and across. Maintains constant tension — dumbbells lose it at the top."},
      {name:"Overhead Tricep Extension",sets:"3",reps:"12–14",muscles:"Long Head Triceps",equipment:"Dumbbell",note:"One dumbbell, both hands. Lower behind head slowly. Elbows point forward — don't flare."},
      {name:"Tricep Pushdown (Cable — Bar)",sets:"3",reps:"12–15",muscles:"Lateral & Medial Tricep Head",equipment:"Cable Machine",note:"Elbows locked to sides. Press bar down fully — lock out. Full range of motion. Light to moderate weight."},
      {name:"Pec Deck / Chest Fly Machine",sets:"3",reps:"12–15",muscles:"Chest (Isolation)",equipment:"Machine",note:"Set arms at chest height. Don't let weight stack fully rest between reps — keep tension. Feel the stretch at the open position."}
    ],
    pull: [
      {name:"Lat Pulldown (Wide Grip)",sets:"4",reps:"10–12",muscles:"Latissimus Dorsi · Biceps",equipment:"Cable Machine",note:"Grip slightly wider than shoulders. Lean back 10°. Drive elbows to pockets. Think 'elbows down' not 'bar down'."},
      {name:"Chest-Supported Dumbbell Row",sets:"4",reps:"10–12",muscles:"Mid Back · Lower Traps · Rear Delts",equipment:"Dumbbell + Incline Bench",note:"Chest fully on bench — lower back completely removed. Pull elbows back and up. Squeeze for 1 sec at top."},
      {name:"Cable Seated Row (Close Grip)",sets:"3",reps:"10–12",muscles:"Mid Back · Biceps · Rear Delts",equipment:"Cable Machine",note:"Sit tall. Pull handle to lower sternum. Squeeze shoulder blades together. Don't round forward."},
      {name:"Face Pulls (Cable — Rope)",sets:"3",reps:"15–20",muscles:"Rear Deltoid · External Rotators",equipment:"Cable Machine",note:"MANDATORY. Cable at forehead height. Pull to face — hands split apart, elbows out. Reverses rounded-shoulder posture."},
      {name:"Straight-Arm Pulldown",sets:"3",reps:"12–15",muscles:"Lats (Long Head)",equipment:"Cable Machine",note:"Arms straight, slight bend at elbow. Pull bar from overhead to thighs. Keeps lats under tension — builds that V-taper sweep."},
      {name:"Bicep Curl (Barbell or EZ Bar)",sets:"3",reps:"10–12",muscles:"Biceps Brachii",equipment:"Barbell / EZ Bar",note:"Elbows fixed at sides. Controlled lowering 3s. Full ROM — don't cut range to go heavier."},
      {name:"Hammer Curl",sets:"3",reps:"12",muscles:"Brachialis · Brachioradialis",equipment:"Dumbbell",note:"Neutral grip throughout. Builds arm thickness more than regular curls. Alternate arms."},
      {name:"Reverse Curl",sets:"2",reps:"12–15",muscles:"Brachioradialis · Forearm Extensors",equipment:"Barbell / Dumbbell",note:"Overhand grip (pronated). Curls the forearm — builds forearm thickness and grip. Often skipped but very effective."}
    ],
    legs: [
      {name:"Box Squat (Goblet)",sets:"4",reps:"12",muscles:"Quads · Glutes · Hamstrings · Core",equipment:"Dumbbell + Box/Bench",note:"Dumbbell at chest. Box behind — sit BACK onto it. Teaches hip-hinge. Protects knees by preventing forward knee travel."},
      {name:"Romanian Deadlift (Dumbbell)",sets:"4",reps:"10–12",muscles:"Hamstrings · Glutes · Spinal Erectors",equipment:"Dumbbell",note:"Hip hinge — push hips BACK, not down. Soft knee bend. Feel hamstring stretch. Neutral spine mandatory."},
      {name:"Leg Press — High Foot Placement",sets:"4",reps:"12–15",muscles:"Glutes · Hamstrings",equipment:"Leg Press Machine",note:"Feet high and wide — shifts load to glutes/hamstrings away from quads. Don't let lower back peel off. Stop at 90° knee."},
      {name:"Bulgarian Split Squat",sets:"3",reps:"10 each leg",muscles:"Quads · Glutes · Hip Flexors",equipment:"Dumbbell + Bench",note:"Rear foot on bench, front foot forward. Lower slowly. Front knee tracks toes. The hardest leg exercise — but incredible for single-leg strength and glute development."},
      {name:"Leg Curl Machine",sets:"3",reps:"12–15",muscles:"Hamstrings (Short Head)",equipment:"Machine",note:"Full ROM — don't cut the range. Slow 3s lowering. Hamstrings are often undertrained — this targets the short head that RDL misses."},
      {name:"Hanging Knee Raises",sets:"3",reps:"12–15",muscles:"Hip Flexors · Core · Obliques",equipment:"Pull-up Bar",note:"Hang from bar. Bring knees to chest. Lower slowly — no swinging. Progress to straight-leg raises over time."},
      {name:"Calf Raise (Single-Leg on Step)",sets:"4",reps:"15–20",muscles:"Gastrocnemius · Soleus",equipment:"Step / Platform",note:"Full ROM — deep stretch at bottom, full contraction at top. Hold 1 sec. Calves need high reps — they're stubborn."},
      {name:"Hip Abduction Machine",sets:"3",reps:"15–20",muscles:"Glute Medius · TFL",equipment:"Machine",note:"Push knees outward against resistance. Strengthens glute med — prevents knees from caving on squats and in daily life."}
    ]
  },
  B: {
    push: [
      {name:"Flat Barbell Bench Press",sets:"4",reps:"8–10",muscles:"Chest · Front Shoulders · Triceps",equipment:"Barbell + Bench",note:"Grip 1.5× shoulder width. Lower to lower chest — not neck. Arch slightly. Drive feet into floor. Controlled 2s down."},
      {name:"Cable Crossover (High-to-Low)",sets:"3",reps:"12–15",muscles:"Lower Chest · Front Delt",equipment:"Cable Machine",note:"Cables set high. Pull downward and across to hips. Targets lower chest that pressing misses. Keep slight elbow bend throughout."},
      {name:"Machine Shoulder Press",sets:"3",reps:"10–12",muscles:"Front & Medial Deltoid · Triceps",equipment:"Machine",note:"Machine stabilises the path — lets you focus on the muscle. Good for beginners or when fatigued after heavy compound work."},
      {name:"Dumbbell Front Raise",sets:"3",reps:"12–14",muscles:"Front Deltoid",equipment:"Dumbbell",note:"Alternate arms. Raise to shoulder height only — going higher shrugs the shoulder joint. Slow controlled lowering."},
      {name:"Lateral Raises (Cable)",sets:"3",reps:"15–20",muscles:"Medial Deltoid",equipment:"Cable Machine",note:"Cable keeps tension at bottom unlike dumbbells. Cross-body: cable on opposite side. Single arm."},
      {name:"Close-Grip Bench Press",sets:"3",reps:"10–12",muscles:"Triceps (All Heads) · Inner Chest",equipment:"Barbell + Bench",note:"Grip shoulder-width — not too close. Heavy tricep builder. Elbows stay close to body throughout."},
      {name:"Dips (Chest-Focused)",sets:"3",reps:"10–15",muscles:"Lower Chest · Triceps · Front Delt",equipment:"Dip Bars",note:"Lean forward for chest focus. Lower until elbows reach 90°. Don't go deeper — shoulder stress. Bodyweight or add weight."},
      {name:"Tricep Overhead Extension (Cable)",sets:"3",reps:"12–15",muscles:"Long Head Triceps",equipment:"Cable Machine",note:"Rope attachment, face away from cable. Extend overhead. Stretches long head of tricep — most growth in this position."}
    ],
    pull: [
      {name:"Pull-Ups / Assisted Pull-Ups",sets:"4",reps:"6–10",muscles:"Lats · Biceps · Rear Delts",equipment:"Pull-up Bar / Assisted Machine",note:"Full ROM — start from dead hang, pull chin over bar. Use assisted machine if needed. Best lat builder there is."},
      {name:"Barbell Bent-Over Row",sets:"4",reps:"8–10",muscles:"Mid Back · Lats · Biceps",equipment:"Barbell",note:"Hinge at hips, back at 45°. Pull to lower sternum. Squeeze shoulder blades. Heavy compound — treat it like a deadlift for the upper back."},
      {name:"Single-Arm Dumbbell Row",sets:"3",reps:"10–12 each",muscles:"Lats · Mid Back · Biceps",equipment:"Dumbbell + Bench",note:"Knee on bench for support. Pull elbow back past torso. Full stretch at bottom — don't cut range. Great for identifying side imbalances."},
      {name:"Reverse Fly (Dumbbell)",sets:"3",reps:"15–20",muscles:"Rear Deltoid · Lower Traps",equipment:"Dumbbell",note:"Bent forward at 90°. Light weight. Arms slightly bent. Raise to shoulder height — not higher. Squeeze rear delts at top."},
      {name:"Face Pulls (Cable — Rope)",sets:"3",reps:"15–20",muscles:"Rear Deltoid · External Rotators",equipment:"Cable Machine",note:"MANDATORY. Cable at forehead height. Pull to face — hands split apart, elbows out. Reverses rounded-shoulder posture."},
      {name:"Incline Dumbbell Curl",sets:"3",reps:"12",muscles:"Biceps (Full Stretch)",equipment:"Dumbbell + Incline Bench",note:"Seated on incline — arms hang straight down. This is the stretched position for biceps. Full ROM gives more growth."},
      {name:"Concentration Curl",sets:"3",reps:"12 each",muscles:"Bicep Peak",equipment:"Dumbbell",note:"Elbow braced on inner thigh. Slow curl. Isolates the bicep completely. Great for building the peak."},
      {name:"Shrugs (Dumbbell or Barbell)",sets:"3",reps:"12–15",muscles:"Upper Traps",equipment:"Dumbbell / Barbell",note:"Hold heavy. Shrug straight up — no rolling. Hold 1 sec at top. Builds trap thickness and neck support."}
    ],
    legs: [
      {name:"Barbell Back Squat",sets:"4",reps:"8–10",muscles:"Quads · Glutes · Hamstrings · Core",equipment:"Barbell + Squat Rack",note:"Bar on upper traps. Feet shoulder-width, toes out 30°. Squat to parallel. Keep chest tall. The king of leg exercises."},
      {name:"Stiff-Leg Deadlift (Barbell)",sets:"4",reps:"10",muscles:"Hamstrings · Glutes · Lower Back",equipment:"Barbell",note:"Legs nearly straight — slight bend. Hip hinge, bar slides down legs. Feel maximum hamstring stretch. Neutral spine always."},
      {name:"Hack Squat Machine",sets:"4",reps:"10–12",muscles:"Quads (Primary) · Glutes",equipment:"Hack Squat Machine",note:"Feet low on platform for quad focus. Full ROM — deep as comfortable. Excellent quad builder when barbell squat is too technical."},
      {name:"Walking Lunges (Dumbbell)",sets:"3",reps:"12 each leg",muscles:"Quads · Glutes · Balance",equipment:"Dumbbell",note:"Step forward, lower back knee toward floor. Front knee doesn't cave inward. Alternating legs across floor. Great for single-leg strength."},
      {name:"Seated Leg Curl",sets:"3",reps:"12–15",muscles:"Hamstrings",equipment:"Machine",note:"Full ROM. Don't lift hips off seat. Slow controlled lowering. Complement to deadlifts which work hip-dominant hamstring."},
      {name:"Leg Extension Machine",sets:"3",reps:"15",muscles:"Quads (Isolation)",equipment:"Machine",note:"Full extension at top. Slow 3s lowering. Don't use very heavy — knee joint stress. Light-to-moderate with full ROM is best."},
      {name:"Standing Calf Raise (Machine)",sets:"4",reps:"15–20",muscles:"Gastrocnemius",equipment:"Machine",note:"Full ROM essential. Deep stretch at bottom, full contract at top. Hold 1 sec. Heavy is fine — calves can take load."},
      {name:"Plank",sets:"3",reps:"30–45 sec",muscles:"Core · Transverse Abs · Glutes",equipment:"Bodyweight",note:"Elbows under shoulders. Body straight line. Don't let hips sag or pike up. Breathe normally. Core must be braced throughout."}
    ]
  }
};

// ── DAILY SYNC: Map day of week → PPL type ────────────────────
// Mon/Thu = Push, Tue/Fri = Pull, Wed/Sat = Legs, Sun = Rest
const DAY_TO_PPL = [null,'push','pull','legs','push','pull','legs']; // 0=Sun(rest),1=Mon,2=Tue...
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getTodayPPL() {
  const d = new Date().getDay(); // 0=Sun
  return DAY_TO_PPL[d]; // null = rest day
}

function getCurrentWeek() {
  // Alternate weeks A/B based on ISO week number
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return weekNum % 2 === 0 ? 'B' : 'A';
}

function getPPLData(dayType) {
  const week = getCurrentWeek();
  return PPL_DATA_WEEK[week][dayType];
}

// Keep PPL_DATA as alias pointing to today's week for compatibility
const PPL_DATA = {
  get push() { return getPPLData('push'); },
  get pull() { return getPPLData('pull'); },
  get legs() { return getPPLData('legs'); }
};

const WEEKLY_SPLIT = [
  {day:"Monday",focus:"Push — Chest · Shoulders · Triceps",color:"var(--accent3)",warmup:"5 min push warmup",exs:[{n:"🔥 Warmup (arm circles, band pull-aparts, wall slides)",s:"5–7 min"},{n:"Incline DB Press / Flat Barbell Press",s:"4×10–12"},{n:"DB or Cable Chest Press",s:"3×10–12"},{n:"Overhead Press (DB or Machine)",s:"3×10–12"},{n:"Lateral Raises",s:"4×15–20"},{n:"Cable Fly or Pec Deck",s:"3×12–15"},{n:"Tricep Extension",s:"3×12–14"},{n:"Tricep Pushdown",s:"3×12–15"}]},
  {day:"Tuesday",focus:"Pull — Back · Biceps · Rear Delts",color:"var(--blue)",warmup:"5 min pull warmup",exs:[{n:"🔥 Warmup (dead hang, scapular pull-ups, band face pulls)",s:"5–7 min"},{n:"Lat Pulldown or Pull-Ups",s:"4×10–12"},{n:"Row (Chest-Supported or Barbell)",s:"4×10–12"},{n:"Cable Seated Row",s:"3×10–12"},{n:"Face Pulls — MANDATORY",s:"3×15–20"},{n:"Straight-Arm Pulldown",s:"3×12–15"},{n:"Bicep Curl (Barbell or DB)",s:"3×12"},{n:"Hammer Curl",s:"3×12"},{n:"Reverse Curl",s:"2×12–15"}]},
  {day:"Wednesday",focus:"Legs — Quads · Glutes · Hamstrings",color:"var(--green)",warmup:"5 min legs warmup",exs:[{n:"🔥 Warmup (hip circles, bodyweight squats, glute bridges)",s:"5–7 min"},{n:"Box Squat (Goblet) or Barbell Squat",s:"4×10–12"},{n:"Romanian Deadlift",s:"4×10–12"},{n:"Leg Press (High Feet)",s:"4×12–15"},{n:"Bulgarian Split Squat or Walking Lunges",s:"3×10 each"},{n:"Leg Curl Machine",s:"3×12–15"},{n:"Calf Raise",s:"4×15–20"},{n:"Hip Abduction Machine",s:"3×15–20"},{n:"Hanging Knee Raises / Plank",s:"3×12–15"}]},
  {day:"Thursday",focus:"Push — Week B variation (heavier)",color:"var(--accent3)",warmup:"5 min push warmup",exs:[{n:"🔥 Warmup (arm circles, band pull-aparts, chest stretch)",s:"5–7 min"},{n:"Flat Barbell Bench Press",s:"4×8–10"},{n:"Cable Crossover (High-to-Low)",s:"3×12–15"},{n:"Machine Shoulder Press",s:"3×10–12"},{n:"Front Raise + Lateral Raise",s:"3×12–14 each"},{n:"Dips (chest-focused)",s:"3×10–15"},{n:"Close-Grip Bench Press",s:"3×10–12"},{n:"Overhead Tricep Extension (Cable)",s:"3×12–15"}]},
  {day:"Friday",focus:"Pull — Week B variation",color:"var(--blue)",warmup:"5 min pull warmup",exs:[{n:"🔥 Warmup (dead hang, thoracic rotation, band face pulls)",s:"5–7 min"},{n:"Pull-Ups / Assisted Pull-Ups",s:"4×6–10"},{n:"Barbell Bent-Over Row",s:"4×8–10"},{n:"Single-Arm DB Row",s:"3×10–12 each"},{n:"Reverse Fly (DB)",s:"3×15–20"},{n:"Face Pulls — MANDATORY",s:"3×15–20"},{n:"Incline Dumbbell Curl",s:"3×12"},{n:"Concentration Curl",s:"3×12 each"},{n:"Barbell Shrugs",s:"3×12–15"}]},
  {day:"Saturday",focus:"Legs — Week B (Barbell + Machine)",color:"var(--green)",warmup:"5 min legs warmup",exs:[{n:"🔥 Warmup (hip flexor stretch, leg swings, glute bridge)",s:"5–7 min"},{n:"Barbell Back Squat",s:"4×8–10"},{n:"Stiff-Leg Deadlift",s:"4×10"},{n:"Hack Squat Machine",s:"4×10–12"},{n:"Walking Lunges (DB)",s:"3×12 each"},{n:"Seated Leg Curl",s:"3×12–15"},{n:"Leg Extension Machine",s:"3×15"},{n:"Standing Calf Raise (Machine)",s:"4×15–20"},{n:"Plank",s:"3×30–45 sec"}]},
  {day:"Sunday",focus:"REST — Mandatory Recovery",color:"var(--purple)",warmup:"",exs:[{n:"Light stretching",s:"10 min"},{n:"Cat-Cow stretch",s:"5 min"},{n:"Walk (optional)",s:"20–30 min"},{n:"8+ hours sleep",s:"Required"},{n:"No gym — muscles grow during rest",s:"🌙"}]}
];

const RECOVERY_DATA = {
  back:{
    doms:{title:"Lower Back — Muscle Soreness (DOMS)",color:"var(--accent)",desc:"This is normal post-training soreness in the spinal erectors and glutes. Continue training lightly. The muscles are adapting — this is a good sign.",protocol:["Continue gym — use LIGHTER weights today (60% of normal)","Start every session with Cat-Cow stretch × 10 reps and Child's Pose × 45 sec","Heat therapy: warm compress or hot shower on lower back for 15 minutes","Stay mobile — don't rest completely. Walk 15–20 min. Movement speeds recovery.","Avoid: very heavy deadlifts or barbell squats today specifically"],subs:[{avoid:"Heavy Barbell Deadlift",do:"Light Romanian Deadlift with dumbbells (60% weight)"},{avoid:"Barbell Back Squat",do:"Goblet Squat or Box Squat (unloaded or light)"},{avoid:"Good Mornings",do:"Cat-Cow Stretch + Bird Dog (3×10 each side)"},{avoid:"Heavy Cable Row",do:"Chest-Supported DB Row (removes lower back entirely)"}]},
    acute:{title:"Lower Back — Acute Pain ⚠️",color:"var(--red)",desc:"STOP all heavy loading immediately. Acute lower back pain may indicate disc irritation, muscle spasm, or joint issue. Do not train through sharp, stabbing, or radiating pain.",protocol:["STOP all lower-back loading exercises today","Ice first 24 hours: 15 min on / 45 min off (reduces inflammation)","After 24h switch to heat for muscle spasm relief","Gentle movement ONLY: walking, and the rehab exercises below","See a doctor if pain radiates down the leg (could be nerve involvement)","Return to full training only when pain-free for 3 consecutive days"],subs:[{avoid:"ALL squatting, deadlifting, rowing",do:"Upper body pressing only: Chest-Supported Row, DB Press"},{avoid:"Seated cable exercises (spinal compression)",do:"Standing or lying exercises only"},{avoid:"Any exercise that reproduces the pain",do:"Dead Bug × 10 each side — spine-neutral core work"},{avoid:"Heavy loading in general",do:"Bird Dog × 10 each side — activates stabilisers safely"}]}
  },
  knees:{
    doms:{title:"Knees — Muscle Soreness (DOMS)",color:"var(--accent)",desc:"Quad and VMO soreness after leg day is expected. This is the muscles rebuilding. Continue training — just modify impact and range of motion.",protocol:["Foam roll quads and IT band for 2–3 minutes each side","Ice after training if swelling present: 15 min on","Keep knees WARM during exercise — consider knee sleeves","Avoid locking out knees at top of any press","Gentle cycling (stationary bike) is excellent active recovery for knee soreness"],subs:[{avoid:"Deep Barbell Squat (below parallel)",do:"Box Squat (controlled depth) or Goblet Squat"},{avoid:"Leg Extension (heavy)",do:"Terminal Knee Extension with resistance band"},{avoid:"Running or jumping",do:"Stationary bike at low resistance — knees love circular motion"},{avoid:"Lunges (high shear force)",do:"Leg Press with high-and-wide foot placement"}]},
    acute:{title:"Knees — Acute Joint Pain ⚠️",color:"var(--red)",desc:"Sharp knee pain during exercise is a red flag. Could be patellar tendinopathy, IT band syndrome, or meniscus irritation. Immediately reduce load.",protocol:["STOP: any exercise that reproduces the sharp pain","RICE protocol: Rest, Ice (15 min on/off), Compression wrap, Elevate leg","Avoid: squatting below 90°, running, stairs with heavy load","Strengthen the glutes — weak glutes = knees caving = knee pain","See a physiotherapist if pain persists more than 5 days"],subs:[{avoid:"All squat variations",do:"Straight-leg raises (lying) — loads quad with zero knee bend"},{avoid:"Leg Press",do:"Glute Bridge (lying) — activates glutes without knee stress"},{avoid:"Running / jump training",do:"Swimming or pool walking — zero impact"},{avoid:"Leg Extension",do:"Short-arc quad extension (only last 30° of movement)"}]}
  },
  shoulders:{
    doms:{title:"Shoulders — Muscle Soreness (DOMS)",color:"var(--accent)",desc:"Shoulder soreness after push/pull day is normal. The deltoids and rotator cuff are adapting. Keep them mobile and warmed up before any pressing.",protocol:["Arm circles: 20 reps forward and backward before any pressing","Band pull-aparts: 3×20 with light resistance band — activates rotator cuff","Face Pulls are mandatory this session — they heal, not hurt","Reduce overhead pressing weight by 20% today","Heat on shoulder before training — increases blood flow to tendons"],subs:[{avoid:"Behind-the-neck press (always dangerous)",do:"Seated DB Overhead Press (neutral or pronated grip)"},{avoid:"Upright Row (impingement risk)",do:"Lateral Raises with thumbs slightly up"},{avoid:"Wide-grip bench press (extreme shoulder stretch)",do:"Neutral-grip DB press (palms facing each other)"},{avoid:"Heavy overhead work",do:"Face Pulls 3×20 + band pull-aparts 3×20"}]},
    acute:{title:"Shoulders — Acute Pain ⚠️",color:"var(--red)",desc:"Shoulder joint pain can indicate impingement, rotator cuff strain, or AC joint irritation. All involve the same initial response: stop compressive loading.",protocol:["STOP all overhead pressing immediately","Avoid: any movement that lifts arm above 90° (impingement zone)","Ice shoulder 15 min on / 45 min off for first 24 hours","Sleep on the NON-affected side to reduce compression","Gentle external rotation with band only — no pain should occur","If pain present at rest: see a doctor immediately"],subs:[{avoid:"Overhead Press (all variations)",do:"Chest-Supported DB Row — pulls, does not press"},{avoid:"Lat Pulldown (behind neck)",do:"Lat Pulldown to collarbone ONLY"},{avoid:"Chest Fly / Cable Fly",do:"Face Pulls at face height (below impingement zone)"},{avoid:"Any arm-above-head movement",do:"Bicep curls, Hammer curls (elbow-level only)"}]}
  }
};

const MYTHS = [
  {m:"Lifting heavy stops your height growth",f:"100% false. No scientific evidence exists. Growth plates close based on genetics and hormones, not weightlifting. Thousands of professional athletes lifted heavy as teenagers and grew to full height normally."},
  {m:"Eating eggs in summer causes dangerous body heat",f:"Mostly a myth. 3–4 eggs daily is safe year-round. The idea of 'heating foods' is traditional belief, not proven physiology. Real risk in summer is dehydration — drink more water, eat eggs in morning or evening."},
  {m:"You need protein powder to build muscle",f:"Real food is superior. Eggs, milk, dal, chicken, paneer, soya — all provide high-quality protein. Supplements are convenient, not necessary. Beginners see full results from food alone. Powder is useful only when food protein is genuinely hard to hit."},
  {m:"More sweat = better workout",f:"Sweat is your body's cooling system, not a fat burner. You can sweat heavily in a hot room doing nothing. Workout quality is measured by progressive overload, form quality, and recovery — not sweat volume."},
  {m:"Cardio is the best way to lose fat and get fit",f:"Resistance training burns more total calories over 24 hours via the afterburn effect (EPOC). For weight gain specifically, excessive cardio directly works against you by burning the caloric surplus you need. Brisk walking is ideal for beginners."},
  {m:"Sit-ups give you a six-pack",f:"You cannot spot-reduce fat. Sit-ups strengthen core muscles but don't burn belly fat. Abs are revealed by reducing overall body fat through diet. 'Six-pack is made in the kitchen' is 100% accurate physiology."},
  {m:"Eating fat makes you fat",f:"Excess total calories cause fat gain — not dietary fat. Healthy fats from nuts, eggs, and ghee (in moderation) are essential for hormone production, brain function, vitamin absorption, and testosterone levels. Do not fear fat."},
  {m:"You must feel sore to know the workout worked",f:"Soreness (DOMS) means muscles experienced something new. As you become consistent, soreness decreases — that's adaptation and progress, not lack of results. Strength and physique changes are the correct measures of progress."},
  {m:"Women who lift will look bulky like men",f:"Women have 15–20x less testosterone than men — it's biologically impossible to accidentally build large masculine muscles. Lifting makes women lean, strong, and toned. Looking 'bulky' requires years of dedicated effort and often chemical assistance."},
  {m:"No pain, no gain — push through everything",f:"Muscle soreness is tolerable and training through it is fine. Sharp joint pain, nerve pain, or pain that worsens during exercise means STOP immediately. Training through joint pain causes injuries that set you back months. Learn the difference."},
  {m:"Creatine is a steroid and is dangerous",f:"Creatine is the most extensively researched supplement in exercise science. It occurs naturally in your body and in meat. It is not a steroid, not hormonal, not banned by any sports body. It safely helps muscles produce more energy for intense efforts."},
  {m:"You need to train 7 days a week for maximum results",f:"Muscles grow during REST, not during training. Training creates the stimulus; sleep and recovery days create the adaptation. Most evidence supports 4–6 sessions per week with structured rest for maximum long-term progress."}
];

// ============================================================
// STATE & GLOBALS
// ============================================================
let currentUser = null;
let isGuest = false;
let foodLog = [];
let targetCal = 2800, targetProtein = 100;
let currentRecoveryArea = 'back', currentRecoveryType = 'doms';
let pplChecked = {push:{}, pull:{}, legs:{}};

// ============================================================
// AUTHENTICATION & DATA PERSISTENCE
// ============================================================

// ── SHARED CALCULATION ENGINE ─────────────────────────────────
// Single source of truth used by both profile (app.js) and diet plan (diet.js)
function getCalcValues(weight, height, age, goal, activity) {
  const w = parseFloat(weight) || 70;
  const h = parseFloat(height) || 175;
  const a = parseFloat(age) || 25;
  const bmi = parseFloat((w / ((h/100)**2)).toFixed(1));

  const bmr = Math.round(10*w + 6.25*h - 5*a + 5);
  const actMult = {light:1.375, moderate:1.55, active:1.725}[activity] || 1.55;
  const tdee = Math.round(bmr * actMult);

  // Protein rate based on GOAL (not BMI) — consistent everywhere
  const proteinRates = { gain:1.9, loss: w > 80 ? 1.3 : w > 60 ? 1.4 : 1.5, strength:2.0, maintenance:1.6 };
  const proteinFactor = proteinRates[goal] || 1.6;
  const proteinTarget = Math.round(w * proteinFactor);

  // Calorie target based on goal
  const calAdjust = { gain:400, loss:-400, strength:200, maintenance:0 };
  const calTarget = tdee + (calAdjust[goal] || 0);

  // Fat and carbs
  const fatRates = { gain:1.0, loss:0.7, strength:0.9, maintenance:0.8 };
  const fatTarget = Math.round(w * (fatRates[goal] || 0.8));
  const carbTarget = Math.max(Math.round((calTarget - proteinTarget*4 - fatTarget*9) / 4), 50);

  return { bmi, bmr, tdee, calTarget, proteinTarget, proteinFactor, fatTarget, carbTarget, actMult };
}

// ── WATER + HISTORY + OVERLOAD STATE ─────────────────────
let waterGlasses = 0; // glasses drunk today (each = 250ml)
let workoutHistory = []; // array of { date, dayType, week, completed, total }
let overloadLog = {}; // { exerciseName: { date, weight, reps } }
let timerInterval = null;
let timerSeconds = 0;

// ── EXPERIENCE LEVEL ADJUSTMENTS ───────────────────────────
// Beginner swaps: harder exercise name → easier replacement {name, sets, reps, note}
const BEGINNER_SWAPS = {
  "Flat Barbell Bench Press": {name:"Flat Dumbbell Press", sets:"3", reps:"10-12", note:"Dumbbells let each arm work independently and are much safer to learn pressing mechanics with than a barbell. No spotter needed."},
  "Barbell Back Squat": {name:"Goblet Squat", sets:"3", reps:"12", note:"Hold a dumbbell at chest height. Teaches proper squat depth and posture without the technical demand of a barbell on your back."},
  "Barbell Bent-Over Row": {name:"Chest-Supported Dumbbell Row", sets:"3", reps:"10-12", note:"Removes lower back strain completely — perfect for learning the rowing motion safely while still new to lifting."},
  "Pull-Ups / Assisted Pull-Ups": {name:"Lat Pulldown", sets:"3", reps:"10-12", note:"Machine-guided so you can build back strength before attempting bodyweight pull-ups."},
  "Stiff-Leg Deadlift (Barbell)": {name:"Romanian Deadlift (Dumbbell)", sets:"3", reps:"10-12", note:"Dumbbells are far more forgiving for learning the hip-hinge pattern than a loaded barbell."},
  "Hack Squat Machine": {name:"Leg Press (High Feet)", sets:"3", reps:"12-15", note:"Simpler machine, less technical setup, still builds great leg strength."},
  "Close-Grip Bench Press": {name:"Tricep Pushdown (Cable — Bar)", sets:"3", reps:"12-15", note:"Isolated tricep work is safer to learn than a heavy pressing variation."},
  "Dips (Chest-Focused)": {name:"Cable Chest Fly (Low-to-High)", sets:"3", reps:"12-15", note:"Builds chest without the joint stress of bodyweight dips for a newer lifter."}
};

// Advanced bonus exercises added to END of each day (intensity techniques)
const ADVANCED_BONUS = {
  push: {name:"Drop Set Finisher — Lateral Raises", sets:"1", reps:"to failure, then -50% weight to failure again", muscles:"Medial Deltoid", equipment:"Dumbbell", note:"Do a normal set to failure, immediately drop the weight by half, continue to failure again. Brutal but highly effective for shoulder width."},
  pull: {name:"Rest-Pause Set — Lat Pulldown", sets:"1", reps:"failure, rest 15s, repeat x3", muscles:"Latissimus Dorsi", equipment:"Cable Machine", note:"Go to failure, rest only 15 seconds, squeeze out a few more reps. Repeat 3 times total. Adds serious volume in a short time."},
  legs: {name:"Finisher — Walking Lunges (High Rep)", sets:"1", reps:"3 x 20 each leg, minimal rest", muscles:"Quads · Glutes", equipment:"Bodyweight or light DB", note:"High rep burnout finisher to flood the legs with blood and maximise the session's growth stimulus."}
};

// Posture correction add-ons (desk job) — shown if user selects Desk Job/Posture tag
const POSTURE_ADDON = {
  push: [
    {name:"Wall Slides", sets:"2", reps:"12", muscles:"Mid/Lower Traps · Posture", equipment:"Bodyweight", note:"Back flat against wall, slide arms up like a snow angel. Directly counters the forward-shoulder roll from desk sitting."},
    {name:"Doorway Chest Stretch", sets:"2", reps:"30 sec each side", muscles:"Pec Minor · Posture", equipment:"Bodyweight", note:"Opens up tight chest muscles that pull shoulders forward from hours at a desk."}
  ],
  pull: [
    {name:"Chin Tucks", sets:"2", reps:"12", muscles:"Deep Neck Flexors · Posture", equipment:"Bodyweight", note:"Tuck chin straight back (like making a double chin). Directly fixes forward-head posture from looking at screens."},
    {name:"Band Pull-Aparts", sets:"2", reps:"20", muscles:"Rear Delts · Upper Back · Posture", equipment:"Resistance Band", note:"Strengthens the muscles between your shoulder blades that desk sitting weakens."}
  ],
  legs: [
    {name:"Glute Bridges", sets:"2", reps:"15", muscles:"Glutes · Hip Flexors · Posture", equipment:"Bodyweight", note:"Counters anterior pelvic tilt (lower back curve) caused by prolonged sitting. Strengthens glutes that go dormant when seated all day."},
    {name:"Standing Hip Flexor Stretch", sets:"2", reps:"30 sec each side", muscles:"Hip Flexors · Posture", equipment:"Bodyweight", note:"Hip flexors shorten from sitting, pulling your pelvis forward. This stretch directly reverses that."}
  ]
};

// Athletic conditioning add-ons (football/sports) — shown if Athletic Performance goal selected
const ATHLETIC_ADDON = {
  push: [
    {name:"Plyo Push-Ups", sets:"3", reps:"6-8", muscles:"Chest · Triceps · Explosive Power", equipment:"Bodyweight", note:"Push explosively so hands leave the ground. Builds upper body power transferable to contact sports and throwing."}
  ],
  pull: [
    {name:"Band Resisted Arm Drives", sets:"3", reps:"15 sec each side", muscles:"Lats · Running Mechanics", equipment:"Resistance Band", note:"Anchor band behind you, drive arms like sprinting. Reinforces proper sprint arm mechanics for speed."}
  ],
  legs: [
    {name:"Sprint Intervals", sets:"6", reps:"20m sprint, walk back recovery", muscles:"Speed · Power · Conditioning", equipment:"Open Space/Field", note:"Maximum effort sprints with full recovery between. This is what actually builds match speed — squats build the strength, sprints convert it to speed."},
    {name:"Lateral Bounds", sets:"3", reps:"8 each side", muscles:"Glutes · Lateral Power · Agility", equipment:"Bodyweight", note:"Jump side to side, land soft and stick the landing. Builds the lateral power needed for cutting and changing direction on the pitch."}
  ]
};

// ── REST DAY CONTENT ────────────────────────────────────────
const REST_DAY_STRETCHES = [
  {name:"Cat-Cow Stretch", duration:"60 sec", icon:"🐱", note:"On hands and knees, alternate arching and rounding your spine. Mobilizes the entire spine and relieves tension from training."},
  {name:"Child's Pose", duration:"60 sec", icon:"🧘", note:"Kneel, sit back on heels, reach arms forward on the floor. Decompresses the lower back and stretches lats."},
  {name:"Pigeon Stretch", duration:"45 sec each side", icon:"🦵", note:"Deep hip opener — releases tightness from squats and lunges. One of the best stretches for runners and lifters alike."},
  {name:"Thread the Needle", duration:"45 sec each side", icon:"🔄", note:"On all fours, thread one arm under your body and rotate. Opens up the thoracic spine and shoulders."},
  {name:"Standing Forward Fold", duration:"60 sec", icon:"🙇", note:"Let your upper body hang loose, knees soft. Releases the entire posterior chain — hamstrings, calves, lower back."},
  {name:"Couch Stretch", duration:"45 sec each side", icon:"🛋️", note:"Rear foot up against a wall/couch, front leg lunged forward. Deep hip flexor stretch — critical if you sit at a desk all day."},
  {name:"Foam Rolling — Quads & Lats", duration:"2 min each area", icon:"🪵", note:"Roll slowly over tight spots, pause 20-30 sec on tender points. Speeds up recovery by improving blood flow to sore muscles."}
];

const REST_DAY_TIPS = [
  {icon:"😴", title:"Sleep 7-9 Hours", note:"This is when actual muscle repair and growth happens — more important than any supplement."},
  {icon:"💧", title:"Stay Hydrated", note:"Aim for 3+ litres of water. Dehydration slows recovery and makes you feel more sore than you actually are."},
  {icon:"🚶", title:"Light Walk (Optional)", note:"A 20-30 min easy walk increases blood flow without adding training stress — great for active recovery."},
  {icon:"🍗", title:"Don't Under-eat", note:"Rest days still need fuel for repair — eat close to your normal calories and protein target, don't skip meals just because you're not training."}
];


