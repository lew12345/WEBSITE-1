/* =========================================================================
   CHEAT CHESS: UI: rendering, animation, input, screens and game flow.
   ========================================================================= */
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UI = {
  busy:false, sel:null, legal:[], pending:null, override:null, viewColor:'w', flip:false,
  epoch:0, log:[], screenStack:['scrTitle'], insp:null, lastMatch:null, playCache:{}, rewards:[],
};
const COLOR_NAME = { w:'Ivory', b:'Obsidian' };

/* ============================================================ utilities */
function h(html){ const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function toast(msg, ms=2400){
  const t = h(`<div class="toast">${msg}</div>`);
  $('#toasts').append(t);
  while ($('#toasts').children.length > 3) $('#toasts').firstElementChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms);
}
function addLog(msg){ UI.log.push(msg); $('#ticker').innerHTML = msg; }
function fillIcons(root=document){ root.querySelectorAll('[data-icon]').forEach(e => { if (!e.dataset.filled) { e.innerHTML = ICON[e.dataset.icon] + e.innerHTML; e.dataset.filled = 1; } }); }
function viewColor(){ return G.mode === 'ai' ? G.humanColor : UI.viewColor; }
function isHumanTurn(){ return !!G && !G.over && (G.mode === 'ai' ? G.state.turn === G.humanColor : UI.viewColor === G.state.turn); }
function alive(ep){ return ep === UI.epoch && G && !G.over; }
function playerName(col){
  if (G.mode === 'ai') return col === G.humanColor ? 'You' : AI_NAMES[G.level].name;
  return COLOR_NAME[col];
}
function playableCached(id, col){
  const key = G.ply + '|' + G.state.turn + '|' + col + '|' + id;
  if (!(key in UI.playCache)) {
    if (Object.keys(UI.playCache).length > 60) UI.playCache = {};
    UI.playCache[key] = cardPlayable(G, id, col);
  }
  return UI.playCache[key];
}

/* ============================================================ card elements */
function makeCard(id, opts={}) {
  const c = CARD_BY_ID[id], sc = SCHOOLS[c.school], rar = RARITY[c.rarity];
  const d = document.createElement('div');
  d.className = 'tcg ' + c.rarity + (c.set === 'relic' ? ' relic' : '') + (opts.compact ? ' compact' : '') + (opts.down ? ' down' : '') + (c.name.length >= 13 ? ' name-long' : '');
  d.style.cssText = `--accent:${sc.accent};--deep:${sc.deep};--mid:${sc.mid};--gem:${rar.gem};` + (opts.cw ? `--cw:${opts.cw}px;` : '');
  d.dataset.card = id;
  d.innerHTML = `<div class="tcg-inner">
    <div class="tcg-face tcg-front"><div class="tcg-body">
      <div class="tcg-head"><span class="tcg-school">${SCHOOL_GLYPH[c.school]}</span><span class="tcg-gem"></span><span class="tcg-copies">${c.set === 'relic' ? 'RELIC' : 'CORE'}</span></div>
      <div class="tcg-art">${cardArt(id)}</div>
      <div class="tcg-ribbon"><span class="tcg-name">${c.name}</span></div>
      <div class="tcg-kind">${c.kind}</div>
      <div class="tcg-type">${sc.name} ${sc.type} &middot; ${c.kind}</div>
      <div class="tcg-text"><div class="tcg-desc">${c.desc}</div><div class="tcg-flavor">${c.flavor}</div></div>
      <div class="tcg-foot"><span>${c.set === 'relic' ? 'Relic' : 'No.'} ${String(c.num).padStart(2,'0')}/${setSize(c.set)}</span><span>${rar.name}</span></div>
    </div></div>
    <div class="tcg-face tcg-back">${CARD_BACK_SVG}</div></div>`;
  return d;
}
/* Shrink a full card's rules text until it fits its parchment box (call once it is in the DOM). */
function fitCardText(card) {
  const t = card.querySelector('.tcg-text');
  if (!t || card.classList.contains('compact')) return;
  let s = 1;
  t.style.fontSize = '';
  while (t.scrollHeight > t.clientHeight + 1 && s > .62) { s -= .04; t.style.fontSize = s + 'em'; }
}
function makeBack(cw) {
  const d = document.createElement('div');
  d.className = 'tcg down';
  if (cw) d.style.setProperty('--cw', cw + 'px');
  d.innerHTML = `<div class="tcg-inner"><div class="tcg-face tcg-front"></div><div class="tcg-face tcg-back">${CARD_BACK_SVG}</div></div>`;
  return d;
}

/* ============================================================ layout */
function layout() {
  /* measure the shell, not the window: on a desktop the game is a capped panel */
  const shell = document.getElementById('app');
  const vw = shell ? shell.clientWidth : window.innerWidth;
  const vh = shell ? shell.clientHeight : window.innerHeight;
  const wide = vw > vh * 1.15 && vw >= 760;
  document.body.classList.toggle('wide', wide);
  let cw, board;
  if (wide) {
    board = Math.min(vh - 80, vw * 0.56, 760);
    cw = Math.max(70, Math.min(128, (vw - board - 110) / 3.4, (vh - 250) / 1.4));
  } else {
    cw = Math.max(64, Math.min(vw * 0.235, 118));
    const fixed = 48 + 48 + 48 + 12 + 26 + 16;
    board = Math.min(vw - 16, vh - fixed - (cw * 1.4 + 24), 640);
    if (board < 300) {
      cw = Math.max(56, cw - (300 - board) / 1.4);
      board = Math.min(vw - 16, vh - fixed - (cw * 1.4 + 24), 640);
    }
    // give any spare height to bigger cards
    const spare = vh - fixed - board - 30;
    cw = Math.max(cw, Math.min(spare / 1.4, (Math.min(vw, 720) - 24) / 3.05, 150));
  }
  board = Math.floor(Math.max(240, board));
  const root = document.documentElement.style;
  root.setProperty('--board', board + 'px');
  root.setProperty('--cw', Math.floor(cw) + 'px');
  root.setProperty('--gcw', Math.floor(Math.min(136, (Math.min(vw, 720) - 48) / 3)) + 'px');
}

/* ============================================================ screens */
function showScreen(id, push=true) {
  closeInspector();
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  if (push && UI.screenStack[UI.screenStack.length-1] !== id) UI.screenStack.push(id);
  document.body.classList.toggle('in-game', id !== 'scrTitle');
  if (id === 'scrCards') renderCards();
  if (id === 'scrSettings') renderSettings();
  if (id === 'scrChallenges') renderChallenges();
  if (id === 'scrLobby') renderLobby();
  if (id === 'scrShop') renderShop();
  if (id === 'scrAvatar') renderAvatarScreen(!Progress.data.avatar);
  if (id === 'scrTitle') updateTitleBadges();
}
function goBack() {
  if (UI.screenStack.length > 1) UI.screenStack.pop();
  showScreen(UI.screenStack[UI.screenStack.length-1], false);
}
function goHome() {
  UI.epoch++;
  UI.screenStack = ['scrTitle'];
  showScreen('scrTitle', false);
  closeModal(); closeInspector(); hideCurtain();
  $('#targetBar').classList.remove('show');
  if (UI.rewards.length) flushRewards();
}

/* ============================================================ title */
function buildTitle() {
  const tc = $('#titleCards');
  ['bomb','kingguard','teleport'].forEach(id => { const c = makeCard(id, { compact:true }); c.classList.add('tc'); tc.append(c); });
  const ff = $('#fireflies');
  for (let i=0;i<16;i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    const rnd = n => (Math.random()*2-1)*n + 'px';
    f.style.cssText = `left:${Math.random()*100}%;top:${35+Math.random()*60}%;--dur:${10+Math.random()*14}s;--bl:${2+Math.random()*3}s;` +
      `--x1:${rnd(60)};--y1:${rnd(50)};--x2:${rnd(70)};--y2:${rnd(60)};--x3:${rnd(50)};--y3:${rnd(40)};animation-delay:${-Math.random()*10}s,${-Math.random()*3}s`;
    ff.append(f);
  }
}

/* ============================================================ board */
function disp(r, c){ return UI.flip ? [7-r, 7-c] : [r, c]; }
function sqEl(r, c){ const [dr, dc] = disp(r, c); return $('#board').children[dr*8+dc]; }
function cellSize(){ return $('#board').clientWidth / 8; }
function sqScreen(r, c) {
  const b = $('#board').getBoundingClientRect(), s = b.width / 8, [dr, dc] = disp(r, c);
  return { x:b.left + (dc+.5)*s, y:b.top + (dr+.5)*s };
}
const WALL_SQ_SVG = `<svg viewBox="0 0 40 40" preserveAspectRatio="none"><rect width="40" height="40" fill="#5a4a36"/>
  <g stroke="#2a2016" stroke-width="1.2">${[[0,0,16],[16,0,24],[0,10,10],[10,10,20],[30,10,10],[0,20,18],[18,20,22],[0,30,12],[12,30,18],[30,30,10]]
  .map(([x,y,w],i)=>`<rect x="${x}" y="${y}" width="${w}" height="10" fill="url(#gStone)" opacity="${.78+(i%3)*.1}"/>`).join('')}</g>
  <rect width="40" height="40" fill="none" stroke="#e8c16a" stroke-width="1.5" opacity=".6"/></svg>`;

function renderBoard(opts={}) {
  const board = $('#board');
  const frag = document.createDocumentFragment();
  const my = viewColor();
  syncWalls(G);
  const turn = G.state.turn;
  const king = !G.over && inCheck(G.state, turn) ? findKing(G.state, turn) : null;
  const pend = UI.pending;
  const tgtCol = pend ? SCHOOLS[CARD_BY_ID[pend.id].school].accent : null;
  board.classList.toggle('board-dim', !!pend);
  board.classList.toggle('tgt-soft', !!pend && pend.targets.length > 24);
  $('.hand-zone').classList.toggle('targeting', !!pend);
  const legalTo = new Map();
  if (UI.sel && Store.settings.hints) for (const m of UI.legal) legalTo.set(m.to.r*8+m.to.c, m);
  for (let dr=0; dr<8; dr++) for (let dc=0; dc<8; dc++) {
    const r = UI.flip ? 7-dr : dr, c = UI.flip ? 7-dc : dc, i = r*8+c;
    const sq = document.createElement('div');
    sq.className = 'sq ' + ((r+c) % 2 ? 'd' : 'l');
    sq.dataset.r = r; sq.dataset.c = c;
    let html = '';
    if (dc === 0) html += `<span class="coord rank">${8-r}</span>`;
    if (dr === 7) html += `<span class="coord file">${'abcdefgh'[c]}</span>`;
    const lm = G.lastMove;
    if (lm && ((lm.from.r===r && lm.from.c===c) || (lm.to.r===r && lm.to.c===c))) sq.classList.add('last');
    if (UI.sel && UI.sel.r===r && UI.sel.c===c) sq.classList.add('sel');
    if (king && king.r===r && king.c===c) sq.classList.add('check');
    const p = UI.override && i in UI.override ? UI.override[i] : G.state.board[i];
    if (p) html += `<div class="piece">${pieceArt(p, setFor(color(p)))}</div>`;
    const wall = G.effects.walls.find(w => w.r===r && w.c===c && G.ply < w.expire);
    if (wall) html += `<div class="fx-wall">${WALL_SQ_SVG}</div><div class="fx-badge">${Math.ceil((wall.expire - G.ply)/2)}</div>`;
    if (p) {
      if (isShielded(G, r, c, color(p))) html += `<div class="fx-shield"></div>`;
      if (isGhost(G, r, c, color(p))) sq.classList.add('ghost');
      if (isFrozen(G, r, c)) html += `<div class="fx-frozen"></div>`;
    }
    if (G.effects.traps.some(t => t.r===r && t.c===c && t.owner===my)) html += `<div class="fx-trap">&#9760;</div>`;
    const lg = legalTo.get(i);
    if (lg) html += `<div class="hint${lg.capture ? ' cap' : ''}"></div>`;
    if (pend) {
      if (pend.targets.some(t => t.r===r && t.c===c)) { sq.classList.add('tgt'); sq.style.setProperty('--tgt', tgtCol); }
      if (pend.picks.some(t => t.r===r && t.c===c)) { sq.classList.add('picked'); sq.style.setProperty('--tgt', tgtCol); }
    }
    sq.innerHTML = html;
    frag.append(sq);
  }
  board.replaceChildren(frag);
  if (opts.anim) animatePieces(opts.anim, opts.dur);
  if (opts.popIn) { const pc = sqEl(opts.popIn.r, opts.popIn.c).querySelector('.piece'); if (pc) pc.classList.add('fx-popin'); }
}
function animatePieces(list, dur=280) {
  const cell = cellSize();
  for (const { from, to } of list) {
    const sq = sqEl(to.r, to.c), pc = sq && sq.querySelector('.piece');
    if (!pc) continue;
    const [fr, fc] = disp(from.r, from.c), [tr, tc] = disp(to.r, to.c);
    sq.style.zIndex = 7;
    const a = pc.animate([
      { transform:`translate(${(fc-tc)*cell}px,${(fr-tr)*cell}px) scale(1.12)` },
      { transform:'translate(0,0) scale(1)' },
    ], { duration:dur, easing:'cubic-bezier(.3,.7,.3,1)' });
    a.onfinish = () => { sq.style.zIndex = ''; };
  }
}

function renderPlayers() {
  const my = viewColor(), op = opp(my);
  const turnActive = !G.over;
  $('#crestMe').innerHTML = avatarNode(avatarFor(my), { ring:false });
  $('#crestOpp').innerHTML = avatarNode(avatarFor(op), { ring:false });
  $('#rowMe').classList.toggle('fighter', true);
  $('#rowOpp').classList.toggle('fighter', true);
  const sub = G.mode === 'ai' ? `<small>${COLOR_NAME[G.humanColor]}</small>` : '';
  $('#nameMe').innerHTML = playerName(my) + sub;
  $('#nameOpp').innerHTML = playerName(op) + (G.mode === 'ai' ? `<small>${AI_NAMES[G.level].title}</small>` : '');
  $('#rowMe').classList.toggle('active', turnActive && G.state.turn === my);
  $('#rowOpp').classList.toggle('active', turnActive && G.state.turn === op);
  const capsHtml = col => { // pieces of `col` that were lost
    const order = 'qrbnp';
    const lost = G.captured[col].slice().sort((a,b) => order.indexOf(a) - order.indexOf(b));
    return lost.map(t => pieceArt(col+t, setFor(col))).join('');
  };
  const adv = materialFor(G, my) / 100;
  $('#capMe').innerHTML = capsHtml(op) + (adv > 0 ? `<span class="adv">+${Math.round(adv)}</span>` : '');
  $('#capOpp').innerHTML = capsHtml(my) + (adv < 0 ? `<span class="adv">+${Math.round(-adv)}</span>` : '');
}

