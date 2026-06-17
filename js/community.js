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
        <span style="font-size:12px;font-weight:700;color:${isMine ? 'var(--accent)' : 'var(--accent2)'}">${escapeHtml(m.display_name || 'Anonymous Lifter')}</span>
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

// ── REALTIME SUBSCRIPTION ───────────────────────────────────
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
