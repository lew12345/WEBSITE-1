/* =========================================================================
   CHEAT CHESS: a networked match, as pure rules.

   Everything here is arithmetic over a game object: no screen, no sound, no
   network. That is the point. The app uses these functions to rejoin a match
   and to tell whose turn it is, and the test harness uses the very same ones
   to play thousands of matches between two simulated phones. If the harness
   says two devices agree, it is these functions that agreed, not a second
   implementation of them that happens to be luckier.

   The one rule that matters: both devices must build the game from the SAME
   inputs. The seed and both decks come from the match record on the server and
   from nowhere else - never from what this player happens to have equipped
   now. A deck read locally is how the two sides quietly end up playing
   different games.
   ========================================================================= */

/* The match record as both devices see it, turned into a game. */
function matchGame(record) {
  const decks = record.decks || {};
  const g = newGame('online', 'medium', { w:decks.w || CORE_IDS, b:decks.b || CORE_IDS }, record.seed);
  drawCards(g, 'w', HAND_SIZE);
  drawCards(g, 'b', HAND_SIZE);
  return g;
}

/* A match cannot start until both sides have put their deck on the record:
   the deal depends on both, so dealing early deals a different game. */
function matchReady(record) {
  const d = (record && record.decks) || {};
  return Array.isArray(d.w) && d.w.length > 0 && Array.isArray(d.b) && d.b.length > 0;
}

/* Everything that decides what happens next, in one short string. Two devices
   in the same game produce the same one; two devices that have drifted apart
   do not, and say so on the next action instead of quietly carrying on. */
function stateFingerprint(g) {
  const e = g.effects;
  const bits = [
    g.state.board.map(p => p || '.').join(''),
    g.state.turn, g.ply,
    g.state.castle ? JSON.stringify(g.state.castle) : '',
    g.state.ep ? g.state.ep.r + ':' + g.state.ep.c : '-',
    g.hands.w.join(','), g.hands.b.join(','),
    g.decks.w.length, g.decks.b.length,
    g.bonusTurns.w, g.bonusTurns.b,
    e.shields.length, e.vanish.length, e.frozen.length, e.traps.length, e.walls.length, e.silence.length,
  ].join('|');
  /* a short, stable hash: this travels with every action */
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < bits.length; i++) {
    const c = bits.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return h1.toString(36) + h2.toString(36);
}

/* What afterTurn does to the board, with none of what it does to the screen:
   the King's Guard firing and a skipped turn both change the position, so a
   silent replay has to do them too or the two devices end up in different
   games. */
function settleTurnQuietly(g) {
  for (let guard = 0; guard < 128; guard++) {
    const end = evaluateEnd(g);
    if (!end) return null;
    if (end.over) return end;
    if (end.kingGuard) { triggerKingGuard(g, g.state.turn); continue; }
    if (end.skip) { g.state.turn = opp(g.state.turn); g.ply++; purgeEffects(g); continue; }
    return end;
  }
  return null;
}

/* Apply one recorded action to a game. Returns what happened, and never throws
   on something that does not fit: the caller decides whether that means "catch
   up from the server" or "this is a bug". */
function applyMatchAction(g, action, col) {
  if (action.kind === 'quit') return { over:true, quitBy:col };
  if (g.state.turn !== col) return { broke:'out of turn' };
  if (action.kind === 'move') {
    const mv = action.mv || {};
    const legal = realLegalMoves(g, col).find(m =>
      m.from.r === mv.from.r && m.from.c === mv.from.c &&
      m.to.r === mv.to.r && m.to.c === mv.to.c);
    if (!legal) return { broke:'a move that does not fit' };
    if (legal.promotion) legal.promoChoice = mv.promoChoice || 'q';
    makeMove(g, legal);
  } else if (action.kind === 'card') {
    if (!g.hands[col].includes(action.id)) return { broke:'a card that is not in hand' };
    playCard(g, action.id, action.picks || [], col);
  } else {
    return { broke:'an action of a kind this game does not know' };
  }
  const end = settleTurnQuietly(g);
  if (end && end.over) return { over:true, end };
  return {};
}

/* Play a match's recorded actions into a game, in order. Both rejoining a game
   and asking whose move it is go through here, so there is only ever one
   answer to what the board looks like. */
function replayActions(g, actions, myUid, seat) {
  for (const a of actions) {
    const col = a.by === myUid ? seat : opp(seat);
    const res = applyMatchAction(g, a, col);
    if (res.broke) return { broke:res.broke, at:a };
    if (res.over) return res;
  }
  return {};
}

/* Build the match from its record and play it out: the state both devices
   should be looking at. */
function matchStateFrom(record, myUid) {
  if (!matchReady(record)) return { waiting:true };
  const g = matchGame(record);
  const res = replayActions(g, record.actions || [], myUid, record.seat);
  return { g, ...res };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { matchGame, matchReady, stateFingerprint, settleTurnQuietly,
                     applyMatchAction, replayActions, matchStateFrom };
}
