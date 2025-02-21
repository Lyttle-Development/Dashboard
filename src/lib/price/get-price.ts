import { TimeLog } from "@/lib/prisma";

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
  return getAmount ? amount : `€${amount} (€${hourPrice}/h)`;
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
  return getAmount ? totalAmount : `€${totalAmount}`;
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
  const exact = getTotal(timeLogs) / 3600000; // Convert milliseconds to hours;
  if (returnExact) return exact;
  // round down to the minutes
  return Math.floor(exact * 100) / 100;
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

export function getTotalFormattedHours(duration: number) {
  // return xx:xx (hours:minutes) from duration in milliseconds
  const days = Math.floor(duration / 86400000);
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function getTotalFormattedTimeLogsHours(timeLogs: TimeLog[]) {
  return getTotalFormattedHours(getTotal(timeLogs));
}
