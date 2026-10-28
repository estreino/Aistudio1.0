# Plano de Implementação Incremental — MyRoutine AI

Este documento detalha o roteiro de execução do **MyRoutine AI (v1.0)** em conformidade estrita com a Seção 26 do Prompt Mestre. O desenvolvimento segue entregas pequenas, isoladas e verificáveis.

---

## Fases do Projeto

### FASE 0 — Inspeção e Especificação (Fase Atual)
* **Objetivo:** Inspecionar ambiente, dependências e compatibilidade iOS; criar documentação técnica canônica; definir modelo de dados e arquitetura.
* **Critério de Aceitação:** Documentos criados, tipagem TypeScript formalizada, baseline do projeto sem erros de build, riscos mapeados e aprovação do usuário.

---

### FASE 1 — Estrutura e Navegação
* **Objetivo:** Criar a estrutura base de layout mobile-first focado no iPhone (Safari/PWA), incluindo barra de navegação inferior (Bottom Navigation) ergonômica, suporte a Safe Area (Notch / Dynamic Island) e telas principais com estados vazios ("Sem registros", nunca zeros automáticos).
* **Telas:** Hoje, Diário, Alimentação, Treino, Sono, Análises, Assistente, Configurações.
* **Critério de Aceitação:** Navegação fluida entre telas, sem rolagem horizontal indesejada, responsiva a viewport dinâmico (`100dvh`), sem botões fictícios ou ações simuladas.

---

### FASE 2 — Persistência Local
* **Objetivo:** Implementar o repositório centralizado de persistência em IndexedDB com camada de fallback para LocalStorage e versionamento de esquema (`schemaVersion: 1`).
* **Operações:** CRUD completo (criar, ler, atualizar, excluir) para registros genéricos e específicos, além de exportação e importação JSON com validação de payload e prevenção de duplicatas.
* **Critério de Aceitação:** Registros persistem após recarregar a página e reabrir o navegador; exportação gera arquivo JSON íntegro e importação restaura os dados com precisão.

---

### FASE 3 — Diário e Resumo Semanal
* **Objetivo:** Desenvolver a linha do tempo cronológica de registros (refeições, sono, água, café, treino, energia), com filtros por categoria e data.
* **Cálculos:** Apresentar resumo dos últimos 7 dias com indicação clara do número de amostras reais utilizadas e tratamento de dias sem registro.
* **Critério de Aceitação:** Registros ordenados cronologicamente, filtros funcionais, edição/exclusão direta a partir da linha do tempo e médias sem distorções por zeros indevidos.

---

### FASE 4 — Catálogo SVG e Montagem de Refeições
* **Objetivo:** Implementar catálogo de alimentos distribuído nas 11 categorias descritas no Prompt Mestre, com ícones vetoriais SVG gerados 100% por código local (sem requisições HTTP externas).
* **Funcionalidades:** Busca em tempo real, filtro de categorias, favoritos, recentes, montagem visual de refeição com escolha de quantidades e unidades (g, ml, colher, fatia, concha, unidade).
* **Critério de Aceitação:** Uma refeição com múltiplos itens pode ser montada, salva no IndexedDB, visualizada no diário e reaberta para edição, funcionando inteiramente offline.

---

### FASE 5 — Dados Nutricionais
* **Objetivo:** Integrar tabela nutricional de referência confiável para alimentos comuns brasileiros (macronutrientes: calorias, carboidratos, proteínas, gorduras e fibras).
* **Transparência:** Indicar a fonte de cada valor (confirmado, informado pelo usuário, estimado ou desconhecido). Não considerar valor desconhecido como zero.
* **Critério de Aceitação:** Cálculos de somatório nutricional com rótulos de incerteza claros, além de suporte a cadastro de alimentos e valores personalizados.

---

### FASE 6 — Sono, Cafeína, Hidratação e Energia
* **Objetivo:** Construir formulários especializados com validação técnica rigorosa para:
  - **Sono:** Horário de deitar e despertar, com cálculo automático de duração correto mesmo ao cruzar a meia-noite (ex: 23:15 até 06:45), qualidade percebida (1 a 5) e observações.
  - **Cafeína:** Quantidade, tipo de bebida, miligramas estimados e nível de confiança.
  - **Hidratação:** Ingestão de água e líquidos em ml, total diário e meta opcional.
  - **Energia:** Escala de 1 a 5 associada ao contexto específico da rotina (ao acordar, trabalho, pré-treino, pós-treino, dormir).
