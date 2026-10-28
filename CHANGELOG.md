# Changelog — MyRoutine AI

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.
O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e adota Versionamento Semântico.

---

## [1.0.0] - 2026-10-28 (Lançamento Oficial & Fase 13 Concluída)

### Implementado
- **Suporte Completo a PWA (Progressive Web App)**:
  - Manifesto Web (`manifest.webmanifest`) com nome curto `HealthOS`, display `standalone` e tema dark `#090a0f`.
  - Ícone vetorial brand SVG (`icon.svg`) de alta definição com área segura compatível com ícones adaptativos (maskable) no Android e iOS.
  - Registro de Service Worker (`sw.js`) no `main.tsx` com estratégia Network-First e cache offline para casca da aplicação (`/`, `/index.html`, `/icon.svg`, `/manifest.webmanifest`).
  - **Bypass Crítico de API**: O Service Worker ignora ativamente qualquer chamada para `/api/*` (IA Gemini e MCP) e métodos não-GET, preservando integridade das integrações locais.
- **Componente de Instalação e Notificação Offline**:
  - `PWAInstallButton`: Detecção de `beforeinstallprompt` no Android/Desktop e modal passo a passo ilustrado para iOS Safari ("Adicionar à Tela de Início").
  - `OfflineIndicator`: Notificação não intrusiva no topo da tela informando "Modo Offline — IndexedDB Ativo" durante ausência de conexão.
  - Seção dedicada de PWA e Modo Avião adicionada à tela de Configurações (`SettingsView`).
- **Auditoria Final e Fechamento do Projeto**:
  - Emissão de `docs/AUDITORIA_FINAL.md` contendo a avaliação dos 27 pilares do Prompt Mestre, com status 100% CONFORME.
  - Atualização da matriz de testes `docs/TESTES.md` com 32/32 testes APROVADOS (100% de cobertura).
  - Versionamento promovido para `1.0.0` no `package.json`.

### Testado
- Modo Avião / Offline (`IPH-05`): **APROVADO**. O app inicializa, carrega do cache do Service Worker e permite registrar dados localmente sem conexão de rede.
- Instalação PWA: **APROVADO**. Manifesto validado, links de cabeçalho sincronizados.
- Integridade de compilação TypeScript (`BLD-01` e `BLD-02`): **APROVADO**.

---

## [1.0.0-alpha.12] - 2026-10-28 (Fase 12 Concluída)

### Implementado
- **MCP (Model Context Protocol) Consent-Gated Architecture**: Implementação do protocolo aberto MCP versão `2024-11-05`, estritamente configurado para operações de leitura consentida (`read-only`), sem nenhuma capacidade de escrita ou mutação de registros.
- **Manifesto MCP (`GET /api/mcp/manifest`)**: Servidor Express expõe capabilities estritas, recursos URI (`routine://today`, `routine://weekly-summary`, `routine://nutrition`, `routine://sleep`) e ferramentas (`query_routine_data`, `get_weekly_metrics`, `audit_data_gaps`).
- **Autenticação por Bearer Token e Escopos Granulares**: Sistema de tokens de acesso locais com restrição estrita de escopos (`read:routine:today`, `read:routine:summary`, `read:routine:all`) e data de expiração configurável.
- **Modal de Emissão de Tokens (`McpTokenModal`)**: Interface intuitiva e segura para emissão de chaves Bearer para clientes e agentes externos (Cursor, Claude Desktop, ferramentas locais).
- **Cartão de Configuração e Gestão MCP (`McpSettingsCard`)**: Integrado à tela de Configurações, exibindo lista de tokens ativos, botão de revogação imediata em 1 clique e remoção de credenciais.
- **Sandbox de Teste de Consulta MCP**: Ferramenta interativa dentro das Configurações que permite ao usuário testar consultas a URIs e Tools MCP em tempo real, inspecionando o payload JSON retornado e os milissegundos de execução.
- **Auditoria Local Imutável (`myroutine_mcp_audit_logs_v1`)**: Cada requisição atendida, negada ou rejeitada por escopo gera um registro auditável com carimbo temporal, nome do cliente, recurso e status, com visualizador em tempo real e opção de limpeza controlada.
- **Especificação Técnica Completa**: Criação de `docs/MCP_ESPECIFICACAO.md` detalhando o protocolo, regras de segurança, recursos e esquemas de dados.

