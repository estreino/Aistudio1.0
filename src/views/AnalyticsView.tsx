import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Moon,
  Droplets,
  Coffee,
  Dumbbell,
  Zap,
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { calculateWeeklySummary } from '../core/calculations/weeklySummary';
import { analyzeRoutineCorrelations } from '../core/calculations/correlationAnalyzer';

export const AnalyticsView: React.FC = () => {
  const { entries } = useRoutineStorage();

  const summary = calculateWeeklySummary(entries, new Date());
  const correlations = analyzeRoutineCorrelations(entries);

  const formatShortDate = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return isoDate;
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Cabeçalho da Semana */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Resumo Semanal (7 Dias)
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>
              {formatShortDate(summary.periodStart)} até {formatShortDate(summary.periodEnd)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          As médias consideram exclusivamente os dias em que houve registros confirmados. Dias sem
          registro nunca entram como zero.
        </p>
      </div>

      {/* Cartões de Médias Ponderadas por Amostra */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sono Médio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-950/50 border border-indigo-900/40">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 font-mono">
              {summary.sleep.daysSampled}/7 dias
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Sono Médio / Noite</div>
            {summary.sleep.averageMinutesPerDay !== null ? (
              <div className="text-sm font-semibold text-indigo-300 font-mono">
                {Math.floor(summary.sleep.averageMinutesPerDay / 60)}h{' '}
                {summary.sleep.averageMinutesPerDay % 60}m
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-400 italic">Dados insuficientes</div>
            )}
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {summary.sleep.daysSampled === 0
                ? 'Nenhum registro de sono'
                : `Baseado em ${summary.sleep.daysSampled} ${summary.sleep.daysSampled === 1 ? 'noite' : 'noites'}`}
            </span>
          </div>
        </div>

        {/* Hidratação Média */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-900/40">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 font-mono">
              {summary.hydration.daysSampled}/7 dias
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Água Média / Dia</div>
            {summary.hydration.averageMlPerDay !== null ? (
              <div className="text-sm font-semibold text-cyan-300 font-mono">
                {summary.hydration.averageMlPerDay} ml
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-400 italic">Dados insuficientes</div>
            )}
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {summary.hydration.daysSampled === 0
                ? 'Nenhum registro de água'
                : `Baseado em ${summary.hydration.daysSampled} ${summary.hydration.daysSampled === 1 ? 'dia' : 'dias'}`}
            </span>
          </div>
        </div>

        {/* Cafeína Média */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-orange-400">
            <div className="p-2 rounded-xl bg-orange-950/50 border border-orange-900/40">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 font-mono">
              {summary.caffeine.dosesCount} doses
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Cafeína Média / Dia</div>
            {summary.caffeine.averageMgPerDay !== null ? (
              <div className="text-sm font-semibold text-orange-300 font-mono">
                ~{summary.caffeine.averageMgPerDay} mg
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-400 italic">Dados insuficientes</div>
            )}
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Total 7d: ~{summary.caffeine.totalMg} mg
            </span>
          </div>
        </div>

        {/* Treinos da Semana */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-900/40">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 font-mono">
              {summary.workout.daysSampled}/7 dias
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Treinos na Semana</div>
            <div className="text-sm font-semibold text-emerald-300 font-mono">
              {summary.workout.totalSessions}{' '}
              {summary.workout.totalSessions === 1 ? 'sessão' : 'sessões'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {summary.workout.totalDurationMinutes > 0
                ? `${summary.workout.totalDurationMinutes} min acumulados`
                : 'Sem duração registrada'}
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO: RELAÇÕES E CRUZAMENTOS DE PADRÕES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Relações & Cruzamentos de Rotina
          </h3>
        </div>

        {/* Relação 1: Sono vs. Energia no Dia Seguinte */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Sono vs. Energia no Dia Seguinte
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
              {correlations.sleepVsEnergy.sampleDaysCount} dias pareados
            </span>
          </div>

          {correlations.sleepVsEnergy.status === 'sufficient' ? (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Após Sono ≥ 7h</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {correlations.sleepVsEnergy.avgEnergyAfterGoodSleep ?? '--'} / 5.0
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Após Sono &lt; 7h</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {correlations.sleepVsEnergy.avgEnergyAfterShortSleep ?? '--'} / 5.0
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {correlations.sleepVsEnergy.observation}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-1 italic">
              {correlations.sleepVsEnergy.observation}
            </p>
          )}
        </div>

        {/* Relação 2: Último Café vs. Qualidade de Sono */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-orange-400" />
              Horário do Último Café vs. Qualidade do Sono
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
              {correlations.caffeineVsSleep.sampleDaysCount} noites correlacionadas
            </span>
          </div>

          {correlations.caffeineVsSleep.status === 'sufficient' ? (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Último Café &lt; 14h</span>
                  <span className="text-sm font-bold text-indigo-300 font-mono">
                    {correlations.caffeineVsSleep.avgSleepQualityEarlyCaffeine ?? '--'} / 5.0
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Último Café ≥ 14h</span>
                  <span className="text-sm font-bold text-orange-300 font-mono">
                    {correlations.caffeineVsSleep.avgSleepQualityLateCaffeine ?? '--'} / 5.0
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {correlations.caffeineVsSleep.observation}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-1 italic">
              {correlations.caffeineVsSleep.observation}
            </p>
          )}
        </div>

        {/* Relação 3: Hidratação em Dias de Treino vs. Descanso */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Água: Dias de Treino vs. Descanso
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
              {correlations.hydrationVsWorkout.workoutDaysCount} treinos / {correlations.hydrationVsWorkout.restDaysCount} descanso
            </span>
          </div>

          {correlations.hydrationVsWorkout.status === 'sufficient' ? (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Média Dias de Treino</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {correlations.hydrationVsWorkout.avgWaterOnWorkoutDays} ml
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Média Dias Sem Treino</span>
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    {correlations.hydrationVsWorkout.avgWaterOnRestDays} ml
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {correlations.hydrationVsWorkout.observation}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-1 italic">
              {correlations.hydrationVsWorkout.observation}
            </p>
          )}
        </div>

        {/* Auditoria de Lacunas de Dados (Últimos 7 dias) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Auditoria de Preenchimento (7 Dias)
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {correlations.dataGaps.overallConsistencyScorePercent}% factual
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400">
              <span>Sono: </span>
              <strong className="text-slate-200">
                {7 - correlations.dataGaps.missingSleepDaysInLast7d}/7 noites
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400">
              <span>Água: </span>
              <strong className="text-slate-200">
                {7 - correlations.dataGaps.missingHydrationDaysInLast7d}/7 dias
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400">
              <span>Refeições: </span>
              <strong className="text-slate-200">
                {7 - correlations.dataGaps.missingMealsDaysInLast7d}/7 dias
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400">
              <span>Energia: </span>
              <strong className="text-slate-200">
                {7 - correlations.dataGaps.missingEnergyDaysInLast7d}/7 dias
              </strong>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            O percentual indica a frequência real de preenchimento dos 4 hábitos. Não é uma nota de disciplina moral.
          </p>
        </div>
      </div>

      {/* Alerta Metodológico Rigoroso */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Aviso Científico:</strong> Correlações temporais apontam coincidências na sua rotina,
          mas não estabelecem relação direta de causa e efeito. Use as informações como estímulo de reflexão pessoal.
        </span>
      </div>
    </div>
  );
};
