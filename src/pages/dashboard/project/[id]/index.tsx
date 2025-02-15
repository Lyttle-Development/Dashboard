import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { idToName } from "@/lib/discord";
import { TimeLog } from "@/lib/prisma";

const filterTimeLogs = (timeLogs: TimeLog[], returnActive = false) => {
  // remove time log that does not have end date
  if (returnActive) {
    return timeLogs.filter(
      (timeLog) => new Date(timeLog.endTime).getTime() === 0,
    );
  }
  return timeLogs.filter((timeLog) => new Date(timeLog.endTime).getTime() > 0);
};

function getTotalTimePerDayAndPerUser(timeLogs: TimeLog[]) {
  timeLogs = filterTimeLogs(timeLogs);

  // Return a list of user ids and their total time worked summed up per day.
  const timePerDayAndPerUser = new Map<string, Map<string, number>>();
  for (const timeLog of timeLogs) {
    const date = new Date(timeLog.startTime).toDateString();
    const user = idToName(timeLog.user);
    if (!timePerDayAndPerUser.has(date)) {
      timePerDayAndPerUser.set(date, new Map());
    }
    const userTime = timePerDayAndPerUser.get(date);
    if (!userTime.has(user)) {
      userTime.set(user, 0);
    }
    const duration =
      new Date(timeLog.endTime).getTime() -
      new Date(timeLog.startTime).getTime();
    userTime.set(user, userTime.get(user) + duration);
  }
  return timePerDayAndPerUser;
}

function getTotalDuration(timeLogs: TimeLog[]) {
  timeLogs = filterTimeLogs(timeLogs);

  // Return the total duration of all time logs in milliseconds.
  return timeLogs.reduce((acc, timeLog) => {
    return (
      acc +
      (new Date(timeLog.endTime).getTime() -
        new Date(timeLog.startTime).getTime())
    );
  }, 0);
}

function convertDurationToHours(duration: number) {
  // return xx:xx (hours:minutes) from duration in milliseconds
  const days = Math.floor(duration / 86400000);
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function getPrice(total: number, price: number) {
  return `€${Math.round(total * price * 100) / 100}`;
}

export function Page() {
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch the project details by id.
  const fetchProject = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const relations = encodeURIComponent(
        JSON.stringify({
          timeLogs: true,
          client: true,
          price: true,
        }),
      );
      const res = await fetch(
        `/api/project/${projectId}?relations=${relations}`,
      );

      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();

      const priceCategoryRes = await fetch(
        `/api/category/${data.price.categoryId}`,
      );
      data.price.category = (await priceCategoryRes?.json()) || {};

      setProject(data);
    } catch (err) {
      setProject(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const projectId = router.query.id as string;
    if (projectId) {
      void fetchProject(projectId);
    }
  }, []);

  if (loading) return <Loader />;
  if (!project) return <div>Project not found</div>;

  const timeLogsGrouped = getTotalTimePerDayAndPerUser(project.timeLogs);
  const totalDuration = getTotalDuration(project.timeLogs);
  const totalDurationHours = totalDuration / 3600000;
  const activeTimeLogs = filterTimeLogs(project.timeLogs, true);

  return (
    <Container>
      <h2 className={styles.projectTitle}>Project: {project.name}</h2>
      <h6>Customer: {project.client.name}</h6>
      <h6>Category: {project.price.category.name}</h6>
      <h6>Service: {project.price.service}</h6>
      <h2>Time Logs</h2>
      <h6>Total Time: {convertDurationToHours(totalDuration)}</h6>
      <h6>Active Time Logs: {activeTimeLogs.length}</h6>
      <h5>Completed:</h5>
      <ul>
        {timeLogsGrouped.entries().map(([date, userTime]) => (
          <li key={date}>
            <h6>{date}</h6>
            <ul>
              {userTime.entries().map(([user, time]) => {
                return (
                  <li key={user}>
                    {user}: {convertDurationToHours(time)}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      <h2>Calculated Price</h2>
      <h6>Standard: {getPrice(totalDurationHours, project.price.standard)}</h6>
      <h6>
        Standard Min: {getPrice(totalDurationHours, project.price.standardMin)}
      </h6>
      <h6>
        Standard Max: {getPrice(totalDurationHours, project.price.standardMax)}
      </h6>
      <h6>Friend: {getPrice(totalDurationHours, project.price.friends)}</h6>
      <h6>
        Friend Min: {getPrice(totalDurationHours, project.price.friendsMin)}
      </h6>
      <h6>
        Friend Max: {getPrice(totalDurationHours, project.price.friendsMax)}
      </h6>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
