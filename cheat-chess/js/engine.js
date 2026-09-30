/* =========================================================================
   CHEAT CHESS: pure chess rules engine.
   Shared by the main thread and the AI worker (no DOM access here).
   Board: array of 64, index = r*8+c, r=0 is Black's back rank (rank 8).
   Pieces are 2-char strings: colour ('w'|'b') + type ('p','n','b','r','q','k').
   ========================================================================= */
const KNIGHT_D = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KING_D   = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const BISHOP_D = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOK_D   = [[-1,0],[1,0],[0,-1],[0,1]];
const QUEEN_D  = BISHOP_D.concat(ROOK_D);

function idx(r,c){ return r*8+c; }
function inb(r,c){ return r>=0 && r<8 && c>=0 && c<8; }
function color(p){ return p ? p[0] : null; }
function ptype(p){ return p ? p[1] : null; }
function opp(col){ return col === 'w' ? 'b' : 'w'; }
function sqName(r,c){ return 'abcdefgh'[c] + (8-r); }

function initState() {
  const b = new Array(64).fill(null);
  const back = ['r','n','b','q','k','b','n','r'];
  for (let c = 0; c < 8; c++) {
    b[c] = 'b' + back[c];
    b[8+c] = 'bp';
    b[48+c] = 'wp';
    b[56+c] = 'w' + back[c];
  }
  return { board:b, turn:'w', castling:{wK:true,wQ:true,bK:true,bQ:true}, ep:null, walls:{} };
}

function cloneState(s){
  return { board:s.board.slice(), turn:s.turn, castling:{...s.castling},
    ep: s.ep ? {r:s.ep.r, c:s.ep.c} : null, walls:s.walls || {} };
}

/* Is square (r,c) attacked by any piece of colour `by`? Walls block sliding pieces. */
function isAttacked(state, r, c, by) {
  const b = state.board, walls = state.walls || {};
  const pr = by === 'w' ? r+1 : r-1; // a white pawn attacks "upwards", so it sits one row below
  if (pr >= 0 && pr < 8) {
    if (c > 0 && b[pr*8+c-1] === by+'p') return true;
    if (c < 7 && b[pr*8+c+1] === by+'p') return true;
  }
  for (const [dr,dc] of KNIGHT_D) { const nr=r+dr, nc=c+dc; if (inb(nr,nc) && b[nr*8+nc] === by+'n') return true; }
  for (const [dr,dc] of KING_D)   { const nr=r+dr, nc=c+dc; if (inb(nr,nc) && b[nr*8+nc] === by+'k') return true; }
  for (const [dr,dc] of BISHOP_D) {
    let nr=r+dr, nc=c+dc;
    while (inb(nr,nc)) {
      const p = b[nr*8+nc];
      if (p) { if (p === by+'b' || p === by+'q') return true; break; }
      if (walls[nr+','+nc]) break;
      nr+=dr; nc+=dc;
    }
  }
  for (const [dr,dc] of ROOK_D) {
    let nr=r+dr, nc=c+dc;
    while (inb(nr,nc)) {
      const p = b[nr*8+nc];
      if (p) { if (p === by+'r' || p === by+'q') return true; break; }
      if (walls[nr+','+nc]) break;
      nr+=dr; nc+=dc;
    }
  }
  return false;
}

/* Every piece of colour `by` that attacks (r,c), used by King's Guard. */
function attackersOf(state, r, c, by) {
  const b = state.board, walls = state.walls || {}, out = [];
  const pr = by === 'w' ? r+1 : r-1;
  if (pr >= 0 && pr < 8) for (const dc of [-1,1]) { const nc=c+dc; if (inb(pr,nc) && b[pr*8+nc] === by+'p') out.push({r:pr,c:nc}); }
  for (const [dr,dc] of KNIGHT_D) { const nr=r+dr, nc=c+dc; if (inb(nr,nc) && b[nr*8+nc] === by+'n') out.push({r:nr,c:nc}); }
  for (const [dr,dc] of KING_D)   { const nr=r+dr, nc=c+dc; if (inb(nr,nc) && b[nr*8+nc] === by+'k') out.push({r:nr,c:nc}); }
  for (const [dirs, types] of [[BISHOP_D,'bq'],[ROOK_D,'rq']]) {
    for (const [dr,dc] of dirs) {
      let nr=r+dr, nc=c+dc;
      while (inb(nr,nc)) {
        const p = b[nr*8+nc];
        if (p) { if (color(p) === by && types.includes(ptype(p))) out.push({r:nr,c:nc}); break; }
        if (walls[nr+','+nc]) break;
        nr+=dr; nc+=dc;
      }
    }
  }
  return out;
}

function findKing(state, col){
  const k = col+'k';
  for (let i=0;i<64;i++) if (state.board[i] === k) return { r:(i/8)|0, c:i%8 };
  return null;
}
function inCheck(state, col){
  const k = findKing(state, col);
  return k ? isAttacked(state, k.r, k.c, opp(col)) : false;
}

/* Pseudo-legal moves for the piece on (r,c). Kings can never be captured
   (a safety net for positions that cheat cards can create). */
