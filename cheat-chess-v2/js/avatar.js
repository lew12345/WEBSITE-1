/* =========================================================================
   CHEAT CHESS avatars: a chibi knight-sorcerer built from swappable layers.
   avatarSVG({ body, skin, hair, hairColor, outfit, armour, pet })
   Everything is drawn in one 100x140 viewBox with bold outlines.
   ========================================================================= */
const OUTLINE = '#1b1220';
const SKIN_TONES = ['#f7d9bd', '#eec098', '#d89c6c', '#b87a4c', '#8d5733', '#5e3a21'];
const SKIN_SHADE = ['#e0bb98', '#d6a276', '#bd8050', '#9b5f35', '#6f4124', '#452a17'];
const HAIR_COLORS = ['#241a14', '#4a2c17', '#8a5a2b', '#d7a441', '#f0e2be', '#a8352a', '#7a4ad0', '#2f9c8a'];
const BODY_TYPES = [
  { id:'a', name:'Build A', shoulder:19, jaw:26, eye:1 },
  { id:'b', name:'Build B', shoulder:16, jaw:24.4, eye:1.12 },
];

/* ------------------------------------------------------------------ hair */
const HAIRSTYLES = {
  crop:   { name:'Crop' },
  spiky:  { name:'Spiked' },
  long:   { name:'Long' },
  tail:   { name:'Ponytail' },
  braids: { name:'Braids' },
  bun:    { name:'Top Knot' },
  bald:   { name:'Shaved' },
};
function hairArt(style, col, shade) {
  const S = `stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round"`;
  switch (style) {
    case 'crop': return `<path d="M22 44c0-16 12-25 28-25s28 9 28 25c0-6-6-10-10-9-6 1-9-4-18-4s-13 5-18 4c-5-1-10 3-10 9z" fill="${col}" ${S}/>`;
    case 'spiky': return `<path d="M21 46c-1-17 11-28 29-28s29 11 28 28c-2-5-5-9-9-11l3-9-9 6-3-10-6 8-6-11-5 11-7-7-1 10-9-6 2 9c-4 2-6 6-7 10z" fill="${col}" ${S}/>`;
    case 'long': return `<path d="M20 46c0-17 12-27 30-27s30 10 30 27v40c0 4-4 6-8 5l-4-10V52c-4 4-11 6-18 6s-14-2-18-6v34l-4 10c-4 1-8-1-8-5z" fill="${col}" ${S}/>
      <path d="M26 56c2 10 2 22 0 32M74 56c-2 10-2 22 0 32" stroke="${shade}" stroke-width="2" fill="none" opacity=".7"/>`;
    case 'tail': return `<path d="M22 45c0-16 12-26 28-26s28 10 28 26c-3-6-8-9-12-9-6 0-9-3-16-3s-11 3-16 3c-5 0-9 3-12 9z" fill="${col}" ${S}/>
      <path d="M74 34c9-2 16 6 15 16-1 9-6 16-3 24-6 1-11-4-12-12-1-9 2-16-4-22z" fill="${col}" ${S}/>`;
    case 'braids': return `<path d="M22 45c0-16 12-26 28-26s28 10 28 26c-3-6-8-10-12-10-6 0-9-3-16-3s-11 3-16 3c-5 0-9 4-12 10z" fill="${col}" ${S}/>
      <path d="M24 50c-4 8-5 18-3 28 3 1 6 1 8-1 0-9 1-18-1-26z" fill="${col}" ${S}/>
      <path d="M76 50c4 8 5 18 3 28-3 1-6 1-8-1 0-9-1-18 1-26z" fill="${col}" ${S}/>
      <path d="M22 60h9M22 68h9M69 60h9M69 68h9" stroke="${shade}" stroke-width="2"/>`;
    case 'bun': return `<circle cx="50" cy="14" r="9" fill="${col}" ${S}/>
      <path d="M22 45c0-16 12-26 28-26s28 10 28 26c-3-7-8-11-13-11-5 0-8-2-15-2s-10 2-15 2c-5 0-10 4-13 11z" fill="${col}" ${S}/>`;
    case 'bald': return `<path d="M26 40c3-9 12-14 24-14s21 5 24 14c-4-4-13-7-24-7s-20 3-24 7z" fill="${shade}" opacity=".45"/>`;
  }
  return '';
}

