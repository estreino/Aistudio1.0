/**
 * Serviço de reconhecimento vocal para português brasileiro (pt-BR).
 * Mapeia suporte e gerencia a máquina de estados de áudio.
 */

export type VoiceState =
  | 'IDLE'          // Pronto para escutar
  | 'LISTENING'     // Microfone captando áudio
  | 'PROCESSING'    // Processando fonemas
  | 'SUCCESS'       // Transcrição final disponível
  | 'ERROR'         // Erro de microfone, permissão ou rede
  | 'UNSUPPORTED';  // Navegador sem suporte à SpeechRecognition API

export interface VoiceRecognitionEvents {
  onStateChange: (state: VoiceState) => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
}

// Interface global para compatibilidade com WebKit
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private state: VoiceState = 'IDLE';
  private events: VoiceRecognitionEvents | null = null;
  private transcript: string = '';

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  private initRecognition(): void {
    if (!this.isSupported()) {
      this.state = 'UNSUPPORTED';
      return;
    }

    try {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.setState('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          this.transcript = currentText;
          this.events?.onTranscript(currentText, !!final);
        }
      };

      this.recognition.onspeechend = () => {
        this.setState('PROCESSING');
      };

      this.recognition.onend = () => {
        if (this.state === 'LISTENING' || this.state === 'PROCESSING') {
          this.setState('SUCCESS');
        }
      };

      this.recognition.onerror = (event: any) => {
        let errorMsg = 'Erro no reconhecimento vocal.';
        if (event.error === 'not-allowed') {
          errorMsg = 'Permissão de microfone negada. Habilite o acesso nas configurações do Safari.';
        } else if (event.error === 'network') {
          errorMsg = 'Reconhecimento indisponível offline no Safari. O WebKit exige conexão para ditar via Web Speech.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'Nenhuma fala detectada. Tente falar mais próximo ao microfone.';
        }

        this.setState('ERROR');
        this.events?.onError(errorMsg);
      };
    } catch (err) {
      console.warn('Erro ao inicializar SpeechRecognition:', err);
      this.state = 'UNSUPPORTED';
    }
  }

  public setEvents(events: VoiceRecognitionEvents): void {
    this.events = events;
  }

  public startListening(): boolean {
    if (!this.isSupported() || !this.recognition) {
      this.events?.onError('Reconhecimento de fala não suportado neste navegador.');
      this.setState('UNSUPPORTED');
      return false;
    }

    try {
      this.transcript = '';
      this.recognition.start();
      return true;
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        // Já estava em execução
        this.recognition.stop();
      } else {
        this.setState('ERROR');
        this.events?.onError(`Falha ao iniciar escuta: ${err.message || 'desconhecida'}`);
      }
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignora
      }
    }
  }

  public cancel(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignora
      }
    }
    this.setState('IDLE');
  }

  public getState(): VoiceState {
    return this.state;
  }

  private setState(newState: VoiceState): void {
    this.state = newState;
    this.events?.onStateChange(newState);
  }
}

export const speechService = new SpeechRecognitionService();
