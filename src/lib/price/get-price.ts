import { TimeLog } from "@/lib/prisma";
import { formatNumber } from "@/lib/format/number";

export function getPrice(
  totalHours: number | TimeLog[],
  hourPrice: number,
  getAmount: boolean = false,
): string | number {
  hourPrice = hourPrice || 0;
  totalHours =
    totalHours && typeof totalHours === "number"
      ? totalHours
      : getTotalHours(totalHours as TimeLog[]);
  const amount = Math.round(totalHours * hourPrice * 100) / 100;
  return getAmount
    ? amount
    : `€${formatNumber(amount)} (€${formatNumber(hourPrice)}/h)`;
}

export function getPriceFromPrices(
  totalHours: number[] | TimeLog[][],
  hourPrices: number[],
  getAmount: boolean = false,
) {
  // Get from each hour price the total amount and sum them up
  let totalAmount = hourPrices.reduce((acc, hourPrice, index) => {
    return acc + (getPrice(totalHours[index], hourPrice, true) as number);
  }, 0);
  totalAmount = Math.round(totalAmount * 100) / 100;
  return getAmount ? totalAmount : `€${formatNumber(totalAmount)}`;
}

export function getTotal(timeLogs: TimeLog[]) {
  // Only calculate the total time of time logs that have an end date.
  timeLogs = getFinishedTimeLogs(timeLogs);

  return timeLogs.reduce((acc, timeLog) => {
    return (
      acc +
      (new Date(timeLog.endTime).getTime() -
        new Date(timeLog.startTime).getTime())
    );
  }, 0);
}

export function getTotalHours(timeLogs: TimeLog[], returnExact = false) {
  const duration = getTotal(timeLogs);
  return getTotalHoursDuration(duration, returnExact);
}

export function getTotalHoursDuration(duration: number, returnExact = false) {
  const exact = duration / 3600000; // Convert milliseconds to hours;
  if (returnExact) return exact;
  return Math.floor(exact); // Return the rounded down hours
}

export function getFinishedTimeLogs(timeLogs: TimeLog[], returnActive = false) {
  // remove time log that does not have end date
  if (returnActive) {
    return timeLogs.filter(
      (timeLog) =>
        !timeLog.endTime || new Date(timeLog.endTime).getTime() === 0,
    );
  }
  return timeLogs.filter((timeLog) => new Date(timeLog.endTime).getTime() > 0);
}

export function getTotalFormattedHours(duration: number, exact = false) {
  const totalHours = getTotalHoursDuration(duration);
  // Start from minutes and convert to hours and days keeping the remainder
  const minutes = Math.floor((duration / 60000) % 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  if (days > 0) {
    return `${days}d ${hours}h (${minutes}m) (${formatNumber(totalHours)}h)`;
  }

  return `${hours}h ${minutes}m`;
}

export function getTotalFormattedTimeLogsHours(timeLogs: TimeLog[]) {
  return getTotalFormattedHours(getTotal(timeLogs));
}

export function getTimeSpent(startTime: Date) {
  const startDate = new Date(startTime);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - startDate.getTime();
  return getTotalFormattedHours(timeDifference);
}

export function getTimeLogTimeSpent(timeLog: TimeLog) {
  return getTimeSpent(new Date(timeLog.startTime));
}

export function getTimeLogsTimeSpent(timeLogs: TimeLog[]) {
  let total = 0;

  console.log("timeLogs", timeLogs);

  timeLogs.forEach((timeLog) => {
    total += timeLog.endTime
      ? new Date(timeLog.endTime).getTime() -
        new Date(timeLog.startTime).getTime()
      : new Date().getTime() - new Date(timeLog.startTime).getTime();
  });

  return getTotalFormattedHours(total);
}
