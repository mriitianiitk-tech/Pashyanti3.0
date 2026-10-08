import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Volume2, VolumeX, Download, Cloud, User, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header() {
  const {
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    isInstallable,
    installPWA,
    activeTab,
    setActiveTab,
    user,
    syncStatus,
    setIsAuthModalOpen
  } = useApp();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-slate-950/80 border-slate-800/80 light:bg-amber-50/80 light:border-amber-200/80">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('naamjapa')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl font-sanskrit">ॐ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-serif tracking-wider text-amber-500 light:text-amber-700">
                Pashyanti
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PWA 3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-600 line-clamp-1">
              Mindful Sadhana & Cloud Japa
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Sync & Google Auth Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all active:scale-95 ${
              user
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 light:bg-emerald-50 light:border-emerald-300 light:text-emerald-800'
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:text-amber-400 hover:border-amber-500/30 light:border-amber-200 light:bg-amber-100/50 light:text-amber-900'
            }`}
            title={user ? `Signed in as ${user.name || user.email || 'Devotee'} (Cloudflare D1 Synced)` : 'Sign in with Google / Sync with D1'}
          >
            {user ? (
              <>
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'Devotee'}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden md:inline font-medium max-w-[80px] truncate">
                  {(user.name || user.email || 'Devotee').split(' ')[0]}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  syncStatus === 'syncing' ? 'bg-amber-400 animate-spin' :
                  syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' :
                  'bg-slate-500'
                }`} />
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline font-medium">Sync Cloud</span>
              </>
            )}
          </button>

          {/* PWA Install Button (if available on Android / browser) */}
          {isInstallable && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-sm"
              title="Install Pashyanti App on Android / Home Screen"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-900 light:border-amber-200 light:text-amber-900 light:hover:bg-amber-100 transition-colors"
            title={soundEnabled ? "Sound Enabled" : "Sound Muted"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-900 light:border-amber-200 light:text-amber-900 light:hover:bg-amber-100 transition-all active:scale-95"
            title={theme === 'dark' ? "Dark Mode (Tap for Light Mode)" : "Light Mode (Tap for Dark Mode)"}
            aria-label="Toggle Light and Dark Mode"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