/* The back of the head: a full cap of hair, plus any strands that hang down. */
function hairBackArt(style, col, shade) {
  const S = `stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round"`;
  if (style === 'bald') return `<path d="M24 44c0-14 11-22 26-22s26 8 26 22c0 6-4 10-10 10H34c-6 0-10-4-10-10z" fill="${shade}" opacity=".35"/>`;
  const cap = `<path d="M21 48c0-18 12-29 29-29s29 11 29 29v10c0 6-5 10-11 10H32c-6 0-11-4-11-10z" fill="${col}" ${S}/>`;
  const extra = {
    long: `<path d="M22 54v32c0 4 4 6 8 5l3-9V58zM78 54v32c0 4-4 6-8 5l-3-9V58z" fill="${col}" ${S}/>
      <path d="M34 56v34M66 56v34" stroke="${shade}" stroke-width="2" opacity=".6"/>`,
    tail: `<path d="M44 66c-4 10-3 22 2 30 4-1 7-4 8-9 1-8-2-14-4-21z" fill="${col}" ${S}/>
      <rect x="42" y="60" width="16" height="6" rx="3" fill="${shade}" ${S} stroke-width="2"/>`,
    braids: `<path d="M24 56c-4 8-5 18-3 26 3 1 6 1 8-1 0-8 1-17-1-25zM76 56c4 8 5 18 3 26-3 1-6 1-8-1 0-8-1-17 1-25z" fill="${col}" ${S}/>`,
    bun: `<circle cx="50" cy="16" r="9" fill="${col}" ${S}/>`,
  }[style] || '';
  return cap + extra;
}

/* ------------------------------------------------------------ outfits */
const OUTFITS = {
  apprentice: { name:'Apprentice Robe', body:'#3f6f66', trim:'#e8c16a', legs:'#2b4f4a' },
  ranger:     { name:'Ranger Garb',     body:'#4a5a33', trim:'#c9a05a', legs:'#33402a' },
  mage:       { name:'Mage Robes',      body:'#3b2a6b', trim:'#c39bff', legs:'#2a1c50' },
  royal:      { name:'Royal Doublet',   body:'#6d2436', trim:'#f5d27a', legs:'#3f1420' },
  frost:      { name:'Frostweave',      body:'#2f6d94', trim:'#d9f2ff', legs:'#21506e' },
  shadow:     { name:'Shadow Silks',    body:'#232338', trim:'#7a6bd0', legs:'#16162a' },
};
/* ------------------------------------------------------------ armour */
const ARMOURS = {
  none:       { name:'No Armour' },
  steel:      { name:'Steel Plate',     metal:'#b9c4d2', dark:'#6b7789', trim:'#e8c16a' },
  emeraldmail:{ name:'Emerald Mail',    metal:'#5fc79b', dark:'#2a7a5c', trim:'#ffe08a' },
  dragonscale:{ name:'Dragonscale',     metal:'#c05a2a', dark:'#7a2f12', trim:'#ffd35c', helm:true, glow:'#ffb347' },
  obsidian:   { name:'Obsidian Guard',  metal:'#3c4150', dark:'#1d2028', trim:'#c9963c', helm:true, glow:'#ff5a64' },
  celestial:  { name:'Celestial Plate', metal:'#dfe9ff', dark:'#8fa6d8', trim:'#fff3c4', helm:true, glow:'#8fd9ff' },
  runestone:  { name:'Runestone Golem', metal:'#a9a293', dark:'#6b6558', trim:'#5fe8d0', helm:true, glow:'#5fe8d0', rune:true },
};
/* ------------------------------------------------------------ pets */
const PETS = {
  none:      { name:'No Companion' },
  wisp:      { name:'Wisp' },
  cat:       { name:'Cat' },
  dog:       { name:'Hound' },
  owl:       { name:'Owl' },
  dragonling:{ name:'Baby Dragon' },
  dragon:    { name:'Elder Dragon' },
};
/* Painted companions. Flyers carry a strip of wing frames; the rest stand still.
   `foot` is how far up the box the feet sit, so a walker lands on the same floor
   line as the champion and a flyer hovers by his shoulder. */
