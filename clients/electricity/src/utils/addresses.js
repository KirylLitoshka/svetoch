export const addressToString = (address) => {
  return `${address.city_type} ${address.city_name}, ${address.street_type} ${address.street_name}`;
};

export const compareAddress = (address, str) => {
  return addressToString(address) === str;
};

export const defaultAddressValue = (addresses, id) => {
  if (!id) {
    return null;
  }
  const filteredAddress = addresses.filter((item) => item.id === id);
  return addressToString(filteredAddress[0]);
};
