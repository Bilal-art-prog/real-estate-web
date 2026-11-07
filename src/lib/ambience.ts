/**
 * Procedural ambient audio — generated with the WebAudio API so the site needs
 * no audio assets. Off by default (see the sound toggle in the navbar).
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];
let started = false;

function build() {
  if (ctx) return;
  const AC: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.6;
  filter.connect(master);
  master.connect(ctx.destination);

  // warm drone
  [110, 164.81, 220.5].forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    osc.type = i === 2 ? "triangle" : "sine";
    osc.frequency.value = freq;
    osc.detune.value = (i - 1) * 6;
    const g = ctx!.createGain();
    g.gain.value = i === 2 ? 0.06 : 0.16;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    nodes.push(osc, g);
  });

  // slow breathing LFO on the filter
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 170;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  nodes.push(lfo, lfoGain);
  started = true;
}

export function setAmbience(on: boolean) {
  try {
    build();
    if (!ctx || !master) return;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.linearRampToValueAtTime(on ? 0.075 : 0, t + (on ? 1.6 : 0.7));
  } catch {
    /* audio is a nicety — never let it break the page */
  }
}

export function stopAmbience() {
  if (!ctx) return;
  try {
    master?.gain.cancelScheduledValues(ctx.currentTime);
    master?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    nodes.forEach((n) => (n as any).stop?.());
    nodes = [];
    void ctx.close();
  } catch {
    /* noop */
  }
  ctx = null;
  master = null;
  started = false;
}

export function ambienceStarted() {
  return started;
}
