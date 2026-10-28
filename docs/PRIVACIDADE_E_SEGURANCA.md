# Privacidade e Segurança de Dados — MyRoutine AI

## 1. Filosofia de Privacidade
Os dados de rotina diária (refeições, sono, humor/energia, horários de trabalho e treinos) constituem **dados pessoais sensíveis**. O MyRoutine AI foi projetado sob o princípio de **Privacidade por Design (Privacy by Design)** e **Local-First**.

---

## 2. Princípios de Proteção de Dados

### 2.1 Armazenamento 100% Local por Padrão
* Todos os dados registrados residem exclusivamente no armazenamento do navegador do usuário (`IndexedDB` com fallback para `LocalStorage`).
* Nenhuma informação é enviada a servidores de analytics, telemetria, rastreamento ou banco de dados externo por padrão.
* O aplicativo funciona plenamente offline (modo avião).

### 2.2 Isolamento e Minimização de Dados para IA (Gemini)
* O assistente de IA é estritamente opcional.
* Se o usuário optar por utilizar o Gemini para rascunhos de refeições ou interpretação de texto:
  - Apenas o texto estritamente digitado ou a consulta solicitada é transmitida.
  - O histórico completo de rotina **nunca** é enviado em massa sem consentimento.
  - Chaves de API não são armazenadas em texto simples em arquivos de exportação e nunca são expostas em logs de depuração.

### 2.3 Políticas de Backup e Exportação
* A exportação gera um arquivo JSON plano que pertence 100% ao usuário.
* O arquivo de backup exclui explicitamente quaisquer chaves de API ou segredos de ambiente.
* A importação de backup efetua validação rigorosa de integridade de esquema antes de gravar no banco de dados, notificando sobre itens duplicados para evitar corrupção de dados.

### 2.4 Exclusão Definitiva
* O aplicativo disponibiliza um comando explícito de "Limpar Todos os Dados Locais".
* Antes da exclusão, é solicitada uma confirmação com aviso de irrevogabilidade.
* Uma vez confirmada, todos os stores de IndexedDB e chaves de LocalStorage são expurgados imediatamente da memória do dispositivo.

---

## 3. Segurança em Relação à Saúde
* O MyRoutine AI **não é um dispositivo médico** nem um software de diagnóstico clínico.
* O sistema não prescreve dietas, não indica suplementação medicamentosa nem sugere doses de cafeína para mitigar privação de sono.
* Qualquer estimativa nutricional apresentada tem propósito puramente informativo e reflexivo.
