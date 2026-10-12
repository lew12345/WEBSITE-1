/* =========================================================================
   CHEAT CHESS progression.
   GAMBITS are both experience and currency:
     lifetime  never goes down. It drives your rank and your card milestones.
     balance   what you can spend in the shop.
   Saved separately from stats, so "Reset Stats" never costs you cards or gear.
   ========================================================================= */
const CURRENCY = 'Gambits';
const MILESTONE_XP = 400;          // every 400 lifetime Gambits earns a free card
const XP = {
  capture: 5,
  card: 3,
  loss: 10,
  draw: 25,
  win: 60,
  winBonus: { easy:0, medium:15, hard:40 },
  pvpFinish: 15,
  quit: 20,                        // forfeited for resigning or walking out
};

/* Rank ladder: 10 Apprentice, 10 Knight, 10 Grandmaster. */
const RANK_TIERS = ['Apprentice', 'Knight', 'Grandmaster'];
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const MAX_LEVEL = 30;
const GRANDMASTER_LEVEL = 21;      // where the Grandmaster tier begins

/* The title past the ladder. Named for the Immortal Game of 1851; change this
   one line to call it something else and the whole game follows. */
const GLORY = { title:'Immortal', run:5 };
/* The rank curve. Early levels are cheap, so the first session hands out several
   of them, and each level then costs more than the last. Grandmaster X sits at
   the far end on purpose: something to aim at, not something to tidy up.
   Roughly, for a player winning about half their games at an hour a day:
   a level in the first game, Knight I at three hours, Knight X in a fortnight,
   Grandmaster X at about three months. */
const LEVEL_FLOORS = (() => {
  const out = [0];
  for (let n = 1; n < MAX_LEVEL; n++) {
    out.push(out[n - 1] + Math.round(53.53 * Math.pow(n, 0.91 + 0.027 * n) / 5) * 5);
  }
  return out;
})();
function levelFloor(level){ return LEVEL_FLOORS[Math.max(0, Math.min(level, MAX_LEVEL - 1))]; }
function levelFromXp(xp) {
  let lv = 1;
  while (lv < MAX_LEVEL && xp >= levelFloor(lv)) lv++;
  return lv;
}
function rankName(level) {
  const tier = RANK_TIERS[Math.min(RANK_TIERS.length - 1, Math.floor((level - 1) / 10))];
  return `${tier} ${ROMAN[(level - 1) % 10]}`;
}

const Progress = (() => {
  const KEY = 'cheatchess.progress.v2';
  const DEF = {
    avatar:null,                                   // null until the player creates one
    xp:{ lifetime:0, balance:0 },
    milestonesClaimed:0,
    owned:{ cards:CORE_IDS.slice(), pieces:['classic'], gear:['none'], pets:['none'],
            halls:['stone'], carpets:['none'], crests:['pawn'], legendaryPack:false },
    equipped:{ pieces:'classic', hall:'stone', carpet:'none', crest:'pawn' },
    deck:CORE_IDS.slice(),
    achieved:{}, seen:[],
    daily:{ last:null, streak:0, best:0 },
    /* the Immortal run: wins in a row that count, and whether you hold it */
    glory:{ run:0, immortal:false, best:0, held:0 },
    /* wins, losses and draws against each friend, by their id */
    vs:{},
    /* names you gave your friends. Device only: never sent, never backed up. */
    nicknames:{},
    /* matches you are in the middle of, by match id */
    games:{},
    c:{ wins:0, aiWins:{ easy:0, medium:0, hard:0 }, streak:0, bestStreak:0, quickWins:0, cleanWins:0,
        kgSaves:0, bestBomb:0, cardsCast:0, castIds:{}, pvp:0, dailyStreak:0 },
  };
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
  const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
  data = data ? merge(structuredClone(DEF), data) : structuredClone(DEF);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  return { data, save };
})();

/* Older saves had separate outfit and armour slots. Fold them into one gear slot.
   Called from init(), once the art module has loaded. */
