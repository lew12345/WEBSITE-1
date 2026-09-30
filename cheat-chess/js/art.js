/* =========================================================================
   CHEAT CHESS: all vector art: pieces, card illustrations, card back, icons.
   Gradients live once in a hidden <svg><defs> injected at startup (ART_DEFS).
   ========================================================================= */

const ART_DEFS = `
<svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
<defs>
  <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff3c4"/><stop offset=".4" stop-color="#eabb54"/><stop offset=".7" stop-color="#a86f1e"/><stop offset="1" stop-color="#f5d77e"/>
  </linearGradient>
  <linearGradient id="gGoldH" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#7a4d14"/>
  </linearGradient>
  <linearGradient id="pcIvory" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fffef8"/><stop offset=".45" stop-color="#f1e3c0"/><stop offset="1" stop-color="#b7925a"/>
  </linearGradient>
  <linearGradient id="pcObsidian" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#7d8fb5"/><stop offset=".4" stop-color="#2c3651"/><stop offset="1" stop-color="#0a0e19"/>
  </linearGradient>
  <radialGradient id="bg-ember" cx=".5" cy=".58" r=".8">
    <stop offset="0" stop-color="#ffc07a"/><stop offset=".3" stop-color="#c24a20"/><stop offset=".7" stop-color="#40110b"/><stop offset="1" stop-color="#1a0604"/>
  </radialGradient>
  <radialGradient id="bg-tide" cx=".5" cy=".55" r=".8">
    <stop offset="0" stop-color="#c8f3ff"/><stop offset=".3" stop-color="#2f86bf"/><stop offset=".7" stop-color="#0c2a4b"/><stop offset="1" stop-color="#050f1d"/>
  </radialGradient>
  <radialGradient id="bg-arcane" cx=".5" cy=".55" r=".8">
    <stop offset="0" stop-color="#f1e2ff"/><stop offset=".3" stop-color="#8148d6"/><stop offset=".7" stop-color="#241044"/><stop offset="1" stop-color="#0d0620"/>
  </radialGradient>
  <radialGradient id="bg-verdant" cx=".5" cy=".55" r=".8">
    <stop offset="0" stop-color="#d3ffec"/><stop offset=".3" stop-color="#2ea57f"/><stop offset=".7" stop-color="#0b3a30"/><stop offset="1" stop-color="#041612"/>
  </radialGradient>
  <radialGradient id="gFire" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fffbe0"/><stop offset=".3" stop-color="#ffd35c"/><stop offset=".6" stop-color="#ff7a2a"/><stop offset=".85" stop-color="#c2261a" stop-opacity=".6"/><stop offset="1" stop-color="#c2261a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gGlowW" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".4" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gGlowGold" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffd35c" stop-opacity=".7"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gBombBody" cx=".35" cy=".3" r=".75">
    <stop offset="0" stop-color="#6d7385"/><stop offset=".5" stop-color="#2a2d38"/><stop offset="1" stop-color="#0d0e13"/>
  </radialGradient>
  <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f7faff"/><stop offset=".45" stop-color="#a9b5c7"/><stop offset="1" stop-color="#4a5468"/>
  </linearGradient>
  <linearGradient id="gIce" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#bfeaff" stop-opacity=".8"/><stop offset="1" stop-color="#5cb8e8" stop-opacity=".85"/>
  </linearGradient>
  <linearGradient id="gStone" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c7b699"/><stop offset="1" stop-color="#6e5d47"/>
  </linearGradient>
  <linearGradient id="gShieldBlue" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8fe3ff"/><stop offset=".5" stop-color="#2e86c9"/><stop offset="1" stop-color="#123c72"/>
  </linearGradient>
  <radialGradient id="gPoison" cx=".4" cy=".35" r=".7">
    <stop offset="0" stop-color="#f0ffc0"/><stop offset=".4" stop-color="#7fe04a"/><stop offset="1" stop-color="#1f6b22"/>
  </radialGradient>
  <radialGradient id="gPortal" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".2" stop-color="#ead6ff"/><stop offset=".5" stop-color="#9b5cff"/><stop offset=".8" stop-color="#3a1480" stop-opacity=".8"/><stop offset="1" stop-color="#3a1480" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="gGhost" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".7" stop-color="#d7ecff" stop-opacity=".55"/><stop offset="1" stop-color="#d7ecff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gBeam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff8d8" stop-opacity=".9"/><stop offset="1" stop-color="#fff8d8" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5a3517"/><stop offset=".5" stop-color="#a0662f"/><stop offset="1" stop-color="#4a2a10"/>
  </linearGradient>
  <linearGradient id="gParch" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbf0d4"/><stop offset="1" stop-color="#e2c896"/>
  </linearGradient>
  <radialGradient id="gBack" cx=".5" cy=".45" r=".75">
    <stop offset="0" stop-color="#23776d"/><stop offset=".55" stop-color="#0d3432"/><stop offset="1" stop-color="#041413"/>
  </radialGradient>
  <pattern id="pLattice" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <path d="M0 0H10M0 0V10" stroke="#e8c16a" stroke-width=".5" opacity=".28"/>
  </pattern>
</defs>
</svg>`;

/* ---------------------------------------------------------------- pieces */
function pieceShapes(t, F, S, A) {
  const sw = 'stroke="'+S+'" stroke-width="2.2" stroke-linejoin="round"';
  const base = `<path d="M12 57.5h40a2.5 2.5 0 0 0 2.5-2.5v-.5a2.5 2.5 0 0 0-2.5-2.5H12a2.5 2.5 0 0 0-2.5 2.5v.5a2.5 2.5 0 0 0 2.5 2.5z" fill="${F}" ${sw}/>
    <path d="M15 52h34l-3-5H18z" fill="${F}" ${sw}/><path d="M15 55h34" stroke="${A}" stroke-width="1.6" stroke-linecap="round"/>`;
  switch (t) {
    case 'p': return base + `<path d="M20 47c1-7 6-10 7-15h10c1 5 6 8 7 15z" fill="${F}" ${sw}/>
      <ellipse cx="32" cy="31.5" rx="9" ry="2.8" fill="${F}" ${sw}/><circle cx="32" cy="21" r="8.5" fill="${F}" ${sw}/>
      <circle cx="29" cy="18" r="2.6" fill="#fff" opacity=".4"/>`;
    case 'r': return base + `<path d="M19 47l2.5-19h21l2.5 19z" fill="${F}" ${sw}/><path d="M17 28h30v-3H17z" fill="${F}" ${sw}/>
      <path d="M17 25V13h6.5v4.5H28V13h8v4.5h4.5V13H47v12z" fill="${F}" ${sw}/><path d="M22.5 37h19" stroke="${A}" stroke-width="2" stroke-linecap="round"/>
      <path d="M21 16v7" stroke="#fff" stroke-width="1.6" opacity=".4" stroke-linecap="round"/>`;
    case 'n': return base + `<path d="M21 47c-1-7 1-12 5-16l-2-2c-4 1-8 2-11 0-2-2-2-5 0-7l9-8c2-3 5-5 7-5l1-5 4 4c8 1 14 9 14 20 0 9-3 13-3 19z" fill="${F}" ${sw}/>
      <path d="M33 9c6 3 11 10 11 20 0 7-2 11-2 18" stroke="${A}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M17 22.5l9 3.5" stroke="${A}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="24" cy="17" r="1.9" fill="${S}"/><circle cx="15.5" cy="25" r="1" fill="${S}"/>`;
    case 'b': return base + `<path d="M21 47c0-7 5-10 6-14h10c1 4 6 7 6 14z" fill="${F}" ${sw}/>
      <ellipse cx="32" cy="32.5" rx="9" ry="2.6" fill="${F}" ${sw}/>
      <path d="M32 8.5c-7 5-10.5 11-10.5 16.5 0 5 4.5 7.5 10.5 7.5s10.5-2.5 10.5-7.5c0-5.5-3.5-11.5-10.5-16.5z" fill="${F}" ${sw}/>
      <path d="M36.5 14l-6.5 8" stroke="${S}" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="6.5" r="2.6" fill="${A}" stroke="${S}" stroke-width="1.4"/>
      <path d="M26 20c0-3 2-6 4-8" stroke="#fff" stroke-width="1.6" opacity=".4" fill="none" stroke-linecap="round"/>`;
    case 'q': return base + `<path d="M20 47c1-8 4-13 7-19h10c3 6 6 11 7 19z" fill="${F}" ${sw}/>
      <path d="M21 26l-4-14 8 7 7-11 7 11 8-7-4 14z" fill="${F}" ${sw}/><ellipse cx="32" cy="27.5" rx="10.5" ry="2.8" fill="${F}" ${sw}/>
      <circle cx="17" cy="11" r="2.4" fill="${A}" stroke="${S}" stroke-width="1.3"/><circle cx="32" cy="7" r="2.7" fill="${A}" stroke="${S}" stroke-width="1.3"/><circle cx="47" cy="11" r="2.4" fill="${A}" stroke="${S}" stroke-width="1.3"/>
      <path d="M24 38h16" stroke="${A}" stroke-width="2" stroke-linecap="round"/>`;
    case 'k': return base + `<path d="M20 47c1-8 4-13 7-19h10c3 6 6 11 7 19z" fill="${F}" ${sw}/>
      <path d="M20.5 26c0-6 4-10 11.5-10s11.5 4 11.5 10z" fill="${F}" ${sw}/><ellipse cx="32" cy="27.5" rx="10.5" ry="2.8" fill="${F}" ${sw}/>
      <path d="M23 21.5h18" stroke="${A}" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 2.5h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="${A}" stroke="${S}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M24 38h16" stroke="${A}" stroke-width="2" stroke-linecap="round"/>`;
  }
  return '';
}
const PIECE_STYLE = {
  w: { F:'url(#pcIvory)', S:'#3a2912', A:'#c9922a' },
  b: { F:'url(#pcObsidian)', S:'#04060c', A:'#4fe0c0' },
};
/* Cosmetic chess sets. Each one restyles the pieces of whoever equips it. */
const PIECE_SETS = {
  classic:   { w:PIECE_STYLE.w, b:PIECE_STYLE.b },
  bone:      { w:{ F:'url(#psBoneL)', S:'#3a2e1c', A:'#8a6a3a' }, b:{ F:'url(#psBoneD)', S:'#241a10', A:'#c9b48a' } },
  emerald:   { w:{ F:'url(#psEmL)',   S:'#0d3a2c', A:'#ffd35c' }, b:{ F:'url(#psEmD)',   S:'#04211a', A:'#8affd0' } },
  frost:     { w:{ F:'url(#psFrL)',   S:'#1b4a6b', A:'#ffffff' }, b:{ F:'url(#psFrD)',   S:'#0a2740', A:'#bfeaff' } },
  amethyst:  { w:{ F:'url(#psAmL)',   S:'#3d1470', A:'#ffd35c' }, b:{ F:'url(#psAmD)',   S:'#1d0836', A:'#e2cfff' } },
  gold:      { w:{ F:'url(#psGoL)',   S:'#4a3208', A:'#fff6cc' }, b:{ F:'url(#psGoD)',   S:'#2a1c04', A:'#ffe08a' } },
  infernal:  { w:{ F:'url(#psInL)',   S:'#4a1408', A:'#ffd35c' }, b:{ F:'url(#psInD)',   S:'#2a0a04', A:'#ff8a4c' }, fxBack:true },
  celestial: { w:{ F:'url(#psCeL)',   S:'#2a3a8a', A:'#ffffff' }, b:{ F:'url(#psCeD)',   S:'#0a1030', A:'#9fd9ff' }, fx:'stars' },
};
/* Rendered flame, eight frames to a strip, scrolled a frame at a time with a
   CSS transform. No filters and no blurs, so a boardful of burning pieces stays
   cheap. `fire.png` is a single tall plume for the hall torches; `fire-wreath`
   puts the flame up the sides and across the base with the middle left clear,
   which is the only way fire reads behind something as small as a chess piece. */
