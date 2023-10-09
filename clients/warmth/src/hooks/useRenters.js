import { useMemo } from "react";

export const useFilterByRegistrationNumber = (renters, number) => {
  return useMemo(() => {
    if (number) {
      return renters.filter((renter) =>
        renter.registration_number.includes(number)
      );
    }
    return renters;
  }, [renters, number]);
};

export const useRenters = (renters, searchQuery) => {
  const filteredRenters = useFilterByRegistrationNumber(
    renters,
    searchQuery.registration_number
  );
  return useMemo(() => {
    if (searchQuery.title) {
      return filteredRenters.filter((renter) =>
        renter.name.toLowerCase().includes(searchQuery.title.toLowerCase())
      );
    }
    return filteredRenters
  }, [renters, searchQuery]);
};
