import React from 'react';
import { ShieldCheck, HardDrive } from 'lucide-react';
import { TabId } from '../../types/navigation';

interface AppHeaderProps {
  activeTab: TabId;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ activeTab: _activeTab, onOpenSettings }) => {
  // Data atual formatada em português do Brasil
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 pt-safe pb-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
              MyRoutine AI
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              v1.0 Local
            </span>
          </div>
          <h1 className="text-sm font-medium text-slate-200 mt-0.5">{capitalizedDate}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs"
            title="Armazenamento 100% no seu dispositivo"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium hidden xs:inline">Privado</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 active:scale-95 transition"
            aria-label="Abrir configurações e privacidade"
          >
            <ShieldCheck className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
