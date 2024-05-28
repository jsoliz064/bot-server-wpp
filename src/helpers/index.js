const isNumeric = (str) => {
  const numericRegex = /^\d+$/;
  return numericRegex.test(str);
};

const isPositiveNumeric = (str) => {
  const positiveIntegerRegex = /^\d+$/;
  return positiveIntegerRegex.test(str);
};

const isPositiveDouble = (str) => {
  const positiveNumericRegex = /^\d+(\.\d+)?$/;
  return positiveNumericRegex.test(str);
};

const isValidDate = (date) => {
  // Expresión regular para validar el formato dd/mm/aaaa
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!dateRegex.test(date)) {
    return false;
  }

  // Separar día, mes y año
  const [day, month, year] = date.split("/").map(Number);

  // Validar la existencia de la fecha
  const isValidDayForMonth = (day, month, year) => {
    const daysInMonth = [
      31,
      isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    return day <= daysInMonth[month - 1];
  };

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  return isValidDayForMonth(day, month, year);
};

const convertDateFormat = (date) => {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};

const isValidUbication = (body) =>
  /^_event_location__[\w\d]{8}-(?:[\w\d]{4}-){3}[\w\d]{12}$/.test(body);

module.exports = {
  isNumeric,
  isPositiveNumeric,
  isPositiveDouble,
  isValidDate,
  isValidUbication,
  convertDateFormat,
};
