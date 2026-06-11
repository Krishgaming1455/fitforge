// ── SUPABASE CONFIG ──────────────────────────────────────────
const SUPABASE_URL = 'https://tlzymwuoedjyzpkockfe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g2v4_kC-KLAGLpB-layAZw_Ud_aNskR';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── STATE ────────────────────────────────────────────────────
let currentUser = null;
let isGuest = false;
let foodLog = [];
let targetCal = 2800, targetProtein = 100;
let currentRecoveryArea = 'back', currentRecoveryType = 'doms';
let pplChecked = { push: {}, pull: {}, legs: {} };

// ── INIT ─────────────────────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    isGuest = false;
    await loadUserData();
    showMainApp();
  } else {
    showAuthScreen();
  }

  // Listen for auth changes (e.g. tab focus, token refresh)
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      isGuest = false;
      await loadUserData();
      showMainApp();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      showAuthScreen();
    }
  });
}

function showAuthScreen() {
  document.getElementById('screen-auth').classList.add('active');
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('mobile-nav').style.display = 'none';
}

function showMainApp() {
  document.getElementById('screen-auth').classList.remove('active');
  document.getElementById('main-header').style.display = 'flex';
  document.getElementById('mobile-nav').style.display = 'block';
  updateAuthDisplay();
  showScreen('home');
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

  const { data, error } = await supabase.auth.signUp({ email, password });

  btn.textContent = 'Create Account';
  btn.disabled = false;

  if (error) return showError(errorEl, '❌ ' + error.message);

  if (data.user && !data.session) {
    // Email confirmation required
    showError(errorEl, '✅ Check your email to confirm your account!');
    errorEl.style.color = 'var(--green)';
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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  btn.textContent = 'Login';
  btn.disabled = false;

  if (error) return showError(errorEl, '❌ ' + error.message);
  // onAuthStateChange handles the rest
}

// ── GUEST ────────────────────────────────────────────────────
function loginAsGuest() {
  currentUser = { email: 'Guest', id: 'guest_' + Date.now() };
  isGuest = true;
  pplChecked = { push: {}, pull: {}, legs: {} };
  foodLog = [];
  showMainApp();
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
  await supabase.auth.signOut();
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
  const display = document.getElementById('auth-user-display');
  if (currentUser) {
    const badge = isGuest ? '👤' : '✅';
    const label = isGuest ? ' (Guest)' : '';
    const name = isGuest ? 'Guest' : currentUser.email;
    display.textContent = `${badge} ${name}${label}`;
  }
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
    pplChecked,
    lastUpdated: new Date().toISOString()
  };

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: currentUser.id, data, updated_at: new Date().toISOString() });

  if (error) console.error('Save error:', error.message);
  else console.log('Saved to Supabase ✅');
}

// ── LOAD FROM SUPABASE ───────────────────────────────────────
async function loadUserData() {
  if (!currentUser || isGuest) return;

  const { data: row, error } = await supabase
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
  foodLog = data.foodLog || [];
  pplChecked = data.pplChecked || { push: {}, pull: {}, legs: {} };

  if (data.profile) {
    const p = data.profile;
    setTimeout(() => {
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
    }, 100);
  }

  console.log('Loaded from Supabase ✅');
}

// ── AUTO SAVE ────────────────────────────────────────────────
function autoSave() {
  if (currentUser && !isGuest) saveUserData();
}

window.addEventListener('beforeunload', () => {
  if (currentUser && !isGuest) saveUserData();
});

setInterval(autoSave, 30000);
