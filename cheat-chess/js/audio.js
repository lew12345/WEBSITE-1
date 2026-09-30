/* =========================================================================
   CHEAT CHESS: procedural sound effects + ambient music (Web Audio API).
   Everything is synthesised in code, so there are no audio files or licences.
   ========================================================================= */
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, reverb, noiseBuf;
  let musicOn = false, musicTimer = null, nextChordAt = 0, chordIdx = 0, nextPluckAt = 0;
  let sfxEnabled = true, musicEnabled = true;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.0; musicBus.connect(master);
    // generated reverb impulse
    reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.8, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch=0; ch<2; ch++) {
      const d = imp.getChannelData(ch);
      for (let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.6);
    }
    reverb.buffer = imp;
    const revGain = ctx.createGain(); revGain.gain.value = 0.55;
    reverb.connect(revGain); revGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i=0;i<nd.length;i++) nd[i] = Math.random()*2-1;
    if (musicEnabled && musicOn) startMusic();
  }

  const now = () => ctx.currentTime;

  function env(g, t, a, peak, d, sustain=0.0001) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(sustain, t + a + d);
  }
  function tone({ type='sine', f=440, f2=null, t=0, a=0.005, d=0.2, vol=0.2, rev=0, bus=sfxBus, detune=0 }) {
    const st = now() + t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, st); o.detune.value = detune;
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, st + a + d);
    env(g, st, a, vol, d);
    o.connect(g); g.connect(bus);
    if (rev) { const s = ctx.createGain(); s.gain.value = rev; g.connect(s); s.connect(reverb); }
    o.start(st); o.stop(st + a + d + 0.05);
  }
  function noise({ t=0, a=0.005, d=0.2, vol=0.2, filter='bandpass', f=1000, f2=null, q=1, rev=0 }) {
    const st = now() + t;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = filter; fl.frequency.setValueAtTime(f, st); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, st + a + d);
    const g = ctx.createGain(); env(g, st, a, vol, d);
    src.connect(fl); fl.connect(g); g.connect(sfxBus);
    if (rev) { const s = ctx.createGain(); s.gain.value = rev; g.connect(s); s.connect(reverb); }
    src.start(st); src.stop(st + a + d + 0.05);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // midi → Hz

  const SFX = {
    tap:     () => tone({ type:'triangle', f:900, f2:700, d:0.05, vol:0.08 }),
    select:  () => { tone({ type:'sine', f:N(84), d:0.12, vol:0.08, rev:0.3 }); },
    move:    () => { tone({ type:'triangle', f:190, f2:95, d:0.1, vol:0.35 }); noise({ f:2400, d:0.03, vol:0.12, filter:'highpass' }); },
    capture: () => { tone({ type:'triangle', f:160, f2:60, d:0.18, vol:0.45 }); noise({ f:900, d:0.14, vol:0.25, q:2 }); tone({ type:'triangle', f:220, f2:110, t:0.06, d:0.1, vol:0.2 }); },
    whoosh:  () => noise({ f:350, f2:2600, a:0.12, d:0.22, vol:0.22, q:1.4 }),
    flip:    () => { noise({ f:3500, d:0.04, vol:0.15, filter:'highpass' }); tone({ type:'sine', f:N(88), d:0.18, vol:0.06, rev:0.4 }); },
    reveal:  () => { [76,83,88].forEach((n,i) => tone({ type:'sine', f:N(n), t:i*0.07, d:0.6, vol:0.09, rev:0.7 })); },
    deal:    () => { noise({ f:600, f2:3000, a:0.05, d:0.12, vol:0.14, q:1.2 }); },
    cast:    () => { [69,72,76,81,84,88].forEach((n,i) => tone({ type:'triangle', f:N(n), t:i*0.05, d:0.5, vol:0.08, rev:0.8 })); noise({ f:4000, f2:9000, a:0.2, d:0.4, vol:0.05, filter:'highpass', rev:0.6 }); },
    boom:    () => { noise({ filter:'lowpass', f:1200, f2:80, a:0.01, d:1.1, vol:0.7 }); tone({ type:'sine', f:90, f2:30, d:0.9, vol:0.6 }); },
    zap:     () => { tone({ type:'sawtooth', f:1800, f2:120, d:0.35, vol:0.18 }); noise({ f:5000, d:0.3, vol:0.2, filter:'highpass' }); tone({ type:'sine', f:60, f2:40, t:0.05, d:0.5, vol:0.4 }); },
    freeze:  () => { [96,91,100,93].forEach((n,i) => tone({ type:'sine', f:N(n), t:i*0.06, d:0.4, vol:0.06, rev:0.8 })); noise({ f:7000, d:0.5, vol:0.05, filter:'highpass', rev:0.5 }); },
    ward:    () => { tone({ type:'sine', f:N(64), f2:N(76), a:0.1, d:0.6, vol:0.12, rev:0.8 }); tone({ type:'triangle', f:N(71), t:0.08, d:0.6, vol:0.06, rev:0.8 }); },
    poison:  () => { [0,1,2,3].forEach(i => tone({ type:'sine', f:300+Math.random()*500, f2:900, t:i*0.07, d:0.08, vol:0.08 })); },
    portal:  () => { tone({ type:'sine', f:200, f2:1600, a:0.05, d:0.45, vol:0.12, rev:0.8 }); tone({ type:'sine', f:1600, f2:200, t:0.25, d:0.45, vol:0.08, rev:0.8 }); },
    rumble:  () => { noise({ filter:'lowpass', f:300, f2:60, a:0.1, d:1.2, vol:0.6 }); tone({ type:'sine', f:45, d:1.2, vol:0.4 }); },
    stone:   () => { noise({ filter:'lowpass', f:600, f2:100, d:0.4, vol:0.5 }); tone({ type:'triangle', f:110, f2:55, d:0.3, vol:0.3 }); },
    shatter: () => { for (let i=0;i<6;i++) tone({ type:'triangle', f:2000+Math.random()*3000, t:i*0.025, d:0.12, vol:0.06 }); noise({ f:6000, d:0.25, vol:0.15, filter:'highpass' }); },
    clock:   () => { [0,1,2,3].forEach(i => tone({ type:'square', f:1500, t:i*0.09, d:0.02, vol:0.04 })); tone({ type:'sine', f:N(79), f2:N(67), t:0.3, d:0.5, vol:0.1, rev:0.7 }); },
    check:   () => { tone({ type:'sine', f:880, d:0.8, vol:0.14, rev:0.5 }); tone({ type:'sine', f:1318, d:0.6, vol:0.07, rev:0.5 }); tone({ type:'sine', f:1760*1.01, d:0.4, vol:0.04, rev:0.5 }); },
    error:   () => tone({ type:'square', f:140, d:0.14, vol:0.06 }),
    win:     () => { [60,64,67,72,76,79,84].forEach((n,i) => { tone({ type:'triangle', f:N(n), t:i*0.1, d:0.7, vol:0.1, rev:0.6 }); tone({ type:'sine', f:N(n+12), t:i*0.1, d:0.5, vol:0.04, rev:0.6 }); }); },
    lose:    () => { [69,65,62,57].forEach((n,i) => tone({ type:'triangle', f:N(n), t:i*0.22, d:0.8, vol:0.1, rev:0.7 })); },
    draw:    () => { [67,69,67,64].forEach((n,i) => tone({ type:'triangle', f:N(n), t:i*0.16, d:0.6, vol:0.08, rev:0.6 })); },
  };

  function play(name) {
    if (!sfxEnabled || !ctx || ctx.state !== 'running') return;
    try { SFX[name] && SFX[name](); } catch (e) {}
  }

  /* --- ambient music: slow pads in A minor + pentatonic plucks, scheduled ahead --- */
  const CHORDS = [[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67],[57,60,64,72],[50,57,60,65],[52,55,59,64],[52,56,59,64]];
  const PLUCK = [69,72,74,76,79,81,84];
  const CHORD_LEN = 6.4;
  function schedule() {
    if (!ctx || !musicOn) return;
    const horizon = now() + 1.5;
    while (nextChordAt < horizon) {
      const ch = CHORDS[chordIdx % CHORDS.length];
      ch.forEach((n, i) => {
        const st = nextChordAt;
        for (const det of [-6, 6]) {
          const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
          o.type = i === 0 ? 'sine' : 'triangle';
          o.frequency.value = N(n - (i === 0 ? 12 : 0)); o.detune.value = det;
          lp.type = 'lowpass'; lp.frequency.value = 900;
          g.gain.setValueAtTime(0.0001, st);
          g.gain.linearRampToValueAtTime(i === 0 ? 0.05 : 0.022, st + 2.2);
          g.gain.linearRampToValueAtTime(0.0001, st + CHORD_LEN + 1.6);
          o.connect(lp); lp.connect(g); g.connect(musicBus);
          const s = ctx.createGain(); s.gain.value = 0.6; g.connect(s); s.connect(reverb);
          o.start(st); o.stop(st + CHORD_LEN + 1.8);
        }
      });
      chordIdx++;
      nextChordAt += CHORD_LEN;
    }
    while (nextPluckAt < horizon) {
      const n = PLUCK[(Math.random()*PLUCK.length)|0];
      const st = nextPluckAt;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = N(n);
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.035, st + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, st + 1.6);
      o.connect(g); g.connect(musicBus);
      const s = ctx.createGain(); s.gain.value = 0.9; g.connect(s); s.connect(reverb);
      o.start(st); o.stop(st + 1.7);
      nextPluckAt += 0.8 + Math.random() * 2.2;
    }
  }
  function startMusic() {
    musicOn = true;
    if (!ctx || !musicEnabled) return;
    if (musicTimer) return;
    nextChordAt = Math.max(nextChordAt, now() + 0.1);
    nextPluckAt = Math.max(nextPluckAt, now() + 1.5);
    musicBus.gain.cancelScheduledValues(now());
    musicBus.gain.setValueAtTime(musicBus.gain.value, now());
    musicBus.gain.linearRampToValueAtTime(0.9, now() + 2);
    schedule();
    musicTimer = setInterval(schedule, 400);
  }
  function stopMusic() {
    if (!ctx || !musicTimer) return;
    clearInterval(musicTimer); musicTimer = null;
    musicBus.gain.cancelScheduledValues(now());
    musicBus.gain.setValueAtTime(musicBus.gain.value, now());
    musicBus.gain.linearRampToValueAtTime(0.0001, now() + 0.8);
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  return {
    init, play,
    startMusic,
    setSfx(on){ sfxEnabled = on; },
    setMusic(on){ musicEnabled = on; if (on) { musicOn = true; startMusic(); } else stopMusic(); },
  };
})();
