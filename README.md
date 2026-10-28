# MyRoutine AI (v1.0)

> Aplicativo pessoal, autônomo e focado em privacidade para acompanhamento e análise de rotina no iPhone (Safari / WebKit / PWA).

---

## 1. Visão Geral e Propósito
O **MyRoutine AI** foi concebido para resolver a dispersão de dados na rotina diária pessoal: alimentação, qualidade e horários de sono, consumo de cafeína, hidratação, oscilações de energia (1 a 5), trabalho, caminhadas e treinos de musculação/cardio.

Ao contrário de soluções baseadas exclusivamente em nuvem ou modelos com dependência forçada de internet, o MyRoutine AI segue o princípio **Local-First**:
- O núcleo funciona 100% offline no dispositivo.
- O catálogo de alimentos possui desenhos vetoriais SVG autônomos por código (sem downloads externos de imagens).
- Todos os cálculos de médias, sono cruzando meia-noite e resumos de nutrientes são executados na CPU local.
- Recursos de inteligência artificial (Gemini) e voz são camadas adicionais que requerem autorização explícita e nunca comprometem ou bloqueiam o funcionamento básico.

---

## 2. Plataforma Prioritária
- **Dispositivo Principal:** iPhone (iOS Safari, WebKit, PWA).
- **Adequação de Interface:**
  - Áreas seguras do iPhone (`safe-area-inset-*` para Notch e Dynamic Island).
  - Altura dinâmica `100dvh` para evitar solavancos na rolagem provocados pela barra de navegação do Safari.
  - Toques com áreas ergonômicas (mínimo de 44x44px).
  - Sem zoom automático em campos de formulário (inputs com tipografia mínima de 16px).
  - Sem rolagem horizontal residual.

---

## 3. Funcionalidades Planejadas e Fases
1. **Hoje:** Painel síntese com dados confirmados do dia (sem preenchimento automático com zero para dados ausentes).
2. **Diário:** Linha do tempo cronológica com filtros por categoria, edição, exclusão e identificação de fonte/estimativa.
3. **Alimentação Visual:** Catálogo SVG amplo dividido por categorias, montagem visual de refeições, unidades personalizáveis (g, ml, colher, unidade) e estimativas nutricionais transparentes.
4. **Treino:** Registro detalhado de sessões, exercícios, séries, repetições, carga, intervalo e energia antes/depois.
5. **Sono:** Registro de deitar, adormecer e despertar com cálculo correto de durações que cruzam a meia-noite.
6. **Hidratação e Cafeína:** Monitoramento mililitro a mililitro e mg de cafeína com indicação de incerteza da fonte.
7. **Energia e Contexto:** Escala de 1 a 5 com momentos da rotina (acordar, trabalho, pré-treino, pós-treino, dormir).
8. **Análises:** Resumos diários e de 7 dias com contagem explícita de amostras e tratamento de lacunas.
9. **Backup & Privacidade:** Exportação e importação JSON com validação de integridade, prevenção de duplicatas e proteção de dados sensíveis.
10. **Assistente IA e Voz (Fases posteriores):** Rascunhos via Gemini e transcrição vocal sempre sujeitos à revisão do usuário.

---

## 4. Como Executar e Testar

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Vite na porta 3000)
npm run dev
```

### Validação de Build e Tipagem
```bash
# Compilar e validar tipos TypeScript
npm run build
```

---

## 5. Limitações Técnicas Conhecidas
- **Expiração de Cache do Safari:** No Safari padrão (fora de PWA fixada), o WebKit pode limpar dados de IndexedDB após 7 dias de inatividade. O aplicativo disponibiliza lembrete e recurso de exportação JSON de segurança.
- **Microfone e Voz Offline no WebKit:** O reconhecimento contínuo de voz offline possui limitações nas APIs padrão do navegador WebKit/iOS. O aplicativo prioriza fluxo visual por toque e teclado, tratando voz como prova de conceito na Fase 9.
- **Saúde e Diagnóstico:** O aplicativo é uma ferramenta de auto-observação empírica e reflexão pessoal, sem qualquer finalidade de prescrição médica, diagnóstico clínico ou cálculo calórico absoluto.
