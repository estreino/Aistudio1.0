export interface ParsedDraft {
  title: string;
  time?: string;
  waterMl?: number;
  caffeineBeverage?: string;
  caffeineMg?: number;
  energyLevel?: number;
  sleepDurationMinutes?: number;
  sleepQualityRating?: number;
  workoutModality?: string;
  workoutDurationMinutes?: number;
  mealItems?: Array<{ name: string; quantity: number; unit: string }>;
  notes?: string;
}

export interface DraftParseResult {
  category: 'meal' | 'hydration' | 'caffeine' | 'sleep' | 'workout' | 'energy' | 'unknown';
  ambiguous: boolean;
  clarificationNeeded?: string;
  draft: ParsedDraft;
  usedOfflineFallback?: boolean;
}

export class GeminiService {
  /**
   * Converte texto natural em rascunho de registro.
   * Se a chamada falhar ou estiver sem internet, aciona o fallback com heurísticas locais.
   */
  public async parseNaturalLanguageToDraft(text: string): Promise<DraftParseResult> {
    try {
      const res = await fetch('/api/ai/parse-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        return data as DraftParseResult;
      }
    } catch (err) {
      console.warn('Servidor de IA inacessível, utilizando heurística local offline:', err);
    }

    // Heurística local de contingência (100% offline)
    return this.fallbackLocalParser(text);
  }

  /**
   * Consulta factual sobre a rotina registrada.
   */
  public async askRoutineAssistant(message: string, contextSummary: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, contextSummary }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.reply || 'Sem resposta formulada.';
      }

      const errData = await res.json().catch(() => ({}));
      return errData.error || 'O serviço de IA está indisponível no momento.';
    } catch {
      return 'Sem conexão com o serviço de IA. Verifique sua conexão à internet.';
    }
  }

  /**
   * Fallback local offline para extração simples sem depender de rede.
   */
  private fallbackLocalParser(text: string): DraftParseResult {
    const lower = text.toLowerCase();

    // 1. Hidratação
    if (lower.includes('água') || lower.includes('agua') || (lower.includes('ml') && !lower.includes('treino'))) {
      const matchMl = lower.match(/(\d+)\s*(ml|litro|l)/);
      let volume = 300;
      if (matchMl) {
        const val = parseInt(matchMl[1], 10);
        volume = matchMl[2].startsWith('l') ? val * 1000 : val;
      }
      return {
        category: 'hydration',
        ambiguous: false,
        usedOfflineFallback: true,
        draft: {
          title: `Água (${volume}ml)`,
          waterMl: volume,
          notes: text,
        },
      };
    }

    // 2. Cafeína
    if (lower.includes('café') || lower.includes('cafe') || lower.includes('expresso') || lower.includes('energético')) {
      const isLeite = lower.includes('leite');
      return {
        category: 'caffeine',
        ambiguous: false,
        usedOfflineFallback: true,
        draft: {
          title: isLeite ? 'Café com Leite' : 'Café Expresso',
          caffeineBeverage: isLeite ? 'Café com leite' : 'Café expresso',
          caffeineMg: isLeite ? 40 : 60,
          notes: text,
        },
      };
    }

    // 3. Sono
    if (lower.includes('dormi') || lower.includes('sono') || lower.includes('acordei')) {
      const matchHours = lower.match(/(\d+([\.,]\d+)?)\s*(hora|horas|h)/);
      const hours = matchHours ? parseFloat(matchHours[1].replace(',', '.')) : 7;
      const durationMinutes = Math.round(hours * 60);
      const isAmbiguous = !matchHours;

      return {
        category: 'sleep',
        ambiguous: isAmbiguous,
        clarificationNeeded: isAmbiguous ? 'Não identificamos o total de horas dormidas. Ajuste o valor abaixo se necessário.' : undefined,
        usedOfflineFallback: true,
        draft: {
          title: `Sono (${hours}h)`,
          sleepDurationMinutes: durationMinutes,
          sleepQualityRating: 4,
          notes: text,
        },
      };
    }

    // 4. Treino / Exercício
    if (lower.includes('trein') || lower.includes('exercício') || lower.includes('exercicio') || lower.includes('academia') || lower.includes('corrida') || lower.includes('corri') || lower.includes('caminhada') || lower.includes('musculação') || lower.includes('musculacao') || lower.includes('pedal') || lower.includes('bike') || lower.includes('natação')) {
      let modality = 'Musculação';
      if (lower.includes('corr') || lower.includes('corri')) modality = 'Corrida';
      else if (lower.includes('caminh')) modality = 'Caminhada';
      else if (lower.includes('pedal') || lower.includes('bike')) modality = 'Ciclismo';
      else if (lower.includes('natação') || lower.includes('natacao')) modality = 'Natação';
      else if (lower.includes('funcional')) modality = 'Treino Funcional';

      const matchMin = lower.match(/(\d+)\s*(min|minuto|minutos)/);
      const matchHours = lower.match(/(\d+([\.,]\d+)?)\s*(hora|horas|h)/);
      let durationMinutes = 45;
      if (matchMin) {
        durationMinutes = parseInt(matchMin[1], 10);
      } else if (matchHours) {
        durationMinutes = Math.round(parseFloat(matchHours[1].replace(',', '.')) * 60);
      }

      const isAmbiguous = !matchMin && !matchHours;

      return {
        category: 'workout',
        ambiguous: isAmbiguous,
        clarificationNeeded: isAmbiguous ? 'Duração do treino não especificada. Pré-selecionamos 45 min, ajuste se necessário.' : undefined,
        usedOfflineFallback: true,
        draft: {
          title: `Treino de ${modality}`,
          workoutModality: modality,
          workoutDurationMinutes: durationMinutes,
          notes: text,
        },
      };
    }

    // 5. Energia
    if (lower.includes('energia') || lower.includes('disposição') || lower.includes('disposicao') || lower.includes('cansado') || lower.includes('cansada')) {
      const matchNum = lower.match(/([1-5])/);
      const level = matchNum ? parseInt(matchNum[1], 10) : (lower.includes('cansad') ? 2 : 4);
      return {
        category: 'energy',
        ambiguous: false,
        usedOfflineFallback: true,
        draft: {
          title: `Energia ${level}/5`,
          energyLevel: level,
          notes: text,
        },
      };
    }

    // 6. Refeição (ou ambíguo)
    const isAmbiguousMeal = lower.includes('comi um lanche') || lower.includes('comi algo') || lower.length < 10;
    return {
      category: 'meal',
      ambiguous: isAmbiguousMeal,
      clarificationNeeded: isAmbiguousMeal ? 'Itens da refeição não detalhados. Você pode adicionar os alimentos antes de salvar.' : undefined,
      usedOfflineFallback: true,
      draft: {
        title: 'Refeição Registrada por Voz',
        notes: text,
      },
    };
  }
}

export const geminiService = new GeminiService();
