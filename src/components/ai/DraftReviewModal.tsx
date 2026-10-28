import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  AlertTriangle,
  Droplets,
  Coffee,
  Zap,
  Utensils,
  Moon,
  Dumbbell,
  Lock,
} from 'lucide-react';
import {
  RoutineEntry,
  CURRENT_SCHEMA_VERSION,
  HydrationEntry,
  CaffeineEntry,
  EnergyEntry,
  MealEntry,
  SleepEntry,
  WorkoutEntry,
} from '../../types/models';
import { DraftParseResult } from '../../services/ai/geminiService';

interface DraftReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftResult: DraftParseResult | null;
  onConfirmSave: (entry: RoutineEntry) => Promise<void>;
}

export const DraftReviewModal: React.FC<DraftReviewModalProps> = ({
  isOpen,
  onClose,
  draftResult,
  onConfirmSave,
}) => {
  if (!isOpen || !draftResult) return null;

  const { category, draft, ambiguous, clarificationNeeded, usedOfflineFallback } = draftResult;

  const [title, setTitle] = useState(draft.title || 'Novo Registro');
  const [waterMl, setWaterMl] = useState(draft.waterMl || 300);
  const [caffeineMg, setCaffeineMg] = useState(draft.caffeineMg || 60);
  const [energyLevel, setEnergyLevel] = useState(draft.energyLevel || 3);
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState(draft.sleepDurationMinutes || 480);
  const [sleepQualityRating, setSleepQualityRating] = useState<1 | 2 | 3 | 4 | 5>(
    (draft.sleepQualityRating as 1 | 2 | 3 | 4 | 5) || 4
  );
  const [workoutModality, setWorkoutModality] = useState(draft.workoutModality || 'Musculação');
  const [workoutDurationMinutes, setWorkoutDurationMinutes] = useState(draft.workoutDurationMinutes || 45);
  const [notes, setNotes] = useState(draft.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const now = new Date();
    const nowIso = now.toISOString();
    const id = `ai_draft_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;

    let newEntry: RoutineEntry;

    if (category === 'hydration') {
      newEntry = {
        id,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        type: 'hydration',
        timestamp: nowIso,
        liquidType: 'water',
        volumeMl: waterMl,
        notes: notes || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } else if (category === 'caffeine') {
      newEntry = {
        id,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        type: 'caffeine',
        timestamp: nowIso,
        beverageName: draft.caffeineBeverage || 'Café',
        amount: 1,
        unit: 'cup',
        estimatedCaffeineMg: caffeineMg,
        source: 'estimated',
        confidence: 'medium',
        notes: notes || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } else if (category === 'energy') {
      newEntry = {
        id,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        type: 'energy',
        timestamp: nowIso,
        level: (energyLevel as 1 | 2 | 3 | 4 | 5) || 3,
        context: 'custom',
        customContextLabel: 'Interpretado por Voz/IA',
        notes: notes || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } else if (category === 'sleep') {
      const bedTime = new Date(now.getTime() - sleepDurationMinutes * 60000).toISOString();
      newEntry = {
        id,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        type: 'sleep',
        bedTime,
        wakeTime: nowIso,
        durationMinutes: sleepDurationMinutes,
        qualityRating: sleepQualityRating,
        notes: notes || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } else if (category === 'workout') {
      const modalityLower = workoutModality.toLowerCase();
      let modalityKey: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'mixed' | 'other' = 'strength';
      if (modalityLower.includes('corrida') || modalityLower.includes('caminhada') || modalityLower.includes('cardio') || modalityLower.includes('ciclismo') || modalityLower.includes('natação')) {
        modalityKey = 'cardio';
      } else if (modalityLower.includes('hiit') || modalityLower.includes('funcional')) {
        modalityKey = 'hiit';
      } else if (modalityLower.includes('alongamento') || modalityLower.includes('mobilidade') || modalityLower.includes('yoga')) {
        modalityKey = 'mobility';
      }

      const startTime = new Date(now.getTime() - workoutDurationMinutes * 60000).toISOString();
      newEntry = {
        id,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        type: 'workout',
        title: `Treino de ${workoutModality}`,
        startTime,
        endTime: nowIso,
        durationMinutes: workoutDurationMinutes,
        modality: modalityKey,
        exercises: [],
        notes: notes || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } else {
      newEntry = {
        id,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        type: 'meal',
        timestamp: nowIso,
        mealType: 'lunch',
        name: title,
        items: [],
        notes: notes || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }

    try {
      await onConfirmSave(newEntry);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar rascunho confirmado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'hydration':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'caffeine':
        return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'energy':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      default:
        return <Utensils className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Revisar Rascunho da IA</h2>
              <span className="text-[11px] text-slate-500">
                {usedOfflineFallback ? 'Heurística local offline' : 'Processado com Gemini 3.8 Flash'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aviso de Ambiguidade */}
        {ambiguous && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Informação Ambígua Detectada:</span>
              <p>{clarificationNeeded || 'Revise e complete as quantidades abaixo antes de salvar.'}</p>
            </div>
          </div>
        )}

        {/* Campos do Rascunho para Edição */}
        <div className="space-y-3 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                {getCategoryIcon()}
                Categoria Identificada:
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 capitalize">
                {category}
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Título:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {category === 'hydration' && (
              <div>
                <label className="text-slate-400 block mb-1">Volume de Água (ml):</label>
                <input
                  type="number"
                  step="50"
                  value={waterMl}
                  onChange={(e) => setWaterMl(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {category === 'caffeine' && (
              <div>
                <label className="text-slate-400 block mb-1">Cafeína Estimada (mg):</label>
                <input
                  type="number"
                  value={caffeineMg}
                  onChange={(e) => setCaffeineMg(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            {category === 'energy' && (
              <div>
                <label className="text-slate-400 block mb-1">Nível de Energia (1 a 5):</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`py-1.5 rounded-xl border text-center font-bold ${
                        energyLevel === lvl
                          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'sleep' && (
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400 block mb-1">Duração do Sono (minutos):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="15"
                      value={sleepDurationMinutes}
                      onChange={(e) => setSleepDurationMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs text-slate-400 shrink-0">
                      ≈ {(sleepDurationMinutes / 60).toFixed(1)}h
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Qualidade do Sono (1 a 5):</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSleepQualityRating(q as 1 | 2 | 3 | 4 | 5)}
                        className={`py-1.5 rounded-xl border text-center font-bold ${
                          sleepQualityRating === q
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {q}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === 'workout' && (
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400 block mb-1">Modalidade do Exercício:</label>
                  <input
                    type="text"
                    value={workoutModality}
                    onChange={(e) => setWorkoutModality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duração (minutos):</label>
                  <input
                    type="number"
                    step="5"
                    value={workoutDurationMinutes}
                    onChange={(e) => setWorkoutDurationMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1">Observações:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Garantia de Privacidade */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Este registro só será salvo após você clicar no botão abaixo.</span>
        </div>

        {/* Botões */}
        <div className="pt-2 border-t border-slate-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar e Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
