import {
  McpScope,
  McpToken,
  McpAuditLog,
  McpManifest,
  McpResourceDefinition,
  McpToolDefinition,
  McpQueryRequest,
  McpQueryResponse,
} from './mcpTypes';
import { RoutineEntry } from '../../types/models';

const MCP_TOKENS_STORAGE_KEY = 'myroutine_mcp_tokens_v1';
const MCP_AUDIT_STORAGE_KEY = 'myroutine_mcp_audit_logs_v1';
const MAX_AUDIT_LOGS = 200;

export const MCP_MANIFEST: McpManifest = {
  protocolVersion: '2024-11-05',
  serverInfo: {
    name: 'MyRoutine AI - MCP Consent Server',
    version: '1.0.0-alpha.12',
    description: 'Servidor MCP local-first para integração consentida de leitura de rotina pessoal',
    author: 'MyRoutine AI',
  },
  capabilities: {
    resources: true,
    tools: true,
    prompts: false,
    readOnly: true,
    mutationsAllowed: false,
  },
  supportedScopes: [
    {
      scope: 'read:routine:today',
      name: 'Leitura da Rotina de Hoje',
      description: 'Acesso estrito e exclusivo aos registros (refeições, hidratação, cafeína, treinos, sono) do dia atual.',
    },
    {
      scope: 'read:routine:summary',
      name: 'Leitura de Médias e Resumos',
      description: 'Acesso a métricas consolidadas (médias de sono, totais de água e histórico de treinos dos últimos 7 a 30 dias).',
    },
    {
      scope: 'read:routine:all',
      name: 'Leitura Completa do Histórico',
      description: 'Acesso de leitura irrestrito a todos os registros passados armazenados no dispositivo.',
    },
  ],
  resources: [
    {
      uri: 'routine://today',
      name: 'Registros do Dia Atual',
      description: 'Retorna todos os eventos e registros estruturados do dia corrente em formato JSON padronizado.',
      mimeType: 'application/json',
      requiredScope: 'read:routine:today',
    },
    {
      uri: 'routine://weekly-summary',
      name: 'Resumo da Semana',
      description: 'Métricas consolidadas dos últimos 7 dias: média de sono, ingestão hídrica, cafeína acumulada e frequência de treinos.',
      mimeType: 'application/json',
      requiredScope: 'read:routine:summary',
    },
    {
      uri: 'routine://nutrition',
      name: 'Dados Nutricionais Consolidados',
      description: 'Resumo calórico e de macronutrientes (proteínas, carboidratos, gorduras) com discriminação de fontes confiáveis.',
      mimeType: 'application/json',
      requiredScope: 'read:routine:today',
    },
    {
      uri: 'routine://sleep',
      name: 'Histórico e Qualidade do Sono',
      description: 'Métricas de duração de sono, horário de dormir/acordar e avaliação subjetiva da qualidade.',
      mimeType: 'application/json',
      requiredScope: 'read:routine:summary',
    },
  ],
  tools: [
    {
      name: 'query_routine_data',
      description: 'Consulta filtrada de registros por data específica ou categoria de registro (meal, sleep, caffeine, hydration, workout, energy). Operação estritamente de leitura.',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Data no formato YYYY-MM-DD (padrão: hoje)' },
          type: { type: 'string', description: 'Tipo de registro opcional para filtro' },
          limit: { type: 'number', description: 'Número máximo de registros a retornar (padrão: 50)' },
        },
      },
      requiredScope: 'read:routine:today',
    },
    {
      name: 'get_weekly_metrics',
      description: 'Computa agregações matemáticas dos últimos N dias (água total, cafeína total, média de sono, total de treinos).',
      inputSchema: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Janela de dias para análise (entre 1 e 30, padrão: 7)' },
        },
      },
      requiredScope: 'read:routine:summary',
    },
    {
      name: 'audit_data_gaps',
      description: 'Verifica dias ou turnos recentes com ausência de registros (ex: dia sem hidratação ou sono registrado) para apoiar planejamento do usuário.',
      inputSchema: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Período retrospectivo em dias (padrão: 7)' },
        },
      },
      requiredScope: 'read:routine:summary',
    },
  ],
};