function pseudoMoves(state, r, c) {
  const { board } = state, walls = state.walls || {}, ep = state.ep, castling = state.castling;
  const p = board[idx(r,c)];
  if (!p) return [];
  const col = color(p), t = ptype(p);
  const moves = [];
  const push = (nr,nc,flags) => moves.push({ from:{r,c}, to:{r:nr,c:nc}, ...flags });
  const canTake = target => color(target) !== col && ptype(target) !== 'k';

  if (t === 'p') {
    const dir = col === 'w' ? -1 : 1;
    const startRow = col === 'w' ? 6 : 1;
    const lastRow = col === 'w' ? 0 : 7;
    const oneR = r + dir;
    if (inb(oneR,c) && !board[idx(oneR,c)] && !walls[oneR+','+c]) {
      push(oneR, c, { promotion: oneR === lastRow });
      const twoR = r + 2*dir;
      if (r === startRow && inb(twoR,c) && !board[idx(twoR,c)] && !walls[twoR+','+c]) push(twoR, c, { doubleStep:true });
    }
    for (const dc of [-1,1]) {
      const nr = oneR, nc = c+dc;
      if (!inb(nr,nc)) continue;
      const target = board[idx(nr,nc)];
      if (target && canTake(target)) push(nr, nc, { capture:true, promotion: nr === lastRow });
      else if (!target && ep && ep.r === nr && ep.c === nc && board[idx(r,nc)] === opp(col)+'p')
        push(nr, nc, { capture:true, enPassant:true });
    }
  } else if (t === 'n' || t === 'k') {
    for (const [dr,dc] of (t === 'n' ? KNIGHT_D : KING_D)) {
      const nr=r+dr, nc=c+dc;
      if (!inb(nr,nc) || walls[nr+','+nc]) continue;
      const target = board[idx(nr,nc)];
      if (!target) push(nr,nc,{}); else if (canTake(target)) push(nr,nc,{capture:true});
    }
    if (t === 'k') {
      const home = col === 'w' ? 7 : 0;
      if (r === home && c === 4 && !inCheck(state, col)) {
        const en = opp(col);
        const kf = col === 'w' ? 'wK' : 'bK', qf = col === 'w' ? 'wQ' : 'bQ';
        if (castling[kf] && !board[idx(home,5)] && !board[idx(home,6)] && board[idx(home,7)] === col+'r' &&
            !walls[home+',5'] && !walls[home+',6'] &&
            !isAttacked(state,home,5,en) && !isAttacked(state,home,6,en)) push(home,6,{castle:'K'});
        if (castling[qf] && !board[idx(home,3)] && !board[idx(home,2)] && !board[idx(home,1)] && board[idx(home,0)] === col+'r' &&
            !walls[home+',3'] && !walls[home+',2'] && !walls[home+',1'] &&
            !isAttacked(state,home,3,en) && !isAttacked(state,home,2,en)) push(home,2,{castle:'Q'});
      }
    }
  } else {
    const dirs = t === 'b' ? BISHOP_D : t === 'r' ? ROOK_D : QUEEN_D;
    for (const [dr,dc] of dirs) {
      let nr=r+dr, nc=c+dc;
      while (inb(nr,nc)) {
        if (walls[nr+','+nc]) break;
        const target = board[idx(nr,nc)];
        if (!target) push(nr,nc,{});
        else { if (canTake(target)) push(nr,nc,{capture:true}); break; }
        nr+=dr; nc+=dc;
      }
    }
  }
  return moves;
}

function clearCastleRightsAt(castling, r, c) {
  if (r===0 && c===0) castling.bQ = false;
  if (r===0 && c===7) castling.bK = false;
  if (r===7 && c===0) castling.wQ = false;
  if (r===7 && c===7) castling.wK = false;
  if (r===0 && c===4) { castling.bK = false; castling.bQ = false; }
  if (r===7 && c===4) { castling.wK = false; castling.wQ = false; }
}

function applyMove(state, move) {
  const s = cloneState(state);
  const b = s.board;
  const p = b[idx(move.from.r, move.from.c)];
  const col = color(p);
  if (move.enPassant) b[idx(move.from.r, move.to.c)] = null;
  b[idx(move.from.r, move.from.c)] = null;
  b[idx(move.to.r, move.to.c)] = move.promotion ? col + (move.promoChoice || 'q') : p;
  if (move.castle) {
    const h = move.from.r;
    if (move.castle === 'K') { b[idx(h,5)] = b[idx(h,7)]; b[idx(h,7)] = null; }
    else { b[idx(h,3)] = b[idx(h,0)]; b[idx(h,0)] = null; }
  }
  s.ep = move.doubleStep ? { r:(move.from.r+move.to.r)/2, c:move.from.c } : null;
  clearCastleRightsAt(s.castling, move.from.r, move.from.c);
  clearCastleRightsAt(s.castling, move.to.r, move.to.c);
  s.turn = opp(col);
  return s;
}

function legalMoves(state, filterColor) {
  const col = filterColor || state.turn;
  const all = [];
  for (let i=0;i<64;i++) {
    const p = state.board[i];
    if (!p || p[0] !== col) continue;
    for (const m of pseudoMoves(state, (i/8)|0, i%8)) {
      if (!inCheck(applyMove(state, m), col)) all.push(m);
    }
  }
  return all;
}

/* Move-generation test: perft(1)=20, perft(2)=400, perft(3)=8902, perft(4)=197281 */
function perft(state, depth) {
  if (depth === 0) return 1;
  let n = 0;
  for (const m of legalMoves(state)) {
    if (m.promotion) { for (const pc of 'qrbn') n += perft(applyMove(state, {...m, promoChoice:pc}), depth-1); }
    else n += perft(applyMove(state, m), depth-1);
  }
  return n;
}

/* Only kings left, or king + one minor piece vs lone king. */
function insufficientMaterial(board) {
  const rest = board.filter(p => p && ptype(p) !== 'k');
  if (rest.length === 0) return true;
  if (rest.length === 1 && (ptype(rest[0]) === 'n' || ptype(rest[0]) === 'b')) return true;
  return false;
}
