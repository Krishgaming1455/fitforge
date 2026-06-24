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

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000));
    const sessionPromise = sb.auth.getSession();
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

    if (session) {
      currentUser = session.user;
      isGuest = false;
      await loadUserData();
      hideOverlay();
      showMainApp();
      window._authInitialised = true;
    } else {
      hideOverlay();
      showAuthScreen();
      window._authInitialised = false;
    }
  } catch(err) {
    console.error('initAuth error:', err);
    hideOverlay();
    showAuthScreen();
    window._authInitialised = false;
    if (err.message === 'TIMEOUT') {
      // Show a gentle banner on the auth screen so it doesn't feel silently broken
      setTimeout(() => {
        const authCard = document.querySelector('#screen-auth .card');
        if (authCard && !document.getElementById('outage-banner')) {
          const banner = document.createElement('div');
          banner.id = 'outage-banner';
          banner.style.cssText = 'background:rgba(255,170,0,.1);border:1px solid rgba(255,170,0,.3);color:#ffaa00;padding:10px 14px;border-radius:8px;font-size:12px;margin-bottom:16px;text-align:center';
          banner.textContent = '⚠️ Connection to server timed out. Supabase may be experiencing an outage — please try again shortly.';
          authCard.prepend(banner);
        }
      }, 100);
    }
  }

  // BUG FIX: was hardcoded to true, which meant email-confirmation redirects
  // (SIGNED_IN event firing after clicking the email link) never triggered
  // the actual login flow — user landed back on the login screen silently.
  sb.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_IN' && newSession && !window._authInitialised) {
      window._authInitialised = true;
      currentUser = newSession.user;
      isGuest = false;
      await loadUserData();
      showMainApp();
    } else if (event === 'SIGNED_IN' && newSession && window._authInitialised) {
      updateAuthDisplay();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      window._authInitialised = false;
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

  // Persistent guest banner — shown on every screen while in guest mode
  const guestBanner = document.getElementById('global-guest-banner');
  if (guestBanner) {
    guestBanner.style.display = isGuest ? 'block' : 'none';
    document.body.style.paddingTop = isGuest ? '92px' : '58px';
  }

  showScreen('home');

  // Start global DM notification polling (guests can't receive DMs, so skip)
  if (typeof startGlobalDMPolling === 'function' && !isGuest) startGlobalDMPolling();
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

  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000));
    const signupPromise = sb.auth.signUp({ email, password });
    const { data, error } = await Promise.race([signupPromise, timeoutPromise]);

    btn.textContent = 'Create Account';
    btn.disabled = false;

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('fetch') || msg.includes('network')) {
        return showError(errorEl, '⚠️ Can\'t reach the server right now. Supabase may be having issues — try again in a few minutes.');
      }
      return showError(errorEl, '❌ ' + error.message);
    }

    if (data.user && !data.session) {
      errorEl.style.display = 'block';
      errorEl.style.color = 'var(--green)';
      errorEl.style.background = 'rgba(68,255,136,.08)';
      errorEl.style.borderColor = 'rgba(68,255,136,.3)';
      errorEl.textContent = '✅ Check your email to confirm your account!';
      return;
    }
  } catch (e) {
    btn.textContent = 'Create Account';
    btn.disabled = false;
    if (e.message === 'TIMEOUT') {
      showError(errorEl, '⚠️ Signup is taking too long — the server may be down. Please try again shortly.');
    } else {
      showError(errorEl, '⚠️ Something went wrong: ' + (e.message || 'unknown error') + '. Try again in a bit.');
    }
    console.error('handleSignup error:', e);
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

  try {
    // Timeout guard — if Supabase hangs (e.g. during an outage), don't leave button stuck forever
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000));
    const loginPromise = sb.auth.signInWithPassword({ email, password });
    const { error } = await Promise.race([loginPromise, timeoutPromise]);

    btn.textContent = 'Login';
    btn.disabled = false;

    if (error) {
      // Distinguish network/server issues from wrong credentials
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('fetch') || msg.includes('network')) {
        return showError(errorEl, '⚠️ Can\'t reach the server right now. Supabase may be having issues — try again in a few minutes.');
      }
      return showError(errorEl, '❌ ' + error.message);
    }
    // onAuthStateChange handles the rest
  } catch (e) {
    btn.textContent = 'Login';
    btn.disabled = false;
    if (e.message === 'TIMEOUT') {
      showError(errorEl, '⚠️ Login is taking too long — the server may be down. Please try again shortly.');
    } else {
      showError(errorEl, '⚠️ Something went wrong: ' + (e.message || 'unknown error') + '. Try again in a bit.');
    }
    console.error('handleLogin error:', e);
  }
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
  if (typeof stopGlobalDMPolling === 'function') stopGlobalDMPolling();
  if (typeof clearDMBadge === 'function') clearDMBadge();
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
    yesterdayFoodLog,
    waterGlasses,
    waterDate: new Date().toDateString(),
    pplChecked,
    targetCal,
    targetProtein,
    workoutHistory,
    overloadLog,
    overloadHistory,
    customExercises,
    experienceLevel: getExperienceLevel(),
    customRoutineEnabled,
    customRoutineDays,
    activePreset,
    customDayMapping,
    lastWorkoutDate: new Date().toDateString(),
    lastUpdated: new Date().toISOString()
  };

  const { error } = await sb
    .from('user_profiles')
    .upsert({ id: currentUser.id, data, updated_at: new Date().toISOString() });

  if (error) {
    console.error('Save error:', error.message);
    showSaveFailedToast();
  }
  if (saveBtn) { saveBtn.textContent = 'Save Profile'; saveBtn.disabled = false; }

  // Sync a public-facing copy so others can view this routine in chat profiles
  if (typeof syncPublicRoutine === 'function') syncPublicRoutine();
}

