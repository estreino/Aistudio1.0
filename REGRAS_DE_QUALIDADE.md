# REGRAS PERMANENTES DE QUALIDADE E CONSTITUIÇÃO TÉCNICA
**Projeto:** MyRoutine AI  
**Versão:** 1.0.0-normative  
**Status:** Em Vigor  
**Público-alvo:** Engenheiros, Auditores e Mantenedores do Código  

---

## 1. Princípios Fundamentais (Invioláveis)

### 1.1 Local-First e Privacidade Absoluta
- **Nenhum dado pessoal** (refeições, horários de sono, peso, cafeína, treinos, histórico de saúde) deve depender obrigatoriamente de servidores externos ou banco de dados em nuvem para leitura, gravação ou análise.
- O armazenamento primário reside no **IndexedDB** do navegador com fallback automático para **LocalStorage**.
- A comunicação com APIs externas (ex: Gemini para extração de linguagem natural) deve ser estritamente voluntária e complementar. Caso o backend ou a chave de API esteja indisponível, a aplicação **deve continuar 100% funcional** via heurísticas locais e entrada manual.

### 1.2 Integridade e Não-Destruição de Código
- Nenhuma funcionalidade existente deve ser removida, simplificada ou substituída por código ilustrativo/mock sem autorização prévia e justificativa técnica formal.
- O código-fonte deve ser escrito de forma integral, sem comentários de omissão como `// restante do código`, `/* TODO: implementar depois */` ou stubs parciais.
- Preservação rigorosa de tipos TypeScript em modo estrito (`strict: true`). Proibido o uso indiscriminado de `any` para mascarar erros estruturais.

### 1.3 Anti-AI Slop e Disciplina Visual
- Interface desenhada com hierarquia tipográfica consistente, paleta Slate/Dark sóbria e controles táteis ergonômicos adaptados para mobile viewport e desktop.
- Proibido o uso de elementos genéricos artificiais ("pills" flutuantes sem propósito funcional, contadores falsos, gráficos estáticos sem dados reais).
- Ausência de dados simulados quando não há registro real: se o usuário não logou sono, o cálculo de débito exibe estado vazio neutro, nunca inventa 8 horas arbitrárias.

---

## 2. Taxonomia de Severidade e Priorização (P0 - P4)

Todas as anomalias, tarefas e revisões de código devem ser classificadas conforme a tabela abaixo:

| Severidade | Denominação | Critério Técnico | Tempo de Resolução Exigido |
|---|---|---|---|
| **P0** | Crítico / Bloqueador | Falha catastrófica: app não compila, tela branca fatal, corrupção de banco IndexedDB, perda irreversível de dados locais, violação grave de segurança. | Imediato (interrompe qualquer outra tarefa) |
| **P1** | Alto / Essencial | Regressão em fluxo principal de usuário: botão de registro quebra, cálculo nutricional ou de sono incorreto, falha na exportação/backup. | Alta prioridade (próximo ciclo de correção) |
| **P2** | Médio / Funcional | Falha em fluxo secundário ou cosmético moderado: layout desalinhado em telas estreitas, falha em sugestão da IA com fallback operacional preservado. | Planejado na iteração corrente |
| **P3** | Baixo / Polimento | Inconsistência leve de interface: padding assimétrico, micro-transição ausente, texto informativo vago sem prejuízo de uso. | Backlog de melhorias |
| **P4** | Evolução / Otimização | Melhoria arquitetural proativa: divisão de chunks de build (code-splitting), novos filtros de consulta, expansão do catálogo de alimentos. | Evolutivo sob demanda |

---

## 3. Padrões de Arquitetura e Engenharia de Software

### 3.1 Camada de Armazenamento e Estado
1. **Padrão Repository (`storageRepository.ts`):** Todas as operações de leitura e escrita devem passar pelo repositório unificado. Componentes de UI não devem chamar métodos nativos de `indexedDB` diretamente.
2. **Imutabilidade e Chaves Primárias:** Cada entidade deve possuir `id` único (UUID v4 ou timestamp determinístico) e campo `date` em formato ISO (`YYYY-MM-DD`).
3. **Migração e Versionamento:** A estrutura de stores do IndexedDB (`dailyLogs`, `customFoods`, `userPreferences`, `mcpAudit`) é versionada. Alterações em índices devem ser acompanhadas de script de migração no evento `onupgradeneeded`.

### 3.2 Camada de Cálculos e Lógica de Domínio
1. **Funções Puras:** Todos os módulos de cálculo (`nutritionCalculator.ts`, `sleepCalculator.ts`, `workoutCalculator.ts`, `weeklySummary.ts`, `correlationAnalyzer.ts`) devem ser puramente determinísticos e livres de efeitos colaterais.
2. **Tratamento de Valores Nulos:** Valores ausentes devem ser representados como `null` ou `undefined` explícitos. Não assumir zero (`0`) quando o dado nunca foi informado (ex: ausência de registro de sono não equivale a 0 horas dormidas).
3. **Divisão por Zero:** Todas as métricas de proporção (porcentagens de macronutrientes, médias diárias) devem possuir guardas explícitas contra divisão por zero.

### 3.3 Integração MCP (Model Context Protocol)
1. **Consentimento Explícito do Usuário:** Nenhuma ferramenta MCP de leitura ou agregação pode ser executada sem token válido e escopo expressamente habilitado na interface de configurações.
2. **Modo Somente Leitura (`readOnly: true`):** O servidor MCP do MyRoutine opera sob o princípio de privilégio mínimo. Nenhuma rota ou ferramenta externa tem permissão de mutação ou exclusão de dados.
3. **Auditoria Local:** Toda consulta externa autorizada gera um registro no store `mcpAudit`, visível para o usuário no painel de configurações.

---

## 4. Protocolo de Validação e Testes Pré-Deploy

Antes de qualquer entrega ou fechamento de versão, o engenheiro responsável deve obrigatoriamente executar e validar:

1. **Validação de Sintaxe e Tipos:**
   ```bash
   npm run lint # Executa tsc --noEmit com zero erros e warnings impeditivos
   ```
2. **Validação de Compilação de Produção:**
   ```bash
   npm run build # Executa vite build com emissão limpa do bundle
   ```
3. **Validação do Checkpoint Standalone:**
   ```bash
   node scripts/build_checkpoint.js # Gera o arquivo unificado e emite o hash SHA-256
   ```
4. **Verificação de Regressão em Fluxos Críticos:**
   - Adicionar copo de água (+250ml) e checar atualização do total.
   - Adicionar café (+80mg) e verificar alerta de curfew após 14h.
   - Criar refeição no Meal Builder com alimento do catálogo e checar cálculo calórico.
   - Logar sono (horário dormir, acordar) e checar cálculo de débito em relação à meta de 8h.
   - Exportar backup JSON e importar novamente em ambiente de teste para checagem de paridade.