function renderStatus(thinking) {
  const st = $('#status');
  st.classList.remove('check','thinking');
  if (G.over) { st.textContent = 'Game over'; return; }
  const chk = inCheck(G.state, G.state.turn);
  let txt;
  if (G.mode === 'ai') txt = G.state.turn === G.humanColor ? 'Your turn' : AI_NAMES[G.level].short + ' is thinking';
  else txt = COLOR_NAME[G.state.turn] + "'s turn";
  if (UI.pending) txt = 'Casting ' + CARD_BY_ID[UI.pending.id].name;
  if (chk && !UI.pending) { txt += ': Check!'; st.classList.add('check'); }
  if (thinking || (G.mode === 'ai' && G.state.turn === G.aiColor && !chk)) st.classList.add('thinking');
  st.textContent = txt;
}

function renderHands(opts={}) {
  const my = viewColor(), op = opp(my);
  const hand = $('#hand');
  const cards = G.hands[my];
  const n = cards.length;
  const canAct = isHumanTurn() && !UI.busy;
  const cw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 88;
  const overlap = n > 3 ? -cw * (n > 5 ? .42 : .24) : -cw * .06;
  const frag = document.createDocumentFragment();
  cards.forEach((id, i) => {
    const off = i - (n-1)/2;
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.setProperty('--rot', (off * 6) + 'deg');
    slot.style.setProperty('--lift', (Math.abs(off) * Math.abs(off) * 4) + 'px');
    slot.style.margin = `0 ${overlap}px`;
    slot.style.zIndex = i + 1;
    if (opts.hideMine && opts.hideMine.includes(i)) slot.classList.add('hidden');
    const card = makeCard(id, { compact:true, down: !!opts.faceDown });
    slot.append(card);
    if (canAct && !playableCached(id, my).ok) slot.classList.add('unplayable');
    if (UI.pending && UI.pending.slot === i) slot.classList.add('armed');
    slot.addEventListener('click', () => onHandCardTap(i, card));
    frag.append(slot);
  });
  hand.replaceChildren(frag);
  if (!n) hand.innerHTML = '<div class="hand-empty">No cheat cards left</div>';
  hand.classList.toggle('waiting', !isHumanTurn());
  const oh = $('#oppHand');
  const ofrag = document.createDocumentFragment();
  G.hands[op].forEach((_, i) => {
    const b = makeBack(34);
    if (opts.hideOpp && opts.hideOpp.includes(i)) b.style.opacity = 0;
    ofrag.append(b);
  });
  oh.replaceChildren(ofrag);
}

function renderAll(opts={}) {
  renderBoard(opts);
  renderPlayers();
  renderHands(opts);
  renderStatus();
}

/* ============================================================ fx helpers */
function spawnFx(html, r, c, ms=800, scale=1) {
  const cell = cellSize(), [dr, dc] = disp(r, c);
  const d = document.createElement('div');
  d.className = 'fx';
  const s = cell * scale, off = (s - cell) / 2;
  d.style.cssText = `left:${dc*cell - off}px;top:${dr*cell - off}px;width:${s}px;height:${s}px`;
  d.innerHTML = html;
  $('#fxLayer').append(d);
  setTimeout(() => d.remove(), ms);
  return d;
}
function burst(x, y, { count=18, colors=['#fff3c4','#ffd35c','#ffb020'], spread=90, size=[4,9], dur=[500,950], up=0 } = {}) {
  const layer = $('#fxTop');
  for (let i=0;i<count;i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const col = colors[(Math.random()*colors.length)|0];
    const sz = size[0] + Math.random()*(size[1]-size[0]);
    p.style.cssText = `width:${sz}px;height:${sz}px;background:${col};box-shadow:0 0 ${sz*1.5}px ${col}`;
    layer.append(p);
    const a = Math.random()*Math.PI*2, d = spread*(.35 + Math.random()*.65);
    const dx = Math.cos(a)*d, dy = Math.sin(a)*d - up;
    const t = dur[0] + Math.random()*(dur[1]-dur[0]);
    p.animate([
      { transform:`translate(${x-sz/2}px,${y-sz/2}px) scale(1)`, opacity:1 },
      { transform:`translate(${x+dx-sz/2}px,${y+dy+20-sz/2}px) scale(.2)`, opacity:0 },
    ], { duration:t, easing:'cubic-bezier(.15,.7,.3,1)' }).onfinish = () => p.remove();
  }
}
function burstAt(r, c, opts){ const p = sqScreen(r, c); burst(p.x, p.y, opts); }
function shake(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function pulseClass(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function ghostPiece(r, c, piece){ spawnFx(`<div class="fx-dissolve">${pieceArt(piece, setFor(color(piece)))}</div>`, r, c, 750); }

/* ------------------------------------------------- champion reactions */
function champEl(col){ return col === viewColor() ? $('#crestMe') : $('#crestOpp'); }
function champReact(col, kind, accent) {
  const el = champEl(col);
  if (!el) return;
  if (accent) el.style.setProperty('--cast', accent);
  el.classList.remove('react-attack', 'react-hurt', 'react-cast', 'react-cheer', 'react-slump');
  void el.offsetWidth;
  el.classList.add('react-' + kind);
  if (kind !== 'slump') setTimeout(() => el.classList.remove('react-' + kind), kind === 'cheer' ? 2400 : 1000);
}
/* The companion carries the spell across the board and scurries home. */
function petRun(col, to, accent) {
  const av = avatarFor(col);
  if (!av || !av.pet || av.pet === 'none') return 0;
  const from = champEl(col).getBoundingClientRect();
  const target = to || (() => { const b = $('#board').getBoundingClientRect(); return { x:b.left + b.width/2, y:b.top + b.height/2 }; })();
  const art = PET_ART[av.pet];
  const inner = art
    ? `<i class="pet-art ${art.fly ? 'fly' : 'stand'} f${art.frames}" style="background-image:url(${PET_ART.path}${av.pet}.png?v=${ART_VER})"></i>`
    : `<svg viewBox="-22 -22 44 44">${petArt(av.pet)}</svg>`;
  const el = h(`<div class="pet-runner">${inner}</div>`);
  document.body.append(el);
  const x0 = from.left + from.width/2 - 27, y0 = from.top + from.height/2 - 27;
  const x1 = target.x - 27, y1 = target.y - 27;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 70;
  el.animate([
    { transform:`translate(${x0}px,${y0}px) scale(.5)`, opacity:0 },
    { transform:`translate(${mx}px,${my}px) scale(1.15)`, opacity:1, offset:.45 },
    { transform:`translate(${x1}px,${y1}px) scale(.9)`, opacity:1, offset:.7 },
    { transform:`translate(${x0}px,${y0}px) scale(.5)`, opacity:0 },
  ], { duration:1500, easing:'ease-in-out' }).onfinish = () => el.remove();
  setTimeout(() => burst(target.x, target.y, { count:14, colors:[accent || '#fff3c4', '#ffffff'], spread:60 }), 700);
  return 1;
}

/* ============================================================ flying cards */
function flyerAt(el) { const f = document.createElement('div'); f.className = 'flyer'; f.append(el); $('#fxTop').append(f); return f; }
function centerOf(rect){ return { x:rect.left + rect.width/2, y:rect.top + rect.height/2 }; }

async function dealToMe(id, slotEl, fromEl, rotDeg) {
  const target = slotEl.querySelector('.tcg');
  const cw = target.offsetWidth;
  const tr = target.getBoundingClientRect(), fr = fromEl.getBoundingClientRect();
  const tc = centerOf(tr), fc = centerOf(fr);
  const card = makeCard(id, { compact:true, down:true, cw });
  const f = flyerAt(card);
  const x0 = fc.x - cw/2, y0 = fc.y - cw*.7, x1 = tc.x - cw/2, y1 = tc.y - cw*.7;
  const s0 = fr.width / cw;
  Sound.play('deal');
  f.animate([
    { transform:`translate(${x0}px,${y0}px) rotate(-25deg) scale(${s0})`, offset:0 },
    { transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1)-40}px) rotate(190deg) scale(${(s0+1.3)/2})`, offset:.25 },
    { transform:`translate(${x1}px,${y1-60}px) rotate(360deg) scale(1.32)`, offset:.45 },
    { transform:`translate(${x1}px,${y1-66}px) rotate(360deg) scale(1.4)`, offset:.8 },
    { transform:`translate(${x1}px,${y1}px) rotate(${360+rotDeg}deg) scale(1)`, offset:1 },
  ], { duration:1300, easing:'ease-in-out', fill:'forwards' });
  await sleep(560);
  card.classList.remove('down');
  Sound.play('flip');
  await sleep(260);
  const sc = SCHOOLS[CARD_BY_ID[id].school];
  burst(tc.x, tc.y - 66, { count:22, colors:[sc.accent, sc.glow, '#fff3c4'], spread:110 });
  Sound.play('reveal');
  Haptics.pulse('light');
  await sleep(480);
  slotEl.classList.remove('hidden');
  f.remove();
}
async function dealToOpp(backEl, fromEl) {
  const cw = backEl.offsetWidth;
  const tr = backEl.getBoundingClientRect(), fr = fromEl.getBoundingClientRect();
  const tc = centerOf(tr), fc = centerOf(fr);
  const f = flyerAt(makeBack(cw));
  const s0 = fr.width / cw;
  Sound.play('deal');
  await f.animate([
    { transform:`translate(${fc.x-cw/2}px,${fc.y-cw*.7}px) rotate(0deg) scale(${s0})` },
    { transform:`translate(${tc.x-cw/2}px,${tc.y-cw*.7}px) rotate(720deg) scale(1)` },
  ], { duration:650, easing:'cubic-bezier(.3,.7,.3,1)', fill:'forwards' }).finished;
  backEl.style.opacity = 1;
  f.remove();
}
async function dealCards(myIdx, oppIdx) {
  // myIdx / oppIdx: indices of the (already added) cards in the viewer's / opponent's hand
  renderHands({ hideMine:myIdx, hideOpp:oppIdx });
  const pile = $('#deckPile');
  pile.replaceChildren(makeBack(64), makeBack(64), makeBack(64));
  pile.classList.add('show');
  await sleep(350);
  const from = pile.lastElementChild;
  const slots = [...$('#hand').children], backs = [...$('#oppHand').children];
  const jobs = [];
  const steps = Math.max(myIdx.length, oppIdx.length);
  for (let k=0; k<steps; k++) {
    if (k < myIdx.length) {
      const i = myIdx[k], slot = slots[i];
      const rot = parseFloat(slot.style.getPropertyValue('--rot')) || 0;
      jobs.push(dealToMe(G.hands[viewColor()][i], slot, from, rot));
      await sleep(330);
    }
    if (k < oppIdx.length) { jobs.push(dealToOpp(backs[oppIdx[k]], from)); await sleep(260); }
  }
  await Promise.all(jobs);
  pile.classList.remove('show');
}
async function revealHand() {
  renderHands({ faceDown:true });
  const slots = [...$('#hand').children].filter(s => s.classList.contains('slot'));
  for (const s of slots) {
    const card = s.querySelector('.tcg');
    s.animate([{ transform:getComputedStyle(s).transform }, { transform:`${getComputedStyle(s).transform} translateY(-30px) scale(1.2)`, offset:.5 }, { transform:getComputedStyle(s).transform }],
      { duration:650, easing:'ease-in-out' });
    await sleep(160);
    card.classList.remove('down');
    Sound.play('flip');
    const r = card.getBoundingClientRect(), sc = SCHOOLS[CARD_BY_ID[card.dataset.card].school];
    burst(r.left + r.width/2, r.top + r.height/2 - 20, { count:12, colors:[sc.accent, '#fff3c4'], spread:70 });
    await sleep(180);
  }
  await sleep(300);
  renderHands();
}

/* Show a card being cast: flies to centre, (flips if it was hidden), then dissolves into the board. */
async function showCast(id, col, fromRect, reveal) {
  const vw = innerWidth, vh = innerHeight;
  const cw = Math.min(vw * .62, 250, (vh * .5) / 1.4);
  const card = makeCard(id, { cw, down:reveal });
  const f = flyerAt(card);
  fitCardText(card);
  const b = $('#board').getBoundingClientRect(), bc = centerOf(b);
  const x1 = bc.x - cw/2, y1 = bc.y - cw*.7;
  const fc = fromRect ? centerOf(fromRect) : { x:bc.x, y:vh };
  const s0 = fromRect ? fromRect.width / cw : .3;
  const sc = SCHOOLS[CARD_BY_ID[id].school];
  Sound.play('whoosh');
  await f.animate([
    { transform:`translate(${fc.x-cw/2}px,${fc.y-cw*.7}px) scale(${s0}) rotate(${reveal ? 180 : -8}deg)`, opacity:.9 },
    { transform:`translate(${x1}px,${y1}px) scale(1) rotate(0deg)`, opacity:1 },
  ], { duration:520, easing:'cubic-bezier(.3,.7,.3,1.1)', fill:'forwards' }).finished;
  let label = null, desc = null;
  if (reveal) {
    await sleep(120);
    card.classList.remove('down');
    Sound.play('reveal');
    await sleep(320);
    label = h(`<div class="cast-label" style="top:${Math.min(innerHeight - 40, y1 + cw*1.4 + 12)}px">${playerName(col)} casts ${CARD_BY_ID[id].name}!</div>`);
    document.body.append(label);
  }
  burst(bc.x, bc.y, { count:26, colors:[sc.accent, sc.glow, '#fff3c4'], spread:cw * .9, size:[4,10] });
  await sleep(reveal ? 1900 : 450);
  Sound.play('cast');
  if (label) label.remove();
  if (desc) desc.remove();
  await f.animate([
    { transform:`translate(${x1}px,${y1}px) scale(1)`, opacity:1, filter:'brightness(1)' },
    { transform:`translate(${x1}px,${y1}px) scale(1.12)`, opacity:1, filter:'brightness(1.8)', offset:.35 },
    { transform:`translate(${x1}px,${y1 + 40}px) scale(.15) rotate(25deg)`, opacity:0, filter:'brightness(3)' },
  ], { duration:520, easing:'ease-in', fill:'forwards' }).finished;
  burst(bc.x, bc.y + 40, { count:30, colors:[sc.accent, sc.glow, '#ffffff'], spread:150, size:[3,8] });
  f.remove();
}

/* ============================================================ inspector */
function onHandCardTap(i, cardEl) {
  if (UI.busy && !UI.pending) { if (isHumanTurn()) return; }
  if (UI.pending) { if (UI.pending.slot === i) { cancelTargeting(); return; } cancelTargeting(); }
  Sound.play('tap');
  openInspector(G.hands[viewColor()][i], cardEl, { mode:'hand', slot:i });
}
function openInspector(id, srcEl, opts) {
  const c = CARD_BY_ID[id], sc = SCHOOLS[c.school];
  const vw = innerWidth, vh = innerHeight;
  const cw = Math.floor(Math.min(vw * .76, 320, (vh - 250) / 1.4));
  const card = makeCard(id, { cw });
  card.append(h('<div class="glare"></div>'));
  const holder = $('#inspCard');
  holder.replaceChildren(card);
  holder.style.transform = '';
  $('#inspector').style.setProperty('--aura', sc.accent);
  UI.insp = { id, ...opts };
  const play = $('#inspPlay'), reason = $('#inspReason'), meta = $('#inspMeta');
  reason.textContent = '';
  if (opts.mode === 'hand') {
    play.style.display = '';
    const col = viewColor();
    let ok = false;
    if (!isHumanTurn() || UI.busy) reason.textContent = 'Wait for your turn to play this card.';
    else { const pl = playableCached(id, col); ok = pl.ok; if (!ok) reason.textContent = pl.reason; }
    play.disabled = !ok;
    play.textContent = c.kind === 'Passive' ? 'Passive' : 'Activate';
    meta.textContent = `${sc.name} ${sc.type} · ${RARITY[c.rarity].name}`;
    $('#inspBack').textContent = 'Back';
  } else {
    if (opts.action) {
      play.style.display = '';
      play.disabled = false;
      play.textContent = opts.action.label;
    } else play.style.display = 'none';
    const used = Store.stats.cardUse[id] || 0;
    meta.textContent = opts.mode === 'peek' ? ''
      : `${sc.name} ${sc.type} · ${RARITY[c.rarity].name}` + (used ? ` · played ${used} time${used === 1 ? '' : 's'}` : '');
    if (opts.mode === 'peek') reason.innerHTML = `<span style="color:var(--mint)">${opts.caption}</span>`;
    $('#inspBack').textContent = opts.mode === 'peek' ? 'Got it' : 'Close';
  }
  const info = $('#inspInfo');
  info.querySelectorAll(':scope > *').forEach(e => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
  $('#inspector').classList.add('show');
  fitCardText(card);
  if (srcEl) {
    const r = srcEl.getBoundingClientRect(), t = card.getBoundingClientRect();
    const dx = (r.left + r.width/2) - (t.left + t.width/2), dy = (r.top + r.height/2) - (t.top + t.height/2);
    card.animate([
      { transform:`translate(${dx}px,${dy}px) scale(${r.width/t.width}) rotateY(-30deg)` },
      { transform:'translate(0,-10px) scale(1.04) rotateY(10deg)', offset:.65 },
      { transform:'none' },
    ], { duration:560, easing:'cubic-bezier(.3,.7,.3,1)' });
  } else {
    card.animate([{ transform:'scale(.6) rotateY(180deg)', opacity:0 }, { transform:'none', opacity:1 }], { duration:600, easing:'cubic-bezier(.3,.7,.3,1.1)' });
  }
  Sound.play('flip');
}
function closeInspector() {
  if (!$('#inspector').classList.contains('show')) return;
  $('#inspector').classList.remove('show');
  const cb = UI.insp && UI.insp.onClose;
  UI.insp = null;
  if (cb) cb();
}
function setupInspectorTilt() {
  const holder = $('#inspCard');
  const move = e => {
    const card = holder.firstElementChild;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    holder.style.transform = `rotateY(${(px - .5) * 26}deg) rotateX(${-(py - .5) * 26}deg)`;
    card.style.setProperty('--gx', (px*100) + '%'); card.style.setProperty('--gy', (py*100) + '%');
  };
  holder.addEventListener('pointermove', move);
  holder.addEventListener('pointerdown', move);
  holder.addEventListener('pointerleave', () => { holder.style.transform = ''; });
  holder.addEventListener('pointerup', () => { holder.style.transform = ''; });
}
async function onActivate() {
  if (UI.insp && UI.insp.action) { Sound.play('tap'); UI.insp.action.fn(); return; }
  if (!UI.insp || UI.insp.mode !== 'hand') return;
  const { id, slot } = UI.insp;
  const col = viewColor();
  if (!isHumanTurn() || UI.busy || !playableCached(id, col).ok) return;
  const cardRect = $('#inspCard').firstElementChild.getBoundingClientRect();
  closeInspector();
  if (cardStageCount(id) === 0) { await performCard(id, [], col, cardRect); return; }
  beginTargeting(id, slot);
}

/* ============================================================ targeting */
function beginTargeting(id, slot) {
  const col = viewColor();
  UI.sel = null; UI.legal = [];
  UI.pending = { id, slot, stage:0, picks:[], targets:cardTargets(G, id, 0, [], col) };
  const c = CARD_BY_ID[id];
  $('#tbArt').innerHTML = cardArt(id);
  $('#tbName').textContent = c.name;
  updateTargetBar();
  $('#targetBar').classList.add('show');
  Sound.play('select');
  renderAll();
}
function updateTargetBar() {
  const p = UI.pending, n = cardStageCount(p.id);
  $('#tbPrompt').textContent = CARD_STAGES[p.id][p.stage];
  $('#tbStep').textContent = n > 1 ? `Step ${p.stage+1} of ${n} · tap a glowing square` : 'Tap a glowing square';
}
function cancelTargeting() {
  if (!UI.pending) return;
  UI.pending = null;
  $('#targetBar').classList.remove('show');
  renderAll();
}
async function onTargetTap(r, c) {
  const p = UI.pending;
  if (!p.targets.some(t => t.r===r && t.c===c)) { Sound.play('error'); return; }
  p.picks.push({ r, c });
  p.stage++;
  Sound.play('select');
  Haptics.pulse('light');
  if (p.stage < cardStageCount(p.id)) {
    p.targets = cardTargets(G, p.id, p.stage, p.picks, viewColor());
    updateTargetBar();
    renderBoard();
    return;
  }
  const slotEl = $('#hand').children[p.slot];
  const rect = slotEl ? slotEl.getBoundingClientRect() : null;
  UI.pending = null;
  $('#targetBar').classList.remove('show');
  await performCard(p.id, p.picks, viewColor(), rect);
}

/* ============================================================ input: board */
async function onBoardTap(e) {
  const sq = e.target.closest('.sq');
  if (!sq || !G || G.over) return;
  const r = +sq.dataset.r, c = +sq.dataset.c;
  if (!isHumanTurn()) return;
  if (UI.pending) { if (!UI.busy) onTargetTap(r, c); return; }
  if (UI.busy) return;
  if (UI.sel) {
    const mv = UI.legal.find(m => m.to.r===r && m.to.c===c);
    if (mv) {
      let move = mv;
      if (mv.promotion) {
        const choice = await askPromotion(G.state.turn);
        move = { ...mv, promoChoice:choice };
      }
      UI.sel = null; UI.legal = [];
      await performMove(move);
      return;
    }
  }
  const p = G.state.board[idx(r,c)];
  if (p && color(p) === G.state.turn && !(UI.sel && UI.sel.r===r && UI.sel.c===c)) {
    UI.sel = { r, c };
    UI.legal = realLegalMoves(G, G.state.turn).filter(m => m.from.r===r && m.from.c===c);
    Sound.play('select');
    if (isFrozen(G, r, c)) toast('That piece is frozen solid!');
    else if (!UI.legal.length) toast('That piece has no legal moves.', 1500);
  } else {
    UI.sel = null; UI.legal = [];
  }
  renderBoard();
}

/* ============================================================ game flow */
async function startMatch(mode, level) {
  UI.epoch++;
  const ep = UI.epoch;
  const myDeck = playerDeck();
  G = newGame(mode, level, mode === 'ai' ? { w:myDeck, b:aiDeck(level) } : { w:myDeck, b:myDeck });
  UI.lastMatch = { mode, level };
  UI.busy = true; UI.sel = null; UI.legal = []; UI.pending = null; UI.override = null; UI.log = []; UI.playCache = {};
  UI.viewColor = 'w'; UI.flip = false;
  $('#ticker').textContent = '';
  $('#targetBar').classList.remove('show');
  UI.screenStack = ['scrTitle', 'scrGame'];
  showScreen('scrGame', false);
  layout();
  drawCards(G, 'w', HAND_SIZE); drawCards(G, 'b', HAND_SIZE);
  renderBoard(); renderPlayers(); renderStatus();
  renderHands({ hideMine:[0,1,2], hideOpp:[0,1,2] });
  await sleep(600);
  if (!alive(ep)) return;
  await dealCards([0,1,2], [0,1,2]);
  if (!alive(ep)) return;
  addLog(mode === 'ai' ? `You play Ivory against ${AI_NAMES[level].name}.` : 'Pass & Play: Ivory moves first.');
  UI.busy = false;
  renderAll();
  if (mode === 'ai' && !Store.stats.games) toast('Tap one of your cards to see what it does!', 3200);
}

async function afterTurn() {
  const ep = UI.epoch;
  UI.sel = null; UI.legal = [];
  const end = evaluateEnd(G);
  if (end) {
    if (end.over) { renderAll(); return finishGame(end); }
    if (end.kingGuard) {
      const col = G.state.turn;
      renderAll();
      await showCast('kingguard', col, null, G.mode === 'ai' && col === G.aiColor);
      if (!alive(ep)) return;
      toast("♛ King's Guard saves the king!", 2800);
      if (G.mode === 'human' || col === G.humanColor) { Progress.data.c.kgSaves++; Progress.save(); earnCheck(true); }
      addLog(`${playerName(col)}'s King's Guard destroyed the attacker!`);
      await playEvents(triggerKingGuard(G, col));
      return afterTurn();
    }
    if (end.skip) {
      toast(`${playerName(G.state.turn)} can't move a thing, so the turn is skipped!`, 2600);
      G.state.turn = opp(G.state.turn); G.ply++; purgeEffects(G);
      return afterTurn();
    }
  }
  if (inCheck(G.state, G.state.turn)) { Sound.play('check'); Haptics.pulse('medium'); champReact(G.state.turn, 'hurt'); }
  if (G.mode === 'ai' && G.state.turn === G.aiColor) { UI.busy = true; renderAll(); return aiTurn(ep); }
  if (G.mode === 'human' && UI.viewColor !== G.state.turn) {
    UI.busy = true;
    renderAll();
    await sleep(500);
    if (!alive(ep)) return;
    await passCurtain(G.state.turn);
    if (!alive(ep)) return;
  }
  UI.busy = false;
  renderAll();
  if (end && end.mustCard && isHumanTurn()) toast(end.checked ? 'No moves can save your king. Play a cheat card!' : 'No legal moves! You must play a cheat card.', 3200);
}

