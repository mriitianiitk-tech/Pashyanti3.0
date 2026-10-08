import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import NaamJapaUploadModal from './NaamJapaUploadModal';
import {
  Sparkles,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  Upload,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  BookOpen,
  Layers,
  Settings,
  Flame,
  Download,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { downloadCSVTemplate } from '../../utils/csvParser';

export default function NaamJapaView() {
  const {
    naamJapaStotras,
    naamJapaSettings,
    updateNaamJapaSettings,
    naamJapaStats,
    logNaamJapaChant,
    resetNaamJapaSession,
    triggerFeedback,
    fontFamily
  } = useApp();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentStotraTitle, setCurrentStotraTitle] = useState('');
  const [currentStotraDeity, setCurrentStotraDeity] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Determine available items pool based on selectedStotraId & randomScope
  const availableItems = useMemo(() => {
    if (!naamJapaStotras || naamJapaStotras.length === 0) return [];

    // If "All Stotras" is selected or randomScope is 'all'
    if (naamJapaSettings.selectedStotraId === 'all' || naamJapaSettings.randomScope === 'all') {
      const all = [];
      naamJapaStotras.forEach((s) => {
        (s.items || []).forEach((item) => {
          all.push({
            ...item,
            stotraId: s.id,
            stotraTitle: s.title,
            stotraDeity: s.deity
          });
        });
      });
      return all;
    }

    // Specific Stotra
    const selected = naamJapaStotras.find((s) => s.id === naamJapaSettings.selectedStotraId) || naamJapaStotras[0];
    if (!selected) return [];

    return (selected.items || []).map((item) => ({
      ...item,
      stotraId: selected.id,
      stotraTitle: selected.title,
      stotraDeity: selected.deity
    }));
  }, [naamJapaStotras, naamJapaSettings.selectedStotraId, naamJapaSettings.randomScope]);

  // Pick next item (Random or Sequential)
  const getNextItem = (currentIndex = -1) => {
    if (availableItems.length === 0) return null;

    if (naamJapaSettings.mode === 'random') {
      // Pick random index
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      return availableItems[randomIndex];
    } else {
      // Sequential: advance index
      const nextIndex = (currentIndex + 1) % availableItems.length;
      return availableItems[nextIndex];
    }
  };

  // Initialize or update current item when available items change
  useEffect(() => {
    if (availableItems.length > 0) {
      if (!currentItem || !availableItems.some((i) => i.sanskrit === currentItem.sanskrit)) {
        const initial = getNextItem(-1);
        if (initial) {
          setCurrentItem(initial);
          setCurrentStotraTitle(initial.stotraTitle);
          setCurrentStotraDeity(initial.stotraDeity);
          setHistory([initial]);
          setHistoryIndex(0);
        }
      }
    } else {
      setCurrentItem(null);
    }
  }, [availableItems]);

  // Advance to next name/line
  const handleNext = () => {
    if (availableItems.length === 0) return;

    logNaamJapaChant();

    // If currently browsing earlier in history, move forward in history
    if (historyIndex < history.length - 1) {
      const nextInHistory = history[historyIndex + 1];
      setCurrentItem(nextInHistory);
      setCurrentStotraTitle(nextInHistory.stotraTitle);
      setCurrentStotraDeity(nextInHistory.stotraDeity);
      setHistoryIndex(historyIndex + 1);
      return;
    }

    // Otherwise generate fresh next item
    const currentIdx = currentItem ? availableItems.findIndex(i => i.id === currentItem.id) : -1;
    const next = getNextItem(currentIdx);
    if (next) {
      setCurrentItem(next);
      setCurrentStotraTitle(next.stotraTitle);
      setCurrentStotraDeity(next.stotraDeity);
      setHistory(prev => [...prev.slice(-49), next]); // Keep last 50
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }
  };

  // Step back to previous name/line
  const handlePrevious = () => {
    if (historyIndex > 0) {
      const prevItem = history[historyIndex - 1];
      setCurrentItem(prevItem);
      setCurrentStotraTitle(prevItem.stotraTitle);
      setCurrentStotraDeity(prevItem.stotraDeity);
      setHistoryIndex(historyIndex - 1);
      triggerFeedback('click');
    }
  };

  // Force random draw right now
  const handleShuffle = () => {
    if (availableItems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const item = availableItems[randomIndex];
    setCurrentItem(item);
    setCurrentStotraTitle(item.stotraTitle);
    setCurrentStotraDeity(item.stotraDeity);
    setHistory(prev => [...prev.slice(-49), item]);
    setHistoryIndex(prev => Math.min(prev + 1, 49));
    triggerFeedback('click');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only when not typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      } else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      } else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleShuffle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, historyIndex, history, availableItems, isFullscreen]);

  // Font size mapping
  const fontSizeClass = {
    normal: 'text-2xl sm:text-3xl',
    large: 'text-3xl sm:text-4xl md:text-5xl',
    xlarge: 'text-4xl sm:text-5xl md:text-6xl'
  }[naamJapaSettings.fontSize || 'large'];

  // Empty State: when no stotra uploaded yet
  if (!naamJapaStotras || naamJapaStotras.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600/20 via-amber-500/10 to-amber-400/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl mb-6">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 animate-sacred-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 light:text-slate-900 mb-2">
          Naam Japa Facility
        </h2>
        <p className="text-sm sm:text-base text-slate-400 light:text-slate-600 max-w-lg mb-8 leading-relaxed">
          Recite sacred divine names and long stotras like <span className="text-amber-400 font-semibold">Sahasranama</span> (1,000 Names), <span className="text-amber-400 font-semibold">Sri Rudram</span>, or <span className="text-amber-400 font-semibold">Suktas</span>. Practice sequentially or via mindful random draw with meanings and descriptions.
        </p>

        <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900/60 border border-slate-800 light:bg-white light:border-amber-200 shadow-xl space-y-4">
          <div className="text-left text-xs text-slate-300 light:text-slate-700 space-y-2 p-3 rounded-xl bg-slate-950/40 light:bg-amber-50 border border-slate-800/80 light:border-amber-200">
            <div className="font-semibold text-amber-500 light:text-amber-700 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Upload CSV Format:
            </div>
            <p className="text-slate-400 light:text-slate-600">
              CSV file must contain three columns:
            </p>
            <div className="grid grid-cols-3 gap-1 font-mono text-[11px] text-center">
              <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">1. Sanskrit text</span>
              <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">2. Meaning</span>
              <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">3. Description</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Stotra CSV File
            </button>

            <button
              onClick={downloadCSVTemplate}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-700 light:border-amber-300 text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV Template
            </button>
          </div>
        </div>

        <NaamJapaUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-4 ${
      isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 light:bg-[#fbf9f4] p-3 sm:p-6 flex flex-col justify-between max-w-none overflow-y-auto' : ''
    }`}>
      {/* Top Configuration & Filter Strip */}
      <div className={`p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm backdrop-blur-sm space-y-3 ${
        isFullscreen ? 'bg-slate-900/40 border-slate-800/40' : ''
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Stotra Selection Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-amber-500/80 mb-1">
              Active Stotra / Sahasranama
            </label>
            <div className="flex items-center gap-2">
              <select
                value={naamJapaSettings.selectedStotraId}
                onChange={(e) => updateNaamJapaSettings({ selectedStotraId: e.target.value })}
                className="w-full py-1.5 px-3 text-xs sm:text-sm rounded-lg bg-slate-950 border border-slate-700 text-slate-100 light:bg-amber-50 light:border-amber-300 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">🌟 All Stotras Combined ({availableItems.length} lines)</option>
                {naamJapaStotras.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.items?.length || 0} items) {s.deity ? `• ${s.deity}` : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="p-2 rounded-lg border border-slate-700 hover:border-amber-500 text-amber-400 light:border-amber-300 light:hover:border-amber-500 transition-colors"
                title="Add another Stotra CSV"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector: Random vs Sequential */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
              Japa Mode
            </span>
            <div className="inline-flex rounded-lg bg-slate-950 light:bg-amber-100 p-0.5 border border-slate-800 light:border-amber-300">
              <button
                onClick={() => updateNaamJapaSettings({ mode: 'random' })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  naamJapaSettings.mode === 'random'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                }`}
              >
                <Shuffle className="w-3 h-3" />
                Random
              </button>
              <button
                onClick={() => updateNaamJapaSettings({ mode: 'sequential' })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  naamJapaSettings.mode === 'sequential'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                }`}
              >
                <Layers className="w-3 h-3" />
                Sequential
              </button>
            </div>
          </div>

          {/* If Mode is Random: Scope Selection (Same Stotra vs All Stotras) */}
          {naamJapaSettings.mode === 'random' && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
                Random Scope
              </span>
              <div className="inline-flex rounded-lg bg-slate-950 light:bg-amber-100 p-0.5 border border-slate-800 light:border-amber-300">
                <button
                  onClick={() => updateNaamJapaSettings({ randomScope: 'single' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    naamJapaSettings.randomScope === 'single'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                  }`}
                  title="Randomly picks lines within the currently selected stotra"
                >
                  This Stotra
                </button>
                <button
                  onClick={() => updateNaamJapaSettings({ randomScope: 'all' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    naamJapaSettings.randomScope === 'all'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                  }`}
                  title="Randomly picks lines from across all uploaded stotras"
                >
                  All Stotras
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Visibility Toggles & Font Size Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 light:border-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateNaamJapaSettings({ showMeaning: !naamJapaSettings.showMeaning })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors border ${
                naamJapaSettings.showMeaning
                  ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  : 'border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              {naamJapaSettings.showMeaning ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Meaning</span>
            </button>

            <button
              onClick={() => updateNaamJapaSettings({ showDescription: !naamJapaSettings.showDescription })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors border ${
                naamJapaSettings.showDescription
                  ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  : 'border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              {naamJapaSettings.showDescription ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Description</span>
            </button>
          </div>

          {/* Session Counter info */}
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono text-slate-400 light:text-slate-600">
              Session:{' '}
              <span className="font-bold text-amber-400 light:text-amber-700 text-sm">
                {naamJapaStats.sessionCount}
              </span>
            </div>
            <button
              onClick={() => resetNaamJapaSession()}
              className="text-[11px] text-slate-500 hover:text-slate-300 light:hover:text-slate-800 flex items-center gap-1 transition-colors"
              title="Reset session counter"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-2.5 py-1 text-xs rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 light:border-amber-400 light:text-amber-800 transition-colors flex items-center gap-1"
              title="Toggle Fullscreen Focus Mode (Press F or Esc)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Exit' : 'Focus'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sacred Naam Card */}
      {currentItem ? (
        <div 
          onClick={handleNext}
          className={`group cursor-pointer select-none relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-amber-500/30 hover:border-amber-500/60 light:from-white light:via-amber-50/50 light:to-amber-100/40 light:border-amber-300 shadow-2xl p-6 sm:p-10 transition-all duration-300 flex flex-col items-center justify-between ${
            isFullscreen ? 'flex-1 my-2 sm:my-3 min-h-0' : 'min-h-[380px] sm:min-h-[440px]'
          }`}
        >
          {/* Sacred subtle glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

          {/* Top metadata tags */}
          <div className="w-full flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 light:text-amber-800 border border-amber-500/30">
                {currentStotraTitle || 'Sacred Text'}
              </span>
              {currentStotraDeity && (
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 light:bg-amber-100 text-slate-300 light:text-slate-700">
                  {currentStotraDeity}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 light:text-slate-600">
              {currentItem.index && (
                <span className="px-2 py-0.5 rounded bg-slate-950/80 light:bg-white border border-slate-800 light:border-amber-200">
                  #{currentItem.index}
                </span>
              )}
            </div>
          </div>

          {/* Middle: Sanskrit Sacred Text */}
          <div className="my-auto py-6 sm:py-8 text-center max-w-2xl z-10 w-full space-y-4">
            <h2 
              className={`font-sanskrit font-bold text-amber-400 light:text-amber-800 tracking-wide leading-relaxed drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.01] ${fontSizeClass}`}
              style={{ fontFamily: fontFamily }}
            >
              {currentItem.sanskrit}
            </h2>

            {/* Meaning card */}
            {naamJapaSettings.showMeaning && currentItem.meaning && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="mt-4 p-4 rounded-xl bg-slate-950/50 light:bg-white/80 border border-slate-800/80 light:border-amber-200/80 text-center text-slate-200 light:text-slate-800 text-sm sm:text-base leading-relaxed max-w-xl mx-auto shadow-sm"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-500/70 mb-1">
                  Meaning
                </div>
                <p>{currentItem.meaning}</p>
              </div>
            )}

            {/* Description / Bhashya card */}
            {naamJapaSettings.showDescription && currentItem.description && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="p-3.5 rounded-xl bg-slate-950/30 light:bg-amber-50/50 border border-slate-800/50 light:border-amber-200/50 text-center text-slate-400 light:text-slate-600 text-xs sm:text-sm italic leading-relaxed max-w-xl mx-auto"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5 not-italic">
                  Commentary & Significance
                </div>
                <p>{currentItem.description}</p>
              </div>
            )}
          </div>

          {/* Bottom Tap Instruction */}
          <div className="w-full flex items-center justify-between z-10 text-[11px] text-slate-500 light:text-slate-600 pt-2 border-t border-slate-800/40 light:border-amber-200/40">
            <span className="hidden sm:inline">
              Tap card or press <kbd className="px-1 py-0.5 rounded bg-slate-800 light:bg-amber-200 text-slate-200 light:text-slate-800 font-mono">Space</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-800 light:bg-amber-200 text-slate-200 light:text-slate-800 font-mono">→</kbd> for next
            </span>
            <span className="sm:hidden">Tap card to advance</span>
            <span>Total Recitations: {naamJapaStats.totalCount}</span>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">Loading sacred lines...</div>
      )}

      {/* Floating Bottom Action Strip for Ergonomic Smartphone Use */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={historyIndex <= 0}
          className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900 border border-slate-800 light:bg-white light:border-amber-300 text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-amber-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          title="Previous name"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Prev</span>
        </button>

        {/* Big Next / Chant Primary Button */}
        <button
          onClick={handleNext}
          className="flex-1 max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>{naamJapaSettings.mode === 'random' ? 'Next Random Name' : 'Next Verse / Line'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Instant Shuffle Button */}
        <button
          onClick={handleShuffle}
          className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900 border border-slate-800 light:bg-white light:border-amber-300 text-amber-400 light:text-amber-700 hover:bg-slate-800 light:hover:bg-amber-100 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          title="Pick another random name immediately"
        >
          <Shuffle className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Shuffle</span>
        </button>

        {/* Chime Bell Sound Button */}
        <button
          onClick={() => triggerFeedback('chime')}
          className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900 border border-slate-800 light:bg-white light:border-amber-300 text-amber-500 hover:bg-slate-800 light:hover:bg-amber-100 shadow-md transition-all active:scale-95"
          title="Ring Sacred Tibetan Singing Bowl Chime"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Upload modal */}
      <NaamJapaUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
