/* =========================================================================
   CHEAT CHESS: computer opponent move search.
   Runs inside ai-worker.js (preferred) or on the main thread as a fallback.
   Depends on engine.js.
   ========================================================================= */
const AI_VAL = { p:100, n:320, b:330, r:500, q:900, k:0 };

// Piece-square tables from White's point of view (row 0 = rank 8).
const PST = {
  p:[ 0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
      0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0 ],
  n:[ -50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
      -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50 ],
  b:[ -20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
      -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20 ],
  r:[ 0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
      -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0 ],
  q:[ -20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
      0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20 ],
  k:[ -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20 ],
};

const AI_LEVELS = {
  easy:   { maxDepth:1, pst:false, quiesce:false, noise:180, blunder:0.18, timeMs:400 },
  medium: { maxDepth:3, pst:true,  quiesce:false, noise:25,  blunder:0,    timeMs:1200 },
  hard:   { maxDepth:4, pst:true,  quiesce:true,  noise:0,   blunder:0,    timeMs:2600 },
};

const MATE = 100000;

function aiEvaluate(state, usePst) {
  let s = 0;
  const b = state.board;
  for (let i=0;i<64;i++) {
    const p = b[i];
    if (!p) continue;
    const t = p[1];
    let v = AI_VAL[t];
    if (usePst) v += p[0] === 'w' ? PST[t][i] : PST[t][(7-((i/8)|0))*8 + i%8];
    s += p[0] === 'w' ? v : -v;
  }
  return state.turn === 'w' ? s : -s; // from the side-to-move's perspective
}

function orderMoves(state, moves) {
  const b = state.board;
  const score = m => {
    let s = 0;
    if (m.capture) {
      const victim = m.enPassant ? 'p' : ptype(b[idx(m.to.r,m.to.c)]);
      s += 10*AI_VAL[victim] - AI_VAL[ptype(b[idx(m.from.r,m.from.c)])] + 10000;
    }
    if (m.promotion) s += 8000;
    return s;
  };
  return moves.map(m => [score(m), m]).sort((a,b2) => b2[0]-a[0]).map(x => x[1]);
}

function aiChooseMove(payload) {
  const cfg = AI_LEVELS[payload.level] || AI_LEVELS.medium;
  const root = { board: payload.board, turn: payload.turn, castling: payload.castling, ep: payload.ep, walls: payload.walls || {} };
  const frozen = new Set((payload.frozen || []).map(f => f.r+','+f.c));
  const warded = new Set((payload.warded || []).map(f => f.r+','+f.c));
  const deadline = Date.now() + cfg.timeMs;
  let nodes = 0, aborted = false;

  let rootMoves = legalMoves(root, root.turn).filter(m => {
    if (frozen.has(m.from.r+','+m.from.c)) return false;
    if (m.capture && !m.enPassant && warded.has(m.to.r+','+m.to.c)) return false;
    return true;
  });
  if (rootMoves.length === 0) return null;
  if (cfg.blunder && Math.random() < cfg.blunder) {
    return rootMoves[(Math.random()*rootMoves.length)|0];
  }

  function quiesce(state, alpha, beta, qd) {
    nodes++;
    const stand = aiEvaluate(state, cfg.pst);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (qd >= 4) return stand;
    const col = state.turn;
    const caps = [];
    for (let i=0;i<64;i++) {
      const p = state.board[i];
      if (!p || p[0] !== col) continue;
      for (const m of pseudoMoves(state,(i/8)|0,i%8)) if (m.capture) caps.push(m);
    }
    for (const m of orderMoves(state, caps)) {
      const next = applyMove(state, m);
      if (inCheck(next, col)) continue;
      const s = -quiesce(next, -beta, -alpha, qd+1);
      if (s >= beta) return beta;
      if (s > alpha) alpha = s;
    }
    return alpha;
  }

  function negamax(state, depth, alpha, beta, ply) {
    if ((++nodes & 511) === 0 && Date.now() > deadline) aborted = true;
    if (aborted) return 0;
    if (depth <= 0) return cfg.quiesce ? quiesce(state, alpha, beta, 0) : aiEvaluate(state, cfg.pst);
    const moves = legalMoves(state);
    if (moves.length === 0) return inCheck(state, state.turn) ? -MATE + ply : 0;
    for (const m of orderMoves(state, moves)) {
      const s = -negamax(applyMove(state, m), depth-1, -beta, -alpha, ply+1);
      if (s >= beta) return beta;
      if (s > alpha) alpha = s;
    }
    return alpha;
  }

  let best = orderMoves(root, rootMoves)[0];
  rootMoves = orderMoves(root, rootMoves);
  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    let depthBest = null, depthScore = -Infinity;
    const scored = [];
    for (const m of rootMoves) {
      let s = -negamax(applyMove(root, m), depth-1, -MATE-1, MATE+1, 1);
      if (aborted) break;
      if (cfg.noise) s += (Math.random()*2-1) * cfg.noise;
      scored.push([s, m]);
      if (s > depthScore) { depthScore = s; depthBest = m; }
    }
    if (aborted) break;
    best = depthBest || best;
    // search the best move first on the next iteration
    rootMoves = scored.sort((a,b2) => b2[0]-a[0]).map(x => x[1]);
    if (depthScore >= MATE - 50) break; // found a forced mate
  }
  if (best.promotion) best = { ...best, promoChoice:'q' };
  return best;
}
