// ============================================================
// COMMUNITY CHAT — Public Board + Private DMs
// ============================================================

let boardMessages = [];
let blockedUserIds = [];
let dmConversations = {}; // { otherUserId: { name, messages: [] } }
let currentDMThread = null;
let lastBoardSendTime = 0;
let boardRealtimeChannel = null;
let dmRealtimeChannel = null;

function getMyDisplayName() {
  if (isGuest) return 'Guest Lifter';
  const profileName = document.getElementById('p-name')?.value;
  return profileName || 'Anonymous Lifter';
}

// ── PUBLIC BOARD ─────────────────────────────────────────────
async function loadBoardMessages() {
  const container = document.getElementById('board-messages');
  if (!container) return;
  if (isGuest) {
    container.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:13px;padding:30px 10px">💬 Create an account to join the community chat — guests can't send or view messages.</div>`;
    return;
  }
  try {
    const { data, error } = await sb
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      container.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">Chat is still being set up — check back soon!</div>`;
      return;
    }
    boardMessages = (data || []).filter(m => !blockedUserIds.includes(m.user_id));
    renderBoardMessages();
  } catch (e) {
    console.error('loadBoardMessages error:', e);
    container.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">Chat unavailable right now.</div>`;
  }
}

function renderBoardMessages() {
  const container = document.getElementById('board-messages');
  if (!container) return;
  if (!boardMessages.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:13px;padding:30px 10px">No messages yet — be the first to say hi! 👋</div>`;
    return;
  }
  container.innerHTML = boardMessages.map(m => {
    const isMine = currentUser && m.user_id === currentUser.id;
    const time = new Date(m.created_at).toLocaleTimeString('en-IN', {hour:'numeric',minute:'2-digit'});
    return `
    <div style="background:${isMine ? 'rgba(240,255,68,.08)' : 'var(--bg3)'};border:1px solid ${isMine ? 'rgba(240,255,68,.2)' : 'var(--border)'};border-radius:10px;padding:10px 12px;${isMine ? 'align-self:flex-end;max-width:85%' : 'max-width:85%'}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:3px">
        <span onclick="${!isMine ? `openUserMenu('${m.user_id}','${escapeHtml(m.display_name||'Anonymous Lifter').replace(/'/g,"\\'")}',this)` : ''}" style="font-size:12px;font-weight:700;color:${isMine ? 'var(--accent)' : 'var(--accent2)'};${!isMine ? 'cursor:pointer;text-decoration:underline dotted' : ''}">${escapeHtml(m.display_name || 'Anonymous Lifter')}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-size:10px;color:var(--muted)">${time}</span>
          ${!isMine ? `<button onclick="reportMessage('${m.id}','${escapeHtml(m.message).replace(/'/g,"\\'")}')" title="Report" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px;padding:0">🚩</button>` : `<button onclick="deleteBoardMessage('${m.id}')" title="Delete" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px;padding:0">✕</button>`}
        </div>
      </div>
      <div style="font-size:13px;line-height:1.4;word-break:break-word">${escapeHtml(m.message)}</div>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendBoardMessage() {
  if (isGuest) { alert('Create an account to send messages!'); return; }
  const input = document.getElementById('board-input');
  const cooldownEl = document.getElementById('board-cooldown');
  const text = input?.value.trim();
  if (!text) return;

  // Basic client-side rate limit — not robust security, just a deterrent
  const now = Date.now();
  if (now - lastBoardSendTime < 3000) {
    if (cooldownEl) { cooldownEl.style.display = 'block'; setTimeout(() => cooldownEl.style.display = 'none', 2000); }
    return;
  }
  lastBoardSendTime = now;

  const newMsg = {
    user_id: currentUser.id,
    display_name: getMyDisplayName(),
    message: text.slice(0, 500)
  };

  input.value = '';
  const { error } = await sb.from('community_messages').insert(newMsg);
  if (error) {
    console.error('sendBoardMessage error:', error.message);
    alert('Message failed to send — chat may still be setting up.');
    return;
  }
  // Realtime subscription will pick up the new message; fallback reload just in case
  setTimeout(loadBoardMessages, 400);
}

async function deleteBoardMessage(id) {
  if (!confirm('Delete this message?')) return;
  await sb.from('community_messages').delete().eq('id', id);
  loadBoardMessages();
}

function reportMessage(messageId, messageText) {
  const reason = prompt('Why are you reporting this message?\n(e.g. Spam, Harassment, Inappropriate, Other)');
  if (!reason) return;
  sb.from('message_reports').insert({
    reporter_id: currentUser.id,
    reported_message_id: messageId,
    reported_message_text: messageText,
    reason
  }).then(({error}) => {
    if (error) console.error('Report error:', error.message);
    else alert('Thanks — this has been reported.');
  });
}

// ── USER SEARCH (find anyone, even if never posted in chat) ──
let _userSearchTimer = null;
function searchUsers() {
  clearTimeout(_userSearchTimer);
  _userSearchTimer = setTimeout(_doSearchUsers, 250);
}

async function _doSearchUsers() {
  const q = document.getElementById('user-search-input')?.value?.trim();
  const resultsEl = document.getElementById('user-search-results');
  if (!resultsEl) return;
  if (!q || q.length < 1) { resultsEl.style.display = 'none'; return; }
  if (isGuest) { resultsEl.style.display = 'block'; resultsEl.innerHTML = `<div style="padding:14px;font-size:12px;color:var(--muted);text-align:center">Create an account to search and message other users.</div>`; return; }

  try {
    const { data, error } = await sb
      .from('public_routines')
      .select('user_id, display_name')
      .ilike('display_name', `%${q}%`)
      .neq('user_id', currentUser.id)
      .limit(15);

    if (error || !data || !data.length) {
      resultsEl.style.display = 'block';
      resultsEl.innerHTML = `<div style="padding:14px;font-size:12px;color:var(--muted);text-align:center">No users found matching "${escapeHtml(q)}"</div>`;
      return;
    }

    resultsEl.style.display = 'block';
    resultsEl.innerHTML = data.map(u => `
      <div onclick="openUserMenuFromSearch('${u.user_id}','${escapeHtml(u.display_name||'Anonymous Lifter').replace(/'/g,"\\'")}')" style="display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;border-bottom:1px solid var(--border)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">💪</div>
        <div style="font-size:13px;font-weight:600">${escapeHtml(u.display_name || 'Anonymous Lifter')}</div>
      </div>`).join('');
  } catch (e) {
    console.error('searchUsers error:', e);
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = `<div style="padding:14px;font-size:12px;color:var(--muted);text-align:center">Search unavailable right now.</div>`;
  }
}

function openUserMenuFromSearch(userId, displayName) {
  document.getElementById('user-search-results').style.display = 'none';
  document.getElementById('user-search-input').value = '';
  // Reuse the same menu as chat usernames, anchored near the search bar
  const anchor = document.getElementById('user-search-input');
  openUserMenu(userId, displayName, anchor);
}

// ── PUBLIC ROUTINE SHARING ────────────────────────────────────
// ── GLOBAL DM NOTIFICATIONS (toast + persistent badge) ───────
let globalDMPollInterval = null;
let lastSeenDMIds = new Set();
let dmToastTimeout = null;
let toastSwipeStartX = null;
let toastFromUserId = null;

function startGlobalDMPolling() {
  if (globalDMPollInterval || isGuest || !currentUser) return;
  // Prime lastSeenDMIds with existing messages so we don't toast on page load for old messages
  primeSeenDMIds().then(() => {
    globalDMPollInterval = setInterval(checkForNewDMs, 9000); // lighter than in-screen polling
  });
}

function stopGlobalDMPolling() {
  if (globalDMPollInterval) { clearInterval(globalDMPollInterval); globalDMPollInterval = null; }
}

async function primeSeenDMIds() {
  if (!currentUser) return;
  try {
    const { data } = await sb
      .from('direct_messages')
      .select('id')
      .eq('recipient_id', currentUser.id);
    (data || []).forEach(m => lastSeenDMIds.add(m.id));
  } catch (e) { console.error('primeSeenDMIds error:', e); }
}

async function checkForNewDMs() {
  if (!currentUser || isGuest) return;
  try {
    const { data, error } = await sb
      .from('direct_messages')
      .select('*')
      .eq('recipient_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data) return;

    const newOnes = data.filter(m => !lastSeenDMIds.has(m.id));
    newOnes.forEach(m => lastSeenDMIds.add(m.id));

    if (newOnes.length) {
      // Show badge (persists until Community/Messages opened)
      showDMBadge();
      // Show toast for the most recent new message only (don't stack)
      const latest = newOnes[0];
      showDMToast(latest.display_name || 'Someone', latest.message, latest.sender_id);
    }
  } catch (e) { console.error('checkForNewDMs error:', e); }
}

function showDMBadge() {
  const desktopBadge = document.getElementById('dm-badge-desktop');
  const mobileBadge = document.getElementById('dm-badge-mobile');
  if (desktopBadge) desktopBadge.style.display = 'block';
  if (mobileBadge) mobileBadge.style.display = 'block';
}

function clearDMBadge() {
  const desktopBadge = document.getElementById('dm-badge-desktop');
  const mobileBadge = document.getElementById('dm-badge-mobile');
  if (desktopBadge) desktopBadge.style.display = 'none';
  if (mobileBadge) mobileBadge.style.display = 'none';
}

function showDMToast(name, text, senderId) {
  const toast = document.getElementById('dm-toast');
  if (!toast) return;
  toastFromUserId = senderId;
  document.getElementById('dm-toast-name').textContent = name;
  document.getElementById('dm-toast-text').textContent = text;

  // Reset any in-progress swipe/animation
  toast.style.transition = 'opacity .25s, transform .25s';
  toast.style.transform = 'translateX(-50%) translateY(-20px)';
  toast.style.opacity = '0';
  toast.style.display = 'block';

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  clearTimeout(dmToastTimeout);
  dmToastTimeout = setTimeout(() => hideDMToast(), 2000);
}

function hideDMToast() {
  const toast = document.getElementById('dm-toast');
  if (!toast) return;
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(-50%) translateY(-20px)';
  setTimeout(() => { toast.style.display = 'none'; }, 250);
}

function goToDMFromToast() {
  hideDMToast();
  if (!toastFromUserId) return;
  showScreen('community');
  setTimeout(() => startDMFromMenu(toastFromUserId, document.getElementById('dm-toast-name')?.textContent || 'User'), 200);
}

// Swipe-to-dismiss for the toast
document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('dm-toast');
  if (!toast) return;

  toast.addEventListener('touchstart', (e) => {
    toastSwipeStartX = e.touches[0].clientX;
    clearTimeout(dmToastTimeout); // pause auto-hide while interacting
  }, { passive: true });

  toast.addEventListener('touchmove', (e) => {
    if (toastSwipeStartX === null) return;
    const dx = e.touches[0].clientX - toastSwipeStartX;
    toast.style.transition = 'none';
    toast.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(0)`;
    toast.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 200));
  }, { passive: true });

  toast.addEventListener('touchend', (e) => {
    if (toastSwipeStartX === null) return;
    const dx = (e.changedTouches[0]?.clientX || 0) - toastSwipeStartX;
    toastSwipeStartX = null;
    toast.style.transition = 'opacity .2s, transform .2s';
    if (Math.abs(dx) > 80) {
      // swiped far enough — dismiss
      toast.style.transform = `translateX(calc(-50% + ${dx > 0 ? 400 : -400}px)) translateY(0)`;
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 200);
    } else {
      // snap back and resume auto-hide timer
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
      dmToastTimeout = setTimeout(() => hideDMToast(), 1500);
    }
  });
});

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function syncPublicRoutine() {
  if (!currentUser || isGuest) return;
  try {
    const hideRoutine = document.getElementById('privacy-hide-routine')?.checked || false;
    const hideStats = document.getElementById('privacy-hide-stats')?.checked || false;
    await sb.from('public_routines').upsert({
      user_id: currentUser.id,
      display_name: getMyDisplayName(),
      experience_level: typeof getExperienceLevel === 'function' ? getExperienceLevel() : 'intermediate',
      custom_exercises: customExercises || {},
      hide_routine: hideRoutine,
      hide_stats: hideStats,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('syncPublicRoutine error:', e);
  }
}

async function viewPartnerRoutine(userId, displayName) {
  closeUserMenu();
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9600;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `<div class="card" style="max-width:380px;width:100%;max-height:80vh;overflow-y:auto;position:relative">
    <button onclick="this.closest('div[style*=fixed]').remove()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">✕</button>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;margin-bottom:4px">💪 ${escapeHtml(displayName)}'s Routine</div>
    <div id="partner-routine-content" style="margin-top:14px;font-size:12px;color:var(--muted);text-align:center;padding:20px">Loading...</div>
  </div>`;
  document.body.appendChild(modal);

  const { data, error } = await sb.from('public_routines').select('*').eq('user_id', userId).single();
  const contentEl = modal.querySelector('#partner-routine-content');
  if (error || !data) {
    contentEl.innerHTML = `<div style="padding:20px">This user hasn't set up a routine yet, or hasn't saved their profile.</div>`;
    return;
  }

  if (data.hide_routine) {
    contentEl.innerHTML = `<div style="padding:20px">🔒 This user has kept their routine private.</div>`;
    return;
  }

  const levelLabel = { beginner: '🌱 Beginner', intermediate: '⚙️ Intermediate', advanced: '🔥 Advanced' }[data.experience_level] || data.experience_level;
  const customs = data.custom_exercises || {};
  const hasCustom = ['push','pull','legs'].some(d => customs[d]?.length);

  contentEl.innerHTML = `
    <div style="text-align:left">
      <div style="display:inline-block;background:var(--bg3);border:1px solid var(--border);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px">${levelLabel}</div>
      ${hasCustom ? ['push','pull','legs'].map(day => {
        if (!customs[day]?.length) return '';
        const dayLabel = {push:'💪 Push',pull:'🔥 Pull',legs:'🦵 Legs'}[day];
        return `<div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:6px">${dayLabel} — Custom Additions</div>
          ${customs[day].map(ex => `<div style="font-size:12px;padding:6px 10px;background:var(--bg3);border-radius:6px;margin-bottom:4px">${escapeHtml(ex.name)} — ${escapeHtml(ex.sets)}×${escapeHtml(ex.reps)}</div>`).join('')}
        </div>`;
      }).join('') : `<div style="font-size:12px;color:var(--muted);padding:10px 0">Following the standard FitForge ${levelLabel} programme — no custom exercises added yet.</div>`}
    </div>`;
}

// ── USER MENU (tap username in chat) ─────────────────────────
function openUserMenu(userId, displayName, anchorEl) {
  closeUserMenu(); // close any existing menu first
  const menu = document.createElement('div');
  menu.id = 'user-action-menu';
  menu.style.cssText = `position:fixed;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:6px;z-index:9500;box-shadow:0 8px 24px rgba(0,0,0,.4);min-width:160px`;
  menu.innerHTML = `
    <div style="padding:8px 10px;font-size:12px;font-weight:700;color:var(--accent2);border-bottom:1px solid var(--border);margin-bottom:4px">${escapeHtml(displayName)}</div>
    <button onclick="viewUserProfile('${userId}','${displayName.replace(/'/g,"\\'")}')" style="width:100%;text-align:left;background:none;border:none;color:var(--text);padding:8px 10px;font-size:13px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">👤 View Profile</button>
    <button onclick="viewPartnerRoutine('${userId}','${displayName.replace(/'/g,"\\'")}')" style="width:100%;text-align:left;background:none;border:none;color:var(--text);padding:8px 10px;font-size:13px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">💪 View Routine</button>
    <button onclick="startDMFromMenu('${userId}','${displayName.replace(/'/g,"\\'")}')" style="width:100%;text-align:left;background:none;border:none;color:var(--text);padding:8px 10px;font-size:13px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">✉️ Message</button>
    <button onclick="blockUser('${userId}')" style="width:100%;text-align:left;background:none;border:none;color:#ff4466;padding:8px 10px;font-size:13px;cursor:pointer;border-radius:6px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">🚫 Block User</button>
  `;
  document.body.appendChild(menu);

  // Position near the clicked username, keep on-screen
  const rect = anchorEl.getBoundingClientRect();
  const menuWidth = 170;
  let left = rect.left;
  if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 10;
  menu.style.left = left + 'px';
  menu.style.top = (rect.bottom + 6) + 'px';

  // Close when tapping outside
  setTimeout(() => document.addEventListener('click', closeUserMenuOnOutsideClick), 10);
}

function closeUserMenuOnOutsideClick(e) {
  const menu = document.getElementById('user-action-menu');
  if (menu && !menu.contains(e.target)) closeUserMenu();
}

function closeUserMenu() {
  const menu = document.getElementById('user-action-menu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeUserMenuOnOutsideClick);
}

function viewUserProfile(userId, displayName) {
  closeUserMenu();
  // We don't have a public profiles table — show what's available from chat history
  const userMsgCount = boardMessages.filter(m => m.user_id === userId).length;
  const firstMsg = boardMessages.find(m => m.user_id === userId);
  const joinedDate = firstMsg ? new Date(firstMsg.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'Unknown';

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9600;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="card" style="max-width:320px;width:100%;text-align:center;position:relative">
      <button onclick="this.closest('div[style*=fixed]').remove()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">✕</button>
      <div style="width:64px;height:64px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px">💪</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;margin-bottom:4px">${escapeHtml(displayName)}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:18px">FitForge Community Member</div>
      <div style="display:flex;justify-content:center;gap:24px;margin-bottom:18px">
        <div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--accent)">${userMsgCount}</div><div style="font-size:10px;color:var(--muted)">MESSAGES</div></div>
        <div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--accent2)">${joinedDate}</div><div style="font-size:10px;color:var(--muted)">FIRST SEEN</div></div>
      </div>
      <button class="btn-primary" style="width:100%" onclick="this.closest('div[style*=fixed]').remove(); startDMFromMenu('${userId}','${displayName.replace(/'/g,"\\'")}')">✉️ Send Message</button>
    </div>`;
  document.body.appendChild(modal);
}

function startDMFromMenu(userId, displayName) {
  closeUserMenu();
  // Switch to DM tab and open thread with this user
  const dmTabBtn = document.querySelector('.community-tab:nth-child(2)');
  if (dmTabBtn) switchCommunityTab('dms', dmTabBtn);
  setTimeout(() => {
    document.getElementById('dm-conversation-list').style.display = 'none';
    document.getElementById('dm-thread-view').style.display = 'block';
    currentDMThread = userId;
    const headerEl = document.getElementById('dm-thread-header');
    if (headerEl) headerEl.textContent = displayName;
    const threadEl = document.getElementById('dm-thread-messages');
    if (threadEl) threadEl.innerHTML = '';
    openDMThread(userId);
  }, 150);
}

// ── REALTIME SUBSCRIPTION (+ polling fallback) ──────────────
let boardPollInterval = null;

function subscribeToBoardRealtime() {
  if (isGuest || !currentUser) return;

  if (!boardRealtimeChannel) {
    try {
      boardRealtimeChannel = sb
        .channel('community_messages_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages' }, () => {
          loadBoardMessages();
        })
        .subscribe();
    } catch (e) { console.error('Realtime subscribe error:', e); }
  }

  // Polling fallback — guarantees new messages show up even if realtime
  // isn't properly configured on the Supabase project. Only runs while
  // the community screen is the active screen.
  // BUG FIX: this used to be skipped entirely if boardRealtimeChannel was
  // already set from a previous visit — meaning polling never restarted
  // after navigating away and back to the Community screen.
  if (boardPollInterval) clearInterval(boardPollInterval);
  boardPollInterval = setInterval(() => {
    const screen = document.getElementById('screen-community');
    if (screen && screen.classList.contains('active') && !isGuest) {
      loadBoardMessages();
    }
  }, 4000); // check every 4 seconds — fast enough to feel responsive, not spammy
}

