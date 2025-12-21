import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ProductsProvider } from './context/ProductsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider>
        <ProductsProvider>
          <App />
        </ProductsProvider>
      </ThemeProvider>
    </AppProvider>
  </StrictMode>
);
