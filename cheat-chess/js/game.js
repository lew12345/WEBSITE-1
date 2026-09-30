/* =========================================================================
   CHEAT CHESS: game rules layer (chess + cheat cards). No DOM access.
   Functions take a game object `g` so the same code can run on a clone
   to test whether a card is safe to play.
   ========================================================================= */
var G = null;
const HAND_SIZE = 3;
const AI_NAMES = {
  easy:   { name:'Pip the Apprentice', short:'Pip',       title:'Apprentice' },
  medium: { name:'Sir Rowan',          short:'Sir Rowan', title:'Knight' },
  hard:   { name:'The Shadow Warden',  short:'The Warden', title:'Grandmaster' },
};

function newGame(mode, level, decks) {
  const d = decks || {};
  return {
    state: initState(), mode, level: level || 'medium',
    humanColor:'w', aiColor:'b', ply:0, moveCount:0,
    hands:{ w:[], b:[] },
    decks:{ w: shuffleDeck(d.w || CORE_IDS), b: shuffleDeck(d.b || CORE_IDS) },
    captured:{ w:[], b:[] },            // pieces of that colour that have been lost
    effects:{ shields:[], vanish:[], frozen:[], traps:[], walls:[], silence:[] },
    history:[], lastMove:null, over:false, result:null,
    cardsPlayed:{ w:0, b:0 },
    bonusTurns:{ w:0, b:0 },        /* turns still owed, from Second Wind and the like */
  };
}

function cloneGame(g) {
  return { ...g, state: cloneState(g.state),
    hands:{ w:g.hands.w.slice(), b:g.hands.b.slice() }, decks:{ w:g.decks.w.slice(), b:g.decks.b.slice() },
    captured:{ w:g.captured.w.slice(), b:g.captured.b.slice() },
    effects: JSON.parse(JSON.stringify(g.effects)), history:g.history.slice(),
    cardsPlayed:{ ...g.cardsPlayed },
    bonusTurns:{ ...(g.bonusTurns || { w:0, b:0 }) } };
}

/* ------------------------------------------------------------ effect helpers */
function syncWalls(g) {
  const w = {};
  for (const wl of g.effects.walls) if (g.ply < wl.expire) w[wl.r+','+wl.c] = true;
  g.state.walls = w;
}
function purgeEffects(g) {
  const live = e => g.ply < e.expire;
  g.effects.shields = g.effects.shields.filter(live);
  g.effects.vanish = g.effects.vanish.filter(live);
  g.effects.frozen = g.effects.frozen.filter(live);
  g.effects.walls = g.effects.walls.filter(live);
  g.effects.silence = g.effects.silence.filter(live);
  syncWalls(g);
}
function isFrozen(g,r,c){ return g.effects.frozen.some(f => f.r===r && f.c===c && g.ply < f.expire); }
function isShielded(g,r,c,col){ return g.effects.shields.some(s => s.r===r && s.c===c && s.color===col && g.ply < s.expire); }
function isGhost(g,r,c,col){ return g.effects.vanish.some(s => s.r===r && s.c===c && s.color===col && g.ply < s.expire); }
function isWarded(g,r,c,col){ return isShielded(g,r,c,col) || isGhost(g,r,c,col); }
function isWall(g,r,c){ return !!g.state.walls[r+','+c]; }
function isSilenced(g,col){ return (g.effects.silence || []).some(s => s.color === col && g.ply < s.expire); }
function drawCards(g, col, n) {
  const out = [];
  for (let i=0; i<n; i++) if (g.decks[col].length) out.push(g.decks[col].pop());
  g.hands[col].push(...out);
  return out;
}
function trapAt(g,r,c){ return g.effects.traps.find(t => t.r===r && t.c===c); }
function pieceAt(g,r,c){ return g.state.board[idx(r,c)]; }

function clearEffectsAt(g, r, c) {
  const keep = e => !(e.r===r && e.c===c);
  g.effects.shields = g.effects.shields.filter(keep);
  g.effects.vanish = g.effects.vanish.filter(keep);
  g.effects.frozen = g.effects.frozen.filter(keep);
}
function relocateEffects(g, from, to) {
  for (const list of [g.effects.shields, g.effects.vanish, g.effects.frozen])
    for (const e of list) if (e.r===from.r && e.c===from.c) { e.r = to.r; e.c = to.c; }
}
function destroyPiece(g, r, c, events, cause) {
  const p = pieceAt(g,r,c);
  if (!p) return;
  g.captured[color(p)].push(ptype(p));
  g.state.board[idx(r,c)] = null;
  clearEffectsAt(g, r, c);
  clearCastleRightsAt(g.state.castling, r, c);
  if (events) events.push({ fx:'destroy', r, c, piece:p, cause });
}

function realLegalMoves(g, col) {
  syncWalls(g);
  return legalMoves(g.state, col).filter(m => {
    if (isFrozen(g, m.from.r, m.from.c)) return false;
    if (m.capture && !m.enPassant) {
      const victim = pieceAt(g, m.to.r, m.to.c);
      if (victim && isWarded(g, m.to.r, m.to.c, color(victim))) return false;
    }
    return true;
  });
}

/* A trap springs when an enemy piece lands on it. Kings are immune: they just break it. */
function checkTrapAt(g, r, c, moverColor, events) {
  const trap = g.effects.traps.find(t => t.r===r && t.c===c && t.owner !== moverColor);
  if (!trap) return;
  g.effects.traps = g.effects.traps.filter(t => t !== trap);
  const p = pieceAt(g,r,c);
  if (p && ptype(p) === 'k') { events.push({ fx:'trapBreak', r, c }); return; }
  events.push({ fx:'poison', r, c });
  destroyPiece(g, r, c, events, 'trap');
  events.push({ msg:'A hidden Poison Trap destroyed the piece on ' + sqName(r,c) + '!' });
}

/* ------------------------------------------------------------------- moves */
function makeMove(g, mv) {
  const events = [];
  const mover = pieceAt(g, mv.from.r, mv.from.c);
  const col = color(mover);
  g.history.push({ board:g.state.board.slice(), castling:{...g.state.castling}, ep:g.state.ep ? {...g.state.ep} : null,
    captured:{ w:g.captured.w.slice(), b:g.captured.b.slice() }, traps:JSON.parse(JSON.stringify(g.effects.traps)),
    effects:JSON.parse(JSON.stringify({shields:g.effects.shields, vanish:g.effects.vanish, frozen:g.effects.frozen})),
    color:col, ply:g.ply });
  if (g.history.length > 40) g.history.shift();
  let victim = null;
  if (mv.capture) {
    const cr = mv.enPassant ? mv.from.r : mv.to.r;
    victim = pieceAt(g, cr, mv.to.c);
    if (victim) { g.captured[color(victim)].push(ptype(victim)); clearEffectsAt(g, cr, mv.to.c); }
  }
  g.state = applyMove(g.state, mv);
  relocateEffects(g, mv.from, mv.to);
  if (mv.castle) {
    const h = mv.from.r;
    if (mv.castle === 'K') relocateEffects(g, {r:h,c:7}, {r:h,c:5}); else relocateEffects(g, {r:h,c:0}, {r:h,c:3});
  }
  g.lastMove = { from:mv.from, to:mv.to };
  checkTrapAt(g, mv.to.r, mv.to.c, col, events);
  g.ply++; g.moveCount++;
  purgeEffects(g);
  const kept = takeBonusTurn(g, col);
  return { events, victim, mover, col, kept };
}

