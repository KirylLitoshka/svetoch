export const isObjectsEqual = (obj1, obj2) => {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    console.log("length");
    console.log(Object.keys(obj1));
    console.log(Object.keys(obj2));
    return false;
  }

  for (let key of Object.keys(obj1)) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};
