import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useThemeStore } from './lib/theme-store';

const effectiveTheme = useThemeStore.getState().getEffectiveTheme();
const root = document.documentElement;
if (effectiveTheme === 'light') {
  root.setAttribute('data-theme', 'light');
} else {
  root.setAttribute('data-theme', 'dark');
}

useThemeStore.subscribe((state) => {
  const effectiveTheme = state.getEffectiveTheme();
  if (effectiveTheme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
});

const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
mediaQuery.addEventListener('change', () => {
  const state = useThemeStore.getState();
  if (state.theme === 'system') {
    const effectiveTheme = state.getEffectiveTheme();
    if (effectiveTheme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
