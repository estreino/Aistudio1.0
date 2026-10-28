# Relatório Técnico: Prova de Conceito de Voz e Limitações no Safari/iOS

* **Data da Investigação:** 27 de Outubro de 2026
* **Projeto:** MyRoutine AI (v1.0)
* **Plataforma Prioritária:** iPhone, iOS Safari, WebKit, PWA

---

## 1. Objetivo da Investigação
Avaliar a viabilidade de captura, transcrição e conversão de áudio em rascunhos de rotina no iPhone sem conexão à internet e documentar as capacidades reais do ecossistema WebKit.

---

## 2. Diagnóstico da API `webkitSpeechRecognition` no iOS Safari

### 2.1 Dependência de Servidores Apple
- No iOS Safari e em PWAs instaladas na tela de início, a implementação da `webkitSpeechRecognition` roteia o processamento fonético para os servidores da Apple.
- **Comportamento em Modo Avião / Sem Internet:** A API emite imediatamente o erro `event.error = "network"`, interrompendo a sessão de reconhecimento no navegador web.
- **Conclusão:** Não existe suporte oficial a ditar via JavaScript no WebKit de forma 100% offline nativamente pelo navegador web padrão.

### 2.2 Alternativa Nativa do Sistema iOS (Teclado do iPhone)
- O teclado virtual do iOS possui o botão nativo de microfone (Ditado do iOS / On-Device Dictation nos iPhones modernos a partir do chip A12 Bionic).
- O ditado do teclado nativo funciona **offline** em qualquer campo `<input>` ou `<textarea>` do MyRoutine AI com alta precisão para português do Brasil (`pt-BR`).
- **Decisão:** Aproveitar o microfone nativo do teclado em todos os campos de texto do app e usar a Web Speech API quando houver conectividade.

---

## 3. Avaliação de Modelos Locais via WebAssembly (WASM)

Investigamos bibliotecas com modelos embarcados para navegadores (ex: Whisper WASM, Vosk.js):

| Critério | Whisper Tiny/Base WASM | Modelo Nativo iOS / Web Speech |
| :--- | :--- | :--- |
| **Tamanho do Download** | 40 MB a 150 MB no primeiro carregamento | 0 MB (já presente no dispositivo) |
| **Consumo de Memória RAM** | ~250 MB a 400 MB de alocação de buffer | Leve / gerenciado pelo SO |
| **Risco no Safari iOS** | Alto risco de fechamento forçado da aba pelo WebKit por limite de memória (Jetsam limit) | Zero risco de encerramento da aba |
| **Consumo de Bateria** | Intenso devido ao processamento neural intensivo em CPU/WASM | Otimizado via hardware do iPhone |
| **Compatibilidade pt-BR** | Taxa de erro de palavras (WER) aceitável apenas com modelos médios | Excelente acentuação e vocabulário brasileiro |

---

## 4. Diretrizes Arquiteturais e Proteções Adotadas

1. **Voz é Estritamente Opcional:** O usuário nunca é impedido de registrar eventos manualmente por toque ou digitação.
2. **Sem Gravação Contínua:** O microfone só grava quando o botão é explicitamente acionado e desliga automaticamente assim que a frase é finalizada.
3. **Sem Salvamento Silencioso:** Toda fala transcrita aparece primeiro em uma caixa de texto na tela para que o usuário revise, corrija e clique em "Confirmar".
4. **Nenhum Dado de Áudio Bruto Salvo:** O áudio é descartado imediatamente após a transcrição fonética. Nenhum arquivo `.wav` ou `.mp3` é retido na memória local ou transmitido para servidores proprietários.
