class SFX {
  constructor() {
    this.enabled = (localStorage.getItem("pf-sound") ?? "on") === "on";
    this.ctx = null;
  }

  setEnabled(v) {
    this.enabled = v;
    localStorage.setItem("pf-sound", v ? "on" : "off");
  }

  _ctx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  _noiseBuffer(ctx, dur) {
    const buf = ctx.createBuffer(1, Math.max(1, ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  click() {
    if (!this.enabled) return;
    try {
      const ctx = this._ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(720, ctx.currentTime);
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  collide(intensity = 0.5) {
    if (!this.enabled) return;
    try {
      const ctx = this._ctx();
      const src = ctx.createBufferSource();
      src.buffer = this._noiseBuffer(ctx, 0.08);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 400 + intensity * 1800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.02 + intensity * 0.09, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      src.connect(f).connect(g).connect(ctx.destination);
      src.start();
    } catch {}
  }

  whoosh() {
    if (!this.enabled) return;
    try {
      const ctx = this._ctx();
      const src = ctx.createBufferSource();
      src.buffer = this._noiseBuffer(ctx, 0.38);
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(280, ctx.currentTime);
      f.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
      src.connect(f).connect(g).connect(ctx.destination);
      src.start();
    } catch {}
  }

  merge() {
    if (!this.enabled) return;
    try {
      const ctx = this._ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(340, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.25);
      this.click();
    } catch {}
  }
}

export const sfx = new SFX();
