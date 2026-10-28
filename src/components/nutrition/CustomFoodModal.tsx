import React, { useState } from 'react';
import { X, Plus, Check, ShieldCheck } from 'lucide-react';
import { FoodItem, FoodCategory, MeasurementUnit } from '../../types/models';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFood: (food: FoodItem) => Promise<void>;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  onSaveFood,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('supplements');
  const [servingSize, setServingSize] = useState<number>(100);
  const [unit, setUnit] = useState<MeasurementUnit>('g');

  const [calories, setCalories] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [fiber, setFiber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    const newFood: FoodItem = {
      id: `custom_food_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      name: name.trim(),
      category,
      aliases: [name.trim().toLowerCase()],
      defaultUnit: unit,
      defaultServingSize: servingSize || 100,
      svgIconId: 'generic_food',
      isCustom: true,
      nutritionPerDefaultServing: {
        calories: calories !== '' ? parseFloat(calories) : null,
        carbs: carbs !== '' ? parseFloat(carbs) : null,
        protein: protein !== '' ? parseFloat(protein) : null,
        fats: fats !== '' ? parseFloat(fats) : null,
        fiber: fiber !== '' ? parseFloat(fiber) : null,
        source: 'user_provided',
        sourceDetails: 'Rótulo informado pelo usuário',
      },
    };

    try {
      await onSaveFood(newFood);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar alimento personalizado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Novo Alimento ou Rótulo</h2>
              <span className="text-[11px] text-slate-500">Salvo no IndexedDB do seu aparelho</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nome */}
          <div>
            <label className="text-slate-400 block mb-1">Nome do Alimento / Produto:</label>
            <input
              type="text"
              required
              placeholder="Ex: Barra de Proteína Cacau, Iogurte de Ovelha..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Categoria */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Grupo:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="supplements">Suplementos</option>
                <option value="cereals_grains">Cereais</option>
                <option value="proteins">Proteínas</option>
                <option value="dairy">Laticínios</option>
                <option value="sweets_snacks">Lanches / Snacks</option>
                <option value="beverages">Bebidas</option>
                <option value="fruits">Frutas</option>
                <option value="vegetables">Verduras</option>
                <option value="tubers">Tubérculos</option>
                <option value="fats_oils">Gorduras</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Porção de Referência:</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  required
                  value={servingSize}
                  onChange={(e) => setServingSize(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-200 text-center font-mono focus:outline-none"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="unit">unid.</option>
                  <option value="scoop">scoop</option>
                  <option value="slice">fatia</option>
                  <option value="tablespoon">colher</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Rótulo / Nutrientes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Macronutrientes por Porção ({servingSize}{unit})
            </span>
            <p className="text-[10px] text-slate-500">
              Campos em branco permanecem como desconhecidos (não serão assumidos como zero).
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-0.5">Calorias (kcal):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 180"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Carboidratos (g):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 12.5"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Proteínas (g):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 20.0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Gorduras Totais (g):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 4.5"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-0.5">Fibras Alimentares (g) (opcional):</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 3.0"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
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
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Check className="w-4 h-4" />
              <span>Cadastrar Alimento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
