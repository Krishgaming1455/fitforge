<!-- AUTHENTICATION & DATA PERSISTENCE GUIDE FOR GYM-PLANNER.HTML -->
<!-- This document explains how to add user login and data persistence -->

# User Authentication & Data Persistence Implementation Guide

## Overview
This guide shows how to enhance gym-planner.html with:
1. User Registration/Login system
2. LocalStorage-based data persistence (free hosting)
3. User profile data saving
4. Multi-user support

---

## IMPLEMENTATION APPROACH

### Option 1: LocalStorage Only (Simplest - Recommended for Free Hosting)
- **Pros:** No backend needed, works offline, completely free
- **Cons:** Data stored only in browser, per device
- **Use Case:** Perfect for free hosting (GitHub Pages, Netlify, Vercel)

### Option 2: Firebase (Easy Backend)
- **Pros:** Real database, cross-device sync, free tier
- **Cons:** Requires Firebase setup
- **Use Case:** For more serious deployments

### Option 3: Custom Backend
- **Pros:** Full control
- **Cons:** Requires server hosting
- **Use Case:** For advanced needs

---

## CODE MODIFICATIONS NEEDED

### 1. Add Auth HTML (Before `<div id="screen-home">`)

```html
<!-- LOGIN/SIGNUP SCREEN -->
<div id="screen-auth" class="screen active">
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px">
    <div class="card" style="max-width:400px;width:100%;padding:40px">
      <div style="text-align:center;margin-bottom:30px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:2px;color:var(--accent);margin-bottom:8px">FIT<span style="color:var(--accent2)">FORGE</span></div>
        <div style="color:var(--muted);font-size:13px">Smart Gym & Diet Planner</div>
      </div>

      <!-- SIGNUP TAB -->
      <div id="auth-signup-form">
        <h2 style="text-align:center;margin-bottom:20px;font-size:18px">Create Account</h2>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" id="auth-signup-email" type="email" placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="auth-signup-password" type="password" placeholder="Min 6 characters">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input class="form-input" id="auth-signup-confirm" type="password" placeholder="Confirm password">
        </div>
        <div id="auth-signup-error" style="color:var(--red);font-size:12px;margin-bottom:12px"></div>
        <button class="btn-primary btn-full" onclick="handleSignup()">🚀 Create Account</button>
        <div style="text-align:center;margin-top:12px">
          <span style="color:var(--muted);font-size:12px">Already have an account? </span>
          <button style="background:none;border:none;color:var(--accent);cursor:pointer;font-weight:700;font-size:12px" onclick="toggleAuthMode()">Login</button>
        </div>
      </div>

      <!-- LOGIN TAB -->
      <div id="auth-login-form" style="display:none">
        <h2 style="text-align:center;margin-bottom:20px;font-size:18px">Login</h2>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" id="auth-login-email" type="email" placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="auth-login-password" type="password" placeholder="Your password">
        </div>
        <div id="auth-login-error" style="color:var(--red);font-size:12px;margin-bottom:12px"></div>
        <button class="btn-primary btn-full" onclick="handleLogin()">🔓 Login</button>
        <div style="text-align:center;margin-top:12px">
          <span style="color:var(--muted);font-size:12px">No account? </span>
          <button style="background:none;border:none;color:var(--accent);cursor:pointer;font-weight:700;font-size:12px" onclick="toggleAuthMode()">Sign Up</button>
        </div>
      </div>

      <!-- GUEST MODE OPTION -->
      <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
        <div style="color:var(--muted);font-size:11px;margin-bottom:8px">Or continue as guest</div>
        <button class="btn-secondary btn-full" style="margin-left:0" onclick="loginAsGuest()">Continue as Guest</button>
        <div style="color:var(--muted);font-size:10px;margin-top:8px">(Data saved locally, lost on browser clear)</div>
      </div>
    </div>
  </div>
</div>
```

---

