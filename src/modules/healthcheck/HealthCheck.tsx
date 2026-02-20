'use client';

import { useState, useEffect } from 'react';

interface HealthCheckData {
  serviceName: string;
  status: string;
  checkedAt: string;
}

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/health`);
        const data = await response.json();
        setHealth(Array.isArray(data) ? data[0] : data);
        setError(null);
      } catch {
        setError('Cannot reach backend');
        setHealth(null);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'OK';

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
            isHealthy
              ? 'bg-emerald-100 dark:bg-emerald-900/40'
              : 'bg-red-100 dark:bg-red-900/40'
          }`}>
            <div className={`h-8 w-8 rounded-full ${
              isHealthy
                ? 'bg-emerald-500'
                : 'bg-red-500'
            } ${isHealthy ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {error ? 'Offline' : health ? health.serviceName : 'Loading'}
        </h1>

        <p className={`mt-2 text-sm font-medium ${
          isHealthy
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {error || health?.status || 'Checking...'}
        </p>

        {health?.checkedAt && (
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Last updated {new Date(health.checkedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
