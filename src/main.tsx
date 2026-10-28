import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Registro seguro de Service Worker para PWA e suporte offline
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch(() => {});
    });
  } else {
    // Em ambiente de desenvolvimento/preview Vite, removemos qualquer SW residual ativo
    // para evitar conflitos de interceptação com HMR e módulos internos (@vite/client)
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}

