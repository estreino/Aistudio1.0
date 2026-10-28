import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  History,
  Award,
  Layers,
  TrendingUp,
  Info,
  Calendar,
} from 'lucide-react';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { WorkoutEntry } from '../types/models';
import { WorkoutLogModal } from '../components/workout/WorkoutLogModal';
import { TimelineItem } from '../components/diary/TimelineItem';
import {
  calculateWorkoutStats,
  getExerciseProgression,
} from '../core/calculations/workoutCalculator';

export const WorkoutView: React.FC = () => {
  const { entries, addEntry, removeEntry } = useRoutineStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExerciseForProgression, setSelectedExerciseForProgression] = useState<string>('');

  const workoutEntries = entries.filter((e) => e.type === 'workout') as WorkoutEntry[];
  const latestWorkout = workoutEntries.length > 0 ? workoutEntries[0] : null;

  // Extrai lista única de nomes de exercícios realizados nos treinos anteriores
  const exerciseNamesSet = new Set<string>();
  workoutEntries.forEach((w) => {
    w.exercises?.forEach((ex) => {
      if (ex.name.trim()) exerciseNamesSet.add(ex.name.trim());
    });
  });
  const uniqueExerciseNames = Array.from(exerciseNamesSet);

  // Inicializa o exercício selecionado se ainda não houver
  const activeExerciseName = selectedExerciseForProgression || (uniqueExerciseNames[0] || '');
  const progressionList = getExerciseProgression(activeExerciseName, workoutEntries);

  const latestStats = latestWorkout ? calculateWorkoutStats(latestWorkout) : null;

  return (
    <div className="space-y-4 pb-28">
      {/* Botão de Registro */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Musculação & Cardio
          </span>
          <span className="text-xs text-slate-300">Registre sua sessão com séries e cargas</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Treino</span>
        </button>
      </div>

      {/* Destaque do Treino Mais Recente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Dumbbell className="w-5 h-5" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              {latestWorkout ? latestWorkout.title : 'Sessão Recente'}
            </h2>
          </div>
          {latestWorkout ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono capitalize">
              {latestWorkout.modality}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              Sem treino
            </span>
          )}
        </div>

        {latestWorkout && latestStats ? (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Volume Total</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  {latestStats.totalTonnageKg} kg
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Séries Totais</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {latestStats.totalSetsCount} séries
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">RPE / Esforço</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {latestWorkout.perceivedEffort ? `${latestWorkout.perceivedEffort}/10` : '--'}
                </span>
              </div>
            </div>

            {/* Lista dos Exercícios do Treino */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Exercícios Realizados:
              </span>
              {latestWorkout.exercises?.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-200">{ex.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {ex.sets.length} séries • Max:{' '}
                    {Math.max(...ex.sets.map((s) => s.weightKg))}kg
                  </span>
                </div>
              ))}
            </div>

            {latestWorkout.notes && (
              <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                "{latestWorkout.notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-1">
            <p className="text-sm text-slate-400">Nenhum treino registrado ainda.</p>
            <p className="text-xs text-slate-500">
              Toque em "Registrar Treino" para acompanhar exercícios, cargas e tonelagem.
            </p>
          </div>
        )}
      </div>

      {/* Evolução de Carga (Compara Apenas o Mesmo Exercício) */}
      {uniqueExerciseNames.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Progressão de Carga Real
              </h3>
            </div>
            <select
              value={activeExerciseName}
              onChange={(e) => setSelectedExerciseForProgression(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-emerald-300 focus:outline-none"
            >
              {uniqueExerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-400">
            Comparação estrita baseada nas sessões com o exercício <strong>{activeExerciseName}</strong>:
          </p>

          <div className="space-y-1.5">
            {progressionList.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-mono">{item.date}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">Carga Máx: {item.maxWeightKg} kg</span>
                  <span className="text-slate-500">Vol: {item.totalVolumeKg} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico Geral de Treinos */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" />
            Histórico de Treinos ({workoutEntries.length})
          </span>
        </div>

        {workoutEntries.length > 0 ? (
          <div className="space-y-2">
            {workoutEntries.slice(0, 5).map((w) => (
              <TimelineItem key={w.id} entry={w} onDelete={removeEntry} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-500">
            Nenhuma sessão de treino salva no histórico local.
          </div>
        )}
      </div>

      {/* Princípio de Comparação Confiável */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Sobrecarga Progressiva Factual:</strong> Comparações de evolução só são
          geradas para o mesmo exercício com cargas e repetições registradas. O app nunca inventa gasto calórico.
        </span>
      </div>

      {/* Modal de Treino */}
      <WorkoutLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveWorkout={addEntry}
      />
    </div>
  );
};
