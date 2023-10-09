import { useMemo } from "react";

export const useFilterByStatus = (objects, status) => {
  return useMemo(() => {
    if (status) {
      return objects.filter((obj) => obj.is_closed === Boolean(+status));
    }
    return objects;
  }, [objects, status]);
};

export const useFilterByMeter = (objects, meterNumber, status) => {
  const filteredObjects = useFilterByStatus(objects, status);
  return useMemo(() => {
    if (meterNumber) {
      return filteredObjects.filter((obj) => {
        if (obj.meter?.number) {
          return obj.meter.number.includes(meterNumber);
        }
        return false;
      });
    }
    return filteredObjects;
  }, [filteredObjects, meterNumber]);
};

export const useFilterByCountingPoint = (
  objects,
  meterNumber,
  status,
  countingPoint
) => {
  const filteredObjects = useFilterByMeter(objects, meterNumber, status);

  return useMemo(() => {
    if (countingPoint) {
      return filteredObjects.filter((obj) => {
        if (obj.counting_point) {
          return obj.counting_point.toString().includes(countingPoint);
        }
        return false;
      });
    }
    return filteredObjects;
  }, [filteredObjects, countingPoint]);
};

export const useObjects = (objects, searchQuery) => {
  const { title, meterNumber, status, countingPoint } = searchQuery;
  const filteredObjects = useFilterByCountingPoint(
    objects,
    meterNumber,
    status,
    countingPoint
  );

  const sorterObjects = useMemo(() => {
    if (title) {
      return filteredObjects.filter((obj) =>
        obj.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    return filteredObjects;
  }, [filteredObjects, title]);

  const result = Object.values(
    sorterObjects.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {})
  );
  return result;
};

export const useAreasObjects = (areasObjects, meterNumber) => {
  return useMemo(() => {
    if (meterNumber) {
      return areasObjects.filter((item) => {
        if (item.meter?.number) {
          return item.meter.number.includes(meterNumber);
        }
        return false;
      });
    }
    return areasObjects;
  }, [areasObjects, meterNumber]);
};