function migrateProfile() {
  const d = Progress.data, o = d.owned;
  if (!o.gear) o.gear = ['none'];
  for (const old of ['outfits', 'armour']) {
    if (Array.isArray(o[old])) {
      for (const id of o[old]) if (id !== 'apprentice' && !o.gear.includes(id)) o.gear.push(id);
      delete o[old];
    }
  }
  if (d.avatar && d.avatar.gear === undefined) {
    const a = d.avatar;
    a.gear = a.armour && a.armour !== 'none' ? a.armour : (a.outfit && a.outfit !== 'apprentice' ? a.outfit : 'none');
    if (a.gear === 'obsidian') a.gear = 'darkiron';
    if (a.gear === 'emeraldmail') a.gear = 'emerald';
    if (a.gear === 'dragonscale') a.gear = 'amberhorn';
    if (a.gear === 'shadow' || a.gear === 'frost') a.gear = 'nightfall';
    if (!AVATAR_ART.bodyGear.includes(a.gear) && !AVATAR_ART.fullGear.includes(a.gear)) a.gear = 'none';
    if (!AVATAR_ART.hair.includes(a.hair)) a.hair = 'crop';
    if (a.skin >= AVATAR_ART.skins) a.skin = 1;
    delete a.outfit; delete a.armour;
  }
  if (!d.glory) d.glory = { run:0, immortal:false, best:0, held:0 };
  if (!d.vs || typeof d.vs !== 'object') d.vs = {};
  if (!d.nicknames || typeof d.nicknames !== 'object') d.nicknames = {};
  if (!d.games || typeof d.games !== 'object') d.games = {};
  /* halls arrived after the first testers, so older saves have none */
  if (!Array.isArray(o.halls)) o.halls = ['stone'];
  if (!Array.isArray(o.carpets)) o.carpets = ['none'];
  if (!Array.isArray(o.crests)) o.crests = ['pawn'];
  if (!d.equipped.hall) d.equipped.hall = 'stone';
  if (!d.equipped.carpet) d.equipped.carpet = 'none';
  if (!d.equipped.crest) d.equipped.crest = 'pawn';
  /* the imp was retired in favour of the hound */
  if (d.avatar && d.avatar.pet === 'imp') d.avatar.pet = 'dog';
  if (Array.isArray(o.pets)) {
    o.pets = o.pets.map(id => id === 'imp' ? 'dog' : id).filter((id, i, all) => all.indexOf(id) === i);
  }
  Progress.save();
}

const P = Progress.data;
function ownedCards(){ return P.owned.cards; }
function ownsCard(id){ return P.owned.cards.includes(id); }
function playerLevel(){ return levelFromXp(P.xp.lifetime); }
function levelProgress() {
  const lv = playerLevel();
  const from = lv > 1 ? levelFloor(lv - 1) : 0, to = levelFloor(lv);
  return { level:lv, name:rankName(lv), from, to, have:P.xp.lifetime, pct: lv >= MAX_LEVEL ? 100 : (P.xp.lifetime - from) / (to - from) * 100 };
}

/* ------------------------------------------------------------- the title --
   Secret until it is within reach: nothing about it shows until you are a
   Grandmaster, and then only as a count of the run you are on. */
function isGrandmaster(){ return playerLevel() >= GRANDMASTER_LEVEL; }

/* Only the games that are actually hard count, in either direction. */
function gloryGame(mode, level){ return mode === 'online' || (mode === 'ai' && level === 'hard'); }

/* Returns what changed, so the end of the game can say so. */
function recordGlory(result, mode, level) {
  const g = P.glory;
  if (!gloryGame(mode, level) || !isGrandmaster()) return { none:true };
  if (result === 'draw') return { none:true };
  if (result === 'lose') {
    const had = g.immortal;
    g.run = 0; g.immortal = false;
    Progress.save();
    return { lost:had };
  }
  g.run++;
  g.best = Math.max(g.best, g.run);
  const gained = !g.immortal && g.run >= GLORY.run;
  if (gained) { g.immortal = true; g.held++; }
  Progress.save();
  return { gained, run:g.run };
}
function isImmortal(){ return !!P.glory.immortal; }
/* How far along the run is, or null when there is nothing to show yet. */
function gloryRun() {
  if (!isGrandmaster()) return null;
  if (P.glory.immortal) return { held:true, run:P.glory.run };
  return P.glory.run > 0 ? { held:false, run:P.glory.run, need:GLORY.run } : null;
}

/* ----------------------------------------------------- head to head -------
   Only games actually played against that friend, on this device. */
function recordVs(friendId, result) {
  if (!friendId) return null;
  const all = P.vs || (P.vs = {});
  const r = all[friendId] || (all[friendId] = { w:0, l:0, d:0 });
  if (result === 'win') r.w++; else if (result === 'lose') r.l++; else r.d++;
  r.at = Date.now();
  Progress.save();
  return r;
}
function vsRecord(friendId){ return (P.vs && P.vs[friendId]) || null; }
function vsText(r){ return r ? `${r.w}W ${r.l}L ${r.d}D` : ''; }