let _saveFailToastTimeout = null;
function showSaveFailedToast() {
  let toast = document.getElementById('save-failed-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'save-failed-toast';
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(255,68,102,.95);color:#fff;padding:10px 18px;border-radius:10px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3)';
    document.body.appendChild(toast);
  }
  toast.textContent = '⚠️ Your data couldn\'t be saved — check your connection and try again.';
  toast.style.display = 'block';
  clearTimeout(_saveFailToastTimeout);
  _saveFailToastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 4000);
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
    yesterdayFoodLog = data.yesterdayFoodLog || [];
  } else {
    // New day — snapshot what was logged (now "yesterday") before resetting
    yesterdayFoodLog = data.foodLog || [];
    foodLog = [];
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
  overloadHistory = data.overloadHistory || {};
  customExercises = data.customExercises || { push: [], pull: [], legs: [] };
  customRoutineEnabled = data.customRoutineEnabled || false;
  customRoutineDays = data.customRoutineDays || [];
  activePreset = data.activePreset || 'ppl';
  customDayMapping = data.customDayMapping || {};

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

    // Restore custom routine toggle UI state
    const routineToggle = document.getElementById('custom-routine-toggle');
    if (routineToggle) {
      routineToggle.checked = customRoutineEnabled;
      const toggleSwitch = routineToggle.nextElementSibling;
      if (toggleSwitch) toggleSwitch.classList.toggle('on', customRoutineEnabled);
    }
    const builder = document.getElementById('custom-routine-builder');
    const pplTabsWrap = document.getElementById('ppl-tabs-wrap');
    if (customRoutineEnabled) {
      if (builder) builder.style.display = 'block';
      if (pplTabsWrap) pplTabsWrap.style.display = 'none';
      document.querySelectorAll('.ppl-panel').forEach(p => p.style.display = 'none');
      if (typeof renderCustomRoutineDays === 'function') renderCustomRoutineDays();
    }

    // BUG FIX: trigger all UI updates after data is restored
    if (typeof renderFoodLog === 'function') renderFoodLog();
    if (typeof updateNutritionDisplay === 'function') updateNutritionDisplay();
    if (typeof renderPresetSelector === 'function') renderPresetSelector();
    if (typeof renderActivePresetDays === 'function') renderActivePresetDays();
    else if (typeof renderPPL === 'function') renderPPL();
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
