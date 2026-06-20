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

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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
  if (boardRealtimeChannel || isGuest || !currentUser) return;
  try {
    boardRealtimeChannel = sb
      .channel('community_messages_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages' }, () => {
        loadBoardMessages();
      })
      .subscribe();
  } catch (e) { console.error('Realtime subscribe error:', e); }

  // Polling fallback — guarantees new messages show up even if realtime
  // isn't properly configured on the Supabase project. Only runs while
  // the community screen is the active screen.
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

async function openDMThread(otherUserId) {
  currentDMThread = otherUserId;
  document.getElementById('dm-conversation-list').style.display = 'none';
  document.getElementById('dm-thread-view').style.display = 'block';

  const { data } = await sb
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUser.id})`)
    .order('created_at', { ascending: true });

  const msgs = data || [];
  const headerEl = document.getElementById('dm-thread-header');
  if (headerEl) headerEl.textContent = msgs[0]?.display_name || 'Conversation';

  const threadEl = document.getElementById('dm-thread-messages');
  threadEl.innerHTML = msgs.map(m => {
    const isMine = m.sender_id === currentUser.id;
    return `<div style="background:${isMine?'rgba(240,255,68,.08)':'var(--bg3)'};border:1px solid ${isMine?'rgba(240,255,68,.2)':'var(--border)'};border-radius:10px;padding:8px 12px;max-width:80%;${isMine?'align-self:flex-end':''}">${escapeHtml(m.message)}</div>`;
  }).join('');
  threadEl.scrollTop = threadEl.scrollHeight;
}

function closeDMThread() {
  currentDMThread = null;
  document.getElementById('dm-thread-view').style.display = 'none';
  loadDMConversations();
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
  openDMThread(currentDMThread);
}

// ── BLOCK USER ───────────────────────────────────────────────
async function blockUser(userId) {
  if (!confirm('Block this user? You will no longer see their messages.')) return;
  await sb.from('user_blocks').insert({ blocker_id: currentUser.id, blocked_id: userId });
  blockedUserIds.push(userId);
  loadBoardMessages();
}
