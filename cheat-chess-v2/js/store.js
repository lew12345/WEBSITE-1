/* =========================================================================
   CHEAT CHESS: settings, stats (saved on the device) and haptics.
   ========================================================================= */
const Store = (() => {
  const KEY_SET = 'cheatchess.settings.v1', KEY_STATS = 'cheatchess.stats.v1';
  const DEFAULT_SETTINGS = { sfx:true, music:true, haptics:true, hints:true, boardTheme:'jade', fastAi:false, flipBoard:true, seenRules:false };
  const DEFAULT_STATS = {
    games:0, pvp:0, cardsPlayed:0, streak:0, bestStreak:0, fastestWin:null,
    ai: { easy:{w:0,l:0,d:0}, medium:{w:0,l:0,d:0}, hard:{w:0,l:0,d:0} },
    cardUse: {},
  };
  const read = (k, def) => {
    try { const v = JSON.parse(localStorage.getItem(k)); return v ? deepMerge(structuredClone(def), v) : structuredClone(def); }
    catch (e) { return structuredClone(def); }
  };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function deepMerge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') deepMerge(a[k], b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  const settings = read(KEY_SET, DEFAULT_SETTINGS);
  const stats = read(KEY_STATS, DEFAULT_STATS);
  return {
    settings, stats,
    saveSettings(){ write(KEY_SET, settings); },
    saveStats(){ write(KEY_STATS, stats); },
    resetStats(){ Object.assign(stats, structuredClone(DEFAULT_STATS)); write(KEY_STATS, stats); },
  };
})();

const Haptics = {
  pulse(kind) {
    if (!Store.settings.haptics) return;
    const cap = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
    try {
      if (cap) {
        if (kind === 'heavy') cap.impact({ style:'HEAVY' });
        else if (kind === 'medium') cap.impact({ style:'MEDIUM' });
        else cap.impact({ style:'LIGHT' });
        return;
      }
      if (navigator.vibrate) navigator.vibrate(kind === 'heavy' ? 60 : kind === 'medium' ? 30 : 12);
    } catch (e) {}
  },
};