export class McpService {
  // ==========================================
  // GESTÃO DE TOKENS DE CONSENTIMENTO
  // ==========================================

  public static getTokens(): McpToken[] {
    try {
      const data = localStorage.getItem(MCP_TOKENS_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as McpToken[];
    } catch {
      return [];
    }
  }

  public static saveTokens(tokens: McpToken[]): void {
    try {
      localStorage.setItem(MCP_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } catch (e) {
      console.error('Falha ao persistir tokens MCP:', e);
    }
  }

  public static createToken(name: string, scopes: McpScope[], expiresInDays: number = 30): { token: McpToken; rawKey: string } {
    if (!name.trim()) {
      throw new Error('O nome do cliente ou agente solicitante é obrigatório.');
    }
    if (!scopes || scopes.length === 0) {
      throw new Error('Pelo menos um escopo de leitura consentida deve ser selecionado.');
    }

    // Gerar chave pseudo-criptográfica segura
    const randomBytes = new Uint8Array(24);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < 24; i++) randomBytes[i] = Math.floor(Math.random() * 256);
    }

    const randomHex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const rawKey = `mcp_live_${randomHex}`;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const id = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tokenHash = `${rawKey.substring(0, 13)}...${rawKey.substring(rawKey.length - 4)}`;

    const newToken: McpToken = {
      id,
      name: name.trim(),
      tokenHash,
      tokenRaw: rawKey,
      scopes,
      createdAt: now.toISOString(),
      expiresAt,
      lastUsedAt: null,
      revoked: false,
    };

    const tokens = this.getTokens();
    tokens.unshift(newToken);
    this.saveTokens(tokens);

    // Registro de auditoria inicial de emissão
    this.addAuditLog({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      tokenId: id,
      clientName: name.trim(),
      scope: scopes[0],
      resourceOrTool: 'token:created',
      status: 'granted',
      reason: `Token emitido com escopos: ${scopes.join(', ')} (validade: ${expiresInDays} dias)`,
    });

    return { token: newToken, rawKey };
  }

  public static revokeToken(tokenId: string): boolean {
    const tokens = this.getTokens();
    const target = tokens.find((t) => t.id === tokenId);
    if (!target) return false;

    target.revoked = true;
    this.saveTokens(tokens);

    this.addAuditLog({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      tokenId: target.id,
      clientName: target.name,
      scope: target.scopes[0] || 'read:routine:today',
      resourceOrTool: 'token:revoked',
      status: 'denied',
      reason: 'Token revogado manualmente pelo usuário.',
    });

    return true;
  }

  public static deleteToken(tokenId: string): boolean {
    const tokens = this.getTokens();
    const updated = tokens.filter((t) => t.id !== tokenId);
    if (updated.length === tokens.length) return false;
    this.saveTokens(updated);
    return true;
  }

  // ==========================================
  // VALIDAÇÃO DE AUTORIZAÇÃO E ESCOPO
  // ==========================================

  public static validateToken(rawToken: string, requiredScope: McpScope): { valid: boolean; token?: McpToken; error?: string } {
    if (!rawToken || !rawToken.trim()) {
      return { valid: false, error: 'Token de autenticação MCP não fornecido (HTTP 401 Unauthorized).' };
    }

    const cleanToken = rawToken.replace(/^Bearer\s+/i, '').trim();
    const tokens = this.getTokens();

    const matched = tokens.find((t) => t.tokenRaw === cleanToken);
    if (!matched) {
      return { valid: false, error: 'Token de acesso inválido ou desconhecido.' };
    }

    if (matched.revoked) {
      return { valid: false, error: 'Este token de acesso foi expressamente revogado.' };
    }

    const now = new Date();
    if (new Date(matched.expiresAt) < now) {
      return { valid: false, error: 'Este token de acesso expirou. Emita um novo token nas Configurações.' };
    }

    // Verificação hierárquica de escopos:
    // read:routine:all satisfaz qualquer requisição de leitura.
    const hasScope =
      matched.scopes.includes('read:routine:all') ||
      matched.scopes.includes(requiredScope) ||
      (requiredScope === 'read:routine:today' && matched.scopes.includes('read:routine:summary'));

    if (!hasScope) {
      return {
        valid: false,
        error: `Escopo insuficiente. Requerido: '${requiredScope}', Concedido no token: [${matched.scopes.join(', ')}].`,
      };
    }

    // Atualizar lastUsedAt
    matched.lastUsedAt = now.toISOString();
    this.saveTokens(tokens);

    return { valid: true, token: matched };
  }

