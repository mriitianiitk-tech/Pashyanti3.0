import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Sparkles, BookOpen, Settings2 } from 'lucide-react';

export const tabsConfig = [
  {
    id: 'naamjapa',
    label: 'Naam Japa',
    shortLabel: 'Naam Japa',
    icon: Sparkles,
    badge: 'New',
    description: 'Sahasranama, Sukta & Stotra recitation'
  },
  {
    id: 'sadhana',
    label: 'Japa Sadhana',
    shortLabel: 'Sadhana',
    icon: Flame,
    description: 'Mantra chanting & meditative focus'
  },
  {
    id: 'treasury',
    label: 'Treasury',
    shortLabel: 'Treasury',
    icon: BookOpen,
    description: 'Sacred texts library & stotras'
  },
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings2,
    description: 'Themes, typography & preferences'
  }
];

export function TopNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="hidden md:flex items-center justify-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80 light:bg-amber-100/60 light:border-amber-200/80 max-w-xl mx-auto my-3 shadow-inner">
      {tabsConfig.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
              isActive
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-amber-200/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-500/80'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-amber-800 text-amber-200' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const { activeTab, setActiveTab, triggerFeedback } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 light:bg-amber-50/95 light:border-amber-200/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-colors">
      <div className="flex items-center justify-around">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerFeedback('click');
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-amber-500 font-semibold light:text-amber-700 scale-105'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500 light:text-amber-700' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-950 light:ring-amber-50" />
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.shortLabel}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
