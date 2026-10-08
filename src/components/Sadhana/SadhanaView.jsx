import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Sparkles,
  Eye,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SadhanaView() {
  const {
    sadhanaMantras,
    selectedMantraId,
    setSelectedMantraId,
    logSadhanaChant,
    resetSadhanaCount,
    triggerFeedback,
    fontFamily
  } = useApp();

  const [activeParaIndex, setActiveParaIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [focusView, setFocusView] = useState('all'); // 'all' | 'hide-completed' | 'active-only' | 'word-only'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Active mantra object
  const mantra = useMemo(() => {
    return sadhanaMantras.find((m) => m.id === selectedMantraId) || sadhanaMantras[0];
  }, [sadhanaMantras, selectedMantraId]);

  // Parse mantra paragraphs, lines, and words
  const parsedStructure = useMemo(() => {
    if (!mantra || !mantra.text) return [];
    const paragraphs = mantra.text.split(/\n\s*\n/).filter(Boolean);
    return paragraphs.map((p) => {
      const lines = p.split('\n').filter(Boolean);
      return lines.map((line) => line.trim().split(/\s+/).filter(Boolean));
    });
  }, [mantra]);

  // Reset indices if mantra changes
  useEffect(() => {
    setActiveParaIndex(0);
    setActiveLineIndex(0);
    setActiveWordIndex(0);
  }, [selectedMantraId]);

  // Step forward
  const stepForward = () => {
    if (!parsedStructure.length) return;

    triggerFeedback('click');

    const curPara = parsedStructure[activeParaIndex];
    if (!curPara) return;
    const curLine = curPara[activeLineIndex];
    if (!curLine) return;

    // Advance word
    if (activeWordIndex < curLine.length - 1) {
      setActiveWordIndex(activeWordIndex + 1);
    } else {
      // Advance line
      if (activeLineIndex < curPara.length - 1) {
        setActiveLineIndex(activeLineIndex + 1);
        setActiveWordIndex(0);
      } else {
        // Advance paragraph or complete chant
        if (activeParaIndex < parsedStructure.length - 1) {
          setActiveParaIndex(activeParaIndex + 1);
          setActiveLineIndex(0);
          setActiveWordIndex(0);
        } else {
          // Completed an entire round/stotra/mantra!
          setActiveParaIndex(0);
          setActiveLineIndex(0);
          setActiveWordIndex(0);

          logSadhanaChant(mantra.id);
          setSessionCount(prev => prev + 1);
          triggerFeedback('chime');

          // Celebration confetti on complete round
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff']
            });
          } catch (e) { }
        }
      }
    }
  };

  // Step backward
  const stepBackward = () => {
    if (!parsedStructure.length) return;

    triggerFeedback('click');

    if (activeWordIndex > 0) {
      setActiveWordIndex(activeWordIndex - 1);
    } else {
      if (activeLineIndex > 0) {
        const prevLine = parsedStructure[activeParaIndex][activeLineIndex - 1];
        setActiveLineIndex(activeLineIndex - 1);
        setActiveWordIndex(prevLine.length - 1);
      } else if (activeParaIndex > 0) {
        const prevPara = parsedStructure[activeParaIndex - 1];
        const lastLine = prevPara[prevPara.length - 1];
        setActiveParaIndex(activeParaIndex - 1);
        setActiveLineIndex(prevPara.length - 1);
        setActiveWordIndex(lastLine.length - 1);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className={`max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 ${
      isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between max-w-none' : ''
    }`}>
      {/* Top Controls / Counter strip */}
      <div className={`p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm backdrop-blur-sm ${
        isFullscreen ? 'bg-slate-900/40 border-slate-800/40' : ''
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Active Mantra Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-amber-500/80 mb-1">
              Active Deity & Text
            </label>
            <select
              value={selectedMantraId}
              onChange={(e) => setSelectedMantraId(e.target.value)}
              className="w-full py-1.5 px-3 text-xs sm:text-sm rounded-lg bg-slate-950 border border-slate-700 text-slate-100 light:bg-amber-50 light:border-amber-300 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {sadhanaMantras.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.deity ? `${m.deity} — ` : ''}{m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Counts & Malas */}
          <div className="flex items-center justify-center gap-6 py-1 border-y md:border-y-0 md:border-x border-slate-800/60 light:border-amber-200">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 light:text-amber-700 font-mono">
                {mantra?.chants || 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 light:text-slate-600">
                Chants Logged
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 light:text-slate-800 font-mono">
                {mantra?.malas || 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 light:text-slate-600">
                Malas Complete (108)
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => resetSadhanaCount(mantra.id)}
              className="px-3 py-1.5 text-xs rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/20 light:border-rose-200 light:hover:bg-rose-50 transition-colors"
              title="Reset count for this mantra"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              Reset
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-1.5 text-xs rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 light:border-amber-400 light:text-amber-800 transition-colors flex items-center gap-1"
              title="Toggle Fullscreen Focus Mode"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Exit' : 'Focus'}</span>
            </button>
          </div>
        </div>

        {/* Focus Mode selection strip */}
        {!isFullscreen && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80 light:border-amber-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 light:text-slate-600 font-medium">Focus View:</span>
              <div className="inline-flex rounded-lg bg-slate-950 light:bg-amber-100 p-0.5 border border-slate-800 light:border-amber-300">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'hide-completed', label: 'Remaining' },
                  { id: 'active-only', label: 'Current Line' },
                  { id: 'word-only', label: 'Word' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFocusView(f.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      focusView === f.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 light:text-slate-600 font-mono">
              Para {activeParaIndex + 1}/{parsedStructure.length} • Line {activeLineIndex + 1}
            </div>
          </div>
        )}
      </div>

      {/* Main Recitation Stage (Tap anywhere to advance) */}
      <div
        onClick={stepForward}
        className={`group cursor-pointer select-none relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 light:bg-white light:border-amber-200 shadow-2xl p-6 sm:p-10 transition-all flex flex-col items-center justify-center min-h-[340px] sm:min-h-[400px] text-center ${
          isFullscreen ? 'flex-1 my-4 min-h-0' : ''
        }`}
      >
        <div className="max-w-2xl w-full space-y-6 z-10">
          {parsedStructure.map((paragraph, pIdx) => {
            // Focus view filtering
            if (focusView === 'active-only' && pIdx !== activeParaIndex) return null;
            if (focusView === 'hide-completed' && pIdx < activeParaIndex) return null;
            if (focusView === 'word-only' && pIdx !== activeParaIndex) return null;

            return (
              <div key={pIdx} className="space-y-3">
                {paragraph.map((lineWords, lIdx) => {
                  const isCurrentLine = pIdx === activeParaIndex && lIdx === activeLineIndex;
                  const isCompletedLine =
                    pIdx < activeParaIndex || (pIdx === activeParaIndex && lIdx < activeLineIndex);

                  if (focusView === 'active-only' && !isCurrentLine) return null;
                  if (focusView === 'hide-completed' && isCompletedLine) return null;
                  if (focusView === 'word-only' && !isCurrentLine) return null;

                  return (
                    <div
                      key={lIdx}
                      className={`leading-relaxed transition-all duration-200 ${
                        isCurrentLine
                          ? 'opacity-100 scale-100'
                          : isCompletedLine
                          ? 'opacity-35 line-through-none'
                          : 'opacity-50'
                      }`}
                      style={{ fontFamily }}
                    >
                      {lineWords.map((word, wIdx) => {
                        const isCurrentWord = isCurrentLine && wIdx === activeWordIndex;
                        const isCompletedWord =
                          isCompletedLine || (isCurrentLine && wIdx < activeWordIndex);

                        if (focusView === 'word-only' && !isCurrentWord) return null;

                        return (
                          <span
                            key={wIdx}
                            className={`japa-word mx-1.5 sm:mx-2 py-0.5 rounded px-1 transition-all text-xl sm:text-2xl md:text-3xl ${
                              isCurrentWord
                                ? 'word-active text-amber-400 light:text-amber-700 bg-amber-500/15'
                                : isCompletedWord
                                ? 'text-slate-400 light:text-slate-400'
                                : 'text-slate-200 light:text-slate-800'
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Subtle footer hint */}
        <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-slate-500 light:text-slate-500 pointer-events-none">
          Tap card or press Space to step forward • Left arrow to step back
        </div>
      </div>

      {/* Floating Bottom Stepper Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={stepBackward}
          className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900 border border-slate-800 light:bg-white light:border-amber-300 text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-amber-100 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          title="Previous word"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Prev</span>
        </button>

        <button
          onClick={stepForward}
          className="flex-1 max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Step Forward / Chant</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => triggerFeedback('chime')}
          className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900 border border-slate-800 light:bg-white light:border-amber-300 text-amber-500 hover:bg-slate-800 light:hover:bg-amber-100 shadow-md transition-all active:scale-95"
          title="Tibetan Bowl Bell"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
