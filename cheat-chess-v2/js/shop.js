/* =========================================================================
   CHEAT CHESS shop. Everything here is cosmetic only: it never changes the
   rules, the cards or the odds.
     price            bought with Gambits earned in play
     needsAll         also needs every challenge completed first
     premium          in the Legendary Pack, bought once with real money
   Outfits and armour share one gear slot, so wearing one replaces the other.
   ========================================================================= */
const SHOP = {
  pieces: [
    { id:'classic',   name:'Ivory and Obsidian', price:0,    desc:'The set every player starts with.' },
    { id:'bone',      name:'Old Bone',           price:1200, desc:'Carved from something that used to walk.' },
    { id:'emerald',   name:'Emerald Court',      price:1800, desc:'Jade pieces veined with gold.' },
    { id:'frost',     name:'Frostglass',         price:2200, desc:'Cut from a frozen lake at midnight.' },
    { id:'amethyst',  name:'Amethyst Circle',    price:2400, desc:'Violet crystal that hums faintly.' },
    { id:'gold',      name:'Royal Gold',         price:3200, desc:'Heavy, polished and utterly smug.' },
    { id:'infernal',  name:'Infernal Legion',    premium:true, desc:'Molten pieces wreathed in living flame.' },
    { id:'celestial', name:'Celestial Host',     premium:true, desc:'Starlight given the shape of an army.' },
  ],
  outfits: [
    { id:'none',       name:'Training Wraps', price:0,    desc:'What every recruit starts in.' },
    { id:'ranger',     name:'Ranger Leathers', price:700,  desc:'Quiet boots, a pawn on the buckle.' },
    { id:'mage',       name:'Mage Robes',      price:1300, desc:'Violet and gold, chess sigils on the hem.' },
    { id:'royal',      name:'Royal Doublet',   price:2100, desc:'Crimson and gold, a crown on the chest.' },
    { id:'wanderer',   name:"Wanderer's Cloak", price:2200, desc:'Hood up, face in shadow, a carved pawn on the cord.', hood:true },
    { id:'nightfall',  name:'Nightfall Cloak', price:4500, needsAll:true, desc:'Black and gold, worn only by those who finished every challenge.', hood:true },
    { id:'void',       name:'Void Regalia',    premium:true, desc:'Violet light in the seams, two glowing eyes in the dark.', hood:true },
    { id:'emberlight', name:'Emberlight Regalia', premium:true, desc:'Mint runes burning down the sleeves, a glowing knight sigil.', hood:true },
  ],
  armour: [
    { id:'steel',      name:'Steel Plate',     price:1400, desc:'Rook battlements on the shoulders.' },
    { id:'emerald',    name:'Emerald Mail',    price:2400, desc:'Green scale and gold, a bishop mitre crest.' },
    { id:'darkiron',   name:'Dark Iron',       price:3000, desc:'Knight horse heads on the pauldrons.' },
    { id:'halfhelm',   name:'Half Helm Plate', price:1800, desc:'Open faced helm, checkerboard belt.' },
    { id:'silver',     name:'Silver Plate',    price:3200, desc:'A full closed helm and a narrow visor.' },
    { id:'gilded',     name:'Gilded Plate',    price:5500, needsAll:true, desc:'Gold crown crest. Only for a finished challenge board.' },
    { id:'runestone',  name:'Runestone Guard', premium:true, desc:'Carved stone with deep blue runes burning in the cracks.' },
    { id:'amberhorn',  name:'Amberhorn Guard', premium:true, desc:'Horned black metal with amber light in the joints.' },
  ],
  pets: [
    { id:'none',       name:'No Companion', price:0,    desc:'Travelling light.' },
    { id:'wisp',       name:'Wisp',         price:1200, desc:'A polite ball of light.' },
    { id:'cat',        name:'Cat',          price:1900, desc:'Sits on the board. Always.' },
    { id:'dog',        name:'Hound',        price:1900, desc:'Fetches pieces you did not want fetched.' },
    { id:'owl',        name:'Owl',          price:2600, desc:'Judges your openings.' },
    { id:'dragonling', name:'Baby Dragon',  price:3600, desc:'Small, smug, extremely flammable.' },
    { id:'dragon',     name:'Elder Dragon', premium:true, desc:'Full grown, deep crimson, and completely unbothered by rules.' },
  ],
};
/* One purchase unlocks every Legendary item. Change the price here and in the Play Console. */
const LEGENDARY_PACK = {
  productId:'cc_legendary_pack',
  price:'2.99',
  name:'Legendary Pack',
  blurb:'Every Legendary item in one go: two chess sets, two regalia, two suits of armour and the Elder Dragon. Looks only, no advantage in a game.',
  /* the three shown on the banner, one from each of the main slots */
  showcase:[{ tab:'pieces', id:'infernal' }, { tab:'armour', id:'runestone' }, { tab:'outfits', id:'void' }],
};
function legendaryItems() {
  return Object.entries(SHOP).flatMap(([tab, list]) => list.filter(i => i.premium).map(i => ({ tab, ...i })));
}
function ownsPack(){ return !!Progress.data.owned.legendaryPack; }
function allChallengesDone(){ return ACHIEVEMENTS.every(a => Progress.data.achieved[a.id]); }