async function performMove(mv) {
  const ep = UI.epoch;
  UI.busy = true;
  closeInspector();
  const res = makeMove(G, mv);
  const placed = G.state.board[idx(mv.to.r, mv.to.c)] || (mv.promotion ? res.col + (mv.promoChoice || 'q') : res.mover);
  const trapped = res.events.some(e => e.fx === 'destroy' && e.r === mv.to.r && e.c === mv.to.c);
  if (trapped) UI.override = { [idx(mv.to.r, mv.to.c)]: placed };
  const anim = [{ from:mv.from, to:mv.to }];
  if (mv.castle) {
    const h = mv.from.r;
    anim.push(mv.castle === 'K' ? { from:{r:h,c:7}, to:{r:h,c:5} } : { from:{r:h,c:0}, to:{r:h,c:3} });
  }
  renderBoard({ anim });
  renderPlayers(); renderStatus();
  Sound.play(res.victim ? 'capture' : 'move');
  if (res.victim && G.mode === 'ai' && res.col === G.humanColor) gainGambits(XP.capture, sqScreen(mv.to.r, mv.to.c));
  if (res.victim) { champReact(res.col, 'attack'); champReact(opp(res.col), 'hurt'); }
  if (res.victim) {
    const vr = mv.enPassant ? mv.from.r : mv.to.r;
    setTimeout(() => { ghostPiece(vr, mv.to.c, res.victim); burstAt(vr, mv.to.c, { count:14, colors:['#ffffff','#ffd35c','#ff7a2a'], spread:60 }); Haptics.pulse('medium'); }, 180);
  } else Haptics.pulse('light');
  const who = playerName(res.col);
  const pn = PIECE_NAME[ptype(res.mover)];
  addLog(mv.castle ? `${who} castled.` : `${who}: ${pn} ${sqName(mv.from.r,mv.from.c)}→${sqName(mv.to.r,mv.to.c)}` +
    (res.victim ? ` takes ${PIECE_NAME[ptype(res.victim)]}` : '') + (mv.promotion ? ' and promoted!' : ''));
  await sleep(300);
  if (!alive(ep)) return;
  if (res.events.length) await playEvents(res.events);
  if (!alive(ep)) return;
  UI.override = null;
  await afterTurn();
}

async function performCard(id, picks, col, fromRect) {
  const ep = UI.epoch;
  UI.busy = true;
  closeInspector();
  UI.sel = null; UI.legal = [];
  const isAI = G.mode === 'ai' && col === G.aiColor;
  let rect = fromRect;
  if (isAI) { const backs = $('#oppHand').children; if (backs.length) rect = backs[backs.length-1].getBoundingClientRect(); }
  // Remove the card from the hand display straight away
  const hi = G.hands[col].indexOf(id);
  const shown = G.hands[col].slice(); if (hi >= 0) shown.splice(hi, 1);
  const saved = G.hands[col]; G.hands[col] = shown; renderHands(); G.hands[col] = saved;
  renderBoard(); renderStatus();
  const school = SCHOOLS[CARD_BY_ID[id].school];
  champReact(col, 'cast', school.accent);
  petRun(col, null, school.accent);
  await showCast(id, col, rect, isAI);
  if (!alive(ep)) return;
  const res = playCard(G, id, picks, col);
  if (res.events.some(e => e.fx === 'destroy' && color(e.piece) !== col)) setTimeout(() => champReact(opp(col), 'hurt'), 500);
  const counts = G.mode === 'human' || col === G.humanColor;
  if (counts) {
    Store.stats.cardsPlayed++; Store.stats.cardUse[id] = (Store.stats.cardUse[id] || 0) + 1; Store.saveStats();
    const pc = Progress.data.c;
    pc.cardsCast++; pc.castIds[id] = 1;
    if (id === 'bomb') pc.bestBomb = Math.max(pc.bestBomb, res.events.filter(e => e.fx === 'destroy' && color(e.piece) !== col).length);
    Progress.save();
  }
  if (G.mode === 'ai' && col === G.humanColor) {
    const kills = res.events.filter(e => e.fx === 'destroy' && color(e.piece) !== col).length;
    const b = $('#board').getBoundingClientRect();
    gainGambits(XP.card + kills * XP.capture, { x:b.left + b.width/2, y:b.top + b.height/2 });
  }
  addLog(`${playerName(col)} played ${CARD_BY_ID[id].name}.`);
  const drawnCount = res.drawn.length;
  if (drawnCount) { G.hands[col].splice(G.hands[col].length - drawnCount, drawnCount); } // re-add after the animation
  renderHands(); renderPlayers();
  await playEvents(res.events);
  if (!alive(ep)) return;
  if (res.peek) {
    if (!isAI) await peekCard(res.peek);
    else toast(`${playerName(col)} peeked at one of your cards!`, 2600);
  }
  if (res.peekAll) {
    if (col === viewColor()) showHandReveal(res.peekAll);
    else toast(`${playerName(col)} read your whole hand.`, 2800);
  }
  if (res.burned) {
    renderHands();
    const c = CARD_BY_ID[res.burned];
    if (col === viewColor()) toast(`You burned ${playerName(opp(col))}'s ${c.name}.`, 2800);
    else toast(`${playerName(col)} burned your ${c.name}!`, 3000);
  }
  if (res.discarded && col === viewColor()) toast(`Threw away ${res.discarded} card${res.discarded === 1 ? '' : 's'}.`, 2000);
  if (res.stolen) {
    renderHands();
    if (col === viewColor()) await peekCard(res.stolen, `You pickpocketed ${CARD_BY_ID[res.stolen].name}! It's in your hand now.`);
    else toast(`${playerName(col)} pickpocketed your ${CARD_BY_ID[res.stolen].name}!`, 2800);
  }
  if (counts) earnCheck(true);
  if (res.drawn.length) {
    G.hands[col].push(...res.drawn);
    const start = G.hands[col].length - drawnCount;
    const newIdx = Array.from({ length:drawnCount }, (_, k) => start + k);
    if (col === viewColor()) await dealCards(newIdx, []); else await dealCards([], newIdx);
    toast(`${playerName(col)} drew ${drawnCount} new card${drawnCount === 1 ? '' : 's'}!`);
  }
  if (!alive(ep)) return;
  if (res.extraTurn) toast(`⌛ ${playerName(col) === 'You' ? 'You keep' : playerName(col) + ' keeps'} the turn, twice over!`);
  if (res.rewound) toast(`⏪ Time rewinds! ${playerName(G.state.turn)} must move again.`, 2800);
  UI.override = null;
  await afterTurn();
}

