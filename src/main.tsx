import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './i18n';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load DevTools in development only
const ReactQueryDevtools = import.meta.env.DEV 
  ? lazy(() => 
      import('@tanstack/react-query-devtools').then(d => ({
        default: d.ReactQueryDevtools
      }))
    )
  : null;

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        <App />
        {ReactQueryDevtools && (
          <Suspense>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </Suspense>
  </StrictMode>
);