const FIRE_SPRITE = 'art/fx/fire.png?v=6';
const FIRE_WREATH = 'art/fx/fire-wreath.png?v=6';
const FIRE_FRAMES = 8;
function fireSprite(src, clip, x, y, w, h, delay, cls) {
  return `<g clip-path="url(#${clip})"${cls ? ` class="${cls}"` : ''}>` +
    `<image class="fire-sprite" href="${src}" x="${x}" y="${y}"` +
    ` width="${w * FIRE_FRAMES}" height="${h}" preserveAspectRatio="none"` +
    ` style="--fw:${w}px${delay ? ';animation-delay:' + delay + 's' : ''}"/></g>`;
}
/* A burning piece: the wreath behind it, a lick of the base sheet in front of
   its foot, and a static ember glow underneath. */
function firePiece(t) {
  const d = -('pnbrqk'.indexOf(t) * 0.09).toFixed(2);
  return {
    back: '<ellipse cx="32" cy="56" rx="29" ry="10" fill="url(#psGlowIn)"/>' +
          fireSprite(FIRE_WREATH, 'pcFireBox', 0, 2, 64, 64, d),
    front: fireSprite(FIRE_WREATH, 'pcFireFoot', 0, 2, 64, 64, d, 'fire-veil'),
  };
}

const PIECE_FX = {
  stars: `<g class="pc-stars">
    <path d="M14 14l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ffffff"/>
    <path d="M50 10l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="#bfe4ff"/>
    <path d="M44 48l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="#ffffff"/></g>`,
};
const PIECE_SET_DEFS = `
<svg class="svg-defs" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
  <clipPath id="pcFireBox"><rect x="0" y="0" width="64" height="64"/></clipPath>
  <clipPath id="pcFireFoot"><rect x="0" y="46" width="64" height="18"/></clipPath>
  <radialGradient id="psGlowIn"><stop offset="0" stop-color="#ff9a3a" stop-opacity=".75"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient>
  ${[['psBoneL','#fffaf0','#e8dcc0','#a8926a'], ['psBoneD','#cfc3a4','#8d7f63','#4a4130'],
     ['psEmL','#e8fff4','#7fe0b4','#1d8a66'], ['psEmD','#59c79b','#17795a','#052f22'],
     ['psFrL','#ffffff','#dff2ff','#8fc4e8'], ['psFrD','#a9d8f5','#4f8fc0','#123a56'],
     ['psAmL','#f6e6ff','#d0a2ff','#7a35c9'], ['psAmD','#a15ce0','#5b2599','#220a40'],
     ['psGoL','#fff8d0','#f0cd6a','#a87a1e'], ['psGoD','#e0b44c','#9a6f16','#4a3208'],
     ['psInL','#ffe9a8','#ff9a3a','#c23a10'], ['psInD','#ff7a2a','#a8280c','#3a0a02'],
     ['psCeL','#ffffff','#cfe2ff','#7f9fe0'], ['psCeD','#7d94d8','#39508f','#151d44']]
    .map(([id,a,b,c]) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`).join('')}
</defs></svg>`;

const _pieceCache = {};
function pieceArt(piece, setId = 'classic') {
  const key = setId + piece;
  if (_pieceCache[key]) return _pieceCache[key];
  const set = PIECE_SETS[setId] || PIECE_SETS.classic;
  const s = set[piece[0]];
  const fx = set.fx ? PIECE_FX[set.fx] : '';
  const fire = set.fxBack ? firePiece(piece[1]) : null;
  const body = pieceShapes(piece[1], s.F, s.S, s.A);
  return (_pieceCache[key] = fire
    ? `<svg viewBox="0 0 64 64">${fire.back}${body}${fire.front}</svg>`
    : `<svg viewBox="0 0 64 64">${body}${fx}</svg>`);
}
const PIECE_ART = {};
for (const col of ['w','b']) for (const t of 'pnbrqk') PIECE_ART[col+t] = pieceArt(col+t, 'classic');
const PIECE_NAME = { p:'Pawn', n:'Knight', b:'Bishop', r:'Rook', q:'Queen', k:'King' };
function silhouette(t, x, y, s, fill, stroke, accent) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${pieceShapes(t, fill, stroke || fill, accent || fill)}</g>`;
}

/* ---------------------------------------------------------- card art helpers */
function sparkles(list, col) {
  return list.map(([x,y,r]) =>
    `<path d="M${x} ${y-r}L${x+r*.28} ${y-r*.28}L${x+r} ${y}L${x+r*.28} ${y+r*.28}L${x} ${y+r}L${x-r*.28} ${y+r*.28}L${x-r} ${y}L${x-r*.28} ${y-r*.28}z" fill="${col||'#fff'}" opacity=".85"/>`).join('');
}
const STARS = [[12,10,1.6],[86,14,2],[78,6,1.1],[20,26,1],[92,32,1.3],[8,40,1.1]];
function artWrap(school, inner) {
  return `<svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice"><rect width="100" height="80" fill="url(#bg-${school})"/>${inner}</svg>`;
}
function hills(c1, c2) {
  return `<path d="M0 62Q20 52 42 60T100 56V80H0z" fill="${c1}" opacity=".8"/><path d="M0 70Q30 62 58 69T100 67V80H0z" fill="${c2}"/>`;
}

