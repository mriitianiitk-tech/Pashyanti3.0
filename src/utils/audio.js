// Native Web Audio API Sound & Tactile feedback

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Resonant Tibetan singing bowl chime synthesized directly with Web Audio API.
 * No external audio files needed; works 100% offline.
 */
export function playTibetanBowlChime(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const fundamentalOsc = ctx.createOscillator();
    const secondaryOverOsc = ctx.createOscillator();
    const tertiaryOverOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();

    fundamentalOsc.type = 'sine';
    fundamentalOsc.frequency.setValueAtTime(185.0, ctx.currentTime);

    secondaryOverOsc.type = 'sine';
    secondaryOverOsc.frequency.setValueAtTime(185.5, ctx.currentTime);

    tertiaryOverOsc.type = 'sine';
    tertiaryOverOsc.frequency.setValueAtTime(277.5, ctx.currentTime);

    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.12);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);

    fundamentalOsc.connect(mainGain);
    secondaryOverOsc.connect(mainGain);
    tertiaryOverOsc.connect(mainGain);
    mainGain.connect(ctx.destination);

    fundamentalOsc.start();
    secondaryOverOsc.start();
    tertiaryOverOsc.start();

    fundamentalOsc.stop(ctx.currentTime + 4.6);
    secondaryOverOsc.stop(ctx.currentTime + 4.6);
    tertiaryOverOsc.stop(ctx.currentTime + 4.6);
  } catch (e) {
    console.debug('Audio chime failed:', e);
  }
}

/**
 * Subtle meditative tap click for rhythmic counting
 */
export function playSubtleClick(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch (e) {
    console.debug('Audio click error:', e);
  }
}

/**
 * Haptic tactile feedback for mobile devices (Android)
 */
export function triggerHaptic(pattern = [25], vibrateEnabled = true) {
  if (!vibrateEnabled) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    console.debug('Haptic feedback error:', e);
  }
}