const PET_ART = {
  path:'art/pets/',
  wisp:       null,                                     /* drawn, not painted */
  cat:        { frames:1, size:40, foot:1 },
  dog:        { frames:1, size:42, foot:1 },
  owl:        { frames:4, size:58, foot:34, fly:true },
  dragonling: { frames:4, size:58, foot:30, fly:true },
  dragon:     { frames:4, size:74, foot:26, fly:true },
};

/* One companion, painted if we have art for it and drawn if we do not. */
function petNode(id, opts = {}) {
  if (!id || id === 'none') return '';
  const art = PET_ART[id];
  if (!art) return `<svg class="av-pet fly" viewBox="-22 -22 44 44">${petArt(id)}</svg>`;
  const cls = ['av-pet', 'pet-art', art.fly ? 'fly' : 'stand', 'f' + art.frames];
  if (opts.cls) cls.push(opts.cls);
  const style = `background-image:url(${PET_ART.path}${id}.png?v=${ART_VER});` +
    `width:${art.size}%;bottom:${art.foot}%`;
  return `<i class="${cls.join(' ')}" style="${style}"></i>`;
}
function petArt(pet) {
  const S = `stroke="${OUTLINE}" stroke-width="2.2" stroke-linejoin="round"`;
  switch (pet) {
    case 'wisp': return `<g class="av-float"><circle cx="0" cy="0" r="11" fill="#bffff0" opacity=".35"/>
      <circle cx="0" cy="0" r="6.5" fill="#eafff9" ${S}/><circle cx="-2" cy="-2" r="2" fill="#fff"/>
      <path d="M-4 7q4 6 8 0" stroke="#5fe8b4" stroke-width="2" fill="none"/></g>`;
    case 'owl': return `<g class="av-float"><ellipse cx="0" cy="2" rx="10" ry="11" fill="#8a7a63" ${S}/>
      <path d="M-10 -4l-4-8 8 3zM10 -4l4-8-8 3z" fill="#8a7a63" ${S}/>
      <circle cx="-4" cy="-1" r="3.6" fill="#fff" ${S}/><circle cx="4" cy="-1" r="3.6" fill="#fff" ${S}/>
      <circle cx="-4" cy="-1" r="1.7" fill="${OUTLINE}"/><circle cx="4" cy="-1" r="1.7" fill="${OUTLINE}"/>
      <path d="M0 3l-2.5 3h5z" fill="#e8c16a" ${S} stroke-width="1.4"/>
      <path d="M-6 11l-2 4M6 11l2 4" stroke="#e8c16a" stroke-width="2.4" stroke-linecap="round"/></g>`;
    case 'cat': return `<g><path d="M-9 12c-2-8 0-14 4-16l-3-7 6 4 5-4-1 7c4 2 6 8 4 16z" fill="#2b2b3d" ${S}/>
      <circle cx="-3" cy="-1" r="2" fill="#5fe8b4"/><circle cx="4" cy="-1" r="2" fill="#5fe8b4"/>
      <path d="M8 10q8 2 6-8" stroke="#2b2b3d" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    case 'dragonling': return `<g class="av-float"><path d="M-10 12c-3-9 0-16 5-18l-3-6 6 3 5-4-1 7c5 2 8 9 5 18z" fill="#3f8a5c" ${S}/>
      <path d="M-8 -4c-8-6-14-4-16 2 6 0 10 3 14 6zM8 -4c8-6 14-4 16 2-6 0-10 3-14 6z" fill="#5fc79b" ${S}/>
      <circle cx="-3" cy="0" r="2.2" fill="#ffd35c"/><circle cx="4" cy="0" r="2.2" fill="#ffd35c"/>
      <path d="M-2 7q4 3 7-1" stroke="${OUTLINE}" stroke-width="1.8" fill="none"/>
      <path d="M10 12q8 3 8-6" stroke="#3f8a5c" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
  }
  return '';
}

/* --------------------------------------------------------------- avatar */
const DEFAULT_AVATAR = { body:'a', skin:1, hair:'crop', hairColor:0, gear:'none', pet:'none' };