* **Critério de Aceitação:** Todos os 4 domínios salvam registros validados no repositório local e refletem instantaneamente no painel de Hoje e no Diário.

---

### FASE 7 — Treino
* **Objetivo:** Registro e gestão de sessões de musculação e condicionamento físico: modalidade, exercícios, séries, repetições, carga (kg), intervalo de descanso (segundos) e esforço percebido (RPE).
* **Comparação:** Histórico de sessões passadas para comparação de cargas apenas entre exercícios equivalentes.
* **Critério de Aceitação:** Cadastro de sessão com múltiplos exercícios e séries, cálculo de tonelagem/volume da sessão e integridade do histórico.

---

### FASE 8 — Análises e Relações de Rotina
* **Objetivo:** Painel analítico de cruzamento de dados:
  - Sono vs. Nível de energia ao longo do dia.
  - Horário da última dose de cafeína vs. Latência para adormecer.
  - Hidratação vs. Desempenho no treino.
* **Critério de Aceitação:** Cálculos matemáticos independentes da UI, exibição transparente da quantidade de registros utilizados e mensagens explicativas quando os dados forem insuficientes para conclusões.

---

### FASE 9 — Prova de Conceito de Voz Offline
* **Objetivo:** Investigar a viabilidade técnica de reconhecimento vocal em português brasileiro em ambiente Safari/WebKit e PWA no iPhone.
* **Critério de Aceitação:** Relatório real com testes de compatibilidade de Web Speech API / modelos locais, documentando latência, suporte offline real e limitações sem promessas falsas.

---

### FASE 10 — Assistente IA (Gemini) Desacoplado
* **Objetivo:** Implementar módulo isolado de integração com o Gemini para interpretação de texto natural (ex: *"hoje tomei um café com leite e comi dois ovos mexidos"*), gerando rascunhos estruturados para aprovação do usuário.
* **Segurança:** Tratamento de erros de rede, chave de API ausente ou inválida, salvamento apenas após confirmação explícita do usuário.
* **Critério de Aceitação:** O aplicativo continua funcionando 100% caso o Gemini esteja desativado ou sem conexão à internet.

---

### FASE 11 — Entrada por Voz Integrada
* **Objetivo:** Conectar a transcrição vocal aprovada ao gerador de rascunhos estruturados, permitindo revisão antes da confirmação do registro.
* **Critério de Aceitação:** Nenhuma gravação em segundo plano e nenhum dado salvo silenciosamente sem revisão humana.

---

### FASE 12 — MCP e Extensões (CONCLUÍDA)
* **Objetivo:** Avaliar e planejar integrações com ferramentas e agentes via Model Context Protocol, com foco inicial estritamente em operações de leitura consentida.
* **Critério de Aceitação:** Autenticação segura via Bearer token, autorização explícita com escopos granulares, imutabilidade com garantia Zero-Write por arquitetura, sandbox de teste interativo e logs locais de auditoria imutáveis.
* **Status:** Concluída com sucesso (`1.0.0-alpha.12`), endpoints `/api/mcp/manifest` e `/api/mcp/query` operacionais, componentes `McpSettingsCard` e `McpTokenModal` implementados e documentação em `docs/MCP_ESPECIFICACAO.md`.

---

### FASE 13 — Auditoria Final, Validação PWA e Fechamento (CONCLUÍDA)
* **Objetivo:** Execução da matriz completa de testes (Seção 27 do Prompt Mestre): modo avião, responsividade no iPhone, exportação/importação de backup, integridade de cálculos e revisão de acessibilidade.
* **Critério de Aceitação:** Relatório conclusivo de testes com status real (APROVADO, FALHOU, NÃO EXECUTADO, BLOQUEADO), suporte offline via Service Worker (`sw.js`), Manifesto PWA instalado e versão 1.0.0 formalizada.
* **Status:** Concluída com sucesso (`v1.0.0`). 100% dos testes aprovados (32/32), bypass estrito de `/api/*` no Service Worker, conformidade total de layout mobile e relatório canônico emitido em `docs/AUDITORIA_FINAL.md`.

---

## STATUS GERAL DO PROJETO: CONCLUÍDO (v1.0.0)
Todas as 13 fases do plano mestre de desenvolvimento foram executadas rigorosamente conforme os protocolos técnicos aprovados. O aplicativo encontra-se auditado, estável, performático e em produção.