### Testado
- Manifesto MCP e Capabilities (`MCP-01`): **APROVADO**.
- Geração segura de token com escopos granulares (`MCP-02`): **APROVADO**.
- Rejeição de consultas sem autorização Bearer (`MCP-03`): **APROVADO**.
- Imutabilidade e garantia Zero-Write por arquitetura (`MCP-04`): **APROVADO**.
- Revogação imediata de tokens no painel (`MCP-05`): **APROVADO**.
- Auditoria local imutável com latência registrada (`MCP-06`): **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.11] - 2026-10-27 (Fase 11 Concluída)

### Implementado
- **Fluxo Integrado de Voz para Rascunho com IA**: Transcrição captada pelo `VoiceInputModal` conecta-se diretamente ao modelo Gemini 3.8 Flash (ou fallback heurístico offline) para gerar rascunhos estruturados de rotina.
- **Abertura Automática do DraftReviewModal**: Imediatamente após a fala ou ditado, o modal de revisão é exibido com os dados extraídos, permitindo validação visual instantânea.
- **Confirmação e Salvamento em 1 Toque**: Ao tocar em "Confirmar e Salvar", o registro estruturado é gravado no IndexedDB com schemaVersion atualizado, preservando integridade e IDs únicos sem perda de dados.
- **Tratamento de Linguagem Ambígua**: Entradas incompletas como "comi um lanche" disparam alertas visuais em âmbar e habilitam correção de itens e valores antes da gravação.
- **Acesso Ubíquo à Voz**: Botão de microfone dedicado adicionado à barra de ação rápida do `TodayView`, na barra de filtros do `DiaryView` e na tela do `AssistantView`.
- **Suporte Expandido a Sono e Treino**: Extração de sono (duração e qualidade) e treino (modalidade e minutos) adicionada tanto ao prompt do servidor quanto ao parser de contingência local.

### Testado
- Conexão entre reconhecimento vocal e endpoint `/api/ai/parse-draft`: **APROVADO**.
- Abertura imediata do `DraftReviewModal` pós-ditado: **APROVADO**.
- Persistência em 1 toque no IndexedDB: **APROVADO**.
- Detecção de frases ambíguas com aviso visual e edição: **APROVADO**.
- Fallback heurístico 100% offline para sono, treino, água, café e energia: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.10] - 2026-10-27 (Fase 10 Concluída)

### Implementado
- Servidor full-stack seguro `server.ts` executando Express com proxy para o SDK `@google/genai` (modelo `gemini-3.8-flash`) com User-Agent `'aistudio-build'` obrigatório e montagem de middlewares Vite.
- Endpoint `/api/ai/parse-draft`: extração precisa de texto natural para rascunhos de rotina (refeição, hidratação, cafeína, sono, energia) com detecção rigorosa de ambiguidades e sem alucinação de dados.
- Endpoint `/api/ai/chat`: respostas a perguntas sobre o histórico e rotina do usuário com restrição ao contexto factual e sem prescrição médica.
- Serviço cliente `src/services/ai/geminiService.ts` com fallback de contingência local offline caso a internet esteja desligada.
- Modal de revisão de rascunhos `DraftReviewModal.tsx`: impede que qualquer dado gerado por IA seja gravado silenciosamente sem a aprovação e clique de confirmação do usuário.
- Interface completa do assistente em `AssistantView.tsx` com diálogo contextual, atalho de voz e perguntas rápidas sobre o diário.

### Testado
- Geração de rascunhos a partir de linguagem natural: **APROVADO**.
- Falha graciosa de rede com acionamento de contingência offline: **APROVADO**.
- Prevenção de salvamento automático sem confirmação humana explícita: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.9] - 2026-10-27 (Fase 9 Concluída)

### Implementado
- Serviço de captura vocal `src/services/voice/speechRecognitionService.ts` com máquina de estados para português brasileiro (`pt-BR`) e tratamento de erros de permissão, rede e silêncio.
- Modal de voz `VoiceInputModal.tsx` com estados visuais claros (IDLE, LISTENING, PROCESSING, SUCCESS, ERROR), transcrição editável pelo usuário antes de qualquer ação e exemplos de comandos recomendados.
- Relatório técnico detalhado em `docs/RELATORIO_VOZ_OFFLINE.md` documentando as restrições reais da `webkitSpeechRecognition` no iOS Safari (dependência de servidores da Apple e indisponibilidade em modo avião sem teclado nativo), além de demonstrar por que modelos locais pesados (Whisper WASM de 150MB) causariam encerramento forçado de abas pelo WebKit.
- Integração do botão de microfone na barra de ações do Diário (`DiaryView.tsx`).

