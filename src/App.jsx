import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import { TopNav, BottomNav } from './components/Navigation';
import NaamJapaView from './components/NaamJapa/NaamJapaView';
import SadhanaView from './components/Sadhana/SadhanaView';
import TreasuryView from './components/Treasury/TreasuryView';
import SettingsView from './components/Settings/SettingsView';
import AuthModal from './components/Auth/AuthModal';

function AppContent() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 light:bg-amber-50/40 light:text-slate-900 transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Cloud Auth & D1 Sync Modal */}
      <AuthModal />

      {/* Desktop Top Navigation Tabs */}
      <TopNav />

      {/* Main Dynamic View Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-2 sm:p-4 pb-24 md:pb-10">
        {activeTab === 'naamjapa' && <NaamJapaView />}
        {activeTab === 'sadhana' && <SadhanaView />}
        {activeTab === 'treasury' && <TreasuryView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Ergonomic Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
