import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Trash2,
  Check,
  Utensils,
  Layers,
  Flame,
  Info,
} from 'lucide-react';
import {
  MealEntry,
  MealItem,
  MealType,
  MeasurementUnit,
  FoodItem,
  FoodCategory,
  CURRENT_SCHEMA_VERSION,
} from '../../types/models';
import { CANONICAL_FOODS } from '../../catalog/foodCatalog';
import { FoodSvgIcon } from '../food-icons/FoodSvgIcon';
import {
  calculateItemNutrition,
  calculateMealTotalNutrition,
} from '../../core/calculations/nutritionCalculator';

interface MealBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: MealEntry) => Promise<void>;
  customFoods?: FoodItem[];
  initialDate?: string;
}

export const MealBuilderModal: React.FC<MealBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
  customFoods = [],
  initialDate,
}) => {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [customMealName, setCustomMealName] = useState<string>('Almoço');
  const [mealTime, setMealTime] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  const [selectedItems, setSelectedItems] = useState<MealItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Unifica alimentos canônicos e personalizados cadastrados pelo usuário
  const allFoods: FoodItem[] = [...customFoods, ...CANONICAL_FOODS];

  const filteredFoods = allFoods.filter((food) => {
    if (selectedCategory !== 'all' && food.category !== selectedCategory) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      food.name.toLowerCase().includes(q) ||
      food.aliases.some((a) => a.toLowerCase().includes(q))
    );
  });

  const handleAddItem = (food: FoodItem) => {
    const existingIndex = selectedItems.findIndex((i) => i.foodId === food.id);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      const newQty = updated[existingIndex].quantity + food.defaultServingSize;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].calculatedNutrition = calculateItemNutrition(
        food.id,
        newQty,
        updated[existingIndex].unit,
        food.isCustom ? food : undefined
      );
      setSelectedItems(updated);
    } else {
      const nutrition = calculateItemNutrition(
        food.id,
        food.defaultServingSize,
        food.defaultUnit,
        food.isCustom ? food : undefined
      );

      setSelectedItems([
        ...selectedItems,
        {
          foodId: food.id,
          name: food.name,
          quantity: food.defaultServingSize,
          unit: food.defaultUnit,
          calculatedNutrition: nutrition,
        },
      ]);
    }
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const updated = [...selectedItems];
    const item = updated[index];
    const food = allFoods.find((f) => f.id === item.foodId);

    item.quantity = quantity;
    item.calculatedNutrition = calculateItemNutrition(
      item.foodId,
      quantity,
      item.unit,
      food?.isCustom ? food : undefined
    );

    setSelectedItems(updated);
  };

  const handleUpdateItemUnit = (index: number, unit: MeasurementUnit) => {
    const updated = [...selectedItems];
    const item = updated[index];
    const food = allFoods.find((f) => f.id === item.foodId);

    item.unit = unit;
    item.calculatedNutrition = calculateItemNutrition(
      item.foodId,
      item.quantity,
      unit,
      food?.isCustom ? food : undefined
    );

    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // Cálculo ao vivo dos macronutrientes totais do prato
  const liveTotalNutrition = calculateMealTotalNutrition(selectedItems);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);

    const dateBase = initialDate || new Date().toISOString().split('T')[0];
    const timestamp = new Date(`${dateBase}T${mealTime}:00`).toISOString();

    const newMeal: MealEntry = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      type: 'meal',
      timestamp,
      mealType,
      name: customMealName.trim() || 'Refeição',
      items: selectedItems,
      totalNutrition: liveTotalNutrition,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveMeal(newMeal);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar refeição:', err);
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
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Montagem de Refeição</h2>
              <span className="text-[11px] text-slate-500">Cálculo proporcional TBCA em tempo real</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Tipo e Horário */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Tipo de Refeição:</label>
              <select
                value={mealType}
                onChange={(e) => {
                  const val = e.target.value as MealType;
                  setMealType(val);
                  if (val === 'breakfast') setCustomMealName('Café da Manhã');
                  else if (val === 'morning_snack') setCustomMealName('Lanche da Manhã');
                  else if (val === 'lunch') setCustomMealName('Almoço');
                  else if (val === 'afternoon_snack') setCustomMealName('Lanche da Tarde');
                  else if (val === 'dinner') setCustomMealName('Jantar');
                  else if (val === 'supper') setCustomMealName('Ceia');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="breakfast">Café da Manhã</option>
                <option value="morning_snack">Lanche da Manhã</option>
                <option value="lunch">Almoço</option>
                <option value="afternoon_snack">Lanche da Tarde</option>
                <option value="dinner">Jantar</option>
                <option value="supper">Ceia</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Horário:</label>
              <input
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Painel de Macronutrientes em Tempo Real */}
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                Estimativa Nutricional do Prato
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {liveTotalNutrition.calories !== null ? `${liveTotalNutrition.calories} kcal` : 'Calorias s/ dados'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-xs pt-1">
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-amber-900/30">
                <span className="text-[10px] text-slate-400 block">Carboidratos</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {liveTotalNutrition.carbs !== null ? `${liveTotalNutrition.carbs}g` : '--'}
                </span>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-amber-900/30">
                <span className="text-[10px] text-slate-400 block">Proteínas</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {liveTotalNutrition.protein !== null ? `${liveTotalNutrition.protein}g` : '--'}
                </span>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-amber-900/30">
                <span className="text-[10px] text-slate-400 block">Gorduras</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {liveTotalNutrition.fats !== null ? `${liveTotalNutrition.fats}g` : '--'}
                </span>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-amber-900/30">
                <span className="text-[10px] text-slate-400 block">Fibras</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {liveTotalNutrition.fiber !== null ? `${liveTotalNutrition.fiber}g` : '--'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              {liveTotalNutrition.sourceDetails}
            </p>
          </div>

          {/* Bandeja de Alimentos no Prato */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                Alimentos no Prato ({selectedItems.length})
              </span>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="text-[11px] text-red-400 hover:text-red-300"
                >
                  Limpar prato
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Nenhum alimento selecionado. Toque nos alimentos do catálogo abaixo para adicionar.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {selectedItems.map((item, idx) => (
                  <div
                    key={`${item.foodId}_${idx}`}
                    className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FoodSvgIcon
                        iconId={allFoods.find((f) => f.id === item.foodId)?.svgIconId || 'generic_food'}
                        className="w-6 h-6 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-slate-200 truncate block">{item.name}</span>
                        {item.calculatedNutrition && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {item.calculatedNutrition.calories !== null
                              ? `${item.calculatedNutrition.calories} kcal`
                              : 'Sem kcal'} • P: {item.calculatedNutrition.protein ?? '--'}g
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItemQuantity(idx, parseFloat(e.target.value) || 0)
                        }
                        className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-center text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          handleUpdateItemUnit(idx, e.target.value as MeasurementUnit)
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unit">unid.</option>
                        <option value="slice">fatia</option>
                        <option value="tablespoon">colher</option>
                        <option value="ladle">concha</option>
                        <option value="scoop">scoop</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Busca e Catálogo */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Catálogo de Alimentos ({filteredFoods.length} disponíveis)
            </span>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar arroz, feijão, frango, banana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Categorias */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('cereals_grains')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'cereals_grains'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Cereais
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('legumes')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'legumes'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Feijões
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('proteins')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'proteins'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Proteínas
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('vegetables')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'vegetables'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Verduras
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('fruits')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'fruits'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Frutas
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('supplements')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs transition ${
                  selectedCategory === 'supplements'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                Suplementos
              </button>
            </div>

            {/* Grade de Alimentos com SVGs Inline */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleAddItem(food)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 active:scale-95 transition flex flex-col items-center text-center space-y-1.5"
                >
                  <FoodSvgIcon iconId={food.svgIconId} className="w-8 h-8" />
                  <span className="text-[11px] font-medium text-slate-200 line-clamp-1">
                    {food.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {food.defaultServingSize}
                    {food.defaultUnit}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-slate-400 text-xs block mb-1">Notas da refeição (opcional):</label>
            <input
              type="text"
              placeholder="Ex: Almoço reforçado após o treino, sem sal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="pt-2 border-t border-slate-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedItems.length === 0 || isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              selectedItems.length > 0 && !isSubmitting
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Salvar no Diário</span>
          </button>
        </div>
      </div>
    </div>
  );
};
