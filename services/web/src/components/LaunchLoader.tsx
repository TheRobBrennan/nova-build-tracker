import { Rocket, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { subscribeToWsState } from '../apollo/client';

export function LaunchLoader() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToWsState(
      () => setIsConnecting(false),
      () => setIsConnecting(true)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isConnecting) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 5));
    }, 150);
    return () => clearInterval(interval);
  }, [isConnecting]);

  if (!isConnecting) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1e]">
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-orange-500/10 animate-pulse" />
        <div className="absolute -inset-4 rounded-full bg-orange-500/20 animate-ping" />
        <Rocket className="h-16 w-16 text-orange-400 animate-bounce" />
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold text-white tracking-wider">LAUNCH CONTROL</h2>
        <p className="mt-2 text-sm text-slate-400">Establishing telemetry link...</p>
      </div>

      <div className="mt-6 w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <WifiOff className="h-3 w-3" />
        <span>Reconnecting to launch control</span>
      </div>
    </div>
  );
}