/* A player who is owed a turn keeps the move instead of handing it over. */
function takeBonusTurn(g, col) {
  if (!g.bonusTurns || g.bonusTurns[col] <= 0) return false;
  g.bonusTurns[col]--;
  g.state.turn = col;
  return true;
}

/* ------------------------------------------------------------- card targets */
function allSquares(){ const a=[]; for (let r=0;r<8;r++) for (let c=0;c<8;c++) a.push({r,c}); return a; }
function emptySquares(g){ return allSquares().filter(t => !pieceAt(g,t.r,t.c) && !isWall(g,t.r,t.c)); }
function pieceSquares(g, col){ return allSquares().filter(t => color(pieceAt(g,t.r,t.c)) === col); }
function adjacentSquares(r,c){ return KING_D.map(([dr,dc]) => ({ r:r+dr, c:c+dc })).filter(t => inb(t.r,t.c)); }
function promoRow(col){ return col === 'w' ? 0 : 7; }
function lightningHit(g, fileC, col) {
  const dir = col === 'w' ? -1 : 1;
  for (let r = col === 'w' ? 7 : 0; r >= 0 && r < 8; r += dir) {
    if (isWall(g, r, fileC)) return null;
    const p = pieceAt(g, r, fileC);
    if (p && color(p) !== col) return ptype(p) === 'k' ? null : { r, c:fileC };
  }
  return null;
}
function enemyEffectSquares(g, enemy) {
  const out = [];
  for (const s of g.effects.shields) if (s.color === enemy && g.ply < s.expire) out.push({ r:s.r, c:s.c });
  for (const s of g.effects.vanish) if (s.color === enemy && g.ply < s.expire) out.push({ r:s.r, c:s.c });
  for (const f of g.effects.frozen) if (f.owner === enemy && g.ply < f.expire) out.push({ r:f.r, c:f.c });
  for (const w of g.effects.walls) if (w.owner === enemy && g.ply < w.expire) out.push({ r:w.r, c:w.c });
  return out.filter((t,i,a) => a.findIndex(u => u.r===t.r && u.c===t.c) === i);
}

