import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { speechService, VoiceState } from '../../services/voice/speechRecognitionService';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTranscript: (text: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onConfirmTranscript,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTranscript('');
    setErrorMessage(null);

    speechService.setEvents({
      onStateChange: (newState) => {
        setVoiceState(newState);
      },
      onTranscript: (newText) => {
        setTranscript(newText);
      },
      onError: (msg) => {
        setErrorMessage(msg);
      },
    });

    // Inicia a escuta automaticamente ao abrir
    speechService.startListening();

    return () => {
      speechService.cancel();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (voiceState === 'LISTENING') {
      speechService.stopListening();
    } else {
      setErrorMessage(null);
      speechService.startListening();
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setErrorMessage(null);
    speechService.startListening();
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onConfirmTranscript(transcript.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[90dvh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Reconhecimento de Voz</h2>
              <span className="text-[11px] text-slate-500">Português do Brasil (pt-BR)</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área Central de Escuta e Transcrição */}
        <div className="space-y-4 py-2">
          {/* Botão de Microfone com Estados Visuais */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <button
              onClick={handleToggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                voiceState === 'LISTENING'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse scale-105'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
              }`}
              aria-label={voiceState === 'LISTENING' ? 'Parar gravação' : 'Iniciar gravação'}
            >
              {voiceState === 'LISTENING' ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <span className="text-xs font-medium text-slate-300">
              {voiceState === 'LISTENING' && 'Ouvindo... Fale agora'}
              {voiceState === 'PROCESSING' && 'Processando transcrição...'}
              {voiceState === 'SUCCESS' && 'Fala captada com sucesso!'}
              {voiceState === 'IDLE' && 'Toque no microfone para falar'}
              {voiceState === 'ERROR' && 'Houve um problema com a captura'}
              {voiceState === 'UNSUPPORTED' && 'Navegador sem suporte direto'}
            </span>
          </div>

          {/* Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
                <p className="text-[11px] text-red-400/80">
                  Dica: No iPhone, você também pode usar o botão nativo de microfone do teclado do iOS para ditar offline em qualquer campo de texto!
                </p>
              </div>
            </div>
          )}

          {/* Caixa de Texto Transcrito (Editável pelo Usuário) */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs block">
              Texto Transcrito (você pode editar antes de confirmar):
            </label>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="O que você falar aparecerá aqui. Ex: 'Tomei 500 ml de água agora às 14h'..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Exemplos de Comandos Canônicos */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 space-y-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Exemplos de frases recomendadas:
            </span>
            <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
              <li>"Registra 500 ml de água"</li>
              <li>"Tomei um café com leite"</li>
              <li>"Dormi 7 horas e meia"</li>
              <li>"Treinei 45 minutos de musculação"</li>
              <li>"Minha energia está em 4 de 5"</li>
              <li>"Almoço: arroz, feijão e frango grelhado"</li>
            </ul>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="pt-2 border-t border-slate-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRetry}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
            title="Ditar novamente"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repetir</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium text-center"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!transcript.trim()}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition disabled:bg-slate-800 disabled:text-slate-500"
          >
            <Check className="w-4 h-4" />
            <span>Usar Texto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
