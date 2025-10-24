// src/helpers/timeHelper.ts

export const getCurrentWIBDate = (): Date => {
  const localDate = new Date();
  const jakartaTimezoneOffset = 7 * 60; // Jakarta is UTC+7
  const jakartaDate = new Date(
    localDate.getTime() + jakartaTimezoneOffset * 60 * 1000
  );
  return jakartaDate;
};

export const parseToWIBDate = (dateStr: string): Date => {
  const d = new Date(dateStr);
  return new Date(d.getTime() + 7 * 60 * 60 * 1000);
};