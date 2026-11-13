/* DAWN v2 — Procedural audio via Web Audio API. No files, no dependencies.
   Engine loop, wind, honk, thud, chime — all synthesized. */
import { AUDIO } from '../config.js';
import { clamp } from '../util/math.js';

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.windGain = null;
    this.enabled = false;
    this.muted = false;
  }

  async init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = AUDIO.masterVolume;
    this.master.connect(this.ctx.destination);
    this._setupEngine();
    this._setupWind();
    this.enabled = true;
  }

  async resume() {
    if (!this.ctx) await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  _setupEngine() {
    // Sawtooth + square blend for engine character
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 60;
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 60 * 1.5;
    const mix = this.ctx.createGain();
    mix.gain.value = 0.4;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 4;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    osc1.connect(mix);
    osc2.connect(mix);
    mix.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc1.start(now);
    osc2.start(now);
    this.engineOsc = { osc1, osc2 };
    this.engineGain = gain;
    this.engineFilter = filter;
  }

  _setupWind() {
    // White noise -> bandpass -> gain
    const bufSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
    this.windGain = gain;
  }

  updateEngine(speed, throttle, dt) {
    if (!this.enabled || !this.engineGain) return;
    const now = this.ctx.currentTime;
    const speedNorm = clamp(Math.abs(speed) / 14, 0, 1);
    const throttleNorm = clamp(Math.abs(throttle), 0, 1);
    const targetRate = AUDIO.engineMinRate + speedNorm * (AUDIO.engineMaxRate - AUDIO.engineMinRate);
    const targetFreq = 60 * targetRate;
    this.engineOsc.osc1.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineOsc.osc2.frequency.setTargetAtTime(targetFreq * 1.5, now, 0.08);
    const targetGain = 0.05 + throttleNorm * 0.18 + speedNorm * 0.06;
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.1);
    if (this.engineFilter) {
      this.engineFilter.frequency.setTargetAtTime(300 + speedNorm * 800, now, 0.1);
    }
    if (this.windGain) {
      this.windGain.gain.setTargetAtTime(0.02 + speedNorm * 0.12, now, 0.2);
    }
  }

  honk() {
    if (!this.enabled) return;
    const now = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator();
    o1.type = 'square';
    o1.frequency.value = 320;
    const o2 = this.ctx.createOscillator();
    o2.type = 'square';
    o2.frequency.value = 400;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.35, now + 0.02);
    g.gain.setValueAtTime(0.35, now + 0.28);
    g.gain.linearRampToValueAtTime(0, now + 0.32);
    o1.connect(g); o2.connect(g); g.connect(this.master);
    o1.start(now); o2.start(now);
    o1.stop(now + 0.35); o2.stop(now + 0.35);
  }

  thud(intensity = 1) {
    if (!this.enabled) return;
    const now = this.ctx.currentTime;
    const bufSize = 0.3 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const t = i / bufSize;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 12);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    const g = this.ctx.createGain();
    g.gain.value = 0.5 * intensity;
    src.connect(filter); filter.connect(g); g.connect(this.master);
    src.start(now);
  }

  chime() {
    if (!this.enabled) return;
    const now = this.ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.14, now + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
      o.connect(g); g.connect(this.master);
      o.start(now + i * 0.08);
      o.stop(now + i * 0.08 + 0.55);
    });
  }

  fireworks() {
    if (!this.enabled) return;
    // Three quick bursts of filtered noise
    for (let k = 0; k < 3; k++) {
      setTimeout(() => this.thud(0.7), k * 220);
    }
    setTimeout(() => this.chime(), 700);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : AUDIO.masterVolume;
  }
}
