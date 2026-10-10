/* =========================================================================
   CHEAT CHESS: the Firebase side of Friends.

   Two things live here, both behind interfaces the rest of the game already
   uses, so nothing above them knows Firebase exists:

     FirebaseBackend()    what Account talks to: identity, codes, requests,
                          the friends list, and the save in the cloud
     FirebaseTransport()  what Net talks to: one match, its actions, presence

   The SDK is vendored in www/vendor/firebase and loaded only when a friends
   feature is first used, so the game still starts instantly, still works with
   no connection, and still makes no network request at all until you ask it to.
   ========================================================================= */

const FIREBASE_SDK = [
  'vendor/firebase/firebase-app-compat.js',
  'vendor/firebase/firebase-auth-compat.js',
  'vendor/firebase/firebase-database-compat.js',
];

let _sdkLoad = null;
function loadFirebase() {
  if (_sdkLoad) return _sdkLoad;
  _sdkLoad = (async () => {
    for (const src of FIREBASE_SDK) {
      await new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.onload = resolve;
        el.onerror = () => reject(new Error('could not load ' + src));
        document.head.append(el);
      });
    }
    if (!window.firebase) throw new Error('the Firebase SDK did not start');
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    return window.firebase;
  })().catch(e => { _sdkLoad = null; throw e; });
  return _sdkLoad;
}

/* Everything the game stores is reachable from these few paths. */
const DB = {
  player:   uid => 'players/' + uid,
  code:     code => 'codes/' + code,
  friends:  uid => 'friends/' + uid,
  friend:   (uid, other) => 'friends/' + uid + '/' + other,
  requests: uid => 'requests/' + uid,
  request:  (to, from) => 'requests/' + to + '/' + from,
  card:     uid => 'players/' + uid + '/card',
  save:     uid => 'saves/' + uid,
  invites:  uid => 'invites/' + uid,
  invite:   (to, id) => 'invites/' + to + '/' + id,
  match:    id => 'matches/' + id,
};

