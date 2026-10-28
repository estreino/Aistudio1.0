import React, { useState } from 'react';
import {
  Moon,
  Utensils,
  Droplets,
  Coffee,
  Dumbbell,
  Zap,
  Clock,
  Bell,
  Plus,
  ArrowRight,
  Mic,
  Sparkles,
} from 'lucide-react';
import { TabId } from '../types/navigation';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { QuickEntryModal } from '../components/diary/QuickEntryModal';
import { TimelineItem } from '../components/diary/TimelineItem';
import { VoiceInputModal } from '../components/voice/VoiceInputModal';
import { DraftReviewModal } from '../components/ai/DraftReviewModal';
import { geminiService, DraftParseResult } from '../services/ai/geminiService';
import {
  HydrationEntry,
  CaffeineEntry,
  SleepEntry,
  WorkoutEntry,
  EnergyEntry,
  MealEntry,
  RoutineEntry,
} from '../types/models';

interface TodayViewProps {
  onNavigateTab: (tab: TabId) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onNavigateTab }) => {
  const { entries, addEntry, removeEntry, preferences } = useRoutineStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [draftResult, setDraftResult] = useState<DraftParseResult | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtra registros exclusivamente do dia de hoje
  const todayEntries = entries.filter((e) => {
    let dateStr = '';
    if ('timestamp' in e && typeof e.timestamp === 'string') dateStr = e.timestamp.split('T')[0];
    else if ('wakeTime' in e && typeof e.wakeTime === 'string') dateStr = e.wakeTime.split('T')[0];
    else if ('startTime' in e && typeof e.startTime === 'string') dateStr = e.startTime.split('T')[0];
    return dateStr === todayStr;
  });

  // 1. Água
  const waterEntries = todayEntries.filter((e) => e.type === 'hydration') as HydrationEntry[];
  const totalWaterMl = waterEntries.reduce((sum, e) => sum + (e.volumeMl || 0), 0);

  // 2. Cafeína
  const caffeineEntries = todayEntries.filter((e) => e.type === 'caffeine') as CaffeineEntry[];
  const totalCaffeineMg = caffeineEntries.reduce((sum, e) => sum + (e.estimatedCaffeineMg || 0), 0);

  // 3. Sono
  const sleepEntries = todayEntries.filter((e) => e.type === 'sleep') as SleepEntry[];
  const latestSleep = sleepEntries.length > 0 ? sleepEntries[0] : null;

  // 4. Treino
  const workoutEntries = todayEntries.filter((e) => e.type === 'workout') as WorkoutEntry[];

  // 5. Energia
  const energyEntries = todayEntries.filter((e) => e.type === 'energy') as EnergyEntry[];
  const latestEnergy = energyEntries.length > 0 ? energyEntries[0] : null;

  // 6. Refeições
  const mealEntries = todayEntries.filter((e) => e.type === 'meal') as MealEntry[];

  return (
    <div className="space-y-4 pb-28">
      {/* Botão de Registro Rápido no Topo */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Ação Rápida
          </span>
          <span className="text-xs text-slate-300">Registrar evento no seu diário</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            disabled={isProcessingVoice}
            className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900/60 text-purple-300 transition active:scale-95 disabled:opacity-50"
            title="Ditar por voz em português"
            aria-label="Ditar por voz"
          >
            {isProcessingVoice ? (
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Agora</span>
          </button>
        </div>
      </div>

      {/* Grid de Cartões de Resumo Diário */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sono */}
        <div
          onClick={() => onNavigateTab('sleep')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 cursor-pointer transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-950/50 border border-indigo-900/40">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Sono</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Duração da noite</div>
            {latestSleep ? (
              <div className="text-sm font-semibold text-slate-200">
                {Math.floor(latestSleep.durationMinutes / 60)}h{' '}
                {latestSleep.durationMinutes % 60 > 0 ? `${latestSleep.durationMinutes % 60}m` : ''}
                <span className="text-[11px] text-indigo-400 ml-1 font-normal">
                  ({latestSleep.qualityRating}/5)
                </span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic">Sem registro</div>
            )}
          </div>
        </div>

        {/* Hidratação */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 cursor-pointer transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-900/40">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Água</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Ingestão hídrica</div>
            {waterEntries.length > 0 ? (
              <div className="text-sm font-semibold text-cyan-300 font-mono">
                {totalWaterMl} ml
                {preferences.targetWaterMl && (
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    / {preferences.targetWaterMl}ml
                  </span>
                )}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic">Sem registro</div>
            )}
          </div>
        </div>

        {/* Refeições */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 cursor-pointer transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-amber-400">
            <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-900/40">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Alimentação</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Refeições salvas</div>
            {mealEntries.length > 0 ? (
              <div className="text-sm font-semibold text-amber-300">
                {mealEntries.length} {mealEntries.length === 1 ? 'refeição' : 'refeições'}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic">Sem registro</div>
            )}
          </div>
        </div>

        {/* Cafeína */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 cursor-pointer transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-orange-400">
            <div className="p-2 rounded-xl bg-orange-950/50 border border-orange-900/40">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Cafeína</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Dose acumulada</div>
            {caffeineEntries.length > 0 ? (
              <div className="text-sm font-semibold text-orange-300 font-mono">
                ~{totalCaffeineMg} mg
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  ({caffeineEntries.length} {caffeineEntries.length === 1 ? 'dose' : 'doses'})
                </span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic">Sem registro</div>
            )}
          </div>
        </div>

        {/* Treino */}
        <div
          onClick={() => onNavigateTab('workout')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 cursor-pointer transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-900/40">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Treino</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Sessão do dia</div>
            {workoutEntries.length > 0 ? (
              <div className="text-sm font-semibold text-emerald-300 truncate">
                {workoutEntries[0].title}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic">Sem registro</div>
            )}
          </div>
        </div>

        {/* Energia Percebida */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 cursor-pointer transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-yellow-400">
            <div className="p-2 rounded-xl bg-yellow-950/50 border border-yellow-900/40">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Energia (1-5)</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Mais recente</div>
            {latestEnergy ? (
              <div className="text-sm font-semibold text-yellow-300">
                Nível {latestEnergy.level}/5
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400 italic">Sem registro</div>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Eventos Registrados Hoje */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Linha do Tempo de Hoje ({todayEntries.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('diary')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Ver Diário Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayEntries.length > 0 ? (
          <div className="space-y-2">
            {todayEntries.slice(0, 5).map((entry) => (
              <TimelineItem key={entry.id} entry={entry} onDelete={removeEntry} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-1">
            <p className="text-sm text-slate-400">Nenhum evento registrado hoje ainda.</p>
            <p className="text-xs text-slate-500">
              Toque em "Registrar Agora" acima para salvar sua primeira água, café ou refeição.
            </p>
          </div>
        )}
      </div>

      {/* Lembretes e Hábitos */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">Lembretes & Rotina</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Horário de trabalho configurado: {preferences.workHours?.start} às {preferences.workHours?.end}.
          Lembre-se: horários habituais são referências visuais e nunca viram eventos confirmados sem seu toque.
        </p>
      </div>

      {/* Modal de Registro */}
      <QuickEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addEntry}
      />

      {/* Modal de Reconhecimento Vocal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmTranscript={async (spokenText) => {
          setIsProcessingVoice(true);
          try {
            const result = await geminiService.parseNaturalLanguageToDraft(spokenText);
            setDraftResult(result);
            setIsDraftModalOpen(true);
          } catch (err) {
            console.error('Erro ao processar áudio na visualização Hoje:', err);
          } finally {
            setIsProcessingVoice(false);
          }
        }}
      />

      {/* Modal de Revisão do Rascunho Extraído por Voz */}
      <DraftReviewModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        draftResult={draftResult}
        onConfirmSave={async (newEntry: RoutineEntry) => {
          await addEntry(newEntry);
        }}
      />
    </div>
  );
};
