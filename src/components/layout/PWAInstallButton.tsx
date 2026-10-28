import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Se já estiver rodando instalado, exibe selo sutil
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
        <Check className="w-3.5 h-3.5" />
        <span>Instalado como App</span>
      </div>
    );
  }

  // Navegador Desktop / Android com evento beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 ${
          compact ? 'px-2.5 py-1.5' : 'w-full py-2.5 px-4'
        }`}
      >
        <Download className="w-4 h-4" />
        <span>Instalar HealthOS</span>
      </button>
    );
  }

  // iOS Safari (guia passo a passo)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className={`flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium text-xs transition active:scale-95 ${
            compact ? 'px-2.5 py-1.5' : 'w-full py-2.5 px-4'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">1</span>
                  <p>Abra esta página no <strong>Safari</strong> e toque no botão <strong>Compartilhar</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-400" />) na barra inferior.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">2</span>
                  <p>Role para baixo na folha de opções e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">3</span>
                  <p>Toque em <strong>Adicionar</strong> no canto superior direito para desfrutar da experiência em tela cheia 100% offline.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback para outros navegadores desktop que não dispararam prompt
  return (
    <button
      onClick={() => {
        alert('Para instalar o HealthOS, clique no ícone de instalação na barra de endereços do seu navegador.');
      }}
      className={`flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs transition ${
        compact ? 'px-2.5 py-1.5' : 'w-full py-2.5 px-4'
      }`}
    >
      <Download className="w-4 h-4 text-emerald-400" />
      <span>Instalar App</span>
    </button>
  );
};
