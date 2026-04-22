import { useState } from 'react';
import { Rocket, Plus } from 'lucide-react';
import { ComponentList } from './components/ComponentList';
import { CreateComponentForm } from './components/CreateComponentForm';
import { LiveFeed } from './components/LiveFeed';
import { LaunchLoader } from './components/LaunchLoader';

export default function App() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-orange-400" />
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Nova Build Tracker</h1>
              <p className="text-[10px] text-slate-500 leading-none">Component Manufacturing Platform</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Component
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8 flex gap-8">
        <ComponentList />
        <LiveFeed />
      </main>

      {showCreate && (
        <CreateComponentForm onClose={() => setShowCreate(false)} />
      )}
      <LaunchLoader />
    </div>
  );
}
