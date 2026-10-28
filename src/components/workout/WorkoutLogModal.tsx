import React, { useState } from 'react';
import {
  X,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Zap,
  Flame,
  Award,
  Layers,
} from 'lucide-react';
import {
  WorkoutEntry,
  WorkoutExercise,
  ExerciseSet,
  CURRENT_SCHEMA_VERSION,
} from '../../types/models';

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkout: (workout: WorkoutEntry) => Promise<void>;
  initialDate?: string;
}

export const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkout,
  initialDate,
}) => {
  const [title, setTitle] = useState('Musculação - Peito e Tríceps');
  const [modality, setModality] = useState<WorkoutEntry['modality']>('strength');
  const [startTime, setStartTime] = useState(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(50);

  // Lista dinâmica de exercícios da sessão
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    {
      exerciseId: 'ex_1',
      name: 'Supino Reto',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 60, completed: true },
        { setNumber: 2, reps: 10, weightKg: 60, completed: true },
        { setNumber: 3, reps: 8, weightKg: 64, completed: true },
      ],
    },
  ]);

  const [perceivedEffort, setPerceivedEffort] = useState<number>(8); // RPE 1-10
  const [energyBefore, setEnergyBefore] = useState<number>(3); // 1-5
  const [energyAfter, setEnergyAfter] = useState<number>(4); // 1-5
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    const newEx: WorkoutExercise = {
      exerciseId: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: 'Novo Exercício',
      sets: [{ setNumber: 1, reps: 10, weightKg: 20, completed: true }],
    };
    setExercises([...exercises, newEx]);
  };

  const handleRemoveExercise = (exIdx: number) => {
    setExercises(exercises.filter((_, idx) => idx !== exIdx));
  };

  const handleUpdateExerciseName = (exIdx: number, newName: string) => {
    const updated = [...exercises];
    updated[exIdx].name = newName;
    setExercises(updated);
  };

  const handleAddSet = (exIdx: number) => {
    const updated = [...exercises];
    const currentSets = updated[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1];
    const newSet: ExerciseSet = {
      setNumber: currentSets.length + 1,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 20,
      completed: true,
    };
    updated[exIdx].sets.push(newSet);
    setExercises(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets = updated[exIdx].sets.filter((_, idx) => idx !== setIdx);
    // Reindexar números das séries
    updated[exIdx].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setExercises(updated);
  };

  const handleUpdateSet = (
    exIdx: number,
    setIdx: number,
    field: 'reps' | 'weightKg',
    value: number
  ) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  // Cálculo da tonelagem estimada ao vivo
  const liveTonnage = exercises.reduce((totalEx, ex) => {
    return (
      totalEx +
      ex.sets.reduce((totalSet, s) => {
        return totalSet + (s.completed !== false ? (s.reps || 0) * (s.weightKg || 0) : 0);
      }, 0)
    );
  }, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exercises.length === 0) return;
    setIsSubmitting(true);

    const dateBase = initialDate || new Date().toISOString().split('T')[0];
    const startIso = new Date(`${dateBase}T${startTime}:00`).toISOString();

    const newWorkout: WorkoutEntry = {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      type: 'workout',
      startTime: startIso,
      durationMinutes: durationMinutes || null,
      modality,
      title: title.trim() || 'Sessão de Treino',
      exercises,
      perceivedEffort: (perceivedEffort as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) || null,
      energyBefore: (energyBefore as 1 | 2 | 3 | 4 | 5) || null,
      energyAfter: (energyAfter as 1 | 2 | 3 | 4 | 5) || null,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveWorkout(newWorkout);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar sessão de treino:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 pb-safe space-y-4 shadow-2xl max-h-[92dvh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Registrar Treino</h2>
              <span className="text-[11px] text-slate-500">Séries, cargas e esforço RPE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Rolável */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Título e Modalidade */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Título do Treino:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Modalidade:</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as WorkoutEntry['modality'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 capitalize"
              >
                <option value="strength">Musculação (Strength)</option>
                <option value="cardio">Cardio / Corrida</option>
                <option value="hiit">HIIT / Circuito</option>
                <option value="mobility">Mobilidade / Alongamento</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          {/* Horário e Duração */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Início:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Duração (minutos):</label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Banner de Volume / Tonelagem */}
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Volume Total de Carga:</span>
            </div>
            <span className="text-sm font-bold text-emerald-300 font-mono">
              {Math.round(liveTonnage)} kg levantados
            </span>
          </div>

          {/* Lista Dinâmica de Exercícios e Séries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Exercícios da Sessão ({exercises.length})
              </span>
              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Exercício</span>
              </button>
            </div>

            {exercises.map((ex, exIdx) => (
              <div
                key={ex.exerciseId}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleUpdateExerciseName(exIdx, e.target.value)}
                    className="font-semibold text-slate-200 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-xs w-full"
                    placeholder="Nome do exercício..."
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400"
                      title="Remover exercício"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tabela de Séries */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-1.5 text-[10px] text-slate-500 uppercase font-mono px-1">
                    <span className="col-span-2">Série</span>
                    <span className="col-span-5 text-center">Reps</span>
                    <span className="col-span-4 text-center">Carga (kg)</span>
                    <span className="col-span-1"></span>
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={set.setNumber}
                      className="grid grid-cols-12 gap-1.5 items-center bg-slate-900 border border-slate-800/70 rounded-xl p-1.5"
                    >
                      <span className="col-span-2 text-center text-slate-400 font-mono text-[11px]">
                        #{set.setNumber}
                      </span>
                      <div className="col-span-5">
                        <input
                          type="number"
                          min="1"
                          value={set.reps}
                          onChange={(e) =>
                            handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 text-center font-mono text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={set.weightKg}
                          onChange={(e) =>
                            handleUpdateSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 text-center font-mono text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, setIdx)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    className="w-full py-1 text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-medium border border-dashed border-emerald-900/50 rounded-xl mt-1"
                  >
                    + Adicionar Série
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Esforço Percebido RPE (1 a 10) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">Esforço Percebido (RPE Borg 1 a 10):</label>
              <span className="text-emerald-300 font-mono font-bold">{perceivedEffort} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={perceivedEffort}
              onChange={(e) => setPerceivedEffort(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1: Muito leve</span>
              <span>5: Moderado</span>
              <span>8: Intenso</span>
              <span>10: Máximo absoluto</span>
            </div>
          </div>

          {/* Energia Antes e Depois */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Energia Antes (1-5):</span>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyBefore(lvl)}
                    className={`py-1 rounded-lg border text-center font-mono ${
                      energyBefore === lvl
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Energia Depois (1-5):</span>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyAfter(lvl)}
                    className={`py-1 rounded-lg border text-center font-mono ${
                      energyAfter === lvl
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-slate-400 block mb-1">Observações do treino (opcional):</label>
            <input
              type="text"
              placeholder="Ex: Treino muito produtivo, bati recorde no supino..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Botões */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || exercises.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Treino</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
