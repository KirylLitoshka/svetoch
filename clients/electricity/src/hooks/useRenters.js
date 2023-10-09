import { useMemo } from "react";

const useFilterByStatus = (renters, searchQuery) => {
  return useMemo(() => {
    if (searchQuery.status) {
      return renters.filter(
        (renter) => renter.is_closed === Boolean(+searchQuery.status)
      );
    }
    return renters;
  }, [renters, searchQuery]);
};

const useFilterByRegistrationNumber = (renters, searchQuery) => {
  const filteredRenters = useFilterByStatus(renters, searchQuery);
  return useMemo(() => {
    if (searchQuery.registration_number) {
      return filteredRenters.filter((renter) => {
        if (renter.registration_number) {
          return renter.registration_number.includes(
            searchQuery.registration_number
          );
        }
        return false;
      });
    }
    return filteredRenters;
  }, [filteredRenters, searchQuery]);
};

export const useRenters = (renters, searchQuery) => {
  const filteredRenters = useFilterByRegistrationNumber(renters, searchQuery);
  return useMemo(() => {
    if (searchQuery.name) {
      return filteredRenters.filter((renter) =>
        renter.full_name.toLowerCase().includes(searchQuery.name.toLowerCase())
      );
    }
    return filteredRenters;
  }, [filteredRenters, searchQuery]);
};
