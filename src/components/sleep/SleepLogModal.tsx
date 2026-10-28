import React, { useState } from 'react';
import { X, Moon, Sun, Check, Clock, Sparkles } from 'lucide-react';
import { SleepEntry, CURRENT_SCHEMA_VERSION } from '../../types/models';
import { calculateSleepDurationFromTimes } from '../../core/calculations/sleepCalculator';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSleep: (entry: SleepEntry) => Promise<void>;
  initialDate?: string;
}

export const SleepLogModal: React.FC<SleepLogModalProps> = ({
  isOpen,
  onClose,
  onSaveSleep,
  initialDate,
}) => {
  const todayStr = initialDate || new Date().toISOString().split('T')[0];

  // Data do dia anterior para o horário de deitar
  const yesterday = new Date(todayStr + 'T00:00:00');
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const [bedDate, setBedDate] = useState<string>(yesterdayStr);
  const [bedTime, setBedTime] = useState<string>('23:15');
  const [wakeDate, setWakeDate] = useState<string>(todayStr);
  const [wakeTime, setWakeTime] = useState<string>('07:00');

  const [qualityRating, setQualityRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [awakenings, setAwakenings] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const durationCalc = calculateSleepDurationFromTimes(bedTime, wakeTime);

  const qualityLabels: Record<number, string> = {
    1: '1 - Péssimo (Muito cansado)',
    2: '2 - Ruim (Sono agitado)',
    3: '3 - Regular (Descanso razoável)',
    4: '4 - Bom (Bem descansado)',
    5: '5 - Excelente (Energia total)',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationCalc.isValid) return;
    setIsSubmitting(true);

    const bedDateTimeIso = new Date(`${bedDate}T${bedTime}:00`).toISOString();
    const wakeDateTimeIso = new Date(`${wakeDate}T${wakeTime}:00`).toISOString();

    const sleepEntry: SleepEntry = {
      id: `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      type: 'sleep',
      bedTime: bedDateTimeIso,
      wakeTime: wakeDateTimeIso,
      durationMinutes: durationCalc.durationMinutes,
      qualityRating,
      awakeningsCount: awakenings > 0 ? awakenings : null,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveSleep(sleepEntry);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar registro de sono:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[92dvh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Registrar Noite de Sono</h2>
              <span className="text-[11px] text-slate-500">Cálculo preciso com travessia de meia-noite</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Horários: Deitar e Despertar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Moon className="w-3.5 h-3.5" />
                <span>Horário de Deitar</span>
              </div>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-center text-sm focus:outline-none focus:border-indigo-500"
              />
              <input
                type="date"
                value={bedDate}
                onChange={(e) => setBedDate(e.target.value)}
                className="w-full bg-transparent text-[11px] text-slate-500 text-center focus:outline-none"
              />
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Sun className="w-3.5 h-3.5" />
                <span>Despertar</span>
              </div>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-center text-sm focus:outline-none focus:border-indigo-500"
              />
              <input
                type="date"
                value={wakeDate}
                onChange={(e) => setWakeDate(e.target.value)}
                className="w-full bg-transparent text-[11px] text-slate-500 text-center focus:outline-none"
              />
            </div>
          </div>

          {/* Duração Calculada com Indicador de Meia-Noite */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300 font-medium">Duração Calculada:</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-indigo-300 font-mono block">
                {durationCalc.formattedText}
              </span>
              {durationCalc.crossesMidnight && (
                <span className="text-[10px] text-slate-400 font-mono block">
                  (Cruzou a meia-noite)
                </span>
              )}
            </div>
          </div>

          {/* Qualidade Percebida (1 a 5) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Qualidade Percebida (1 a 5):
              </label>
              <span className="text-[11px] text-indigo-300 font-medium">
                {qualityLabels[qualityRating]}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQualityRating(val as 1 | 2 | 3 | 4 | 5)}
                  className={`py-2 rounded-xl border text-center font-bold text-sm transition ${
                    qualityRating === val
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Despertares Noturnos */}
          <div>
            <label className="text-slate-400 block mb-1">
              Despertares Noturnos / Interrupções (opcional):
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={awakenings}
              onChange={(e) => setAwakenings(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="text-slate-400 block mb-1">Observações sobre o sono (opcional):</label>
            <input
              type="text"
              placeholder="Ex: Demorei para adormecer, quarto estava fresco..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
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
              disabled={isSubmitting || !durationCalc.isValid}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Sono</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