function avatarSVG(av, opts = {}) {
  const a = { ...DEFAULT_AVATAR, ...(av || {}) };
  const bt = BODY_TYPES.find(b => b.id === a.body) || BODY_TYPES[0];
  const skin = SKIN_TONES[a.skin % SKIN_TONES.length], skinDark = SKIN_SHADE[a.skin % SKIN_TONES.length];
  const hairCol = HAIR_COLORS[a.hairColor % HAIR_COLORS.length];
  const hairShade = shadeOf(hairCol);
  const fit = OUTFITS[a.outfit] || OUTFITS.apprentice;
  const arm = ARMOURS[a.armour] || ARMOURS.none;
  const S = `stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"`;
  const sh = bt.shoulder;
  const helmet = !!arm.helm && !opts.noHelm;

  const legs = `<path d="M${50-sh+4} 104h11v18h-11z" fill="${fit.legs}" ${S}/><path d="M${50+sh-15} 104h11v18h-11z" fill="${fit.legs}" ${S}/>
    <path d="M${50-sh+1} 120h15v9h-17z" fill="#3a2a1c" ${S}/><path d="M${50+sh-16} 120h15v9h-17z" fill="#3a2a1c" ${S}/>`;
  const arms = `<path d="M${50-sh-7} 72c-4 2-5 6-4 10l4 16c1 4 5 6 8 4l3-2-6-28z" fill="${fit.body}" ${S}/>
    <path d="M${50+sh+7} 72c4 2 5 6 4 10l-4 16c-1 4-5 6-8 4l-3-2 6-28z" fill="${fit.body}" ${S}/>
    <circle cx="${50-sh-5}" cy="100" r="6" fill="${arm.metal || skin}" ${S}/><circle cx="${50+sh+5}" cy="100" r="6" fill="${arm.metal || skin}" ${S}/>`;
  const torso = `<path d="M${50-sh} 70c0-5 6-8 ${sh} -8s${sh} 3 ${sh} 8v30c0 5-4 8-${sh} 8s-${sh}-3-${sh}-8z" fill="${fit.body}" ${S}/>
    <path d="M${50-sh+3} 68c4 6 9 9 ${sh-3} 9s${sh-3}-3 ${sh-3}-9" fill="${fit.trim}" opacity=".9"/>
    <rect x="${50-sh}" y="92" width="${sh*2}" height="7" fill="${fit.trim}" ${S} stroke-width="2.2"/>`;
  const armourArt = arm.metal ? `
    <path d="M${50-sh-3} 74c-2-7 4-12 10-12l3 6-4 10z" fill="${arm.metal}" ${S}/>
    <path d="M${50+sh+3} 74c2-7-4-12-10-12l-3 6 4 10z" fill="${arm.metal}" ${S}/>
    <path d="M${50-sh+2} 70h${sh*2-4}l-3 20-${sh-2} 6-${sh-2}-6z" fill="${arm.metal}" ${S}/>
    <path d="M${50-sh+2} 70h${sh*2-4}l-2 8H${50-sh+4}z" fill="${arm.dark}"/>
    ${opts.back ? `<path d="M${50-sh+4} 74h${sh*2-8}" stroke="${arm.dark}" stroke-width="2.4"/>` : `<path d="M50 76l5 5-5 5-5-5z" fill="${arm.trim}" stroke="${OUTLINE}" stroke-width="1.6"/>`}
    ${arm.rune ? `<g stroke="${arm.glow}" stroke-width="1.8" opacity=".95" class="av-rune"><path d="M${50-sh+6} 86h8M${50+sh-14} 86h8"/><path d="M50 88v6"/></g>` : ''}` : '';

  const faceBack = helmet ? `
    <path d="M${50-bt.jaw} 42c0-15 11-24 ${bt.jaw} -24s${bt.jaw} 9 ${bt.jaw} 24v10c0 14-11 22-${bt.jaw}-22s-${bt.jaw} 8-${bt.jaw}-22z" fill="${arm.metal}" ${S}/>
    <path d="M${50-bt.jaw+3} 52h${(bt.jaw-3)*2}v12H${50-bt.jaw+3}z" fill="${arm.dark}"/>
    <path d="M50 30v30" stroke="${arm.dark}" stroke-width="2.6"/>
    <path d="M${50-bt.jaw} 40c4-12 12-18 ${bt.jaw} -18s${bt.jaw-2} 6 ${bt.jaw} 18" fill="none" stroke="${arm.trim}" stroke-width="3"/>
    <path d="M44 16c2-10 10-14 14-12-6 2-8 6-8 14z" fill="${arm.trim}" ${S} stroke-width="2"/>` : `
    <path d="M${50-bt.jaw} 44c0-16 11-26 ${bt.jaw} -26s${bt.jaw} 10 ${bt.jaw} 26c0 16-11 26-${bt.jaw} 26s-${bt.jaw}-10-${bt.jaw}-26z" fill="${skin}" ${S}/>
    <ellipse cx="${50-bt.jaw-1}" cy="48" rx="3.4" ry="4.6" fill="${skin}" ${S} stroke-width="2.2"/>
    <ellipse cx="${50+bt.jaw+1}" cy="48" rx="3.4" ry="4.6" fill="${skin}" ${S} stroke-width="2.2"/>
    ${hairBackArt(a.hair, hairCol, hairShade)}`;

  const face = helmet ? `
    <path d="M${50-bt.jaw} 42c0-15 11-24 ${bt.jaw} -24s${bt.jaw} 9 ${bt.jaw} 24v10c0 14-11 22-${bt.jaw}-22s-${bt.jaw} 8-${bt.jaw}-22z" fill="${arm.metal}" ${S}/>
    <path d="M${50-bt.jaw} 48h${bt.jaw*2}v8H${50-bt.jaw}z" fill="${arm.dark}"/>
    <path d="M${50-bt.jaw+4} 49h9l2 5-2 2h-9zM${50+bt.jaw-4} 49h-9l-2 5 2 2h9z" fill="${arm.glow}" class="av-glow"/>
    <path d="M50 56v12M46 62h8" stroke="${arm.dark}" stroke-width="2.4"/>
    <path d="M${50-bt.jaw} 40c4-12 12-18 ${bt.jaw} -18s${bt.jaw-2} 6 ${bt.jaw} 18" fill="none" stroke="${arm.trim}" stroke-width="3"/>
    <path d="M44 16c2-10 10-14 14-12-6 2-8 6-8 14z" fill="${arm.trim}" ${S} stroke-width="2"/>` : `
    <path d="M${50-bt.jaw} 44c0-16 11-26 ${bt.jaw} -26s${bt.jaw} 10 ${bt.jaw} 26c0 16-11 26-${bt.jaw} 26s-${bt.jaw}-10-${bt.jaw}-26z" fill="${skin}" ${S}/>
    <ellipse cx="${50-bt.jaw-1}" cy="48" rx="3.4" ry="4.6" fill="${skin}" ${S} stroke-width="2.2"/>
    <ellipse cx="${50+bt.jaw+1}" cy="48" rx="3.4" ry="4.6" fill="${skin}" ${S} stroke-width="2.2"/>
    <ellipse cx="${50-8.5}" cy="47" rx="${4.2*bt.eye}" ry="${5*bt.eye}" fill="#fff" stroke="${OUTLINE}" stroke-width="2"/>
    <ellipse cx="${50+8.5}" cy="47" rx="${4.2*bt.eye}" ry="${5*bt.eye}" fill="#fff" stroke="${OUTLINE}" stroke-width="2"/>
    <circle cx="${50-7.6}" cy="48" r="${2.3*bt.eye}" fill="#2b1d16"/><circle cx="${50+9.4}" cy="48" r="${2.3*bt.eye}" fill="#2b1d16"/>
    <circle cx="${50-8.8}" cy="46" r="1.1" fill="#fff"/><circle cx="${50+8.2}" cy="46" r="1.1" fill="#fff"/>
    <path d="M${50-13} 39q4-3 8-1M${50+13} 39q-4-3-8-1" stroke="${OUTLINE}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M46 58q4 3 8 0" stroke="${OUTLINE}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="${50-15}" cy="53" rx="3.4" ry="2.2" fill="${skinDark}" opacity=".5"/>
    <ellipse cx="${50+15}" cy="53" rx="3.4" ry="2.2" fill="${skinDark}" opacity=".5"/>
    ${hairArt(a.hair, hairCol, hairShade)}`;

  const pet = a.pet && a.pet !== 'none' ? `<g transform="translate(84 112) scale(.85)">${petArt(a.pet)}</g>` : '';
  const glowRing = opts.ring === false ? '' :
    `<ellipse cx="50" cy="132" rx="26" ry="6" fill="#041413" opacity=".45"/>`;

  return `<svg viewBox="${opts.head ? '14 4 72 72' : '0 0 100 140'}" class="avatar${opts.cls ? ' ' + opts.cls : ''}">
    ${glowRing}${pet}
    <g class="av-body">${legs}${arms}${torso}${armourArt}
      <rect x="45" y="62" width="10" height="8" fill="${skinDark}" ${S} stroke-width="2"/>
      ${opts.back ? faceBack : face}
    </g>
  </svg>`;
}
function shadeOf(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.round(v * .65)).toString(16).padStart(2, '0');
  return '#' + f((n >> 16) & 255) + f((n >> 8) & 255) + f(n & 255);
}