async function playEvents(events) {
  const frame = $('#boardFrame');
  for (let k=0; k<events.length; k++) {
    const ev = events[k];
    if (!ev) continue;
    const later = events.slice(k+1);
    const dies = (r, c) => later.some(e => e.fx === 'destroy' && e.r === r && e.c === c);
    if (ev.msg) { addLog(ev.msg); toast(ev.msg); continue; }
    switch (ev.fx) {
      case 'destroy': {
        if (UI.override) { delete UI.override[idx(ev.r, ev.c)]; }
        renderBoard();
        ghostPiece(ev.r, ev.c, ev.piece);
        const cols = ev.cause === 'lightning' ? ['#fffbe0','#ffe07a','#ffffff'] : ev.cause === 'trap' ? ['#c6ff8a','#7fe04a','#eaffb0']
          : ev.cause === 'kingguard' ? ['#fff3c4','#ffd35c','#ffffff'] : ['#ffd35c','#ff7a2a','#fff3c4'];
        burstAt(ev.r, ev.c, { count:16, colors:cols, spread:70 });
        if (ev.cause !== 'bomb') Sound.play('shatter');
        await sleep(140);
        break;
      }
      case 'bomb': {
        Sound.play('boom'); Haptics.pulse('heavy'); shake(frame);
        (ev.cells || [{ r:ev.r, c:ev.c }]).forEach((t, i) => setTimeout(() => spawnFx('<div class="fx-explode"></div>', t.r, t.c, 800), i * 70));
        spawnFx('<div class="fx-flash" style="--c:#fff3c4"></div>', ev.r, ev.c, 500, 3);
        await sleep(260);
        renderBoard();
        burstAt(ev.r, ev.c, { count:40, colors:['#fffbe0','#ffd35c','#ff7a2a','#c2261a'], spread:170, size:[4,11] });
        await sleep(380);
        break;
      }
      case 'lightning': {
        Sound.play('zap'); Haptics.pulse('heavy');
        const [, dc] = disp(0, ev.c), cell = cellSize();
        const d = document.createElement('div');
        d.className = 'fx';
        d.style.cssText = `left:${dc*cell - cell*.3}px;top:0;width:${cell*1.6}px;height:${cell*8}px`;
        d.innerHTML = '<div class="fx-bolt"></div>';
        $('#fxLayer').append(d); setTimeout(() => d.remove(), 700);
        pulseClass(frame, 'gold-pulse');
        await sleep(240);
        break;
      }
      case 'shield':
        Sound.play('ward'); renderBoard();
        spawnFx('<div class="fx-ring" style="--c:#63d0ff"></div>', ev.r, ev.c, 800, 1.2);
        setTimeout(() => spawnFx('<div class="fx-ring" style="--c:#ffffff"></div>', ev.r, ev.c, 800), 150);
        burstAt(ev.r, ev.c, { count:12, colors:['#a9e8ff','#63d0ff','#fff'], spread:60 });
        await sleep(520); break;
      case 'vanish':
        Sound.play('ward'); renderBoard();
        spawnFx('<div class="fx-ring" style="--c:#e2cfff"></div>', ev.r, ev.c, 800, 1.2);
        burstAt(ev.r, ev.c, { count:14, colors:['#ffffff','#d7ecff'], spread:50, up:40 });
        await sleep(520); break;
      case 'frost':
        Sound.play('freeze'); spawnFx('<div class="fx-frost"></div>', ev.r, ev.c, 700, 1.3);
        await sleep(200); renderBoard();
        burstAt(ev.r, ev.c, { count:16, colors:['#ffffff','#bfeaff','#63d0ff'], spread:60 });
        await sleep(350); break;
      case 'wall':
        Sound.play('stone'); Haptics.pulse('medium'); renderBoard();
        { const w = sqEl(ev.r, ev.c).querySelector('.fx-wall'); if (w) w.classList.add('fx-wallrise'); }
        burstAt(ev.r, ev.c, { count:14, colors:['#c7b699','#8a7458','#6e5d47'], spread:50 });
        await sleep(450); break;
      case 'trapSet':
        Sound.play('poison'); renderBoard();
        if (ev.owner === viewColor() && (G.mode === 'human' || ev.owner === G.humanColor)) spawnFx('<div class="fx-ring" style="--c:#7fe04a"></div>', ev.r, ev.c, 800);
        await sleep(350); break;
      case 'poison':
        Sound.play('poison'); spawnFx('<div class="fx-poison"></div>', ev.r, ev.c, 800, 1.2); await sleep(280); break;
      case 'trapBreak':
        Sound.play('shatter'); toast('The king smashed a hidden Poison Trap!'); burstAt(ev.r, ev.c, { count:14, colors:['#c6ff8a','#7fe04a'] }); await sleep(300); break;
      case 'teleport': {
        Sound.play('portal');
        const fi = idx(ev.from.r, ev.from.c), ti = idx(ev.to.r, ev.to.c);
        UI.override = { [fi]:ev.piece, [ti]:null };
        renderBoard();
        spawnFx('<div class="fx-portal"></div>', ev.from.r, ev.from.c, 800, 1.4);
        await sleep(320);
        UI.override = dies(ev.to.r, ev.to.c) ? { [ti]:ev.piece } : null;
        renderBoard({ popIn:ev.to });
        spawnFx('<div class="fx-portal"></div>', ev.to.r, ev.to.c, 800, 1.4);
        burstAt(ev.to.r, ev.to.c, { count:16, colors:['#ffffff','#c39bff','#9b5cff'], spread:60 });
        await sleep(420); break;
      }
      case 'swap':
        Sound.play('portal');
        renderBoard({ anim:[{ from:ev.a, to:ev.b }, { from:ev.b, to:ev.a }], dur:520 });
        spawnFx('<div class="fx-glyph" style="--c:#c39bff">↻</div>', ev.a.r, ev.a.c, 800);
        spawnFx('<div class="fx-glyph" style="--c:#ffc94a">↻</div>', ev.b.r, ev.b.c, 800);
        await sleep(560); break;
      case 'slide': {
        Sound.play(ev.sound || 'move');
        UI.override = dies(ev.to.r, ev.to.c) ? { [idx(ev.to.r, ev.to.c)]:ev.piece } : UI.override;
        renderBoard({ anim:[{ from:ev.from, to:ev.to }], dur:320 });
        await sleep(340); break;
      }
      case 'clone':
        Sound.play('portal');
        UI.override = dies(ev.r, ev.c) ? { [idx(ev.r, ev.c)]:ev.piece } : null;
        renderBoard({ popIn:{ r:ev.r, c:ev.c } });
        burstAt(ev.r, ev.c, { count:16, colors:['#c39bff','#ffffff'], spread:60 });
        await sleep(450); break;
      case 'resurrect':
        Sound.play('reveal');
        spawnFx('<div class="fx-flash" style="--c:#fff3c4"></div>', ev.r, ev.c, 600, 1.4);
        spawnFx('<div class="fx-ring" style="--c:#ffd35c"></div>', ev.r, ev.c, 800, 1.3);
        renderBoard({ popIn:{ r:ev.r, c:ev.c } });
        burstAt(ev.r, ev.c, { count:24, colors:['#fff3c4','#ffd35c','#ffffff'], spread:80, up:40 });
        await sleep(520); break;
      case 'steal':
        Sound.play('portal');
        spawnFx('<div class="fx-ring" style="--c:#5fe8b4"></div>', ev.r, ev.c, 800, 1.3);
        renderBoard({ popIn:{ r:ev.r, c:ev.c } });
        burstAt(ev.r, ev.c, { count:16, colors:['#5fe8b4','#ffd35c'], spread:60 });
        await sleep(450); break;
      case 'disarm':
        Sound.play('shatter');
        spawnFx('<div class="fx-glyph" style="--c:#ff5470">✖</div>', ev.r, ev.c, 800, 1.2);
        burstAt(ev.r, ev.c, { count:18, colors:['#ff5470','#ffffff'], spread:70 });
        renderBoard();
        await sleep(450); break;
      case 'hourglass':
        Sound.play('clock'); pulseClass(frame, 'gold-pulse');
        { const b = $('#board').getBoundingClientRect(); burst(b.left + b.width/2, b.top + b.height/2, { count:30, colors:['#fff3c4','#ffd35c'], spread:b.width/2 }); }
        await sleep(650); break;
      case 'rewind':
        Sound.play('clock'); pulseClass(frame, 'rewind-pulse');
        await sleep(380); renderBoard(); renderPlayers(); await sleep(450); break;
      case 'quake':
        Sound.play('rumble'); Haptics.pulse('heavy'); shake(frame);
        await sleep(420); break;
      case 'meteor': {
        const hits = ev.hits || [];
        if (!hits.length) { toast('The meteors missed everything!'); break; }
        Sound.play('whoosh');
        hits.forEach((t, i) => {
          setTimeout(() => spawnFx('<div class="fx-meteor"></div>', t.r, t.c, 560), i * 260);
          setTimeout(() => { Sound.play('boom'); Haptics.pulse('heavy'); shake(frame); spawnFx('<div class="fx-explode"></div>', t.r, t.c, 800, 1.3);
            burstAt(t.r, t.c, { count:24, colors:['#fffbe0','#ffd35c','#ff7a2a'], spread:90 }); }, i * 260 + 480);
        });
        await sleep(hits.length * 260 + 560);
        break;
      }
      case 'chain': {
        Sound.play('zap'); Haptics.pulse('heavy');
        const cell = cellSize();
        for (let i = 0; i < ev.path.length; i++) {
          const t = ev.path[i];
          spawnFx('<div class="fx-flash" style="--c:#fff3a0"></div>', t.r, t.c, 500);
          if (i > 0) {
            const a = ev.path[i-1], [ar, ac] = disp(a.r, a.c), [br, bc] = disp(t.r, t.c);
            const x1 = (ac+.5)*cell, y1 = (ar+.5)*cell, x2 = (bc+.5)*cell, y2 = (br+.5)*cell;
            const arc = document.createElement('div');
            arc.className = 'fx-arc';
            arc.style.cssText = `left:${x1}px;top:${y1-2}px;width:${Math.hypot(x2-x1, y2-y1)}px;transform:rotate(${Math.atan2(y2-y1, x2-x1)}rad)`;
            $('#fxLayer').append(arc); setTimeout(() => arc.remove(), 700);
            Sound.play('zap');
          }
          await sleep(150);
        }
        break;
      }
      case 'blizzard':
        Sound.play('freeze'); Sound.play('whoosh');
        ev.cells.forEach((t, i) => setTimeout(() => spawnFx('<div class="fx-frost"></div>', t.r, t.c, 700, 1.2), i * 40));
        burstAt(ev.r, ev.c, { count:40, colors:['#ffffff','#bfeaff','#63d0ff'], spread:130 });
        await sleep(300); renderBoard(); await sleep(400);
        break;
      case 'wave': {
        Sound.play('whoosh'); Sound.play('rumble');
        const up = (ev.col === 'w') !== UI.flip;
        const w = document.createElement('div');
        w.className = 'fx-wave';
        w.style.cssText = up ? '--from:110%;--to:-50%;--dir:0deg' : '--from:-50%;--to:110%;--dir:180deg';
        $('#fxLayer').append(w); setTimeout(() => w.remove(), 1100);
        await sleep(380);
        const slides = [];
        while (events[k+1] && events[k+1].fx === 'slide') slides.push(events[++k]);
        renderBoard({ anim:slides.map(e => ({ from:e.from, to:e.to })), dur:520 });
        await sleep(620);
        break;
      }
      case 'sanctuary':
        Sound.play('ward'); renderBoard();
        ev.cells.forEach((t, i) => setTimeout(() => spawnFx('<div class="fx-ring" style="--c:#fff3c4"></div>', t.r, t.c, 800, 1.3), i * 70));
        burstAt(ev.cells[0].r, ev.cells[0].c, { count:26, colors:['#fff3c4','#a9e8ff','#ffffff'], spread:100 });
        await sleep(620); break;
      case 'leap': {
        Sound.play('whoosh');
        UI.override = dies(ev.to.r, ev.to.c) ? { [idx(ev.to.r, ev.to.c)]:ev.piece } : null;
        renderBoard();
        const pc = sqEl(ev.to.r, ev.to.c).querySelector('.piece'), cell = cellSize();
        const [fr, fc] = disp(ev.from.r, ev.from.c), [tr, tc] = disp(ev.to.r, ev.to.c);
        if (pc) {
          sqEl(ev.to.r, ev.to.c).style.zIndex = 7;
          const dx = (fc - tc) * cell, dy = (fr - tr) * cell;
          await pc.animate([{ transform:`translate(${dx}px,${dy}px)` }, { transform:`translate(${dx/2}px,${dy/2 - cell*1.1}px) scale(1.4)`, offset:.5 }, { transform:'none' }],
            { duration:560, easing:'ease-in-out' }).finished;
        }
        Sound.play('move');
        burstAt(ev.to.r, ev.to.c, { count:18, colors:['#ffffff','#c39bff','#e2cfff'], spread:60 });
        break;
      }
      case 'ascend':
        Sound.play('reveal');
        spawnFx('<div class="fx-beam"></div>', ev.r, ev.c, 1000);
        spawnFx('<div class="fx-ring" style="--c:#ffd35c"></div>', ev.r, ev.c, 800, 1.5);
        await sleep(250);
        renderBoard({ popIn:{ r:ev.r, c:ev.c } });
        burstAt(ev.r, ev.c, { count:30, colors:['#fff3c4','#ffd35c','#ffffff'], spread:90, up:50 });
        await sleep(550); break;
      case 'fireball':
        Sound.play('boom'); Haptics.pulse('heavy');
        spawnFx('<div class="fx-meteor"></div>', ev.r, ev.c, 500);
        await sleep(260);
        spawnFx('<div class="fx-explode"></div>', ev.r, ev.c, 700, ev.small ? 1 : 1.3);
        burstAt(ev.r, ev.c, { count:ev.small ? 16 : 28, colors:['#fffbe0','#ffd35c','#ff7a2a'], spread:ev.small ? 60 : 100 });
        await sleep(240); break;
      case 'scorch': {
        Sound.play('rumble'); Sound.play('boom'); Haptics.pulse('heavy'); shake(frame);
        ev.cells.forEach((t, i) => setTimeout(() => { spawnFx('<div class="fx-explode"></div>', t.r, t.c, 700);
          burstAt(t.r, t.c, { count:14, colors:['#ffd35c','#ff7a2a'], spread:60 }); }, i * 90));
        await sleep(ev.cells.length * 90 + 320); break;
      }
      case 'firewall':
        Sound.play('boom'); Haptics.pulse('medium'); renderBoard();
        ev.cells.forEach(t => { const w = sqEl(t.r, t.c).querySelector('.fx-wall'); if (w) w.classList.add('fx-wallrise');
          burstAt(t.r, t.c, { count:14, colors:['#ffd35c','#ff7a2a'], spread:50, up:30 }); });
        await sleep(520); break;
      case 'dragonrage': {
        Sound.play('boom'); Haptics.pulse('heavy'); shake(frame);
        spawnFx('<div class="fx-ring" style="--c:#ff8a4c"></div>', ev.r, ev.c, 800, 2.4);
        ev.cells.forEach((t, i) => setTimeout(() => spawnFx('<div class="fx-explode"></div>', t.r, t.c, 700), i * 60));
        await sleep(380); break;
      }
      case 'hail':
        Sound.play('freeze');
        ev.cells.forEach((t, i) => setTimeout(() => { spawnFx('<div class="fx-frost"></div>', t.r, t.c, 700, 1.2);
          burstAt(t.r, t.c, { count:14, colors:['#ffffff','#bfeaff'], spread:60 }); }, i * 160));
        await sleep(ev.cells.length * 160 + 280); renderBoard(); await sleep(220); break;
      case 'warp':
        Sound.play('portal');
        spawnFx('<div class="fx-portal"></div>', ev.a.r, ev.a.c, 800, 1.4);
        spawnFx('<div class="fx-portal"></div>', ev.b.r, ev.b.c, 800, 1.4);
        await sleep(240);
        renderBoard({ anim:[{ from:ev.a, to:ev.b }, { from:ev.b, to:ev.a }], dur:520 });
        await sleep(520); break;
      case 'timelock':
        Sound.play('clock'); pulseClass(frame, 'rewind-pulse');
        toast('Time Lock. Their cheat cards are sealed for a turn.', 2800);
        await sleep(600); break;
      case 'burn':
        Sound.play('shatter');
        { const b = $('#board').getBoundingClientRect(); burst(b.left + b.width/2, b.top + b.height/2, { count:24, colors:['#ff7a2a','#ffd35c','#5a3a1a'], spread:110 }); }
        await sleep(420); break;
      case 'tracker':
        Sound.play('select'); renderBoard();
        ev.cells.forEach((t, i) => setTimeout(() => spawnFx('<div class="fx-ring" style="--c:#5fe8b4"></div>', t.r, t.c, 800), i * 120));
        await sleep(ev.cells.length * 120 + 300); break;
      case 'kingguard':
        Sound.play('ward');
        for (let i=0;i<3;i++) setTimeout(() => spawnFx('<div class="fx-ring" style="--c:#ffd35c"></div>', ev.r, ev.c, 800, 1.6), i*160);
        burstAt(ev.r, ev.c, { count:26, colors:['#fff3c4','#ffd35c','#ffffff'], spread:90 });
        await sleep(600); break;
    }
  }
  UI.override = null;
  renderAll();
}