/* ------------------------------------------------------ card illustrations */
const CARD_ART = {
  bomb: () => artWrap('ember', `
    <g stroke="#ffe0a0" stroke-width="1.1" opacity=".45">${[0,45,90,135,180,225,270,315].map(a=>`<line x1="50" y1="46" x2="${50+44*Math.cos(a*Math.PI/180)}" y2="${46+44*Math.sin(a*Math.PI/180)}"/>`).join('')}</g>
    <circle cx="50" cy="46" r="32" fill="url(#gFire)" opacity=".5"/>
    ${hills('#2a0a06','#150403')}
    <ellipse cx="49" cy="68" rx="20" ry="3.5" fill="#000" opacity=".45"/>
    <circle cx="48" cy="48" r="18" fill="url(#gBombBody)" stroke="#07080b" stroke-width="1.5"/>
    <circle cx="41.5" cy="41" r="4.5" fill="#fff" opacity=".28"/><circle cx="38.5" cy="46" r="1.6" fill="#fff" opacity=".2"/>
    <rect x="42" y="26.5" width="13" height="7" rx="1.6" fill="url(#gGold)" stroke="#3b2a14" stroke-width="1" transform="rotate(22 48.5 30)"/>
    <path d="M53 27q5-9 13-7" stroke="#caa56b" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="67" cy="19.5" r="8" fill="url(#gFire)"/>
    ${sparkles([[67,19.5,4.5],[74,12,1.8],[60,13,1.4],[74,25,1.2]], '#fffbe0')}`),

  lightning: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    <path d="M6 24q0-10 12-10q5-9 15-6q8-6 17 0q10-5 17 3q13-1 14 9q10 1 10 8q0 6-9 6H14q-8 0-8-10z" fill="#23121b" opacity=".92"/>
    <path d="M14 30q10 3 22 0q12 3 26 0q12 3 26-1" stroke="#5a2e3a" stroke-width="1.5" fill="none" opacity=".7"/>
    ${hills('#2a0a06','#150403')}
    <circle cx="42" cy="68" r="14" fill="url(#gFire)" opacity=".85"/>
    <polygon points="54,26 38,50 50,50 41,72 68,41 54,41 62,26" fill="#fff3a0" opacity=".35" stroke="#fff3a0" stroke-width="6" stroke-linejoin="round"/>
    <polygon points="54,26 38,50 50,50 41,72 68,41 54,41 62,26" fill="#fffbe0" stroke="#ffc93a" stroke-width="1.6" stroke-linejoin="round"/>
    ${sparkles([[41,70,4],[33,64,1.6],[50,66,1.4]], '#fffbe0')}`),

  quake: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    <path d="M0 48L28 44L50 47L74 42L100 45V80H0z" fill="#4a1d10"/>
    <path d="M0 58L100 54V80H0z" fill="#2b0f08"/>
    <path d="M47 46l-5 9 7 5-8 9 5 5-3 6h8l2-6-4-5 8-9-6-5 4-9z" fill="#110403"/>
    <path d="M47 46l-5 9 7 5-8 9 5 5-3 6" stroke="#ffb36b" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M55 46l-4 9 6 5-8 9 4 5-2 6" stroke="#ff7a2a" stroke-width="1.1" fill="none" opacity=".8"/>
    <circle cx="50" cy="62" r="16" fill="url(#gFire)" opacity=".35"/>
    <g stroke="#1a0804" stroke-width="1">
      <polygon points="22,30 30,27 32,34 24,37" fill="#8a4a2a"/><polygon points="70,22 78,24 76,31 69,29" fill="#7a3f22"/>
      <polygon points="36,20 41,18 42,23 37,24" fill="#9a5733"/><polygon points="62,34 67,33 67,38 62,38" fill="#8a4a2a"/>
    </g>
    <g fill="#d98a55" opacity=".35"><circle cx="20" cy="46" r="6"/><circle cx="80" cy="44" r="7"/><circle cx="30" cy="50" r="4"/><circle cx="70" cy="49" r="5"/></g>`),

  march: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    <g stroke="#ffd7a0" stroke-width="1.6" stroke-linecap="round" opacity=".55"><line x1="6" y1="36" x2="20" y2="36"/><line x1="4" y1="44" x2="22" y2="44"/><line x1="8" y1="52" x2="21" y2="52"/></g>
    <path d="M36 14h18v25l16 8q7 3.5 5 11H32q-5 0-5-5V21q0-7 9-7z" fill="url(#gSteel)" stroke="#161820" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M27 30h27M27 40h27M54 39l14 7" stroke="#161820" stroke-width="1.2" opacity=".6"/>
    <path d="M36 14h18v6H36z" fill="url(#gGold)" stroke="#161820" stroke-width="1.2"/>
    <circle cx="33" cy="34" r="1.2" fill="#161820"/><circle cx="33" cy="45" r="1.2" fill="#161820"/>
    <path d="M30 17q2-2 5-2" stroke="#fff" stroke-width="1.6" opacity=".6" fill="none"/>
    <rect x="25" y="58" width="52" height="6" rx="2.5" fill="#3b2414" stroke="#120804" stroke-width="1.2"/>
    <g fill="#e5a070" opacity=".5"><circle cx="24" cy="66" r="6"/><circle cx="80" cy="66" r="5.5"/><circle cx="33" cy="70" r="4"/><circle cx="70" cy="70" r="4.5"/></g>`),

  shield: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    <g fill="none" stroke="#a9e8ff"><circle cx="50" cy="42" r="30" opacity=".25" stroke-width="1"/><circle cx="50" cy="42" r="36" opacity=".15" stroke-width="1"/><circle cx="50" cy="42" r="24" opacity=".35" stroke-width="1.2"/></g>
    ${hills('#081f38','#040f1d')}
    <path d="M50 11L73 19V39C73 55 63 65 50 71C37 65 27 55 27 39V19Z" fill="url(#gShieldBlue)" stroke="url(#gGold)" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M50 16L68 22.5V39C68 52 60 60.5 50 65.5C40 60.5 32 52 32 39V22.5Z" fill="none" stroke="#ffe7a8" stroke-width=".9" opacity=".8"/>
    <path d="M34 22Q42 19 48 18" stroke="#fff" stroke-width="2" opacity=".5" fill="none" stroke-linecap="round"/>
    ${silhouette('r', 37.5, 26, .39, '#fff6d8', '#8a6420', '#8a6420')}`),

  frost: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    <g stroke="#e9f9ff" stroke-width="2.2" stroke-linecap="round" opacity=".55">
      ${[0,60,120].map(a=>`<g transform="rotate(${a} 50 38)"><line x1="50" y1="6" x2="50" y2="70"/><line x1="50" y1="14" x2="44" y2="8"/><line x1="50" y1="14" x2="56" y2="8"/><line x1="50" y1="62" x2="44" y2="68"/><line x1="50" y1="62" x2="56" y2="68"/></g>`).join('')}
    </g>
    ${hills('#081f38','#040f1d')}
    <path d="M32 26l18-8 18 8v28l-18 10-18-10z" fill="url(#gIce)" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
    ${silhouette('p', 38.5, 25, .42, '#1c4f7d', '#0b2743', '#6fd0ff')}
    <path d="M32 26l18 8 18-8M50 34v30" stroke="#fff" stroke-width="1" opacity=".7" fill="none"/>
    <path d="M36 30l4 10M62 32l-3 8" stroke="#fff" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>
    <g fill="#e9f9ff"><polygon points="22,56 26,48 28,58"/><polygon points="76,58 74,48 80,54"/><polygon points="18,40 22,36 22,44"/></g>`),

  vanish: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    ${silhouette('p', 30, 26, .6, '#9fd9ff', '#9fd9ff', '#9fd9ff').replace('<g ', '<g opacity=".18" ')}
    <path d="M50 12c11 0 18 8 18 19v26l-5-4-5 5-4-5-4 5-4-5-5 5-4-5-5 4V31c0-11 7-19 18-19z" fill="url(#gGhost)"/>
    <ellipse cx="44" cy="30" rx="3" ry="4.2" fill="#0b2743"/><ellipse cx="56" cy="30" rx="3" ry="4.2" fill="#0b2743"/>
    <ellipse cx="50" cy="40" rx="3" ry="3.6" fill="#0b2743" opacity=".8"/>
    <g stroke="#e9f9ff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round">
      <path d="M22 30q-6 6 0 12q6 6 0 12"/><path d="M78 26q6 6 0 12q-6 6 0 12"/><path d="M30 18q-4-4 0-8"/>
    </g>`),

  wall: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    <g stroke="#2a2016" stroke-width="1.2">
      <rect x="14" y="60" width="72" height="8" fill="#6e5d47"/>
      ${[[14,52,18],[32,52,20],[52,52,18],[70,52,16],[14,44,10],[24,44,20],[44,44,20],[64,44,22],[14,36,18],[32,36,18],[50,36,20],[70,36,16],[18,28,20],[38,28,22],[60,28,22]]
        .map(([x,y,w],i)=>`<rect x="${x}" y="${y}" width="${w}" height="8" rx="1" fill="url(#gStone)" opacity="${.8+(i%3)*.1}"/>`).join('')}
    </g>
    <g fill="#5fe8b4" opacity=".7"><ellipse cx="24" cy="28" rx="6" ry="2.4"/><ellipse cx="46" cy="28" rx="5" ry="2"/><ellipse cx="70" cy="28" rx="7" ry="2.4"/><ellipse cx="16" cy="44" rx="3" ry="1.5"/></g>
    <path d="M18 30h18M40 30h20" stroke="#fff" stroke-width="1" opacity=".4"/>`),

  kingguard: () => artWrap('tide', `
    <circle cx="50" cy="38" r="34" fill="url(#gGlowGold)" opacity=".75"/>
    ${sparkles(STARS,'#fff3c4')}
    ${hills('#081f38','#040f1d')}
    <g stroke="#161820" stroke-width="1.1" stroke-linejoin="round">
      <g transform="rotate(-38 50 44)"><rect x="48" y="8" width="4.5" height="46" rx="1" fill="url(#gSteel)"/><rect x="42" y="52" width="16" height="3.5" rx="1.2" fill="url(#gGold)"/><rect x="48.5" y="55" width="3.5" height="9" fill="#5a3517"/></g>
      <g transform="rotate(38 50 44)"><rect x="48" y="8" width="4.5" height="46" rx="1" fill="url(#gSteel)"/><rect x="42" y="52" width="16" height="3.5" rx="1.2" fill="url(#gGold)"/><rect x="48.5" y="55" width="3.5" height="9" fill="#5a3517"/></g>
    </g>
    <path d="M34 50l-4-20 10 8 10-14 10 14 10-8-4 20z" fill="url(#gGold)" stroke="#5a3a0e" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="33" y="49" width="34" height="7" rx="2" fill="url(#gGold)" stroke="#5a3a0e" stroke-width="1.4"/>
    <circle cx="50" cy="52.5" r="2.4" fill="#ff5470" stroke="#5a0e1e" stroke-width=".8"/><circle cx="40" cy="52.5" r="1.7" fill="#63d0ff"/><circle cx="60" cy="52.5" r="1.7" fill="#63d0ff"/>
    <circle cx="30" cy="29" r="2.2" fill="#fff3c4"/><circle cx="50" cy="23" r="2.4" fill="#fff3c4"/><circle cx="70" cy="29" r="2.2" fill="#fff3c4"/>`),

  teleport: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <ellipse cx="50" cy="42" rx="30" ry="26" fill="url(#gPortal)"/>
    <g fill="none" stroke="#f1e2ff" stroke-linecap="round" opacity=".75">
      <path d="M50 20a22 22 0 0 1 22 22" stroke-width="1.6"/><path d="M50 64a22 22 0 0 1-22-22" stroke-width="1.6"/>
      <path d="M36 28a16 16 0 0 1 20-5" stroke-width="1.1"/><path d="M64 56a16 16 0 0 1-20 5" stroke-width="1.1"/>
    </g>
    ${silhouette('n', 35, 24, .47, '#ffffff', '#6b3fb8', '#c39bff')}
    ${sparkles([[24,30,3],[78,52,3.2],[70,22,2],[28,60,2]], '#ffffff')}`),

  swap: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <path d="M26 30a26 18 0 0 1 46-4" stroke="#ffc94a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <polygon points="76,20 74,32 64,26" fill="#ffc94a"/>
    <path d="M74 56a26 18 0 0 1-46 4" stroke="#c39bff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <polygon points="24,66 26,54 36,60" fill="#c39bff"/>
    ${silhouette('r', 12, 30, .42, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    ${silhouette('n', 60, 30, .42, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}`),

  clone: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <line x1="50" y1="12" x2="50" y2="70" stroke="#f1e2ff" stroke-width="1" stroke-dasharray="2 3" opacity=".7"/>
    ${silhouette('b', 20, 20, .66, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    <g opacity=".55">${silhouette('b', 52, 20, .66, '#c39bff', '#f1e2ff', '#ffffff')}</g>
    ${sparkles([[50,16,3],[50,40,2.4],[50,62,2],[72,18,1.6]], '#ffffff')}`),

  resurrect: () => artWrap('arcane', `
    ${sparkles(STARS,'#fff3c4')}
    <path d="M38 0h24l14 80H24z" fill="url(#gBeam)" opacity=".55"/>
    ${hills('#1a0b33','#0b0418')}
    <path d="M18 72V52q0-10 11-10t11 10v20z" fill="#5d5a6e" stroke="#1d1b26" stroke-width="1.4"/>
    <path d="M24 50h10M29 46v12" stroke="#2c2a38" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 60l5 4-3 5" stroke="#2c2a38" stroke-width="1" fill="none"/>
    <circle cx="58" cy="36" r="16" fill="url(#gGlowGold)"/>
    ${silhouette('p', 46, 20, .38, '#fff6d8', '#b8862a', '#ffc94a')}
    <g stroke="#ffe7a8" stroke-width="1.2" fill="none" opacity=".75" stroke-linecap="round"><path d="M44 36q-8-6-14-2"/><path d="M72 36q8-6 14-2"/><path d="M45 40q-6-2-10 2"/><path d="M71 40q6-2 10 2"/></g>
    ${sparkles([[58,58,2.4],[64,64,1.6],[52,66,1.4]], '#fff3c4')}`),

  rewind: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <circle cx="50" cy="40" r="25" fill="url(#gGold)" stroke="#3b2a14" stroke-width="1.4"/>
    <circle cx="50" cy="40" r="20.5" fill="url(#gParch)" stroke="#3b2a14" stroke-width="1"/>
    <g stroke="#3b2a14" stroke-width="1.4" stroke-linecap="round">${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return `<line x1="${50+17*Math.sin(a)}" y1="${40-17*Math.cos(a)}" x2="${50+19*Math.sin(a)}" y2="${40-19*Math.cos(a)}"/>`}).join('')}</g>
    <path d="M50 40V26M50 40l9 5" stroke="#241408" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="50" cy="40" r="2" fill="#c39bff" stroke="#241408"/>
    <path d="M22 26a32 32 0 0 1 22-15" stroke="#c39bff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <polygon points="16,28 28,30 20,20" fill="#c39bff"/>`),

  hourglass: () => artWrap('arcane', `
    ${sparkles(STARS,'#fff3c4')}
    ${hills('#1a0b33','#0b0418')}
    <circle cx="50" cy="40" r="26" fill="url(#gGlowGold)" opacity=".5"/>
    <path d="M36 16h28q0 14-11 22q11 8 11 22H36q0-14 11-22q-11-8-11-22z" fill="#e8f4ff" opacity=".35" stroke="#f1e2ff" stroke-width="1.2"/>
    <path d="M39.5 20h21q-2 9-10.5 15q-8.5-6-10.5-15z" fill="url(#gGold)"/>
    <path d="M38.5 58h23q-1-8-11.5-12q-10.5 4-11.5 12z" fill="url(#gGold)"/>
    <line x1="50" y1="36" x2="50" y2="50" stroke="#ffd35c" stroke-width="1.4"/>
    <rect x="31" y="11" width="38" height="5" rx="2" fill="url(#gWood)" stroke="#2a1606" stroke-width="1"/>
    <rect x="31" y="60" width="38" height="5" rx="2" fill="url(#gWood)" stroke="#2a1606" stroke-width="1"/>
    <rect x="32.5" y="16" width="2.4" height="44" fill="url(#gWood)"/><rect x="65" y="16" width="2.4" height="44" fill="url(#gWood)"/>
    ${sparkles([[24,24,2.4],[76,30,2.8],[74,58,1.8]], '#fff3c4')}`),

  spy: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g transform="rotate(-24 50 44)">
      <rect x="14" y="38" width="16" height="10" rx="2" fill="url(#gWood)" stroke="#2a1606" stroke-width="1.2"/>
      <rect x="28" y="36" width="18" height="14" rx="2" fill="url(#gGold)" stroke="#3b2a14" stroke-width="1.2"/>
      <rect x="44" y="34" width="12" height="18" rx="2" fill="url(#gWood)" stroke="#2a1606" stroke-width="1.2"/>
      <path d="M31 39h12" stroke="#fff" stroke-width="1.2" opacity=".55"/>
    </g>
    <circle cx="66" cy="34" r="17" fill="url(#gGold)" stroke="#3b2a14" stroke-width="1.4"/>
    <circle cx="66" cy="34" r="13" fill="#e9fff6" stroke="#3b2a14" stroke-width="1"/>
    <ellipse cx="66" cy="34" rx="10" ry="6.5" fill="#fff"/><circle cx="66" cy="34" r="5.2" fill="#2ea57f"/><circle cx="66" cy="34" r="2.4" fill="#06120e"/>
    <circle cx="63.8" cy="31.8" r="1.4" fill="#fff"/>
    <path d="M56 28a13 13 0 0 1 8-6" stroke="#fff" stroke-width="1.6" opacity=".7" fill="none" stroke-linecap="round"/>`),

  poison: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <ellipse cx="50" cy="68" rx="20" ry="3.4" fill="#000" opacity=".4"/>
    <path d="M44 14h12v14q14 5 14 21 0 18-20 18T30 49q0-16 14-21z" fill="url(#gPoison)" stroke="#0b2a12" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M44 14h12" stroke="#0b2a12" stroke-width="1.6"/>
    <rect x="43" y="8" width="14" height="7" rx="2" fill="url(#gWood)" stroke="#2a1606" stroke-width="1.2"/>
    <path d="M36 40q4-6 10-8" stroke="#fff" stroke-width="2" opacity=".55" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="7" fill="#f0ffe0" stroke="#0b2a12" stroke-width="1"/>
    <circle cx="47.5" cy="49" r="1.7" fill="#0b2a12"/><circle cx="52.5" cy="49" r="1.7" fill="#0b2a12"/>
    <path d="M47 54h6M48.5 53v2M51.5 53v2" stroke="#0b2a12" stroke-width=".9"/>
    <g fill="#c6ff8a"><circle cx="40" cy="42" r="1.6"/><circle cx="60" cy="46" r="2"/><circle cx="56" cy="38" r="1.2"/><circle cx="62" cy="22" r="2.4" opacity=".7"/><circle cx="67" cy="14" r="1.6" opacity=".6"/></g>`),

  steal: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <path d="M50 8C33 8 24 22 24 38v30h52V38C76 22 67 8 50 8z" fill="#10231e" stroke="#020806" stroke-width="1.4"/>
    <path d="M50 16c-12 0-18 10-18 22v6h36v-6c0-12-6-22-18-22z" fill="#030a08"/>
    <path d="M33 33h34v8H33z" fill="#1e3a31"/>
    <ellipse cx="42" cy="37" rx="3.4" ry="2" fill="#5fe8b4"/><ellipse cx="58" cy="37" rx="3.4" ry="2" fill="#5fe8b4"/>
    <circle cx="42" cy="37" r="7" fill="url(#gGlowW)" opacity=".35"/><circle cx="58" cy="37" r="7" fill="url(#gGlowW)" opacity=".35"/>
    <path d="M50 8q6 12 2 22" stroke="#2a4a40" stroke-width="1.2" fill="none"/>
    <circle cx="74" cy="58" r="11" fill="url(#gGlowGold)" opacity=".7"/>
    ${silhouette('p', 66, 48, .26, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}`),

  disarm: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <circle cx="50" cy="40" r="22" fill="url(#gGlowW)" opacity=".35"/>
    <g transform="rotate(-40 50 40)" stroke="#161820" stroke-width="1.1" stroke-linejoin="round">
      <path d="M47.5 14h5v18l-2.5 3-2.5-2z" fill="url(#gSteel)"/>
      <path d="M47.5 47l2.5-2 2.5 3v10h-5z" fill="url(#gSteel)" transform="translate(4 4) rotate(12 50 50)"/>
      <rect x="41" y="58" width="18" height="4" rx="1.4" fill="url(#gGold)" transform="translate(4 4) rotate(12 50 50)"/>
      <rect x="48.2" y="62" width="3.6" height="9" fill="#5a3517" transform="translate(4 4) rotate(12 50 50)"/>
    </g>
    <g fill="#e9fff6"><polygon points="44,38 48,36 46,42"/><polygon points="54,40 58,38 57,44"/><polygon points="50,33 52,31 52,35"/></g>
    <g stroke="#ff5470" stroke-width="3" stroke-linecap="round" opacity=".85"><line x1="30" y1="20" x2="70" y2="60"/><line x1="70" y1="20" x2="30" y2="60"/></g>`),

  cards: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g stroke="#3b2a14" stroke-width="1.2">
      <rect x="30" y="12" width="24" height="34" rx="3" fill="url(#gBack)" transform="rotate(-18 42 46)"/>
      <rect x="46" y="12" width="24" height="34" rx="3" fill="url(#gBack)" transform="rotate(18 58 46)"/>
      <rect x="38" y="9" width="24" height="34" rx="3" fill="url(#gParch)"/>
    </g>
    <circle cx="50" cy="26" r="7" fill="none" stroke="#2ea57f" stroke-width="1.6"/>
    ${sparkles([[50,26,5]], '#2ea57f')}
    <circle cx="50" cy="60" r="12" fill="url(#gGlowGold)" opacity=".8"/>
    <g opacity=".75">${silhouette('p', 42, 50, .25, 'url(#pcIvory)', '#3a2912', '#c9922a')}</g>
    ${sparkles([[36,56,1.8],[64,54,2.2],[58,66,1.4],[42,68,1.2]], '#fff3c4')}`),

  /* ---------------------------------------------------------- relic set */
  meteor: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    ${[[70,8,1],[40,2,.75],[88,26,.6]].map(([x,y,s],i) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 0L-26 24L-19 28Z" fill="#ffb36b" opacity=".35"/><path d="M0 0L-40 36L-30 40Z" fill="#ff7a2a" opacity=".25"/>
      <circle cx="0" cy="0" r="9" fill="url(#gFire)"/><circle cx="0" cy="0" r="4.5" fill="#5a2a18" stroke="#ffd35c" stroke-width="1.2"/></g>`).join('')
      .replace(/translate\((\d+) (\d+)\)/g, (m, x, y) => `translate(${x} ${+y + 18})`)}
    ${hills('#2a0a06','#150403')}
    <circle cx="30" cy="68" r="10" fill="url(#gFire)" opacity=".9"/><circle cx="62" cy="70" r="7" fill="url(#gFire)" opacity=".8"/>
    ${sparkles([[30,64,3],[62,66,2.2],[46,70,1.4]], '#fffbe0')}`),

  chain: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    ${silhouette('p', 6, 38, .42, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}
    ${silhouette('p', 36, 30, .42, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}
    ${silhouette('p', 66, 38, .42, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}
    <g fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M20 44l6-8 3 6 7-10 4 5" stroke="#fff3a0" stroke-width="4" opacity=".4"/><path d="M20 44l6-8 3 6 7-10 4 5" stroke="#fffbe0" stroke-width="1.6"/>
      <path d="M58 38l5 5 4-7 5 9 4-4" stroke="#fff3a0" stroke-width="4" opacity=".4"/><path d="M58 38l5 5 4-7 5 9 4-4" stroke="#fffbe0" stroke-width="1.6"/>
      <path d="M50 4l-6 12 7 1-6 14" stroke="#fff3a0" stroke-width="5" opacity=".4"/><path d="M50 4l-6 12 7 1-6 14" stroke="#fffbe0" stroke-width="2"/>
    </g>
    ${sparkles([[20,44,3],[80,42,3],[49,31,3.4]], '#ffffff')}`),

  phoenix: () => artWrap('ember', `
    <circle cx="50" cy="38" r="30" fill="url(#gFire)" opacity=".45"/>
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    <path d="M50 30C38 18 22 14 8 18c10 2 18 8 22 14-8-2-16 0-22 4 12 0 22 4 30 10z" fill="#ff7a2a" stroke="#7a2716" stroke-width="1"/>
    <path d="M50 30c12-12 28-16 42-12-10 2-18 8-22 14 8-2 16 0 22 4-12 0-22 4-30 10z" fill="#ff7a2a" stroke="#7a2716" stroke-width="1"/>
    <path d="M50 30C40 22 28 20 18 22c8 3 14 7 18 12" fill="#ffd35c" opacity=".85"/><path d="M50 30c10-8 22-10 32-8-8 3-14 7-18 12" fill="#ffd35c" opacity=".85"/>
    <path d="M44 34c0-8 3-14 6-16 3 2 6 8 6 16 0 8-3 12-6 14-3-2-6-6-6-14z" fill="url(#gGold)" stroke="#7a2716" stroke-width="1"/>
    <circle cx="50" cy="20" r="4" fill="url(#gGold)" stroke="#7a2716" stroke-width="1"/><path d="M53 20l4 1-4 1.5" fill="#ffd35c"/>
    <path d="M47 46c-4 8-2 16 3 22 1-6 4-10 3-16 3 4 6 8 4 14 5-6 5-14 0-20z" fill="url(#gFire)"/>
    ${sparkles([[30,50,2],[72,52,2.4],[58,62,1.4]], '#fffbe0')}`),

  blizzard: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    <g fill="none" stroke="#e9f9ff" stroke-linecap="round" opacity=".7">
      <path d="M8 26q30-14 52 0t36-4" stroke-width="2.4"/><path d="M4 40q34-12 58 2t34-6" stroke-width="1.6"/><path d="M12 54q30-10 50 0t30-2" stroke-width="1.2"/>
    </g>
    <g stroke="#bfeaff" stroke-width=".8" opacity=".45">${[30,43,56,69].map(x=>`<line x1="${x}" y1="22" x2="${x}" y2="70"/>`).join('')}${[22,38,54,70].map(y=>`<line x1="30" y1="${y}" x2="69" y2="${y}"/>`).join('')}</g>
    <g stroke="#ffffff" stroke-width="1.6" stroke-linecap="round">
      ${[[50,40,7],[22,18,4],[80,20,4.5],[18,58,3.5],[84,56,4],[64,66,3]].map(([x,y,s])=>[0,60,120].map(a=>`<line x1="${x}" y1="${y-s}" x2="${x}" y2="${y+s}" transform="rotate(${a} ${x} ${y})"/>`).join('')).join('')}
    </g>`),

  tidal: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    <path d="M0 80V46C14 30 32 16 56 16c20 0 32 12 30 24-2 10-12 12-18 6 6-2 8-8 2-12-8-5-22 0-30 14C32 62 18 70 0 80z" fill="#2f86bf"/>
    <path d="M0 80V56C16 40 32 30 50 34" fill="none" stroke="#a9e8ff" stroke-width="2" opacity=".7"/>
    <path d="M56 16c20 0 32 12 30 24-2 10-12 12-18 6 6-2 8-8 2-12" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
    <g fill="#ffffff" opacity=".9"><circle cx="86" cy="32" r="2"/><circle cx="90" cy="38" r="1.4"/><circle cx="80" cy="26" r="1.2"/><circle cx="72" cy="44" r="1.6"/></g>
    <path d="M0 72Q50 62 100 70V80H0z" fill="#081f38"/>
    <g transform="rotate(-14 70 62)">${silhouette('p', 62, 52, .26, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}</g>
    <g transform="rotate(10 86 64)">${silhouette('p', 80, 56, .22, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}</g>`),

  sanctuary: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    <path d="M14 70a36 40 0 0 1 72 0z" fill="#63d0ff" opacity=".22" stroke="#a9e8ff" stroke-width="1.6"/>
    <path d="M22 70a28 32 0 0 1 56 0" fill="none" stroke="#ffffff" stroke-width=".8" opacity=".6" stroke-dasharray="2 3"/>
    <path d="M26 40a26 26 0 0 1 18-12" stroke="#fff" stroke-width="2" opacity=".6" fill="none" stroke-linecap="round"/>
    ${silhouette('p', 20, 44, .36, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    ${silhouette('p', 57, 44, .36, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    ${silhouette('k', 34, 30, .5, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    ${sparkles([[50,14,3],[20,34,1.8],[80,34,1.8]], '#fff3c4')}`),

  pegasus: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <path d="M14 62V30H40" fill="none" stroke="#f1e2ff" stroke-width="1.4" stroke-dasharray="2.5 2.5" opacity=".75"/>
    <polygon points="44,30 38,26 38,34" fill="#f1e2ff" opacity=".8"/>
    <path d="M56 36C62 20 76 12 94 14c-10 4-14 8-16 12 6-2 12-1 16 2-10 0-16 2-20 6 4 0 8 1 10 3-10 1-18 3-24 6z" fill="#ffffff" stroke="#6b3fb8" stroke-width="1"/>
    <path d="M60 34c6-8 16-14 28-16" stroke="#c39bff" stroke-width="1" fill="none"/>
    ${silhouette('n', 36, 24, .52, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    ${sparkles([[24,50,2.2],[90,46,2],[66,64,1.6]], '#ffffff')}`),

  ascension: () => artWrap('arcane', `
    <path d="M36 80L44 0h12l8 80z" fill="url(#gBeam)" opacity=".6"/>
    <circle cx="50" cy="20" r="20" fill="url(#gGlowGold)"/>
    ${sparkles(STARS,'#fff3c4')}
    ${hills('#1a0b33','#0b0418')}
    <path d="M36 28l-3-14 8 6 9-12 9 12 8-6-3 14z" fill="url(#gGold)" stroke="#5a3a0e" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="33" cy="13" r="2" fill="#ff5470"/><circle cx="50" cy="7" r="2.4" fill="#63d0ff"/><circle cx="67" cy="13" r="2" fill="#ff5470"/>
    ${silhouette('p', 38, 44, .38, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    <g fill="none" stroke="#fff3c4" stroke-width="1.6" stroke-linecap="round" opacity=".85"><path d="M30 56V38"/><path d="M70 56V38"/><path d="M26 42l4-5 4 5"/><path d="M66 42l4-5 4 5"/></g>
    ${sparkles([[50,34,2.6],[40,40,1.4],[60,40,1.4]], '#fff3c4')}`),

  pickpocket: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <path d="M86 0C80 14 70 22 62 26" stroke="#caa56b" stroke-width="1.6" fill="none" stroke-dasharray="3 2"/>
    <g transform="rotate(18 50 44)" stroke="#3b2a14" stroke-width="1.2">
      <rect x="36" y="24" width="26" height="36" rx="3" fill="url(#gParch)"/>
      <circle cx="49" cy="40" r="7" fill="none" stroke="#2ea57f" stroke-width="1.6"/>
    </g>
    ${sparkles([[50,40,5]], '#2ea57f')}
    <path d="M62 26c-4 0-6 3-5 6l3 6c2-4 6-6 10-6-2-4-5-6-8-6z" fill="url(#gSteel)" stroke="#161820" stroke-width="1"/>
    <path d="M60 30c-6-2-10 2-8 6" stroke="url(#gSteel)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${sparkles([[26,30,2],[76,56,2.2],[30,62,1.4]], '#fff3c4')}`),

  charm: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g fill="none" stroke="#ff8fc0" stroke-width="1.2" opacity=".6">
      <path d="M50 40m-26 0a26 22 0 1 0 52 0a26 22 0 1 0-52 0"/><path d="M50 40m-18 0a18 15 0 1 0 36 0a18 15 0 1 0-36 0"/>
    </g>
    ${silhouette('n', 29, 18, .6, 'url(#pcObsidian)', '#04060c', '#ff8fc0')}
    <path d="M70 14c3-5 11-4 11 2 0 6-8 10-11 14-3-4-11-8-11-14 0-6 8-7 11-2z" fill="#ff5f9e" stroke="#7a1a40" stroke-width="1"/>
    <path d="M66 12c1-2 3-2 4-1" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/>
    <path d="M22 18c2-3 7-2 7 1 0 4-5 6-7 9-2-3-7-5-7-9 0-3 5-4 7-1z" fill="#ff8fc0" opacity=".8"/>
    ${sparkles([[80,40,2],[18,44,1.8],[62,62,1.4]], '#ffd6ea')}`),

  fireball: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    <path d="M14 58q10-6 22-8" stroke="#ff9a4a" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M8 46q14-10 30-12" stroke="#ffd35c" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>
    <circle cx="60" cy="40" r="22" fill="url(#gFire)"/>
    <circle cx="60" cy="40" r="11" fill="#fffbe0"/>
    <path d="M38 40q-12-6-24-2 10 2 16 6-8 1-14 6 12 0 22-4z" fill="#ff7a2a" opacity=".85"/>
    ${sparkles([[78,24,3],[76,56,2.4],[46,22,2]], '#fffbe0')}`),

  scorch: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    <rect x="34" y="0" width="32" height="80" fill="url(#gFire)" opacity=".35"/>
    ${hills('#2a0a06','#150403')}
    <g>${[[40,58],[50,52],[60,58],[45,64],[56,64]].map(([x,y]) =>
      `<path d="M${x} ${y}c-4-6 2-10 0-16 6 4 8 10 6 16 3-2 4-6 3-9 4 5 4 12-1 16-3 3-9 3-12 0-3-3-3-5 4-7z" fill="url(#gFire)"/>`).join('')}</g>
    <g opacity=".75">${silhouette('p', 36, 40, .3, '#1a0a06', '#1a0a06', '#1a0a06')}${silhouette('p', 56, 32, .3, '#1a0a06', '#1a0a06', '#1a0a06')}</g>
    <g stroke="#3a1206" stroke-width="1.4" opacity=".7"><line x1="34" y1="0" x2="34" y2="80"/><line x1="66" y1="0" x2="66" y2="80"/></g>`),

  cinder: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    ${silhouette('p', 38, 30, .55, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}
    <circle cx="66" cy="26" r="11" fill="url(#gFire)"/>
    <path d="M66 26q-10 4-18 10" stroke="#ffb36b" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
    ${sparkles([[66,26,5],[78,16,2],[56,40,2.4],[72,40,1.6]], '#fffbe0')}`),

  firewall: () => artWrap('ember', `
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    <g>${[14,30,46,62,78].map((x,i) =>
      `<path d="M${x} ${66 - i%2*4}c-6-10 4-16 1-26 9 6 13 16 9 26 4-3 6-9 5-14 7 8 6 20-2 26-5 4-15 4-20 0-5-4-5-8 7-12z" fill="url(#gFire)" opacity="${.85 + (i%2)*.15}"/>`).join('')}</g>
    <rect x="8" y="64" width="84" height="6" rx="2" fill="#3a1206" stroke="#1a0804" stroke-width="1.2"/>
    ${sparkles([[24,26,2.4],[52,18,3],[76,28,2]], '#fffbe0')}`),

  dragonrage: () => artWrap('ember', `
    <circle cx="50" cy="42" r="34" fill="url(#gFire)" opacity=".45"/>
    ${sparkles(STARS,'#ffe7b8')}
    ${hills('#2a0a06','#150403')}
    <path d="M16 54c6-16 20-26 34-26 8 0 14 4 16 10 2-4 8-6 12-4-4 2-6 6-5 10 5 0 9 3 10 8-6-2-10 0-12 4-4 8-16 14-28 14-14 0-22-6-27-16z" fill="#7a2716" stroke="#2a0a06" stroke-width="1.4"/>
    <path d="M66 38c4-2 9-1 11 3-5-1-8 0-10 3z" fill="#ffb36b"/>
    <circle cx="62" cy="36" r="2.6" fill="#ffd35c" stroke="#2a0a06" stroke-width="1"/><circle cx="62.7" cy="36.4" r="1.2" fill="#2a0a06"/>
    <path d="M70 44q8 2 16-2-6 8-16 8z" fill="url(#gFire)"/>
    <path d="M30 30q-6-10-2-18 4 8 10 10z" fill="#a03a1a" stroke="#2a0a06" stroke-width="1"/>
    ${sparkles([[84,40,3.4],[88,50,2],[74,58,2.2]], '#fffbe0')}`),

  deepfreeze: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    <path d="M30 18l20-8 20 8v40l-20 12-20-12z" fill="url(#gIce)" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>
    ${silhouette('n', 36, 20, .45, '#17527f', '#0b2743', '#63d0ff')}
    <path d="M30 18l20 8 20-8M50 26v44" stroke="#ffffff" stroke-width="1" opacity=".65" fill="none"/>
    <g stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity=".9">
      <path d="M34 26l6 12M66 28l-5 10M36 54l8-8M64 56l-7-8"/>
    </g>
    <g fill="#e9f9ff"><polygon points="20,60 24,50 27,62"/><polygon points="78,62 75,50 82,56"/><polygon points="14,38 18,34 18,42"/></g>`),

  aegis: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    ${[[22,40,.72],[50,32,.9],[78,40,.72]].map(([x,y,s]) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 -18L16 -12V2C16 13 9 21 0 25C-9 21-16 13-16 2V-12Z" fill="url(#gShieldBlue)" stroke="url(#gGold)" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-9 -8Q-3 -11 1 -12" stroke="#fff" stroke-width="1.8" opacity=".5" fill="none" stroke-linecap="round"/></g>`).join('')}
    <g fill="none" stroke="#a9e8ff" opacity=".35"><circle cx="50" cy="40" r="34"/><circle cx="50" cy="40" r="26"/></g>`),

  riptide: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    <path d="M0 80V48c14-10 26-8 34 0s18 10 30 2 24-6 36 4v26z" fill="#2f86bf" opacity=".85"/>
    <path d="M0 62c14-10 26-8 34 0s18 10 30 2 24-6 36 4" fill="none" stroke="#a9e8ff" stroke-width="2"/>
    ${hills('#081f38','#040f1d').replace(/opacity="\.8"/, 'opacity=".35"')}
    ${silhouette('b', 38, 20, .55, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    <g fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity=".9">
      <path d="M26 44q-8 4-12 0"/><path d="M74 44q8 4 12 0"/></g>
    <polygon points="76,40 86,44 76,48" fill="#ffffff" opacity=".9"/>`),

  hail: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    <path d="M6 16q0-8 10-8 4-7 12-5 7-5 14 0 8-4 13 3 10 0 10 8 0 6-8 6H14q-8 0-8-10z" fill="#123a56" opacity=".9"/>
    ${hills('#081f38','#040f1d')}
    <g fill="url(#gIce)" stroke="#ffffff" stroke-width=".8">
      ${[[20,40,4],[34,54,3],[48,34,5],[60,48,3.4],[74,38,4.4],[86,56,3],[28,66,3.4],[66,66,4],[44,62,2.6]]
        .map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}
    </g>
    <g stroke="#bfeaff" stroke-width="1" opacity=".6">${[[20,40],[48,34],[74,38],[60,48]].map(([x,y]) => `<line x1="${x}" y1="${y-14}" x2="${x}" y2="${y-5}"/>`).join('')}</g>`),

  icebridge: () => artWrap('tide', `
    ${sparkles(STARS,'#dff6ff')}
    ${hills('#081f38','#040f1d')}
    <path d="M4 56h92l-8 10H12z" fill="url(#gIce)" stroke="#ffffff" stroke-width="1.4"/>
    <path d="M10 56l4-8h72l4 8z" fill="#bfeaff" opacity=".6"/>
    <g stroke="#ffffff" stroke-width="1" opacity=".7">${[22,36,50,64,78].map(x => `<line x1="${x}" y1="48" x2="${x-3}" y2="66"/>`).join('')}</g>
    ${silhouette('r', 10, 20, .5, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    <g opacity=".45">${silhouette('r', 60, 20, .5, '#a9e8ff', '#a9e8ff', '#ffffff')}</g>
    <path d="M44 34h22" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 3" opacity=".9"/>
    <polygon points="70,30 78,34 70,38" fill="#ffffff"/>`),

  recall: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <ellipse cx="50" cy="60" rx="30" ry="9" fill="url(#gPortal)" opacity=".9"/>
    <ellipse cx="50" cy="60" rx="18" ry="5" fill="#0d0620"/>
    ${silhouette('n', 36, 16, .5, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    <g fill="none" stroke="#c39bff" stroke-width="2" stroke-linecap="round">
      <path d="M22 40q6 10 0 18"/><path d="M78 40q-6 10 0 18"/></g>
    <polygon points="22,58 28,50 16,50" fill="#c39bff"/><polygon points="78,58 84,50 72,50" fill="#c39bff"/>
    ${sparkles([[30,26,2.4],[72,22,2],[60,52,1.6]], '#ffffff')}`),

  doppel: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <rect x="48" y="8" width="4" height="64" fill="url(#gPortal)" opacity=".8"/>
    ${silhouette('r', 14, 22, .6, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}
    <g opacity=".6">${silhouette('r', 54, 22, .6, '#c39bff', '#e2cfff', '#ffffff')}</g>
    <g fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".8"><path d="M44 30q8 10 0 20"/><path d="M56 30q-8 10 0 20"/></g>
    ${sparkles([[50,16,3],[50,64,2.4],[80,40,2]], '#ffffff')}`),

  timelock: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <circle cx="50" cy="38" r="24" fill="none" stroke="#c39bff" stroke-width="2" stroke-dasharray="4 4" opacity=".8"/>
    <path d="M36 36V28a14 14 0 0 1 28 0v8" fill="none" stroke="url(#gGold)" stroke-width="5"/>
    <rect x="30" y="34" width="40" height="30" rx="6" fill="url(#gGold)" stroke="#3b2508" stroke-width="1.6"/>
    <circle cx="50" cy="47" r="5" fill="#241408"/><rect x="48" y="47" width="4" height="10" rx="1.6" fill="#241408"/>
    <g stroke="#241408" stroke-width="1.4" stroke-linecap="round"><line x1="50" y1="47" x2="50" y2="41"/><line x1="50" y1="47" x2="55" y2="49"/></g>
    ${sparkles([[22,28,2.4],[80,30,2.6],[74,60,1.8]], '#e2cfff')}`),

  warpgate: () => artWrap('arcane', `
    ${sparkles(STARS,'#f1e2ff')}
    ${hills('#1a0b33','#0b0418')}
    <ellipse cx="26" cy="42" rx="17" ry="24" fill="url(#gPortal)"/>
    <ellipse cx="74" cy="42" rx="17" ry="24" fill="url(#gPortal)"/>
    <ellipse cx="26" cy="42" rx="9" ry="15" fill="#160a2e"/><ellipse cx="74" cy="42" rx="9" ry="15" fill="#160a2e"/>
    ${silhouette('p', 18, 32, .35, 'url(#pcIvory)', '#3a2912', '#c9922a')}
    ${silhouette('p', 66, 32, .35, 'url(#pcObsidian)', '#04060c', '#4fe0c0')}
    <path d="M38 30q12-8 24 0" stroke="#ffc94a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <polygon points="64,26 62,34 56,28" fill="#ffc94a"/>
    <path d="M62 56q-12 8-24 0" stroke="#c39bff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <polygon points="36,60 38,52 44,58" fill="#c39bff"/>`),

  grandgambit: () => artWrap('arcane', `
    <circle cx="50" cy="40" r="32" fill="url(#gGlowGold)" opacity=".8"/>
    ${sparkles(STARS,'#fff3c4')}
    ${hills('#1a0b33','#0b0418')}
    <g stroke="#3b2a14" stroke-width="1.2">
      <rect x="18" y="26" width="24" height="34" rx="3" fill="url(#gBack)" transform="rotate(-22 30 44)"/>
      <rect x="58" y="26" width="24" height="34" rx="3" fill="url(#gBack)" transform="rotate(22 70 44)"/>
      <rect x="38" y="20" width="24" height="34" rx="3" fill="url(#gParch)"/>
    </g>
    <path d="M50 24l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="url(#gGold)"/>
    <path d="M36 66h28l-3 6H39z" fill="url(#gGold)" stroke="#3b2508" stroke-width="1"/>
    ${sparkles([[22,20,2.6],[80,18,3],[86,52,2],[16,54,2.2]], '#fff3c4')}`),

  pilfer: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g stroke="#3b2a14" stroke-width="1.2">
      <rect x="16" y="30" width="22" height="32" rx="3" fill="url(#gBack)" transform="rotate(-16 27 46)"/>
      <rect x="38" y="26" width="22" height="32" rx="3" fill="url(#gBack)"/>
      <rect x="60" y="30" width="22" height="32" rx="3" fill="url(#gBack)" transform="rotate(16 71 46)"/>
    </g>
    <ellipse cx="50" cy="26" rx="20" ry="11" fill="#e9fff6" stroke="#06221c" stroke-width="1.4"/>
    <circle cx="50" cy="26" r="7" fill="#2ea57f"/><circle cx="50" cy="26" r="3" fill="#06120e"/><circle cx="47.6" cy="23.6" r="1.6" fill="#fff"/>
    <g stroke="#5fe8b4" stroke-width="1.4" opacity=".8"><path d="M26 18q6-6 12-8"/><path d="M74 18q-6-6-12-8"/></g>`),

  thornfield: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g stroke="#1f6b22" stroke-width="2.4" fill="none" stroke-linecap="round">
      <path d="M8 70q10-18 24-14t18 12"/><path d="M92 70q-10-18-24-14t-14 14"/>
    </g>
    <g fill="#2f8a2a">${[[18,58],[30,50],[44,56],[60,52],[72,58],[84,52]].map(([x,y]) => `<polygon points="${x},${y} ${x+4},${y+7} ${x-4},${y+7}"/>`).join('')}</g>
    ${[[32,36],[64,30]].map(([x,y]) => `<g transform="translate(${x} ${y})">
      <circle cx="0" cy="0" r="9" fill="url(#gPoison)" stroke="#0b2a12" stroke-width="1.2"/>
      <circle cx="-3" cy="-2" r="1.8" fill="#0b2a12"/><circle cx="3" cy="-2" r="1.8" fill="#0b2a12"/>
      <path d="M-3.5 4h7" stroke="#0b2a12" stroke-width="1.4"/></g>`).join('')}
    ${sparkles([[48,20,2],[80,42,2.4],[20,44,1.6]], '#c6ff8a')}`),

  saboteur: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g transform="rotate(-12 50 44)">
      <rect x="34" y="20" width="30" height="42" rx="4" fill="url(#gBack)" stroke="#3b2a14" stroke-width="1.4"/>
      <path d="M40 40h18M40 48h14" stroke="#e8c16a" stroke-width="1.4" opacity=".6"/>
    </g>
    <path d="M46 24c-6 10 2 14 0 22 8-6 12-14 8-22 4 2 6 8 5 12 5-6 4-16-3-20-4-2-8-2-10 8z" fill="url(#gFire)" opacity=".95"/>
    <g fill="#5a4a36" opacity=".9"><circle cx="28" cy="64" r="2.4"/><circle cx="66" cy="66" r="2"/><circle cx="46" cy="70" r="1.6"/></g>
    ${sparkles([[62,26,2.6],[30,34,2],[70,50,2.2]], '#ffd35c')}`),

  tracker: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g fill="none" stroke="#5fe8b4" stroke-width="1.6" opacity=".8">
      <path d="M50 58a24 18 0 0 0 0-36"/><path d="M50 58a24 18 0 0 1 0-36" stroke-dasharray="3 4"/>
    </g>
    <g fill="#135243" stroke="#5fe8b4" stroke-width="1">
      ${[[26,60],[40,50],[54,58],[68,48]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="7" transform="rotate(${x%2?18:-14} ${x} ${y})"/>`).join('')}
    </g>
    <circle cx="70" cy="30" r="12" fill="url(#gPoison)" stroke="#0b2a12" stroke-width="1.4" opacity=".95"/>
    <circle cx="66.5" cy="28" r="2.2" fill="#0b2a12"/><circle cx="73.5" cy="28" r="2.2" fill="#0b2a12"/><path d="M66 34h8" stroke="#0b2a12" stroke-width="1.6"/>
    <circle cx="70" cy="30" r="17" fill="none" stroke="#5fe8b4" stroke-width="1.4" stroke-dasharray="3 4"/>`),

  gambler: () => artWrap('verdant', `
    ${sparkles(STARS,'#d3ffec')}
    ${hills('#0a2c24','#041612')}
    <g stroke="#3b2a14" stroke-width="1.2">
      <rect x="10" y="40" width="20" height="28" rx="3" fill="url(#gBack)" transform="rotate(-28 20 54)"/>
      <rect x="70" y="40" width="20" height="28" rx="3" fill="url(#gBack)" transform="rotate(28 80 54)"/>
      <rect x="38" y="16" width="24" height="34" rx="3" fill="url(#gParch)"/>
    </g>
    <path d="M50 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#2ea57f"/>
    <g fill="none" stroke="#5fe8b4" stroke-width="2" stroke-linecap="round"><path d="M28 30q-8 8-4 18"/><path d="M72 30q8 8 4 18"/></g>
    <polygon points="24,26 34,28 26,34" fill="#5fe8b4"/><polygon points="76,26 66,28 74,34" fill="#5fe8b4"/>
    ${sparkles([[18,26,2],[84,24,2.4],[50,66,2.6]], '#ffd35c')}`),
};
const _artCache = {};
function cardArt(id){ return _artCache[id] || (_artCache[id] = CARD_ART[id]()); }

/* ----------------------------------------------------------------- card back */
const CARD_BACK_SVG = `<svg viewBox="0 0 100 140" preserveAspectRatio="none">
  <rect width="100" height="140" fill="url(#gBack)"/>
  <rect width="100" height="140" fill="url(#pLattice)"/>
  <rect x="5" y="5" width="90" height="130" rx="5" fill="none" stroke="url(#gGold)" stroke-width="2"/>
  <rect x="9" y="9" width="82" height="122" rx="3" fill="none" stroke="#e8c16a" stroke-width=".6" opacity=".7"/>
  ${[[9,9],[91,9],[9,131],[91,131]].map(([x,y])=>`<path d="M${x} ${y-4}l4 4-4 4-4-4z" fill="url(#gGold)"/>`).join('')}
  <circle cx="50" cy="70" r="29" fill="#0a2d2b" stroke="url(#gGold)" stroke-width="2"/>
  <circle cx="50" cy="70" r="24" fill="none" stroke="#e8c16a" stroke-width=".7" opacity=".8"/>
  <path d="M50 38l4 16 16-4-12 12 12 12-16-4-4 16-4-16-16 4 12-12-12-12 16 4z" fill="#e8c16a" opacity=".22"/>
  ${silhouette('n', 34, 52, .5, 'url(#gGold)', '#3b2a14', '#0a2d2b')}
  <path d="M30 22h40M34 118h32" stroke="url(#gGold)" stroke-width="1.2"/>
  <circle cx="50" cy="22" r="2.4" fill="#5fe8b4"/><circle cx="50" cy="118" r="2.4" fill="#5fe8b4"/>
