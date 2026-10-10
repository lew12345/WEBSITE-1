/* =========================================================================
   CHEAT CHESS identity and friends.

   Who you are is one stable id. Playing anonymously generates it; signing in
   with Google later links that same id to the account rather than replacing it,
   so a friends list and a save survive a new phone.

   Nothing here is free text. Your display name is drawn from a word list and
   your friend code is generated, so adding a friend can never carry a typed
   message. That keeps the game clear of user generated content rules.

   Everything talks to a backend, so the game does not care where the data
   lives. LocalBackend keeps it in this device's storage, which is what runs
   today and what the tests use. A Firebase backend implements the same handful
   of methods and nothing above this line changes.
   ========================================================================= */

/* Codes a person has to read off one screen and type into another: no O/0,
   no I/1/L, no U (it reads as V in some fonts). */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
const CODE_LEN = 6;

const NAME_FIRST = ['Crimson', 'Ivory', 'Gilded', 'Shadow', 'Emerald', 'Frost', 'Ember',
                    'Amber', 'Obsidian', 'Silver', 'Violet', 'Storm', 'Runic', 'Dusk'];
const NAME_SECOND = ['Knight', 'Rook', 'Bishop', 'Gambit', 'Warden', 'Herald', 'Sentinel',
                     'Marshal', 'Reaver', 'Oracle', 'Paladin', 'Templar'];

function randomCode() {
  let out = '';
  for (let i = 0; i < CODE_LEN; i++) out += CODE_ALPHABET[(Math.random() * CODE_ALPHABET.length) | 0];
  return out;
}
/* Shown as ARLO-XXX-XXX; typed in any case, with or without the dashes. */
function formatCode(code){ return 'ARLO-' + code.slice(0, 3) + '-' + code.slice(3); }
function normaliseCode(text) {
  const up = String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = up.startsWith('ARLO') ? up.slice(4) : up;
  return body.slice(0, CODE_LEN);
}
function randomName() {
  const a = NAME_FIRST[(Math.random() * NAME_FIRST.length) | 0];
  const b = NAME_SECOND[(Math.random() * NAME_SECOND.length) | 0];
  return a + ' ' + b;
}

/* -------------------------------------------------------------------------
   A backend holds the player's own record, a way to find someone by code, and
   the friend requests between them. These are the only methods a real backend
   has to provide.
   ------------------------------------------------------------------------- */
function LocalBackend(storeKey) {
  const KEY = storeKey || 'cheatchess.account.v1';
  /* The directory belongs to everyone, not to one player: on a real backend it
     is a shared collection of codes. It stays on a fixed key so two accounts on
     one machine can find each other, which is how the tests run. */
  const DIR = 'cheatchess.directory.v1';
  const read = k => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* The cards everybody has published. On a real backend this is a child of
     each player's own record; locally one shared key stands in for that. */
  const CARDS = 'cheatchess.cards.v1';

  return {
    kind: 'local',
    load() {
      let me = read(KEY);
      if (!me) {
        me = { id:'local-' + randomCode() + randomCode(), code:randomCode(), name:randomName(),
               signedIn:false, friends:[], incoming:[], outgoing:[], snapshotAt:null };
        write(KEY, me);
      }
      return me;
    },
    save(me){ write(KEY, me); },

    /* The directory is a development stand in for "look this code up". A real
       backend queries the codes collection instead. */
    publish(me) {
      const dir = read(DIR) || {};
      dir[me.code] = { id:me.id, name:me.name };
      write(DIR, dir);
    },
    findByCode(code) {
      const dir = read(DIR) || {};
      return dir[code] || null;
    },
    /* Posting a request to someone else. Locally there is nobody to receive
       it, so a test drives the far side itself. */
    sendRequest(){ return true; },

    publishCard(card) {
      const mine = read(KEY);
      if (!mine) return true;
      const all = read(CARDS) || {};
      all[mine.id] = card;
      write(CARDS, all);
      return true;
    },
    getCard(id){ return (read(CARDS) || {})[id] || null; },

    /* On a real backend these write to the other player too. Locally the
       caller's own bookkeeping is the whole story. */
    acceptRequest(){ return true; },
    declineRequest(){ return true; },
    removeFriend(){ return true; },
    signIn(){ return { ok:false, reason:'Google sign in arrives with the online update.' }; },
  };
}