/* ------------------------------------------------------------ computer */
let aiWorker = null, aiReqId = 0;
const aiPending = new Map();
function initWorker() {
  try {
    aiWorker = new Worker('js/ai-worker.js');
    aiWorker.onmessage = e => { const cb = aiPending.get(e.data.id); if (cb) { aiPending.delete(e.data.id); cb(e.data.move); } };
    aiWorker.onerror = () => {
      aiWorker = null;
      for (const [id, cb] of aiPending) { aiPending.delete(id); cb(undefined); }
    };
  } catch (e) { aiWorker = null; }
}
function requestAiMove(payload) {
  return new Promise(resolve => {
    const local = () => setTimeout(() => resolve(aiChooseMove(payload)), 20);
    if (!aiWorker) return local();
    const id = ++aiReqId;
    aiPending.set(id, mv => mv === undefined ? local() : resolve(mv));
    aiWorker.postMessage({ id, payload });
    setTimeout(() => { if (aiPending.has(id)) { aiPending.delete(id); resolve(aiChooseMove({ ...payload, level:'easy' })); } }, 9000);
  });
}
async function aiTurn(ep) {
  const col = G.aiColor, level = G.level;
  renderStatus(true);
  const t0 = Date.now();
  await sleep(350);
  if (!alive(ep)) return;
  const moves = realLegalMoves(G, col);
  const forced = moves.length === 0;
  const chance = { easy:.22, medium:.45, hard:1 }[level];
  let card = null;
  if (forced || Math.random() < chance) card = aiPickCard(G, col, level, forced);
  if (card) {
    await sleep(Math.max(0, 700 - (Date.now() - t0)));
    if (!alive(ep)) return;
    return performCard(card.id, card.picks, col);
  }
  if (forced) { finishGame({ over:true, winner:opp(col), reason:'checkmate' }); return; }
  const payload = {
    board:G.state.board, turn:G.state.turn, castling:G.state.castling, ep:G.state.ep, walls:G.state.walls, level,
    frozen:G.effects.frozen.filter(f => G.ply < f.expire).map(f => ({ r:f.r, c:f.c })),
    warded:allSquares().filter(t => { const p = pieceAt(G, t.r, t.c); return p && color(p) !== col && isWarded(G, t.r, t.c, color(p)); }),
  };
  let mv = await requestAiMove(payload);
  if (!alive(ep)) return;
  const legal = realLegalMoves(G, col);
  const match = mv && legal.find(m => m.from.r===mv.from.r && m.from.c===mv.from.c && m.to.r===mv.to.r && m.to.c===mv.to.c);
  mv = match ? { ...match, promoChoice:mv.promoChoice || 'q' } : legal[(Math.random()*legal.length)|0];
  const minThink = Store.settings.fastAi ? 250 : 800;
  await sleep(Math.max(0, minThink - (Date.now() - t0)));
  if (!alive(ep)) return;
  await performMove(mv);
}

/* ------------------------------------------------------------ end of game */
function finishGame(end) {
  if (G.over) return;
  G.over = true;
  UI.busy = true; UI.pending = null;
  $('#targetBar').classList.remove('show');
  closeInspector();
  renderAll();
  const st = Store.stats;
  st.games++;
  let outcome = 'draw', title, sub;
  const reasonText = { checkmate:'by checkmate', stalemate:'Stalemate: no legal moves left.', insufficient:'Only kings remain, so nobody can win.', resign:'by resignation' }[end.reason];
  if (G.mode === 'ai') {
    const rec = st.ai[G.level];
    if (!end.winner) { outcome = 'draw'; rec.d++; st.streak = 0; title = 'Draw'; sub = reasonText; }
    else if (end.winner === G.humanColor) {
      outcome = 'win'; rec.w++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak);
      const moves = Math.ceil(G.moveCount / 2);
      if (!st.fastestWin || moves < st.fastestWin) st.fastestWin = moves;
      title = 'Victory!'; sub = `You defeated ${AI_NAMES[G.level].name} ${reasonText}.`;
    } else { outcome = 'lose'; rec.l++; st.streak = 0; title = 'Defeat'; sub = `${AI_NAMES[G.level].name} wins ${reasonText}.`; }
    const pc = Progress.data.c;
    if (outcome === 'win') {
      pc.wins++; pc.aiWins[G.level]++; pc.streak++; pc.bestStreak = Math.max(pc.bestStreak, pc.streak);
      if (Math.ceil(G.moveCount / 2) <= 20) pc.quickWins++;
      if (!G.cardsPlayed[G.humanColor]) pc.cleanWins++;
    } else pc.streak = 0;
  } else {
    st.pvp++; Progress.data.c.pvp++;
    if (end.winner) { outcome = 'win'; title = `${COLOR_NAME[end.winner]} Wins!`; sub = `${COLOR_NAME[end.winner]} wins ${reasonText}.`; }
    else { title = 'Draw'; sub = reasonText; }
  }
  const earned = G.mode === 'ai'
    ? (outcome === 'win' ? XP.win + (XP.winBonus[G.level] || 0) : outcome === 'draw' ? XP.draw : XP.loss)
    : XP.pvpFinish;
  gainGambits(earned);
  Store.saveStats();
  Progress.save();
  earnCheck(false);
  for (const m of claimMilestones()) UI.rewards.push({ milestone:m.milestone, card:m.card });
  addLog(title + ' ' + sub);
  if (end.winner) { champReact(end.winner, 'cheer'); champReact(opp(end.winner), 'slump'); }
  Sound.play(outcome === 'win' ? 'win' : outcome === 'lose' ? 'lose' : 'draw');
  Haptics.pulse(outcome === 'win' ? 'heavy' : 'medium');
  setTimeout(() => {
    if (outcome === 'win') {
      for (let i=0;i<4;i++) setTimeout(() => burst(innerWidth * (.2 + Math.random()*.6), innerHeight * (.25 + Math.random()*.3), { count:34, colors:['#fff3c4','#ffd35c','#5fe8b4','#ffffff'], spread:160, size:[4,10] }), i*260);
    }
    const lm = UI.lastMatch;
    showModal(`<div class="end-box ${outcome}"><div class="end-rays"></div>
      <div class="end-title">${title}</div><div class="end-sub">${sub}</div>
      <div class="end-stats"><div><b>+${G.gambits || 0}</b>Gambits</div><div><b>${G.cardsPlayed.w + G.cardsPlayed.b}</b>Cards played</div>
      ${G.mode === 'ai' ? `<div><b>${st.ai[G.level].w}</b>Wins vs ${AI_NAMES[G.level].title}</div>` : ''}</div></div>`,
      [{ label:'Play Again', primary:true, fn:() => { closeModal(); startMatch(lm.mode, lm.level); } },
       { label:'Back to Hall', fn:() => { closeModal(); UI.epoch++; UI.screenStack = ['scrTitle']; enterLobby(); } }], { noDismiss:true });
    if (UI.rewards.length) setTimeout(flushRewards, 1400);
  }, 900);
}

/* ============================================================ modals */
function showModal(html, buttons=[], opts={}) {
  const box = $('#modalBox');
  box.innerHTML = html;
  if (buttons.length) {
    const act = h(`<div class="modal-actions${opts.row ? ' row' : ''}"></div>`);
    for (const b of buttons) {
      const btn = h(`<button class="plaque${b.primary ? ' primary' : ''}${b.danger ? ' danger' : ''}">${b.label}</button>`);
      btn.addEventListener('click', () => { Sound.play('tap'); b.fn(); });
      act.append(btn);
    }
    box.append(act);
  }
  box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
  UI.modalDismiss = opts.noDismiss ? null : (opts.onDismiss || closeModal);
  $('#modal').classList.add('show');
}
function closeModal(){ $('#modal').classList.remove('show'); UI.modalDismiss = null; }
function modalOpen(){ return $('#modal').classList.contains('show'); }

function askPromotion(col) {
  return new Promise(resolve => {
    showModal(`<h3>Promote your pawn</h3><div class="promo-row">${['q','r','b','n'].map(t => `<button class="promo-btn" data-t="${t}">${pieceArt(col+t, setFor(col))}</button>`).join('')}</div>`, [], { noDismiss:true });
    $('#modalBox').querySelectorAll('.promo-btn').forEach(b => b.addEventListener('click', () => { Sound.play('reveal'); closeModal(); resolve(b.dataset.t); }));
  });
}
function peekCard(id, caption) {
  return new Promise(resolve => {
    openInspector(id, null, { mode:'peek', caption: caption || `Spy Glass reveals one of ${playerName(opp(viewColor())) === 'You' ? 'your' : playerName(opp(viewColor())) + "'s"} cards!`, onClose:resolve });
  });
}
function openDifficulty() {
  const rec = l => { const r = Store.stats.ai[l]; return `${r.w}W &middot; ${r.l}L${r.d ? ' &middot; ' + r.d + 'D' : ''}`; };
  const row = (l, desc, piece) => `<button class="diff" data-l="${l}"><div class="crest">${avatarNode(AI_AVATARS[l], { ring:false })}</div>
    <div><b>${AI_NAMES[l].title}</b><span>${AI_NAMES[l].name} &middot; ${desc}</span></div><div class="rec">${rec(l)}</div></button>`;
  showModal(`<h3>Choose your foe</h3><div class="diff-list">
    ${row('easy','casual, makes mistakes','p')}${row('medium','solid tactics','n')}${row('hard','ruthless, cheats cleverly','q')}</div>`,
    [{ label:'Cancel', fn:closeModal }]);
  $('#modalBox').querySelectorAll('.diff').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); closeModal(); startMatch('ai', b.dataset.l); }));
}
function openHowTo(then) {
  showModal(`<h3>How to Play</h3><div class="modal-body rules">
    <p>It's <b>normal chess</b>: checkmate the enemy king to win. Castling, en passant and promotion all work.</p>
    <h4>The cheat cards</h4>
    <p>Each player is secretly dealt <b>3 cheat cards</b> from a shared deck. On your turn you either <b>move a piece</b> or <b>play one card</b>. Playing a card uses up your whole turn (unless the card says otherwise).</p>
    <h4>Your deck</h4>
    <p>There are <b>50 cards</b> in the game and you start with 20. Your deck holds <b>20 cards, one copy of each</b>, so you never draw a duplicate. Build it in the Hall before you play.</p>
    <p>Unlock the other 30 by completing <b>Challenges</b> and by earning <b>Gambits</b>. Harder challenges pay out rarer cards.</p>
    <h4>Gambits</h4>
    <p>You earn Gambits for taking a piece, casting a card, and finishing a game, with the most for a win. They raise your rank from Apprentice to Knight to Grandmaster, hand you a free card at every milestone, and buy looks in the shop. Spending them never costs you rank or milestones.</p>
    <p><b>Tap a card</b> in your hand to inspect it and read what it does. Tap <b>Activate</b>, then tap the glowing squares on the board.</p>
    <h4>Fair-play rules</h4>
    <p>You can't play a card that would leave your own king in check. Kings can't be destroyed by cards or traps. Your Poison Traps are invisible to your opponent.</p>
    <p>If you have no legal moves but still hold a usable card, you must play it. <b>King's Guard</b> works by itself: it saves you from checkmate once.</p>
    <h4>Draws</h4>
    <p>Stalemate, or only kings (or a king and one minor piece) left on the board.</p></div>`,
    [{ label:'Let’s Play', primary:true, fn:() => { closeModal(); if (then) then(); } }]);
}
function openGameMenu() {
  if (!G) return;
  showModal(`<h3>Paused</h3>`, [
    { label:'Resume', primary:true, fn:closeModal },
    { label:'How to Play', fn:() => openHowTo() },
    { label:'Cards', fn:() => { closeModal(); UI.deckDraft = null; showScreen('scrCards'); } },
    { label:'Challenges', fn:() => { closeModal(); showScreen('scrChallenges'); } },
    { label:'Settings', fn:() => { closeModal(); showScreen('scrSettings'); } },
    ...(G.over ? [] : [{ label:'Resign', danger:true, fn:() => confirmResign() }]),
    { label:'Quit to Title', fn:() => { closeModal(); goHome(); } },
  ]);
}
function confirmResign() {
  showModal(`<h3>Resign?</h3><div class="modal-body" style="text-align:center"><p>${G.mode === 'ai' ? 'This counts as a loss.' : COLOR_NAME[G.state.turn] + ' will resign the game.'}</p></div>`,
    [{ label:'Resign', danger:true, fn:() => { closeModal(); const loser = G.mode === 'ai' ? G.humanColor : G.state.turn; UI.epoch++; finishGame({ over:true, winner:opp(loser), reason:'resign' }); } },
     { label:'Keep Playing', fn:closeModal }], { row:true });
}

