import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Vibrate,
  Type,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function SettingsView() {
  const {
    theme,
    setTheme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    vibrateEnabled,
    setVibrateEnabled,
    fontFamily,
    setFontFamily,
    isInstallable,
    installPWA,
    sadhanaMantras,
    naamJapaStotras,
    naamJapaSettings,
    naamJapaStats,
    user,
    syncStatus,
    lastSyncedAt,
    cloudRevision,
    syncWithCloud,
    setIsAuthModalOpen,
    triggerFeedback
  } = useApp();

  const fileInputRef = useRef(null);
  const [syncingNow, setSyncingNow] = useState(false);

  const fonts = [
    { id: 'Martel', name: 'Martel (Vedic / Devanagari)', sample: 'ॐ विष्णवे नमः' },
    { id: 'Mukta', name: 'Mukta (Clean Modern Sanskrit)', sample: 'ॐ नमो भगवते वासुदेवाय' },
    { id: 'Cinzel', name: 'Cinzel (Sacred Classical)', sample: 'Om Namah Shivaya' },
    { id: 'Playfair Display', name: 'Playfair Display (Serene Serif)', sample: 'Pashyanti Sadhana' },
    { id: 'Montserrat', name: 'Montserrat (Modern Minimal)', sample: 'Mindful Chanting' },
  ];

  // Export full JSON backup
  const handleExportData = () => {
    const backup = {
      version: '3.0',
      timestamp: new Date().toISOString(),
      theme,
      soundEnabled,
      vibrateEnabled,
      fontFamily,
      sadhanaMantras,
      naamJapaStotras,
      naamJapaSettings,
      naamJapaStats
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pashyanti3_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.sadhanaMantras) {
          localStorage.setItem('pashyanti_sadhana_mantras', JSON.stringify(parsed.sadhanaMantras));
        }
        if (parsed.naamJapaStotras) {
          localStorage.setItem('pashyanti_naamjapa_stotras', JSON.stringify(parsed.naamJapaStotras));
        }
        if (parsed.naamJapaStats) {
          localStorage.setItem('pashyanti_naamjapa_stats', JSON.stringify(parsed.naamJapaStats));
        }
        if (parsed.theme) {
          localStorage.setItem('pashyanti_theme', parsed.theme);
        }
        alert('Data restored successfully! The page will now reload.');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse the backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleManualSync = async () => {
    setSyncingNow(true);
    await syncWithCloud();
    setSyncingNow(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-6">
      
      {/* 0. CLOUDFLARE D1 & GOOGLE AUTHENTICATION (3.0) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20 border border-amber-500/30 light:bg-gradient-to-br light:from-amber-50 light:to-amber-100/40 light:border-amber-300 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-800 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">☁️</span>
            Cloudflare D1 & Multi-Device Sync
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pashyanti 3.0
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 light:bg-white light:border-amber-200 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-200 light:text-slate-900 flex items-center gap-2">
                <span>{user ? `Logged In: ${user.name}` : 'Current Mode: Local / Guest'}</span>
                <span className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' :
                  syncStatus === 'syncing' ? 'bg-amber-400 animate-spin' :
                  'bg-slate-500'
                }`} />
              </div>
              <p className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
                {user 
                  ? `${user.email} • Cloud revision #${cloudRevision || 1}` 
                  : 'Sign in with Google to sync mantras & counters across all devices'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={handleManualSync}
                  disabled={syncingNow}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${syncingNow ? 'animate-spin' : ''}`} />
                  <span>{syncingNow ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-semibold hover:brightness-110 shadow-sm transition-all"
              >
                {user ? 'Manage Cloud Account' : 'Sign In with Google'}
              </button>
            </div>
          </div>

          {/* Sync Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 light:border-amber-200/80 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/60 light:bg-amber-50/60 border border-slate-800/50 light:border-amber-200/60">
              <span className="text-slate-400 light:text-slate-600 block">Sadhana Mantras</span>
              <span className="font-semibold text-amber-400 font-mono">{sadhanaMantras?.length || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 light:bg-amber-50/60 border border-slate-800/50 light:border-amber-200/60">
              <span className="text-slate-400 light:text-slate-600 block">Stotras In Vault</span>
              <span className="font-semibold text-amber-400 font-mono">{naamJapaStotras?.length || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 light:bg-amber-50/60 border border-slate-800/50 light:border-amber-200/60">
              <span className="text-slate-400 light:text-slate-600 block">Naam Japa Chants</span>
              <span className="font-semibold text-amber-400 font-mono">{naamJapaStats?.totalCount || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 light:bg-amber-50/60 border border-slate-800/50 light:border-amber-200/60">
              <span className="text-slate-400 light:text-slate-600 block">Last Synced</span>
              <span className="font-semibold text-slate-300 light:text-slate-700 font-mono truncate block">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. APPEARANCE & THEME */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-700 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          Display & Appearance
        </h3>

        {/* Light vs Dark Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold shadow-md shadow-amber-950/20'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-sm">Sacred Dark Mode</span>
            <span className="text-[11px] text-slate-500">Subtle contrast, night meditation</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 light:text-amber-800 font-bold shadow-md'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 light:border-amber-200 light:bg-amber-50/50'
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-sm">Temple Light Mode</span>
            <span className="text-[11px] text-slate-500 light:text-slate-600">Pure sandstone & warm ivory</span>
          </button>
        </div>
      </div>

      {/* 2. TYPOGRAPHY */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-700 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Sacred Typography & Fonts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {fonts.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFontFamily(f.id);
                triggerFeedback('click');
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                fontFamily === f.id
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-semibold'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/30 text-slate-300 light:border-amber-200 light:bg-amber-50/40 light:text-slate-700'
              }`}
            >
              <div className="text-xs font-sans text-slate-400 light:text-slate-500 mb-1">
                {f.name}
              </div>
              <div className="text-lg text-slate-100 light:text-slate-900" style={{ fontFamily: f.id }}>
                {f.sample}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. SOUND & HAPTIC FEEDBACK */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-700 flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Audio & Tactile Feedback
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 light:bg-amber-50/60 border border-slate-800/80 light:border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 light:text-slate-800">
                  Tibetan Singing Bowl Bell
                </div>
                <div className="text-[11px] text-slate-400 light:text-slate-500">
                  Plays harmonic chime on completion and clicks on tap
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                triggerFeedback('chime');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 light:bg-amber-50/60 border border-slate-800/80 light:border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Vibrate className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 light:text-slate-800">
                  Haptic Vibration on Tap
                </div>
                <div className="text-[11px] text-slate-400 light:text-slate-500">
                  Subtle tactile click vibration on Android and mobile devices
                </div>
              </div>
            </div>
            <button
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                vibrateEnabled ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  vibrateEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. ANDROID PWA INSTALLATION GUIDE */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-700 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Android App Installation (PWA)
        </h3>

        <div className="p-4 rounded-xl bg-slate-950/40 light:bg-amber-50/60 border border-slate-800/80 light:border-amber-200 text-xs text-slate-300 light:text-slate-700 space-y-2">
          <p className="font-semibold text-amber-400 light:text-amber-800">
            Install directly on your Android Smartphone:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 light:text-slate-600">
            <li>Works 100% offline with zero data consumption.</li>
            <li>Runs full-screen like a native Android app without browser URL bars.</li>
            <li>In Chrome on Android, tap the top menu (⋮) and select <b>"Install App"</b> or <b>"Add to Home screen"</b>.</li>
          </ul>

          {isInstallable && (
            <div className="pt-2">
              <button
                onClick={installPWA}
                className="w-full py-2.5 px-4 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                Install Pashyanti App on Android Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. DATA BACKUP & RESTORE */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 light:bg-white light:border-amber-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 light:text-amber-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Data Backup & Transfer
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportData}
            className="p-3 rounded-xl border border-slate-700 light:border-amber-300 hover:border-amber-500 bg-slate-950/40 light:bg-amber-50 text-slate-200 light:text-slate-800 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-amber-500" />
            Export Backup (JSON)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportData}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl border border-slate-700 light:border-amber-300 hover:border-amber-500 bg-slate-950/40 light:bg-amber-50 text-slate-200 light:text-slate-800 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            Restore Backup (JSON)
          </button>
        </div>
      </div>

    </div>
  );
}
