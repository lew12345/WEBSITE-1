/* =========================================================================
   CHEAT CHESS card catalogue: 50 cards.
     set 'core'   (20) you own these from the start
     set 'relic'  (30) unlocked through challenges and Gambit milestones
   Your deck holds 20 cards, one copy of each, so you can never draw a duplicate.
   To add more cards later: add an entry here, art in art.js (CARD_ART),
   targets and effect in game.js, and a prompt in CARD_STAGES if it needs targets.
   ========================================================================= */
const SCHOOLS = {
  ember:   { name:'Ember',   type:'Spell', accent:'#ff8a4c', deep:'#3a0f0a', mid:'#7a2716', glow:'#ffb36b' },
  tide:    { name:'Tide',    type:'Ward',  accent:'#63d0ff', deep:'#081c33', mid:'#14446e', glow:'#a9e8ff' },
  arcane:  { name:'Arcane',  type:'Rite',  accent:'#c39bff', deep:'#170a2e', mid:'#3d1d6e', glow:'#e2cfff' },
  verdant: { name:'Verdant', type:'Trick', accent:'#5fe8b4', deep:'#06221c', mid:'#135243', glow:'#b5ffe2' },
};

const RARITY = {
  common:    { name:'Common',    gem:'#dfe9ef', rank:0 },
  rare:      { name:'Rare',      gem:'#ffc94a', rank:1 },
  epic:      { name:'Epic',      gem:'#c77dff', rank:2 },
  legendary: { name:'Legendary', gem:'#ff5470', rank:3 },
};

