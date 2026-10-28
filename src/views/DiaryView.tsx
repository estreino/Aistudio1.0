import React, { useState } from 'react';
import { Calendar, Filter, Plus, History, Sparkles, ChevronLeft, ChevronRight, Mic } from 'lucide-react';
import { EntryType, RoutineEntry } from '../types/models';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { TimelineItem } from '../components/diary/TimelineItem';
import { QuickEntryModal } from '../components/diary/QuickEntryModal';
import { VoiceInputModal } from '../components/voice/VoiceInputModal';
import { DraftReviewModal } from '../components/ai/DraftReviewModal';
import { geminiService, DraftParseResult } from '../services/ai/geminiService';

export const DiaryView: React.FC = () => {
  const { entries, addEntry, removeEntry, isLoading } = useRoutineStorage();

  const [selectedFilter, setSelectedFilter] = useState<'all' | EntryType>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [draftResult, setDraftResult] = useState<DraftParseResult | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState<boolean>(false);

  const filters: { id: 'all' | EntryType; label: string }[] = [
    { id: 'all', label: 'Tudo' },
    { id: 'hydration', label: 'Água' },
    { id: 'caffeine', label: 'Cafeína' },
    { id: 'energy', label: 'Energia' },
    { id: 'meal', label: 'Refeições' },
    { id: 'sleep', label: 'Sono' },
    { id: 'workout', label: 'Treino' },
  ];

  // Filtra entradas pela data selecionada
  const dateEntries = entries.filter((entry) => {
    let dateStr = '';
    if ('timestamp' in entry && typeof entry.timestamp === 'string') {
      dateStr = entry.timestamp.split('T')[0];
    } else if ('wakeTime' in entry && typeof entry.wakeTime === 'string') {
      dateStr = entry.wakeTime.split('T')[0];
    } else if ('startTime' in entry && typeof entry.startTime === 'string') {
      dateStr = entry.startTime.split('T')[0];
    }
    return dateStr === selectedDate;
  });

  // Filtra por categoria
  const filteredEntries = dateEntries.filter((entry) => {
    if (selectedFilter === 'all') return true;
    return entry.type === selectedFilter;
  });

  // Navegar dias
  const changeDateBy = (offsetDays: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 pb-28">
      {/* Controles de Data com Atalhos Ergonômicos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none font-medium"
              />
            </div>

            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
              aria-label="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Hoje
              </button>
            )}

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              disabled={isProcessingVoice}
              className="p-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900/60 text-purple-300 transition active:scale-95 disabled:opacity-50"
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
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros por Categoria com rolagem horizontal suave */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {filters.map((f) => {
            const count =
              f.id === 'all'
                ? dateEntries.length
                : dateEntries.filter((e) => e.type === f.id).length;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition flex items-center gap-1.5 ${
                  selectedFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{f.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedFilter === f.id
                        ? 'bg-slate-950/30 text-slate-950 font-bold'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Linha do Tempo de Eventos */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Carregando registros locais do seu aparelho...
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              Eventos ({filteredEntries.length})
            </span>
            <span className="text-[11px] text-slate-500">Ordem cronológica</span>
          </div>

          {filteredEntries.map((entry) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              onDelete={removeEntry}
            />
          ))}
        </div>
      ) : (
        /* Linha do Tempo Vazia */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-slate-800/60 text-slate-400">
            <History className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-300">Sem registros para esta data</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Nenhum evento registrado para{' '}
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Primeiro Registro</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Registro Rápido */}
      <QuickEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addEntry}
        initialDate={selectedDate}
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
            console.error('Erro ao processar áudio no diário:', err);
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
