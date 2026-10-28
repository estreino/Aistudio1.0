import { RoutineEntry, SleepEntry, EnergyEntry, CaffeineEntry, HydrationEntry, WorkoutEntry } from '../../types/models';

export interface SleepVsEnergyRelation {
  status: 'sufficient' | 'insufficient';
  sampleDaysCount: number;
  avgEnergyAfterGoodSleep: number | null; // Sono >= 7h (420 min)
  avgEnergyAfterShortSleep: number | null; // Sono < 7h
  observation: string;
}

export interface CaffeineVsSleepRelation {
  status: 'sufficient' | 'insufficient';
  sampleDaysCount: number;
  avgSleepQualityEarlyCaffeine: number | null; // Último café antes das 14h
  avgSleepQualityLateCaffeine: number | null;  // Último café após as 14h
  observation: string;
}

export interface HydrationVsWorkoutRelation {
  status: 'sufficient' | 'insufficient';
  avgWaterOnWorkoutDays: number | null;
  avgWaterOnRestDays: number | null;
  workoutDaysCount: number;
  restDaysCount: number;
  observation: string;
}

export interface DataGapsAnalysis {
  missingSleepDaysInLast7d: number;
  missingHydrationDaysInLast7d: number;
  missingMealsDaysInLast7d: number;
  missingEnergyDaysInLast7d: number;
  overallConsistencyScorePercent: number; // Percentual de preenchimento factual
}

export interface RoutineCorrelationsResult {
  sleepVsEnergy: SleepVsEnergyRelation;
  caffeineVsSleep: CaffeineVsSleepRelation;
  hydrationVsWorkout: HydrationVsWorkoutRelation;
  dataGaps: DataGapsAnalysis;
}

/**
 * Analisador puro de correlações e relações temporais.
 * REGRA RIGOROSA: Correlação não afirma causalidade e amostras insuficientes
 * são explicitamente identificadas sem invenção de dados.
 */
