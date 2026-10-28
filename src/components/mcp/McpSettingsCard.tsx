import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Ban,
  Trash2,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { McpToken, McpAuditLog } from '../../services/mcp/mcpTypes';
import { McpService, MCP_MANIFEST } from '../../services/mcp/mcpService';
import { McpTokenModal } from '../modals/McpTokenModal';
import { RoutineEntry } from '../../types/models';

interface McpSettingsCardProps {
  entries: RoutineEntry[];
}

export const McpSettingsCard: React.FC<McpSettingsCardProps> = ({ entries }) => {
  const [tokens, setTokens] = useState<McpToken[]>([]);
  const [auditLogs, setAuditLogs] = useState<McpAuditLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sandbox de Teste
  const [selectedTokenKey, setSelectedTokenKey] = useState<string>('');
  const [selectedQueryType, setSelectedQueryType] = useState<'resource' | 'tool'>('resource');
  const [selectedTarget, setSelectedTarget] = useState<string>('routine://today');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const loadData = () => {
    const loadedTokens = McpService.getTokens();
    const loadedLogs = McpService.getAuditLogs();
    setTokens(loadedTokens);
    setAuditLogs(loadedLogs);

    if (loadedTokens.length > 0 && !selectedTokenKey) {
      const active = loadedTokens.find((t) => !t.revoked && t.tokenRaw);
      if (active && active.tokenRaw) {
        setSelectedTokenKey(active.tokenRaw);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = (id: string) => {
    McpService.revokeToken(id);
    loadData();
  };

  const handleDelete = (id: string) => {
    McpService.deleteToken(id);
    loadData();
  };

  const handleClearLogs = () => {
    McpService.clearAuditLogs();
    loadData();
  };

  const handleRunSandbox = () => {
    if (!selectedTokenKey) {
      setSandboxResponse(JSON.stringify({ error: 'Nenhum token selecionado para a requisição.' }, null, 2));
      return;
    }

    setSandboxLoading(true);
    setTimeout(() => {
      const requestPayload =
        selectedQueryType === 'resource'
          ? { resource: selectedTarget }
          : { tool: selectedTarget, params: {} };

      const response = McpService.executeQuery(selectedTokenKey, requestPayload, entries);
      setSandboxResponse(JSON.stringify(response, null, 2));
      setSandboxLoading(false);
      loadData();
    }, 150);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Extensões & Protocolo MCP
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Leitura Consentida
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Model Context Protocol para conexão de agentes externos (Claude Desktop, Cursor, etc.).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium active:scale-95 transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Emitir Token</span>
        </button>
      </div>

      {/* Lista de Tokens Ativos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Tokens de Acesso Emitidos ({tokens.length})</span>
          <span className="text-[10px] text-slate-500 lowercase">armazenamento 100% local</span>
        </div>

        {tokens.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-400 text-xs">
            Nenhum token MCP emitido ainda. Clique em &quot;Emitir Token&quot; para permitir que agentes leiam seus dados sob seu consentimento explícito.
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((tok) => {
              const isExpired = new Date(tok.expiresAt) < new Date();
              return (
                <div
                  key={tok.id}
                  className={`p-3 rounded-xl border text-xs transition ${
                    tok.revoked
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : isExpired
                      ? 'bg-amber-950/20 border-amber-900/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{tok.name}</span>
                        {tok.revoked ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-950 border border-red-800 text-red-400">
                            Revogado
                          </span>
                        ) : isExpired ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950 border border-amber-800 text-amber-400">
                            Expirado
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 border border-emerald-800 text-emerald-400">
                            Ativo
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Chave: {tok.tokenHash}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {tok.scopes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-sky-300 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-3">
                        <span>Criado: {new Date(tok.createdAt).toLocaleDateString()}</span>
                        <span>Expira: {new Date(tok.expiresAt).toLocaleDateString()}</span>
                        {tok.lastUsedAt && (
                          <span>Último uso: {new Date(tok.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!tok.revoked && (
                        <button
                          onClick={() => handleRevoke(tok.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
                          title="Revogar token imediatamente"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(tok.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
                        title="Remover registro do token"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sandbox de Consulta e Teste */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Sandbox de Teste de Consulta MCP</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2024-11-05</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Tipo de Consulta</label>
            <select
              value={selectedQueryType}
              onChange={(e) => {
                const val = e.target.value as 'resource' | 'tool';
                setSelectedQueryType(val);
                setSelectedTarget(val === 'resource' ? 'routine://today' : 'query_routine_data');
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="resource">Recurso (URI)</option>
              <option value="tool">Ferramenta (Tool)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] text-slate-400 block mb-1">Alvo</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono"
            >
              {selectedQueryType === 'resource' ? (
                MCP_MANIFEST.resources.map((r) => (
                  <option key={r.uri} value={r.uri}>
                    {r.uri} — {r.name}
                  </option>
                ))
              ) : (
                MCP_MANIFEST.tools.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}() — {t.description.substring(0, 45)}...
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-slate-500">
            {tokens.length === 0
              ? 'Emita um token acima antes de testar.'
              : `${tokens.filter((t) => !t.revoked).length} token(s) disponível(is)`}
          </span>
          <button
            onClick={handleRunSandbox}
            disabled={tokens.length === 0 || sandboxLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sky-400 text-xs font-medium active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sandboxLoading ? 'Executando...' : 'Executar Consulta'}</span>
          </button>
        </div>

        {sandboxResponse && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Resposta MCP (Payload):
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
              {sandboxResponse}
            </pre>
          </div>
        )}
      </div>

      {/* Logs de Auditoria de Acesso */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Auditoria de Acessos MCP ({auditLogs.length})
            </h4>
          </div>
          {auditLogs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-[11px] text-slate-500 hover:text-red-400 transition"
            >
              Limpar Auditoria
            </button>
          )}
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center text-slate-500 text-xs">
            Nenhuma consulta registrada nos logs de auditoria.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {auditLogs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {log.status === 'granted' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : log.status === 'denied' ? (
                    <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-slate-200">{log.clientName}</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span className="font-mono text-sky-300">{log.resourceOrTool}</span>
                    {log.reason && (
                      <span className="text-slate-400 text-[10px] ml-2 block truncate">
                        {log.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 shrink-0 flex items-center gap-2">
                  {log.executionTimeMs !== undefined && (
                    <span className="font-mono text-slate-400">{log.executionTimeMs}ms</span>
                  )}
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <McpTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTokenCreated={() => loadData()}
      />
    </div>
  );
};
