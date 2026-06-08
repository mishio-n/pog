export const formatRaceScheduleDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
};

export const addRaceScheduleDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const getTokyoRaceScheduleDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(+values.year, +values.month - 1, +values.day));
};

export const getCurrentRaceScheduleWeek = (date = new Date()) => {
  const today = getTokyoRaceScheduleDate(date);
  const day = today.getUTCDay();
  const mondayBasedDay = day === 0 ? 6 : day - 1;
  const friday = addRaceScheduleDays(today, 4 - mondayBasedDay);

  return {
    weekStart: formatRaceScheduleDate(friday),
    dates: [0, 1, 2, 3].map((offset) =>
      formatRaceScheduleDate(addRaceScheduleDays(friday, offset))
    ),
  };
};
