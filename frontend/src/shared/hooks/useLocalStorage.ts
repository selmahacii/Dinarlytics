import { useEffect, useState } from 'react';

// Generic hook to persist a value in localStorage with a key
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors (quota/private mode)
    }
  }, [key, value]);

  return [value, setValue] as const;
}
