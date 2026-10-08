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
  Sliders,
  X
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
    fontFamily,
    isZenFullscreen,
    enterZenFullscreen,
    exitZenFullscreen,
    toggleZenFullscreen
  } = useApp();

  const [activeParaIndex, setActiveParaIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [focusView, setFocusView] = useState('all'); // 'all' | 'hide-completed' | 'active-only' | 'word-only'
  const [sessionCount, setSessionCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        // Advance paragraph
        if (activeParaIndex < parsedStructure.length - 1) {
          setActiveParaIndex(activeParaIndex + 1);
          setActiveLineIndex(0);
          setActiveWordIndex(0);
        } else {
          // Completed an entire recitation
          handleRecitationComplete();
        }
      }
    }
  };

  // Step backward
  const stepBackward = (e) => {
    if (e) e.stopPropagation();
    if (!parsedStructure.length) return;

    triggerFeedback('click');

    if (activeWordIndex > 0) {
      setActiveWordIndex(activeWordIndex - 1);
    } else if (activeLineIndex > 0) {
      const prevLine = parsedStructure[activeParaIndex][activeLineIndex - 1];
      setActiveLineIndex(activeLineIndex - 1);
      setActiveWordIndex(prevLine.length - 1);
    } else if (activeParaIndex > 0) {
      const prevPara = parsedStructure[activeParaIndex - 1];
      const prevLine = prevPara[prevPara.length - 1];
      setActiveParaIndex(activeParaIndex - 1);
      setActiveLineIndex(prevPara.length - 1);
      setActiveWordIndex(prevLine.length - 1);
    }
  };

  // Completed full recitation of mantra
  const handleRecitationComplete = () => {
    setActiveParaIndex(0);
    setActiveLineIndex(0);
    setActiveWordIndex(0);

    const newChants = (mantra.chants || 0) + 1;
    setSessionCount((prev) => prev + 1);
    logSadhanaChant(mantra.id);

    // If a full mala of 108 is completed
    if (newChants % 108 === 0) {
      triggerFeedback('chime');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff']
      });
    } else {
      triggerFeedback('chime');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleZenFullscreen();
      } else if (e.key === 'Escape' && isZenFullscreen) {
        e.preventDefault();
        exitZenFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeParaIndex, activeLineIndex, activeWordIndex, parsedStructure, isZenFullscreen]);

  // =========================================================================
  // SMARTPHONE-FIRST IMMERSIVE ZEN FULLSCREEN MODE FOR SADHANA
  // =========================================================================
  if (isZenFullscreen) {
    return (
      <div className="h-[100dvh] w-full flex flex-col justify-between relative bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 light:from-[#fcfbf7] light:via-amber-50/40 light:to-[#f9f6ef] select-none overflow-hidden pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),0.75rem)] px-3 sm:px-6">
        {/* Subtle Zen Header */}
        <div className="w-full flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-800 light:bg-white/90 light:border-amber-200 backdrop-blur-md shadow-xs">
            <span className="text-amber-500 font-bold text-sm">ॐ</span>
            <span className="text-xs font-semibold text-slate-200 light:text-slate-800 truncate max-w-[150px] sm:max-w-[280px]">
              {mantra?.title || 'Sadhana Mantra'}
            </span>
            {mantra?.deity && (
              <span className="text-[10px] text-amber-400/80 light:text-amber-700 hidden sm:inline">
                • {mantra.deity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 light:text-amber-800 text-xs font-mono font-bold">
              Chants: {mantra?.chants || 0}
              {mantra?.malas > 0 && ` (${mantra.malas} malas)`}
            </div>

            <button
              onClick={exitZenFullscreen}
              className="p-2 rounded-full bg-slate-900/80 border border-slate-800 hover:border-amber-500 text-slate-400 hover:text-amber-400 light:bg-white light:border-amber-200 light:text-slate-700 transition-colors shadow-xs"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Immersive Chanting Canvas (Tap anywhere to advance word/line) */}
        <div
          onClick={stepForward}
          className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 text-center cursor-pointer select-none active:scale-[0.99] transition-transform relative z-10 my-auto overflow-y-auto max-h-[75vh]"
        >
          {/* Sacred glowing aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[28rem] h-72 sm:h-[28rem] bg-amber-500/8 rounded-full blur-3xl pointer-events-none animate-sacred-pulse" />

          <div className="max-w-2xl w-full space-y-6 z-10">
            {parsedStructure.map((paragraph, pIdx) => {
              if (focusView === 'active-only' && pIdx !== activeParaIndex) return null;
              if (focusView === 'hide-completed' && pIdx < activeParaIndex) return null;
              if (focusView === 'word-only' && pIdx !== activeParaIndex) return null;

              return (
                <div key={pIdx} className="space-y-4">
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
                            ? 'opacity-35'
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
                              className={`japa-word mx-1 sm:mx-2 py-1 px-1.5 rounded-lg transition-all text-2xl sm:text-3xl md:text-4xl ${
                                isCurrentWord
                                  ? 'word-active text-amber-400 light:text-amber-700 bg-amber-500/20 font-bold shadow-sm'
                                  : isCompletedWord
                                  ? 'text-slate-500 light:text-slate-400'
                                  : 'text-slate-300 light:text-slate-800'
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

          {/* Gentle tap indicator */}
          <div className="mt-8 text-[11px] uppercase tracking-widest text-slate-500/70 light:text-slate-400 flex items-center gap-1.5 pointer-events-none font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 animate-ping" />
            Tap screen to advance chant
          </div>
        </div>

        {/* Floating Bottom Dock */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 z-20 shrink-0 pt-2 pb-1">
          <button
            onClick={stepBackward}
            className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/80 border border-slate-800 light:bg-white/90 light:border-amber-300 text-slate-300 light:text-slate-700 hover:bg-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Step backward"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={stepForward}
            className="flex-1 max-w-[200px] sm:max-w-xs py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Step Forward</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerFeedback('chime');
            }}
            className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/80 border border-slate-800 light:bg-white/90 light:border-amber-300 text-amber-500 hover:bg-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Temple bowl chime"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-1 px-3.5 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-amber-400 light:bg-white light:border-amber-300 light:text-amber-800 shadow-lg backdrop-blur-md text-xs font-bold active:scale-95 transition-all"
            title="Open Controls & Settings"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Options</span>
          </button>
        </div>

        {/* Sliding Bottom Sheet Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-150">
            {/* Backdrop */}
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Panel */}
            <div className="relative z-10 w-full max-w-xl mx-auto rounded-t-3xl bg-slate-900/95 border-t border-amber-500/30 light:bg-white/95 light:border-amber-200 p-5 shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto space-y-4">
              {/* Drawer Top Handle */}
              <div 
                onClick={() => setIsDrawerOpen(false)}
                className="w-12 h-1.5 rounded-full bg-slate-700 light:bg-slate-300 mx-auto mb-2 cursor-pointer" 
              />

              <div className="flex items-center justify-between border-b border-slate-800 light:border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-slate-100 light:text-slate-900">
                    Sadhana Settings & Controls
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 light:text-slate-600 light:hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mantra Selector */}
              <div>
                <label className="block text-[11px] uppercase font-bold tracking-wider text-amber-500 mb-1.5">
                  Select Deity & Mantra
                </label>
                <select
                  value={selectedMantraId}
                  onChange={(e) => setSelectedMantraId(e.target.value)}
                  className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-700 text-slate-100 light:bg-amber-50 light:border-amber-300 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {sadhanaMantras.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.deity ? `${m.deity} — ` : ''}{m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Focus View Selector */}
              <div>
                <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
                  Focus View Mode
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Text' },
                    { id: 'hide-completed', label: 'Remaining' },
                    { id: 'active-only', label: 'Current Line' },
                    { id: 'word-only', label: 'Word by Word' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFocusView(f.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-colors ${
                        focusView === f.id
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 light:bg-amber-50 light:border-amber-200 light:text-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    resetSadhanaCount(mantra.id);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-900/40 text-rose-400 hover:bg-rose-950/20 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Count for this Mantra ({mantra?.chants || 0})
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    exitZenFullscreen();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                  Exit Fullscreen Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STANDARD VIEW (DESKTOP & NON-FULLSCREEN VIEW)
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4">
      {/* Top Controls / Counter strip */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm backdrop-blur-sm">
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
              onClick={enterZenFullscreen}
              className="px-3 py-1.5 text-xs rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 light:border-amber-400 light:text-amber-800 transition-colors flex items-center gap-1 shadow-xs"
              title="Enter Fullscreen Zen Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Focus Mode selection strip */}
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
      </div>

      {/* Main Recitation Stage (Tap anywhere to advance) */}
      <div
        onClick={stepForward}
        className="group cursor-pointer select-none relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 light:bg-white light:border-amber-200 shadow-2xl p-6 sm:p-10 transition-all flex flex-col items-center justify-center min-h-[340px] sm:min-h-[400px] text-center"
      >
        <div className="max-w-2xl w-full space-y-6 z-10">
          {parsedStructure.map((paragraph, pIdx) => {
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
