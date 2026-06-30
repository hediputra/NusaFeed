import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for Progressive Web App (PWA)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('OneNationPress Sport ServiceWorker berhasil diregistrasi dengan scope:', registration.scope);
      })
      .catch((error) => {
        console.error('OneNationPress Sport ServiceWorker gagal diregistrasi:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Support sw registration in dev mode for testing PWA capabilities
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('OneNationPress Sport ServiceWorker (Dev) berhasil diregistrasi dengan scope:', registration.scope);
      })
      .catch((error) => {
        console.error('OneNationPress Sport ServiceWorker (Dev) gagal diregistrasi:', error);
      });
  });
}

