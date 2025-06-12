'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from './sw-register';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  
  return <>{children}</>;
}
