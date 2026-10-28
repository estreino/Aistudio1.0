# Arquitetura do Sistema — MyRoutine AI

## 1. Visão Arquitetural
O **MyRoutine AI** adota uma arquitetura em camadas concêntricas (**Clean / Hexagonal Architecture** adaptada para Frontend Web Local-First), garantindo que as regras de negócio e os cálculos persistam intactos, independentemente da interface, da camada de armazenamento ou de integrações externas.

```
+-----------------------------------------------------------+
|                    1. Interface & UI (React)              |
|        Telas (Hoje, Diário, Alimentação, Treino, etc.)     |
|   Tailwind CSS v4 + Motion + Safe Area iOS (100dvh)       |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|           2. Camada de Aplicação & Regras de Negócio      |
|    Controladores de Estado, Montador de Refeição, Logs    |
+-----------------------------------------------------------+
          |                         |                 |
          v                         v                 v
+------------------+    +-------------------+   +--------------------+
| 5. Motor de      |    | 3. Catálogo SVG   |   | 6. Persistência    |
|    Cálculos      |    |    de Alimentos   |   |    Local           |
| (Sono, Médias,   |    | (Vetores puros    |   | (IndexedDB com     |
|  Nutrientes,     |    |  sem rede externa)|   |  fallback para     |
|  Cafeína)        |    +-------------------+   |  LocalStorage)     |
+------------------+                            +--------------------+
                                                          |
                                                          v
                                                +--------------------+
                                                | 13. Exportação &   |
                                                |     Importação JSON|
                                                +--------------------+

CAMADAS COMPLEMENTARES (ISOLADAS & DESACOPLADAS):
[9. Assistente Gemini]  ---> Gera rascunhos; requer aprovação humana.
[10. Sistema de Voz]    ---> Transcreve fala em rascunhos; offline-first.
[12. Privacidade]       ---> Sanitização e bloqueio de vazamento de chaves.
```

---

## 2. As 14 Camadas Arquiteturais

1. **Interface e Navegação (`src/components/navigation/`, `src/views/`):**
   - Responsiva, mobile-first orientada a iPhone.
   - Navegação inferior (Bottom Tab Bar) fixa e ergonômica.
   - Sem rolagem horizontal.

2. **Regras de Negócio (`src/domain/`):**
   - Validações de limites (ex: horários válidos, quantidades não negativas, notas de energia de 1 a 5).
   - Não conversão de dados ausentes em valores padrão falsos (ex: `null` nunca se torna `0`).

3. **Catálogo de Alimentos (`src/catalog/`):**
   - Coleção tipada de alimentos nas 11 categorias descritas no prompt.
   - Metadados de porções padrão, gramaturas e sinônimos de busca.

4. **Componentes SVG (`src/components/food-icons/`):**
   - Renderizadores vetoriais em React puro com SVG inline.
   - Totalmente autônomos: nenhum ícone depende de CDN ou requisição externa.
   - ViewBox unificado `0 0 64 64`.

5. **Cálculos (`src/core/calculations/`):**
   - Funções puras (`pure functions`), sem efeitos colaterais e 100% testáveis.
   - Tratamento de sono cruzando meia-noite.
   - Médias ponderadas por dias com dados reais registrados.

6. **Persistência Local (`src/services/storage/`):**
   - Gerenciador de IndexedDB (`routine_db`) com stores: `entries`, `meals`, `workouts`, `settings`, `custom_foods`.
   - Camada de compatibilidade com fallback resiliente para LocalStorage caso o IndexedDB esteja restrito no navegador.

7. **Diário e Histórico (`src/domain/diary/`):**
   - Agregação cronológica decrescente.
   - Filtros por tipo de evento e período.

8. **Análises (`src/domain/analytics/`):**
   - Processamento de séries temporais de 7 dias e 30 dias.
   - Identificação de lacunas de dados.

9. **Assistente de IA (`src/services/ai/`):**
   - Módulo isolado baseado em `@google/genai`.
   - Nenhuma chamada direta de tela: o assistente apenas sugere rascunhos (`DraftEntry`) que precisam ser confirmados pelo usuário.

10. **Voz (`src/services/voice/`):**
    - Abstração de reconhecimento vocal com máquina de estados clara (`IDLE`, `LISTENING`, `PROCESSING`, `SUCCESS`, `ERROR`).

11. **MCP (Model Context Protocol) e Extensões Consentidas (`src/services/mcp/`):**
    - Ponto de integração consentida baseado na especificação MCP (Model Context Protocol).
    - Princípio estrito de **apenas leitura (read-only)**: proibição arquitetural absoluta de mutações, inserções ou exclusões via MCP.
    - Gestão granular de tokens de acesso com escopos bem definidos (`read:routine:today`, `read:routine:summary`, `read:routine:all`).
    - Auditoria local imutável (`myroutine_mcp_audit_logs_v1`) com registro de carimbo de tempo, agente solicitante, recurso e latência.
    - Endpoints `/api/mcp/manifest` e `/api/mcp/query` para handshake e orquestração padronizada.

12. **Privacidade e Segurança (`src/services/security/`):**
    - Sanitização de dados, anonimização pré-envio para IA e garantia de ausência de chaves de API em arquivos de backup.

13. **Exportação e Importação (`src/services/backup/`):**
    - Serializador e desserializador JSON versionado com checksum/validação de schema.

14. **Testes (`tests/`):**
    - Suíte de testes de funções de cálculo, armazenamento e integridade de dados.

---

## 3. Diretrizes de Desempenho e Memória no iOS
- Evitar acúmulo de listeners na janela (scroll e resize).
- Utilizar `useMemo` e seletores eficientes no estado para que a renderização do catálogo SVG seja instantânea.
- Não carregar áudios pesados na memória.
