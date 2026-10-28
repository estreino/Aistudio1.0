import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('Diretório dist/ não encontrado. Execute npm run build antes.');
  process.exit(1);
}

const distHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const assetFiles = fs.readdirSync(assetsDir);

const cssFile = assetFiles.find(f => f.endsWith('.css'));
const jsFile = assetFiles.find(f => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('Arquivos CSS ou JS não encontrados em dist/assets');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');

// Montagem do arquivo HTML unificado e autocontido
let unifiedHtml = distHtml;

// Substitui a tag <link rel="stylesheet" ...> pelo conteúdo CSS inline
unifiedHtml = unifiedHtml.replace(
  /<link[^>]*rel="stylesheet"[^>]*>/i,
  `<style id="myroutine-styles">\n${cssContent}\n</style>`
);

// Substitui a tag <script type="module" ... src="..."> pelo conteúdo JS inline
unifiedHtml = unifiedHtml.replace(
  /<script[^>]*type="module"[^>]*src="[^"]*"[^>]*><\/script>/i,
  `<script type="module">\n${jsContent.replace(/<\/script/gi, '<\\/script')}\n</script>`
);

// Adiciona cabeçalho de documentação técnica do checkpoint no topo
const checkpointHeader = `<!--
================================================================================
CHECKPOINT_BASE_COMPLETA.html
PROJETO: MyRoutine AI - Sistema Pessoal de Acompanhamento de Rotina, Sono e Nutrição
ARQUITETURA: Local-First (IndexedDB + LocalStorage fallback) + MCP Server Integration
STATUS: Base Integral, Autocontida, Executável em Qualquer Navegador Moderno
DATA DE GERAÇÃO: ${new Date().toISOString()}
================================================================================
-->\n`;

unifiedHtml = checkpointHeader + unifiedHtml;

const outputPath = path.resolve('CHECKPOINT_BASE_COMPLETA.html');
fs.writeFileSync(outputPath, unifiedHtml, 'utf-8');

// Métricas de validação
const stat = fs.statSync(outputPath);
const sizeBytes = stat.size;
const lineCount = unifiedHtml.split('\n').length;
const hash = crypto.createHash('sha256').update(unifiedHtml).digest('hex');

console.log(`Checkpoint gerado com sucesso em: ${outputPath}`);
console.log(`Tamanho: ${sizeBytes} bytes (${(sizeBytes / 1024).toFixed(2)} KB)`);
console.log(`Linhas: ${lineCount}`);
console.log(`SHA-256: ${hash}`);