### 2. Update Header (Add Logout & User Display)

**Replace:** The existing `<header class="site-header">` section

```html
<header class="site-header">
  <a class="logo" onclick="showScreen('home')">FIT<span>FORGE</span></a>
  <nav class="nav-tabs" id="desktop-nav">
    <button class="nav-tab active" onclick="showScreen('home')">Home</button>
    <button class="nav-tab" onclick="showScreen('profile')">Profile</button>
    <button class="nav-tab" onclick="showScreen('gym')">Gym Tracker</button>
    <button class="nav-tab" onclick="showScreen('diet')">Diet Plan</button>
    <button class="nav-tab" onclick="showScreen('recovery')">Recovery</button>
    <button class="nav-tab" onclick="showScreen('myths')">Myths</button>
  </nav>
  <div style="display:flex;align-items:center;gap:12px">
    <span id="auth-user-display" style="font-size:11px;color:var(--muted)"></span>
    <button id="logout-btn" style="background:rgba(255,68,102,.15);border:1px solid rgba(255,68,102,.3);color:var(--red);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;display:none" onclick="logout()">Logout</button>
  </div>
</header>
```

---

### 3. Add JavaScript Functions (Add to `<script>` section)

**Add these functions right after the DATA section (after line 623):**

```javascript
// ============================================================
// AUTHENTICATION & DATA PERSISTENCE
// ============================================================

let currentUser = null;

// Initialize on page load
function initAuth() {
  const savedUser = localStorage.getItem('fitforge_user');
  const savedSession = localStorage.getItem('fitforge_session');
  
  if (savedSession && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      loadUserData();
      showMainApp();
    } catch(e) {
      showAuthScreen();
    }
  } else {
    showAuthScreen();
  }
}

function showAuthScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-auth').classList.add('active');
  document.getElementById('desktop-nav').style.display = 'none';
}

function showMainApp() {
  document.getElementById('screen-auth').style.display = 'none';
  document.getElementById('desktop-nav').style.display = 'flex';
  updateAuthDisplay();
  showScreen('home');
}

function toggleAuthMode() {
  document.getElementById('auth-signup-form').style.display = 
    document.getElementById('auth-signup-form').style.display === 'none' ? 'block' : 'none';
  document.getElementById('auth-login-form').style.display = 
    document.getElementById('auth-login-form').style.display === 'none' ? 'block' : 'none';
}

function handleSignup() {
  const email = document.getElementById('auth-signup-email').value.trim();
  const password = document.getElementById('auth-signup-password').value;
  const confirm = document.getElementById('auth-signup-confirm').value;
  const errorEl = document.getElementById('auth-signup-error');

  errorEl.textContent = '';

  // Validation
  if (!email || !password || !confirm) {
    errorEl.textContent = '❌ All fields required';
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorEl.textContent = '❌ Invalid email format';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = '❌ Password min 6 characters';
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = '❌ Passwords do not match';
    return;
  }

  // Check if user exists
  const allUsers = JSON.parse(localStorage.getItem('fitforge_users') || '{}');
  if (allUsers[email]) {
    errorEl.textContent = '❌ Email already registered';
    return;
  }

  // Create user (in production, hash password with bcrypt)
  const newUser = {
    email,
    password: btoa(password), // Simple encoding (NOT secure! For demo only)
    createdAt: new Date().toISOString(),
    id: Date.now()
  };

  allUsers[email] = newUser;
  localStorage.setItem('fitforge_users', JSON.stringify(allUsers));

  // Auto login
  currentUser = { email, id: newUser.id };
  localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
  localStorage.setItem('fitforge_session', 'active');

  // Initialize empty data for new user
  initializeUserData();
  showMainApp();
}

function handleLogin() {
  const email = document.getElementById('auth-login-email').value.trim();
  const password = document.getElementById('auth-login-password').value;
  const errorEl = document.getElementById('auth-login-error');

  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = '❌ Email and password required';
    return;
  }

  const allUsers = JSON.parse(localStorage.getItem('fitforge_users') || '{}');
  const user = allUsers[email];

  if (!user || btoa(password) !== user.password) {
    errorEl.textContent = '❌ Invalid email or password';
    return;
  }

  currentUser = { email, id: user.id };
  localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
  localStorage.setItem('fitforge_session', 'active');

  loadUserData();
  showMainApp();
}

function loginAsGuest() {
  currentUser = { email: 'Guest', id: 'guest_' + Date.now() };
  localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
  localStorage.setItem('fitforge_session', 'active');
  
  initializeUserData();
  showMainApp();
}

function logout() {
  if (confirm('Logout? Your data will be saved.')) {
    saveUserData();
    localStorage.removeItem('fitforge_session');
    currentUser = null;
    showAuthScreen();
  }
}

function updateAuthDisplay() {
  const display = document.getElementById('auth-user-display');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (currentUser) {
    display.textContent = `👤 ${currentUser.email}`;
    logoutBtn.style.display = 'block';
  }
}

// ============================================================
// DATA PERSISTENCE
// ============================================================

function getUserStorageKey() {
  return `fitforge_data_${currentUser.id}`;
}

function initializeUserData() {
  const key = getUserStorageKey();
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({
      profile: {},
      foodLog: [],
      pplChecked: { push: {}, pull: {}, legs: {} },
      workoutHistory: []
    }));
  }
}

function saveUserData() {
  if (!currentUser) return;
  
  const key = getUserStorageKey();
  const data = {
    profile: {
      name: document.getElementById('p-name')?.value || '',
      age: document.getElementById('p-age')?.value || '',
      weight: document.getElementById('p-weight')?.value || '',
      height: document.getElementById('p-height')?.value || '',
      gender: document.querySelector('#screen-profile .tag-group .tag.selected[onclick*="gender"]')?.textContent || '',
      level: document.querySelector('#screen-profile .tag-group .tag.selected[onclick*="level"]')?.textContent || '',
      goal: document.querySelector('#screen-profile .tag-group .tag.selected[onclick*="goal"]')?.textContent || '',
      injuries: [...document.querySelectorAll('#screen-profile .tag-group .tag.selected[onclick*="toggleTag"]')].map(t => t.textContent).join(', '),
      diet: document.querySelector('#screen-profile .tag-group .tag.selected[onclick*="diet"]')?.textContent || ''
    },
    foodLog: foodLog,
    pplChecked: pplChecked,
    workoutHistory: [],
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(key, JSON.stringify(data));
}

function loadUserData() {
  if (!currentUser) return;
  
  const key = getUserStorageKey();
  const data = JSON.parse(localStorage.getItem(key) || 'null');
  
  if (!data) {
    initializeUserData();
    return;
  }

  // Load profile
  if (data.profile) {
    const p = data.profile;
    document.getElementById('p-name').value = p.name || '';
    document.getElementById('p-age').value = p.age || '';
    document.getElementById('p-weight').value = p.weight || '';
    document.getElementById('p-height').value = p.height || '';
  }

  // Load food log
  foodLog = data.foodLog || [];
  
  // Load PPL progress
  pplChecked = data.pplChecked || { push: {}, pull: {}, legs: {} };
}

// Auto-save on every major change
function autoSave() {
  if (currentUser && currentUser.email !== 'Guest') {
    saveUserData();
  }
}

// Save before page unload
window.addEventListener('beforeunload', () => {
  if (currentUser) saveUserData();
});
```

