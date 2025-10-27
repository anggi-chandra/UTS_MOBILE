import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type Scheme = 'light' | 'dark';

type ColorSchemeContextValue = {
  scheme: Scheme;
  setScheme: (scheme: Scheme) => void;
  toggleScheme: () => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

const STORAGE_KEY = 'color-scheme';

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [scheme, setSchemeState] = useState<Scheme>(systemScheme);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored === 'light' || stored === 'dark') {
        setSchemeState(stored);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setScheme = useCallback((next: Scheme) => {
    setSchemeState(next);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {}
  }, []);

  const toggleScheme = useCallback(() => {
    setScheme((prev: Scheme) => (prev === 'light' ? 'dark' : 'light'));
  }, [setScheme]);

  const value = useMemo<ColorSchemeContextValue>(() => ({ scheme, setScheme, toggleScheme }), [scheme, setScheme, toggleScheme]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorSchemeController() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    // Fallback to system scheme when no provider is present
    const fallback: ColorSchemeContextValue = {
      scheme: useRNColorScheme() ?? 'light',
      setScheme: () => {},
      toggleScheme: () => {},
    };
    return fallback;
  }
  return ctx;
}

// Keep compatibility with existing imports: useColorScheme returns current scheme
export function useColorScheme(): Scheme {
  return useColorSchemeController().scheme;
}