/* ------------------------------------------------------------ curtain */
function passCurtain(col) {
  return new Promise(resolve => {
    $('#curtainCrest').innerHTML = avatarNode(col === 'w' ? myAvatar() : AI_AVATARS.rival, { ring:false });
    $('#curtainTitle').textContent = `${COLOR_NAME[col]}'s Turn`;
    $('#curtainText').textContent = `Pass the device to ${COLOR_NAME[col]}. No peeking at their cheat cards!`;
    closeInspector();
    $('#curtain').classList.add('show');
    $('#curtainGo').onclick = async () => {
      Sound.play('tap');
      UI.viewColor = col;
      UI.flip = col === 'b' && Store.settings.flipBoard;
      UI.playCache = {};
      renderBoard(); renderPlayers(); renderStatus();
      renderHands({ faceDown:true });
      hideCurtain();
      await sleep(250);
      await revealHand();
      resolve();
    };
  });
}
function hideCurtain(){ $('#curtain').classList.remove('show'); }

/* ============================================================ collection */
/* ============================================================ challenges */
function renderChallenges() {
  const d = Progress.data, un = unlockedRelics();
  const done = ACHIEVEMENTS.filter(a => d.achieved[a.id]).length;
  $('#challengesBody').innerHTML = `
    <div class="panel relic-panel"><h4>Relic Cards</h4>
      <div class="big">${un.length} / ${RELIC_IDS.length}</div>
      <div class="bar"><i style="width:${un.length / RELIC_IDS.length * 100}%"></i></div>
      <div style="font-size:.8rem;color:var(--ink-mute);font-weight:700">Every challenge you complete unlocks a card. Harder challenges pull from the rarer shelves.</div>
      <div class="relic-row" id="relicRow"></div>
    </div>
    <div class="panel"><h4>Challenges &middot; ${done}/${ACHIEVEMENTS.length} complete</h4><div id="chList"></div></div>`;
  const row = $('#relicRow');
  for (const id of RELIC_IDS) {
    if (un.includes(id)) {
      const el = makeCard(id, { compact:true });
      el.addEventListener('click', () => { Sound.play('tap'); openInspector(id, el, { mode:'view' }); });
      row.append(el);
    } else row.append(lockedCardEl());
  }
  const list = $('#chList');
  ACHIEVEMENTS.forEach((a, n) => {
    const got = d.achieved[a.id], prog = achievementProgress(a);
    const el = h(`<div class="ch${got ? ' done' : ''}" style="animation-delay:${n * 35}ms">
      <div class="ch-medal">${a.icon}</div>
      <div class="ch-body"><div class="ch-name">${a.name}</div><div class="ch-desc">${a.desc}</div>
        <div class="ch-foot"><div class="bar"><i style="width:${prog / a.target * 100}%"></i></div><span>${got ? 'Complete!' : prog + ' / ' + a.target}</span></div></div>
      <div class="ch-reward"></div></div>`);
    const rw = el.querySelector('.ch-reward');
    if (got && got.card) {
      const c = makeCard(got.card, { compact:true });
      c.addEventListener('click', () => { Sound.play('tap'); openInspector(got.card, c, { mode:'view' }); });
      rw.append(c);
    } else rw.append(h(`<div class="mystery">${got ? '★' : '?'}</div>`));
    list.append(el);
  });
}
/* ============================================================ rewards */
function earnCheck(midGame) {
  for (const e of checkAchievements()) {
    UI.rewards.push(e);
    if (midGame) toast(`🏆 Challenge complete: ${e.ach.name}!`, 3000);
  }
}
function showReward({ ach, card, milestone }) {
  return new Promise(resolve => {
    $('#reward').querySelector('.reward-kicker').textContent = ach ? 'Challenge Complete' : 'Gambit Milestone';
    $('#rewardTitle').textContent = ach ? ach.name : `${milestone.toLocaleString()} Gambits`;
    $('#rewardDesc').textContent = ach ? ach.desc : 'Your winnings have earned you a card from the vault.';
    const holder = $('#rewardCard'), note = $('#rewardNote'), btn = $('#rewardGo');
    holder.replaceChildren(); note.innerHTML = ''; btn.style.visibility = 'hidden';
    $('#reward').querySelectorAll('.reward-inner > *').forEach(e => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
    $('#reward').classList.add('show');
    Sound.play('win'); Haptics.pulse('medium');
    (async () => {
      await sleep(450);
      if (card) {
        const c = CARD_BY_ID[card], sc = SCHOOLS[c.school];
        const cw = Math.floor(Math.max(150, Math.min(innerWidth * .6, 240, (innerHeight - 330) / 1.4)));
        const el = makeCard(card, { cw, down:true });
        holder.append(el); fitCardText(el);
        Sound.play('whoosh');
        await el.animate([{ transform:'translateY(-110vh) rotate(-540deg) scale(.4)' }, { transform:'none' }], { duration:950, easing:'cubic-bezier(.2,.8,.3,1.1)' }).finished;
        el.animate([{ transform:'scale(1)' }, { transform:'scale(1.14)' }, { transform:'scale(1)' }], { duration:650, easing:'ease-in-out' });
        el.classList.remove('down');
        Sound.play('flip');
        await sleep(380);
        Sound.play('reveal'); Haptics.pulse('heavy');
        const r = el.getBoundingClientRect();
        burst(r.left + r.width/2, r.top + r.height/2, { count:56, colors:[sc.accent, sc.glow, '#fff3c4', '#ffd35c'], spread:230, size:[4,11] });
        note.innerHTML = `New ${RARITY[c.rarity].name} Relic unlocked: <b>${c.name}</b><br><span style="color:var(--ink-mute);font-weight:700">It's now shuffled into the deck.</span>`;
      } else {
        note.textContent = 'You already own every card in the game. More are on the way.';
      }
      btn.style.visibility = 'visible';
      btn.onclick = () => { Sound.play('tap'); $('#reward').classList.remove('show'); setTimeout(resolve, 280); };
    })();
  });
}
async function flushRewards() {
  if (UI.flushing) return;
  UI.flushing = true;
  while (UI.rewards.length) await showReward(UI.rewards.shift());
  UI.flushing = false;
  updateTitleBadges();
}

/* ============================================================ intro */
async function runIntro() {
  const intro = $('#intro'), cv = $('#introCanvas');
  const finish = () => { document.body.classList.remove('intro-on', 'tag-hidden'); intro.classList.add('gone'); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  try { document.fonts && document.fonts.load('700 24px Cinzel'); } catch (e) {}
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(Math.min(innerWidth * .86, 560)), H = Math.round(W * .24);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cv.style.transformOrigin = '50% 50%';
  const ctx = cv.getContext('2d');
  const low = document.createElement('canvas'), lctx = low.getContext('2d');
  const tint = document.createElement('canvas'), tctx = tint.getContext('2d');
  const TEXT = 'ARLO GAMES';
  let skip = false;
  intro.addEventListener('pointerdown', () => { skip = true; }, { once:true });

  const setFont = (fs, serif) => {
    lctx.font = serif ? `700 ${fs}px Cinzel, CinzelLocal, Georgia, serif` : `900 ${fs}px "Courier New", Courier, monospace`;
    try { lctx.letterSpacing = (fs * (serif ? .3 : .08)) + 'px'; } catch (e) {}
  };
  // draw the text tiny, then blow it up with no smoothing = real chunky pixels
  function renderLow(px, gold, serif) {
    const lw = Math.max(12, Math.round(cv.width / px)), lh = Math.max(5, Math.round(cv.height / px));
    low.width = lw; low.height = lh;
    let fs = lh * (serif ? .48 : .66);
    setFont(fs, serif);
    const w = lctx.measureText(TEXT).width;
    if (w > lw * .94) { fs *= lw * .94 / w; setFont(fs, serif); }
    lctx.textAlign = 'center'; lctx.textBaseline = 'middle';
    lctx.fillStyle = '#ffffff'; lctx.fillText(TEXT, lw/2, lh/2);
    if (gold > 0) {
      const gr = lctx.createLinearGradient(0, lh*.3, 0, lh*.7);
      gr.addColorStop(0, '#fff3c4'); gr.addColorStop(.5, '#e8c16a'); gr.addColorStop(1, '#b8862a');
      lctx.globalAlpha = gold; lctx.fillStyle = gr; lctx.fillText(TEXT, lw/2, lh/2); lctx.globalAlpha = 1;
    }
    return lctx.measureText(TEXT).width / lw;
  }
  function paint(px, gold, serif, glitch) {
    renderLow(px, gold, serif);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = px <= 1.2;
    if (glitch) { // chromatic split
      const off = (Math.random()*2 - 1) * cv.width * .018;
      for (const [c, dx] of [['#ff2a6a', off], ['#28f0ff', -off]]) {
        tint.width = low.width; tint.height = low.height;
        tctx.drawImage(low, 0, 0); tctx.globalCompositeOperation = 'source-in';
        tctx.fillStyle = c; tctx.fillRect(0, 0, tint.width, tint.height); tctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = .85; ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tint, dx, (Math.random()*2 - 1) * cv.height * .04, cv.width, cv.height);
      }
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(low, 0, 0, cv.width, cv.height);
    if (glitch) { // displaced slices + noise bars
      const k = cv.height / low.height;
      for (let i = 0; i < 4 + (Math.random()*5|0); i++) {
        const sy = (Math.random() * low.height) | 0, sh = Math.max(1, (Math.random() * low.height * .3) | 0);
        const dx = (Math.random()*2 - 1) * cv.width * .08;
        ctx.clearRect(0, sy*k, cv.width, sh*k);
        ctx.drawImage(low, 0, sy, low.width, sh, dx, sy*k, cv.width, sh*k);
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * .6})`;
        ctx.fillRect(Math.random() * cv.width, Math.random() * cv.height, Math.random() * cv.width * .4, 2 * dpr);
      }
    }
  }
  const bursts = [[380,560],[860,1060],[1260,1380],[1480,1700]];
  const t0 = performance.now();
  await new Promise(resolve => {
    const frame = now => {
      const e = skip ? 1e9 : now - t0;
      if (e >= 2450) { cv.style.opacity = 1; paint(1, 1, true, false); resolve(); return; }
      let px = 9, gold = 0, serif = false, glitch = false;
      cv.style.opacity = e < 280 ? (Math.random() < .55 ? 1 : .15) : 1;
      if (e < 1750) glitch = bursts.some(([a,b]) => e >= a && e < b) && Math.random() < .85;
      else {
        intro.classList.add('resolving');
        const p = (e - 1750) / 650, steps = [9,7,5,4,3,2,1.4,1];
        px = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
        gold = Math.min(1, p * 1.4); serif = p > .14; glitch = p < .14 && Math.random() < .6;
      }
      paint(px, gold, serif, glitch);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  intro.classList.add('resolving');
  if (!skip) await sleep(380);
  // fly the gold text onto the ARLO GAMES tag under the logo
  const rel = renderLow(1, 1, true);
  paint(1, 1, true, false);
  document.body.classList.add('tag-hidden');
  document.body.classList.remove('intro-on');
  const tr = $('#tagText').getBoundingClientRect(), cr = cv.getBoundingClientRect();
  const scale = tr.width / (cr.width * rel);
  intro.classList.add('clear');
  await cv.animate([{ transform:'none' }, { transform:`translate(${tr.left + tr.width/2 - (cr.left + cr.width/2)}px,${tr.top + tr.height/2 - (cr.top + cr.height/2)}px) scale(${scale})` }],
    { duration: skip ? 350 : 850, easing:'cubic-bezier(.65,0,.3,1)', fill:'forwards' }).finished;
  document.body.classList.remove('tag-hidden');
  await cv.animate([{ opacity:1 }, { opacity:0 }], { duration:350, fill:'forwards' }).finished;
  finish();
}

/* ============================================================ settings */
function renderSettings() {
  const s = Store.settings, st = Store.stats;
  const sw = (key, label, sub) => `<div class="setting"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><button class="switch${s[key] ? ' on' : ''}" data-key="${key}" aria-label="${label}"></button></div>`;
  const themes = { jade:['#e4eddc','#3e8173','Jade Grove'], moon:['#dfe4f2','#56628f','Moonlit'], ember:['#f2e2c6','#a0603f','Ember Hall'] };
  const fav = Object.entries(st.cardUse).sort((a,b) => b[1]-a[1])[0];
  const totW = st.ai.easy.w + st.ai.medium.w + st.ai.hard.w;
  $('#settingsBody').innerHTML = `
    <div class="panel"><h4>Sound &amp; Feel</h4>
      ${sw('sfx','Sound effects')}${sw('music','Music','Ambient enchanted-forest score')}${sw('haptics','Vibration','Buzz on captures, spells and checks')}
    </div>
    <div class="panel"><h4>Gameplay</h4>
      ${sw('hints','Show legal moves','Glowing dots where the selected piece can go')}
      ${sw('flipBoard','Flip board for Obsidian','In Pass &amp; Play, turn the board to face each player')}
      ${sw('fastAi','Fast computer','Shorter thinking pauses')}
      <div class="setting"><span>Board theme<small>${themes[s.boardTheme][2]}</small></span><div class="swatches">
        ${Object.entries(themes).map(([k,[a,b]]) => `<button class="swatch${s.boardTheme === k ? ' on' : ''}" data-theme="${k}" aria-label="${themes[k][2]}"><i style="background:${a}"></i><i style="background:${b}"></i><i style="background:${b}"></i><i style="background:${a}"></i></button>`).join('')}
      </div></div>
    </div>
    <div class="panel"><h4>Your Record</h4>
      <div class="stat-grid">
        <div class="stat"><b>${st.games}</b><span>Games</span></div>
        <div class="stat"><b>${totW}</b><span>Wins</span></div>
        <div class="stat"><b>${st.bestStreak}</b><span>Best streak</span></div>
        <div class="stat"><b>${st.cardsPlayed}</b><span>Cards cast</span></div>
        <div class="stat"><b>${st.fastestWin || '0'}</b><span>Fastest win</span></div>
        <div class="stat"><b>${st.pvp}</b><span>Pass &amp; Play</span></div>
      </div>
      <table class="rec-table"><tr><th></th><th>WON</th><th>LOST</th><th>DRAWN</th></tr>
        ${['easy','medium','hard'].map(l => `<tr><td>${AI_NAMES[l].title}</td><td>${st.ai[l].w}</td><td>${st.ai[l].l}</td><td>${st.ai[l].d}</td></tr>`).join('')}
      </table>
      ${fav ? `<div class="setting" style="margin-top:6px"><span>Favourite cheat<small>Played ${fav[1]} time${fav[1] === 1 ? '' : 's'}</small></span><b style="font-family:var(--f-head);color:var(--gold-hi)">${CARD_BY_ID[fav[0]].name}</b></div>` : ''}
      <div style="margin-top:12px"><button class="plaque small danger" id="btnResetStats" style="width:100%">Reset Stats</button></div>
    </div>
    <div class="about">Cheat Chess v1.2 &middot; Arlo Games<br>No accounts, no ads, no tracking. Your stats never leave this device.</div>`;
  $('#settingsBody').querySelectorAll('.switch').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.key;
    s[k] = !s[k];
    Store.saveSettings(); applySettings(); Sound.play('tap'); renderSettings();
  }));
  $('#settingsBody').querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => {
    s.boardTheme = b.dataset.theme; Store.saveSettings(); applySettings(); Sound.play('tap'); renderSettings();
  }));
  $('#btnResetStats').addEventListener('click', () => {
    showModal('<h3>Reset stats?</h3><div class="modal-body" style="text-align:center"><p>Your win record and card history will be wiped.</p></div>',
      [{ label:'Reset', danger:true, fn:() => { Store.resetStats(); closeModal(); renderSettings(); } }, { label:'Cancel', fn:closeModal }], { row:true });
  });
}
function applySettings() {
  const s = Store.settings;
  document.body.dataset.board = s.boardTheme;
  Sound.setSfx(s.sfx);
  Sound.setMusic(s.music);
  $('#btnSound').innerHTML = (s.sfx || s.music) ? ICON.sound : ICON.mute;
  if (G && $('#scrGame').classList.contains('active')) renderBoard();
}

/* ============================================================ android / back */
function handleBack() {
  if ($('#reward').classList.contains('show') || !$('#intro').classList.contains('gone')) return true;
  if ($('#inspector').classList.contains('show')) { closeInspector(); return true; }
  if (modalOpen()) { if (UI.modalDismiss) UI.modalDismiss(); return true; }
  if ($('#curtain').classList.contains('show')) return true;
  if (UI.pending) { cancelTargeting(); return true; }
  const cur = UI.screenStack[UI.screenStack.length-1];
  if (cur === 'scrGame') { openGameMenu(); return true; }
  if (cur !== 'scrTitle') { goBack(); return true; }
  return false;
}
function setupNative() {
  const cap = window.Capacitor;
  if (!cap || !cap.Plugins) return;
  const { App, StatusBar, SplashScreen } = cap.Plugins;
  try { StatusBar && StatusBar.hide(); } catch (e) {}
  try { SplashScreen && SplashScreen.hide(); } catch (e) {}
  try {
    App && App.addListener('backButton', () => { if (!handleBack()) App.exitApp(); });
    App && App.addListener('pause', () => { if (G && !G.over && $('#scrGame').classList.contains('active') && !modalOpen()) openGameMenu(); });
  } catch (e) {}
}

/* ============================================================ init */
function init() {
  migrateProfile();
  document.body.insertAdjacentHTML('afterbegin', ART_DEFS);
  document.body.insertAdjacentHTML('afterbegin', PIECE_SET_DEFS);
  runIntro();
  fillIcons();
  buildTitle();
  applySettings();
  layout();
  initWorker();
  setupInspectorTilt();
  setupNative();
  touchDaily();
  updateTitleBadges();
  window.addEventListener('resize', () => { layout(); if (G && $('#scrGame').classList.contains('active')) renderAll(); });

  // unlock audio on first touch
  const unlock = () => { Sound.init(); if (Store.settings.music) Sound.startMusic(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);

  document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    Sound.play('tap');
    const a = b.dataset.act;
    if (a === 'vsai') { if (!Store.settings.seenRules) { Store.settings.seenRules = true; Store.saveSettings(); openHowTo(openDifficulty); } else openDifficulty(); }
    if (a === 'lobby') { if (!Store.settings.seenRules && Progress.data.avatar) { Store.settings.seenRules = true; Store.saveSettings(); openHowTo(enterLobby); } else enterLobby(); }
    if (a === 'pvp') startMatch('human');
    if (a === 'cards') { UI.deckDraft = null; showScreen('scrCards'); }
    if (a === 'settings') showScreen('scrSettings');
    if (a === 'challenges') showScreen('scrChallenges');
    if (a === 'howto') openHowTo();
  }));
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); showScreen(b.dataset.go); }));
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); goBack(); }));
  $('#board').addEventListener('click', onBoardTap);
  $('#btnMenu').addEventListener('click', () => { Sound.play('tap'); openGameMenu(); });
  $('#btnSound').addEventListener('click', () => {
    const s = Store.settings, on = !(s.sfx || s.music);
    s.sfx = on; s.music = on; Store.saveSettings(); Sound.init(); applySettings();
    toast(on ? 'Sound on' : 'Sound off', 1200);
  });
  $('#deckSave').addEventListener('click', saveDeck);
  $('#deckAuto').addEventListener('click', () => { Sound.play('tap'); UI.deckDraft = autoDeck(ownedCards()); renderCards(); });
  $('#tbCancel').addEventListener('click', () => { Sound.play('tap'); cancelTargeting(); });
  $('#inspPlay').addEventListener('click', onActivate);
  $('#inspBack').addEventListener('click', () => { Sound.play('tap'); closeInspector(); });
  $('#inspector').addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeInspector(); });
  $('#modalBackdrop').addEventListener('click', () => { if (UI.modalDismiss) UI.modalDismiss(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') handleBack(); });
  document.addEventListener('contextmenu', e => e.preventDefault());
}
init();

/* ============================================================ Gambits */
function gambitFloat(x, y, amount) {
  const el = h(`<div class="xp-float">+${amount}</div>`);
  el.style.left = x + 'px'; el.style.top = y + 'px';
  document.body.append(el);
  setTimeout(() => el.remove(), 1200);
}
function gainGambits(amount, at) {
  if (!amount) return;
  if (G) G.gambits = (G.gambits || 0) + amount;
  awardXp(amount);
  if (at) gambitFloat(at.x, at.y, amount);
}

/* ============================================================ champion */
function renderAvatarScreen(creating) {
  const P = Progress.data;
  if (!UI.avDraft) UI.avDraft = { ...DEFAULT_AVATAR, ...(P.avatar || {}) };
  const av = UI.avDraft;
  $('#avatarPreview').innerHTML = avatarNode(av);
  $('#avatarTitle h2').firstChild.textContent = creating ? 'Create Your Champion' : 'Your Champion';
  $('#avatarSub').textContent = creating ? 'You can change all of this later in the shop.' : rankName(playerLevel());
  const row = (label, html) => `<div class="pick-row"><span>${label}</span><div class="picks">${html}</div></div>`;
  const hidden = gearCoversHead(av.gear);

  const skins = Array.from({ length:AVATAR_ART.skins }, (_, i) =>
    `<button class="pick av${av.skin === i ? ' on' : ''}" data-k="skin" data-v="${i}">${avatarNode({ ...av, skin:i, gear:'none', pet:'none' }, { head:true, noPet:true })}</button>`).join('');
  const hairIds = [...AVATAR_ART.hair, 'none'];
  const hair = hairIds.map(k =>
    `<button class="pick av${av.hair === k ? ' on' : ''}" data-k="hair" data-v="${k}">${avatarNode({ ...av, hair:k, gear:'none', pet:'none' }, { head:true, noPet:true })}</button>`).join('');

  $('#avatarOptions').innerHTML =
    row('Skin', skins) +
    (hidden ? `<div class="pick-row"><span>Hair</span><div class="picks"><span class="pick-note">Hidden under your helm. Change your gear to show it.</span></div></div>` : row('Hair', hair)) +
    (creating ? '' : `<div class="pick-row"><span>Gear</span><div class="picks wide">
      <button class="plaque small" data-shop="armour">Armour</button>
      <button class="plaque small" data-shop="outfits">Outfits</button>
      <button class="plaque small" data-shop="pets">Companion</button>
      <button class="plaque small" data-shop="pieces">Chess Set</button></div></div>`);

  $('#avatarOptions').querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k;
    av[k] = k === 'skin' ? +b.dataset.v : b.dataset.v;
    Sound.play('tap');
    if (!creating) { Progress.data.avatar = { ...av }; Progress.save(); }
    renderAvatarScreen(creating);
  }));
  $('#avatarOptions').querySelectorAll('[data-shop]').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); UI.shopTab = b.dataset.shop; showScreen('scrShop'); }));
  $('#avatarDone').textContent = creating ? 'Enter the Hall' : 'Done';
  $('#avatarDone').onclick = () => {
    Sound.play('tap');
    Progress.data.avatar = { ...UI.avDraft };
    Progress.save();
    if (creating) { UI.screenStack = ['scrTitle']; enterLobby(); }
    else goBack();
  };
  $('#avatarBack').style.display = creating ? 'none' : '';
}

/* ============================================================ shop */
function renderShop() {
  const P = Progress.data;
  if (!UI.shopTab) UI.shopTab = 'pieces';
  $('#shopGambits').textContent = P.xp.balance.toLocaleString();
  $('#shopTabs').innerHTML = SHOP_TABS.map(t => `<button class="chip${UI.shopTab === t.key ? ' on' : ''}" data-t="${t.key}">${t.name}</button>`).join('');
  $('#shopTabs').querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); UI.shopTab = b.dataset.t; renderShop(); }));
  const tab = UI.shopTab;
  const grid = $('#shopGrid');
  grid.replaceChildren();
  if (!ownsPack() && SHOP[tab].some(i => i.premium)) {
    const show = LEGENDARY_PACK.showcase.map(sc => ({ tab:sc.tab, item:shopItem(sc.tab, sc.id) }));
    const banner = h(`<div class="pack-banner">
      <div class="pack-icons">${show.map(({ tab, item }) => tab === 'pieces'
        ? `<span class="pv-set"><span class="pv-piece">${pieceArt('wq', item.id)}</span><span class="pv-piece">${pieceArt('wn', item.id)}</span></span>`
        : `<span class="pv-mini">${avatarNode({ ...myAvatar(), gear:item.id }, { ring:false, noPet:true })}</span>`).join('')}</div>
      <div class="pack-text"><b>${LEGENDARY_PACK.name}</b><span>${show.map(s => s.item.name).join(', ')} and ${legendaryItems().length - 3} more. Looks only.</span></div>
      <button class="plaque small legendary" id="packBuy">&pound;${LEGENDARY_PACK.price}</button></div>`);
    banner.querySelector('#packBuy').addEventListener('click', () => { Sound.play('tap'); openPackOffer(); });
    grid.append(banner);
  }
  for (const item of SHOP[tab]) {
    const owned = ownsItem(tab, item.id), on = equippedItem(tab) === item.id;
    const worn = tab === 'pets' ? { ...myAvatar(), pet:item.id } : { ...myAvatar(), gear:item.id };
    const preview = tab === 'pieces'
      ? `<button class="set-preview zoomable" data-zoom="1">${['k','q','n'].map(t => `<div class="pv-piece">${pieceArt('w'+t, item.id)}</div>`).join('')}<span class="zoom-hint">${ICON.expand}</span></button>`
      : `<button class="av-preview zoomable" data-zoom="1">${avatarNode(worn, { ring:false, noPet:tab !== 'pets' })}<span class="zoom-hint">${ICON.expand}</span></button>`;
    const locked = itemLocked(tab, item.id);
    const btn = item.premium && !owned ? `<button class="plaque small legendary" data-pack="1">In the Pack</button>`
      : owned ? `<button class="plaque small${on ? ' primary' : ''}" data-equip="${item.id}"${on ? ' disabled' : ''}>${on ? 'Equipped' : 'Equip'}</button>`
      : locked ? `<button class="plaque small" data-locked="1">${ICON.lock}Challenges</button>`
      : `<button class="plaque small" data-buy="${item.id}"><span class="coin"></span>${item.price.toLocaleString()}</button>`;
    const card = h(`<div class="shop-item${item.premium ? ' premium' : ''}${on ? ' on' : ''}${locked ? ' locked-item' : ''}">
      ${preview}
      <div class="shop-name">${item.name}${item.premium ? '<span class="legend-tag">Legendary</span>' : ''}</div>
      <div class="shop-desc">${item.desc}</div>
      <div class="shop-buy">${btn}</div></div>`);
    card.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => openItemView(tab, item)));
    card.querySelectorAll('[data-equip]').forEach(b => b.addEventListener('click', () => {
      Sound.play('reveal'); equipItem(tab, item.id); renderShop();
    }));
    card.querySelectorAll('[data-pack]').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); openPackOffer(); }));
    card.querySelectorAll('[data-locked]').forEach(b => b.addEventListener('click', () => {
      Sound.play('error');
      const left = ACHIEVEMENTS.filter(a => !Progress.data.achieved[a.id]).length;
      toast(`${item.name} unlocks when every challenge is done. ${left} to go.`, 3200);
    }));
    card.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', async () => {
      if (P.xp.balance < item.price) { Sound.play('error'); toast(`You need ${(item.price - P.xp.balance).toLocaleString()} more Gambits.`); return; }
      showModal(`<h3>Buy ${item.name}?</h3><div class="modal-body" style="text-align:center">
        <p>${item.desc}</p><p><b>${item.price.toLocaleString()} Gambits.</b> You have ${P.xp.balance.toLocaleString()}.</p>
        <p style="font-size:.8rem;color:var(--ink-mute)">Spending Gambits never lowers your rank or your card milestones.</p></div>`,
        [{ label:'Buy', primary:true, fn:() => {
            closeModal();
            if (buyItem(tab, item.id)) { equipItem(tab, item.id); Sound.play('win'); Haptics.pulse('medium'); toast(`${item.name} is yours.`); renderShop(); }
          } },
         { label:'Not now', fn:closeModal }], { row:true });
    }));
    grid.append(card);
  }
}


/* Show a whole hand, for Pilfer. */
function showHandReveal(ids) {
  const cw = Math.min(110, (innerWidth - 80) / Math.max(2, ids.length));
  showModal(`<h3>Their Hand</h3><div class="hand-reveal">${ids.map(id => makeCard(id, { compact:true, cw }).outerHTML).join('')}</div>`,
    [{ label:'Got it', primary:true, fn:closeModal }]);
}
/* ============================================================ cosmetics */
const AI_SETS = { easy:'classic', medium:'bone', hard:'amethyst' };
function setFor(col) {
  const mine = Progress.data.equipped.pieces || 'classic';
  if (!G) return mine;
  if (G.mode === 'ai') return col === G.humanColor ? mine : (AI_SETS[G.level] || 'classic');
  return col === 'w' ? mine : 'classic';
}
function myAvatar(){ return Progress.data.avatar || DEFAULT_AVATAR; }
function avatarFor(col) {
  if (!G) return myAvatar();
  if (G.mode === 'ai') return col === G.humanColor ? myAvatar() : AI_AVATARS[G.level];
  return col === 'w' ? myAvatar() : AI_AVATARS.rival;
}

/* ============================================================ the hall */
function renderLobby() {
  const P = Progress.data, lp = levelProgress();
  $('#lobbyRank').textContent = lp.name;
  $('#lobbyXpBar').style.width = Math.max(3, lp.pct) + '%';
  $('#lobbyXp').textContent = lp.level >= MAX_LEVEL ? 'Highest rank reached' : `${(lp.to - lp.have).toLocaleString()} to ${rankName(lp.level + 1)}`;
  $('#lobbyGambits').textContent = P.xp.balance.toLocaleString();
  $('#heroFront').innerHTML = avatarNode(P.avatar, { ring:false });
  const chDone = ACHIEVEMENTS.filter(a => P.achieved[a.id]).length;
  const fresh = ownedCards().filter(id => RELIC_IDS.includes(id) && !P.seen.includes(id)).length;
  const rail = (host, items) => {
    host.innerHTML = items.map(i => `<button class="rail-btn" data-act="${i.act}">
      <span class="rail-ico">${ICON[i.icon]}</span><span class="rail-label">${i.label}</span>
      ${i.badge ? `<span class="badge${i.hot ? ' new' : ''}">${i.badge}</span>` : ''}</button>`).join('');
    host.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => { Sound.play('tap'); lobbyAction(b.dataset.act); }));
  };
  rail($('#railLeft'), [
    { act:'cards', icon:'cards', label:'Cards', badge: fresh ? 'NEW' : `${ownedCards().length}/${CARDS.length}`, hot:!!fresh },
    { act:'avatar', icon:'helm', label:'Champion' },
  ]);
  rail($('#railRight'), [
    { act:'challenges', icon:'trophy', label:'Challenges', badge:`${chDone}/${ACHIEVEMENTS.length}` },
  ]);
  setupHeroSpin();
}
function lobbyAction(a) {
  if (a === 'vsai') return openDifficulty();
  if (a === 'pvp') return startMatch('human');
  if (a === 'cards') return showScreen('scrCards');
  if (a === 'avatar') return showScreen('scrAvatar');
  if (a === 'shop') return showScreen('scrShop');
  if (a === 'challenges') return showScreen('scrChallenges');
  if (a === 'howto') return openHowTo();
  if (a === 'settings') return showScreen('scrSettings');
}
/* The champion stands in the hall. Tapping him opens the champion screen. */
function setupHeroSpin() {
  const stage = $('#lobbyHero');
  if (stage.dataset.wired) return;
  stage.dataset.wired = 1;
  stage.addEventListener('click', () => { Sound.play('tap'); showScreen('scrAvatar'); });
}

/* Entering the hall: make an avatar first, then hand out anything owed. */
function enterLobby() {
  if (!Progress.data.avatar) { showScreen('scrAvatar'); renderAvatarScreen(true); return; }
  showScreen('scrLobby');
  earnCheck(false);
  const owed = claimMilestones();
  for (const m of owed) UI.rewards.push({ milestone:m.milestone, card:m.card });
  if (UI.rewards.length) setTimeout(flushRewards, 400);
}

/* ============================================================ cards screen */
let codexFilter = 'all';
function lockedCardEl(cw) {
  const d = makeBack(cw);
  d.classList.add('locked');
  d.append(h(`<div class="lock">${ICON.lock}LOCKED</div>`));
  return d;
}
/* ============================================================ cards
   One screen: the deck along the top, the whole collection under it. Tap any
   card to read it, tap the corner button to move it in or out of the deck, or
   drag it into the tray. */
function inDeck(id){ return UI.deckDraft.includes(id); }
function deckAdd(id) {
  if (inDeck(id)) return false;
  if (UI.deckDraft.length >= DECK_SIZE) { Sound.play('error'); toast('Your deck is full at ' + DECK_SIZE + ' cards. Take one out first.'); return false; }
  UI.deckDraft.push(id); Sound.play('select'); Haptics.pulse('light');
  return true;
}
function deckRemove(id) {
  const i = UI.deckDraft.indexOf(id);
  if (i < 0) return false;
  UI.deckDraft.splice(i, 1); Sound.play('tap');
  return true;
}
function deckToggle(id) {
  const changed = inDeck(id) ? deckRemove(id) : deckAdd(id);
  if (changed) renderCards();
  return changed;
}

function renderCards() {
  if (!UI.deckDraft) UI.deckDraft = playerDeck();
  const owned = ownedCards(), draft = UI.deckDraft;
  const full = draft.length === DECK_SIZE;
  $('#deckCount').textContent = draft.length + '/' + DECK_SIZE;
  $('#deckCount').className = 'deck-count' + (full ? ' full' : '');
  $('#cardsSub').textContent = owned.length + ' of ' + CARDS.length + ' collected';
  const free = DECK_SIZE - draft.length;
  $('#trayHint').textContent = full ? 'Ready to play' : free + (free === 1 ? ' slot free' : ' slots free');
  $('#deckSave').classList.toggle('ready', full);

  /* ---- the tray: your twenty, plus the slots still to fill ---- */
  const strip = $('#trayStrip');
  strip.replaceChildren();
  for (const id of draft) {
    const el = makeCard(id, { compact:true, cw:58 });
    el.classList.add('tray-card');
    el.addEventListener('click', () => { Sound.play('tap'); openCardView(id, el); });
    const out = h('<button class="card-pin out" aria-label="Remove from deck">&minus;</button>');
    out.addEventListener('click', e => { e.stopPropagation(); deckToggle(id); });
    el.append(out);
    setupCardDrag(el, id, 'deck');
    strip.append(el);
  }
  for (let i = draft.length; i < DECK_SIZE; i++) strip.append(h('<div class="tray-slot"></div>'));

  /* ---- the collection ---- */
  $('#codexChips').innerHTML = [['all', 'All', ''], ...Object.entries(SCHOOLS).map(([k, sc]) => [k, sc.name, SCHOOL_GLYPH[k]])]
    .map(([k, name, g]) => '<button class="chip' + (codexFilter === k ? ' on' : '') + '" data-k="' + k + '">' + g + name + '</button>').join('');
  $('#codexChips').querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { Sound.play('tap'); codexFilter = c.dataset.k; renderCards(); }));

  const grid = $('#cardsGrid');
  grid.replaceChildren();
  const seen = Progress.data.seen;
  const show = c => codexFilter === 'all' || c.school === codexFilter;
  let i = 0;
  const addCard = c => {
    const el = makeCard(c.id, { compact:true });
    el.style.animationDelay = (Math.min(i++, 14) * 35) + 'ms';
    if (c.set === 'relic' && !seen.includes(c.id)) el.append(h('<div class="new-tag">NEW</div>'));
    const on = inDeck(c.id);
    if (on) el.classList.add('picked');
    el.addEventListener('click', () => { Sound.play('tap'); openCardView(c.id, el); });
    const pin = h('<button class="card-pin' + (on ? ' out' : '') + '" aria-label="' + (on ? 'Remove from deck' : 'Add to deck') + '">' + (on ? '&minus;' : '+') + '</button>');
    pin.addEventListener('click', e => { e.stopPropagation(); deckToggle(c.id); });
    el.append(pin);
    setupCardDrag(el, c.id, 'collection');
    grid.append(el);
  };
  const un = unlockedRelics();
  grid.append(h('<div class="codex-head">Core Deck<small>' + CORE_IDS.length + ' cards</small></div>'));
  CARDS.filter(c => c.set === 'core' && show(c)).forEach(addCard);
  grid.append(h('<div class="codex-head">Relic Cards<small>' + un.length + '/' + RELIC_IDS.length + ' unlocked</small></div>'));
  CARDS.filter(c => c.set === 'relic' && (un.includes(c.id) ? show(c) : codexFilter === 'all')).forEach(c => {
    if (un.includes(c.id)) return addCard(c);
    const el = lockedCardEl();
    el.style.animationDelay = (Math.min(i++, 14) * 35) + 'ms';
    el.addEventListener('click', () => { Sound.play('error'); toast('Complete a challenge to unlock this Relic card.'); });
    grid.append(el);
  });
  Progress.data.seen = un.slice();
  Progress.save();
}

/* A card opened from the collection carries its deck button. */
function openCardView(id, srcEl) {
  openInspector(id, srcEl, { mode:'view', action:{
    label: inDeck(id) ? 'Remove from Deck' : 'Add to Deck',
    fn: () => { if (deckToggle(id)) closeInspector(); },
  } });
}

/* ---------------------------------------------- drag a card into the deck
   A mouse drags straight away. A finger has to hold for a moment first, so a
   swipe still scrolls the list. */
function setupCardDrag(el, id, from) {
  el.addEventListener('pointerdown', e => {
    if (e.button) return;
    const isMouse = e.pointerType === 'mouse';
    const sx = e.clientX, sy = e.clientY;
    const tray = $('#deckTray');
    let ghost = null, hold = null, dead = false;

    const overTray = (x, y) => {
      const r = tray.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const place = (x, y) => {
      ghost.style.left = x + 'px';
      ghost.style.top = y + 'px';
      const ok = from === 'collection' ? overTray(x, y) : !overTray(x, y);
      tray.classList.toggle('drop-hot', from === 'collection' && ok);
      ghost.classList.toggle('over', ok);
    };
    const start = (x, y) => {
      ghost = el.cloneNode(true);
      ghost.querySelectorAll('.card-pin, .new-tag').forEach(n => n.remove());
      ghost.classList.add('card-ghost');
      ghost.style.width = el.offsetWidth + 'px';
      document.body.append(ghost);
      el.classList.add('drag-src');
      tray.classList.add('drop-target');
      UI.dragging = true;
      Haptics.pulse('light');
      place(x, y);
    };
    const stop = () => {
      clearTimeout(hold);
      dead = true;
      UI.dragging = false;
      if (ghost) { ghost.remove(); UI.dragMoved = true; setTimeout(() => { UI.dragMoved = false; }, 60); }
      el.classList.remove('drag-src');
      tray.classList.remove('drop-target', 'drop-hot');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    const move = ev => {
      if (dead) return;
      const far = Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10;
      if (!ghost) {
        if (!far) return;
        if (isMouse) start(ev.clientX, ev.clientY); else return stop();
      }
      place(ev.clientX, ev.clientY);
    };
    const up = ev => {
      const had = !!ghost;
      const drop = had && overTray(ev.clientX, ev.clientY);
      stop();
      if (!had) return;
      if (from === 'collection' && drop) { if (deckAdd(id)) renderCards(); }
      else if (from === 'deck' && !drop) { if (deckRemove(id)) renderCards(); }
    };
    if (!isMouse) hold = setTimeout(() => { if (!dead) start(sx, sy); }, 230);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
  /* while a card is in hand the list must not scroll under it */
  el.addEventListener('touchmove', ev => { if (UI.dragging) ev.preventDefault(); }, { passive:false });
  el.addEventListener('click', ev => { if (UI.dragMoved) { ev.stopPropagation(); ev.preventDefault(); } }, true);
}

function saveDeck() {
  if (UI.deckDraft.length !== DECK_SIZE) { Sound.play('error'); toast(`You need exactly ${DECK_SIZE} cards.`); return; }
  Progress.data.deck = UI.deckDraft.slice();
  Progress.save();
  Sound.play('reveal');
  toast('Deck saved.');
  goBack();
}
function updateTitleBadges() {
  const done = ACHIEVEMENTS.filter(a => Progress.data.achieved[a.id]).length;
  const b = $('#chBadge');
  if (b) b.textContent = `${done}/${ACHIEVEMENTS.length}`;
}


/* Tap a preview to see the piece or the champion properly. */
function openItemView(tab, item) {
  Sound.play('reveal');
  const body = tab === 'pieces'
    ? `<div class="set-zoom">${['k','q','r','b','n','p'].map(t => `<div class="pv-piece">${pieceArt('w'+t, item.id)}</div>`).join('')}</div>`
    : `<div class="av-zoom">${avatarNode(tab === 'pets' ? { ...myAvatar(), pet:item.id } : { ...myAvatar(), gear:item.id },
        { ring:false, noPet:tab !== 'pets' })}</div>`;
  showModal(`<h3>${item.name}</h3><div class="modal-body" style="text-align:center">${body}
    <p>${item.desc}</p></div>`, [{ label:'Close', primary:true, fn:closeModal }]);
}

/* One purchase, every Legendary item. */
function openPackOffer() {
  if (ownsPack()) { toast('You already own the Legendary Pack.'); return; }
  const items = legendaryItems();
  showModal(`<h3>${LEGENDARY_PACK.name}</h3><div class="modal-body" style="text-align:center">
    <p>${LEGENDARY_PACK.blurb}</p>
    <div class="pack-list">${items.map(i => `<div class="pack-row"><b>${i.name}</b><span>${SHOP_TABS.find(t => t.key === i.tab).name}</span></div>`).join('')}</div>
    <p style="font-size:.8rem;color:var(--ink-mute)">One payment, no subscription. Nothing in the pack changes the rules, the cards or the odds.</p></div>`,
    [{ label:`Unlock for £${LEGENDARY_PACK.price}`, primary:true, fn:async () => {
        closeModal();
        const res = await Billing.buyPack();
        Sound.play(res.ok ? 'win' : 'error');
        if (res.ok) { Haptics.pulse('heavy'); toast(res.test ? 'Legendary Pack unlocked (test build).' : 'Legendary Pack unlocked.'); renderShop(); }
        else toast(res.reason, 3600);
      } },
     { label:'Not now', fn:closeModal }], { row:true });
}