/* Opponent portraits, so the computer has a face too. */
const AI_AVATARS = {
  easy:   { skin:0, hair:'swept',  gear:'ranger',    pet:'owl' },
  medium: { skin:2, hair:'crop',   gear:'steel',     pet:'none' },
  hard:   { skin:3, hair:'none',   gear:'amberhorn', pet:'dragon' },
  rival:  { skin:1, hair:'long',   gear:'nightfall', pet:'wisp' },
};

/* A companion on its own, for the little run across the board. */
function petSVG(pet){ return `<svg viewBox="-22 -22 44 44">${petArt(pet)}</svg>`; }

/* =========================================================================
   Painted champion art, in layers: body, gear, head, hair.
   Files live in www/art/avatar. Anything missing falls back to the drawing above.
   Gear that covers the head (a helm or a hood) is one complete image instead.
   ========================================================================= */
const ART_VER = 6;                  // bump this whenever the art files change
const AVATAR_ART = {
  path:'art/avatar/',
  skins:4,
  hair:['crop', 'spiked', 'swept', 'long', 'tail', 'braid'],
  bodyGear:['ranger', 'mage', 'royal', 'steel', 'emerald', 'darkiron'],
  fullGear:['halfhelm', 'wanderer', 'nightfall', 'void', 'emberlight', 'silver', 'gilded', 'runestone', 'amberhorn'],
};
function hasAvatarArt(){ return AVATAR_ART.skins > 0; }
function gearCoversHead(id){ return AVATAR_ART.fullGear.includes(id); }

