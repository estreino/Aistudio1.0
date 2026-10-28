import React from 'react';
import {
  Utensils,
  Moon,
  Droplets,
  Coffee,
  Dumbbell,
  Zap,
  Activity,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  RoutineEntry,
  MealEntry,
  SleepEntry,
  HydrationEntry,
  CaffeineEntry,
  EnergyEntry,
  WorkoutEntry,
} from '../../types/models';

interface TimelineItemProps {
  entry: RoutineEntry;
  onDelete: (id: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ entry, onDelete }) => {
  const formatTime = (isoString?: string): string => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getEntryTime = (): string => {
    if ('timestamp' in entry) return formatTime(entry.timestamp);
    if ('wakeTime' in entry) return formatTime(entry.wakeTime);
    if ('startTime' in entry) return formatTime(entry.startTime);
    return '--:--';
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'confirmed':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
            Confirmado
          </span>
        );
      case 'estimated':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 font-mono">
            Estimado
          </span>
        );
      case 'user_provided':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40 font-mono">
            Informado
          </span>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (entry.type) {
      case 'meal': {
        const meal = entry as MealEntry;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs">
                {meal.name || 'Refeição'}
              </span>
              <span className="text-[11px] text-slate-400 capitalize">
                ({meal.mealType.replace('_', ' ')})
              </span>
              {meal.totalNutrition && getSourceBadge(meal.totalNutrition.source)}
            </div>
            {meal.items && meal.items.length > 0 && (
              <p className="text-xs text-slate-400">
                {meal.items.map((i) => `${i.quantity}${i.unit} ${i.name}`).join(' • ')}
              </p>
            )}
            {meal.totalNutrition && meal.totalNutrition.calories !== null && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                <span className="text-amber-300 font-semibold">{meal.totalNutrition.calories} kcal</span>
                <span>•</span>
                <span>C: {meal.totalNutrition.carbs ?? '--'}g</span>
                <span>•</span>
                <span>P: {meal.totalNutrition.protein ?? '--'}g</span>
                <span>•</span>
                <span>G: {meal.totalNutrition.fats ?? '--'}g</span>
              </div>
            )}
            {meal.notes && <p className="text-[11px] text-slate-500 italic">"{meal.notes}"</p>}
          </div>
        );
      }

      case 'sleep': {
        const sleep = entry as SleepEntry;
        const hours = Math.floor(sleep.durationMinutes / 60);
        const mins = sleep.durationMinutes % 60;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs">
                Sono: {hours}h {mins > 0 ? `${mins}m` : ''}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                Qualidade: {sleep.qualityRating}/5
              </span>
              {getSourceBadge('confirmed')}
            </div>
            <p className="text-xs text-slate-400">
              Deitou às {formatTime(sleep.bedTime)} • Despertou às {formatTime(sleep.wakeTime)}
            </p>
            {sleep.notes && <p className="text-[11px] text-slate-500 italic">"{sleep.notes}"</p>}
          </div>
        );
      }

      case 'hydration': {
        const hyd = entry as HydrationEntry;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs">
                Água: {hyd.volumeMl} ml
              </span>
              {getSourceBadge('confirmed')}
            </div>
            {hyd.notes && <p className="text-[11px] text-slate-500 italic">"{hyd.notes}"</p>}
          </div>
        );
      }

      case 'caffeine': {
        const caf = entry as CaffeineEntry;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs">
                {caf.beverageName}: {caf.amount} {caf.unit}
              </span>
              {caf.estimatedCaffeineMg !== null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/40 font-mono">
                  ~{caf.estimatedCaffeineMg} mg cafeína
                </span>
              )}
              {getSourceBadge(caf.source)}
            </div>
            {caf.notes && <p className="text-[11px] text-slate-500 italic">"{caf.notes}"</p>}
          </div>
        );
      }

      case 'energy': {
        const energy = entry as EnergyEntry;
        const contextLabels: Record<string, string> = {
          upon_waking: 'Ao acordar',
          during_work: 'Durante o trabalho',
          arriving_home: 'Chegando em casa',
          pre_workout: 'Antes do treino',
          post_workout: 'Depois do treino',
          before_bed: 'Antes de dormir',
          custom: energy.customContextLabel || 'Personalizado',
        };
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs">
                Energia: Nível {energy.level} de 5
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-800/40">
                {contextLabels[energy.context] || energy.context}
              </span>
              {getSourceBadge('user_provided')}
            </div>
            {energy.notes && <p className="text-[11px] text-slate-500 italic">"{energy.notes}"</p>}
          </div>
        );
      }

      case 'workout': {
        const workout = entry as WorkoutEntry;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs">
                Treino: {workout.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 capitalize">
                {workout.modality}
              </span>
              {getSourceBadge('confirmed')}
            </div>
            {workout.durationMinutes && (
              <p className="text-xs text-slate-400">Duração: {workout.durationMinutes} minutos</p>
            )}
            {workout.exercises && workout.exercises.length > 0 && (
              <p className="text-[11px] text-slate-400">
                {workout.exercises.map((ex) => `${ex.name} (${ex.sets.length} séries)`).join(', ')}
              </p>
            )}
          </div>
        );
      }

      default:
        return (
          <div className="text-xs text-slate-300">
            <span>Evento registrado</span>
          </div>
        );
    }
  };

  const getCategoryIcon = () => {
    switch (entry.type) {
      case 'meal':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'caffeine':
        return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'energy':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 transition flex items-start gap-3">
      {/* Ícone de Categoria */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
        {getCategoryIcon()}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{getEntryTime()}</span>
        </div>
        {renderContent()}
      </div>

      {/* Botão de Excluir */}
      <button
        onClick={() => onDelete(entry.id)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition shrink-0"
        title="Excluir este registro"
        aria-label="Excluir este registro"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
