import { useMemo } from "react";

const useFilterByStatus = (objects, searchQuery) => {
  return useMemo(() => {
    if (searchQuery.is_closed) {
      return objects.filter((obj) => obj.is_closed);
    } else {
      return objects.filter((obj) => !obj.is_closed);
    }
  }, [objects, searchQuery])
}

const useFilterByCode = (objects, searchQuery) => {
  const filteredObjects = useFilterByStatus(objects, searchQuery)
  return useMemo(() => {
    if (searchQuery.code) {
      return filteredObjects.filter((obj) =>
        obj.code.toString().includes(searchQuery.code)
      );
    }
    return filteredObjects;
  }, [filteredObjects, searchQuery]);
};

export const useObjects = (objects, searchQuery) => {
  const filteredObjects = useFilterByCode(objects, searchQuery);
  return useMemo(() => {
    if (searchQuery.title) {
      return filteredObjects.filter((obj) =>
        obj.title.toLowerCase().includes(searchQuery.title.toLowerCase())
      );
    }
    return filteredObjects;
  }, [filteredObjects, searchQuery]);
};