---

### 4. Update Initialization

**Replace the last line `renderMyths();` with:**

```javascript
// Initialize app
initAuth();
renderMyths();
renderRecovery();

// Auto-save every 30 seconds
setInterval(autoSave, 30000);
```

---

## MODIFICATIONS TO EXISTING FUNCTIONS

### Update `calcBMI()`
Add at end: `autoSave();`

### Update `toggleExercise()`
Add at end: `autoSave();`

### Update `addFood()`
Add before `updateNutritionDisplay()`: `autoSave();`

### Update `removeFood()`
Add at end: `autoSave();`

### Update `clearFoodLog()`
Add before `updateNutritionDisplay()`: `autoSave();`

---

## FREE HOSTING OPTIONS

### 1. **GitHub Pages** (Recommended)
- Free, unlimited bandwidth
- Perfect for static HTML files
- No backend needed
- Setup: Push to GitHub, enable Pages in settings

```bash
# Steps:
1. Create GitHub account (free)
2. Create new repository: fitforge-app
3. Upload gym-planner.html
4. Settings → Pages → Enable
5. Access: yourusername.github.io/fitforge-app
```

### 2. **Netlify** (Very Easy)
- Free tier: 100GB/month
- Drag-and-drop deployment
- Auto-SSL certificates
- Setup: Drop HTML file on Netlify

