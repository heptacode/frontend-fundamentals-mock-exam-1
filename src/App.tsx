import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { useState } from 'react';
import { GlobalPortal, GlobalStyles } from 'tosslib';
import { Routes } from './pages/Routes';

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <GlobalPortal.Provider>
        <NuqsAdapter>
          <Routes />
        </NuqsAdapter>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}
