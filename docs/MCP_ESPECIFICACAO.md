# Especificação Técnica: MCP (Model Context Protocol) no MyRoutine AI

## 1. Visão Geral e Princípios
O **MyRoutine AI** implementa uma extensão compatível com o padrão aberto **Model Context Protocol (MCP)**, focada exclusivamente em **operações de leitura consentida** (*read-only consent-gated queries*).

### Princípios Invioláveis
1. **Consentimento Explícito Prévio:** Nenhum agente ou ferramenta de terceiros pode ler qualquer registro sem que o usuário tenha emitido um token específico no painel de configurações.
2. **Estritamente Read-Only:** Nenhuma ferramenta ou recurso MCP tem capacidade de criar, atualizar, modificar ou deletar registros. Qualquer tentativa de mutação via MCP é rejeitada na raiz.
3. **Privacidade e Local-First:** Os dados permanecem hospedados localmente no dispositivo (IndexedDB / LocalStorage). O servidor Express funciona como validador de manifesto e roteador de consultas, mantendo a soberania do usuário.
4. **Auditoria Imutável Local:** Cada requisição atendida ou negada é registrada em um log de auditoria persistente (`myroutine_mcp_audit_logs_v1`), contendo carimbo temporal, nome do cliente, recurso solicitado, escopo exigido e tempo de resposta.
5. **Revogabilidade Imediata:** Um token emitido pode ser revogado a qualquer momento com 1 clique, invalidando imediatamente novas consultas.

---

## 2. Escopos de Acesso (Scopes)

| Escopo | Nível | Descrição |
|---|---|---|
| `read:routine:today` | Restrito | Permite acesso aos registros e eventos do dia corrente (refeições, hidratação, cafeína, treinos, sono). |
| `read:routine:summary` | Agregado | Permite acesso a médias consolidadas dos últimos 7 a 30 dias (ingestão hídrica, média de sono, cafeína, treinos). |
| `read:routine:all` | Total (Leitura) | Permite acesso amplo e irrestrito de leitura a todo o histórico histórico de registros passados. |

---

## 3. Manifesto do Servidor (`GET /api/mcp/manifest`)
Retorna as capacidades, recursos e ferramentas suportadas pelo servidor.

```json
{
  "protocolVersion": "2024-11-05",
  "serverInfo": {
    "name": "MyRoutine AI - MCP Consent Server",
    "version": "1.0.0-alpha.12",
    "description": "Servidor MCP local-first para integração consentida de leitura de rotina pessoal"
  },
  "capabilities": {
    "resources": true,
    "tools": true,
    "prompts": false,
    "readOnly": true,
    "mutationsAllowed": false
  }
}
```

---

## 4. Recursos Disponíveis (Resources)

### `routine://today`
- **Escopo requerido:** `read:routine:today`
- **Retorno:** Lista completa de eventos e refeições registrados para o dia atual.

### `routine://weekly-summary`
- **Escopo requerido:** `read:routine:summary`
- **Retorno:** Médias e totais consolidados dos últimos 7 dias:
  - `hydration.totalMl` e `dailyAverageMl`
  - `caffeine.totalEstimatedMg` e `dailyAverageMg`
  - `sleep.averageDurationHours` e contagem de noites registradas
  - `workout.totalSessions`

### `routine://nutrition`
- **Escopo requerido:** `read:routine:today`
- **Retorno:** Resumo de calorias e macronutrientes (proteínas, carboidratos, gorduras) ingeridos no dia atual com fonte de dados categorizada.

### `routine://sleep`
- **Escopo requerido:** `read:routine:summary`
- **Retorno:** Registros recentes de noites de sono, horários de dormir/acordar e avaliação subjetiva da qualidade.

---

## 5. Ferramentas Disponíveis (Tools)

### `query_routine_data`
- **Escopo requerido:** `read:routine:today`
- **Entrada:**
  ```json
  {
    "date": "2026-10-28",
    "type": "meal",
    "limit": 20
  }
  ```
- **Saída:** Lista de registros correspondentes aos critérios de filtro.

### `get_weekly_metrics`
- **Escopo requerido:** `read:routine:summary`
- **Entrada:**
  ```json
  {
    "days": 7
  }
  ```
- **Saída:** Agregações matemáticas calculadas para o período especificado.

### `audit_data_gaps`
- **Escopo requerido:** `read:routine:summary`
- **Entrada:**
  ```json
  {
    "days": 7
  }
  ```
- **Saída:** Mapeamento de lacunas de registro (ex: dias sem sono ou hidratação computada).

---

## 6. Autenticação e Cabeçalhos
Toda consulta a ferramentas ou recursos deve incluir o cabeçalho HTTP:
```http
Authorization: Bearer mcp_live_<hex_key>
```
Se o token for inválido, ausente, revogado ou tiver expirado, o servidor retorna erro apropriado (HTTP 401 Unauthorized ou HTTP 403 Forbidden).

---

## 7. Sandbox de Validação Integrado
O MyRoutine AI inclui um painel de testes dentro de **Configurações > Extensões & Protocolo MCP**, permitindo que o usuário teste a execução de qualquer URI ou Tool com os tokens ativos e inspecione o JSON bruto de resposta e o tempo de execução.
