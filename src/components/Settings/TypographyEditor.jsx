import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Type, Sparkles, RotateCcw, Palette, Sliders } from 'lucide-react';
import { AVAILABLE_FONTS, PRESET_COLORS } from '../../data/typographySettings';

/**
 * Reusable single-part typography controls
 */
function SinglePartEditor({
  title,
  subtitle,
  config,
  onChange,
  sizeRange = { min: 12, max: 64 },
  showGlow = false,
  showOpacity = false,
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-950/50 light:bg-amber-50/60 border border-slate-800/80 light:border-amber-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 light:text-amber-800">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[10px] text-slate-400 light:text-slate-600 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="text-xs px-2.5 py-1 rounded-md border font-medium truncate max-w-[140px]"
          style={{
            fontFamily: config.fontFamily,
            color: config.color,
            fontWeight: config.fontWeight || 'normal',
            fontStyle: config.fontStyle || 'normal',
          }}
        >
          Sample Text
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Font Family Selector */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
            Font Typeface
          </label>
          <select
            value={config.fontFamily || 'Martel'}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 light:bg-white light:border-amber-300 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {AVAILABLE_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Style (Bold, Italic, Regular) */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600 mb-1">
            Font Weight & Style
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => onChange({ fontWeight: 'bold', fontStyle: 'normal' })}
              className={`py-1.5 text-xs rounded-lg font-bold transition-colors ${
                config.fontWeight === 'bold' && config.fontStyle !== 'italic'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 light:bg-white light:border light:border-amber-200'
              }`}
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => onChange({ fontWeight: 'normal', fontStyle: 'normal' })}
              className={`py-1.5 text-xs rounded-lg font-normal transition-colors ${
                config.fontWeight === 'normal' && config.fontStyle !== 'italic'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 light:bg-white light:border light:border-amber-200'
              }`}
            >
              Regular
            </button>
            <button
              type="button"
              onClick={() => onChange({ fontStyle: 'italic' })}
              className={`py-1.5 text-xs rounded-lg italic transition-colors ${
                config.fontStyle === 'italic'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 light:bg-white light:border light:border-amber-200'
              }`}
            >
              Italic
            </button>
          </div>
        </div>
      </div>

      {/* Font Size Slider */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600">
            Font Size
          </span>
          <span className="font-mono font-bold text-amber-500 light:text-amber-700 text-xs">
            {config.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min={sizeRange.min}
          max={sizeRange.max}
          value={config.fontSize || sizeRange.min}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-900 light:bg-amber-200 rounded-lg accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Opacity Slider (if enabled) */}
      {showOpacity && (
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600">
              Visibility / Opacity
            </span>
            <span className="font-mono font-bold text-amber-500 light:text-amber-700 text-xs">
              {Math.round((config.opacity || 0.5) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.15"
            max="1.0"
            step="0.05"
            value={config.opacity || 0.5}
            onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-900 light:bg-amber-200 rounded-lg accent-amber-500 cursor-pointer"
          />
        </div>
      )}

      {/* Color Selection & Swatches */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-600">
            Text Color
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">{config.color}</span>
            <input
              type="color"
              value={config.color || '#f59e0b'}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              title="Pick custom color"
            />
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange({ color: c.hex })}
              className={`w-5 h-5 rounded-full border transition-transform ${
                config.color?.toLowerCase() === c.hex.toLowerCase()
                  ? 'scale-125 ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950'
                  : 'hover:scale-110 border-black/20'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Glow Effect Toggle (if enabled) */}
      {showGlow && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 light:border-amber-200/60 text-xs">
          <span className="text-[11px] text-slate-300 light:text-slate-700 font-medium">
            Sacred Radiant Glow
          </span>
          <button
            type="button"
            onClick={() => onChange({ glow: !config.glow })}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              config.glow
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {config.glow ? 'Glowing' : 'Flat'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TypographyEditor() {
  const {
    naamJapaTypography,
    updateNaamJapaTypography,
    sadhanaTypography,
    updateSadhanaTypography,
    resetTypography,
    triggerFeedback,
  } = useApp();

  const [activeSection, setActiveSection] = useState('naamjapa'); // 'naamjapa' | 'sadhana'

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-800 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Sacred Typography, Size & Colors
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
            Independently customize font, size, weight, and color for all three parts of Naam Japa and Normal Japa.
          </p>
        </div>

        {/* Section Tabs: Naam Japa vs Normal Japa */}
        <div className="inline-flex rounded-xl bg-slate-950 light:bg-amber-100 p-1 border border-slate-800 light:border-amber-300">
          <button
            type="button"
            onClick={() => {
              setActiveSection('naamjapa');
              triggerFeedback('click');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'naamjapa'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
            }`}
          >
            Naam Japa (3 Parts)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection('sadhana');
              triggerFeedback('click');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'sadhana'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
            }`}
          >
            Normal Japa (Sadhana)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. NAAM JAPA TYPOGRAPHY CONTROLS (3 PARTS) */}
      {/* ======================================================== */}
      {activeSection === 'naamjapa' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Part 1: Sacred Sanskrit Name */}
            <SinglePartEditor
              title="Part 1: Sacred Name"
              subtitle="Sanskrit chant text"
              config={naamJapaTypography.sanskrit}
              onChange={(updates) => updateNaamJapaTypography('sanskrit', updates)}
              sizeRange={{ min: 22, max: 72 }}
              showGlow={true}
            />

            {/* Part 2: Meaning */}
            <SinglePartEditor
              title="Part 2: Meaning"
              subtitle="English / vernacular translation"
              config={naamJapaTypography.meaning}
              onChange={(updates) => updateNaamJapaTypography('meaning', updates)}
              sizeRange={{ min: 11, max: 28 }}
            />

            {/* Part 3: Commentary / Significance */}
            <SinglePartEditor
              title="Part 3: Significance"
              subtitle="Spiritual commentary & notes"
              config={naamJapaTypography.description}
              onChange={(updates) => updateNaamJapaTypography('description', updates)}
              sizeRange={{ min: 10, max: 24 }}
            />
          </div>

          {/* Live Interactive Naam Japa Preview Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/80 border border-amber-500/30 text-center space-y-3 relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-500/70">
              Live Naam Japa Preview
            </div>

            {/* Sacred Name Preview */}
            <div
              style={{
                fontFamily: naamJapaTypography.sanskrit.fontFamily,
                fontSize: `${naamJapaTypography.sanskrit.fontSize}px`,
                color: naamJapaTypography.sanskrit.color,
                fontWeight: naamJapaTypography.sanskrit.fontWeight,
                fontStyle: naamJapaTypography.sanskrit.fontStyle,
                textShadow: naamJapaTypography.sanskrit.glow
                  ? `0 0 16px ${naamJapaTypography.sanskrit.color}80`
                  : 'none',
              }}
              className="leading-relaxed transition-all"
            >
              ॐ नमो नारायणाय
            </div>

            {/* Meaning Preview */}
            <div
              style={{
                fontFamily: naamJapaTypography.meaning.fontFamily,
                fontSize: `${naamJapaTypography.meaning.fontSize}px`,
                color: naamJapaTypography.meaning.color,
                fontWeight: naamJapaTypography.meaning.fontWeight,
                fontStyle: naamJapaTypography.meaning.fontStyle,
              }}
              className="max-w-md mx-auto leading-relaxed transition-all"
            >
              Salutations to Lord Narayana, the supreme refuge of all sentient beings.
            </div>

            {/* Description Preview */}
            <div
              style={{
                fontFamily: naamJapaTypography.description.fontFamily,
                fontSize: `${naamJapaTypography.description.fontSize}px`,
                color: naamJapaTypography.description.color,
                fontWeight: naamJapaTypography.description.fontWeight,
                fontStyle: naamJapaTypography.description.fontStyle,
              }}
              className="max-w-md mx-auto leading-relaxed transition-all"
            >
              The eight-syllable Ashtakshara Mahamantra bestows eternal peace, fearlessness, and liberation.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  resetTypography('naamjapa');
                  triggerFeedback('click');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Naam Japa Styles to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. NORMAL JAPA / SADHANA TYPOGRAPHY CONTROLS */}
      {/* ======================================================== */}
      {activeSection === 'sadhana' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Part 1: Active Word (Currently recited) */}
            <SinglePartEditor
              title="1. Active Word"
              subtitle="Currently chanted word"
              config={sadhanaTypography.activeWord}
              onChange={(updates) => updateSadhanaTypography('activeWord', updates)}
              sizeRange={{ min: 20, max: 64 }}
              showGlow={true}
            />

            {/* Part 2: Completed Words */}
            <SinglePartEditor
              title="2. Completed Words"
              subtitle="Already chanted stanzas"
              config={sadhanaTypography.completedWord}
              onChange={(updates) => updateSadhanaTypography('completedWord', updates)}
              sizeRange={{ min: 16, max: 56 }}
              showOpacity={true}
            />

            {/* Part 3: Upcoming Words */}
            <SinglePartEditor
              title="3. Upcoming Words"
              subtitle="Awaiting recitation"
              config={sadhanaTypography.upcomingWord}
              onChange={(updates) => updateSadhanaTypography('upcomingWord', updates)}
              sizeRange={{ min: 16, max: 56 }}
              showOpacity={true}
            />

            {/* Header: Title & Deity */}
            <SinglePartEditor
              title="4. Header & Deity"
              subtitle="Stotra title badge"
              config={sadhanaTypography.header}
              onChange={(updates) => updateSadhanaTypography('header', updates)}
              sizeRange={{ min: 11, max: 22 }}
            />
          </div>

          {/* Live Interactive Normal Japa Preview Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/80 border border-amber-500/30 text-center space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/70">
                Live Normal Japa Chanting Preview
              </span>
              <span
                style={{
                  fontFamily: sadhanaTypography.header.fontFamily,
                  fontSize: `${sadhanaTypography.header.fontSize}px`,
                  color: sadhanaTypography.header.color,
                  fontWeight: sadhanaTypography.header.fontWeight,
                  fontStyle: sadhanaTypography.header.fontStyle,
                }}
              >
                Maa Lakshmi • Shri Suktam
              </span>
            </div>

            {/* Mantra line displaying completed, active, and upcoming words */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 py-3">
              {/* Completed word 1 */}
              <span
                style={{
                  fontFamily: sadhanaTypography.completedWord.fontFamily,
                  fontSize: `${sadhanaTypography.completedWord.fontSize}px`,
                  color: sadhanaTypography.completedWord.color,
                  fontWeight: sadhanaTypography.completedWord.fontWeight,
                  fontStyle: sadhanaTypography.completedWord.fontStyle,
                  opacity: sadhanaTypography.completedWord.opacity,
                }}
                className="transition-all"
              >
                ॐ
              </span>

              {/* Completed word 2 */}
              <span
                style={{
                  fontFamily: sadhanaTypography.completedWord.fontFamily,
                  fontSize: `${sadhanaTypography.completedWord.fontSize}px`,
                  color: sadhanaTypography.completedWord.color,
                  fontWeight: sadhanaTypography.completedWord.fontWeight,
                  fontStyle: sadhanaTypography.completedWord.fontStyle,
                  opacity: sadhanaTypography.completedWord.opacity,
                }}
                className="transition-all"
              >
                हिरण्यवर्णाम्
              </span>

              {/* Active word (Glowing) */}
              <span
                style={{
                  fontFamily: sadhanaTypography.activeWord.fontFamily,
                  fontSize: `${sadhanaTypography.activeWord.fontSize}px`,
                  color: sadhanaTypography.activeWord.color,
                  fontWeight: sadhanaTypography.activeWord.fontWeight,
                  fontStyle: sadhanaTypography.activeWord.fontStyle,
                  textShadow: sadhanaTypography.activeWord.glow
                    ? `0 0 16px ${sadhanaTypography.activeWord.color}99`
                    : 'none',
                }}
                className="px-2 py-0.5 rounded bg-amber-500/15 ring-1 ring-amber-500/40 transition-all scale-105"
              >
                हरिणीम्
              </span>

              {/* Upcoming word 1 */}
              <span
                style={{
                  fontFamily: sadhanaTypography.upcomingWord.fontFamily,
                  fontSize: `${sadhanaTypography.upcomingWord.fontSize}px`,
                  color: sadhanaTypography.upcomingWord.color,
                  fontWeight: sadhanaTypography.upcomingWord.fontWeight,
                  fontStyle: sadhanaTypography.upcomingWord.fontStyle,
                  opacity: sadhanaTypography.upcomingWord.opacity,
                }}
                className="transition-all"
              >
                सुवर्णरजतस्रजाम्
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  resetTypography('sadhana');
                  triggerFeedback('click');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Normal Japa Styles to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
