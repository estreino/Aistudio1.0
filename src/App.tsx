import React, { useState } from 'react';
import { TabId } from './types/navigation';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { TodayView } from './views/TodayView';
import { DiaryView } from './views/DiaryView';
import { NutritionView } from './views/NutritionView';
import { WorkoutView } from './views/WorkoutView';
import { SleepView } from './views/SleepView';
import { AnalyticsView } from './views/AnalyticsView';
import { AssistantView } from './views/AssistantView';
import { SettingsView } from './views/SettingsView';
import { OfflineIndicator } from './components/layout/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView onNavigateTab={setActiveTab} />;
      case 'diary':
        return <DiaryView />;
      case 'nutrition':
        return <NutritionView />;
      case 'workout':
        return <WorkoutView />;
      case 'sleep':
        return <SleepView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'assistant':
        return <AssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-slate-950 text-slate-100 select-none">
      {/* Alerta não intrusivo de Modo Offline / Avião */}
      <OfflineIndicator />

      {/* Cabeçalho Fixo com Suporte a Safe Area Top */}
      <AppHeader
        activeTab={activeTab}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Conteúdo Central Rolável dentro da Safe Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 overflow-y-auto">
        {renderActiveView()}
      </main>

      {/* Barra de Navegação Inferior Fixa com Suporte a Safe Area Bottom */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