```
1. Go to netlify.com
2. Sign in with GitHub
3. Drag gym-planner.html
4. Auto-generated URL provided
```

### 3. **Vercel** (Easy)
- Free tier: unlimited deployments
- Optimized for speed
- Auto-HTTPS
- Setup: Import GitHub repo

### 4. **Firebase Hosting** (With Backend)
- Free tier: 1GB storage, 10GB/month bandwidth
- Real database included
- Setup requires npm

---

## STORAGE LIMITS

| Platform | Storage | Notes |
|----------|---------|-------|
| LocalStorage (Browser) | 5-10MB | Per domain, per browser |
| GitHub Pages | Unlimited | Static files only |
| Netlify | Unlimited CDN | Free 100GB/month |
| Firebase | 1GB | Free tier |

---

## SECURITY NOTES

⚠️ **Important:**
1. **Never store passwords plain text** (current implementation uses simple base64)
2. For production: Use proper hashing (bcrypt) or Firebase Auth
3. HTTPS is required for login
4. Consider rate limiting for signup/login

---

## EXAMPLE: COMPLETE AUTH SECTION

Here's the minimal setup in one code block:

```javascript
// Minimal Auth Setup
let currentUser = null;

function initAuth() {
  const user = localStorage.getItem('fitforge_user');
  currentUser = user ? JSON.parse(user) : null;
  currentUser ? showApp() : showLogin();
}

function loginUser(email, password) {
  currentUser = { email, id: Date.now() };
  localStorage.setItem('fitforge_user', JSON.stringify(currentUser));
  localStorage.setItem(`user_${currentUser.id}`, JSON.stringify({
    profile: {}, foodLog: [], pplChecked: {}
  }));
  showApp();
}

function logout() {
  localStorage.removeItem('fitforge_user');
  currentUser = null;
  showLogin();
}

function saveUserData() {
  if (!currentUser) return;
  localStorage.setItem(`user_${currentUser.id}`, JSON.stringify({
    profile: getProfileData(),
    foodLog: foodLog,
    pplChecked: pplChecked
  }));
}

window.addEventListener('beforeunload', saveUserData);
```

---

## TESTING CHECKLIST

- [ ] Signup creates new user
- [ ] Login authenticates correctly
- [ ] Profile data saves per user
- [ ] Food log saves per user
- [ ] PPL progress saves per user
- [ ] Logout clears session
- [ ] New user sees empty data
- [ ] Returning user sees saved data
- [ ] Guest mode works (data not persistent)
- [ ] Works offline (after initial load)
- [ ] Multiple users can switch (clear data, login as different user)

---

## NEXT STEPS

1. **For Free Hosting:** Deploy to GitHub Pages or Netlify
2. **For Scale:** Add Firebase backend
3. **For Security:** Implement proper authentication
4. **For Features:** Add cloud sync, group workouts, social sharing

---

**This implementation provides a fully functional, free, multi-user fitness app with data persistence!**
