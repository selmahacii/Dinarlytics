import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import { ThemeProvider } from '@core/context/ThemeContext';
import { AppProvider } from '@core/context/AppContext';
import { ProductsProvider } from '@core/context/ProductsContext';
import { queryClient } from './lib/queryClient';
import './index.css';
import './styles/erpnext.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ThemeProvider>
          <ProductsProvider>
            <App />
          </ProductsProvider>
        </ThemeProvider>
      </AppProvider>
      {/* React Query Devtools - only in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