function rawTargets(g, id, stage, picks, col) {
  const enemy = opp(col), p0 = picks[0];
  switch (id) {
    case 'bomb': return allSquares();
    case 'shield': case 'vanish': return pieceSquares(g, col);
    case 'frost': return pieceSquares(g, enemy).filter(t => !isFrozen(g,t.r,t.c));
    case 'teleport':
      if (stage === 0) return pieceSquares(g, col);
      return emptySquares(g).filter(t => !(ptype(pieceAt(g,p0.r,p0.c)) === 'p' && (t.r === 0 || t.r === 7)));
    case 'poison': return emptySquares(g).filter(t => !g.effects.traps.some(tr => tr.r===t.r && tr.c===t.c && tr.owner===col));
    case 'swap': {
      if (stage === 0) return pieceSquares(g, col);
      const a = pieceAt(g, p0.r, p0.c);
      return pieceSquares(g, col).filter(t => {
        if (t.r === p0.r && t.c === p0.c) return false;
        const b = pieceAt(g, t.r, t.c);
        if (b === a) return false;
        if (ptype(a) === 'p' && (t.r === promoRow(col) || t.r === promoRow(enemy))) return false;
        if (ptype(b) === 'p' && (p0.r === promoRow(col) || p0.r === promoRow(enemy))) return false;
        return true;
      });
    }
    case 'lightning': return allSquares().filter(t => lightningHit(g, t.c, col));
    case 'resurrect': {
      const lost = g.captured[col];
      if (!lost.length) return [];
      const t = lost[lost.length-1];
      const rows = col === 'w' ? [4,5,6,7] : [0,1,2,3];
      return emptySquares(g).filter(s => rows.includes(s.r) && !(t === 'p' && (s.r === 0 || s.r === 7)));
    }
    case 'steal': {
      const isEnemyPawnNear = s => adjacentSquares(s.r, s.c).some(a => pieceAt(g,a.r,a.c) === enemy+'p');
      if (stage === 0) return pieceSquares(g, col).filter(isEnemyPawnNear);
      return adjacentSquares(p0.r, p0.c).filter(a => pieceAt(g,a.r,a.c) === enemy+'p');
    }
    case 'wall': return emptySquares(g);
    case 'disarm': return enemyEffectSquares(g, enemy);
    case 'march': return pieceSquares(g, enemy).filter(t => {
      if (ptype(pieceAt(g,t.r,t.c)) !== 'p') return false;
      const nr = t.r + (enemy === 'w' ? -1 : 1);
      return inb(nr, t.c) && nr !== promoRow(enemy) && !pieceAt(g,nr,t.c) && !isWall(g,nr,t.c);
    });
    case 'clone':
      if (stage === 0) return pieceSquares(g, col).filter(t => 'nb'.includes(ptype(pieceAt(g,t.r,t.c))) &&
        adjacentSquares(t.r,t.c).some(a => !pieceAt(g,a.r,a.c) && !isWall(g,a.r,a.c)));
      return adjacentSquares(p0.r, p0.c).filter(a => !pieceAt(g,a.r,a.c) && !isWall(g,a.r,a.c));
    case 'cards': return g.decks[col].length ? pieceSquares(g, col).filter(t => ptype(pieceAt(g,t.r,t.c)) === 'p') : [];
    /* relic set */
    case 'chain': return pieceSquares(g, enemy).filter(t => ptype(pieceAt(g,t.r,t.c)) === 'p');
    case 'phoenix': {
      const best = bestLost(g, col);
      if (!best) return [];
      const rows = col === 'w' ? [4,5,6,7] : [0,1,2,3];
      return emptySquares(g).filter(s => rows.includes(s.r) && !(best === 'p' && (s.r === 0 || s.r === 7)));
    }
    case 'blizzard': return allSquares().filter(t => area3(t.r, t.c).some(a => color(pieceAt(g,a.r,a.c)) === enemy && !isFrozen(g,a.r,a.c)));
    case 'pegasus':
      if (stage === 0) return pieceSquares(g, col).filter(t => pegasusLandings(g, t, col).length);
      return pegasusLandings(g, p0, col);
    case 'ascension': return pieceSquares(g, col).filter(t => ptype(pieceAt(g,t.r,t.c)) === 'p');
    case 'charm': {
      const charmable = s => { const p = pieceAt(g,s.r,s.c); return p && color(p) === enemy && 'nb'.includes(ptype(p)); };
      if (stage === 0) return pieceSquares(g, col).filter(s => adjacentSquares(s.r, s.c).some(charmable));
      return adjacentSquares(p0.r, p0.c).filter(charmable);
    }
    case 'fireball': return pieceSquares(g, enemy).filter(t => 'pnb'.includes(ptype(pieceAt(g,t.r,t.c))) && !isWarded(g,t.r,t.c,enemy));
    case 'cinder': return pieceSquares(g, enemy).filter(t => ptype(pieceAt(g,t.r,t.c)) === 'p' && !isWarded(g,t.r,t.c,enemy));
    case 'scorch': return allSquares().filter(t => scorchFile(g, t.c).length);
    case 'firewall': return emptySquares(g);
    case 'dragonrage': return pieceSquares(g, col).filter(t => adjacentSquares(t.r,t.c).some(a => {
      const p = pieceAt(g,a.r,a.c); return p && color(p) === enemy && ptype(p) !== 'k' && !isWarded(g,a.r,a.c,enemy); }));
    case 'deepfreeze': return pieceSquares(g, enemy).filter(t => !isFrozen(g,t.r,t.c));
    case 'aegis': return pieceSquares(g, col).filter(t => !picks.some(q => q.r===t.r && q.c===t.c));
    case 'riptide': {
      const step = s => adjacentSquares(s.r,s.c).filter(a => !pieceAt(g,a.r,a.c) && !isWall(g,a.r,a.c) &&
        !(ptype(pieceAt(g,s.r,s.c)) === 'p' && (a.r === 0 || a.r === 7)));
      if (stage === 0) return pieceSquares(g, col).filter(t => step(t).length);
      return step(p0);
    }
    case 'icebridge': {
      const lane = s => allSquares().filter(a => a.r === s.r && !pieceAt(g,a.r,a.c) && !isWall(g,a.r,a.c));
      if (stage === 0) return pieceSquares(g, col).filter(t => lane(t).length);
      return lane(p0);
    }
    case 'recall': {
      const home = col === 'w' ? 7 : 0;
      const spots = emptySquares(g).filter(t => t.r === home);
      if (stage === 0) return spots.length ? pieceSquares(g, col).filter(t => t.r !== home) : [];
      return spots;
    }
    case 'doppel': {
      const rows = col === 'w' ? [4,5,6,7] : [0,1,2,3];
      if (stage === 0) return pieceSquares(g, enemy).filter(t => 'nbr'.includes(ptype(pieceAt(g,t.r,t.c))));
      return emptySquares(g).filter(t => rows.includes(t.r));
    }
    case 'warpgate': {
      if (stage === 0) return pieceSquares(g, col).filter(t => ptype(pieceAt(g,t.r,t.c)) !== 'k');
      const mine = pieceAt(g, p0.r, p0.c);
      return pieceSquares(g, enemy).filter(t => {
        const q = pieceAt(g,t.r,t.c);
        if (ptype(q) === 'k' || isWarded(g,t.r,t.c,enemy)) return false;
        if (ptype(mine) === 'p' && (t.r === promoRow(col) || t.r === promoRow(enemy))) return false;
        if (ptype(q) === 'p' && (p0.r === promoRow(col) || p0.r === promoRow(enemy))) return false;
        return true;
      });
    }
    case 'thornfield': {
      const free = emptySquares(g).filter(t => !g.effects.traps.some(tr => tr.r===t.r && tr.c===t.c));
      return free.filter(t => !picks.some(q => q.r===t.r && q.c===t.c));
    }
  }
  return [];
}
function scorchFile(g, c){ return allSquares().filter(t => t.c === c && ptype(pieceAt(g,t.r,t.c)) === 'p'); }
function area3(r, c){ return [[0,0], ...KING_D].map(([dr,dc]) => ({ r:r+dr, c:c+dc })).filter(t => inb(t.r,t.c)); }
function bestLost(g, col) {
  const lost = g.captured[col];
  if (!lost.length) return null;
  return lost.slice().sort((a,b) => AI_VAL[b] - AI_VAL[a])[0];
}
function pegasusLandings(g, from, col) {
  const p = pieceAt(g, from.r, from.c);
  return KNIGHT_D.map(([dr,dc]) => ({ r:from.r+dr, c:from.c+dc })).filter(t => {
    if (!inb(t.r,t.c) || isWall(g,t.r,t.c)) return false;
    const q = pieceAt(g,t.r,t.c);
    if (ptype(p) === 'p' && t.r === promoRow(opp(col))) return false;
    if (!q) return true;
    return color(q) !== col && ptype(q) !== 'k' && !isWarded(g,t.r,t.c,color(q));
  });
}
function shuffled(a){ a = a.slice(); for (let i=a.length-1;i>0;i--) { const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
function combos(arr, k) {
  const out = [];
  const rec = (start, cur) => { if (cur.length === k) { out.push(cur.slice()); return; } for (let i=start;i<arr.length;i++) { cur.push(arr[i]); rec(i+1, cur); cur.pop(); } };
  rec(0, []);
  return out;
}
/* Would destroying these squares leave `col`'s own king in check? */
function blastSafe(g, cells, col) {
  const s = cloneState(g.state), walls = { ...s.walls };
  for (const t of cells) {
    const p = s.board[idx(t.r,t.c)];
    if (p && ptype(p) !== 'k') s.board[idx(t.r,t.c)] = null;
    delete walls[t.r+','+t.c];
  }
  s.walls = walls;
  return !inCheck(s, col);
}
/* Meteor targets: any non-king piece on the enemy's half of the board. */
function meteorPool(g, col) {
  const rows = col === 'w' ? [0,1,2,3] : [4,5,6,7];
  return allSquares().filter(t => rows.includes(t.r) && pieceAt(g,t.r,t.c) && ptype(pieceAt(g,t.r,t.c)) !== 'k');
}
/* Tidal Wave: each pawn of `pawnCol` steps one square back towards its own side (never onto its back rank). */
function tidalMoves(g, pawnCol, needEmpty = true) {
  const back = pawnCol === 'w' ? 1 : -1, home = pawnCol === 'w' ? 7 : 0;
  return pieceSquares(g, pawnCol)
    .filter(t => ptype(pieceAt(g,t.r,t.c)) === 'p')
    .sort((a,b) => (b.r - a.r) * back)           // pawns nearest their own side move first
    .map(t => ({ from:t, to:{ r:t.r + back, c:t.c } }))
    .filter(m => inb(m.to.r, m.to.c) && m.to.r !== home && !isWall(g, m.to.r, m.to.c) && (!needEmpty || !pieceAt(g, m.to.r, m.to.c)));
}

/* A card is only allowed if, once the turn passes, the caster's own king is not in check. */
function cardSafe(g, id, picks, col) {
  const sim = cloneGame(g);
  const res = applyCard(sim, id, picks, col);
  if (res.extraTurn) { syncWalls(sim); return true; }
  sim.ply++; purgeEffects(sim);
  return !inCheck(sim.state, col);
}
function cardTargets(g, id, stage, picks, col) {
  syncWalls(g);
  const n = cardStageCount(id);
  const raw = rawTargets(g, id, stage, picks, col);
  if (stage === n - 1) return raw.filter(t => cardSafe(g, id, [...picks, t], col));
  return raw.filter(t => cardTargets(g, id, stage+1, [...picks, t], col).length > 0);
}

function canRewind(g, col) {
  const top = g.history[g.history.length-1];
  return !!(top && top.color === opp(col) && top.ply === g.ply - 1);
}

const NO_TARGET_REASON = {
  frost:'There are no enemy pieces left to freeze.',
  resurrect:"None of your pieces have been lost yet.",
  steal:'None of your pieces is standing next to an enemy pawn.',
  disarm:'Your opponent has no visible effects to destroy.',
  march:'No enemy pawn can be forced forward right now.',
  clone:'You need a knight or bishop with an empty square beside it.',
  cards:'You need a pawn to sacrifice (and cards left in the deck).',
  lightning:'No file has an enemy piece the bolt can reach.',
  chain:'There are no enemy pawns to strike.',
  phoenix:"None of your pieces have been lost yet.",
  blizzard:'There are no enemy pieces left to freeze.',
  pegasus:'None of your pieces has anywhere to leap.',
  ascension:'You have no pawns left to ascend.',
  charm:'None of your pieces is standing next to an enemy knight or bishop.',
};

/* Requirements for cards that need no target. Return a reason string if unplayable. */
const ZERO_REQ = {
  spy: (g, col) => !g.hands[opp(col)].length && 'Your opponent has no cards to spy on.',
  pickpocket: (g, col) => !g.hands[opp(col)].length && 'Your opponent has no cards to steal.',
  rewind: (g, col) => !canRewind(g, col) && 'Only works right after your opponent has moved a piece.',
  quake: g => !g.state.board.some(p => p && ptype(p) === 'p') && 'There are no pawns left to shake.',
  meteor: (g, col) => !meteorPool(g, col).length && 'There is nothing in the enemy half for the meteors to hit.',
  pilfer: (g, col) => !g.hands[opp(col)].length && 'Your opponent is holding no cards.',
  saboteur: (g, col) => !g.hands[opp(col)].length && 'Your opponent has no cards left to burn.',
  hail: (g, col) => !pieceSquares(g, opp(col)).some(t => !isFrozen(g,t.r,t.c)) && 'Every enemy piece is frozen already.',
  tracker: (g, col) => !g.effects.traps.some(t => t.owner !== col && !(t.seen || []).includes(col)) && 'There are no hidden enemy traps to find.',
  gambler: (g, col) => g.hands[col].length < 2 && 'You need another card in hand to trade away.',
  grandgambit: (g, col) => !g.decks[col].length && 'Your deck is empty.',
  timelock: (g, col) => !g.hands[opp(col)].length && 'Your opponent has no cards to lock away.',
  tidal: (g, col) => !tidalMoves(g, opp(col)).length && 'No enemy pawn can be pushed back right now.',
  sanctuary: (g, col) => { const k = findKing(g.state, col); return !adjacentSquares(k.r, k.c).some(a => color(pieceAt(g,a.r,a.c)) === col) && 'None of your pieces are standing next to your king.'; },
};
const RANDOM_CARDS = ['quake', 'meteor', 'hail'];

function cardPlayable(g, id, col) {
  syncWalls(g);
  if (id === 'kingguard') return { ok:false, passive:true, reason:'Passive: it saves your king automatically if you would be checkmated.' };
  if (isSilenced(g, col)) return { ok:false, reason:'Time Lock. You cannot play any cheat card this turn.' };
  const checked = inCheck(g.state, col);
  if (cardStageCount(id) === 0) {
    const req = ZERO_REQ[id] && ZERO_REQ[id](g, col);
    if (req) return { ok:false, reason:req };
    if (RANDOM_CARDS.includes(id)) return checked ? { ok:false, reason:"You're in check. Chaos won't save you, so deal with that first!" } : { ok:true };
    if (!cardSafe(g, id, [], col)) return { ok:false, reason: checked ? "You're in check. This card can't save your king!" : 'That would leave your own king in check!' };
    return { ok:true };
  }
  const t = cardTargets(g, id, 0, [], col);
  if (t.length) return { ok:true };
  if (checked) return { ok:false, reason:"This card can't get your king out of check." };
  return { ok:false, reason: NO_TARGET_REASON[id] || 'No valid targets right now.' };
}

/* ------------------------------------------------------------- card effects */
function applyCard(g, id, picks, col) {
  const events = [];
  const res = { events, extraTurn:false, rewound:false, drawn:[], peek:null, stolen:null, peekAll:null, burned:null, discarded:0 };
  const enemy = opp(col);
  switch (id) {
    case 'bomb': {
      // the chosen square + 4 random neighbours; the random pick never leaves the caster in check
      const { r, c } = picks[0];
      const around = adjacentSquares(r, c);
      const options = shuffled(combos(around, Math.min(4, around.length)));
      const chosen = options.find(extra => blastSafe(g, [{ r, c }, ...extra], col)) || [];
      const cells = [{ r, c }, ...chosen];
      events.push({ fx:'bomb', r, c, cells });
      for (const t of cells) {
        const p = pieceAt(g, t.r, t.c);
        if (p && ptype(p) !== 'k') destroyPiece(g, t.r, t.c, events, 'bomb');
        g.effects.traps = g.effects.traps.filter(tr => !(tr.r===t.r && tr.c===t.c));
        g.effects.walls = g.effects.walls.filter(w => !(w.r===t.r && w.c===t.c));
      }
      syncWalls(g);
      break;
    }
    /* ------------------------------------------------------ relic set */
    case 'meteor': {
      const hits = [], removed = [];
      for (const t of shuffled(meteorPool(g, col))) {
        if (hits.length >= 3) break;
        const i = idx(t.r, t.c), p = g.state.board[i];
        g.state.board[i] = null;
        if (inCheck(g.state, col)) { g.state.board[i] = p; continue; }
        hits.push(t); removed.push([i, p]);
      }
      for (const [i, p] of removed) g.state.board[i] = p;
      events.push({ fx:'meteor', hits });
      for (const t of hits) destroyPiece(g, t.r, t.c, events, 'bomb');
      break;
    }
    case 'chain': {
      const path = [picks[0]];
      for (let k=0; k<path.length && path.length < 4; k++) {
        for (const a of adjacentSquares(path[k].r, path[k].c)) {
          if (path.length >= 4) break;
          if (pieceAt(g,a.r,a.c) === enemy+'p' && !path.some(q => q.r===a.r && q.c===a.c)) path.push(a);
        }
      }
      events.push({ fx:'chain', path });
      for (const t of path) destroyPiece(g, t.r, t.c, events, 'lightning');
      break;
    }
    case 'phoenix': {
      const { r, c } = picks[0];
      const t = bestLost(g, col);
      if (t) {
        g.captured[col].splice(g.captured[col].lastIndexOf(t), 1);
        g.state.board[idx(r,c)] = col + t;
        events.push({ fx:'resurrect', r, c, piece:col+t, phoenix:true });
      }
      break;
    }
    case 'blizzard': {
      const { r, c } = picks[0];
      const cells = area3(r, c);
      for (const a of cells) {
        const p = pieceAt(g, a.r, a.c);
        if (p && color(p) === enemy && !isFrozen(g, a.r, a.c)) g.effects.frozen.push({ r:a.r, c:a.c, owner:col, expire:g.ply + 2 });
      }
      events.push({ fx:'blizzard', r, c, cells });
      break;
    }
    case 'tidal': {
      events.push({ fx:'wave', col });
      for (const m of tidalMoves(g, enemy, false)) {
        const p = pieceAt(g, m.from.r, m.from.c);
        if (!p || pieceAt(g, m.to.r, m.to.c) || isWall(g, m.to.r, m.to.c)) continue;
        g.state.board[idx(m.to.r,m.to.c)] = p; g.state.board[idx(m.from.r,m.from.c)] = null;
        relocateEffects(g, m.from, m.to);
        events.push({ fx:'slide', from:m.from, to:m.to, piece:p });
        checkTrapAt(g, m.to.r, m.to.c, enemy, events);
      }
      break;
    }
    case 'sanctuary': {
      const k = findKing(g.state, col);
      const cells = [k, ...adjacentSquares(k.r, k.c).filter(a => color(pieceAt(g,a.r,a.c)) === col)];
      for (const t of cells) g.effects.shields.push({ r:t.r, c:t.c, color:col, expire:g.ply + 2 });
      events.push({ fx:'sanctuary', cells });
      break;
    }
    case 'pegasus': {
      const [from, to] = picks;
      let p = pieceAt(g, from.r, from.c);
      const victim = pieceAt(g, to.r, to.c);
      if (victim) { g.captured[color(victim)].push(ptype(victim)); clearEffectsAt(g, to.r, to.c); }
      if (ptype(p) === 'p' && to.r === promoRow(col)) p = col + 'q';
      g.state.board[idx(from.r,from.c)] = null;
      g.state.board[idx(to.r,to.c)] = p;
      relocateEffects(g, from, to);
      clearCastleRightsAt(g.state.castling, from.r, from.c);
      clearCastleRightsAt(g.state.castling, to.r, to.c);
      events.push({ fx:'leap', from, to, piece:p });
      if (victim) events.push({ fx:'destroy', r:to.r, c:to.c, piece:victim, cause:'capture' });
      checkTrapAt(g, to.r, to.c, col, events);
      break;
    }
    case 'ascension': {
      const { r, c } = picks[0];
      g.state.board[idx(r,c)] = col + 'q';
      events.push({ fx:'ascend', r, c });
      break;
    }
    case 'pickpocket': {
      const h = g.hands[enemy];
      if (h.length) {
        /* take something you are not already holding, so a hand never doubles up */
        const fresh = h.map((id2, i) => [id2, i]).filter(([id2]) => !g.hands[col].includes(id2));
        const pool = fresh.length ? fresh : h.map((id2, i) => [id2, i]);
        const [, at] = pool[(Math.random()*pool.length)|0];
        res.stolen = h.splice(at, 1)[0];
        g.hands[col].push(res.stolen);
      }
      break;
    }
    case 'charm': {
      const t = picks[1];
      g.state.board[idx(t.r,t.c)] = col + ptype(pieceAt(g, t.r, t.c));
      clearEffectsAt(g, t.r, t.c);
      events.push({ fx:'steal', r:t.r, c:t.c, charm:true });
      break;
    }
    case 'shield': {
      const { r, c } = picks[0];
      g.effects.shields.push({ r, c, color:col, expire:g.ply + 2 });
      events.push({ fx:'shield', r, c });
      break;
    }
    case 'frost': {
      const { r, c } = picks[0];
      g.effects.frozen.push({ r, c, owner:col, expire:g.ply + 2 });
      events.push({ fx:'frost', r, c });
      break;
    }
    case 'vanish': {
      const { r, c } = picks[0];
      g.effects.vanish.push({ r, c, color:col, expire:g.ply + 4 });
      events.push({ fx:'vanish', r, c });
      break;
    }
    case 'teleport': {
      const [from, to] = picks;
      const p = pieceAt(g, from.r, from.c);
      g.state.board[idx(from.r,from.c)] = null;
      g.state.board[idx(to.r,to.c)] = p;
      relocateEffects(g, from, to);
      clearCastleRightsAt(g.state.castling, from.r, from.c);
      events.push({ fx:'teleport', from, to, piece:p });
      checkTrapAt(g, to.r, to.c, col, events);
      break;
    }
    case 'swap': {
      const [a, b] = picks;
      const pa = pieceAt(g,a.r,a.c), pb = pieceAt(g,b.r,b.c);
      g.state.board[idx(a.r,a.c)] = pb; g.state.board[idx(b.r,b.c)] = pa;
      const tmp = { r:-1, c:-1 };
      relocateEffects(g, a, tmp); relocateEffects(g, b, a); relocateEffects(g, tmp, b);
      clearCastleRightsAt(g.state.castling, a.r, a.c); clearCastleRightsAt(g.state.castling, b.r, b.c);
      events.push({ fx:'swap', a, b });
      break;
    }
    case 'poison': {
      const { r, c } = picks[0];
      g.effects.traps.push({ r, c, owner:col });
      events.push({ fx:'trapSet', r, c, owner:col });
      break;
    }
    case 'lightning': {
      const hit = lightningHit(g, picks[0].c, col);
      events.push({ fx:'lightning', c:picks[0].c, hit });
      if (hit) destroyPiece(g, hit.r, hit.c, events, 'lightning');
      break;
    }
    case 'resurrect': {
      const { r, c } = picks[0];
      const t = g.captured[col].pop();
      if (t) { g.state.board[idx(r,c)] = col + t; events.push({ fx:'resurrect', r, c, piece:col+t }); }
      break;
    }
    case 'steal': {
      const t = picks[1];
      g.state.board[idx(t.r,t.c)] = col + 'p';
      clearEffectsAt(g, t.r, t.c);
      events.push({ fx:'steal', r:t.r, c:t.c });
      break;
    }
    case 'wall': {
      const { r, c } = picks[0];
      g.effects.walls.push({ r, c, owner:col, expire:g.ply + 6 });
      syncWalls(g);
      events.push({ fx:'wall', r, c });
      break;
    }
    case 'disarm': {
      const { r, c } = picks[0];
      const hit = e => e.r===r && e.c===c;
      g.effects.shields = g.effects.shields.filter(e => !(hit(e) && e.color === enemy));
      g.effects.vanish = g.effects.vanish.filter(e => !(hit(e) && e.color === enemy));
      g.effects.frozen = g.effects.frozen.filter(e => !(hit(e) && e.owner === enemy));
      g.effects.walls = g.effects.walls.filter(e => !(hit(e) && e.owner === enemy));
      syncWalls(g);
      events.push({ fx:'disarm', r, c });
      break;
    }
    case 'march': {
      const { r, c } = picks[0];
      const p = pieceAt(g, r, c);
      const nr = r + (color(p) === 'w' ? -1 : 1);
      g.state.board[idx(r,c)] = null;
      g.state.board[idx(nr,c)] = p;
      relocateEffects(g, {r,c}, {r:nr,c});
      events.push({ fx:'slide', from:{r,c}, to:{r:nr,c}, piece:p, sound:'stone' });
      checkTrapAt(g, nr, c, color(p), events);
      break;
    }
    case 'clone': {
      const [src, dst] = picks;
      const p = pieceAt(g, src.r, src.c);
      g.state.board[idx(dst.r,dst.c)] = p;
      events.push({ fx:'clone', from:src, r:dst.r, c:dst.c, piece:p });
      checkTrapAt(g, dst.r, dst.c, col, events);
      break;
    }
    case 'cards': {
      const { r, c } = picks[0];
      destroyPiece(g, r, c, events, 'sacrifice');
      res.drawn = drawCards(g, col, 2);
      break;
    }
    case 'fireball': {
      const { r, c } = picks[0];
      events.push({ fx:'fireball', r, c });
      destroyPiece(g, r, c, events, 'bomb');
      break;
    }
    case 'cinder': {
      const { r, c } = picks[0];
      events.push({ fx:'fireball', r, c, small:true });
      destroyPiece(g, r, c, events, 'bomb');
      break;
    }
    case 'scorch': {
      const cells = scorchFile(g, picks[0].c);
      events.push({ fx:'scorch', c:picks[0].c, cells });
      for (const t of cells) destroyPiece(g, t.r, t.c, events, 'bomb');
      break;
    }
    case 'firewall': {
      const { r, c } = picks[0];
      const cells = [{ r, c }, { r, c:c-1 }, { r, c:c+1 }].filter(t => inb(t.r,t.c) && !pieceAt(g,t.r,t.c) && !isWall(g,t.r,t.c));
      for (const t of cells) g.effects.walls.push({ r:t.r, c:t.c, owner:col, fire:true, expire:g.ply + 4 });
      syncWalls(g);
      events.push({ fx:'firewall', cells });
      break;
    }
    case 'dragonrage': {
      const { r, c } = picks[0];
      const cells = adjacentSquares(r, c).filter(a => { const p = pieceAt(g,a.r,a.c); return p && color(p) === enemy && ptype(p) !== 'k'; });
      events.push({ fx:'dragonrage', r, c, cells });
      for (const t of cells) destroyPiece(g, t.r, t.c, events, 'bomb');
      break;
    }
    case 'deepfreeze': {
      const { r, c } = picks[0];
      g.effects.frozen.push({ r, c, owner:col, expire:g.ply + 4 });
      events.push({ fx:'frost', r, c, deep:true });
      break;
    }
    case 'aegis': {
      for (const t of picks) g.effects.shields.push({ r:t.r, c:t.c, color:col, expire:g.ply + 2 });
      events.push({ fx:'sanctuary', cells:picks });
      break;
    }
    case 'hail': {
      const pool = shuffled(pieceSquares(g, enemy).filter(t => !isFrozen(g,t.r,t.c))).slice(0, 2);
      for (const t of pool) g.effects.frozen.push({ r:t.r, c:t.c, owner:col, expire:g.ply + 2 });
      events.push({ fx:'hail', cells:pool });
      break;
    }
    case 'riptide': case 'icebridge': case 'recall': {
      const [from, to] = picks;
      const p = pieceAt(g, from.r, from.c);
      g.state.board[idx(from.r,from.c)] = null;
      g.state.board[idx(to.r,to.c)] = p;
      relocateEffects(g, from, to);
      clearCastleRightsAt(g.state.castling, from.r, from.c);
      events.push({ fx:id === 'recall' ? 'teleport' : 'slide', from, to, piece:p, sound:id === 'recall' ? 'portal' : 'whoosh' });
      checkTrapAt(g, to.r, to.c, col, events);
      break;
    }
    case 'doppel': {
      const [src, dst] = picks;
      const p = col + ptype(pieceAt(g, src.r, src.c));
      g.state.board[idx(dst.r,dst.c)] = p;
      events.push({ fx:'clone', from:src, r:dst.r, c:dst.c, piece:p });
      checkTrapAt(g, dst.r, dst.c, col, events);
      break;
    }
    case 'timelock': {
      g.effects.silence.push({ color:enemy, expire:g.ply + 2 });
      events.push({ fx:'timelock' });
      break;
    }
    case 'warpgate': {
      const [a, b] = picks;
      const pa = pieceAt(g,a.r,a.c), pb = pieceAt(g,b.r,b.c);
      g.state.board[idx(a.r,a.c)] = pb; g.state.board[idx(b.r,b.c)] = pa;
      const tmp = { r:-1, c:-1 };
      relocateEffects(g, a, tmp); relocateEffects(g, b, a); relocateEffects(g, tmp, b);
      clearCastleRightsAt(g.state.castling, a.r, a.c); clearCastleRightsAt(g.state.castling, b.r, b.c);
      events.push({ fx:'warp', a, b });
      break;
    }
    case 'grandgambit': {
      res.drawn = drawCards(g, col, 2);
      res.extraTurn = true;
      g.bonusTurns[col]++;
      events.push({ fx:'hourglass' });
      break;
    }
    case 'pilfer': {
      res.peekAll = g.hands[enemy].slice();
      break;
    }
    case 'thornfield': {
      for (const t of picks) { g.effects.traps.push({ r:t.r, c:t.c, owner:col }); events.push({ fx:'trapSet', r:t.r, c:t.c, owner:col }); }
      break;
    }
    case 'saboteur': {
      const h = g.hands[enemy];
      if (h.length) res.burned = h.splice((Math.random()*h.length)|0, 1)[0];
      events.push({ fx:'burn' });
      break;
    }
    case 'tracker': {
      const found = [];
      for (const t of g.effects.traps) if (t.owner !== col) { t.seen = [...(t.seen || []), col]; found.push({ r:t.r, c:t.c }); }
      events.push({ fx:'tracker', cells:found });
      break;
    }
    case 'gambler': {
      const n = g.hands[col].length;
      g.hands[col] = [];
      res.discarded = n;
      res.drawn = drawCards(g, col, n);
      events.push({ fx:'burn' });
      break;
    }
    case 'spy': {
      const h = g.hands[enemy];
      if (h.length) res.peek = h[(Math.random()*h.length)|0];
      break;
    }
    case 'hourglass':
      /* playing the card is this turn, so it hands back two: this one and one more */
      res.extraTurn = true;
      g.bonusTurns[col]++;
      events.push({ fx:'hourglass' });
      break;
    case 'rewind': {
      const last = g.history.pop();
      const undone = g.lastMove;
      g.state.board = last.board.slice();
      g.state.castling = { ...last.castling };
      g.state.ep = last.ep ? { ...last.ep } : null;
      g.state.turn = last.color;
      g.captured = { w:last.captured.w.slice(), b:last.captured.b.slice() };
      g.effects.traps = JSON.parse(JSON.stringify(last.traps));
      Object.assign(g.effects, JSON.parse(JSON.stringify(last.effects)));
      /* the piece is back where it started and stiff with cold, so they cannot
         simply play the same move again */
      if (undone) g.effects.frozen.push({ r:undone.from.r, c:undone.from.c, owner:col, expire:g.ply + 2 });
      g.lastMove = null;
      res.rewound = true;
      events.push({ fx:'rewind' });
      break;
    }
    case 'quake': {
      events.push({ fx:'quake' });
      const pawns = [];
      for (let i=0;i<64;i++) { const p = g.state.board[i]; if (p && ptype(p) === 'p') pawns.push({ r:(i/8)|0, c:i%8, p }); }
      for (let i=pawns.length-1;i>0;i--) { const j=(Math.random()*(i+1))|0; [pawns[i],pawns[j]]=[pawns[j],pawns[i]]; }
      let moved = 0;
      for (const pw of pawns) {
        if (moved >= 3) break;
        const dir = color(pw.p) === 'w' ? -1 : 1;
        for (const d of (Math.random() < 0.5 ? [dir,-dir] : [-dir,dir])) {
          const nr = pw.r + d;
          if (!inb(nr, pw.c) || nr === 0 || nr === 7 || pieceAt(g,nr,pw.c) || isWall(g,nr,pw.c)) continue;
          g.state.board[idx(nr,pw.c)] = pw.p; g.state.board[idx(pw.r,pw.c)] = null;
          if (inCheck(g.state, col)) { g.state.board[idx(pw.r,pw.c)] = pw.p; g.state.board[idx(nr,pw.c)] = null; continue; }
          relocateEffects(g, pw, { r:nr, c:pw.c });
          events.push({ fx:'slide', from:{ r:pw.r, c:pw.c }, to:{ r:nr, c:pw.c }, piece:pw.p });
          checkTrapAt(g, nr, pw.c, color(pw.p), events);
          moved++;
          break;
        }
      }
      break;
    }
  }
  return res;
}

/* Play a card for real: remove it from hand, apply it, then pass the turn. */
function playCard(g, id, picks, col) {
  const h = g.hands[col];
  const i = h.indexOf(id);
  if (i >= 0) h.splice(i, 1);
  g.cardsPlayed[col]++;
  const res = applyCard(g, id, picks, col);
  g.state.ep = res.rewound ? g.state.ep : null;
  if (!res.rewound && !res.extraTurn) {
    g.state.turn = opp(col);
    res.kept = takeBonusTurn(g, col);
  }
  g.ply++;
  purgeEffects(g);
  return res;
}

/* ----------------------------------------------------------- end of turn */
function evaluateEnd(g) {
  syncWalls(g);
  const col = g.state.turn;
  if (insufficientMaterial(g.state.board)) return { over:true, winner:null, reason:'insufficient' };
  if (realLegalMoves(g, col).length) return null;
  const checked = inCheck(g.state, col);
  if (g.hands[col].some(id => cardPlayable(g, id, col).ok)) return { mustCard:true, checked };
  if (checked) {
    if (g.hands[col].includes('kingguard')) return { kingGuard:true };
    return { over:true, winner:opp(col), reason:'checkmate' };
  }
  // No moves only because pieces are frozen/warded: skip the turn instead of a stalemate.
  if (legalMoves(g.state, col).length) return { skip:true };
  return { over:true, winner:null, reason:'stalemate' };
}

function triggerKingGuard(g, col) {
  const k = findKing(g.state, col);
  const checkers = attackersOf(g.state, k.r, k.c, opp(col));
  const events = [{ fx:'kingguard', r:k.r, c:k.c }];
  for (const ch of checkers) destroyPiece(g, ch.r, ch.c, events, 'kingguard');
  const i = g.hands[col].indexOf('kingguard');
  if (i >= 0) g.hands[col].splice(i, 1);
  return events;
}

/* ------------------------------------------------------ computer card play */
function materialFor(g, col) {
  let s = 0;
  for (const p of g.state.board) if (p) s += (color(p) === col ? 1 : -1) * AI_VAL[ptype(p)];
  return s;
}
function attackedPiecesOf(g, col) {
  const out = [];
  for (const t of pieceSquares(g, col)) {
    const p = pieceAt(g, t.r, t.c);
    if (ptype(p) !== 'k' && isAttacked(g.state, t.r, t.c, opp(col)) && !isWarded(g, t.r, t.c, col))
      out.push({ ...t, v:AI_VAL[ptype(p)], defended:isAttacked(g.state, t.r, t.c, col) });
  }
  return out.sort((a,b) => b.v - a.v);
}
function bestSimTarget(g, id, col, stageTargets) {
  let best = null, bestGain = -Infinity;
  const base = materialFor(g, col);
  for (const picks of stageTargets) {
    const sim = cloneGame(g);
    applyCard(sim, id, picks, col);
    const gain = materialFor(sim, col) - base;
    if (gain > bestGain) { bestGain = gain; best = picks; }
  }
  return best ? { picks:best, gain:bestGain } : null;
}

/* Every full set of target picks for a card (capped). */
function enumeratePicks(g, id, col, cap = 300) {
  const n = cardStageCount(id), out = [];
  if (n === 0) return [[]];
  const rec = (stage, picks) => {
    for (const t of cardTargets(g, id, stage, picks, col)) {
      if (out.length >= cap) return;
      if (stage === n - 1) out.push([...picks, t]); else rec(stage + 1, [...picks, t]);
    }
  };
  rec(0, []);
  return out;
}

function aiPickCard(g, col, level, forced) {
  const hand = [...new Set(g.hands[col])];
  const human = opp(col);
  const playable = hand.filter(id => cardPlayable(g, id, col).ok);
  if (!playable.length) return null;
  const has = id => playable.includes(id);
  const thresh = level === 'hard' ? 180 : level === 'medium' ? 260 : 300;
  const pick = (id, picks) => ({ id, picks });
  const single = id => cardTargets(g, id, 0, [], col).map(t => [t]);

  // 1. Undo a painful capture
  if (has('rewind') && level !== 'easy') {
    const top = g.history[g.history.length-1];
    const lostNow = g.captured[col].length - top.captured[col].length;
    if (lostNow > 0 && AI_VAL[g.captured[col][g.captured[col].length-1]] >= 300) return pick('rewind', []);
  }
  // 2. Direct material gains
  if (has('ascension')) { const best = bestSimTarget(g, 'ascension', col, single('ascension')); if (best) return pick('ascension', best.picks); }
  if (has('grandgambit')) return pick('grandgambit', []);
  for (const id of ['charm','pegasus','chain','lightning','fireball','cinder','dragonrage','scorch','doppel','warpgate']) {
    if (!has(id)) continue;
    const best = bestSimTarget(g, id, col, enumeratePicks(g, id, col));
    if (best && best.gain >= thresh) return pick(id, best.picks);
  }
  if (has('bomb')) { // the blast is random, so judge each square by its expected value
    let best = null, bestV = -Infinity;
    for (const [t] of single('bomb')) {
      const around = adjacentSquares(t.r, t.c), k = Math.min(4, around.length) / around.length;
      const val = s => { const p = pieceAt(g, s.r, s.c); return !p || ptype(p) === 'k' ? 0 : (color(p) === col ? -1 : 1) * AI_VAL[ptype(p)]; };
      const v = val(t) + around.reduce((n, a) => n + val(a), 0) * k;
      if (v > bestV) { bestV = v; best = t; }
    }
    if (best && bestV >= thresh) return pick('bomb', [best]);
  }
  if (has('meteor') && (level === 'easy' ? Math.random() < 0.4 : true)) {
    const pool = meteorPool(g, col), v = pool.reduce((n, t) => { const p = pieceAt(g,t.r,t.c); return n + (color(p) === col ? -1 : 1) * AI_VAL[ptype(p)]; }, 0) / Math.max(1, pool.length) * Math.min(3, pool.length);
    if (v >= thresh) return pick('meteor', []);
  }
  if (has('phoenix') && AI_VAL[bestLost(g, col)] >= 300) {
    const ts = single('phoenix');
    if (ts.length) return pick('phoenix', ts[(Math.random()*ts.length)|0]);
  }
  if (has('deepfreeze') || has('hail')) {
    const juicy = pieceSquares(g, human).filter(t => AI_VAL[ptype(pieceAt(g,t.r,t.c))] >= 500 && !isFrozen(g,t.r,t.c));
    if (juicy.length && has('deepfreeze')) return pick('deepfreeze', [juicy[0]]);
    if (juicy.length && has('hail') && Math.random() < .5) return pick('hail', []);
  }
  if (has('timelock') && g.hands[human].length >= 2 && Math.random() < .5) return pick('timelock', []);
  if (has('saboteur') && g.hands[human].length >= 2) return pick('saboteur', []);
  if (has('blizzard') && level !== 'easy') {
    let best = null, bestV = 0;
    for (const [t] of single('blizzard')) {
      const v = area3(t.r, t.c).reduce((n, a) => { const p = pieceAt(g,a.r,a.c); return n + (p && color(p) === human && !isFrozen(g,a.r,a.c) ? AI_VAL[ptype(p)] + 50 : 0); }, 0);
      if (v > bestV) { bestV = v; best = t; }
    }
    if (best && bestV >= 900 && Math.random() < 0.6) return pick('blizzard', [best]);
  }
  if (has('resurrect') && AI_VAL[g.captured[col][g.captured[col].length-1]] >= 300) {
    const ts = single('resurrect');
    if (ts.length) return pick('resurrect', ts[(Math.random()*ts.length)|0]);
  }
  if (has('steal') && (level !== 'easy' || Math.random() < 0.5)) {
    const s0 = cardTargets(g, 'steal', 0, [], col)[0];
    const s1 = s0 && cardTargets(g, 'steal', 1, [s0], col)[0];
    if (s1) return pick('steal', [s0, s1]);
  }
  // 3. Protect a valuable piece that is hanging
  const hanging = attackedPiecesOf(g, col).filter(t => !t.defended || t.v >= 500);
  if (hanging.length && hanging[0].v >= 300) {
    const t = hanging[0];
    if (has('aegis') && hanging.length >= 2) {
      const three = cardTargets(g, 'aegis', 0, [], col).filter(s => hanging.some(x => x.r===s.r && x.c===s.c)).slice(0, 3);
      if (three.length === 3) return pick('aegis', three);
    }
    for (const id of ['shield','vanish']) if (has(id)) return pick(id, [{ r:t.r, c:t.c }]);
    if (has('sanctuary')) { const k = findKing(g.state, col); if (Math.max(Math.abs(k.r - t.r), Math.abs(k.c - t.c)) <= 1) return pick('sanctuary', []); }
    if (has('frost')) {
      const attackers = attackersOf(g.state, t.r, t.c, human).filter(a => !isFrozen(g, a.r, a.c));
      if (attackers.length === 1) return pick('frost', [attackers[0]]);
    }
  }
  // 4. Extra turn when a juicy capture is available
  if (has('hourglass') && level !== 'easy') {
    const caps = realLegalMoves(g, col).filter(m => m.capture && AI_VAL[ptype(pieceAt(g,m.to.r,m.to.c)) || 'p'] >= 300);
    if (caps.length) return pick('hourglass', []);
  }
  // 5. Strip a shield off something we'd like to capture
  if (has('disarm')) {
    const ts = single('disarm');
    const good = ts.find(([t]) => { const p = pieceAt(g,t.r,t.c); return p && color(p) === human && AI_VAL[ptype(p)] >= 300; });
    if (good) return pick('disarm', good);
  }
  // 6. Duplicate a minor piece
  if (has('clone') && level !== 'easy' && Math.random() < 0.6) {
    const s0 = cardTargets(g, 'clone', 0, [], col);
    if (s0.length) {
      const a = s0[(Math.random()*s0.length)|0];
      const s1 = cardTargets(g, 'clone', 1, [a], col);
      if (s1.length) return pick('clone', [a, s1[(Math.random()*s1.length)|0]]);
    }
  }
  // 7. Flavourful tricks, now and then
  if (Math.random() < (level === 'hard' ? 0.15 : 0.3) || forced) {
    if (has('poison')) {
      const dests = realLegalMoves(g, human).filter(m => !m.capture).map(m => m.to);
      const ts = single('poison').filter(([t]) => dests.some(d => d.r===t.r && d.c===t.c));
      if (ts.length) return pick('poison', ts[(Math.random()*ts.length)|0]);
    }
    if (has('frost')) {
      const ts = single('frost').sort((a,b) => AI_VAL[ptype(pieceAt(g,b[0].r,b[0].c))] - AI_VAL[ptype(pieceAt(g,a[0].r,a[0].c))]);
      if (ts.length && AI_VAL[ptype(pieceAt(g,ts[0][0].r,ts[0][0].c))] >= 500) return pick('frost', ts[0]);
    }
    if (has('march')) { const ts = single('march'); if (ts.length) return pick('march', ts[(Math.random()*ts.length)|0]); }
    if (has('quake') && level === 'easy') return pick('quake', []);
    if (has('pickpocket')) return pick('pickpocket', []);
    if (has('pilfer')) return pick('pilfer', []);
    if (has('tracker')) return pick('tracker', []);
    if (has('gambler') && g.hands[col].length >= 2) return pick('gambler', []);
    if (has('thornfield')) {
      const picksT = [];
      for (let st=0; st<2; st++) { const ts = cardTargets(g, 'thornfield', st, picksT, col); if (!ts.length) break; picksT.push(ts[(Math.random()*ts.length)|0]); }
      if (picksT.length === 2) return pick('thornfield', picksT);
    }
    if (has('tidal') && tidalMoves(g, human).length >= 3) return pick('tidal', []);
  }
  // 8. Forced (no legal moves): anything that works
  if (forced) {
    for (const id of playable) {
      const n = cardStageCount(id);
      if (n === 0) return pick(id, []);
      const picks = [];
      for (let s=0; s<n; s++) {
        const ts = cardTargets(g, id, s, picks, col);
        if (!ts.length) break;
        picks.push(ts[(Math.random()*ts.length)|0]);
      }
      if (picks.length === n) return pick(id, picks);
    }
  }
  return null;
}
