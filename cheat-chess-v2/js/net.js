/* =========================================================================
   CHEAT CHESS networked play.

   One match, two seats. Both sides run the same rules over the same seed, so
   only the actions need to travel: "I moved e2 to e4", "I cast Bomb Strike on
   d5". Nothing about the board is sent, and neither side is ever told the
   other's hand.

   Everything talks through a transport, so the game does not know or care
   whether the opponent is across the room or across the country:

     transport.send(action)        post one of my actions
     transport.onAction(fn)        their actions arrive here
     transport.onPresence(fn)      true when they have the app open
     transport.close()

   LoopbackTransport is the one used for development: the far end is a headless
   game in this same page, playing with the computer's brain. It exercises the
   whole path, including the seed agreeing, with no server involved.
   ========================================================================= */

/* Two separate decisions.

   FRIENDS_ENABLED puts the Multiplayer menu and the Friends screen in the game.
   Off means Multiplayer is simply pass and play, which is what the family build
   ships with until friends matches have been played across two real devices.

   FRIENDS_DEV adds the practice opponent to that screen, for walking the flow
   through on a single device. It should be off in anything a tester sees. */
const FRIENDS_ENABLED = true;
const FRIENDS_DEV = false;

const Net = (() => {
  let tx = null;                 // the live transport
  let seat = null;               // 'w' or 'b': which side I am
  let onRemote = null;           // handed in by the game, applies their action
  let onPresenceChange = null;
  let theirPresence = false;
  let seq = 0;                   // my action counter, so a repeat can be spotted
  let lastSeen = -1;             // the highest of theirs I have applied

  /* An action is deliberately tiny and complete: the receiver can apply it
     without asking anything back. */
  function move(mv) {
    return { kind:'move', seq:++seq, mv:{ from:mv.from, to:mv.to, promoChoice:mv.promoChoice || null } };
  }
  function card(id, picks) {
    return { kind:'card', seq:++seq, id, picks: picks || [] };
  }
  function quit(reason) {
    return { kind:'quit', seq:++seq, reason: reason || 'resign' };
  }

  function attach(transport, mySeat, applyRemote) {
    detach();
    tx = transport;
    seat = mySeat;
    onRemote = applyRemote;
    seq = 0; lastSeen = -1; theirPresence = false;
    tx.onAction(action => {
      if (!action || action.seq <= lastSeen) return;      // already applied
      lastSeen = action.seq;
      if (onRemote) onRemote(action);
    });
    if (tx.onPresence) tx.onPresence(here => {
      theirPresence = !!here;
      if (onPresenceChange) onPresenceChange(theirPresence);
    });
  }
  function detach() {
    if (tx && tx.close) { try { tx.close(); } catch (e) {} }
    tx = null; seat = null; onRemote = null;
  }

  return {
    attach, detach,
    get active(){ return !!tx; },
    get seat(){ return seat; },
    get present(){ return theirPresence; },
    onPresence(fn){ onPresenceChange = fn; },
    send(action){ if (tx) tx.send(action); },
    /* Wait for anything already sent to reach the server. */
    flush(){ return tx && tx.flush ? tx.flush() : Promise.resolve(); },
    /* true once a real backend is connected, which is what turns Challenge from
       a practice game into a real one */
    get canReachFriends(){ return !!Net.server; },
    server: null,                 /* the FirebaseBackend, when it connected */
    move, card, quit,
  };
})();


/* -------------------------------------------------------------------------
   A transport with no network in it. The far seat is a second game object in
   this page, fed by the computer's brain, which makes it a faithful stand in
   for a real opponent: it sees only its own hand, it rolls from the same seed,
   and if the two sides ever disagree the fingerprints stop matching.
   ------------------------------------------------------------------------- */