function stopBoardPolling() {
  if (boardPollInterval) { clearInterval(boardPollInterval); boardPollInterval = null; }
}

// ── TAB SWITCHING ────────────────────────────────────────────
function switchCommunityTab(tab, btn) {
  document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('community-board').style.display = tab === 'board' ? 'block' : 'none';
  document.getElementById('community-dms').style.display = tab === 'dms' ? 'block' : 'none';
  if (tab === 'board') loadBoardMessages();
  if (tab === 'dms') loadDMConversations();
}

// ── DIRECT MESSAGES ──────────────────────────────────────────
async function loadDMConversations() {
  const listEl = document.getElementById('dm-conversation-list');
  const threadEl = document.getElementById('dm-thread-view');
  if (!listEl) return;
  threadEl.style.display = 'none';
  listEl.style.display = 'block';

  if (isGuest) {
    listEl.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:13px;padding:30px 10px">💬 Create an account to send private messages.</div>`;
    return;
  }

  try {
    const { data, error } = await sb
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (error || !data || !data.length) {
      listEl.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:13px;padding:30px 10px">No conversations yet. Reply to someone from the Public Board to start a DM (feature coming — tap a username on the board).</div>`;
      return;
    }

    // Group by other user
    const convos = {};
    data.forEach(m => {
      const otherId = m.sender_id === currentUser.id ? m.recipient_id : m.sender_id;
      if (!convos[otherId]) convos[otherId] = [];
      convos[otherId].push(m);
    });

    listEl.innerHTML = Object.entries(convos).map(([otherId, msgs]) => {
      const last = msgs[0];
      return `<div class="history-item" style="cursor:pointer" onclick="openDMThread('${otherId}')">
        <div class="history-icon">💬</div>
        <div class="history-info">
          <div class="history-type">${escapeHtml(last.display_name || 'User')}</div>
          <div class="history-meta">${escapeHtml((last.message||'').slice(0,40))}${last.message?.length>40?'...':''}</div>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    console.error('loadDMConversations error:', e);
    listEl.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">Messages unavailable right now.</div>`;
  }
}

let dmPollInterval = null;

async function openDMThread(otherUserId) {
  currentDMThread = otherUserId;
  document.getElementById('dm-conversation-list').style.display = 'none';
  document.getElementById('dm-thread-view').style.display = 'block';

  await refreshDMThread(otherUserId);

  // Mark this conversation's messages as read
  try {
    await sb.from('direct_messages').update({ read: true }).eq('sender_id', otherUserId).eq('recipient_id', currentUser.id).eq('read', false);
  } catch (e) { console.error('mark read error:', e); }
  if (typeof clearDMBadge === 'function') clearDMBadge();

  // Poll for new DM replies every 3 seconds while this thread is open
  if (dmPollInterval) clearInterval(dmPollInterval);
  dmPollInterval = setInterval(() => {
    if (currentDMThread === otherUserId) refreshDMThread(otherUserId);
    else clearInterval(dmPollInterval);
  }, 3000);
}

async function refreshDMThread(otherUserId) {
  const { data } = await sb
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUser.id})`)
    .order('created_at', { ascending: true });

  const msgs = data || [];
  const headerEl = document.getElementById('dm-thread-header');
  if (headerEl && !headerEl.textContent) headerEl.textContent = msgs[0]?.display_name || 'Conversation';

  const threadEl = document.getElementById('dm-thread-messages');
  if (!threadEl) return;
  const wasAtBottom = threadEl.scrollHeight - threadEl.scrollTop <= threadEl.clientHeight + 50;
  threadEl.innerHTML = msgs.map(m => {
    const isMine = m.sender_id === currentUser.id;
    return `<div style="background:${isMine?'rgba(240,255,68,.08)':'var(--bg3)'};border:1px solid ${isMine?'rgba(240,255,68,.2)':'var(--border)'};border-radius:10px;padding:8px 12px;max-width:80%;${isMine?'align-self:flex-end':''}">${escapeHtml(m.message)}</div>`;
  }).join('');
  if (wasAtBottom) threadEl.scrollTop = threadEl.scrollHeight;
}

function closeDMThread() {
  currentDMThread = null;
  if (dmPollInterval) { clearInterval(dmPollInterval); dmPollInterval = null; }
  document.getElementById('dm-thread-view').style.display = 'none';
  loadDMConversations();
}

function stopDMPolling() {
  if (dmPollInterval) { clearInterval(dmPollInterval); dmPollInterval = null; }
  currentDMThread = null;
}

async function sendDM() {
  if (!currentDMThread) return;
  const input = document.getElementById('dm-input');
  const text = input?.value.trim();
  if (!text) return;
  input.value = '';

  await sb.from('direct_messages').insert({
    sender_id: currentUser.id,
    recipient_id: currentDMThread,
    display_name: getMyDisplayName(),
    message: text.slice(0, 500)
  });
  refreshDMThread(currentDMThread);
}

// ── BLOCK USER ───────────────────────────────────────────────
async function blockUser(userId) {
  if (!confirm('Block this user? You will no longer see their messages.')) return;
  await sb.from('user_blocks').insert({ blocker_id: currentUser.id, blocked_id: userId });
  blockedUserIds.push(userId);
  loadBoardMessages();
}
