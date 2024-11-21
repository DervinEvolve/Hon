import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse text-white text-xl">Loading...</div>
    </div>
  }>
    <App />
  </Suspense>
);