import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  User,
  Shield,
  Smartphone,
  Laptop,
  Database,
  Key,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function AuthModal() {
  const {
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
    googleClientId,
    setGoogleClientId,
    cloudWorkerUrl,
    setCloudWorkerUrl,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCloudHealth
  } = useApp();

  const googleBtnContainerRef = useRef(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState(googleClientId || '');
  const [customWorkerInput, setCustomWorkerInput] = useState(cloudWorkerUrl || '');
  const [healthStatus, setHealthStatus] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Test Cloudflare Worker + D1 health
  useEffect(() => {
    if (isAuthModalOpen) {
      checkCloudHealth(cloudWorkerUrl).then(setHealthStatus);
    }
  }, [isAuthModalOpen, cloudWorkerUrl]);

  // Render Google Identity Services button if script & client id are present
  useEffect(() => {
    if (!isAuthModalOpen || user) return;

    const effectiveClientId = customClientIdInput || googleClientId;

    if (window.google?.accounts?.id && effectiveClientId && googleBtnContainerRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoginLoading(true);
              setErrorMessage('');
              try {
                await loginWithGoogle(response.credential);
              } catch (err) {
                setErrorMessage(err.message || 'Google authentication failed');
              } finally {
                setLoginLoading(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: 280,
        });
      } catch (err) {
        console.warn('GIS render error:', err);
      }
    }
  }, [isAuthModalOpen, user, customClientIdInput, googleClientId]);

  if (!isAuthModalOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    setErrorMessage('');
    const res = await syncWithCloud();
    setIsSyncing(false);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleDemoSignIn = async () => {
    setLoginLoading(true);
    setErrorMessage('');
    try {
      await loginWithDemo('Sadhak Devotee', 'bhakt@pashyanti.org');
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const saveConfiguration = () => {
    setGoogleClientId(customClientIdInput.trim());
    setCloudWorkerUrl(customWorkerInput.trim());
    setShowConfig(false);
    checkCloudHealth(customWorkerInput.trim()).then(setHealthStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all bg-slate-900 border-slate-800 text-slate-100 light:bg-white light:border-amber-200 light:text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-950/50 border-slate-800/80 light:bg-amber-50/60 light:border-amber-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif tracking-wide text-amber-400 light:text-amber-800">
                Pashyanti 3.0 Cloud Vault
              </h2>
              <p className="text-[11px] text-slate-400 light:text-slate-600">
                Cloudflare D1 Multi-Device Sync
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 light:hover:bg-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGGED IN VIEW */}
          {user ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 light:bg-amber-50/50 light:border-amber-200/70 flex items-center gap-3.5">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'Devotee'}
                    className="w-12 h-12 rounded-full border-2 border-amber-500/50 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate text-slate-100 light:text-slate-900">
                      {user.name || user.email || 'Devotee'}
                    </h3>
                    {user.isDemo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 light:text-slate-600 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' :
                      syncStatus === 'syncing' ? 'bg-amber-400 animate-spin' :
                      'bg-slate-500'
                    }`} />
                    <span className="text-[11px] font-mono text-emerald-400 light:text-emerald-700">
                      {syncStatus === 'synced' ? 'Cloudflare D1 Connected' :
                       syncStatus === 'syncing' ? 'Syncing...' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Device Status Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border bg-slate-950/30 border-slate-800/80 light:bg-amber-50/30 light:border-amber-200/50">
                  <div className="flex items-center gap-1.5 text-slate-400 light:text-slate-600 mb-1">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>D1 Revision</span>
                  </div>
                  <span className="font-mono font-semibold text-sm text-amber-400">
                    #{cloudRevision || '1'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border bg-slate-950/30 border-slate-800/80 light:bg-amber-50/30 light:border-amber-200/50">
                  <div className="flex items-center gap-1.5 text-slate-400 light:text-slate-600 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Last Synced</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300 light:text-slate-700 truncate block">
                    {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-98 transition-all shadow-md shadow-amber-500/10 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing with D1 Database...' : 'Sync Now with Cloud'}</span>
                </button>

                <button
                  onClick={() => logout(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* NOT LOGGED IN VIEW */
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-2.5 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-100 light:text-slate-900">
                  Sign in with Google
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-600 max-w-xs mx-auto">
                  Automatically sync your Naam Japa counts, custom stotras, and sadhana mantras across your mobile, tablet, and PC.
                </p>
              </div>

              {/* Devices Sync Preview */}
              <div className="flex items-center justify-center gap-4 py-2 text-slate-400 text-xs border-y border-slate-800/60 light:border-amber-200/60">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Android PWA</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-amber-500" />
                  <span>Desktop Web</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cloudflare D1</span>
                </div>
              </div>

              {/* Google Sign-In Button Container */}
              <div className="flex flex-col items-center justify-center gap-3 pt-1">
                <div ref={googleBtnContainerRef} className="min-h-[44px] flex items-center justify-center" />

                {/* Instant Demo Devotee Login Button */}
                <button
                  onClick={handleDemoSignIn}
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-98 transition-all"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>
                    {loginLoading ? 'Authenticating...' : 'Instant Devotee Login (Test D1 Sync)'}
                  </span>
                </button>
              </div>

              {/* Optional Config Toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>{showConfig ? 'Hide Cloudflare & Google Configuration' : 'Configure Google Client ID & Worker URL'}</span>
                </button>
              </div>

              {/* Configuration Panel */}
              {showConfig && (
                <div className="p-3.5 rounded-xl border space-y-3 bg-slate-950/60 border-slate-800 light:bg-amber-50/40 light:border-amber-200">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 light:text-slate-700 block mb-1">
                      Google OAuth Client ID:
                    </label>
                    <input
                      type="text"
                      value={customClientIdInput}
                      onChange={(e) => setCustomClientIdInput(e.target.value)}
                      placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-900 border-slate-700 text-slate-200 light:bg-white light:border-amber-300"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Create this in Google Cloud Console &gt; APIs & Services &gt; Credentials.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 light:text-slate-700 block mb-1">
                      Cloudflare Worker URL:
                    </label>
                    <input
                      type="text"
                      value={customWorkerInput}
                      onChange={(e) => setCustomWorkerInput(e.target.value)}
                      placeholder="Leave blank for /api or e.g. https://pashyanti3-worker.workers.dev"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-900 border-slate-700 text-slate-200 light:bg-white light:border-amber-300"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Backend: {healthStatus?.database?.connected ? '✅ D1 Connected' : 'Checking...'}
                    </span>
                    <button
                      type="button"
                      onClick={saveConfiguration}
                      className="px-3 py-1 text-xs rounded-lg bg-amber-500 text-slate-950 font-semibold hover:brightness-110"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