</svg>`;

/* ------------------------------------------------------- school glyphs (type) */
const SCHOOL_GLYPH = {
  ember:   '<svg viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="currentColor"/></svg>',
  tide:    '<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="currentColor"/></svg>',
  arcane:  '<svg viewBox="0 0 24 24"><path d="M12 1l2.6 7.4L22 11l-7.4 2.6L12 21l-2.6-7.4L2 11l7.4-2.6z" fill="currentColor"/></svg>',
  verdant: '<svg viewBox="0 0 24 24"><path d="M20 3C9 3 4 9 4 15c0 2 .6 4 1.6 5.5C7 14 11 10 16 8c-4 3-7 7-8.5 13 1 .4 2.2.5 3.5.5 6 0 10-6 9-18.5z" fill="currentColor"/></svg>',
};

/* ------------------------------------------------------------------- UI icons */
const ICON = {
  expand: '<svg viewBox="0 0 24 24"><path d="M4 10V4h6M20 14v6h-6M4 4l6 6M20 20l-6-6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu:   '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  sound:  '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  mute:   '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  back:   '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close:  '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  cards:  '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="10" height="15" rx="2" transform="rotate(-12 8 12)" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="11" y="4" width="10" height="15" rx="2" transform="rotate(10 16 11)" fill="currentColor"/></svg>',
  gear:   '<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.4 5l-1.9-.4a6.9 6.9 0 0 1-.7 1.7l1.1 1.6-1.9 1.9-1.6-1.1c-.5.3-1.1.6-1.7.7l-.4 1.9h-2.6l-.4-1.9c-.6-.2-1.2-.4-1.7-.7l-1.6 1.1-1.9-1.9 1.1-1.6c-.3-.5-.6-1.1-.7-1.7l-1.9-.4v-2.6l1.9-.4c.2-.6.4-1.2.7-1.7L4.8 6.7l1.9-1.9 1.6 1.1c.5-.3 1.1-.6 1.7-.7L10.4 3.3h2.6l.4 1.9c.6.2 1.2.4 1.7.7l1.6-1.1 1.9 1.9-1.1 1.6c.3.5.6 1.1.7 1.7l1.9.4z" fill="currentColor"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M7 3h10v3h3v2a4 4 0 0 1-4 4 5 5 0 0 1-3 2.8V17h3v3H8v-3h3v-2.2A5 5 0 0 1 8 12a4 4 0 0 1-4-4V6h3zm-1 5a2 2 0 0 0 1 1.7V8zm12 0v1.7A2 2 0 0 0 19 8z" fill="currentColor"/></svg>',
  flag:   '<svg viewBox="0 0 24 24"><path d="M5 21V4h11l-2 4 2 4H7v9z" fill="currentColor"/></svg>',
  scroll: '<svg viewBox="0 0 24 24"><path d="M6 3h11a3 3 0 0 1 3 3v1h-4v12a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3v-1h3zM9 8h5M9 12h5M9 16h4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  home:   '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z" fill="currentColor"/></svg>',
  play:   '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  crown:  '<svg viewBox="0 0 24 24"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="currentColor"/><rect x="5" y="20" width="14" height="2" rx="1" fill="currentColor"/></svg>',
  helm:   '<svg viewBox="0 0 24 24"><path d="M5 11a7 7 0 0 1 14 0v5a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" fill="currentColor"/><path d="M8 12h3v3H8zm5 0h3v3h-3z" fill="#0b2c29"/><path d="M11 17h2v4h-2z" fill="#0b2c29"/></svg>',
  coin:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M12 6.5l1.6 3.4 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#0b2c29"/></svg>',
  lock:   '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm2 0h6V7a3 3 0 0 0-6 0zm3 4a1.8 1.8 0 0 0-1 3.3V19h2v-1.7A1.8 1.8 0 0 0 12 14z" fill="currentColor"/></svg>',
};
