# Registro de Decisões de Arquitetura (ADRs) — MyRoutine AI

---

## ADR 001: Persistência Híbrida Local-First (IndexedDB com Fallback para LocalStorage)
* **Data:** 27 de Outubro de 2026
* **Status:** Aprovado
* **Contexto:** O aplicativo precisa armazenar centenas de registros estruturados de refeições, treinos, hidratação e sono diretamente no navegador do usuário no iPhone, sem depender de banco de dados em nuvem. No iOS Safari, o IndexedDB é o padrão de alto desempenho para objetos complexos, mas modos de navegação anônima ou certas restrições de webview podem ocasionalmente bloquear o IndexedDB.
* **Decisão:** Implementar um repositório abstrato que utilize IndexedDB como motor primário e degrade suavemente para LocalStorage caso o IndexedDB esteja inacessível. Adicionalmente, disponibilizar um fluxo de exportação/importação JSON de backup em 1 clique para mitigar a política de expiração de dados de 7 dias do WebKit.
* **Consequências:** Desacoplamento total da interface em relação à infraestrutura de persistência; garantia de integridade offline.

---

## ADR 002: Catálogo de Alimentos em SVG Vetorial Nativo por Código
* **Data:** 27 de Outubro de 2026
* **Status:** Aprovado
* **Contexto:** O usuário necessita visualizar e selecionar dezenas de alimentos nas 11 categorias definidas. Carregar imagens PNG/WebP de servidores externos ou CDNs tornaria o aplicativo dependente de rede e geraria tráfego desnecessário.
* **Decisão:** Implementar cada ícone de alimento como componente React funcional renderizando SVG vetorial nativo (`viewBox="0 0 64 64"`), com linhas e preenchimentos desenhados via código.
* **Consequências:** Zero dependência de rede para renderização de alimentos; carregamento instantâneo; fidelidade visual nítida em qualquer densidade de pixels de tela (Retina Display); tamanho estético do SVG completamente desacoplado dos valores de peso e calorias.

---

## ADR 003: Desacoplamento Estrito do Assistente de IA (Gemini)
* **Data:** 27 de Outubro de 2026
* **Status:** Aprovado
* **Contexto:** A IA deve auxiliar na transcrição e sugestão de rascunhos, mas nunca pode ser um ponto único de falha para a criação de rotinas, histórico ou visualização de dados.
* **Decisão:** Isolar o cliente Gemini em uma camada de serviço dedicada. As respostas do modelo são convertidas exclusivamente em objetos de rascunho (`DraftEntry`), que só são persistidos após revisão e clique de confirmação explícito do usuário.
* **Consequências:** O aplicativo opera com 100% de suas funções vitais mesmo sem chave de API ou sem conexão de internet.

---

## ADR 004: Tratamento de Viewport e Safe Area para iPhone no Safari/PWA
* **Data:** 27 de Outubro de 2026
* **Status:** Aprovado
* **Contexto:** O Safari no iOS possui barras de endereço e de controle flutuantes que mudam de tamanho durante o scroll, além do entalhe (Notch) e da Ilha Dinâmica (Dynamic Island).
* **Decisão:** Utilizar `viewport-fit=cover`, altura de contêiner baseada em `100dvh` (Dynamic Viewport Height) e padding dinâmico via `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.
* **Consequências:** Interface estável e nativa, sem cortes de botões inferiores e sem oscilações verticais repentinas.
