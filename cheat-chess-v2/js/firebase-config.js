/* =========================================================================
   The Firebase project this game talks to.

   These values are not secrets. They identify the project and are meant to
   ship inside the app; anyone can read them out of any Firebase app. What
   stops a stranger touching your data is the database rules, which allow a
   player to read only the match they are in and write only their own moves.

   The database lives in europe-west1. Nothing connects to it until the backend
   lands; until then the game runs entirely on the device.
   ========================================================================= */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBdeoORZEYEwX4VfYH4GAwifOpvz431HX8',
  authDomain: 'cheat-chess.firebaseapp.com',
  projectId: 'cheat-chess',
  storageBucket: 'cheat-chess.firebasestorage.app',
  messagingSenderId: '665740642003',
  appId: '1:665740642003:web:366b1fb389457a5a3fb626',
  databaseURL: 'https://cheat-chess-default-rtdb.europe-west1.firebasedatabase.app',
};

/* Nothing connects until the database is set up and the backend lands. */
function firebaseReady(){ return !!FIREBASE_CONFIG.databaseURL; }