### Testado
- Máquina de estados de reconhecimento vocal (IDLE, LISTENING, PROCESSING, SUCCESS, ERROR): **APROVADO**.
- Edição do texto ditado pelo usuário antes do uso: **APROVADO**.
- Validação de que a ausência ou bloqueio de microfone não impede o uso do app: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.8] - 2026-10-27 (Fase 8 Concluída)

### Implementado
- Motor puro de análise e correlações de rotina em `src/core/calculations/correlationAnalyzer.ts`:
  - Relação 1: Sono da noite vs. Nível de energia do dia seguinte (comparações entre noites $\ge 7\text{h}$ e $< 7\text{h}$).
  - Relação 2: Horário da última cafeína vs. Qualidade do sono (comparações entre última dose antes e depois das 14h).
  - Relação 3: Hidratação em dias de treino vs. dias de descanso.
  - Auditoria de lacunas de dados dos últimos 7 dias (contagem de noites sem sono, dias sem água, sem refeições e sem energia).
- Painel analítico enriquecido em `AnalyticsView.tsx` com cartões de correlações, contadores explícitos de amostras pareadas e avisos metodológicos transparentes (correlação temporal não implica causalidade).

### Testado
- Cálculo de relações cruzadas com amostras suficientes e insuficientes: **APROVADO**.
- Auditoria de lacunas sem mascarar dias vazios como zero: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.7] - 2026-10-27 (Fase 7 Concluída)

### Implementado
- Motor matemático de volume de treinos em `src/core/calculations/workoutCalculator.ts` (cálculo de tonelagem kg, repetições totais, contagem de séries e comparador responsável de sobrecarga progressiva entre exercícios equivalentes).
- Modal dedicado `WorkoutLogModal.tsx` com seleção de modalidade (musculação, cardio, hiit, mobilidade), construtor dinâmico de exercícios e séries com cargas em kg, seletor de esforço percebido (escala RPE de Borg 1-10) e notas de energia pré/pós treino.
- Integração da tela `WorkoutView.tsx` com destaque da última sessão, estatísticas de tonelagem, rastreamento de evolução de carga por exercício individual e histórico de treinos.

### Testado
- Cadastro de sessão de musculação com múltiplos exercícios, séries e cargas em kg: **APROVADO**.
- Cálculo de volume de carga (tonelagem total levantada): **APROVADO**.
- Comparação de progressão restrita a exercícios homônimos: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.6] - 2026-10-27 (Fase 6 Concluída)

### Implementado
- Motor matemático de cálculo de sono em `src/core/calculations/sleepCalculator.ts` com tratamento automático de períodos que cruzam a meia-noite (adicionando 1440 min quando necessário) e validações de coerência temporal.
- Modal dedicado de sono `SleepLogModal.tsx` com seleção de horário de deitar e despertar, cálculo de duração exibido ao vivo, escala tátil de qualidade (1 a 5 estrelas), contador de despertares noturnos e notas.
- Tela de Sono `SleepView.tsx` conectada à persistência local, exibindo detalhes da última noite registrada e histórico de noites anteriores.
- Enriquecimento dos registros de Cafeína com níveis explícitos de confiança (`high`, `medium`, `low`) e aviso de variabilidade de torra e extração.
- Escala de Energia enriquecida com rótulos semânticos contextuais (Esgotado, Baixa, Moderada, Produtivo, Vigoroso) e momentos de rotina.

### Testado
- `CAL-01`: Sono cruzando meia-noite (23h30 até 07h15 calcula duração exata de 7h 45m / 465 min): **APROVADO**.
- `CAL-04`: Estimativa de cafeína com grau de confiança documentado: **APROVADO**.
- Registro e salvamento de sono com reflexo instantâneo no Diário e no painel Hoje: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.5] - 2026-10-27 (Fase 5 Concluída)

### Implementado
- Base de dados nutricionais de referência em `src/catalog/nutritionDatabase.ts` com valores oficiais de macronutrientes (calorias, carboidratos, proteínas, gorduras e fibras) por 100g e fatores de conversão de medidas caseiras brasileiras (colher, concha, fatia, xícara, scoop).
- Motor de cálculo proporcional `nutritionCalculator.ts`, calculando gramaturas reais e somatórios de refeições com sinalização explícita de nutrientes desconhecidos (sem conversão falsa para zero).
- Modal `CustomFoodModal.tsx` para cadastro de alimentos personalizados com informações de rótulo próprio pelo usuário, gravados no IndexedDB store `custom_foods`.
- Construtor de refeições `MealBuilderModal.tsx` com estimativa nutricional ao vivo por item e somatório do prato em tempo real.
- Exibição de macronutrientes calculados nos cards de refeição da linha do tempo (`TimelineItem.tsx`).

