import React, { useState, useRef } from 'react';
import {
  Settings,
  Clock,
  HardDrive,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Smartphone,
} from 'lucide-react';
import { useRoutineStorage } from '../hooks/useRoutineStorage';

import { McpSettingsCard } from '../components/mcp/McpSettingsCard';
import { PWAInstallButton } from '../components/layout/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    exportBackupFile,
    importBackupFile,
    clearAllLocalData,
    storageType,
    entries,
  } = useRoutineStorage();

  const [workStart, setWorkStart] = useState(preferences.workHours?.start || '08:00');
  const [workEnd, setWorkEnd] = useState(preferences.workHours?.end || '17:00');
  const [targetWaterMl, setTargetWaterMl] = useState(preferences.targetWaterMl?.toString() || '2500');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [backupStatusMsg, setBackupStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences({
      workHours: { start: workStart, end: workEnd },
      targetWaterMl: parseInt(targetWaterMl, 10) || null,
    });
    setSaveSuccessMsg('Preferências de rotina salvas com sucesso!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExport = async () => {
    try {
      await exportBackupFile();
      setBackupStatusMsg({ type: 'success', text: 'Backup JSON gerado e baixado com sucesso.' });
      setTimeout(() => setBackupStatusMsg(null), 4000);
    } catch {
      setBackupStatusMsg({ type: 'error', text: 'Erro ao gerar arquivo de backup.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = await importBackupFile(content);
        if (result.success) {
          setBackupStatusMsg({ type: 'success', text: result.message });
        } else {
          setBackupStatusMsg({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
    // Limpar o input para permitir selecionar o mesmo arquivo novamente se desejar
    e.target.value = '';
  };

  const handleClearAll = async () => {
    await clearAllLocalData();
    setIsConfirmingClear(false);
    setBackupStatusMsg({ type: 'success', text: 'Todos os registros locais foram excluídos permanentemente.' });
    setTimeout(() => setBackupStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Mensagens de Feedback */}
      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {backupStatusMsg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            backupStatusMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {backupStatusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{backupStatusMsg.text}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-sky-400">
          <Settings className="w-5 h-5" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Ajustes e Perfil de Rotina
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure seus horários de referência. Eles servem de guia visual e nunca criarão eventos confirmados
          automaticamente no diário.
        </p>
      </div>

      {/* Formulário de Horários de Referência */}
      <form onSubmit={handleSavePreferences} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Horários Habituais (Referência)</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Persistente</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Início do Trabalho</label>
            <input
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Fim do Trabalho</label>
            <input
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-xs block mb-1">Meta Diária Opcional de Hidratação (ml)</label>
          <input
            type="number"
            step="100"
            value={targetWaterMl}
            onChange={(e) => setTargetWaterMl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold active:scale-[0.99] transition"
        >
          Salvar Horários e Metas
        </button>
      </form>

      {/* Persistência Local e Backup JSON (Fase 2 Totalmente Ativa) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Persistência & Backup Local</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono">
            {storageType === 'indexedDB' ? 'IndexedDB Ativo' : 'LocalStorage Ativo'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Atualmente você possui <strong className="text-slate-300">{entries.length} registros</strong> salvos localmente.
          Como o WebKit do Safari pode expirar dados após 7 dias de inatividade no navegador comum, gere backups periódicos.
        </p>

        {/* Input invisível para carregamento de arquivo JSON */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium active:scale-95 transition"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Importar Backup</span>
          </button>
        </div>
      </div>

      {/* Protocolo MCP e Extensões de Leitura Consentida */}
      <McpSettingsCard entries={entries} />

      {/* Zona de Exclusão com Confirmação Segura */}
      <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-400">
          <Trash2 className="w-4 h-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Zona de Exclusão</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Exclusão definitiva de todos os registros e preferências armazenados no seu navegador.
        </p>

        {isConfirmingClear ? (
          <div className="pt-2 space-y-2">
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>Tem certeza absoluta? Essa ação não pode ser desfeita.</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClearAll}
                className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold active:scale-95 transition"
              >
                Sim, Limpar Tudo
              </button>
              <button
                onClick={() => setIsConfirmingClear(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium active:scale-95 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsConfirmingClear(true)}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-red-950/40 border border-red-800/40 hover:bg-red-900/40 text-red-400 text-xs font-medium active:scale-95 transition text-center"
          >
            Limpar Todos os Registros do Dispositivo
          </button>
        )}
      </div>

      {/* Aplicativo PWA e Modo Avião */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Instalação & Modo Avião (PWA)</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            v1.0.0
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          O HealthOS funciona como aplicativo nativo no iPhone, iPad e Android. Seus dados e rotinas ficam 100% disponíveis
          mesmo sem internet ou em modo avião.
        </p>
        <div className="pt-1">
          <PWAInstallButton />
        </div>
      </div>

      {/* Garantia de Privacidade */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          O MyRoutine AI não possui telemetria, rastreadores ou anúncios. Tudo o que você registra permanece sob seu
          controle absoluto no dispositivo.
        </span>
      </div>
    </div>
  );
};
