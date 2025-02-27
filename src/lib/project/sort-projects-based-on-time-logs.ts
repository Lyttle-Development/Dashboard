import { Project } from "@/lib/prisma";

export function sortProjectsBasedOnTimeLogs(projects: Project[]) {
  projects.sort((a, b) => {
    // find newest timeLog
    const newestTimeLogA = a.timeLogs.reduce((acc, cur) => {
      const curTime = new Date(cur.startTime)?.getTime() ?? 0;
      return acc < curTime ? curTime : acc;
    }, 0);
    const newestTimeLogB = b.timeLogs.reduce((acc, cur) => {
      const curTime = new Date(cur.startTime)?.getTime() ?? 0;
      return acc < curTime ? curTime : acc;
    }, 0);
    return newestTimeLogB - newestTimeLogA;
  });
  return projects;
}
