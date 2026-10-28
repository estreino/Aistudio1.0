import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  Shield,
  HelpCircle,
  FileText,
  MessageSquare,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { useRoutineStorage } from '../hooks/useRoutineStorage';
import { geminiService, DraftParseResult } from '../services/ai/geminiService';
import { DraftReviewModal } from '../components/ai/DraftReviewModal';
import { VoiceInputModal } from '../components/voice/VoiceInputModal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AssistantView: React.FC = () => {
  const { entries, addEntry } = useRoutineStorage();

  const [inputText, setInputText] = useState('');
  const [isProcessingDraft, setIsProcessingDraft] = useState(false);
  const [isAnsweringChat, setIsAnsweringChat] = useState(false);
  const [draftResult, setDraftResult] = useState<DraftParseResult | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá! Sou o assistente de rotina do MyRoutine AI. Você pode me descrever algo que fez para gerar um rascunho de registro, ou me fazer perguntas sobre o que foi anotado no seu diário recente.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Monta resumo factual dos registros recentes para servir de contexto estrito
  const buildContextSummary = (): string => {
    const todayStr = new Date().toISOString().split('T')[0];
    const recent = entries.slice(0, 15);

    if (recent.length === 0) {
      return 'Nenhum registro encontrado no diário até o momento.';
    }

    return recent
      .map((e) => {
        if (e.type === 'hydration') return `[Água] ${e.volumeMl}ml em ${e.timestamp}`;
        if (e.type === 'caffeine') return `[Cafeína] ${e.beverageName} (~${e.estimatedCaffeineMg}mg) em ${e.timestamp}`;
        if (e.type === 'sleep') return `[Sono] Duração ${e.durationMinutes}min, nota ${e.qualityRating}/5, acordou em ${e.wakeTime}`;
        if (e.type === 'workout') return `[Treino] ${e.title || e.modality} (${e.durationMinutes || 0}min) em ${e.startTime}`;
        if (e.type === 'energy') return `[Energia] Nível ${e.level}/5 (${e.context}) em ${e.timestamp}`;
        if (e.type === 'meal') return `[Refeição] ${e.name} em ${e.timestamp}`;
        return `[Evento] ${e.type}`;
      })
      .join('\n');
  };

  // Fluxo 1: Gerar Rascunho a partir de Texto Livre
  const handleGenerateDraft = async () => {
    if (!inputText.trim()) return;
    setIsProcessingDraft(true);

    try {
      const result = await geminiService.parseNaturalLanguageToDraft(inputText);
      setDraftResult(result);
      setIsDraftModalOpen(true);
    } catch (err) {
      console.error('Falha ao processar rascunho:', err);
    } finally {
      setIsProcessingDraft(false);
    }
  };

  // Fluxo 2: Perguntar ao Assistente sobre os Dados Reais
  const handleAskQuestion = async (questionText?: string) => {
    const query = questionText || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputText('');
    setIsAnsweringChat(true);

    try {
      const context = buildContextSummary();
      const reply = await geminiService.askRoutineAssistant(query, context);

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Não consegui obter a resposta no momento. O núcleo manual do seu app continua disponível normalmente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAnsweringChat(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Cabeçalho do Assistente com Princípio de Isolamento */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Assistente de Rotina (Gemini 3.8 Flash)
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 font-mono">
            Isolado & Opcional
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Gere rascunhos estruturados para o diário ou faça perguntas sobre os registros factuais do seu aparelho.
          Nada é salvo sem a sua confirmação explícita.
        </p>
      </div>

      {/* Caixa de Entrada de Texto Livre */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <label className="block text-xs font-medium text-slate-300">
          Descreva sua atividade ou faça uma pergunta:
        </label>

        <div className="relative">
          <textarea
            rows={3}
            placeholder="Ex: 'Tomei 500 ml de água agora' ou 'Almocei frango com arroz' ou 'O que registrei hoje?'..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/50 hover:bg-purple-900/50 text-purple-300 transition flex items-center gap-1.5 text-xs font-medium"
            title="Ditar por voz"
          >
            <Mic className="w-4 h-4 text-purple-400" />
            <span className="hidden xs:inline">Ditar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAskQuestion()}
              disabled={isAnsweringChat || !inputText.trim()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Perguntar</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={isProcessingDraft || !inputText.trim()}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition disabled:opacity-50 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isProcessingDraft ? 'Processando...' : 'Gerar Rascunho'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Perguntas Frequentes Sugeridas */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 block">
          Perguntas Frequentes sobre seu Diário:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => handleAskQuestion('O que registrei no meu diário hoje?')}
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
          >
            O que registrei hoje?
          </button>
          <button
            type="button"
            onClick={() => handleAskQuestion('Quanto de cafeína registrei hoje e em quais horários?')}
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
          >
            Doses de cafeína de hoje?
          </button>
          <button
            type="button"
            onClick={() => handleAskQuestion('Qual foi a minha média de sono na última semana?')}
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
          >
            Média de sono semanal?
          </button>
        </div>
      </div>

      {/* Histórico do Diálogo com o Assistente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            Diálogo de Apoio
          </span>
          <button
            onClick={() => setChatMessages([])}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
          >
            Limpar conversa
          </button>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl text-xs space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-purple-950/40 border border-purple-800/40 ml-6 text-purple-100'
                  : 'bg-slate-950/70 border border-slate-800 mr-6 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{msg.sender === 'user' ? 'Você' : 'Assistente MyRoutine'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))}

          {isAnsweringChat && (
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 mr-6 text-xs text-slate-400 animate-pulse">
              Consultando seus registros e gerando resposta factual...
            </div>
          )}
        </div>
      </div>

      {/* Princípios de Segurança e Não-Invenção de Dados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Garantias de Privacidade e Não-Invenção
          </h3>
        </div>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>A IA nunca inventa horários, quantidades ou nutrientes não citados.</li>
          <li>Respostas com ambiguidades geram pedidos de esclarecimento antes de salvar.</li>
          <li>Nenhum dado interpretado entra no diário sem o seu clique em "Confirmar".</li>
          <li>O aplicativo opera com 100% de autonomia e privacidade sem internet.</li>
        </ul>
      </div>

      {/* Modal de Revisão do Rascunho Gerado */}
      <DraftReviewModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        draftResult={draftResult}
        onConfirmSave={addEntry}
      />

      {/* Modal de Ditado Vocal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmTranscript={async (spokenText) => {
          setInputText(spokenText);
          setIsProcessingDraft(true);
          try {
            const result = await geminiService.parseNaturalLanguageToDraft(spokenText);
            setDraftResult(result);
            setIsDraftModalOpen(true);
          } catch (err) {
            console.error('Falha ao processar rascunho por voz:', err);
          } finally {
            setIsProcessingDraft(false);
          }
        }}
      />
    </div>
  );
};
