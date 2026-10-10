/* =========================================================================
   CHEAT CHESS halls.

   The hall is the room the game opens in, and from now on it is the one thing
   a friend sees when they look you up, so it is worth dressing.

   A hall is eight colours. Everything else in the scene - the pillars, the
   floor tiles, the carpet, the torchlight, the sky through the window - is
   worked out from those eight, which is what keeps a theme coherent and makes
   a new one cheap. The room itself is still the one SVG in index.html; its
   fills are custom properties, so changing hall is changing eight numbers
   rather than redrawing a room.

   Seasonal halls can only be bought while their season is open. Once one is
   yours it stays yours, in season or out.
   ========================================================================= */

const HALL_SHADOW = '#040f0d';

function hallRGB(c) {
  let s = String(c).replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const n = parseInt(s, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hallHex(r, g, b) {
  const p = x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return '#' + p(r) + p(g) + p(b);
}
function hallMix(a, b, t) {
  const A = hallRGB(a), B = hallRGB(b);
  return hallHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
const hallDark = (c, k) => hallMix(c, HALL_SHADOW, k);
const hallLift = (c, k) => hallMix(c, '#ffffff', k);

/* -------------------------------------------------------------------------
   The halls themselves.
     price     bought with Gambits
     premium   in the Legendary Pack, bought once with real money
     season    [[fromMonth, day], [toMonth, day]] - on sale only between those
     decor     the thing drifting through the air
   ------------------------------------------------------------------------- */
const HALLS = [
  { id:'stone', name:'The Great Hall', price:0, decor:'none',
    desc:'Where every player starts. Green stone, red carpet, two honest torches.',
    p:{ wall:'#143530', stone:'#2b524a', sky:'#14465a', rug:'#6b2632',
        trim:'#c9963c', glow:'#ffcf7a', moon:'#f2ffe8', banner:'#1f6e63' } },

  { id:'jade', name:'The Jade Court', price:2600, decor:'none',
    desc:'Polished jade and gold leaf. Quiet, expensive, slightly smug.',
    p:{ wall:'#10332f', stone:'#2f7a66', sky:'#0f5a56', rug:'#1f5f4a',
        trim:'#ffe08a', glow:'#8affd0', moon:'#e8fff6', banner:'#2a8a74' } },

  { id:'obsidian', name:'The Obsidian Vault', price:4200, decor:'none',
    desc:'Black glass walls and violet light. Nothing in here echoes.',
    p:{ wall:'#17171f', stone:'#3c4150', sky:'#241a44', rug:'#2a1230',
        trim:'#c9963c', glow:'#a98cff', moon:'#dcd4ff', banner:'#3a2a5a' } },

  { id:'midwinter', name:'Midwinter Hall', price:1800, decor:'snow',
    season:[[12, 1], [1, 15]], flame:'hue-rotate(155deg) saturate(1.3)',
    desc:'Frost on the pillars, blue fire in the sconces and snow in the air.',
    p:{ wall:'#16303a', stone:'#4a7a8c', sky:'#1b4a6b', rug:'#2d5a7a',
        trim:'#dff2ff', glow:'#bfeaff', moon:'#ffffff', banner:'#2f6d94' } },

  { id:'harvest', name:'Harvest Hall', price:1800, decor:'leaves',
    season:[[9, 20], [11, 5]],
    desc:'Amber light, old oak, and leaves coming in through the high windows.',
    p:{ wall:'#2e2113', stone:'#7a5a32', sky:'#5a3a1a', rug:'#7a3a16',
        trim:'#ffc24a', glow:'#ff9a3a', moon:'#ffd98a', banner:'#8a5a1e' } },

  { id:'blossom', name:'Blossom Hall', price:1800, decor:'petals',
    season:[[3, 15], [5, 15]],
    desc:'The spring hall. Petals drift across the floor all game.',
    p:{ wall:'#203a33', stone:'#6f8f7a', sky:'#3a6a8a', rug:'#8a3a56',
        trim:'#ffd9e6', glow:'#ffc3d8', moon:'#fff2f6', banner:'#b85a7a' } },

  { id:'dragonkeep', name:'Dragon Keep', premium:true, decor:'embers',
    flame:'saturate(1.4) brightness(1.1)',
    desc:'Scorched stone, a crimson rug, and embers rising off the floor.',
    p:{ wall:'#2a1210', stone:'#6b3a2a', sky:'#4a1208', rug:'#6b1a16',
        trim:'#ffd35c', glow:'#ff7a3a', moon:'#ffb347', banner:'#8a2a18' } },

  /* violet rather than blue, so it never reads as Midwinter in a hurry */
  { id:'starfall', name:'Starfall Sanctum', premium:true, decor:'stars',
    flame:'hue-rotate(255deg) saturate(1.35)',
    desc:'Open to the night sky. The stars come down and hang in the hall.',
    p:{ wall:'#1b1140', stone:'#6a5aa8', sky:'#2a1a6a', rug:'#3a2068',
        trim:'#ffe9a8', glow:'#c9a8ff', moon:'#fff4ff', banner:'#4a2aa0' } },
];

function hallById(id){ return HALLS.find(hl => hl.id === id) || null; }

/* Every fill in the scene, worked out from the eight. */
function hallPalette(hall) {
  const p = (hall || HALLS[0]).p;
  return {
    wall1:hallDark(p.wall, .34), wall2:p.wall, wall3:hallDark(p.wall, .5),
    line:hallDark(p.wall, .74), floor:hallDark(p.wall, .56),
    pil1:hallDark(p.stone, .62), stone:p.stone, pil3:hallDark(p.stone, .32), pil4:hallDark(p.stone, .74),
    frame1:hallDark(p.stone, .24), frame2:hallLift(p.stone, .26),
    sky1:hallDark(p.sky, .62), sky2:p.sky, sky3:hallLift(p.sky, .34),
    tileA:hallLift(p.wall, .14), tileB:hallDark(p.wall, .26),
    rug1:p.rug, rug2:hallDark(p.rug, .24), rugLine:hallLift(p.rug, .2),
    rugTrim:p.trim, fringe:hallLift(p.trim, .26), rugWarm:p.glow,
    ban1:p.banner, ban2:hallDark(p.banner, .46), crest:p.trim,
    rod:hallDark(p.trim, .46), rodLine:hallDark(p.trim, .8), wood:hallDark(p.trim, .62),
    beam:hallLift(p.sky, .62), pool:hallLift(p.glow, .5),
    glow1:p.glow, glow2:hallDark(p.glow, .22),
    moon:p.moon, moonShade:hallDark(p.moon, .2), stars:hallLift(p.moon, .3),
    motes:hallLift(p.glow, .55),
  };
}

/* ------------------------------------------------------------- seasons -- */
const HALL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                     'August', 'September', 'October', 'November', 'December'];
function hallInSeason(hall, now) {
  if (!hall || !hall.season) return true;
  const d = now || new Date();
  const key = (m, day) => m * 100 + day;
  const today = key(d.getMonth() + 1, d.getDate());
  const from = key(hall.season[0][0], hall.season[0][1]);
  const to = key(hall.season[1][0], hall.season[1][1]);
  /* a season that runs over the turn of the year wraps */
  return from <= to ? (today >= from && today <= to) : (today >= from || today <= to);
}
function hallSeasonNote(hall, now) {
  if (!hall || !hall.season) return '';
  const f = hall.season[0], t = hall.season[1];
  return hallInSeason(hall, now)
    ? `On sale until ${t[1]} ${HALL_MONTHS[t[0] - 1]}`
    : `Returns ${f[1]} ${HALL_MONTHS[f[0] - 1]}`;
}

/* ----------------------------------------------------------- ownership -- */
function hallsOwned() {
  const o = Progress.data.owned;
  if (!o.halls) o.halls = ['stone'];
  return o.halls;
}
function equippedHall(){ return Progress.data.equipped.hall || 'stone'; }
function ownsHall(id) {
  const hall = hallById(id);
  if (!hall) return false;
  if (hall.premium) return ownsPack();
  if (!hall.price) return true;
  return hallsOwned().includes(id);
}
/* Out of season is not the same as locked: you can still use what you own. */
function hallBuyable(id) {
  const hall = hallById(id);
  return !!hall && !hall.premium && !ownsHall(id) && hallInSeason(hall);
}
function buyHall(id) {
  const hall = hallById(id);
  if (!hall || !hallBuyable(id)) return false;
  if (!spendGambits(hall.price)) return false;
  hallsOwned().push(id);
  Progress.save();
  return true;
}
function equipHall(id) {
  if (!ownsHall(id)) return false;
  Progress.data.equipped.hall = id;
  Progress.save();
  if (typeof Account !== 'undefined' && Account.publishCard) Account.publishCard();
  return true;
}

/* ------------------------------------------------------------- the room -- */
function applyHallTheme(id, kit) {
  const hall = hallById(id || equippedHall()) || HALLS[0];
  const host = document.getElementById('scrLobby');
  if (!host) return;
  const dressed = hallDressed(hall.id, kit);
  for (const k in dressed.v) host.style.setProperty('--h-' + k, dressed.v[k]);
  host.style.setProperty('--h-flame', hall.flame || 'none');
  /* furniture you have not bought is simply not in the room */
  host.classList.toggle('carpet-bare', dressed.k.carpet === 'none');
  const crest = hallPart('crest', dressed.k.crest);
  document.querySelectorAll('#hallScene .hall-crest').forEach(g => { g.innerHTML = crest.art; });
  const kind = hall.decor || 'none';
  const decor = document.getElementById('hallDecor');
  if (decor && decor.dataset.kind !== kind) {
    decor.dataset.kind = kind;
    decor.className = 'hall-decor decor-' + kind;
    decor.innerHTML = hallDecorHTML(kind, dressed.v);
  }
}

/* Snow, leaves, petals, embers or hanging stars. One element each, placed at
   random and animated in CSS, so none of this costs a frame of script. */
function hallDecorHTML(kind, v) {
  if (!kind || kind === 'none') return '';
  const col = hallDecorColour(kind, v);
  const n = kind === 'stars' ? 16 : 18;
  const r = (a, b) => a + Math.random() * (b - a);
  let out = '';
  for (let i = 0; i < n; i++) {
    const size = kind === 'stars' ? r(2, 4.5) : kind === 'embers' ? r(2, 4) : r(3, 7);
    out += `<i style="--x:${r(0, 100).toFixed(1)}%;--y:${r(6, 64).toFixed(1)}%;` +
      `--s:${size.toFixed(1)}px;--dx:${r(-34, 34).toFixed(0)}px;` +
      `--d:${(kind === 'stars' ? r(2.2, 4.8) : r(7, 16)).toFixed(1)}s;` +
      `--delay:-${r(0, 14).toFixed(1)}s;--c:${col}"></i>`;
  }
  return out;
}
function hallDecorColour(kind, v) {
  if (kind === 'petals') return hallLift(v.rug1, .62);
  if (kind === 'stars') return v.stars;
  if (kind === 'leaves' || kind === 'embers') return v.glow1;
  return v.moon;
}

/* ------------------------------------------------------------- the thumb --
   A small flat version of the room, for the shelf of halls and for looking up
   a friend. Flat fills only, with no gradients, so any number of these can
   sit on one screen without clashing ids. */
function hallThumbSVG(id, kit) {
  const hall = hallById(id) || HALLS[0];
  const dressed = hallDressed(hall.id, kit);
  const v = dressed.v, k = dressed.k;
  const crest = hallPart('crest', k.crest);
  const pillar = x => `<rect x="${x}" y="0" width="13" height="52" fill="${v.pil3}"/>
    <rect x="${x - 3}" y="8" width="19" height="4" rx="1" fill="${v.stone}"/>
    <rect x="${x - 3}" y="44" width="19" height="5" rx="1" fill="${v.stone}"/>`;
  const banner = x => `<path d="M${x} 4h13v20l-6.5-4-6.5 4z" fill="${v.ban1}" stroke="${v.line}" stroke-width="1"/>
    <g transform="translate(${x + 6.5} 12) scale(.42)" fill="${v.crest}" opacity=".95">${crest.art}</g>`;
  /* a sconce reads as a torch at this size only if the flame has a stick */
  const torch = x => `<circle cx="${x}" cy="34" r="9" fill="${v.glow1}" opacity=".22"/>
    <rect x="${x - 1.4}" y="36" width="2.8" height="8" rx="1" fill="${v.wood}"/>
    <ellipse cx="${x}" cy="32.5" rx="2.8" ry="4.6" fill="${v.glow1}"/>
    <ellipse cx="${x}" cy="33.5" rx="1.4" ry="2.6" fill="${v.moon}" opacity=".75"/>`;
  const flecks = hall.decor && hall.decor !== 'none'
    ? `<g fill="${hallDecorColour(hall.decor, v)}" opacity=".85">
        <circle cx="34" cy="18" r="1.4"/><circle cx="88" cy="26" r="1.2"/><circle cx="60" cy="12" r="1.1"/>
        <circle cx="26" cy="38" r="1.2"/><circle cx="96" cy="14" r="1.3"/></g>`
    : '';
  /* the board floor, in perspective, right across the room */
  const floor = thumbFloor(v);
  const carpet = k.carpet === 'none' ? '' : `<polygon points="47,52 73,52 86,84 34,84" fill="${v.rug1}"/>
    <polygon points="47,52 73,52 79,68 41,68" fill="${v.rug2}" opacity=".5"/>
    <polyline points="49,52 37,84" fill="none" stroke="${v.rugTrim}" stroke-width="1.3" opacity=".85"/>
    <polyline points="71,52 83,84" fill="none" stroke="${v.rugTrim}" stroke-width="1.3" opacity=".85"/>`;
  return `<svg viewBox="0 0 120 84" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="120" height="52" fill="${v.wall2}"/>
    <rect width="120" height="16" fill="${v.wall1}"/>
    <g stroke="${v.line}" stroke-width=".7" opacity=".55" fill="none">
      <path d="M0 16h120M0 32h120M30 0v16M90 0v16M60 16v16"/>
    </g>
    <path d="M41 51V28a19 19 0 0 1 38 0v23z" fill="${v.sky2}"/>
    <circle cx="68" cy="18" r="4" fill="${v.moon}" opacity=".95"/>
    <path d="M41 51V28a19 19 0 0 1 38 0v23" fill="none" stroke="${v.frame1}" stroke-width="2.6"/>
    <path d="M60 10v41M41 32h38" stroke="${v.frame2}" stroke-width="1.2" opacity=".8" fill="none"/>
    ${pillar(5)}${pillar(102)}
    ${banner(26)}${banner(81)}
    ${torch(24)}${torch(96)}
    ${flecks}
    <rect y="52" width="120" height="32" fill="${v.floor}"/>
    ${floor}
    <path d="M0 52h120" stroke="${v.line}" stroke-width="1.4"/>
    <ellipse cx="60" cy="55" rx="24" ry="4" fill="${v.pool}" opacity=".13"/>
    ${carpet}
    <rect width="15" height="84" fill="#02100d" opacity=".32"/>
    <rect x="105" width="15" height="84" fill="#02100d" opacity=".32"/>
  </svg>`;
}

/* Squares that recede with the room: the far row is small and the near row is
   wide, and the colours alternate on both axes like a board. */
function thumbFloor(v) {
  const rows = [52, 56, 62, 70, 84];
  const half = y => 5.8 * (y - 44) / 8;           // a square's width at that depth
  let out = '';
  for (let r = 0; r < rows.length - 1; r++) {
    const yt = rows[r], yb = rows[r + 1], wt = half(yt), wb = half(yb);
    for (let i = -9; i < 9; i++) {
      const x0t = 60 + i * wt, x1t = x0t + wt, x0b = 60 + i * wb, x1b = x0b + wb;
      if (Math.max(x1t, x1b) < -4 || Math.min(x0t, x0b) > 124) continue;
      const fill = (i + r) % 2 ? v.tileB : v.tileA;
      out += `<polygon points="${x0t.toFixed(1)},${yt} ${x1t.toFixed(1)},${yt} ` +
             `${x1b.toFixed(1)},${yb} ${x0b.toFixed(1)},${yb}" fill="${fill}"/>`;
    }
  }
  return `<g opacity=".92">${out}</g>`;
}

/* The room with somebody standing in it: used for a friend's hall, and for
   the card of a hall you might buy. */
function hallSceneHTML(hallId, avatar, opts = {}) {
  const champ = avatar
    ? avatarNode(avatar, { noPet:!opts.pet })
    : '<span class="hall-mini-q">?</span>';
  return `<div class="hall-mini${opts.big ? ' big' : ''}">${hallThumbSVG(hallId, opts.kit)}
    <div class="hall-mini-champ">${champ}</div></div>`;
}

/* =========================================================================
   What is in the hall, as opposed to what the hall is made of.

   The carpet and the checkerboard floor used to be painted into the room, so
   every player had them whether they wanted them or not. They are furniture
   now: the bare hall is bare stone with a plain banner, and a runner, a floor
   and a crest are each bought separately. A hall theme still sets the colour
   of anything that has no opinion of its own.
   ========================================================================= */

const HALL_CARPETS = [
  { id:'none', name:'No Runner', price:0,
    desc:'Bare floor from the door to your feet.' },
  { id:'crimson', name:'Crimson Runner', price:900,
    desc:'Deep red with a gold edge. The classic.',
    c:{ rug1:'#6b2632', rug2:'#5a1f2a', rugLine:'#8d3a42', rugTrim:'#c9963c', fringe:'#d9b35c' } },
  { id:'jade', name:'Jade Runner', price:1600,
    desc:'Dark green and gold, woven with a pawn pattern.',
    c:{ rug1:'#1f5f4a', rug2:'#15442f', rugLine:'#2f8a68', rugTrim:'#ffe08a', fringe:'#ffeeb8' } },
  { id:'royal', name:'Royal Purple', price:2400,
    desc:'Violet, with enough gold thread to be rude about it.',
    c:{ rug1:'#4a2470', rug2:'#331650', rugLine:'#6b3aa0', rugTrim:'#f0cd6a', fringe:'#ffe9a8' } },
  { id:'ember', name:'Emberweave', premium:true,
    desc:'Black and molten orange, as if it is still cooling.',
    c:{ rug1:'#5a1a10', rug2:'#2a0c08', rugLine:'#a8381c', rugTrim:'#ff9a3a', fringe:'#ffc98a' } },
];

/* Each crest is drawn around the origin in a box about 20 across, so the same
   path works on the banner in the hall and on a thumbnail. */
const HALL_CRESTS = [
  { id:'pawn', name:'Pawn', price:0, desc:'The piece everything else is built on.',
    art:'<circle cx="0" cy="-7.5" r="4.3"/><path d="M-3.4 -3.6h6.8l-1.3 2.7c1.9 1.7 2.8 3.9 3 6.7h-10.2c.2-2.8 1.1-5 3-6.7z"/><path d="M-6.8 6.6h13.6c.5 2.3 1.6 3.6 2.9 4.4h-19.4c1.3-.8 2.4-2.1 2.9-4.4z"/>' },
  { id:'star', name:'Star', price:0, desc:'What the banners carried before.',
    art:'<path d="M0 -11l3.2 7.8 7.8 3.2-7.8 3.2-3.2 7.8-3.2-7.8-7.8-3.2 7.8-3.2z"/>' },
  { id:'knight', name:'Knight', price:900, desc:'The horse, mid turn, looking smug.',
    art:'<path d="M-5.6 11h11.2c.6-5.2.4-9.4-1.2-12.6-1.6-3.2-4-5-6.6-6.2l1.4-3.4-3.4 1.2-1.2-3-2.6 4.2-2.8 1.8c-1.6 1.2-2 2.6-1.2 4l2.4-1.4-1.6 3.4c-.6 1.4 0 2.4 1.6 2.6l2.6-.4c1.6 2.8 1.8 6.2 1.4 9.8z"/>' },
  { id:'crown', name:'Crown', price:1800, desc:'For a hall that has won a few.',
    art:'<path d="M-10 -4l4 4.4 6-7.4 6 7.4 4-4.4-2.4 12.4h-15.2z"/><rect x="-8.4" y="9.6" width="16.8" height="2.6" rx="1.2"/>' },
  { id:'dragon', name:'Dragon', premium:true, desc:'A wing and a long neck, picked out in gold.',
    art:'<path d="M-10 4c1.8-5 5-8.4 9.4-10.2l-1.4-3.2 4.4 1.8 3.6-2.4-.8 4c2.8 1.6 4.4 4 4.8 7.2l-4-1.8c.2 2.6-.8 4.8-3 6.6l1.6 4.2-5-3-5.6 3 1.2-4.4z"/>' },
];

/* The chequered floor belongs to every hall - it is a chess game - so the
   furniture for sale is the runner on top of it and the crest on the banners. */
const HALL_KITS = { carpet:HALL_CARPETS, crest:HALL_CRESTS };
const HALL_KIT_DEFAULT = { carpet:'none', crest:'pawn' };
const HALL_KIT_OWNED = { carpet:'carpets', crest:'crests' };

function hallPart(kind, id){ return (HALL_KITS[kind] || []).find(i => i.id === id) || null; }
function hallPartsOwned(kind) {
  const key = HALL_KIT_OWNED[kind], o = Progress.data.owned;
  if (!o[key]) o[key] = [HALL_KIT_DEFAULT[kind]];
  return o[key];
}
function ownsHallPart(kind, id) {
  const item = hallPart(kind, id);
  if (!item) return false;
  if (item.premium) return ownsPack();
  if (!item.price) return true;
  return hallPartsOwned(kind).includes(id);
}
function equippedPart(kind){ return Progress.data.equipped[kind] || HALL_KIT_DEFAULT[kind]; }
function buyHallPart(kind, id) {
  const item = hallPart(kind, id);
  if (!item || item.premium || !item.price || ownsHallPart(kind, id)) return false;
  if (!spendGambits(item.price)) return false;
  hallPartsOwned(kind).push(id);
  Progress.save();
  return true;
}
function equipHallPart(kind, id) {
  if (!ownsHallPart(kind, id)) return false;
  Progress.data.equipped[kind] = id;
  Progress.save();
  if (typeof Account !== 'undefined' && Account.publishCard) Account.publishCard();
  return true;
}
/* What is in the hall right now, or what somebody else's card says is in theirs. */
function hallKit(from) {
  const k = from || Progress.data.equipped || {};
  return {
    carpet:hallPart('carpet', k.carpet) ? k.carpet : HALL_KIT_DEFAULT.carpet,
    crest:hallPart('crest', k.crest) ? k.crest : HALL_KIT_DEFAULT.crest,
  };
}
/* The hall's own colours, with the furniture's preferences laid over them. */
function hallDressed(hallId, kit) {
  const v = hallPalette(hallById(hallId) || HALLS[0]);
  const k = hallKit(kit);
  Object.assign(v, hallPart('carpet', k.carpet).c || {});
  return { v, k };
}
