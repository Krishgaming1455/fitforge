// ── SUPABASE CONFIG ──────────────────────────────────────────
const SUPABASE_URL = 'https://tlzymwuoedjyzpkockfe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g2v4_kC-KLAGLpB-layAZw_Ud_aNskR';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State is declared in data.js

// ── INIT ─────────────────────────────────────────────────────
async function initAuth() {
  const overlay = document.getElementById('loading-overlay');
  const hideOverlay = () => { if (overlay) overlay.style.display = 'none'; };

  try {
    if (overlay) overlay.style.display = 'flex';

    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      currentUser = session.user;
      isGuest = false;
      await loadUserData();
      hideOverlay();
      showMainApp();
    } else {
      hideOverlay();
      showAuthScreen();
    }
  } catch(err) {
    console.error('initAuth error:', err);
    hideOverlay();
    showAuthScreen();
  }

  let initialised = true;
  sb.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_IN' && newSession && !initialised) {
      initialised = true;
      currentUser = newSession.user;
      isGuest = false;
      await loadUserData();
      showMainApp();
    } else if (event === 'SIGNED_IN' && newSession && initialised) {
      updateAuthDisplay();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      initialised = false;
      showAuthScreen();
    }
  });
}

function showMainApp() {
  document.getElementById('screen-auth').classList.remove('active');
  document.getElementById('main-header').style.display = 'flex';
  // Only show mobile-nav via CSS media query — remove inline style override
  document.getElementById('mobile-nav').style.removeProperty('display');
  updateAuthDisplay();
  showScreen('home');
}

function showAuthScreen() {
  document.getElementById('screen-auth').classList.add('active');
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('mobile-nav').style.display = 'none';
}

function toggleAuthMode() {
  const signup = document.getElementById('auth-signup-form');
  const login = document.getElementById('auth-login-form');
  if (signup.style.display === 'none') {
    signup.style.display = 'block';
    login.style.display = 'none';
  } else {
    signup.style.display = 'none';
    login.style.display = 'block';
  }
  document.getElementById('auth-signup-error').style.display = 'none';
  document.getElementById('auth-login-error').style.display = 'none';
}

// ── SIGNUP ───────────────────────────────────────────────────
async function handleSignup() {
  const email = document.getElementById('auth-signup-email').value.trim();
  const password = document.getElementById('auth-signup-password').value;
  const confirm = document.getElementById('auth-signup-confirm').value;
  const errorEl = document.getElementById('auth-signup-error');
  const btn = document.querySelector('#auth-signup-form .btn-primary');

  errorEl.style.display = 'none';

  if (!email || !password || !confirm) return showError(errorEl, '❌ All fields required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(errorEl, '❌ Invalid email');
  if (password.length < 6) return showError(errorEl, '❌ Password min 6 characters');
  if (password !== confirm) return showError(errorEl, '❌ Passwords do not match');

  btn.textContent = 'Creating account...';
  btn.disabled = true;

  const { data, error } = await sb.auth.signUp({ email, password });

  btn.textContent = 'Create Account';
  btn.disabled = false;

  if (error) return showError(errorEl, '❌ ' + error.message);

  if (data.user && !data.session) {
    errorEl.style.display = 'block';
    errorEl.style.color = 'var(--green)';
    errorEl.style.background = 'rgba(68,255,136,.08)';
    errorEl.style.borderColor = 'rgba(68,255,136,.3)';
    errorEl.textContent = '✅ Check your email to confirm your account!';
    return;
  }
}

// ── LOGIN ────────────────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById('auth-login-email').value.trim();
  const password = document.getElementById('auth-login-password').value;
  const errorEl = document.getElementById('auth-login-error');
  const btn = document.querySelector('#auth-login-form .btn-primary');

  errorEl.style.display = 'none';

  if (!email || !password) return showError(errorEl, '❌ Email and password required');

  btn.textContent = 'Logging in...';
  btn.disabled = true;

  const { error } = await sb.auth.signInWithPassword({ email, password });

  btn.textContent = 'Login';
  btn.disabled = false;

  if (error) return showError(errorEl, '❌ ' + error.message);
  // onAuthStateChange handles the rest
}

// ── GUEST ────────────────────────────────────────────────────
function loginAsGuest() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
  currentUser = { email: 'Guest', id: 'guest_' + Date.now() };
  isGuest = true;
  pplChecked = { push: {}, pull: {}, legs: {} };
  foodLog = [];
  waterGlasses = 0;
  workoutHistory = [];
  overloadLog = {};
  showMainApp();
  // C3 FIX: re-render UI for guest since loadUserData is skipped
  setTimeout(() => {
    if (typeof renderFoodLog === 'function') renderFoodLog();
    if (typeof updateNutritionDisplay === 'function') updateNutritionDisplay();
    if (typeof renderPPL === 'function') renderPPL();
    if (typeof renderWeeklySplit === 'function') renderWeeklySplit();
    if (typeof renderWaterTracker === 'function') renderWaterTracker();
    if (typeof renderWorkoutHistory === 'function') renderWorkoutHistory();
    if (typeof renderHome === 'function') renderHome();
  }, 150);
}

// ── LOGOUT ───────────────────────────────────────────────────
async function logout() {
  if (!confirm('Logout?')) return;
  if (isGuest) {
    currentUser = null;
    isGuest = false;
    showAuthScreen();
    return;
  }
  await saveUserData();
  await sb.auth.signOut();
  currentUser = null;
  foodLog = [];
  pplChecked = { push: {}, pull: {}, legs: {} };
  document.getElementById('auth-login-email').value = '';
  document.getElementById('auth-login-password').value = '';
  document.getElementById('auth-signup-email').value = '';
  document.getElementById('auth-signup-password').value = '';
  document.getElementById('auth-signup-confirm').value = '';
  showAuthScreen();
}

