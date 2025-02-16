import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { idToName } from "@/lib/discord";
import { Category, Project, TimeLog } from "@/lib/prisma";
import { KeyValue } from "@/components/KeyValue";
import { fetchApi } from "@/lib/fetchApi";

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
  price = price || 0;
  return `€${Math.round(total * price * 100) / 100} (€${price}/h)`;
}

export function Page() {
  const router = useRouter();

  const [project, setProject] = useState<Project>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchProject = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const projectData = await fetchApi<Project>({
        table: "project",
        id: projectId,
        method: "GET",
        relations: {
          timeLogs: true,
          customer: true,
          price: true,
        },
      });

      if (!projectData) {
        throw new Error("Project not found");
      }

      projectData.price.category = await fetchApi<Category>({
        table: "category",
        id: projectData.price.categoryId,
        method: "GET",
      });

      setProject(projectData);
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
      <article>
        <KeyValue label="Customer" value={project.customer.name} />
        <KeyValue label="Category" value={project.price.category.name} />
        <KeyValue label="Service" value={project.price.service} />
      </article>
      <br />
      <h2>Time Logs</h2>
      <article>
        <KeyValue
          label="Total Time"
          value={convertDurationToHours(totalDuration)}
        />
        <KeyValue label="Active Time Logs" value={activeTimeLogs.length} />
      </article>
      <br />
      <h5>Completed:</h5>
      <ul>
        {timeLogsGrouped.entries().map(([date, userTime]) => (
          <li key={date} className={styles.time_log_day}>
            <h6>{date}</h6>
            <ul>
              {userTime.entries().map(([user, time]) => {
                return (
                  <li key={user}>
                    <KeyValue
                      label={user}
                      value={convertDurationToHours(time)}
                    />
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      <h2>Calculated Price</h2>
      <article>
        <KeyValue
          label="Standard"
          value={getPrice(totalDurationHours, project.price.standard)}
        />
        <KeyValue
          label="Standard Min"
          value={getPrice(totalDurationHours, project.price.standardMin)}
        />
        <KeyValue
          label="Standard Max"
          value={getPrice(totalDurationHours, project.price.standardMax)}
        />
        <br />
        <KeyValue
          label="Friend"
          value={getPrice(totalDurationHours, project.price.friends)}
        />
        <KeyValue
          label="Friend Min"
          value={getPrice(totalDurationHours, project.price.friendsMin)}
        />
        <KeyValue
          label="Friend Max"
          value={getPrice(totalDurationHours, project.price.friendsMax)}
        />
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