/* ------------------------------------------------------- games in progress
   A friend match lives on the server; this is only the note of where to find
   it again. Stale ones are dropped after a fortnight. */
const GAME_KEEP_MS = 14 * 24 * 60 * 60 * 1000;
function activeGames() {
  const all = P.games || (P.games = {});
  let changed = false;
  for (const id in all) if (Date.now() - (all[id].at || 0) > GAME_KEEP_MS) { delete all[id]; changed = true; }
  if (changed) Progress.save();
  return Object.values(all).sort((a, b) => b.at - a.at);
}
function gameWith(friendId){ return activeGames().find(g => g.friendId === friendId) || null; }
function rememberGame(info) {
  if (!info || !info.id) return;
  const all = P.games || (P.games = {});
  all[info.id] = { ...(all[info.id] || {}), ...info, at:Date.now() };
  Progress.save();
}
function forgetGame(id) {
  if (!id || !P.games || !P.games[id]) return;
  delete P.games[id];
  Progress.save();
}

/* Award Gambits. Returns how many milestone card draws it unlocked. */
function awardXp(amount) {
  if (amount <= 0) return 0;
  P.xp.lifetime += amount;
  P.xp.balance += amount;
  const due = Math.floor(P.xp.lifetime / MILESTONE_XP) - P.milestonesClaimed;
  Progress.save();
  return Math.max(0, due);
}
/* A penalty. It only touches the spendable balance, never lifetime Gambits, so
   it can cost you a purchase but never your rank or a card milestone. */
function chargeGambits(n) {
  const taken = Math.min(n, P.xp.balance);
  P.xp.balance -= taken;
  Progress.save();
  return taken;
}
function spendGambits(n) {
  if (P.xp.balance < n) return false;
  P.xp.balance -= n;
  Progress.save();
  return true;
}

/* ------------------------------------------------------------ card draws */
const TIER_ORDER = {
  common:    ['common','rare','epic','legendary'],
  rare:      ['rare','common','epic','legendary'],
  epic:      ['epic','rare','legendary','common'],
  legendary: ['legendary','epic','rare','common'],
};
function lockedCards(){ return RELIC_IDS.filter(id => !ownsCard(id)); }
function drawCardOfTier(tier) {
  const locked = lockedCards();
  if (!locked.length) return null;
  for (const r of (TIER_ORDER[tier] || TIER_ORDER.common)) {
    const pool = locked.filter(id => CARD_BY_ID[id].rarity === r);
    if (pool.length) return pool[(Math.random() * pool.length) | 0];
  }
  return null;
}
/* Milestone draws favour commons, but a legendary can turn up. */
function drawRandomCard() {
  const roll = Math.random();
  const tier = roll < .50 ? 'common' : roll < .82 ? 'rare' : roll < .97 ? 'epic' : 'legendary';
  return drawCardOfTier(tier);
}
function grantCard(id) {
  if (!id || ownsCard(id)) return false;
  P.owned.cards.push(id);
  Progress.save();
  return true;
}
/* Claim the card draws earned by passing Gambit milestones. */
function claimMilestones() {
  const due = Math.floor(P.xp.lifetime / MILESTONE_XP) - P.milestonesClaimed;
  const out = [];
  for (let i = 0; i < due; i++) {
    P.milestonesClaimed++;
    const card = drawRandomCard();
    if (card) grantCard(card);
    out.push({ milestone:P.milestonesClaimed * MILESTONE_XP, card });
  }
  Progress.save();
  return out;
}