const Account = (() => {
  let backend = LocalBackend();
  let me = backend.load();
  backend.publish(me);

  function persist(){ backend.save(me); backend.publish(me); }

  /* ----------------------------------------------------- calling cards
     What a friend sees of you: the champion, the hall he stands in and your
     rank. All of it is ids from the shop plus one number, so looking somebody
     up can never show you something they typed. */
  const cards = new Map();        // id -> card, or null for nothing published
  const asked = new Set();        // ids already fetched once
  let published = '';             // the last card sent, to avoid rewriting it

  function myCard() {
    const d = Progress.data, a = d.avatar || DEFAULT_AVATAR;
    return {
      v:1,
      body:a.body || 'a', skin:a.skin | 0, hair:a.hair || 'crop', hairColor:a.hairColor | 0,
      gear:a.gear || 'none', pet:a.pet || 'none',
      pieces:(d.equipped && d.equipped.pieces) || 'classic',
      hall:(d.equipped && d.equipped.hall) || 'stone',
      carpet:(d.equipped && d.equipped.carpet) || 'none',
      crest:(d.equipped && d.equipped.crest) || 'pawn',
      lv:playerLevel(), xp:d.xp.lifetime | 0, imm:isImmortal() ? 1 : 0,
      at:Date.now(),
    };
  }

  return {
    attach(b){ backend = b; me = backend.load(); if (backend.publish) backend.publish(me); },
    get backendKind(){ return backend.kind; },
    /* A networked backend has to reach the server before anything is true. */
    async connect() {
      if (!backend.connect) return { ok:true, local:true };
      try {
        me = await backend.connect();
        if (backend.onChange) backend.onChange(() => { me = backend.load(); if (Account.onUpdate) Account.onUpdate(); });
        this.publishCard();
        return { ok:true };
      } catch (e) {
        return { ok:false, reason:(e && e.message) || 'could not reach the server' };
      }
    },
    onUpdate: null,
    get id(){ return me.id; },
    get name(){ return me.name; },
    get code(){ return me.code; },
    get prettyCode(){ return formatCode(me.code); },
    get signedIn(){ return !!me.signedIn; },

    rename(){ me.name = randomName(); persist(); return me.name; },
    /* If a code gets shared too widely, a new one retires the old. Friends
       already on the list are unaffected: they are held by id, not by code. */
    async newCode() {
      if (backend.newCode) {
        const code = await backend.newCode(me.code);
        if (!code) return null;
        me.code = code;
      } else me.code = randomCode();
      persist();
      return formatCode(me.code);
    },

    /* ------------------------------------------------------- calling card */
    myCard,
    /* Sent on connecting and whenever your champion or your hall changes.
       Unchanged cards are not rewritten. */
    async publishCard() {
      if (!backend.publishCard) return { ok:false, local:true };
      const card = myCard();
      const key = JSON.stringify({ ...card, at:0 });
      if (key === published) return { ok:true, same:true };
      published = key;
      cards.set(me.id, card);
      try { await backend.publishCard(card); return { ok:true }; }
      catch (e) { published = ''; return { ok:false }; }
    },
    /* A card if it is to hand, undefined while it is still coming, null when
       they have never published one. Drawing code redraws on onUpdate. */
    cardFor(id) {
      if (cards.has(id)) return cards.get(id);
      if (!backend.getCard || asked.has(id)) return undefined;
      asked.add(id);
      Promise.resolve(backend.getCard(id))
        .then(c => { cards.set(id, c || null); if (Account.onUpdate) Account.onUpdate(); })
        .catch(() => { cards.set(id, null); });
      return undefined;
    },
    forgetCards(){ cards.clear(); asked.clear(); },

    /* ------------------------------------------------------------ friends */
    friends(){ return me.friends.slice(); },
    incoming(){ return me.incoming.slice(); },
    outgoing(){ return me.outgoing.slice(); },
    isFriend(id){ return me.friends.some(f => f.id === id); },

    /* Adding is mutual: this sends a request, it does not make a friend. */
    async request(text) {
      const code = normaliseCode(text);
      if (code.length !== CODE_LEN) return { ok:false, reason:'That code is not complete.' };
      if (code === me.code) return { ok:false, reason:'That is your own code.' };
      const found = await backend.findByCode(code);
      if (!found) return { ok:false, reason:'No player with that code.' };
      if (this.isFriend(found.id)) return { ok:false, reason:`${found.name} is already on your list.` };
      if (me.outgoing.some(o => o.id === found.id)) return { ok:false, reason:'You have already asked them.' };
      /* if they asked you first, this accepts instead */
      const already = me.incoming.find(i => i.id === found.id);
      if (already) return this.accept(found.id);
      me.outgoing.push({ id:found.id, name:found.name, at:Date.now() });
      persist();
      try { await backend.sendRequest(found.id, { id:me.id, name:me.name }); }
      catch (e) {
        me.outgoing = me.outgoing.filter(o => o.id !== found.id);
        persist();
        return { ok:false, reason:'Could not send that just now.' };
      }
      return { ok:true, sent:true, name:found.name };
    },
    /* Called when a request arrives from the backend. */
    receiveRequest(from) {
      if (!from || this.isFriend(from.id) || me.incoming.some(i => i.id === from.id)) return false;
      const mutual = me.outgoing.find(o => o.id === from.id);
      if (mutual) { this.accept(from.id, from); return true; }
      me.incoming.push({ id:from.id, name:from.name, at:Date.now() });
      persist();
      return true;
    },
    async accept(id, info) {
      const req = me.incoming.find(i => i.id === id) || me.outgoing.find(o => o.id === id) || info;
      if (!req) return { ok:false, reason:'That request has gone.' };
      me.incoming = me.incoming.filter(i => i.id !== id);
      me.outgoing = me.outgoing.filter(o => o.id !== id);
      if (!this.isFriend(id)) me.friends.push({ id, name:req.name, since:Date.now() });
      persist();
      try { await backend.acceptRequest(id, req.name); } catch (e) { return { ok:false, reason:'Could not accept just now.' }; }
      return { ok:true, name:req.name };
    },
    async decline(id) {
      me.incoming = me.incoming.filter(i => i.id !== id);
      persist();
      try { await backend.declineRequest(id); } catch (e) {}
      return { ok:true };
    },
    async remove(id) {
      me.friends = me.friends.filter(f => f.id !== id);
      persist();
      try { await backend.removeFriend(id); } catch (e) {}
      return { ok:true };
    },

    /* ------------------------------------------------------- save and sync
       The device keeps playing from its own save, so the game works with no
       connection. A snapshot goes up when signed in. */
    snapshot() {
      const d = Progress.data;
      return { v:1, at:Date.now(), lifetime:d.xp.lifetime, data:JSON.parse(JSON.stringify(d)) };
    },
    /* Two saves cannot be merged safely, so the fuller one wins. Lifetime
       Gambits only ever rise, which makes them an honest measure of fuller. */
    chooseSave(local, remote) {
      if (!remote) return { pick:'local', why:'nothing stored yet' };
      if (!local) return { pick:'remote', why:'no save on this device' };
      if (remote.lifetime > local.lifetime) return { pick:'remote', why:'your account is further on' };
      if (remote.lifetime < local.lifetime) return { pick:'local', why:'this device is further on' };
      return { pick:'local', why:'both are level' };
    },
    /* Push on sign in and after a game; pull on a fresh install. */
    async backup() {
      if (!backend.pushSave) return { ok:false, local:true };
      try { await backend.pushSave(this.snapshot()); return { ok:true }; }
      catch (e) { return { ok:false }; }
    },
    async restore() {
      if (!backend.pullSave) return { ok:false, local:true };
      let remote = null;
      try { remote = await backend.pullSave(); } catch (e) { return { ok:false }; }
      const local = { lifetime: Progress.data.xp.lifetime };
      const choice = this.chooseSave(local, remote);
      if (choice.pick === 'remote' && remote && remote.data) {
        Progress.data = Object.assign(Progress.data, remote.data);
        Progress.save();
      }
      return { ok:true, ...choice };
    },
    async signIn() {
      const res = await backend.signIn();
      if (res && res.ok) { me.signedIn = true; me.id = res.id || me.id; persist(); }
      return res;
    },
  };
})();
