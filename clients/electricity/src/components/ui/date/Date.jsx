import React from "react";
import { declinationMonths } from "../../../utils/date";

const UserDate = ({ label, date }) => {
  if (!date) {
    return <div>{label}: Не установлена</div>;
  }
  const localDate = new Date(date);
  const month = declinationMonths[localDate.getMonth()];
  const day = localDate.getDate();
  const year = localDate.getFullYear();

  return (
    <div>
      {label}: {day} {month} {year}
    </div>
  );
};

export default UserDate;