const SHOP_TABS = [
  { key:'armour',  name:'Armour' },
  { key:'outfits', name:'Outfits' },
  { key:'pieces',  name:'Chess Sets' },
  { key:'pets',    name:'Companions' },
];
/* outfits and armour both fill the gear slot, so they share one owned list */
const SLOT_OF = { pieces:'pieces', armour:'gear', outfits:'gear', pets:'pets' };
function shopItem(tab, id){ return SHOP[tab].find(i => i.id === id); }
function ownsItem(tab, id) {
  const item = shopItem(tab, id);
  if (item && item.premium) return ownsPack();
  return (Progress.data.owned[SLOT_OF[tab]] || []).includes(id);
}
function itemLocked(tab, id) {
  const item = shopItem(tab, id);
  return !!(item && item.needsAll && !allChallengesDone() && !ownsItem(tab, id));
}
function equippedItem(tab) {
  const av = Progress.data.avatar || DEFAULT_AVATAR;
  return tab === 'pieces' ? Progress.data.equipped.pieces : tab === 'pets' ? av.pet : av.gear;
}
function equipItem(tab, id) {
  const P = Progress.data;
  if (tab === 'pieces') P.equipped.pieces = id;
  else {
    P.avatar = { ...(P.avatar || DEFAULT_AVATAR) };
    if (tab === 'pets') P.avatar.pet = id; else P.avatar.gear = id;
  }
  Progress.save();
}
function buyItem(tab, id) {
  const item = shopItem(tab, id);
  if (!item || item.premium || ownsItem(tab, id) || itemLocked(tab, id)) return false;
  if (!spendGambits(item.price)) return false;
  Progress.data.owned[SLOT_OF[tab]].push(id);
  Progress.save();
  return true;
}

/* The Legendary Pack needs Google Play Billing, which lives in the Android
   project, not here. Until that is wired up the shop says it is not on sale yet.
   See BUILD-GUIDE.md. */
/* Testers have no Play billing, so the pack button hands the items over. Turn this
   off before a release build, or the pack is free on the web version. */
const TEST_UNLOCK = true;

const Billing = {
  available() {
    const cap = window.Capacitor && window.Capacitor.Plugins;
    return !!(cap && cap.GooglePlayBilling);
  },
  grantPack() {
    Progress.data.owned.legendaryPack = true;
    Progress.save();
  },
  async buyPack() {
    if (ownsPack()) return { ok:true };
    if (!this.available()) {
      /* TEST BUILD: no Play billing here, so the button just unlocks the pack so
         testers can see the Legendary items. Set TEST_UNLOCK to false for release. */
      if (TEST_UNLOCK) { this.grantPack(); return { ok:true, test:true }; }
      return { ok:false, reason:'The Legendary Pack is not on sale yet. It is coming in a future update.' };
    }
    try {
      const res = await window.Capacitor.Plugins.GooglePlayBilling.purchase({ productId:LEGENDARY_PACK.productId });
      if (res && res.purchased) { this.grantPack(); return { ok:true }; }
      return { ok:false, reason:'Purchase cancelled.' };
    } catch (e) {
      return { ok:false, reason:'That purchase could not be completed.' };
    }
  },
  /* Call on start-up so a pack bought on another device comes back. */
  async restore() {
    if (!this.available()) return;
    try {
      const res = await window.Capacitor.Plugins.GooglePlayBilling.getPurchases();
      const owned = (res && res.purchases || []).some(x => x.productId === LEGENDARY_PACK.productId);
      if (owned) this.grantPack();
    } catch (e) {}
  },
};
