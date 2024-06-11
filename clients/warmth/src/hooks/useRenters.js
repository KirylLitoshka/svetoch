import { useMemo } from "react";

export const useFilterByStatus = (renters, searchQuery) => {
  return useMemo(() => {
    if (searchQuery.is_closed) {
      return renters.filter((renter) => renter.is_closed);
    } else {
      return renters.filter((renter) => !renter.is_closed);
    }
  }, [renters, searchQuery]);
};

export const useFilterByRegistrationNumber = (renters, searchQuery) => {
  const filteredRenters = useFilterByStatus(renters, searchQuery);
  return useMemo(() => {
    if (searchQuery.registration_number) {
      return filteredRenters.filter((renter) => 
        renter.registration_number && renter.registration_number.includes(searchQuery.registration_number)
      );
    }
    return filteredRenters;
  }, [filteredRenters, searchQuery]);
};

export const useRenters = (renters, searchQuery) => {
  const filteredRenters = useFilterByRegistrationNumber(renters, searchQuery);
  return useMemo(() => {
    if (searchQuery.title) {
      return filteredRenters.filter((renter) =>
        renter.name.toLowerCase().includes(searchQuery.title.toLowerCase())
      );
    }
    return filteredRenters;
  }, [filteredRenters, searchQuery]);
};
