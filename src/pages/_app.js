import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { initSentry } from '../lib/sentry';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/react-query/query-client';

export default function App({ Component, pageProps }) {
  // Use useState to ensure QueryClient is only created once per app instance
  // This prevents creating a new client on every render
  const [client] = useState(() => queryClient);

  useEffect(() => {
    // Initialize Sentry on client-side only (once per app load)
    // Note: initSentry is async but we don't need to await it
    initSentry().catch(() => {
      // Silently handle errors - Sentry is optional
    });
  }, []);

  return (
    <QueryClientProvider client={client}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
