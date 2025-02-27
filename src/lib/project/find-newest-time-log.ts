import { TimeLog } from "../prisma";

export function findNewestTimeLog(timeLogs: TimeLog[]): TimeLog {
  return timeLogs.reduce((newestTimeLog, timeLog) => {
    if (!newestTimeLog) return timeLog;
    if (new Date(timeLog.startTime) > new Date(newestTimeLog.startTime))
      return timeLog;
    return newestTimeLog;
  }, null);
}
