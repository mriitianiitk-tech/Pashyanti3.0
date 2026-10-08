import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import NaamJapaUploadModal from '../NaamJapa/NaamJapaUploadModal';
import {
  BookOpen,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Upload,
  Download
} from 'lucide-react';
import { downloadCSVTemplate } from '../../utils/csvParser';

export default function TreasuryView() {
  const {
    naamJapaStotras,
    deleteNaamJapaStotra,
    updateNaamJapaSettings,
    sadhanaMantras,
    addSadhanaMantra,
    deleteSadhanaMantra,
    setSelectedMantraId,
    setActiveTab,
    resetSadhanaCount,
    triggerFeedback
  } = useApp();

  const [activeSection, setActiveSection] = useState('naamjapa'); // 'naamjapa' | 'sadhana'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddMantraOpen, setIsAddMantraOpen] = useState(false);

  // New Mantra form state
  const [newTitle, setNewTitle] = useState('');
  const [newDeity, setNewDeity] = useState('');
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('mantra');

  const handleStartNaamJapa = (stotraId) => {
    updateNaamJapaSettings({ selectedStotraId: stotraId });
    setActiveTab('naamjapa');
    triggerFeedback('click');
  };

  const handleStartSadhana = (mantraId) => {
    setSelectedMantraId(mantraId);
    setActiveTab('sadhana');
    triggerFeedback('click');
  };

  const handleSaveMantra = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newMantra = {
      id: `custom-mantra-${Date.now()}`,
      title: newTitle.trim(),
      deity: newDeity.trim() || 'Universal Divine',
      text: newText.trim(),
      type: newType,
      chants: 0,
      malas: 0
    };

    addSadhanaMantra(newMantra);
    setNewTitle('');
    setNewDeity('');
    setNewText('');
    setIsAddMantraOpen(false);
    triggerFeedback('chime');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-5">
      {/* Treasury Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Sacred Treasury
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600">
            Manage your Sahasranamas, Suktas, and Sadhana Mantras
          </p>
        </div>

        {/* Section Tabs */}
        <div className="inline-flex rounded-xl bg-slate-950 light:bg-amber-100 p-1 border border-slate-800 light:border-amber-300">
          <button
            onClick={() => setActiveSection('naamjapa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'naamjapa'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Naam Japa Stotras ({naamJapaStotras.length})
          </button>
          <button
            onClick={() => setActiveSection('sadhana')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'sadhana'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Sadhana Mantras ({sadhanaMantras.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: NAAM JAPA STOTRAS */}
      {activeSection === 'naamjapa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 light:text-slate-800 uppercase tracking-wider text-[11px]">
              Uploaded Sahasranamas & Stotras
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadCSVTemplate}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 light:text-slate-600 border border-slate-800 light:border-amber-300 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV Template</span>
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
            </div>
          </div>

          {naamJapaStotras.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 light:bg-white light:border-amber-200 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-200 light:text-slate-800">
                No Stotras in Naam Japa library yet
              </h4>
              <p className="text-xs text-slate-400 light:text-slate-600 max-w-sm mx-auto">
                Upload a 3-column CSV file (Sanskrit text, Meaning, Description) to practice Sahasranama, Sri Rudram, or Suktas.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload CSV File Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {naamJapaStotras.map((stotra) => (
                <div
                  key={stotra.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 light:bg-white light:border-amber-200 shadow-sm flex flex-col justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-serif font-bold text-amber-400 light:text-amber-800">
                        {stotra.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {stotra.items?.length || 0} Names
                      </span>
                    </div>
                    {stotra.deity && (
                      <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                        Deity: {stotra.deity}
                      </p>
                    )}
                    {stotra.items?.[0] && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-950/60 light:bg-amber-50 text-[11px] font-sanskrit text-slate-300 light:text-slate-700 line-clamp-1 border border-slate-800/80 light:border-amber-200">
                        Sample: {stotra.items[0].sanskrit}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 light:border-amber-200">
                    <button
                      onClick={() => handleStartNaamJapa(stotra.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Practice Naam Japa
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${stotra.title}" from your library?`)) {
                          deleteNaamJapaStotra(stotra.id);
                        }
                      }}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Stotra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SADHANA MANTRAS */}
      {activeSection === 'sadhana' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 light:text-slate-800 uppercase tracking-wider text-[11px]">
              Sadhana Mantras & Stotras
            </h3>
            <button
              onClick={() => setIsAddMantraOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mantra</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sadhanaMantras.map((mantra) => (
              <div
                key={mantra.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 light:bg-white light:border-amber-200 shadow-sm flex flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-serif font-bold text-amber-400 light:text-amber-800">
                      {mantra.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300 light:bg-amber-100 light:text-amber-800">
                      {mantra.type}
                    </span>
                  </div>
                  {mantra.deity && (
                    <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                      {mantra.deity}
                    </p>
                  )}
                  <div className="mt-2 text-xs font-mono text-slate-400 light:text-slate-600 flex items-center gap-3">
                    <span>Chants: <b className="text-amber-400 light:text-amber-700">{mantra.chants || 0}</b></span>
                    <span>Malas: <b className="text-slate-200 light:text-slate-800">{mantra.malas || 0}</b></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 light:border-amber-200">
                  <button
                    onClick={() => handleStartSadhana(mantra.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Chant in Sadhana
                  </button>
                  <button
                    onClick={() => resetSadhanaCount(mantra.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Reset chant counts"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  {sadhanaMantras.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${mantra.title}"?`)) {
                          deleteSadhanaMantra(mantra.id);
                        }
                      }}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Mantra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Mantra Modal */}
      {isAddMantraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 light:bg-white light:border-amber-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
              Add Custom Mantra or Stotra
            </h3>
            <form onSubmit={handleSaveMantra} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Maha Ganapati Mantra"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 light:bg-amber-50 light:border-amber-300 text-slate-100 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                    Deity
                  </label>
                  <input
                    type="text"
                    value={newDeity}
                    onChange={(e) => setNewDeity(e.target.value)}
                    placeholder="e.g. Lord Ganesha"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 light:bg-amber-50 light:border-amber-300 text-slate-100 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 light:bg-amber-50 light:border-amber-300 text-slate-100 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="mantra">Mantra</option>
                    <option value="stotra">Stotra</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Text * (Separate lines by Enter, stanzas by empty lines)
                </label>
                <textarea
                  required
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Om Shreem Hreem Kleem Glaum..."
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-slate-800 border border-slate-700 light:bg-amber-50 light:border-amber-300 text-slate-100 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMantraOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 light:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                  Save Mantra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      <NaamJapaUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
