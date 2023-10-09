export const declinationMonths = [
  "Января",
  "Февраля",
  "Марта",
  "Апреля",
  "Мая",
  "Июня",
  "Июля",
  "Августа",
  "Сентября",
  "Октября",
  "Ноября",
  "Декабря",
];

export const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const getCurrentDate = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    padToTwoDigits(date.getMonth() + 1),
    padToTwoDigits(date.getDate()),
  ].join("-");
};

const padToTwoDigits = (num) => {
  return num.toString().padStart(2, "0");
};