/* ------------------------------------------------------------ daily streak */
function todayKey(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function touchDaily() {
  const t = todayKey(), d = P.daily;
  if (d.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yKey = y.getFullYear() + '-' + String(y.getMonth()+1).padStart(2,'0') + '-' + String(y.getDate()).padStart(2,'0');
  d.streak = d.last === yKey ? d.streak + 1 : 1;
  d.last = t;
  d.best = Math.max(d.best || 0, d.streak);
  P.c.dailyStreak = d.best;
  Progress.save();
}

/* ------------------------------------------------------------ challenges */
const ACHIEVEMENTS = [
  { id:'first_win', name:'First Blood',        icon:'⚔︎', tier:'common', target:1,  desc:'Beat the computer for the first time.',            val:c => c.wins },
  { id:'easy3',     name:'Schooled',           icon:'♟︎', tier:'common', target:3,  desc:'Beat Pip the Apprentice 3 times.',                 val:c => c.aiWins.easy },
  { id:'pvp5',      name:'Friendly Rivalry',   icon:'⚔︎', tier:'common', target:5,  desc:'Finish 5 Pass and Play games.',                    val:c => c.pvp },
  { id:'cast50',    name:'Card Shark',         icon:'♠︎', tier:'common', target:50, desc:'Cast 50 cheat cards.',                             val:c => c.cardsCast },
  { id:'daily3',    name:'Regular',            icon:'☀︎', tier:'common', target:3,  desc:'Play on 3 days in a row.',                         val:c => c.dailyStreak },
  { id:'medium3',   name:'Knighted',           icon:'♞︎', tier:'rare',   target:3,  desc:'Beat Sir Rowan 3 times.',                          val:c => c.aiWins.medium },
  { id:'streak3',   name:'Unstoppable',        icon:'★︎', tier:'rare',   target:3,  desc:'Win 3 games in a row against the computer.',       val:c => c.bestStreak },
  { id:'quick',     name:'Blitz',              icon:'⚡︎', tier:'rare',   target:1,  desc:'Beat the computer in 20 moves or fewer.',          val:c => c.quickWins },
  { id:'kg3',       name:'Long Live the King', icon:'♚︎', tier:'rare',   target:3,  desc:"Be saved by King's Guard 3 times.",                val:c => c.kgSaves },
  /* the blast is two squares now, so three in one go is no longer possible */
  { id:'bomb3',     name:'Demolition',         icon:'✹︎', tier:'rare',   target:2,  desc:'Destroy 2 enemy pieces with a single Bomb Strike.', val:c => c.bestBomb },
  { id:'daily10',   name:'Devoted',            icon:'☀︎', tier:'rare',   target:10, desc:'Play on 10 days in a row.',                        val:c => c.dailyStreak },
  { id:'clean',     name:'Honest Victory',     icon:'⚖︎', tier:'epic',   target:1,  desc:'Beat the computer without casting a single card.', val:c => c.cleanWins },
  { id:'hard1',     name:'Shadow Slayer',      icon:'♛︎', tier:'epic',   target:1,  desc:'Defeat the Shadow Warden.',                        val:c => c.aiWins.hard },
  { id:'allcore',   name:'Master of Tricks',   icon:'✦︎', tier:'epic',   target:19, desc:'Cast all 19 playable core cards at least once.',   val:c => CORE_IDS.filter(id => id !== 'kingguard' && c.castIds[id]).length },
  { id:'daily30',   name:'Obsessed',           icon:'☀︎', tier:'epic',   target:30, desc:'Play on 30 days in a row.',                        val:c => c.dailyStreak },
  { id:'hard5',     name:'True Grandmaster',   icon:'♚︎', tier:'legendary', target:5, desc:'Defeat the Shadow Warden 5 times.',              val:c => c.aiWins.hard },
];
function achievementProgress(a){ return Math.min(a.target, a.val(P.c)); }

/* Mark newly met challenges complete and unlock a card from their reward tier. */
function checkAchievements() {
  const earned = [];
  for (const a of ACHIEVEMENTS) {
    if (P.achieved[a.id] || a.val(P.c) < a.target) continue;
    const card = drawCardOfTier(a.tier);
    if (card) grantCard(card);
    P.achieved[a.id] = { card, at:Date.now() };
    earned.push({ ach:a, card });
  }
  if (earned.length) Progress.save();
  return earned;
}

/* ------------------------------------------------------------ deck */
function validDeck(deck) {
  const owned = ownedCards();
  const clean = (deck || []).filter((id, i, arr) => owned.includes(id) && arr.indexOf(id) === i);
  if (clean.length === DECK_SIZE) return clean;
  const rest = owned.filter(id => !clean.includes(id));
  while (clean.length < DECK_SIZE && rest.length) clean.push(rest.splice((Math.random() * rest.length) | 0, 1)[0]);
  return clean.slice(0, DECK_SIZE);
}
function playerDeck() {
  const d = validDeck(P.deck);
  if (d.join() !== (P.deck || []).join()) { P.deck = d; Progress.save(); }
  return d.slice();
}
/* The computer brings its own 20, drawn from the whole card pool. */
function aiDeck(level) {
  const pool = CARDS.filter(c => level === 'easy' ? ['common','rare'].includes(c.rarity) : level === 'medium' ? c.rarity !== 'legendary' : true).map(c => c.id);
  return shuffleDeck(pool).slice(0, DECK_SIZE);
}

/* Relic cards the player owns (used by the codex and challenge screens). */
function unlockedRelics(){ return RELIC_IDS.filter(id => ownsCard(id)); }
