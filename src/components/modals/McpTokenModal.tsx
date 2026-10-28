import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { McpScope } from '../../services/mcp/mcpTypes';
import { McpService } from '../../services/mcp/mcpService';

interface McpTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated: () => void;
}

export const McpTokenModal: React.FC<McpTokenModalProps> = ({
  isOpen,
  onClose,
  onTokenCreated,
}) => {
  const [clientName, setClientName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<McpScope[]>([
    'read:routine:today',
    'read:routine:summary',
  ]);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleScope = (scope: McpScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim()) {
      setErrorMsg('Informe o nome do agente ou cliente autorizado.');
      return;
    }

    if (selectedScopes.length === 0) {
      setErrorMsg('Selecione ao menos um escopo de leitura consentida.');
      return;
    }

    try {
      const result = McpService.createToken(
        clientName,
        selectedScopes,
        expiresInDays
      );
      setGeneratedKey(result.rawKey);
      onTokenCreated();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao emitir token MCP.');
    }
  };

  const handleCopy = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    setGeneratedKey(null);
    setClientName('');
    setSelectedScopes(['read:routine:today', 'read:routine:summary']);
    setExpiresInDays(30);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Emitir Token MCP (Leitura Consentida)
              </h2>
              <p className="text-[11px] text-slate-400">
                Model Context Protocol para Agentes e Ferramentas
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {generatedKey ? (
            /* Tela de Token Emitido */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Token de Acesso Gerado com Sucesso!</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Copie o token agora. Por razões estritas de segurança, este segredo não será exibido novamente.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Chave Bearer de Leitura
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <code className="flex-1 font-mono text-[11px] text-sky-300 break-all select-all">
                    {generatedKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shrink-0 active:scale-95 transition flex items-center gap-1"
                    title="Copiar para a área de transferência"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-medium">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-400 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Como usar no agente (Cursor, Claude Desktop, etc.):</span>
                </div>
                <p className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  Authorization: Bearer {generatedKey.substring(0, 16)}...
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Concluir e Fechar
              </button>
            </div>
          ) : (
            /* Formulário de Criação */
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">
                  Nome do Agente ou Cliente
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Claude Desktop, Cursor MCP, Analisador Local"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-slate-100 placeholder:text-slate-600 text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-medium">
                  Escopos de Leitura Consentida
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes('read:routine:today')}
                      onChange={() => toggleScope('read:routine:today')}
                      className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-0 bg-slate-900"
                    />
                    <div>
                      <div className="font-medium text-slate-200">
                        read:routine:today
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Acesso estrito aos eventos e refeições do dia corrente.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes('read:routine:summary')}
                      onChange={() => toggleScope('read:routine:summary')}
                      className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-0 bg-slate-900"
                    />
                    <div>
                      <div className="font-medium text-slate-200">
                        read:routine:summary
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Acesso a agregações e médias (últimos 7 a 30 dias de sono, hidratação, cafeína).
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes('read:routine:all')}
                      onChange={() => toggleScope('read:routine:all')}
                      className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-0 bg-slate-900"
                    />
                    <div>
                      <div className="font-medium text-slate-200">
                        read:routine:all
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Leitura ampla de todo o histórico armazenado no dispositivo.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">
                  Período de Validade
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                >
                  <option value={7}>7 dias (Ideal para testes)</option>
                  <option value={30}>30 dias (Padrão recomendado)</option>
                  <option value={90}>90 dias</option>
                  <option value={365}>1 ano</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Garantia de Leitura Estrita</span>
                </div>
                <p>
                  O servidor MCP do MyRoutine AI bloqueia por arquitetura qualquer tentativa de escrita, exclusão ou mutação de registros.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition active:scale-95"
                >
                  Gerar Token
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