function updateAuthDisplay() {
  const profileName = document.getElementById('p-name')?.value;
  const label = isGuest ? 'Guest' : (profileName || currentUser?.email || '');
  const badge = isGuest ? '👤' : '✅';
  const text = `${badge} ${label}`;
  const desktop = document.getElementById('auth-user-display');
  const mobile = document.getElementById('mobile-user-display');
  if (desktop) desktop.textContent = text;
  if (mobile) mobile.textContent = text;
}

function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

// ── SAVE TO SUPABASE ─────────────────────────────────────────
async function saveUserData() {
  if (!currentUser || isGuest) return;
  const saveBtn = document.getElementById('save-profile-btn');
  if (saveBtn) { saveBtn.textContent = 'Saving…'; saveBtn.disabled = true; }

  const data = {
    profile: {
      name: document.getElementById('p-name')?.value || '',
      age: document.getElementById('p-age')?.value || '',
      weight: document.getElementById('p-weight')?.value || '',
      height: document.getElementById('p-height')?.value || '',
      goalTags: [...document.querySelectorAll('[onclick*="selectTag"]')].filter(t => t.classList.contains('selected')).map(t => t.textContent.trim()),
      injuryTags: [...document.querySelectorAll('[onclick*="toggleTag"]')].filter(t => t.classList.contains('selected')).map(t => t.textContent.trim()),
    },
    foodLog,
    foodLogDate: new Date().toDateString(),
    waterGlasses,
    waterDate: new Date().toDateString(),
    pplChecked,
    targetCal,
    targetProtein,
    workoutHistory,
    overloadLog,
    lastWorkoutDate: new Date().toDateString(),
    lastUpdated: new Date().toISOString()
  };

  const { error } = await sb
    .from('user_profiles')
    .upsert({ id: currentUser.id, data, updated_at: new Date().toISOString() });

  if (error) console.error('Save error:', error.message);
  else console.log('Saved to Supabase ✅');
  if (saveBtn) { saveBtn.textContent = 'Save Profile'; saveBtn.disabled = false; }
}

// ── LOAD FROM SUPABASE ───────────────────────────────────────
async function loadUserData() {
  if (!currentUser || isGuest) return;

  const { data: row, error } = await sb
    .from('user_profiles')
    .select('data')
    .eq('id', currentUser.id)
    .single();

  if (error || !row) {
    console.log('No saved data yet — fresh start');
    pplChecked = { push: {}, pull: {}, legs: {} };
    foodLog = [];
    return;
  }

  const data = row.data;
  const today = new Date().toDateString();

  // BUG FIX: foodLog daily reset — check if saved date matches today
  if (data.foodLogDate === today) {
    foodLog = data.foodLog || [];
  } else {
    foodLog = []; // new day — reset food log
  }

  // BUG FIX: workout date from Supabase (cross-device)
  const lastWorkoutDate = data.lastWorkoutDate || null;
  if (lastWorkoutDate && lastWorkoutDate !== today) {
    // new day on any device — prompt reset handled in gym.js via flag
    window._showWorkoutResetPrompt = true;
  }

  pplChecked = data.pplChecked || { push: {}, pull: {}, legs: {} };
  if (data.targetCal) targetCal = data.targetCal;
  if (data.targetProtein) targetProtein = data.targetProtein;
  workoutHistory = data.workoutHistory || [];
  overloadLog = data.overloadLog || {};

  // Water: reset if new day
  waterGlasses = (data.waterDate === today) ? (data.waterGlasses || 0) : 0;

  // Restore profile fields + trigger UI after DOM ready
  setTimeout(() => {
    if (data.profile) {
      const p = data.profile;
      const nameEl = document.getElementById('p-name');
      const ageEl = document.getElementById('p-age');
      const weightEl = document.getElementById('p-weight');
      const heightEl = document.getElementById('p-height');
      if (nameEl) nameEl.value = p.name || '';
      if (ageEl) ageEl.value = p.age || '';
      if (weightEl) weightEl.value = p.weight || '';
      if (heightEl) heightEl.value = p.height || '';
      if (p.goalTags?.length) {
        document.querySelectorAll('[onclick*="selectTag"]').forEach(t => {
          if (p.goalTags.includes(t.textContent.trim())) t.classList.add('selected');
        });
      }
      if (p.injuryTags?.length) {
        document.querySelectorAll('[onclick*="toggleTag"]').forEach(t => {
          if (p.injuryTags.includes(t.textContent.trim())) t.classList.add('selected');
        });
      }
      if (p.weight && p.height) calcBMI();
      syncProfileToDiet();
    }

    // BUG FIX: trigger all UI updates after data is restored
    if (typeof renderFoodLog === 'function') renderFoodLog();
    if (typeof updateNutritionDisplay === 'function') updateNutritionDisplay();
    if (typeof renderPPL === 'function') renderPPL();
    if (typeof renderWeeklySplit === 'function') renderWeeklySplit();
    if (typeof renderWaterTracker === 'function') renderWaterTracker();
    if (typeof renderWorkoutHistory === 'function') renderWorkoutHistory();
    if (typeof renderHome === 'function') renderHome();
    updateAuthDisplay();

    console.log('Loaded from Supabase ✅');
  }, 150);
}

// ── AUTO SAVE ────────────────────────────────────────────────
async function autoSave() {
  if (currentUser && !isGuest) await saveUserData();
}

// Save on tab hide / phone lock (mobile-safe alternative to beforeunload)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && currentUser && !isGuest) saveUserData();
});

window.addEventListener('beforeunload', () => {
  if (currentUser && !isGuest) saveUserData();
});

setInterval(autoSave, 30000);

// Init on DOM ready — auth.js loads last so all functions exist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
