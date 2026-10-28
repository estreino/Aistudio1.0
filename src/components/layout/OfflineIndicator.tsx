import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 text-xs font-semibold shadow-lg backdrop-blur-md animate-fade-in border border-amber-400">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline</span>
      <span className="text-[10px] opacity-75 flex items-center gap-1">
        • <Database className="w-3 h-3 inline" /> IndexedDB Ativo
      </span>
    </div>
  );
};