  // ==========================================
  // LOGS DE AUDITORIA IMUTÁVEIS
  // ==========================================

  public static getAuditLogs(): McpAuditLog[] {
    try {
      const data = localStorage.getItem(MCP_AUDIT_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as McpAuditLog[];
    } catch {
      return [];
    }
  }

  public static addAuditLog(log: McpAuditLog): void {
    try {
      const logs = this.getAuditLogs();
      logs.unshift(log);
      if (logs.length > MAX_AUDIT_LOGS) {
        logs.splice(MAX_AUDIT_LOGS);
      }
      localStorage.setItem(MCP_AUDIT_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Falha ao gravar log de auditoria MCP:', e);
    }
  }

  public static clearAuditLogs(): void {
    try {
      localStorage.removeItem(MCP_AUDIT_STORAGE_KEY);
    } catch (e) {
      console.error('Falha ao limpar logs de auditoria MCP:', e);
    }
  }

  // ==========================================
  // EXECUTOR DE CONSULTAS READ-ONLY
  // ==========================================

  public static executeQuery(
    rawToken: string,
    request: McpQueryRequest,
    entries: RoutineEntry[]
  ): McpQueryResponse {
    const startTime = performance.now();
    const serverTime = new Date().toISOString();
    const auditId = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Identificar recurso ou ferramenta
    const targetResource = request.resource
      ? MCP_MANIFEST.resources.find((r) => r.uri === request.resource)
      : null;
    const targetTool = request.tool
      ? MCP_MANIFEST.tools.find((t) => t.name === request.tool)
      : null;

    if (!targetResource && !targetTool) {
      const errorMsg = `Recurso ou ferramenta MCP desconhecida. Forneça resource ou tool válido.`;
      this.addAuditLog({
        id: auditId,
        timestamp: serverTime,
        tokenId: 'anonymous',
        clientName: 'Desconhecido',
        scope: 'read:routine:today',
        resourceOrTool: request.resource || request.tool || 'unknown',
        status: 'error',
        reason: errorMsg,
      });
      return { success: false, error: errorMsg, auditLogId: auditId, serverTime };
    }

    const requiredScope: McpScope = targetResource
      ? targetResource.requiredScope
      : targetTool!.requiredScope;

    const resourceOrToolName = targetResource ? targetResource.uri : targetTool!.name;

    // Validar token
    const validation = this.validateToken(rawToken, requiredScope);
    if (!validation.valid || !validation.token) {
      this.addAuditLog({
        id: auditId,
        timestamp: serverTime,
        tokenId: 'unauthorized',
        clientName: 'Agente Não Autorizado',
        scope: requiredScope,
        resourceOrTool: resourceOrToolName,
        status: 'denied',
        reason: validation.error || 'Acesso negado.',
      });
      return { success: false, error: validation.error, auditLogId: auditId, serverTime };
    }

    const token = validation.token;

    try {
      let resultData: any = null;

      // Execução de Recursos
      if (targetResource) {
        resultData = this.resolveResource(targetResource.uri, entries);
      } else if (targetTool) {
        resultData = this.resolveTool(targetTool.name, request.params || {}, entries);
      }

      const execTime = Math.round(performance.now() - startTime);

      this.addAuditLog({
        id: auditId,
        timestamp: serverTime,
        tokenId: token.id,
        clientName: token.name,
        scope: requiredScope,
        resourceOrTool: resourceOrToolName,
        status: 'granted',
        reason: `Consulta de leitura autorizada com sucesso (${execTime}ms).`,
        executionTimeMs: execTime,
      });

      return {
        success: true,
        data: resultData,
        auditLogId: auditId,
        serverTime,
      };
    } catch (err: any) {
      const execTime = Math.round(performance.now() - startTime);
      const errMsg = err?.message || 'Erro durante a extração de dados do MCP.';
      this.addAuditLog({
        id: auditId,
        timestamp: serverTime,
        tokenId: token.id,
        clientName: token.name,
        scope: requiredScope,
        resourceOrTool: resourceOrToolName,
        status: 'error',
        reason: errMsg,
        executionTimeMs: execTime,
      });

      return {
        success: false,
        error: errMsg,
        auditLogId: auditId,
        serverTime,
      };
    }
  }

  // ==========================================
  // RESOLUÇÃO DE RECURSOS
  // ==========================================

  private static resolveResource(uri: string, entries: RoutineEntry[]) {
    const todayStr = new Date().toISOString().split('T')[0];

    switch (uri) {
      case 'routine://today': {
        const todayEntries = entries.filter((e) => {
          const entryDate = ('timestamp' in e ? e.timestamp : 'startTime' in e ? e.startTime : e.bedTime) || '';
          return entryDate.startsWith(todayStr);
        });

        return {
          date: todayStr,
          totalEntries: todayEntries.length,
          entries: todayEntries,
        };
      }

      case 'routine://weekly-summary': {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentEntries = entries.filter((e) => {
          const entryDateStr = ('timestamp' in e ? e.timestamp : 'startTime' in e ? e.startTime : e.bedTime) || '';
          const d = new Date(entryDateStr);
          return d >= sevenDaysAgo && d <= now;
        });

        let totalWaterMl = 0;
        let totalCaffeineMg = 0;
        let totalSleepMinutes = 0;
        let sleepCount = 0;
        let workoutCount = 0;

        for (const e of recentEntries) {
          if (e.type === 'hydration') totalWaterMl += e.volumeMl;
          if (e.type === 'caffeine') totalCaffeineMg += e.estimatedCaffeineMg || 0;
          if (e.type === 'sleep') {
            totalSleepMinutes += e.durationMinutes;
            sleepCount++;
          }
          if (e.type === 'workout') workoutCount++;
        }

        return {
          period: '7_days',
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          endDate: todayStr,
          totalRecordsAnalyzed: recentEntries.length,
          hydration: {
            totalMl: totalWaterMl,
            dailyAverageMl: Math.round(totalWaterMl / 7),
          },
          caffeine: {
            totalEstimatedMg: totalCaffeineMg,
            dailyAverageMg: Math.round(totalCaffeineMg / 7),
          },
          sleep: {
            recordsCount: sleepCount,
            averageDurationHours: sleepCount > 0 ? Number((totalSleepMinutes / sleepCount / 60).toFixed(1)) : 0,
          },
          workout: {
            totalSessions: workoutCount,
          },
        };
      }

      case 'routine://nutrition': {
        const todayMeals = entries.filter((e) => {
          if (e.type !== 'meal') return false;
          return e.timestamp.startsWith(todayStr);
        });

        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fats = 0;

        for (const meal of todayMeals) {
          if (meal.type === 'meal' && meal.totalNutrition) {
            calories += meal.totalNutrition.calories || 0;
            protein += meal.totalNutrition.protein || 0;
            carbs += meal.totalNutrition.carbs || 0;
            fats += meal.totalNutrition.fats || 0;
          }
        }

        return {
          date: todayStr,
          mealsLoggedCount: todayMeals.length,
          totals: {
            calories: Math.round(calories),
            proteinGrams: Math.round(protein),
            carbsGrams: Math.round(carbs),
            fatsGrams: Math.round(fats),
          },
          meals: todayMeals,
        };
      }

      case 'routine://sleep': {
        const sleepEntries = entries.filter((e) => e.type === 'sleep');
        const sorted = [...sleepEntries].sort((a, b) => {
          const dateA = new Date(a.type === 'sleep' ? a.wakeTime : '').getTime();
          const dateB = new Date(b.type === 'sleep' ? b.wakeTime : '').getTime();
          return dateB - dateA;
        });

        return {
          totalLoggedNights: sorted.length,
          recentRecords: sorted.slice(0, 14),
        };
      }

      default:
        throw new Error(`Recurso MCP não suportado: ${uri}`);
    }
  }

  // ==========================================
  // RESOLUÇÃO DE FERRAMENTAS
  // ==========================================

  private static resolveTool(toolName: string, params: Record<string, any>, entries: RoutineEntry[]) {
    const todayStr = new Date().toISOString().split('T')[0];

    switch (toolName) {
      case 'query_routine_data': {
        const dateFilter = params.date || todayStr;
        const typeFilter = params.type;
        const limit = Math.min(Math.max(params.limit || 50, 1), 100);

        let filtered = entries.filter((e) => {
          const dStr = ('timestamp' in e ? e.timestamp : 'startTime' in e ? e.startTime : e.bedTime) || '';
          const matchesDate = dStr.startsWith(dateFilter);
          const matchesType = typeFilter ? e.type === typeFilter : true;
          return matchesDate && matchesType;
        });

        return {
          filterApplied: { date: dateFilter, type: typeFilter || 'all', limit },
          totalMatches: filtered.length,
          results: filtered.slice(0, limit),
        };
      }

      case 'get_weekly_metrics': {
        const days = Math.min(Math.max(params.days || 7, 1), 30);
        const now = new Date();
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const filtered = entries.filter((e) => {
          const dStr = ('timestamp' in e ? e.timestamp : 'startTime' in e ? e.startTime : e.bedTime) || '';
          return new Date(dStr) >= cutoff;
        });

        let waterMl = 0;
        let caffeineMg = 0;
        let workoutSessions = 0;
        let sleepMinutes = 0;
        let sleepEntriesCount = 0;

        for (const e of filtered) {
          if (e.type === 'hydration') waterMl += e.volumeMl;
          if (e.type === 'caffeine') caffeineMg += e.estimatedCaffeineMg || 0;
          if (e.type === 'workout') workoutSessions++;
          if (e.type === 'sleep') {
            sleepMinutes += e.durationMinutes;
            sleepEntriesCount++;
          }
        }

        return {
          windowDays: days,
          totalEntriesFound: filtered.length,
          aggregates: {
            hydration: {
              totalVolumeMl: waterMl,
              dailyAverageMl: Math.round(waterMl / days),
            },
            caffeine: {
              totalMg: caffeineMg,
              dailyAverageMg: Math.round(caffeineMg / days),
            },
            workout: {
              totalSessions: workoutSessions,
            },
            sleep: {
              sessionsCount: sleepEntriesCount,
              averageHours: sleepEntriesCount > 0 ? Number((sleepMinutes / sleepEntriesCount / 60).toFixed(1)) : 0,
            },
          },
        };
      }

      case 'audit_data_gaps': {
        const days = Math.min(Math.max(params.days || 7, 1), 14);
        const gaps: { date: string; missingCategories: string[] }[] = [];

        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          const dayEntries = entries.filter((e) => {
            const entryDate = ('timestamp' in e ? e.timestamp : 'startTime' in e ? e.startTime : e.bedTime) || '';
            return entryDate.startsWith(dateStr);
          });

          const missing: string[] = [];
          if (!dayEntries.some((e) => e.type === 'hydration')) missing.push('hydration');
          if (!dayEntries.some((e) => e.type === 'sleep')) missing.push('sleep');
          if (!dayEntries.some((e) => e.type === 'meal')) missing.push('meal');

          if (missing.length > 0) {
            gaps.push({ date: dateStr, missingCategories: missing });
          }
        }

        return {
          periodDaysChecked: days,
          daysWithMissingData: gaps.length,
          gaps,
        };
      }

      default:
        throw new Error(`Ferramenta MCP desconhecida: ${toolName}`);
    }
  }
}