/* The stack of images that make up a champion, bottom layer first. */
function avatarLayers(av) {
  const a = { ...DEFAULT_AVATAR, ...(av || {}) };
  const f = n => `${AVATAR_ART.path}${n}.png?v=${ART_VER}`;
  if (gearCoversHead(a.gear)) return [f('gear_' + a.gear)];
  const tone = a.skin % AVATAR_ART.skins;
  const wears = a.gear && a.gear !== 'none' && AVATAR_ART.bodyGear.includes(a.gear);
  /* Gear art is a whole body, so the bare skin layer is swapped for the head alone. */
  const out = wears ? [f('gear_' + a.gear), f('head_' + tone)] : [f('skin_' + tone)];
  if (a.hair && a.hair !== 'none' && AVATAR_ART.hair.includes(a.hair)) out.push(f('hair_' + a.hair));
  return out;
}

/* Champion markup: painted layers when the art is there, drawn art when it is not. */
function avatarNode(av, opts = {}) {
  if (!hasAvatarArt()) return avatarSVG(av, opts);
  const a = { ...DEFAULT_AVATAR, ...(av || {}) };
  const layers = avatarLayers(a).map(src => `<img src="${src}" alt="" draggable="false">`).join('');
  const pet = opts.noPet ? '' : petNode(a.pet);
  return `<div class="av-img${opts.head ? ' head' : ''}${opts.cls ? ' ' + opts.cls : ''}">${layers}${pet}</div>`;
}
