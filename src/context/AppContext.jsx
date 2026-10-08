import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { initialSadhanaMantras, initialNaamJapaStotras } from '../data/initialData';
import { playTibetanBowlChime, playSubtleClick, triggerHaptic } from '../utils/audio';
import {
  authenticateWithGoogle,
  authenticateWithDemo,
  fetchCurrentUser,
  pullCloudState,
  pushCloudState,
  checkCloudHealth
} from '../utils/cloudSync';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state: dark | light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pashyanti_theme') || 'dark';
  });

  // Active Tab: 'sadhana' | 'naamjapa' | 'treasury' | 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['sadhana', 'naamjapa', 'treasury', 'settings'].includes(tab)) {
      return tab;
    }
    return 'naamjapa'; // Open with requested Naam Japa or Sadhana
  });

  // Feedback options
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const val = localStorage.getItem('pashyanti_sound');
    return val !== null ? JSON.parse(val) : true;
  });

  const [vibrateEnabled, setVibrateEnabled] = useState(() => {
    const val = localStorage.getItem('pashyanti_vibrate');
    return val !== null ? JSON.parse(val) : true;
  });

  // Typography & Aesthetics
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('pashyanti_font') || 'Martel';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('pashyanti_accent') || 'saffron'; // saffron, indigo, sage, temple
  });

  // Sadhana Mantras & selected
  const [sadhanaMantras, setSadhanaMantras] = useState(() => {
    const stored = localStorage.getItem('pashyanti_sadhana_mantras');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { }
    }
    return initialSadhanaMantras;
  });

  const [selectedMantraId, setSelectedMantraId] = useState(() => {
    const stored = localStorage.getItem('pashyanti_selected_mantra_id');
    return stored || (initialSadhanaMantras[0]?.id || '');
  });

  // Naam Japa Stotras (Populated via presets or user CSV upload)
  const [naamJapaStotras, setNaamJapaStotras] = useState(() => {
    const stored = localStorage.getItem('pashyanti_naamjapa_stotras');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { }
    }
    return initialNaamJapaStotras;
  });

  // Naam Japa configuration
  const [naamJapaSettings, setNaamJapaSettings] = useState(() => {
    const stored = localStorage.getItem('pashyanti_naamjapa_settings');
    const defaultSettings = {
      selectedStotraId: 'all', // 'all' or specific id
      mode: 'random',          // 'random' | 'sequential'
      randomScope: 'single',   // 'single' (same stotra) | 'all' (among all stotras)
      showMeaning: true,
      showDescription: true,
      fontSize: 'large',       // 'normal' | 'large' | 'xlarge'
    };
    if (stored) {
      try { return { ...defaultSettings, ...JSON.parse(stored) }; } catch (e) { }
    }
    return defaultSettings;
  });

  // Naam Japa Counters (session & all-time)
  const [naamJapaStats, setNaamJapaStats] = useState(() => {
    const stored = localStorage.getItem('pashyanti_naamjapa_stats');
    const defaultStats = { sessionCount: 0, totalCount: 0 };
    if (stored) {
      try { return { ...defaultStats, ...JSON.parse(stored) }; } catch (e) { }
    }
    return defaultStats;
  });

  // ========================================================
  // 3.0 Cloudflare D1 & Google Authentication State
  // ========================================================
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pashyanti_auth_user');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { }
    }
    return null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('pashyanti_auth_token') || null;
  });

  // Configurable Worker URL (defaults to '' which uses relative /api)
  const [cloudWorkerUrl, setCloudWorkerUrl] = useState(() => {
    return localStorage.getItem('pashyanti_worker_url') || '';
  });

  // Google OAuth Client ID (can be configured in Settings or env)
  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem('pashyanti_google_client_id') || '';
  });

  // Sync Status: 'guest' | 'synced' | 'syncing' | 'offline' | 'error'
  const [syncStatus, setSyncStatus] = useState(() => {
    const token = localStorage.getItem('pashyanti_auth_token');
    return token ? 'synced' : 'guest';
  });

  const [lastSyncedAt, setLastSyncedAt] = useState(() => {
    return localStorage.getItem('pashyanti_last_synced_at') || null;
  });

  const [cloudRevision, setCloudRevision] = useState(() => {
    return localStorage.getItem('pashyanti_cloud_revision') || null;
  });

  const [syncError, setSyncError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Debounce ref for auto-sync
  const autoSyncTimeoutRef = useRef(null);
  const isSyncingRef = useRef(false);

  // PWA Install prompt holder
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Sync Theme to HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('pashyanti_theme', theme);
  }, [theme]);

  // Sync Preferences to LocalStorage
  useEffect(() => {
    localStorage.setItem('pashyanti_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('pashyanti_vibrate', JSON.stringify(vibrateEnabled));
  }, [vibrateEnabled]);

  useEffect(() => {
    localStorage.setItem('pashyanti_font', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('pashyanti_accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('pashyanti_sadhana_mantras', JSON.stringify(sadhanaMantras));
  }, [sadhanaMantras]);

  useEffect(() => {
    localStorage.setItem('pashyanti_selected_mantra_id', selectedMantraId);
  }, [selectedMantraId]);

  useEffect(() => {
    localStorage.setItem('pashyanti_naamjapa_stotras', JSON.stringify(naamJapaStotras));
  }, [naamJapaStotras]);

  useEffect(() => {
    localStorage.setItem('pashyanti_naamjapa_settings', JSON.stringify(naamJapaSettings));
  }, [naamJapaSettings]);

  useEffect(() => {
    localStorage.setItem('pashyanti_naamjapa_stats', JSON.stringify(naamJapaStats));
  }, [naamJapaStats]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pashyanti_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pashyanti_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('pashyanti_auth_token', authToken);
    } else {
      localStorage.removeItem('pashyanti_auth_token');
    }
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem('pashyanti_worker_url', cloudWorkerUrl);
  }, [cloudWorkerUrl]);

  useEffect(() => {
    localStorage.setItem('pashyanti_google_client_id', googleClientId);
  }, [googleClientId]);

  useEffect(() => {
    if (lastSyncedAt) {
      localStorage.setItem('pashyanti_last_synced_at', lastSyncedAt);
    }
  }, [lastSyncedAt]);

  useEffect(() => {
    if (cloudRevision) {
      localStorage.setItem('pashyanti_cloud_revision', String(cloudRevision));
    }
  }, [cloudRevision]);

  // Catch PWA beforeinstallprompt on Android/Chrome
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Sound & Haptic helper
  const triggerFeedback = (type = 'click') => {
    if (type === 'chime') {
      playTibetanBowlChime(soundEnabled);
      triggerHaptic([40, 60, 40], vibrateEnabled);
    } else {
      playSubtleClick(soundEnabled);
      triggerHaptic([20], vibrateEnabled);
    }
  };

  // ========================================================
  // Core Cloud Sync Logic (D1 Database Integration)
  // ========================================================
  const syncWithCloud = useCallback(async ({ forcePush = false, silent = false } = {}) => {
    if (!authToken || !user) {
      setSyncStatus('guest');
      return { success: false, reason: 'Not authenticated' };
    }

    if (!navigator.onLine) {
      setSyncStatus('offline');
      return { success: false, reason: 'Offline' };
    }

    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (!silent) setSyncStatus('syncing');

    try {
      const payload = {
        sadhanaMantras,
        naamJapaStotras,
        naamJapaSettings,
        naamJapaStats,
        preferences: {
          theme,
          soundEnabled,
          vibrateEnabled,
          fontFamily,
          accentColor,
        },
      };

      const result = await pushCloudState(payload, authToken, cloudWorkerUrl, forcePush);

      if (result.success && result.data) {
        // Apply merged state from Cloudflare D1
        if (result.data.sadhanaMantras && Array.isArray(result.data.sadhanaMantras)) {
          setSadhanaMantras(result.data.sadhanaMantras);
        }
        if (result.data.naamJapaStotras && Array.isArray(result.data.naamJapaStotras)) {
          setNaamJapaStotras(result.data.naamJapaStotras);
        }
        if (result.data.naamJapaStats) {
          setNaamJapaStats(result.data.naamJapaStats);
        }
        if (result.data.naamJapaSettings) {
          setNaamJapaSettings(prev => ({ ...prev, ...result.data.naamJapaSettings }));
        }

        const now = new Date().toISOString();
        setLastSyncedAt(now);
        setCloudRevision(result.revision);
        setSyncStatus('synced');
        setSyncError(null);
        return { success: true, revision: result.revision };
      }
    } catch (err) {
      console.warn('Pashyanti Cloud Sync error:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Sync failed');
      return { success: false, error: err.message };
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    authToken,
    user,
    sadhanaMantras,
    naamJapaStotras,
    naamJapaSettings,
    naamJapaStats,
    theme,
    soundEnabled,
    vibrateEnabled,
    fontFamily,
    accentColor,
    cloudWorkerUrl
  ]);

  // Pull initial cloud state upon login or app launch
  const pullInitialCloudState = useCallback(async (token) => {
    try {
      setSyncStatus('syncing');
      const res = await pullCloudState(token, cloudWorkerUrl);
      if (res.exists && res.data) {
        const d = res.data;
        if (d.sadhanaMantras && d.sadhanaMantras.length > 0) {
          // Merge with current local
          setSadhanaMantras(prev => {
            const map = new Map();
            prev.forEach(m => map.set(m.id, m));
            d.sadhanaMantras.forEach(m => {
              if (map.has(m.id)) {
                const existing = map.get(m.id);
                map.set(m.id, {
                  ...existing,
                  chants: Math.max(existing.chants || 0, m.chants || 0),
                  malas: Math.max(existing.malas || 0, m.malas || 0),
                });
              } else {
                map.set(m.id, m);
              }
            });
            return Array.from(map.values());
          });
        }

        if (d.naamJapaStotras && d.naamJapaStotras.length > 0) {
          setNaamJapaStotras(prev => {
            const map = new Map();
            prev.forEach(s => map.set(s.id, s));
            d.naamJapaStotras.forEach(s => map.set(s.id, s));
            return Array.from(map.values());
          });
        }

        if (d.naamJapaStats) {
          setNaamJapaStats(prev => ({
            totalCount: Math.max(prev.totalCount || 0, d.naamJapaStats.totalCount || 0),
            sessionCount: Math.max(prev.sessionCount || 0, d.naamJapaStats.sessionCount || 0),
          }));
        }

        if (d.naamJapaSettings) {
          setNaamJapaSettings(prev => ({ ...prev, ...d.naamJapaSettings }));
        }

        setLastSyncedAt(res.serverUpdatedAt || new Date().toISOString());
        setCloudRevision(res.revision || 1);
        setSyncStatus('synced');
      } else {
        // First time cloud user: push local state to initialize D1
        syncWithCloud({ forcePush: true });
      }
    } catch (e) {
      console.warn('Initial cloud pull failed:', e);
      setSyncStatus('error');
      setSyncError(e.message);
    }
  }, [cloudWorkerUrl, syncWithCloud]);

  // Verify stored auth session on startup
  useEffect(() => {
    if (authToken) {
      fetchCurrentUser(authToken, cloudWorkerUrl)
        .then(u => {
          if (u) {
            setUser(u);
            pullInitialCloudState(authToken);
          } else {
            // Token expired or invalid
            setUser(null);
            setAuthToken(null);
            setSyncStatus('guest');
          }
        })
        .catch(() => {
          setSyncStatus('offline');
        });
    }
  }, []);

  // Debounced Auto-sync on data modifications when authenticated
  useEffect(() => {
    if (!authToken || !user) return;

    if (autoSyncTimeoutRef.current) {
      clearTimeout(autoSyncTimeoutRef.current);
    }

    autoSyncTimeoutRef.current = setTimeout(() => {
      syncWithCloud({ silent: true });
    }, 2500); // 2.5s debounce

    return () => {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, [
    sadhanaMantras,
    naamJapaStats,
    naamJapaStotras,
    naamJapaSettings,
    theme,
    soundEnabled,
    vibrateEnabled,
    fontFamily,
    accentColor
  ]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      if (authToken) {
        syncWithCloud({ silent: true });
      }
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authToken, syncWithCloud]);

  // Auth Actions
  const loginWithGoogle = async (credential) => {
    try {
      setSyncStatus('syncing');
      const res = await authenticateWithGoogle(credential, cloudWorkerUrl);
      setUser(res.user);
      setAuthToken(res.token);
      await pullInitialCloudState(res.token);
      setIsAuthModalOpen(false);
      return { success: true, user: res.user };
    } catch (err) {
      setSyncError(err.message);
      setSyncStatus('error');
      throw err;
    }
  };

  const loginWithDemo = async (name = 'Sadhak Devotee', email = 'bhakt@pashyanti.org') => {
    try {
      setSyncStatus('syncing');
      const res = await authenticateWithDemo(name, email, cloudWorkerUrl);
      setUser(res.user);
      setAuthToken(res.token);
      await pullInitialCloudState(res.token);
      setIsAuthModalOpen(false);
      return { success: true, user: res.user };
    } catch (err) {
      setSyncError(err.message);
      setSyncStatus('error');
      throw err;
    }
  };

  const logout = (clearLocalData = false) => {
    setUser(null);
    setAuthToken(null);
    setSyncStatus('guest');
    setLastSyncedAt(null);
    setCloudRevision(null);
    if (clearLocalData) {
      setSadhanaMantras(initialSadhanaMantras);
      setNaamJapaStotras(initialNaamJapaStotras);
      setNaamJapaStats({ sessionCount: 0, totalCount: 0 });
    }
  };

  // Sadhana Mantras actions
  const logSadhanaChant = (id) => {
    setSadhanaMantras(prev => prev.map(m => {
      if (m.id === id) {
        const nextChants = (m.chants || 0) + 1;
        const nextMalas = Math.floor(nextChants / 108);
        return { ...m, chants: nextChants, malas: nextMalas };
      }
      return m;
    }));
  };

  const resetSadhanaCount = (id) => {
    setSadhanaMantras(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, chants: 0, malas: 0 };
      }
      return m;
    }));
  };

  const addSadhanaMantra = (mantra) => {
    setSadhanaMantras(prev => [...prev, mantra]);
    setSelectedMantraId(mantra.id);
  };

  const deleteSadhanaMantra = (id) => {
    setSadhanaMantras(prev => {
      const filtered = prev.filter(m => m.id !== id);
      if (selectedMantraId === id && filtered.length > 0) {
        setSelectedMantraId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Naam Japa actions
  const addNaamJapaStotra = (stotra) => {
    setNaamJapaStotras(prev => [...prev, stotra]);
    if (naamJapaSettings.selectedStotraId === 'all' || !naamJapaSettings.selectedStotraId) {
      setNaamJapaSettings(prev => ({ ...prev, selectedStotraId: stotra.id }));
    }
  };

  const deleteNaamJapaStotra = (id) => {
    setNaamJapaStotras(prev => {
      const remaining = prev.filter(s => s.id !== id);
      if (naamJapaSettings.selectedStotraId === id) {
        setNaamJapaSettings(s => ({
          ...s,
          selectedStotraId: remaining.length > 0 ? remaining[0].id : 'all'
        }));
      }
      return remaining;
    });
  };

  const updateNaamJapaSettings = (newSettings) => {
    setNaamJapaSettings(prev => ({ ...prev, ...newSettings }));
  };

  const logNaamJapaChant = () => {
    setNaamJapaStats(prev => ({
      sessionCount: prev.sessionCount + 1,
      totalCount: prev.totalCount + 1
    }));
    triggerFeedback('click');
  };

  const resetNaamJapaSession = () => {
    setNaamJapaStats(prev => ({ ...prev, sessionCount: 0 }));
  };

  const resetNaamJapaAll = () => {
    setNaamJapaStats({ sessionCount: 0, totalCount: 0 });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        activeTab,
        setActiveTab,
        soundEnabled,
        setSoundEnabled,
        vibrateEnabled,
        setVibrateEnabled,
        fontFamily,
        setFontFamily,
        accentColor,
        setAccentColor,
        // Sadhana
        sadhanaMantras,
        selectedMantraId,
        setSelectedMantraId,
        logSadhanaChant,
        resetSadhanaCount,
        addSadhanaMantra,
        deleteSadhanaMantra,
        // Naam Japa
        naamJapaStotras,
        naamJapaSettings,
        updateNaamJapaSettings,
        addNaamJapaStotra,
        deleteNaamJapaStotra,
        naamJapaStats,
        logNaamJapaChant,
        resetNaamJapaSession,
        resetNaamJapaAll,
        // Cloudflare D1 & Google Authentication (3.0)
        user,
        authToken,
        loginWithGoogle,
        loginWithDemo,
        logout,
        syncWithCloud,
        syncStatus,
        lastSyncedAt,
        cloudRevision,
        syncError,
        cloudWorkerUrl,
        setCloudWorkerUrl,
        googleClientId,
        setGoogleClientId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        checkCloudHealth,
        // Feedback
        triggerFeedback,
        // PWA
        isInstallable,
        installPWA,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