function FirebaseBackend() {
  let fb = null, db = null, uid = null, me = null;
  let liveOff = [];                 // listeners to drop on sign out
  let onChange = null;              // tells the screen to redraw

  const LOCAL = 'cheatchess.account.v1';
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL)) || null; } catch (e) { return null; } };
  const writeLocal = v => { try { localStorage.setItem(LOCAL, JSON.stringify(v)); } catch (e) {} };

  /* A code has to be unique, and claiming one is a race, so try a few. */
  async function claimCode(wanted) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = attempt === 0 && wanted ? wanted : randomCode();
      const ref = db.ref(DB.code(code));
      const res = await ref.transaction(current => (current === null ? uid : undefined));
      if (res.committed) return code;
    }
    return null;
  }

  async function connect() {
    fb = await loadFirebase();
    db = fb.database();
    const cred = fb.auth().currentUser || (await fb.auth().signInAnonymously()).user;
    uid = cred.uid;

    /* The record on the server is the truth; the local copy is a cache so the
       Friends screen can draw before the network answers. */
    const snap = await db.ref(DB.player(uid)).get();
    const cached = readLocal() || {};
    let record = snap.exists() ? snap.val() : null;
    if (!record) {
      const name = cached.name || randomName();
      const code = await claimCode(cached.code);
      if (!code) throw new Error('could not claim a friend code');
      record = { name, code, updatedAt: Date.now() };
      await db.ref(DB.player(uid)).set(record);
    }
    me = {
      id: uid, name: record.name, code: record.code,
      signedIn: !cred.isAnonymous,
      friends: [], incoming: [], outgoing: cached.outgoing || [],
    };
    writeLocal(me);
    watch();
    return me;
  }

  /* Live views of the list and of anything waiting on you. */
  function watch() {
    stopWatching();
    const asList = (snap, extra) => {
      const out = [];
      snap.forEach(c => { out.push({ id:c.key, ...c.val(), ...(extra || {}) }); });
      return out;
    };
    const fRef = db.ref(DB.friends(uid));
    const fCb = fRef.on('value', s => {
      me.friends = asList(s);
      /* anyone now on the list is no longer merely asked */
      me.friends.forEach(f => { me.outgoing = me.outgoing.filter(o => o.id !== f.id); });
      writeLocal(me);
      if (onChange) onChange();
    });
    const rRef = db.ref(DB.requests(uid));
    const rCb = rRef.on('value', s => {
      me.incoming = asList(s);
      writeLocal(me);
      if (onChange) onChange();
    });
    liveOff = [() => fRef.off('value', fCb), () => rRef.off('value', rCb)];
  }
  function stopWatching(){ liveOff.forEach(off => off()); liveOff = []; }

  return {
    kind: 'firebase',
    /* Account calls these synchronously, so they serve the cached copy and the
       live listeners keep it fresh. */
    load(){ return me || readLocal() || { id:'offline', name:randomName(), code:'------',
                                          signedIn:false, friends:[], incoming:[], outgoing:[] }; },
    save(v){ me = v; writeLocal(v); if (db && uid) db.ref(DB.player(uid)).update({ name:v.name, code:v.code, updatedAt:Date.now() }); },
    publish(){ /* the code index is written when a code is claimed */ },

    onChange(fn){ onChange = fn; },
    ready(){ return !!uid; },
    connect,

    async findByCode(code) {
      if (!db) return null;
      const snap = await db.ref(DB.code(code)).get();
      if (!snap.exists()) return null;
      const them = snap.val();
      if (them === uid) return null;
      const who = await db.ref(DB.player(them)).get();
      return who.exists() ? { id:them, name:who.val().name } : null;
    },

    /* Asking is a write into their requests, which the rules allow only under
       your own key. */
    async sendRequest(toUid, from) {
      await db.ref(DB.request(toUid, from.id)).set({ name:from.name, at:Date.now() });
      return true;
    },
    /* Accepting writes both halves: yours, and your entry in theirs. The rules
       allow the second only because their request to you exists. */
    async acceptRequest(theirUid, theirName) {
      const now = Date.now();
      await db.ref(DB.friend(uid, theirUid)).set({ name:theirName, since:now });
      await db.ref(DB.friend(theirUid, uid)).set({ name:me.name, since:now });
      await db.ref(DB.request(uid, theirUid)).remove();
      return true;
    },
    async declineRequest(theirUid){ await db.ref(DB.request(uid, theirUid)).remove(); },
    async removeFriend(theirUid) {
      await db.ref(DB.friend(uid, theirUid)).remove();
      try { await db.ref(DB.friend(theirUid, uid)).remove(); } catch (e) {}
    },
    async newCode(oldCode) {
      const code = await claimCode(null);
      if (!code) return null;
      await db.ref(DB.player(uid)).update({ code, updatedAt:Date.now() });
      if (oldCode) { try { await db.ref(DB.code(oldCode)).remove(); } catch (e) {} }
      return code;
    },

    /* ---------------------------------------------------- calling cards --
       Your card lives on your own record, which any signed in player can
       read; it holds shop ids and a level, never anything typed. */
    async publishCard(card) {
      if (!db || !uid) return false;
      await db.ref(DB.card(uid)).set(card);
      return true;
    },
    async getCard(id) {
      if (!db) return null;
      const snap = await db.ref(DB.card(id)).get();
      return snap.exists() ? snap.val() : null;
    },

    /* ----------------------------------------------------------- the save */
    async pushSave(snapshot){ await db.ref(DB.save(uid)).set(snapshot); },
    async pullSave() {
      const snap = await db.ref(DB.save(uid)).get();
      return snap.exists() ? snap.val() : null;
    },

    /* ------------------------------------------------------- sign in -- */
    async signIn() {
      try {
        fb = await loadFirebase();
        const provider = new fb.auth.GoogleAuthProvider();
        const current = fb.auth().currentUser;
        /* Linking keeps the same uid, so the friends list and the save survive. */
        const result = current && current.isAnonymous
          ? await current.linkWithPopup(provider)
          : await fb.auth().signInWithPopup(provider);
        me.signedIn = true;
        writeLocal(me);
        return { ok:true, id:result.user.uid };
      } catch (e) {
        const code = e && e.code || '';
        if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
          return { ok:false, reason:'That Google account already has a Cheat Chess save. Sign in on a fresh install to use it.' };
        }
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          return { ok:false, reason:'Sign in needs the installed app, not the browser version.' };
        }
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          return { ok:false, reason:'Sign in cancelled.' };
        }
        return { ok:false, reason:'Could not sign in just now.' };
      }
    },

    /* --------------------------------------------------------- matches -- */
    async createMatch(friend, myDeck) {
      const seed = (Math.random() * 0x100000000) >>> 0;
      const ref = db.ref('matches').push();
      const id = ref.key;
      /* the challenger takes Ivory, as the host */
      await ref.child('seats').set({ w:uid, b:friend.id });
      await ref.child('seed').set(seed);
      await ref.child('decks').set({ w:myDeck, b:myDeck });
      await ref.child('createdAt').set(Date.now());
      await ref.child('status').set('open');
      await db.ref(DB.invite(friend.id, id)).set({ from:uid, name:me.name, at:Date.now() });
      return { id, seat:'w', seed };
    },
    async openMatch(id) {
      const snap = await db.ref(DB.match(id)).get();
      if (!snap.exists()) return null;
      const m = snap.val();
      const seat = m.seats.w === uid ? 'w' : m.seats.b === uid ? 'b' : null;
      if (!seat) return null;
      return { id, seat, seed:m.seed, decks:m.decks, seats:m.seats };
    },
    watchInvites(fn) {
      const ref = db.ref(DB.invites(uid));
      const cb = ref.on('value', s => {
        const out = [];
        s.forEach(c => out.push({ matchId:c.key, ...c.val() }));
        fn(out);
      });
      return () => ref.off('value', cb);
    },
    async clearInvite(id){ await db.ref(DB.invite(uid, id)).remove(); },
    transport(matchId, seat){ return FirebaseTransport(db, matchId, seat, uid); },
  };
}

