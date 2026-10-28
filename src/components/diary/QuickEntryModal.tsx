import React, { useState } from 'react';
import { X, Droplets, Coffee, Zap, Utensils, Check } from 'lucide-react';
import { RoutineEntry, CURRENT_SCHEMA_VERSION, EnergyContext } from '../../types/models';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: RoutineEntry) => Promise<void>;
  initialDate?: string;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
}) => {
  const [activeCategory, setActiveCategory] = useState<'hydration' | 'caffeine' | 'energy' | 'meal'>('hydration');
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // Estados específicos
  const [waterAmount, setWaterAmount] = useState<number>(300);
  const [caffeineType, setCaffeineType] = useState<string>('Café expresso');
  const [caffeineMg, setCaffeineMg] = useState<number>(60);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energyContext, setEnergyContext] = useState<EnergyContext>('during_work');
  const [mealName, setMealName] = useState<string>('Almoço');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const dateBase = initialDate || new Date().toISOString().split('T')[0];
  const combinedTimestamp = new Date(`${dateBase}T${time}:00`).toISOString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const id = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      let newEntry: RoutineEntry;

      if (activeCategory === 'hydration') {
        newEntry = {
          id,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          type: 'hydration',
          timestamp: combinedTimestamp,
          liquidType: 'water',
          volumeMl: waterAmount,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else if (activeCategory === 'caffeine') {
        newEntry = {
          id,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          type: 'caffeine',
          timestamp: combinedTimestamp,
          beverageName: caffeineType,
          amount: 1,
          unit: 'cup',
          estimatedCaffeineMg: caffeineMg,
          source: 'estimated',
          confidence: caffeineType === 'Café coado (xícara)' || caffeineType === 'Café com leite' ? 'medium' : 'high',
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else if (activeCategory === 'energy') {
        newEntry = {
          id,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          type: 'energy',
          timestamp: combinedTimestamp,
          level: energyLevel,
          context: energyContext,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        newEntry = {
          id,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          type: 'meal',
          timestamp: combinedTimestamp,
          mealType: 'lunch',
          name: mealName,
          items: [],
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      await onSave(newEntry);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar registro rápido:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">Novo Registro Rápido</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção do Tipo de Evento */}
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory('hydration')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
              activeCategory === 'hydration'
                ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Água</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('caffeine')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
              activeCategory === 'caffeine'
                ? 'bg-orange-950/50 border-orange-500/60 text-orange-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Café</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('energy')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
              activeCategory === 'energy'
                ? 'bg-yellow-950/50 border-yellow-500/60 text-yellow-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Energia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('meal')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
              activeCategory === 'meal'
                ? 'bg-amber-950/50 border-amber-500/60 text-amber-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Refeição</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Horário */}
          <div>
            <label className="text-slate-400 block mb-1">Horário do Evento:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Campos específicos de Hidratação */}
          {activeCategory === 'hydration' && (
            <div className="space-y-2">
              <label className="text-slate-400 block">Quantidade de Água (ml):</label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[150, 250, 350, 500].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => setWaterAmount(ml)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-mono ${
                      waterAmount === ml
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {ml} ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="50"
                min="50"
                value={waterAmount}
                onChange={(e) => setWaterAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}

          {/* Campos específicos de Cafeína */}
          {activeCategory === 'caffeine' && (
            <div className="space-y-2">
              <label className="text-slate-400 block">Bebida / Fonte:</label>
              <select
                value={caffeineType}
                onChange={(e) => {
                  const val = e.target.value;
                  setCaffeineType(val);
                  if (val === 'Café expresso') setCaffeineMg(60);
                  else if (val === 'Café coado (xícara)') setCaffeineMg(85);
                  else if (val === 'Café com leite') setCaffeineMg(40);
                  else if (val === 'Energético (lata 250ml)') setCaffeineMg(80);
                  else if (val === 'Pré-treino (dose)') setCaffeineMg(150);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value="Café expresso">Café expresso (~60mg)</option>
                <option value="Café coado (xícara)">Café coado xícara (~85mg)</option>
                <option value="Café com leite">Café com leite (~40mg)</option>
                <option value="Energético (lata 250ml)">Energético (~80mg)</option>
                <option value="Pré-treino (dose)">Pré-treino (~150mg)</option>
                <option value="Outro">Outro personalizado</option>
              </select>

              <div>
                <label className="text-slate-400 block mb-1">Cafeína Estimada (mg):</label>
                <input
                  type="number"
                  value={caffeineMg}
                  onChange={(e) => setCaffeineMg(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  * Estimativa documental aproximada. A concentração real depende do grão, torra e infusão.
                </span>
              </div>
            </div>
          )}

          {/* Campos específicos de Energia */}
          {activeCategory === 'energy' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 block">Nível de Energia (1 a 5):</label>
                <span className="text-[11px] text-yellow-300 font-medium">
                  {energyLevel === 1 && '1 - Esgotado / muito baixa'}
                  {energyLevel === 2 && '2 - Baixa / cansado'}
                  {energyLevel === 3 && '3 - Moderada / funcional'}
                  {energyLevel === 4 && '4 - Alta / produtivo'}
                  {energyLevel === 5 && '5 - Excelente / vigoroso'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl as 1 | 2 | 3 | 4 | 5)}
                    className={`py-2 rounded-xl border text-center font-semibold text-sm ${
                      energyLevel === lvl
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Momento / Contexto:</label>
                <select
                  value={energyContext}
                  onChange={(e) => setEnergyContext(e.target.value as EnergyContext)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500"
                >
                  <option value="upon_waking">Ao acordar</option>
                  <option value="during_work">Durante o trabalho</option>
                  <option value="arriving_home">Chegando em casa</option>
                  <option value="pre_workout">Antes do treino</option>
                  <option value="post_workout">Depois do treino</option>
                  <option value="before_bed">Antes de dormir</option>
                </select>
              </div>
            </div>
          )}

          {/* Campos específicos de Refeição */}
          {activeCategory === 'meal' && (
            <div className="space-y-2">
              <label className="text-slate-400 block">Título da Refeição:</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
                placeholder="Ex: Café da manhã, Almoço, Lanche da tarde"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500">
                O catálogo visual SVG completo com montagem de ingredientes será integrado na Fase 4.
              </p>
            </div>
          )}

          {/* Observações Opcionais */}
          <div>
            <label className="text-slate-400 block mb-1">Observações (opcional):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Tomei gelada, estava com bastante sede..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
