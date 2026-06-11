function initAuth() {
  const savedUser = localStorage.getItem('fitforge_user');
  const savedSession = localStorage.getItem('fitforge_session');
  
  if (savedSession && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      isGuest = currentUser.email === 'Guest';
      loadUserData();
      showMainApp();
    } catch(e) {
      console.log('Session expired');
      showAuthScreen();
    }
  } else {
    showAuthScreen();
  }
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

function handleSignup() {
  const email = document.getElementById('auth-signup-email').value.trim();
  const password = document.getElementById('auth-signup-password').value;
  const confirm = document.getElementById('auth-signup-confirm').value;
  const errorEl = document.getElementById('auth-signup-error');

  errorEl.style.display = 'none';

  if (!email || !password || !confirm) {
    showError(errorEl, '❌ All fields required');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(errorEl, '❌ Invalid email format');
    return;
  }

  if (password.length < 6) {
    showError(errorEl, '❌ Password min 6 characters');
    return;
  }

  if (password !== confirm) {
    showError(errorEl, '❌ Passwords do not match');
    return;
  }

  if (!isLocalStorageAvailable()) {
    showError(errorEl, '❌ Browser storage not available. Please enable cookies/storage or use incognito mode.');
    return;
  }

  try {
    const allUsers = JSON.parse(localStorage.getItem('fitforge_users') || '{}');
    if (allUsers[email]) {
      showError(errorEl, '❌ Email already registered');
      return;
    }

    const newUser = {
      email,
      password: btoa(password),
      createdAt: new Date().toISOString(),
      id: Date.now()
    };

    allUsers[email] = newUser;
    localStorage.setItem('fitforge_users', JSON.stringify(allUsers));

    currentUser = { email, id: newUser.id };
    isGuest = false;
    localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
    localStorage.setItem('fitforge_session', 'active');

    initializeUserData();
    showMainApp();
    console.log('User registered successfully:', email);
  } catch (e) {
    console.error('Signup error:', e);
    showError(errorEl, '❌ Storage error. Please clear browser cache and try again.');
  }
}

function handleLogin() {
  const email = document.getElementById('auth-login-email').value.trim();
  const password = document.getElementById('auth-login-password').value;
  const errorEl = document.getElementById('auth-login-error');

  errorEl.style.display = 'none';

  if (!email || !password) {
    showError(errorEl, '❌ Email and password required');
    return;
  }

  if (!isLocalStorageAvailable()) {
    showError(errorEl, '❌ Browser storage not available. Please enable cookies/storage.');
    return;
  }

  try {
    const allUsers = JSON.parse(localStorage.getItem('fitforge_users') || '{}');
    const user = allUsers[email];

    if (!user || btoa(password) !== user.password) {
      showError(errorEl, '❌ Invalid email or password');
      return;
    }

    currentUser = { email, id: user.id };
    isGuest = false;
    localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
    localStorage.setItem('fitforge_session', 'active');

    loadUserData();
    showMainApp();
    console.log('User logged in successfully:', email);
  } catch (e) {
    console.error('Login error:', e);
    showError(errorEl, '❌ Storage error. Please clear browser cache and try again.');
  }
}

function loginAsGuest() {
  currentUser = { email: 'Guest', id: 'guest_' + Date.now() };
  isGuest = true;
  localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
  localStorage.setItem('fitforge_session', 'active');
  
  initializeUserData();
  showMainApp();
}

function logout() {
  if (confirm('Logout? Your data will be saved.')) {
    saveUserData();
    localStorage.removeItem('fitforge_session');
    localStorage.removeItem('fitforge_user');
    currentUser = null;
    
    document.getElementById('auth-login-email').value = '';
    document.getElementById('auth-login-password').value = '';
    document.getElementById('auth-signup-email').value = '';
    document.getElementById('auth-signup-password').value = '';
    document.getElementById('auth-signup-confirm').value = '';
    
    showAuthScreen();
  }
}

function updateAuthDisplay() {
  const display = document.getElementById('auth-user-display');
  if (currentUser) {
    const badge = isGuest ? '👤' : '✅';
    const label = isGuest ? ' (Guest)' : '';
    display.textContent = `${badge} ${currentUser.email}${label}`;
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

function getUserStorageKey() {
  return `fitforge_data_${currentUser.id}`;
}

function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('localStorage not available:', e);
    return false;
  }
}

function initializeUserData() {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, using in-memory storage only');
    return;
  }
  
  const key = getUserStorageKey();
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({
      profile: {},
      foodLog: [],
      pplChecked: { push: {}, pull: {}, legs: {} },
      createdAt: new Date().toISOString()
    }));
  }
}

function saveUserData() {
  if (!currentUser) return;
  
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot save: localStorage not available');
    return;
  }
  
  try {
    const key = getUserStorageKey();
    const data = {
      profile: {
        name: document.getElementById('p-name')?.value || '',
        age: document.getElementById('p-age')?.value || '',
        weight: document.getElementById('p-weight')?.value || '',
        height: document.getElementById('p-height')?.value || '',
        goalTags: [...document.querySelectorAll('[onclick*="selectTag"]')].filter(t => t.classList.contains('selected')).map(t => t.textContent.trim()),
        injuryTags: [...document.querySelectorAll('[onclick*="toggleTag"]')].filter(t => t.classList.contains('selected')).map(t => t.textContent.trim()),
      },
      foodLog: foodLog,
      pplChecked: pplChecked,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Data saved successfully for user:', currentUser.email);
  } catch (e) {
    console.error('Error saving user data:', e);
    if (e.name === 'QuotaExceededError') {
      alert('⚠️ Storage full! Please clear browser cache or use guest mode.');
    }
  }
}

function loadUserData() {
  if (!currentUser) return;
  
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot load: localStorage not available');
    initializeUserData();
    return;
  }
  
  try {
    const key = getUserStorageKey();
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    
    if (!data) {
      initializeUserData();
      return;
    }

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

        // Restore goal tags
        if (p.goalTags?.length) {
          document.querySelectorAll('[onclick*="selectTag"]').forEach(t => {
            if (p.goalTags.includes(t.textContent.trim())) t.classList.add('selected');
          });
        }
        // Restore injury tags
        if (p.injuryTags?.length) {
          document.querySelectorAll('[onclick*="toggleTag"]').forEach(t => {
            if (p.injuryTags.includes(t.textContent.trim())) t.classList.add('selected');
          });
        }
        
        if (p.weight && p.height) calcBMI();
      }, 100);
    }

    foodLog = data.foodLog || [];
    pplChecked = data.pplChecked || { push: {}, pull: {}, legs: {} };
    console.log('Data loaded successfully for user:', currentUser.email);
  } catch (e) {
    console.error('Error loading user data:', e);
    initializeUserData();
  }
}

function autoSave() {
  if (currentUser && !isGuest) {
    saveUserData();
  }
}

window.addEventListener('beforeunload', () => {
  if (currentUser) saveUserData();
});

setInterval(autoSave, 30000);

// ============================================================
// NAVIGATION
// ============================================================
