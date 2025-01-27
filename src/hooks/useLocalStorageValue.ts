import { useEffect, useState } from "react";

export const useLocalStorageValue = <T>(key: string, initialState?: T) => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
    return initialState;
  });

  const deleteState = () => {
    localStorage.removeItem(key);
  };

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return [state, setState, deleteState] as const;
};
