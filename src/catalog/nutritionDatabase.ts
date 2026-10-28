import { NutritionFacts, MeasurementUnit } from '../types/models';

export interface BaseNutritionPer100g {
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fats: number | null;
  fiber: number | null;
  sourceDetails: string;
}

/**
 * Base nutricional de referência para porção de 100g (ou 100ml).
 * Valores baseados na Tabela Brasileira de Composição de Alimentos (TBCA / TACO).
 * REGRA: Nutriente desconhecido ou não analisado é explicitamente 'null', NUNCA zero.
 */
export const NUTRITION_PER_100G: Record<string, BaseNutritionPer100g> = {
  // Cereais & Massas
  food_rice_white: {
    calories: 128,
    carbs: 28.1,
    protein: 2.5,
    fats: 0.2,
    fiber: 1.6,
    sourceDetails: 'TBCA - Arroz branco cozido',
  },
  food_rice_brown: {
    calories: 124,
    carbs: 25.8,
    protein: 2.6,
    fats: 1.0,
    fiber: 2.7,
    sourceDetails: 'TBCA - Arroz integral cozido',
  },
  food_pasta: {
    calories: 157,
    carbs: 30.7,
    protein: 5.8,
    fats: 0.9,
    fiber: 1.8,
    sourceDetails: 'TBCA - Macarrão cozido',
  },
  food_bread_french: {
    calories: 300,
    carbs: 58.6,
    protein: 8.0,
    fats: 3.1,
    fiber: 2.3,
    sourceDetails: 'TBCA - Pão francês',
  },
  food_bread_sliced: {
    calories: 253,
    carbs: 49.9,
    protein: 8.4,
    fats: 2.3,
    fiber: 3.7,
    sourceDetails: 'TBCA - Pão de forma',
  },
  food_oats: {
    calories: 394,
    carbs: 66.6,
    protein: 13.9,
    fats: 8.5,
    fiber: 9.1,
    sourceDetails: 'TBCA - Aveia em flocos',
  },
  food_tapioca: {
    calories: 240,
    carbs: 60.0,
    protein: 0.1,
    fats: 0.1,
    fiber: 0.5,
    sourceDetails: 'TBCA - Tapioca goma',
  },
  food_couscous: {
    calories: 112,
    carbs: 25.0,
    protein: 2.2,
    fats: 0.3,
    fiber: 1.9,
    sourceDetails: 'TBCA - Cuscuz de milho cozido',
  },
  food_corn: {
    calories: 96,
    carbs: 19.0,
    protein: 3.2,
    fats: 1.2,
    fiber: 2.4,
    sourceDetails: 'TBCA - Milho verde cozido',
  },

  // Feijões & Leguminosas
  food_beans_black: {
    calories: 77,
    carbs: 14.0,
    protein: 4.5,
    fats: 0.5,
    fiber: 8.4,
    sourceDetails: 'TBCA - Feijão preto cozido',
  },
  food_beans_carioca: {
    calories: 76,
    carbs: 13.6,
    protein: 4.8,
    fats: 0.5,
    fiber: 8.5,
    sourceDetails: 'TBCA - Feijão carioca cozido',
  },
  food_lentils: {
    calories: 116,
    carbs: 20.1,
    protein: 9.0,
    fats: 0.4,
    fiber: 7.9,
    sourceDetails: 'TBCA - Lentilha cozida',
  },
  food_chickpeas: {
    calories: 164,
    carbs: 27.4,
    protein: 8.9,
    fats: 2.6,
    fiber: 7.6,
    sourceDetails: 'TBCA - Grão-de-bico cozido',
  },
  food_peas: {
    calories: 81,
    carbs: 14.5,
    protein: 5.4,
    fats: 0.4,
    fiber: 5.7,
    sourceDetails: 'TBCA - Ervilha cozida',
  },

  // Tubérculos
  food_potato_boiled: {
    calories: 87,
    carbs: 20.1,
    protein: 1.9,
    fats: 0.1,
    fiber: 1.8,
    sourceDetails: 'TBCA - Batata inglesa cozida',
  },
  food_sweet_potato: {
    calories: 86,
    carbs: 20.1,
    protein: 1.6,
    fats: 0.1,
    fiber: 3.0,
    sourceDetails: 'TBCA - Batata-doce cozida',
  },
  food_cassava: {
    calories: 125,
    carbs: 30.1,
    protein: 0.6,
    fats: 0.3,
    fiber: 1.6,
    sourceDetails: 'TBCA - Mandioca cozida',
  },

  // Proteínas
  food_chicken_grilled: {
    calories: 165,
    carbs: 0.0,
    protein: 31.0,
    fats: 3.6,
    fiber: 0.0,
    sourceDetails: 'TBCA - Peito de frango grelhado',
  },
  food_chicken_shredded: {
    calories: 150,
    carbs: 0.0,
    protein: 29.5,
    fats: 3.2,
    fiber: 0.0,
    sourceDetails: 'TBCA - Frango cozido desfiado',
  },
  food_beef: {
    calories: 219,
    carbs: 0.0,
    protein: 35.9,
    fats: 7.3,
    fiber: 0.0,
    sourceDetails: 'TBCA - Patinho/Alcatra grelhado',
  },
  food_ground_beef: {
    calories: 212,
    carbs: 0.0,
    protein: 32.0,
    fats: 8.5,
    fiber: 0.0,
    sourceDetails: 'TBCA - Carne moída refogada',
  },
  food_pork: {
    calories: 176,
    carbs: 0.0,
    protein: 29.1,
    fats: 6.0,
    fiber: 0.0,
    sourceDetails: 'TBCA - Lombo suíno assado',
  },
  food_fish: {
    calories: 128,
    carbs: 0.0,
    protein: 26.0,
    fats: 2.7,
    fiber: 0.0,
    sourceDetails: 'TBCA - Filé de peixe cozido/grelhado',
  },
  food_eggs: {
    calories: 143,
    carbs: 1.6,
    protein: 13.0,
    fats: 9.5,
    fiber: 0.0,
    sourceDetails: 'TBCA - Ovo de galinha cozido',
  },
  food_tuna: {
    calories: 130,
    carbs: 0.0,
    protein: 28.0,
    fats: 1.0,
    fiber: 0.0,
    sourceDetails: 'TBCA - Atum sólido natural',
  },

  // Verduras & Legumes
  food_lettuce: {
    calories: 15,
    carbs: 2.9,
    protein: 1.4,
    fats: 0.2,
    fiber: 1.3,
    sourceDetails: 'TBCA - Alface crespa',
  },
  food_tomato: {
    calories: 18,
    carbs: 3.9,
    protein: 0.9,
    fats: 0.2,
    fiber: 1.2,
    sourceDetails: 'TBCA - Tomate salada',
  },
  food_broccoli: {
    calories: 34,
    carbs: 6.6,
    protein: 2.8,
    fats: 0.4,
    fiber: 2.6,
    sourceDetails: 'TBCA - Brócolis cozido',
  },
  food_carrot: {
    calories: 41,
    carbs: 9.6,
    protein: 0.9,
    fats: 0.2,
    fiber: 2.8,
    sourceDetails: 'TBCA - Cenoura crua',
  },
  food_kale: {
    calories: 49,
    carbs: 8.8,
    protein: 4.3,
    fats: 0.9,
    fiber: 3.6,
    sourceDetails: 'TBCA - Couve refogada',
  },

  // Frutas
  food_banana: {
    calories: 89,
    carbs: 22.8,
    protein: 1.1,
    fats: 0.3,
    fiber: 2.6,
    sourceDetails: 'TBCA - Banana prata',
  },
  food_apple: {
    calories: 52,
    carbs: 13.8,
    protein: 0.3,
    fats: 0.2,
    fiber: 2.4,
    sourceDetails: 'TBCA - Maçã com casca',
  },
  food_orange: {
    calories: 47,
    carbs: 11.8,
    protein: 0.9,
    fats: 0.1,
    fiber: 2.4,
    sourceDetails: 'TBCA - Laranja pera',
  },
  food_watermelon: {
    calories: 30,
    carbs: 7.6,
    protein: 0.6,
    fats: 0.2,
    fiber: 0.4,
    sourceDetails: 'TBCA - Melancia',
  },

  // Laticínios
  food_milk: {
    calories: 61,
    carbs: 4.8,
    protein: 3.2,
    fats: 3.3,
    fiber: 0.0,
    sourceDetails: 'TBCA - Leite integral',
  },
  food_cheese: {
    calories: 280,
    carbs: 2.0,
    protein: 17.4,
    fats: 22.8,
    fiber: 0.0,
    sourceDetails: 'TBCA - Queijo minas frescal',
  },
  food_yogurt: {
    calories: 61,
    carbs: 4.7,
    protein: 3.5,
    fats: 3.3,
    fiber: 0.0,
    sourceDetails: 'TBCA - Iogurte natural integral',
  },

  // Gorduras
  food_olive_oil: {
    calories: 884,
    carbs: 0.0,
    protein: 0.0,
    fats: 100.0,
    fiber: 0.0,
    sourceDetails: 'TBCA - Azeite de oliva extra virgem',
  },
  food_butter: {
    calories: 717,
    carbs: 0.1,
    protein: 0.9,
    fats: 81.1,
    fiber: 0.0,
    sourceDetails: 'TBCA - Manteiga',
  },
  food_peanut_butter: {
    calories: 588,
    carbs: 20.0,
    protein: 25.1,
    fats: 50.4,
    fiber: 6.0,
    sourceDetails: 'TBCA - Pasta de amendoim integral',
  },

  // Bebidas
  food_water: {
    calories: 0,
    carbs: 0.0,
    protein: 0.0,
    fats: 0.0,
    fiber: 0.0,
    sourceDetails: 'TBCA - Água potável',
  },
  food_coffee_black: {
    calories: 2,
    carbs: 0.3,
    protein: 0.1,
    fats: 0.0,
    fiber: 0.0,
    sourceDetails: 'TBCA - Café coado/expresso sem açúcar',
  },
  food_coffee_milk: {
    calories: 45,
    carbs: 3.5,
    protein: 2.4,
    fats: 2.3,
    fiber: 0.0,
    sourceDetails: 'TBCA - Café com leite',
  },

  // Doces & Lanches
  food_chocolate: {
    calories: 546,
    carbs: 61.0,
    protein: 4.9,
    fats: 31.0,
    fiber: 7.0,
    sourceDetails: 'TBCA - Chocolate meio amargo',
  },

  // Suplementos
  food_whey: {
    calories: 400,
    carbs: 10.0,
    protein: 80.0,
    fats: 5.0,
    fiber: null, // Desconhecido ou ausente dependendo da marca
    sourceDetails: 'Rótulo médio de Whey Protein 80%',
  },
  food_creatine: {
    calories: 0,
    carbs: 0.0,
    protein: 0.0,
    fats: 0.0,
    fiber: 0.0,
    sourceDetails: 'Creatina monohidratada pura',
  },
};

/**
 * Fatores médios documentados de conversão de unidades caseiras para gramas/ml.
 */
export const UNIT_CONVERSIONS_IN_GRAMS: Record<string, Partial<Record<MeasurementUnit, number>>> = {
  food_bread_french: { unit: 50 },
  food_bread_sliced: { slice: 25 },
  food_eggs: { unit: 50 },
  food_banana: { unit: 90 },
  food_apple: { unit: 130 },
  food_orange: { unit: 130 },
  food_watermelon: { slice: 200 },
  food_tomato: { unit: 80 },
  food_beans_black: { ladle: 130, tablespoon: 20 },
  food_beans_carioca: { ladle: 130, tablespoon: 20 },
  food_rice_white: { tablespoon: 25, ladle: 100 },
  food_rice_brown: { tablespoon: 25, ladle: 100 },
  food_olive_oil: { tablespoon: 13, teaspoon: 5 },
  food_butter: { teaspoon: 10, tablespoon: 20 },
  food_peanut_butter: { tablespoon: 15, teaspoon: 5 },
  food_whey: { scoop: 30 },
  food_oats: { tablespoon: 15 },
  food_cheese: { slice: 30 },
};