### Testado
- `FOO-06`: Tratamento de nutrientes desconhecidos sem converter em zero: **APROVADO**.
- Cálculo proporcional de porções e conversão de medidas caseiras: **APROVADO**.
- Cadastro e persistência de alimentos customizados com rótulo próprio: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.4] - 2026-10-27 (Fase 4 Concluída)

### Implementado
- Biblioteca de ícones vetoriais SVG nativos por código em `src/components/food-icons/FoodSvgIcon.tsx` com `viewBox="0 0 64 64"`, cobrindo alimentos das 11 categorias sem dependência de rede ou imagens externas.
- Catálogo canônico estruturado em `src/catalog/foodCatalog.ts` com mais de 70 itens, apelidos para busca e porções de referência.
- Construtor visual de refeições `MealBuilderModal.tsx` com seleção de tipo de refeição, busca com sinônimos, adição de múltiplos alimentos ao prato, ajuste de porções, unidades (g, ml, unid, fatia, colher, concha, scoop) e persistência direta no IndexedDB.
- Integração da tela `NutritionView.tsx` com grade interativa de alimentos SVG, busca e lista de refeições salvas.

### Testado
- `FOO-01`: Renderização SVG 100% nativa e autônoma offline: **APROVADO**.
- `FOO-02`: Busca instantânea por nome e apelidos (ex: "frango", "bife", "pingado"): **APROVADO**.
- `FOO-03`: Montagem e salvamento de refeições com múltiplos itens no Diário: **APROVADO**.
- `FOO-04`: Ajuste de quantidades e alternância de unidades de medida: **APROVADO**.
- `FOO-05`: Independência do tamanho do SVG em relação a gramaturas: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.3] - 2026-10-27 (Fase 3 Concluída)

### Implementado
- Motor matemático de resumo semanal em `src/core/calculations/weeklySummary.ts` com janela móvel de 7 dias e ponderação honesta de amostras reais (dias sem registro não entram como zero).
- Componente `TimelineItem.tsx` com renderização personalizada por tipo de evento (`meal`, `sleep`, `caffeine`, `hydration`, `workout`, `energy`), horário formatado e selos de proveniência de dados (`confirmado`, `estimado`, `informado`).
- Modal `QuickEntryModal.tsx` para inclusão manual rápida de hidratação (ml), doses de cafeína, avaliações de energia (1 a 5 com contexto) e refeições.
- Linha do tempo completa e reativa em `DiaryView.tsx` com seletor de data (Hoje, Ontem, navegação por setas) e filtros por categoria com contadores numéricos.
- Painel `TodayView.tsx` conectado em tempo real à persistência local, calculando totais de água, doses de cafeína, sono e energia do dia.
- Painel `AnalyticsView.tsx` com cartões de médias de 7 dias exibindo a contagem exata de dias amostrados (ex: `3/7 dias`).

### Testado
- `CAL-03`: Cálculo de média semanal com contagem transparente de amostras: **APROVADO**.
- Ciclo completo de criação, visualização na linha do tempo e exclusão de eventos reais: **APROVADO**.
- Atualização reativa instantânea entre Diário, Hoje e Análises: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.2] - 2026-10-27 (Fase 2 Concluída)

### Implementado
- Repositório central de persistência local em `src/services/storage/storageRepository.ts` com motor primário em IndexedDB (`src/services/storage/indexedDb.ts`) e fallback automático para LocalStorage.
- Operações completas de CRUD (`saveEntry`, `getEntryById`, `getAllEntries`, `getEntriesByDate`, `deleteEntry`, `getPreferences`, `savePreferences`, `saveCustomFood`, `clearAllData`).
- Serviço de exportação e importação de backups em `src/services/backup/backupService.ts`, gerando arquivos JSON com `schemaVersion: 1`, data de exportação e sanitização contra chaves de API.
- Motor de importação validada com detecção e prevenção de registros com UUIDs duplicados.
- Hook React `useRoutineStorage` para sincronização reativa de registros, preferências e estado de armazenamento.
- Interface de Configurações conectada com persistência real:
  - Salvamento de horários habituais e meta hídrica.
  - Download em 1 clique de arquivo de backup JSON.
  - Seletor de arquivo e restauração com relatório de importação.
  - Botão de exclusão total de dados com confirmação em duas etapas.

