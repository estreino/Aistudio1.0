import React, { useState } from 'react';
import { Moon, Bed, Sun, Sparkles, Clock, AlertCircle, Plus, History } from 'lucide-react';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { SleepEntry } from '../types/models';
import { SleepLogModal } from '../components/sleep/SleepLogModal';
import { TimelineItem } from '../components/diary/TimelineItem';

export const SleepView: React.FC = () => {
  const { entries, addEntry, removeEntry } = useRoutineStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sleepEntries = entries.filter((e) => e.type === 'sleep') as SleepEntry[];
  const latestSleep = sleepEntries.length > 0 ? sleepEntries[0] : null;

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Botão de Ação Rápida */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div>
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
            Monitoramento de Sono
          </span>
          <span className="text-xs text-slate-300">Registre sua noite de descanso</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Sono</span>
        </button>
      </div>

      {/* Resumo da Noite Mais Recente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Moon className="w-5 h-5" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Última Noite Registrada
            </h2>
          </div>
          {latestSleep ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-mono">
              Nota: {latestSleep.qualityRating}/5
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              Sem registro
            </span>
          )}
        </div>

        {latestSleep ? (
          <div className="space-y-3 pt-1">
            <div className="text-center p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/40">
              <span className="text-xs text-slate-400 block mb-0.5">Duração Total de Repouso</span>
              <span className="text-2xl font-bold text-indigo-200 font-mono">
                {Math.floor(latestSleep.durationMinutes / 60)}h{' '}
                {latestSleep.durationMinutes % 60}m
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                ({latestSleep.durationMinutes} minutos calculados)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                  <Bed className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deitou</span>
                </div>
                <span className="text-sm font-semibold text-slate-200 font-mono">
                  {formatTime(latestSleep.bedTime)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Despertou</span>
                </div>
                <span className="text-sm font-semibold text-slate-200 font-mono">
                  {formatTime(latestSleep.wakeTime)}
                </span>
              </div>
            </div>

            {latestSleep.awakeningsCount && (
              <p className="text-xs text-slate-400">
                Interrupções noturnas: <strong className="text-slate-300">{latestSleep.awakeningsCount}</strong>
              </p>
            )}

            {latestSleep.notes && (
              <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                "{latestSleep.notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-1">
            <p className="text-sm text-slate-400">Nenhum sono registrado ainda.</p>
            <p className="text-xs text-slate-500">
              Toque em "Registrar Sono" para calcular a duração da sua noite.
            </p>
          </div>
        )}
      </div>

      {/* Regra Técnica de Cálculo (Cruzar Meia-Noite) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Precisão no Cálculo Noturno
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          O cálculo de sono processa rigorosamente períodos que cruzam a meia-noite (ex: deitar às 23:30 e despertar
          às 07:15 calcula exatamente 7h 45m de repouso). Nunca haverá duração negativa ou distorcida.
        </p>
      </div>

      {/* Histórico das Noites Anteriores */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            Histórico de Sono ({sleepEntries.length})
          </span>
        </div>

        {sleepEntries.length > 0 ? (
          <div className="space-y-2">
            {sleepEntries.slice(0, 5).map((sleep) => (
              <TimelineItem key={sleep.id} entry={sleep} onDelete={removeEntry} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-500">
            Nenhuma noite salva no histórico local.
          </div>
        )}
      </div>

      {/* Aviso de Saúde */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Saúde e Reflexão:</strong> O app é uma ferramenta de acompanhamento pessoal.
          Duração de sono não substitui avaliações clínicas de polissonografia nem diagnósticos médicos.
        </span>
      </div>

      {/* Modal de Sono */}
      <SleepLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSleep={addEntry}
      />
    </div>
  );
};
