import { useMemo } from "react";

const useFilterByCode = (objects, code) => {
  return useMemo(() => {
    if (code) {
      return objects.filter((obj) => obj.code.toString().includes(code));
    }
    return objects;
  }, [objects, code]);
};

export const useObjects = (objects, searchQuery) => {
  const sortedObjects = useFilterByCode(objects, searchQuery.code);
  return useMemo(() => {
    if (searchQuery.title) {
      return sortedObjects.filter((obj) =>
        obj.title.toLowerCase().includes(searchQuery.title.toLowerCase())
      );
    }
    return sortedObjects;
  }, [sortedObjects, searchQuery]);
};
