import { NutritionFacts, MeasurementUnit, MealItem, FoodItem } from '../../types/models';
import { NUTRITION_PER_100G, UNIT_CONVERSIONS_IN_GRAMS } from '../../catalog/nutritionDatabase';

/**
 * Converte a quantidade informada para peso estimado em gramas/ml.
 */
export function estimateWeightInGrams(
  foodId: string,
  quantity: number,
  unit: MeasurementUnit
): number {
  if (unit === 'g' || unit === 'ml') {
    return quantity;
  }

  const conversions = UNIT_CONVERSIONS_IN_GRAMS[foodId];
  if (conversions && conversions[unit]) {
    return quantity * (conversions[unit] as number);
  }

  // Estimativas culinárias padrão para unidades desconhecidas
  switch (unit) {
    case 'tablespoon':
      return quantity * 15;
    case 'teaspoon':
      return quantity * 5;
    case 'ladle':
      return quantity * 120;
    case 'slice':
      return quantity * 30;
    case 'scoop':
      return quantity * 30;
    case 'unit':
      return quantity * 100;
    case 'cup':
      return quantity * 200;
    default:
      return quantity;
  }
}

/**
 * Calcula a composição nutricional proporcional de um item individual.
 */
export function calculateItemNutrition(
  foodId: string,
  quantity: number,
  unit: MeasurementUnit,
  customFood?: FoodItem
): NutritionFacts {
  // Se for alimento customizado cadastrado pelo usuário
  if (customFood && customFood.nutritionPerDefaultServing) {
    const defaultServing = customFood.defaultServingSize || 100;
    const ratio = quantity / defaultServing;
    const base = customFood.nutritionPerDefaultServing;

    return {
      calories: base.calories !== null ? Math.round(base.calories * ratio) : null,
      carbs: base.carbs !== null ? Number((base.carbs * ratio).toFixed(1)) : null,
      protein: base.protein !== null ? Number((base.protein * ratio).toFixed(1)) : null,
      fats: base.fats !== null ? Number((base.fats * ratio).toFixed(1)) : null,
      fiber: base.fiber !== null && base.fiber !== undefined ? Number((base.fiber * ratio).toFixed(1)) : null,
      source: 'user_provided',
      sourceDetails: 'Rótulo informado pelo usuário',
    };
  }

  const base100g = NUTRITION_PER_100G[foodId];
  if (!base100g) {
    return {
      calories: null,
      carbs: null,
      protein: null,
      fats: null,
      fiber: null,
      source: 'unknown',
      sourceDetails: 'Sem dados nutricionais de referência para este item',
    };
  }

  const weightInGrams = estimateWeightInGrams(foodId, quantity, unit);
  const ratio = weightInGrams / 100;

  return {
    calories: base100g.calories !== null ? Math.round(base100g.calories * ratio) : null,
    carbs: base100g.carbs !== null ? Number((base100g.carbs * ratio).toFixed(1)) : null,
    protein: base100g.protein !== null ? Number((base100g.protein * ratio).toFixed(1)) : null,
    fats: base100g.fats !== null ? Number((base100g.fats * ratio).toFixed(1)) : null,
    fiber: base100g.fiber !== null ? Number((base100g.fiber * ratio).toFixed(1)) : null,
    source: 'estimated',
    sourceDetails: `${base100g.sourceDetails} (~${Math.round(weightInGrams)}g)`,
  };
}

/**
 * Calcula o somatório nutricional de uma refeição inteira.
 * REGRA RIGOROSA: Se um nutriente for desconhecido em algum item, a somatória
 * registra o valor calculável e sinaliza a incerteza no campo sourceDetails.
 */
export function calculateMealTotalNutrition(items: MealItem[]): NutritionFacts {
  if (!items || items.length === 0) {
    return {
      calories: 0,
      carbs: 0,
      protein: 0,
      fats: 0,
      fiber: 0,
      source: 'calculated',
      sourceDetails: 'Refeição sem itens',
    };
  }

  let totalCalories: number = 0;
  let totalCarbs: number = 0;
  let totalProtein: number = 0;
  let totalFats: number = 0;
  let totalFiber: number = 0;
  let hasIncompleteNutrients: boolean = false;

  for (const item of items) {
    const nutrition = item.calculatedNutrition || calculateItemNutrition(item.foodId, item.quantity, item.unit);

    if (nutrition.calories !== null) totalCalories += nutrition.calories;
    else hasIncompleteNutrients = true;

    if (nutrition.carbs !== null) totalCarbs += nutrition.carbs;
    else hasIncompleteNutrients = true;

    if (nutrition.protein !== null) totalProtein += nutrition.protein;
    else hasIncompleteNutrients = true;

    if (nutrition.fats !== null) totalFats += nutrition.fats;
    else hasIncompleteNutrients = true;

    if (nutrition.fiber !== null && nutrition.fiber !== undefined) {
      totalFiber += nutrition.fiber;
    } else {
      hasIncompleteNutrients = true;
    }
  }

  return {
    calories: Math.round(totalCalories),
    carbs: Number(totalCarbs.toFixed(1)),
    protein: Number(totalProtein.toFixed(1)),
    fats: Number(totalFats.toFixed(1)),
    fiber: Number(totalFiber.toFixed(1)),
    source: 'estimated',
    sourceDetails: hasIncompleteNutrients
      ? 'Estimativa proporcional (alguns itens possuem nutrientes desconhecidos)'
      : 'Estimativa proporcional baseada em dados oficiais de referência (TBCA)',
  };
}
