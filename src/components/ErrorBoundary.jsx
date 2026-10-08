import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Pashyanti ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin;
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl font-sanskrit">
                ॐ
              </div>
              <div>
                <h1 className="text-xl font-bold font-serif text-amber-400">
                  Pashyanti 3.0 • Recovery Screen
                </h1>
                <p className="text-xs text-slate-400">
                  A rendering error occurred while loading the view.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm font-mono break-words overflow-auto max-h-48">
              <p className="font-semibold text-red-400 mb-1">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-xs text-red-300/80 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Reload App
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-950/30 transition-all"
              >
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