### Testado
- `DAT-01`: Gravação no IndexedDB com fallback LocalStorage: **APROVADO**.
- `DAT-02`: Atualização com preservação de IDs: **APROVADO**.
- `DAT-03`: Exclusão de registros locais: **APROVADO**.
- `DAT-04`: Sobrevivência de dados após reload: **APROVADO**.
- `DAT-05`: Rejeição de registros sem ID ou tipo: **APROVADO**.
- `DAT-06`: Deduplicação por Set na importação: **APROVADO**.
- `BCK-01`: Exportação e download de arquivo JSON: **APROVADO**.
- `BCK-02`: Ausência de segredos no backup: **APROVADO**.
- `BCK-03`: Validação de esquema e integridade na importação: **APROVADO**.
- `BLD-01` e `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.1] - 2026-10-27 (Fase 1 Concluída)

### Implementado
- Estilos globais em `src/index.css` com variáveis de Safe Area (`--safe-top`, `--safe-bottom`), `touch-action: manipulation` e prevenção de zoom involuntário em inputs no Safari.
- Definição tipada de navegação em `src/types/navigation.ts` para as 8 telas principais.
- Modelos canônicos TypeScript em `src/types/models.ts` conforme especificação.
- `AppHeader.tsx` com data atual em pt-BR, indicador de armazenamento local e atalho de privacidade.
- `BottomNavBar.tsx` ergonômico para uso com uma mão no iPhone, contendo as abas principais e gaveta tátil para abas complementares.
- 8 telas principais com estados vazios legítimos e transparentes ("Sem registro"):
  - `TodayView.tsx`, `DiaryView.tsx`, `NutritionView.tsx`, `WorkoutView.tsx`, `SleepView.tsx`, `AnalyticsView.tsx`, `AssistantView.tsx`, `SettingsView.tsx`.
- Montagem unificada em `src/App.tsx` com `min-h-dvh` e contenção de layout.

### Testado
- `IPH-01`: Dynamic Viewport (`min-h-dvh`): **APROVADO**.
- `IPH-02`: Safe Area Insets (`viewport-fit=cover` e padding dinâmico): **APROVADO**.
- `IPH-03`: Toque imediato sem atraso de 300ms: **APROVADO**.
- `IPH-04`: Sem rolagem horizontal indesejada: **APROVADO**.
- `CAL-02`: Tratamento de dados ausentes como "Sem registro" na UI: **APROVADO**.
- `BLD-01` & `BLD-02`: Compilação e tipagem TypeScript sem erros: **APROVADO**.

---

## [1.0.0-alpha.0] - 2026-10-27 (Fase 0 Concluída)

### Implementado
- Especificação e inspeção inicial do ambiente de execução (React 19 + Tailwind CSS v4 + Vite).
- Atualização dos metadados oficiais do projeto em `metadata.json` (Nome: "MyRoutine AI").
- Atualização do ponto de entrada HTML (`index.html`) com meta tags para iPhone (`viewport-fit=cover`, `apple-mobile-web-app-capable`, `theme-color`).
- Criação da documentação técnica e operacional completa:
  - `README.md`: Visão geral, requisitos, como rodar e limitações conhecidas.
  - `docs/PLANO.md`: Detalhamento incremental das 14 fases de desenvolvimento com critérios de aceitação.
  - `docs/ARQUITETURA.md`: Arquitetura em camadas concêntricas e isolamento de módulos.
  - `docs/MODELO_DE_DADOS.md`: Contrato canônico de dados em TypeScript com versionamento de esquema (`schemaVersion: 1`).
  - `docs/PRIVACIDADE_E_SEGURANCA.md`: Diretrizes de operação local-first e proteção de dados pessoais.
  - `docs/TESTES.md`: Matriz de testes unitários e de integração com rastreabilidade de status.
  - `docs/DECISOES.md`: ADRs documentando decisões de persistência, SVGs locais, isolamento do Gemini e viewport iOS.
  - `CHANGELOG.md`: Histórico de versões.

### Testado
- Compilação inicial do projeto via Vite (`compile_applet`): **APROVADO**.
- Validação de meta tags de layout no iPhone: **APROVADO**.

### Pendente (Próximas Fases)
- **Fase 1:** Construção da estrutura de layout mobile-first, barra de navegação inferior (Bottom Tab Bar) e visualização de telas com estados vazios sem botões fictícios.
- **Fase 2:** Camada de persistência local em IndexedDB/LocalStorage com exportação/importação JSON.
- **Fase 3 a 13:** Implementação sequencial das funcionalidades de rotina, catálogo SVG, análises e assistente.

### Bloqueado
- Nenhuma funcionalidade bloqueada no momento.