const CARDS = [
  /* ------------------------------------------------------------ CORE SET */
  { id:'bomb', name:'Bomb Strike', rarity:'rare', school:'ember', kind:'Instant',
    desc:'Detonate a bomb on any square. It destroys the piece there plus whatever stands on 4 random squares around it, friend or foe. Kings are spared.',
    flavor:'"Subtlety is overrated."' },
  { id:'lightning', name:'Lightning Bolt', rarity:'rare', school:'ember', kind:'Instant',
    desc:'Strike a whole file. The bolt travels from your side and destroys the first enemy piece it hits. Kings are immune.',
    flavor:'The sky takes sides.' },
  { id:'quake', name:'Earthquake', rarity:'common', school:'ember', kind:'Instant',
    desc:'The board shakes. Up to 3 random pawns of either colour lurch one square forward or back, if they can.',
    flavor:'Even the ground cheats.' },
  { id:'march', name:'Forced March', rarity:'common', school:'ember', kind:'Curse',
    desc:'Force one enemy pawn to stomp one square forward, if the square ahead is empty.',
    flavor:'Left, right, left, off a cliff.' },

  { id:'shield', name:'Shield Ward', rarity:'common', school:'tide', kind:'Ward',
    desc:"Protect one of your pieces. It cannot be captured during your opponent's next turn.",
    flavor:'Tide forged, spell proof.' },
  { id:'frost', name:'Frost Freeze', rarity:'common', school:'tide', kind:'Curse',
    desc:'Freeze one enemy piece solid. It cannot move on their next turn.',
    flavor:'Chill out.' },
  { id:'vanish', name:'Vanish', rarity:'common', school:'tide', kind:'Ward',
    desc:"Turn one of your pieces ghostly. It cannot be captured for your opponent's next 2 turns.",
    flavor:'Now you see it.' },
  { id:'wall', name:'Wall of Stone', rarity:'rare', school:'tide', kind:'Terrain',
    desc:'Raise an impassable stone wall on an empty square. It blocks all movement and attacks for 3 full rounds.',
    flavor:'Good walls make furious neighbours.' },
  { id:'kingguard', name:"King's Guard", rarity:'legendary', school:'tide', kind:'Passive',
    desc:'Passive. If you would be checkmated while holding this card, it destroys the checking piece and saves your king. It cannot be played by hand.',
    flavor:'The crown never falls alone.' },

  { id:'teleport', name:'Teleport', rarity:'rare', school:'arcane', kind:'Rite',
    desc:'Instantly move one of your pieces to any empty square, ignoring normal movement rules.',
    flavor:'Blink, and it is elsewhere.' },
  { id:'swap', name:'Mind Swap', rarity:'common', school:'arcane', kind:'Rite',
    desc:'Instantly swap the positions of two of your own pieces.',
    flavor:'Who was the knight again?' },
  { id:'clone', name:'Duplicate', rarity:'rare', school:'arcane', kind:'Summon',
    desc:'Create an exact copy of one of your knights or bishops on an empty adjacent square.',
    flavor:'Twice the trouble.' },
  { id:'resurrect', name:'Resurrection', rarity:'rare', school:'arcane', kind:'Summon',
    desc:'Bring back the last piece of yours that was lost, placing it on any empty square on your half of the board.',
    flavor:'Death is only a setback.' },
  { id:'rewind', name:'Time Warp', rarity:'rare', school:'arcane', kind:'Instant',
    desc:"Rewind the clock and undo your opponent's last move. The piece that moved is frozen, so they have to try something else.",
    flavor:'Let us try that again.' },
  { id:'hourglass', name:'Second Wind', rarity:'rare', school:'arcane', kind:'Instant',
    desc:'Playing this card is not your move. Take two full turns right now.',
    flavor:'Borrowed sand, stolen time.' },

  { id:'spy', name:'Spy Glass', rarity:'common', school:'verdant', kind:'Trick',
    desc:"Secretly peek at one of your opponent's hidden cheat cards.",
    flavor:'Knowledge is the sharpest blade.' },
  { id:'poison', name:'Poison Trap', rarity:'common', school:'verdant', kind:'Trap',
    desc:'Plant an invisible trap on an empty square. The first enemy piece to step on it is destroyed. Kings just break the trap.',
    flavor:'Mind your step.' },
  { id:'steal', name:'Piece Steal', rarity:'rare', school:'verdant', kind:'Trick',
    desc:'Choose one of your pieces, then take permanent control of an enemy pawn standing next to it.',
    flavor:'Loyalty is for sale.' },
  { id:'disarm', name:'Disarm', rarity:'common', school:'verdant', kind:'Counter',
    desc:'Destroy one visible enemy effect: a shield, ghost, freeze or wall.',
    flavor:'Your tricks end here.' },
  { id:'cards', name:'Sacrifice Draw', rarity:'rare', school:'verdant', kind:'Trick',
    desc:'Sacrifice one of your pawns to immediately draw 2 fresh cheat cards.',
    flavor:'A pawn for a pair of aces.' },

  /* ------------------------------------------------ RELIC SET (unlockable) */
  { id:'meteor', set:'relic', name:'Meteor Shower', rarity:'epic', school:'ember', kind:'Instant',
    desc:'Three meteors crash onto random pieces in the far half of the board. Anything standing there burns, yours included. Kings are spared.',
    flavor:'Look up. Too late.' },
  { id:'chain', set:'relic', name:'Chain Lightning', rarity:'rare', school:'ember', kind:'Instant',
    desc:'Strike an enemy pawn. The lightning leaps on to every enemy pawn touching it, destroying up to 4 pawns in a chain.',
    flavor:'It never strikes just once.' },
  { id:'phoenix', set:'relic', name:'Phoenix Feather', rarity:'epic', school:'ember', kind:'Summon',
    desc:'Revive your most valuable lost piece, placing it on any empty square on your half of the board.',
    flavor:'From the ashes, a queen.' },
  { id:'fireball', set:'relic', name:'Fireball', rarity:'rare', school:'ember', kind:'Instant',
    desc:'Hurl a fireball at any enemy pawn, knight or bishop and destroy it.',
    flavor:'Point. Burn. Repeat.' },
  { id:'scorch', set:'relic', name:'Scorched Earth', rarity:'epic', school:'ember', kind:'Instant',
    desc:'Set a whole file alight. Every pawn in that file burns, yours as well as theirs.',
    flavor:'Nothing grows here now.' },
  { id:'cinder', set:'relic', name:'Cinder Bolt', rarity:'common', school:'ember', kind:'Instant',
    desc:'A small, mean spark. Destroy any one enemy pawn.',
    flavor:'Small spark, big problem.' },
  { id:'firewall', set:'relic', name:'Fire Wall', rarity:'rare', school:'ember', kind:'Terrain',
    desc:'Raise a wall of flame on an empty square and on the empty squares either side of it. They block everything for 2 rounds.',
    flavor:'After you.' },
  { id:'dragonrage', set:'relic', name:"Dragon's Rage", rarity:'legendary', school:'ember', kind:'Instant',
    desc:'Choose one of your pieces. Every enemy piece standing next to it is burned away. Kings are spared.',
    flavor:'It woke up angry.' },

  { id:'blizzard', set:'relic', name:'Blizzard', rarity:'epic', school:'tide', kind:'Curse',
    desc:'Summon a storm over a 3 by 3 area. Every enemy piece inside is frozen and cannot move on their next turn.',
    flavor:'Winter came early.' },
  { id:'tidal', set:'relic', name:'Tidal Wave', rarity:'rare', school:'tide', kind:'Curse',
    desc:'A great wave pushes every enemy pawn one square back toward its own side, if the square behind it is empty.',
    flavor:'The sea gives and the sea shoves.' },
  { id:'sanctuary', set:'relic', name:'Sanctuary', rarity:'rare', school:'tide', kind:'Ward',
    desc:"Shield your king and every one of your pieces standing next to it. They cannot be captured during your opponent's next turn.",
    flavor:'Holy ground, closed doors.' },
  { id:'deepfreeze', set:'relic', name:'Deep Freeze', rarity:'rare', school:'tide', kind:'Curse',
    desc:'Freeze one enemy piece for their next 2 turns. Nothing thaws it early.',
    flavor:'Come back in a week.' },
  { id:'aegis', set:'relic', name:'Aegis', rarity:'epic', school:'tide', kind:'Ward',
    desc:"Shield three of your pieces at once. None of them can be captured during your opponent's next turn.",
    flavor:'Three shields, one prayer.' },
  { id:'riptide', set:'relic', name:'Riptide', rarity:'common', school:'tide', kind:'Rite',
    desc:'Drag one of your pieces one square in any direction onto an empty square, ignoring normal movement rules.',
    flavor:'The current decides.' },
  { id:'hail', set:'relic', name:'Hailstorm', rarity:'rare', school:'tide', kind:'Curse',
    desc:'Hailstones batter the board and freeze 2 random enemy pieces for their next turn.',
    flavor:'Ice has no favourites.' },
  { id:'icebridge', set:'relic', name:'Ice Bridge', rarity:'common', school:'tide', kind:'Rite',
    desc:'Slide one of your pieces along a bridge of ice to any empty square on the same rank.',
    flavor:'Mind the gap.' },

  { id:'pegasus', set:'relic', name:'Pegasus Leap', rarity:'rare', school:'arcane', kind:'Rite',
    desc:'One of your pieces sprouts wings and jumps like a knight. It can land on an empty square or capture an enemy piece there.',
    flavor:'Why walk when you can fly?' },
  { id:'ascension', set:'relic', name:'Ascension', rarity:'epic', school:'arcane', kind:'Rite',
    desc:'Choose one of your pawns. It ascends on the spot and becomes a queen.',
    flavor:'Humble beginnings, royal endings.' },
  { id:'recall', set:'relic', name:'Arcane Recall', rarity:'common', school:'arcane', kind:'Rite',
    desc:'Summon one of your pieces home to any empty square on your back rank.',
    flavor:'Come here. Now.' },
  { id:'doppel', set:'relic', name:'Doppelganger', rarity:'epic', school:'arcane', kind:'Summon',
    desc:'Copy an enemy knight, bishop or rook. The copy appears on any empty square on your half and fights for you.',
    flavor:'Imitation, the sincerest theft.' },
  { id:'timelock', set:'relic', name:'Time Lock', rarity:'epic', school:'arcane', kind:'Curse',
    desc:'Seal your opponent out of their own hand. They cannot play any cheat card on their next turn.',
    flavor:'No cheating. Only you.' },
  { id:'warpgate', set:'relic', name:'Warp Gate', rarity:'rare', school:'arcane', kind:'Rite',
    desc:'Open a gate and swap one of your pieces with an enemy piece. Kings stay where they are.',
    flavor:'You there. Swap.' },
  { id:'grandgambit', set:'relic', name:'Grand Gambit', rarity:'legendary', school:'arcane', kind:'Instant',
    desc:'Draw 2 fresh cheat cards, then take two full turns right now.',
    flavor:'Everything, all at once.' },

  { id:'pickpocket', set:'relic', name:'Pickpocket', rarity:'rare', school:'verdant', kind:'Trick',
    desc:"Steal a random cheat card from your opponent's hand and add it to yours.",
    flavor:'Finders keepers.' },
  { id:'charm', set:'relic', name:'Charm', rarity:'epic', school:'verdant', kind:'Trick',
    desc:'Choose one of your pieces, then charm an enemy knight or bishop standing next to it. It joins your side for good.',
    flavor:'Such lovely eyes you have.' },
  { id:'pilfer', set:'relic', name:'Pilfer', rarity:'common', school:'verdant', kind:'Trick',
    desc:"Look at your opponent's entire hand. Every card, no secrets.",
    flavor:'Reading over shoulders since forever.' },
  { id:'thornfield', set:'relic', name:'Thornfield', rarity:'rare', school:'verdant', kind:'Trap',
    desc:'Plant invisible poison traps on 2 empty squares at once.',
    flavor:'Two steps, two problems.' },
  { id:'saboteur', set:'relic', name:'Saboteur', rarity:'epic', school:'verdant', kind:'Trick',
    desc:"Burn a random cheat card straight out of your opponent's hand. They never get to use it.",
    flavor:'Oops. Was that yours?' },
  { id:'tracker', set:'relic', name:'Tracker', rarity:'common', school:'verdant', kind:'Counter',
    desc:'Read the ground and reveal every hidden trap on the board. They stay visible for the rest of the game.',
    flavor:'Someone has been busy.' },
  { id:'gambler', set:'relic', name:"Gambler's Draw", rarity:'rare', school:'verdant', kind:'Trick',
    desc:'Throw away the rest of your hand and draw the same number of fresh cards.',
    flavor:'Rotten hand? Try another.' },
];
(() => {
  let core = 0, relic = 0;
  for (const c of CARDS) {
    if (!c.set) c.set = 'core';
    c.num = c.set === 'core' ? ++core : ++relic;
  }
})();
const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
const CORE_IDS = CARDS.filter(c => c.set === 'core').map(c => c.id);
const RELIC_IDS = CARDS.filter(c => c.set === 'relic').map(c => c.id);
const DECK_SIZE = 20;
function setSize(set){ return CARDS.filter(c => c.set === set).length; }
function cardsOfRarity(rarity, ids){ return (ids || CARDS.map(c => c.id)).filter(id => CARD_BY_ID[id].rarity === rarity); }