/* -------------------------------------------------------------------------
   One match as a transport. Actions are appended under a counter, which makes
   them ordered and replayable: a device that was closed catches up simply by
   reading the ones it has not seen.
   ------------------------------------------------------------------------- */
function FirebaseTransport(db, matchId, seat, uid) {
  const base = db.ref(DB.match(matchId));
  const actions = base.child('actions');
  const theirSeat = seat === 'w' ? 'b' : 'w';
  let listener = null, presenceCb = null, actionsCb = null, presRef = null, presSub = null;
  let next = 0;                 // the next slot I will write
  let applied = -1;             // the highest slot I have handed over

  /* I am here, and I am not here as soon as the connection drops. */
  presRef = base.child('presence').child(seat);
  presRef.set(Date.now());
  presRef.onDisconnect().remove();
  const beat = setInterval(() => presRef.set(Date.now()), 25000);

  return {
    send(action) {
      const slot = Math.max(next, applied + 1);
      next = slot + 1;
      const payload = { by:uid, kind:action.kind, at:Date.now() };
      if (action.kind === 'move') payload.mv = action.mv;
      if (action.kind === 'card') { payload.id = action.id; payload.picks = action.picks || []; }
      if (action.kind === 'quit') payload.reason = action.reason || 'resign';
      actions.child(String(slot)).set(payload).catch(e => console.warn('[net] could not post', e));
    },
    onAction(fn) {
      listener = fn;
      actionsCb = actions.on('child_added', snap => {
        const slot = Number(snap.key);
        const a = snap.val();
        if (slot > next - 1) next = slot + 1;       // keep my counter ahead
        if (a.by === uid) return;                   // my own, already applied
        if (slot <= applied) return;
        applied = slot;
        if (listener) listener({ ...a, seq:slot });
      });
    },
    onPresence(fn) {
      presenceCb = fn;
      const ref = base.child('presence').child(theirSeat);
      presSub = ref.on('value', s => {
        const at = s.val();
        fn(!!at && (at === true || Date.now() - at < 70000));
      });
      presSub = () => ref.off('value', presSub);
    },
    close() {
      clearInterval(beat);
      if (actionsCb) actions.off('child_added', actionsCb);
      if (typeof presSub === 'function') presSub();
      try { presRef.remove(); } catch (e) {}
    },
  };
}
