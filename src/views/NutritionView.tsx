import React, { useState } from 'react';
import { Search, Plus, UtensilsCrossed, Layers, Clock, Info, Sparkles } from 'lucide-react';
import { FoodCategory, MealEntry, FoodItem } from '../types/models';
import { CANONICAL_FOODS } from '../catalog/foodCatalog';
import { FoodSvgIcon } from '../components/food-icons/FoodSvgIcon';
import { MealBuilderModal } from '../components/nutrition/MealBuilderModal';
import { CustomFoodModal } from '../components/nutrition/CustomFoodModal';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { TimelineItem } from '../components/diary/TimelineItem';

const CATEGORY_TABS: { id: FoodCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'cereals_grains', label: 'Cereais' },
  { id: 'legumes', label: 'Feijões' },
  { id: 'tubers', label: 'Tubérculos' },
  { id: 'proteins', label: 'Proteínas' },
  { id: 'vegetables', label: 'Verduras' },
  { id: 'fruits', label: 'Frutas' },
  { id: 'dairy', label: 'Laticínios' },
  { id: 'fats_oils', label: 'Gorduras' },
  { id: 'beverages', label: 'Bebidas' },
  { id: 'sweets_snacks', label: 'Doces' },
  { id: 'supplements', label: 'Suplementos' },
];

export const NutritionView: React.FC = () => {
  const { entries, addEntry, removeEntry, customFoods, saveCustomFood } = useRoutineStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);

  const allFoods: FoodItem[] = [...customFoods, ...CANONICAL_FOODS];

  const filteredFoods = allFoods.filter((food) => {
    if (selectedCategory !== 'all' && food.category !== selectedCategory) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return food.name.toLowerCase().includes(q) || food.aliases.some((a) => a.toLowerCase().includes(q));
  });

  const mealEntries = entries.filter((e) => e.type === 'meal') as MealEntry[];

  return (
    <div className="space-y-4 pb-28">
      {/* Botões de Ação no Topo */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsBuilderOpen(true)}
          className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Montar Refeição</span>
        </button>

        <button
          onClick={() => setIsCustomFoodOpen(true)}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Cadastrar Alimento</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Pesquisar no catálogo e nos seus alimentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Categorias - Seleção Horizontal com Rolagem Suave */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Catálogo de Alimentos em Grade com SVGs Inline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Catálogo ({filteredFoods.length} itens)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {customFoods.length > 0 ? `${customFoods.length} customizados` : 'TBCA oficial'}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              onClick={() => setIsBuilderOpen(true)}
              className={`bg-slate-900 border rounded-2xl p-3 flex flex-col items-center text-center space-y-1.5 cursor-pointer active:scale-95 transition ${
                food.isCustom
                  ? 'border-purple-800/60 hover:border-purple-400'
                  : 'border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <FoodSvgIcon iconId={food.svgIconId} className="w-9 h-9" />
              <span className="text-xs font-medium text-slate-200 line-clamp-1">{food.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {food.defaultServingSize}
                {food.defaultUnit}
              </span>
              {food.isCustom && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  Personalizado
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Refeições Salvas no Histórico */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Refeições Registradas ({mealEntries.length})
          </span>
        </div>

        {mealEntries.length > 0 ? (
          <div className="space-y-2">
            {mealEntries.slice(0, 5).map((meal) => (
              <TimelineItem key={meal.id} entry={meal} onDelete={removeEntry} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-1">
            <p className="text-sm text-slate-400">Nenhuma refeição registrada ainda.</p>
            <p className="text-xs text-slate-500">
              Toque em "Montar Refeição" acima para adicionar seus primeiros alimentos ao diário.
            </p>
          </div>
        )}
      </div>

      {/* Princípio de Informação Nutricional Transparente */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Fonte & Incerteza:</strong> Os valores nutricionais são estimativas proporcionais
          baseadas na TBCA/TACO e em rótulos informados. Nutrientes sem dados laboratoriais permanecem explicitamente
          como desconhecidos.
        </span>
      </div>

      {/* Modal de Montagem de Refeição */}
      <MealBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSaveMeal={addEntry}
        customFoods={customFoods}
      />

      {/* Modal de Cadastro de Alimento Próprio */}
      <CustomFoodModal
        isOpen={isCustomFoodOpen}
        onClose={() => setIsCustomFoodOpen(false)}
        onSaveFood={saveCustomFood}
      />
    </div>
  );
};
