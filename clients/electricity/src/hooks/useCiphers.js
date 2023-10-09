import { useMemo } from "react";

export const useFilterByCode = (ciphers, searchQuery) => {
  return useMemo(() => {
    if (searchQuery.code) {
      return ciphers.filter((cipher) => cipher.code.includes(searchQuery.code));
    }
    return ciphers;
  }, [ciphers, searchQuery]);
};

export const useCiphers = (ciphers, searchQuery) => {
  const filteredCiphers = useFilterByCode(ciphers, searchQuery);
  return useMemo(() => {
    if (searchQuery.title) {
      return filteredCiphers.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.title.toLowerCase())
      );
    }
    return filteredCiphers;
  }, [filteredCiphers, searchQuery]);
};