const CARD_STAGES = {
  bomb: ['Choose a square to bomb'],
  shield: ['Choose one of your pieces to shield'],
  frost: ['Choose an enemy piece to freeze'],
  teleport: ['Choose your piece to teleport', 'Choose an empty destination'],
  poison: ['Choose an empty square to trap'],
  swap: ['Choose your first piece', 'Choose your second piece'],
  vanish: ['Choose one of your pieces to turn ghostly'],
  lightning: ['Tap any square in the file to strike'],
  resurrect: ['Choose an empty square on your half'],
  steal: ['Choose one of your pieces', 'Choose an adjacent enemy pawn'],
  wall: ['Choose an empty square to wall off'],
  disarm: ['Choose a glowing enemy effect to destroy'],
  march: ['Choose an enemy pawn to force forward'],
  clone: ['Choose your knight or bishop', 'Choose an empty adjacent square'],
  cards: ['Choose one of your pawns to sacrifice'],
  chain: ['Choose an enemy pawn to strike'],
  phoenix: ['Choose an empty square on your half'],
  blizzard: ['Choose the centre of the storm'],
  pegasus: ['Choose your piece to take flight', 'Choose where it lands'],
  ascension: ['Choose a pawn to ascend'],
  charm: ['Choose one of your pieces', 'Choose an adjacent enemy knight or bishop'],
  fireball: ['Choose an enemy pawn, knight or bishop'],
  scorch: ['Tap any square in the file to burn'],
  cinder: ['Choose an enemy pawn'],
  firewall: ['Choose the middle square of the fire wall'],
  dragonrage: ['Choose one of your pieces to roar'],
  deepfreeze: ['Choose an enemy piece to freeze solid'],
  aegis: ['Choose your first piece', 'Choose your second piece', 'Choose your third piece'],
  riptide: ['Choose one of your pieces', 'Choose the square beside it'],
  icebridge: ['Choose one of your pieces', 'Choose an empty square on the same rank'],
  recall: ['Choose one of your pieces', 'Choose an empty square on your back rank'],
  doppel: ['Choose an enemy knight, bishop or rook', 'Choose where the copy appears'],
  warpgate: ['Choose one of your pieces', 'Choose an enemy piece to swap with'],
  thornfield: ['Choose the first empty square', 'Choose the second empty square'],
};
function cardStageCount(id){ return (CARD_STAGES[id] || []).length; }

/* A deck is a list of 20 unique card ids. Shuffled for each game. */
function shuffleDeck(ids) {
  const deck = ids.slice();
  for (let i=deck.length-1;i>0;i--) { const j=(Math.random()*(i+1))|0; [deck[i],deck[j]]=[deck[j],deck[i]]; }
  return deck;
}
function autoDeck(owned) {
  const pool = owned && owned.length ? owned.slice() : CORE_IDS.slice();
  return shuffleDeck(pool).slice(0, DECK_SIZE);
}
