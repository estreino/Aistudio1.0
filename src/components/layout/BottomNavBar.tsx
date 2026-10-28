import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Utensils,
  Dumbbell,
  Moon,
  TrendingUp,
  Sparkles,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { TabId } from '../../types/navigation';

interface BottomNavBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isSecondaryActive = ['analytics', 'assistant', 'settings'].includes(activeTab);

  const handleTabClick = (tab: TabId) => {
    onSelectTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Menu 'Mais' para abas secundárias no iPhone */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
          <div
            className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 pb-safe space-y-3 shadow-2xl animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-label="Mais opções de navegação"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recursos Adicionais
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleTabClick('analytics')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Análises</span>
                <span className="text-[10px] text-slate-500 mt-0.5">7 dias & médias</span>
              </button>

              <button
                onClick={() => handleTabClick('assistant')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  activeTab === 'assistant'
                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Assistente</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Rascunhos e IA</span>
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  activeTab === 'settings'
                    ? 'bg-sky-950/40 border-sky-500/50 text-sky-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Ajustes</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Backup e perfil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior Fixa */}
      <nav
        aria-label="Navegação Principal"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 pb-safe transition-all"
      >
        <div className="max-w-md mx-auto grid grid-cols-6 items-center px-2 py-1">
          {/* Aba 1: Hoje */}
          <button
            onClick={() => handleTabClick('today')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'today'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
            aria-label="Hoje"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none tracking-tight">Hoje</span>
          </button>

          {/* Aba 2: Diário */}
          <button
            onClick={() => handleTabClick('diary')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'diary'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
            aria-label="Diário"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none tracking-tight">Diário</span>
          </button>

          {/* Aba 3: Alimentação */}
          <button
            onClick={() => handleTabClick('nutrition')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'nutrition'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
            aria-label="Alimentação"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none tracking-tight">Comida</span>
          </button>

          {/* Aba 4: Treino */}
          <button
            onClick={() => handleTabClick('workout')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'workout'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
            aria-label="Treino"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none tracking-tight">Treino</span>
          </button>

          {/* Aba 5: Sono */}
          <button
            onClick={() => handleTabClick('sleep')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'sleep'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
            aria-label="Sono"
          >
            <Moon className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none tracking-tight">Sono</span>
          </button>

          {/* Botão Mais (Abre drawer de Análises, Assistente, Configurações) */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition relative ${
              isSecondaryActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none tracking-tight">Mais</span>
            {isSecondaryActive && (
              <span className="absolute top-1 right-3 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