function LoopbackTransport(opts = {}) {
  const lag = opts.lag === undefined ? 420 : opts.lag;
  const level = opts.level || 'medium';
  const seat = opts.seat === 'b' ? 'b' : 'w';         // the seat the player holds
  const far = opp(seat);
  let listener = null, presence = null, closed = false;

  /* the opponent's own copy of the match */
  const shadow = newGame('online', level, { w:opts.decks.w, b:opts.decks.b }, opts.seed);
  drawCards(shadow, 'w', HAND_SIZE);
  drawCards(shadow, 'b', HAND_SIZE);
  let farSeq = 0;

  const deliver = action => {
    if (closed || !listener) return;
    setTimeout(() => { if (!closed) listener(action); }, lag);
  };

  /* Apply whatever the player did to the shadow game, then answer. */
  function applyHere(action) {
    if (action.kind === 'move') {
      const legal = realLegalMoves(shadow, seat)
        .find(m => m.from.r === action.mv.from.r && m.from.c === action.mv.from.c &&
                   m.to.r === action.mv.to.r && m.to.c === action.mv.to.c);
      if (!legal) return console.warn('[loopback] their move was not legal here', action);
      if (legal.promotion) legal.promoChoice = action.mv.promoChoice || 'q';
      makeMove(shadow, legal);
    } else if (action.kind === 'card') {
      playCard(shadow, action.id, action.picks, seat);
    } else if (action.kind === 'quit') {
      closed = true;
      return;
    }
    settle();
    if (shadow.state.turn === far) setTimeout(takeTurn, Math.max(120, lag));
  }

  /* Resolve anything the rules settle on their own, the way afterTurn does. */
  function settle() {
    for (let guard = 0; guard < 8; guard++) {
      const end = evaluateEnd(shadow);
      if (!end) return;
      if (end.over) { closed = true; return; }
      if (end.kingGuard) { triggerKingGuard(shadow, shadow.state.turn); continue; }
      if (end.skip) { shadow.state.turn = opp(shadow.state.turn); shadow.ply++; purgeEffects(shadow); continue; }
      return;
    }
  }

  function takeTurn() {
    if (closed || shadow.state.turn !== far) return;
    const moves = realLegalMoves(shadow, far);
    const forced = moves.length === 0;
    const chance = { easy:.22, medium:.45, hard:1 }[level];
    let picked = null;
    if (forced || Math.random() < chance) picked = aiPickCard(shadow, far, level, forced);
    if (picked) {
      playCard(shadow, picked.id, picked.picks, far);
      deliver({ kind:'card', seq:++farSeq, id:picked.id, picks:picked.picks });
    } else if (!forced) {
      const mv = aiChooseMove({
        board:shadow.state.board, turn:shadow.state.turn, castling:shadow.state.castling,
        ep:shadow.state.ep, walls:shadow.state.walls, level,
        frozen:shadow.effects.frozen.filter(f => shadow.ply < f.expire).map(f => ({ r:f.r, c:f.c })),
        warded:allSquares().filter(t => { const p = pieceAt(shadow, t.r, t.c); return p && color(p) !== far && isWarded(shadow, t.r, t.c, color(p)); }),
      }) || moves[(Math.random() * moves.length) | 0];
      if (mv.promotion) mv.promoChoice = 'q';
      makeMove(shadow, mv);
      deliver({ kind:'move', seq:++farSeq, mv:{ from:mv.from, to:mv.to, promoChoice:mv.promoChoice || null } });
    } else {
      deliver({ kind:'quit', seq:++farSeq, reason:'resign' });
      closed = true;
      return;
    }
    settle();
    if (!closed && shadow.state.turn === far) setTimeout(takeTurn, Math.max(120, lag));
  }

  return {
    send(action){ if (!closed) applyHere(action); },
    onAction(fn){
      listener = fn;
      if (presence) setTimeout(() => presence(true), 80);
      if (shadow.state.turn === far) setTimeout(takeTurn, Math.max(300, lag));
    },
    onPresence(fn){ presence = fn; setTimeout(() => fn(true), 80); },
    close(){ closed = true; },
    /* development only: lets a test confirm both sides still agree */
    _fingerprint(){
      return [shadow.state.board.map(p => p || '.').join(''), shadow.state.turn,
              shadow.ply, shadow.hands.w.join(','), shadow.hands.b.join(',')].join('|');
    },
  };
}

/* A plain in-page pipe between two transports, for a future two window test. */
function PairTransport() {
  let other = null, listener = null, presence = null;
  const api = {
    send(a){ if (other && other._recv) other._recv(a); },
    onAction(fn){ listener = fn; },
    onPresence(fn){ presence = fn; },
    close(){ if (presence) presence(false); },
    _recv(a){ if (listener) listener(a); },
    _link(o){ other = o; if (presence) presence(true); },
  };
  return api;
}
function linkPair() {
  const a = PairTransport(), b = PairTransport();
  a._link(b); b._link(a);
  return [a, b];
}


/* -------------------------------------------------------------------------
   Development entry point: play a full networked match against the loopback
   opponent, with no server anywhere. This is the same call the Friends flow
   will make, with a real transport in place of the loopback.
   ------------------------------------------------------------------------- */
function devLocalMatch(opts = {}) {
  const seat = opts.seat === 'b' ? 'b' : 'w';
  const level = opts.level || 'medium';
  const seed = opts.seed === undefined ? (Math.random() * 0x100000000) >>> 0 : opts.seed;
  const mine = playerDeck();
  const theirs = opts.theirDeck || playerDeck();
  const decks = seat === 'b' ? { w:theirs, b:mine } : { w:mine, b:theirs };
  const transport = LoopbackTransport({ seat, seed, decks, level, lag: opts.lag });
  startMatch('online', level, { seat, seed, transport, theirDeck:theirs, opponentName:opts.name || 'Rowan' });
  return transport;
}