export function analyzeRoutineCorrelations(entries: RoutineEntry[]): RoutineCorrelationsResult {
  // 1. Mapeamento por data civil (YYYY-MM-DD)
  const entriesByDate = new Map<string, RoutineEntry[]>();

  for (const entry of entries) {
    let dateStr = '';
    if ('timestamp' in entry && typeof entry.timestamp === 'string') dateStr = entry.timestamp.split('T')[0];
    else if ('wakeTime' in entry && typeof entry.wakeTime === 'string') dateStr = entry.wakeTime.split('T')[0];
    else if ('startTime' in entry && typeof entry.startTime === 'string') dateStr = entry.startTime.split('T')[0];

    if (dateStr) {
      const current = entriesByDate.get(dateStr) || [];
      current.push(entry);
      entriesByDate.set(dateStr, current);
    }
  }

  // --- RELAÇÃO 1: SONO DA NOITE vs. ENERGIA NO DIA SEGUINTE ---
  const sleepEntries = entries.filter((e) => e.type === 'sleep') as SleepEntry[];
  const goodSleepEnergies: number[] = [];
  const shortSleepEnergies: number[] = [];

  for (const sleep of sleepEntries) {
    const wakeDate = new Date(sleep.wakeTime);
    const dayStr = wakeDate.toISOString().split('T')[0];
    const dayEntries = entriesByDate.get(dayStr) || [];
    const energyEntries = dayEntries.filter((e) => e.type === 'energy') as EnergyEntry[];

    if (energyEntries.length > 0) {
      const avgDayEnergy =
        energyEntries.reduce((sum, e) => sum + e.level, 0) / energyEntries.length;

      if (sleep.durationMinutes >= 420) {
        goodSleepEnergies.push(avgDayEnergy);
      } else {
        shortSleepEnergies.push(avgDayEnergy);
      }
    }
  }

  const totalSleepEnergySamples = goodSleepEnergies.length + shortSleepEnergies.length;
  const avgEnergyGoodSleep =
    goodSleepEnergies.length > 0
      ? Number((goodSleepEnergies.reduce((a, b) => a + b, 0) / goodSleepEnergies.length).toFixed(1))
      : null;
  const avgEnergyShortSleep =
    shortSleepEnergies.length > 0
      ? Number((shortSleepEnergies.reduce((a, b) => a + b, 0) / shortSleepEnergies.length).toFixed(1))
      : null;

  const sleepVsEnergy: SleepVsEnergyRelation = {
    status: totalSleepEnergySamples >= 3 ? 'sufficient' : 'insufficient',
    sampleDaysCount: totalSleepEnergySamples,
    avgEnergyAfterGoodSleep: avgEnergyGoodSleep,
    avgEnergyAfterShortSleep: avgEnergyShortSleep,
    observation:
      totalSleepEnergySamples >= 3
        ? avgEnergyGoodSleep && avgEnergyShortSleep && avgEnergyGoodSleep > avgEnergyShortSleep
          ? 'Nota-se energia média superior nos dias seguintes a noites com pelo menos 7 horas de sono.'
          : 'Pouca variação observada na energia diária em relação à duração do sono nas amostras atuais.'
        : 'São necessários ao menos 3 dias com registro simultâneo de sono e energia para esta observação.',
  };

  // --- RELAÇÃO 2: CAFEÍNA TARDIA vs. QUALIDADE DO SONO ---
  const caffeineEntries = entries.filter((e) => e.type === 'caffeine') as CaffeineEntry[];
  const earlyCaffeineQualities: number[] = [];
  const lateCaffeineQualities: number[] = [];

  // Agrupa cafeína por dia e identifica o horário da última dose
  const latestCaffeineByDay = new Map<string, number>(); // hour (0-23)
  for (const caf of caffeineEntries) {
    const dateStr = caf.timestamp.split('T')[0];
    const hour = new Date(caf.timestamp).getHours();
    const currentMax = latestCaffeineByDay.get(dateStr) ?? -1;
    if (hour > currentMax) latestCaffeineByDay.set(dateStr, hour);
  }

  for (const sleep of sleepEntries) {
    const bedDate = new Date(sleep.bedTime);
    const dayStr = bedDate.toISOString().split('T')[0];
    const lastCafHour = latestCaffeineByDay.get(dayStr);

    if (lastCafHour !== undefined && sleep.qualityRating) {
      if (lastCafHour < 14) {
        earlyCaffeineQualities.push(sleep.qualityRating);
      } else {
        lateCaffeineQualities.push(sleep.qualityRating);
      }
    }
  }

  const totalCafSleepSamples = earlyCaffeineQualities.length + lateCaffeineQualities.length;
  const avgQualEarlyCaf =
    earlyCaffeineQualities.length > 0
      ? Number((earlyCaffeineQualities.reduce((a, b) => a + b, 0) / earlyCaffeineQualities.length).toFixed(1))
      : null;
  const avgQualLateCaf =
    lateCaffeineQualities.length > 0
      ? Number((lateCaffeineQualities.reduce((a, b) => a + b, 0) / lateCaffeineQualities.length).toFixed(1))
      : null;

  const caffeineVsSleep: CaffeineVsSleepRelation = {
    status: totalCafSleepSamples >= 3 ? 'sufficient' : 'insufficient',
    sampleDaysCount: totalCafSleepSamples,
    avgSleepQualityEarlyCaffeine: avgQualEarlyCaf,
    avgSleepQualityLateCaffeine: avgQualLateCaf,
    observation:
      totalCafSleepSamples >= 3
        ? avgQualEarlyCaf && avgQualLateCaf && avgQualEarlyCaf > avgQualLateCaf
          ? 'Qualidade média de sono percebida mais alta nas noites em que a última dose de café ocorreu antes das 14h.'
          : 'Diferença não conclusiva entre doses antes ou depois das 14h nas amostras disponíveis.'
        : 'Requer ao menos 3 dias de registros correlacionados de cafeína e qualidade de sono.',
  };

  // --- RELAÇÃO 3: HIDRATAÇÃO EM DIAS DE TREINO vs. DESCANSO ---
  const workoutDays = new Set<string>();
  entries.forEach((e) => {
    if (e.type === 'workout') {
      const wDate = (e as WorkoutEntry).startTime.split('T')[0];
      workoutDays.add(wDate);
    }
  });

  const hydrationByDay = new Map<string, number>();
  entries.forEach((e) => {
    if (e.type === 'hydration') {
      const h = e as HydrationEntry;
      const d = h.timestamp.split('T')[0];
      hydrationByDay.set(d, (hydrationByDay.get(d) || 0) + (h.volumeMl || 0));
    }
  });

  const workoutWater: number[] = [];
  const restWater: number[] = [];

  hydrationByDay.forEach((vol, dateStr) => {
    if (workoutDays.has(dateStr)) workoutWater.push(vol);
    else restWater.push(vol);
  });

  const avgWaterWorkout =
    workoutWater.length > 0
      ? Math.round(workoutWater.reduce((a, b) => a + b, 0) / workoutWater.length)
      : null;
  const avgWaterRest =
    restWater.length > 0
      ? Math.round(restWater.reduce((a, b) => a + b, 0) / restWater.length)
      : null;

  const hydrationVsWorkout: HydrationVsWorkoutRelation = {
    status: workoutWater.length >= 1 && restWater.length >= 1 ? 'sufficient' : 'insufficient',
    avgWaterOnWorkoutDays: avgWaterWorkout,
    avgWaterOnRestDays: avgWaterRest,
    workoutDaysCount: workoutWater.length,
    restDaysCount: restWater.length,
    observation:
      workoutWater.length > 0 && restWater.length > 0
        ? `Consumo médio de ${avgWaterWorkout}ml nos dias de treino vs. ${avgWaterRest}ml nos dias sem treino.`
        : 'Registre água e treinos em dias alternados para comparar o consumo.',
  };

  // --- ANÁLISE DE LACUNAS DE DADOS (ÚLTIMOS 7 DIAS) ---
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  let missingSleep = 0;
  let missingWater = 0;
  let missingMeals = 0;
  let missingEnergy = 0;

  for (const day of last7Days) {
    const dayList = entriesByDate.get(day) || [];
    if (!dayList.some((e) => e.type === 'sleep')) missingSleep++;
    if (!dayList.some((e) => e.type === 'hydration')) missingWater++;
    if (!dayList.some((e) => e.type === 'meal')) missingMeals++;
    if (!dayList.some((e) => e.type === 'energy')) missingEnergy++;
  }

  const totalPossibleChecks = 7 * 4; // 28 verificações
  const totalMissing = missingSleep + missingWater + missingMeals + missingEnergy;
  const consistencyPercent = Math.round(((totalPossibleChecks - totalMissing) / totalPossibleChecks) * 100);

  const dataGaps: DataGapsAnalysis = {
    missingSleepDaysInLast7d: missingSleep,
    missingHydrationDaysInLast7d: missingWater,
    missingMealsDaysInLast7d: missingMeals,
    missingEnergyDaysInLast7d: missingEnergy,
    overallConsistencyScorePercent: Math.max(0, consistencyPercent),
  };

  return {
    sleepVsEnergy,
    caffeineVsSleep,
    hydrationVsWorkout,
    dataGaps,
  };
}
