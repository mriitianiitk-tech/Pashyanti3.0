import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Droplet, Play, Sparkles, Sliders, Zap } from 'lucide-react';

export default function DripSettings() {
  const {
    dripAnimationSettings,
    updateDripAnimationSettings,
    naamJapaTypography,
    sadhanaTypography,
    triggerFeedback,
  } = useApp();

  // Test simulator drop state
  const [simulatorDrops, setSimulatorDrops] = useState([]);
  const sampleWords = ['ॐ नमः शिवाय', 'शान्तिः', 'आनन्दः', 'हरे कृष्ण', 'सत्यम्', 'शिवम्', 'सुन्दरम्'];
  const [sampleIndex, setSampleIndex] = useState(0);

  const triggerTestDrop = () => {
    triggerFeedback('click');
    const word = sampleWords[sampleIndex % sampleWords.length];
    setSampleIndex((prev) => prev + 1);

    const isGravity = dripAnimationSettings.sadhanaSpeedMode === 'gravity';
    const duration = isGravity ? 2000 : dripAnimationSettings.sadhanaDuration || 2000;
    const timingFunction = isGravity ? 'cubic-bezier(0.5, 0, 1, 0.5)' : 'ease-in-out';

    const newDrop = {
      id: Date.now() + Math.random(),
      text: word,
      duration,
      timingFunction,
    };

    setSimulatorDrops((prev) => [...prev, newDrop]);

    setTimeout(() => {
      setSimulatorDrops((prev) => prev.filter((d) => d.id !== newDrop.id));
    }, duration);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-800 flex items-center gap-2">
          <Droplet className="w-4 h-4 text-cyan-400" />
          Falling Drops ("Dripping Tap") Animation
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Sacred Motion
        </span>
      </div>

      <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
        Re-experience the beloved meditative falling drops animation. As you advance in your japa, each sacred word or phrase gently cascades downward like drops of divine nectar.
      </p>

      {/* 1. NORMAL JAPA (SADHANA) ANIMATION SETTINGS */}
      <div className="p-4 rounded-xl bg-slate-950/60 light:bg-amber-50/60 border border-slate-800/80 light:border-amber-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 light:text-slate-900 flex items-center gap-1.5">
              <span>Normal Japa (Sadhana) Mode</span>
            </h4>
            <p className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
              Choose between standard paragraph recitation and falling drops mode.
            </p>
          </div>
          <div className="inline-flex rounded-lg bg-slate-900 light:bg-white p-0.5 border border-slate-700 light:border-amber-200">
            <button
              type="button"
              onClick={() => {
                updateDripAnimationSettings({ sadhanaMode: 'standard' });
                triggerFeedback('click');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                dripAnimationSettings.sadhanaMode === 'standard'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-700'
              }`}
            >
              Standard Flow
            </button>
            <button
              type="button"
              onClick={() => {
                updateDripAnimationSettings({ sadhanaMode: 'drip' });
                triggerFeedback('chime');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                dripAnimationSettings.sadhanaMode === 'drip'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-700'
              }`}
            >
              Falling Drops 💧
            </button>
          </div>
        </div>

        {/* If Falling Drops is active for Sadhana */}
        {dripAnimationSettings.sadhanaMode === 'drip' && (
          <div className="pt-3 border-t border-slate-800/60 light:border-amber-200/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Drop Unit: Word vs Phrase */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
                  Drop Unit
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ sadhanaDripUnit: 'word' })}
                    className={`py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                      dripAnimationSettings.sadhanaDripUnit === 'word'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Word-by-Word
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ sadhanaDripUnit: 'phrase' })}
                    className={`py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                      dripAnimationSettings.sadhanaDripUnit === 'phrase'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Phrase-by-Phrase
                  </button>
                </div>
              </div>

              {/* Speed Mode: Gravity vs Manual vs Synced */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
                  Fall Dynamics & Speed
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ sadhanaSpeedMode: 'gravity' })}
                    className={`py-1.5 text-[11px] rounded-lg border transition-colors ${
                      dripAnimationSettings.sadhanaSpeedMode === 'gravity'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Gravity
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ sadhanaSpeedMode: 'manual' })}
                    className={`py-1.5 text-[11px] rounded-lg border transition-colors ${
                      dripAnimationSettings.sadhanaSpeedMode === 'manual'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ sadhanaSpeedMode: 'synced' })}
                    className={`py-1.5 text-[11px] rounded-lg border transition-colors ${
                      dripAnimationSettings.sadhanaSpeedMode === 'synced'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Chant Synced
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Duration Slider if Manual mode */}
            {dripAnimationSettings.sadhanaSpeedMode === 'manual' && (
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600">
                    Fall Duration
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {((dripAnimationSettings.sadhanaDuration || 2000) / 1000).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={dripAnimationSettings.sadhanaDuration || 2000}
                  onChange={(e) =>
                    updateDripAnimationSettings({ sadhanaDuration: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-900 light:bg-amber-200 rounded-lg accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. NAAM JAPA ANIMATION SETTINGS */}
      <div className="p-4 rounded-xl bg-slate-950/60 light:bg-amber-50/60 border border-slate-800/80 light:border-amber-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 light:text-slate-900 flex items-center gap-1.5">
              <span>Naam Japa Mode</span>
            </h4>
            <p className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
              Choose between classic Sacred Card view and Falling Drops mode.
            </p>
          </div>
          <div className="inline-flex rounded-lg bg-slate-900 light:bg-white p-0.5 border border-slate-700 light:border-amber-200">
            <button
              type="button"
              onClick={() => {
                updateDripAnimationSettings({ naamJapaMode: 'standard' });
                triggerFeedback('click');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                dripAnimationSettings.naamJapaMode === 'standard'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-700'
              }`}
            >
              Sacred Card
            </button>
            <button
              type="button"
              onClick={() => {
                updateDripAnimationSettings({ naamJapaMode: 'drip' });
                triggerFeedback('chime');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                dripAnimationSettings.naamJapaMode === 'drip'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-700'
              }`}
            >
              Falling Drops 💧
            </button>
          </div>
        </div>

        {/* If Falling Drops is active for Naam Japa */}
        {dripAnimationSettings.naamJapaMode === 'drip' && (
          <div className="pt-3 border-t border-slate-800/60 light:border-amber-200/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Speed Mode */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
                  Fall Dynamics & Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ naamJapaSpeedMode: 'gravity' })}
                    className={`py-1.5 text-xs rounded-lg border transition-colors ${
                      dripAnimationSettings.naamJapaSpeedMode === 'gravity'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Gravity
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDripAnimationSettings({ naamJapaSpeedMode: 'manual' })}
                    className={`py-1.5 text-xs rounded-lg border transition-colors ${
                      dripAnimationSettings.naamJapaSpeedMode === 'manual'
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 light:bg-white light:border-amber-200 light:text-slate-700'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Show Meaning in Drop toggle */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
                  Include Translation
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateDripAnimationSettings({
                      naamJapaShowMeaningInDrip: !dripAnimationSettings.naamJapaShowMeaningInDrip,
                    })
                  }
                  className={`w-full py-1.5 px-3 text-xs rounded-lg border text-left flex items-center justify-between transition-colors ${
                    dripAnimationSettings.naamJapaShowMeaningInDrip
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span>Show Meaning In Drop</span>
                  <span className="font-bold font-mono">
                    {dripAnimationSettings.naamJapaShowMeaningInDrip ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Manual Duration Slider if Manual mode */}
            {dripAnimationSettings.naamJapaSpeedMode === 'manual' && (
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600">
                    Fall Duration
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {((dripAnimationSettings.naamJapaDuration || 2000) / 1000).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={dripAnimationSettings.naamJapaDuration || 2000}
                  onChange={(e) =>
                    updateDripAnimationSettings({ naamJapaDuration: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-900 light:bg-amber-200 rounded-lg accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE SIMULATOR / PLAYGROUND */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
            Interactive Falling Drop Simulator
          </span>
          <button
            type="button"
            onClick={triggerTestDrop}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/30 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Drop (Tap)</span>
          </button>
        </div>

        {/* Simulator stage with actual falling drops */}
        <div
          onClick={triggerTestDrop}
          className="relative h-44 w-full rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col items-center justify-start cursor-pointer select-none"
        >
          {/* Static drop ready at top */}
          <div
            className="dripping-word-static"
            style={{
              fontFamily: sadhanaTypography.activeWord.fontFamily,
              color: sadhanaTypography.activeWord.color,
              fontSize: `${Math.min(32, sadhanaTypography.activeWord.fontSize)}px`,
              fontWeight: sadhanaTypography.activeWord.fontWeight,
              fontStyle: sadhanaTypography.activeWord.fontStyle,
              textShadow: sadhanaTypography.activeWord.glow
                ? `0 0 16px ${sadhanaTypography.activeWord.color}80`
                : 'none',
              top: '12%',
            }}
          >
            {sampleWords[sampleIndex % sampleWords.length]}
          </div>

          {/* Falling drops cascade */}
          {simulatorDrops.map((drop) => (
            <div
              key={drop.id}
              className="dripping-word-falling"
              style={{
                fontFamily: sadhanaTypography.activeWord.fontFamily,
                color: sadhanaTypography.activeWord.color,
                fontSize: `${Math.min(32, sadhanaTypography.activeWord.fontSize)}px`,
                fontWeight: sadhanaTypography.activeWord.fontWeight,
                fontStyle: sadhanaTypography.activeWord.fontStyle,
                textShadow: sadhanaTypography.activeWord.glow
                  ? `0 0 16px ${sadhanaTypography.activeWord.color}80`
                  : 'none',
                animationDuration: `${drop.duration}ms`,
                animationTimingFunction: drop.timingFunction,
              }}
            >
              {drop.text}
            </div>
          ))}

          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-500 pointer-events-none">
            Click box or button to drop sacred word
          </div>
        </div>
      </div>
    </div>
  );
}
