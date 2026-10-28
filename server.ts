import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Instância compartilhada do SDK @google/genai com User-Agent 'aistudio-build'
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Endpoint: Extração de texto livre para rascunho estruturado (Draft)
app.post('/api/ai/parse-draft', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto não informado.' });
  }

  const ai = getAiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY não configurada no servidor. O aplicativo funciona normalmente no modo manual.',
    });
  }

  try {
    const prompt = `Você é o extrator de rotina do aplicativo pessoal MyRoutine AI.
Sua missão é extrair EXCLUSIVAMENTE o que o usuário explicitamente relatou.
REGRAS OBRIGATÓRIAS:
1. NUNCA invente horários, porções, quantidades ou nutrientes não mencionados.
2. Identifique se o relato se refere a "meal" (refeição), "hydration" (água), "caffeine" (café), "sleep" (sono), "workout" (exercício/treino) ou "energy" (energia).
3. Se os dados forem insuficientes ou ambíguos (ex: "comi um lanche" sem detalhar itens ou "treinei hoje" sem especificar tempo/modalidade), marque "ambiguous": true e forneça mensagem amigável em "clarificationNeeded".
4. Retorne APENAS um objeto JSON válido no formato:
{
  "category": "meal" | "hydration" | "caffeine" | "sleep" | "workout" | "energy" | "unknown",
  "ambiguous": boolean,
  "clarificationNeeded"?: string,
  "draft": {
    "title": string,
    "time"?: string,
    "waterMl"?: number,
    "caffeineBeverage"?: string,
    "caffeineMg"?: number,
    "energyLevel"?: number,
    "sleepDurationMinutes"?: number,
    "sleepQualityRating"?: number,
    "workoutModality"?: string,
    "workoutDurationMinutes"?: number,
    "mealItems"?: Array<{ name: string, quantity: number, unit: string }>,
    "notes"?: string
  }
}

Texto do usuário: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (err: any) {
    console.error('Erro na chamada Gemini:', err);
    return res.status(500).json({
      error: err.message || 'Erro ao processar texto com a IA.',
    });
  }
});

// Endpoint: Perguntas sobre os registros reais da rotina
app.post('/api/ai/chat', async (req, res) => {
  const { message, contextSummary } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem vazia.' });
  }

  const ai = getAiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY não configurada no servidor. O aplicativo funciona normalmente no modo manual.',
    });
  }

  try {
    const systemInstruction = `Você é o assistente inteligente do MyRoutine AI.
Você responde perguntas estritamente baseando-se nos dados reais registrados pelo usuário.
REGRAS:
1. Baseie-se APENAS no contexto fornecido. Se um dado não estiver no contexto, diga claramente: "Não encontrei esse registro no seu diário recente."
2. NUNCA invente calorias, gramas, horários ou treinos fictícios.
3. Não prescreva dietas médicas, não diagnostique doenças e não recomende medicamentos.
4. Responda com clareza, concisão e empatia em português brasileiro.`;

    const prompt = `Contexto dos registros do usuário:
${contextSummary || 'Nenhum registro disponível.'}

Pergunta do usuário: "${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text || 'Não consegui formular uma resposta.' });
  } catch (err: any) {
    console.error('Erro no chat Gemini:', err);
    return res.status(500).json({
      error: err.message || 'Erro ao comunicar com a IA.',
    });
  }
});

// ==========================================
// MCP (MODEL CONTEXT PROTOCOL) ENDPOINTS
// ==========================================

// Endpoint: Manifesto Oficial do Servidor MCP
app.get('/api/mcp/manifest', (_req, res) => {
  res.json({
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
        description: 'Acesso estrito e exclusivo aos registros do dia atual.',
      },
      {
        scope: 'read:routine:summary',
        name: 'Leitura de Médias e Resumos',
        description: 'Acesso a métricas consolidadas dos últimos 7 a 30 dias.',
      },
      {
        scope: 'read:routine:all',
        name: 'Leitura Completa do Histórico',
        description: 'Acesso de leitura irrestrito a todos os registros passados.',
      },
    ],
    resources: [
      {
        uri: 'routine://today',
        name: 'Registros do Dia Atual',
        description: 'Retorna todos os eventos e registros estruturados do dia corrente em formato JSON.',
        mimeType: 'application/json',
        requiredScope: 'read:routine:today',
      },
      {
        uri: 'routine://weekly-summary',
        name: 'Resumo da Semana',
        description: 'Métricas consolidadas dos últimos 7 dias: média de sono, ingestão hídrica, cafeína e treinos.',
        mimeType: 'application/json',
        requiredScope: 'read:routine:summary',
      },
      {
        uri: 'routine://nutrition',
        name: 'Dados Nutricionais Consolidados',
        description: 'Resumo calórico e de macronutrientes do dia com discriminação de fontes.',
        mimeType: 'application/json',
        requiredScope: 'read:routine:today',
      },
      {
        uri: 'routine://sleep',
        name: 'Histórico e Qualidade do Sono',
        description: 'Métricas de duração, horários e avaliação de qualidade do sono.',
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
            limit: { type: 'number', description: 'Número máximo de registros a retornar' },
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
        description: 'Verifica dias ou turnos recentes com ausência de registros para apoiar o planejamento do usuário.',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'number', description: 'Período retrospectivo em dias (padrão: 7)' },
          },
        },
        requiredScope: 'read:routine:summary',
      },
    ],
  });
});

// Endpoint: Validação e Handshake MCP para Agentes Externos
app.post('/api/mcp/query', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação necessária. Envie o cabeçalho Authorization: Bearer <mcp_token>.',
      code: 'UNAUTHORIZED',
    });
  }

  const { resource, tool, params } = req.body;
  if (!resource && !tool) {
    return res.status(400).json({
      success: false,
      error: 'Parâmetro obrigatório ausente: especifique "resource" ou "tool".',
      code: 'BAD_REQUEST',
    });
  }

  return res.json({
    success: true,
    protocolVersion: '2024-11-05',
    acknowledged: true,
    message: 'Requisição MCP validada pelo servidor consentido. O processamento dos dados é executado pelo Sandbox Local.',
    requested: { resource, tool, params },
    timestamp: new Date().toISOString(),
  });
});


// Integração com Vite em desenvolvimento ou arquivos estáticos em produção
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor MyRoutine AI executando em http://0.0.0.0:${PORT}`);
});
