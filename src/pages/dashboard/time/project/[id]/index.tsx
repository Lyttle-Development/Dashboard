import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { useApp } from "@/contexts/App.context";
import { fetchApi } from "@/lib/fetchApi";
import { Project, TimeLog } from "@/lib/prisma";

export function Page() {
  const router = useRouter();
  const app = useApp();
  const { id } = router.query; // project id from the URL

  const [project, setProject] = useState<Project>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLog, setTimeLog] = useState<TimeLog>(null);
  const [timer, setTimer] = useState<string>("00:00");
  const [lastTimePlayed, setLastTimePlayed] = useState<number>(0);

  // Fetch the project details by id.
  const fetchProject = useCallback(async (projectId: string) => {
    setLoading(true);
    const projectData = await fetchApi<Project>({
      table: "project",
      id: projectId,
    });
    setProject(projectData);
    setLoading(false);
  }, []);

  // Fetch any active time log (one with a null endTime)
  const fetchEmptyTimeLog = useCallback(async (projectId: string) => {
    setLoading(true);
    const timeLogData = await fetchApi<TimeLog[]>({
      table: "time-log",
      where: { projectId, user: app.userId, endTime: null },
    });
    setTimeLog(timeLogData && timeLogData.length ? timeLogData[0] : null);
    setLoading(false);
  }, []);

  // Helper to prefetch both project and time log data.
  const refreshData = useCallback(
    async (projectId: string) => {
      await fetchProject(projectId);
      await fetchEmptyTimeLog(projectId);
    },
    [fetchProject, fetchEmptyTimeLog],
  );

  // Start a new time log for the project.
  const startTimeLog = useCallback(
    async (projectId: string) => {
      setLoading(true);
      const timeLogData = await fetchApi<TimeLog>({
        method: "POST",
        table: "time-log",
        body: {
          user: app.userId,
          projectId: projectId,
          startTime: new Date().toISOString(),
        },
      });
      setTimeLog(timeLogData);
      setLoading(false);
      // After starting, refresh the project details and active time log.
      await refreshData(projectId);
    },
    [refreshData],
  );

  // End the active time log.
  const endTimeLog = useCallback(
    async (timeLogId: string) => {
      await fetchApi<TimeLog>({
        method: "PUT",
        table: "time-log",
        id: timeLogId,
        body: {
          endTime: new Date().toISOString(),
        },
      });
      if (id && typeof id === "string") {
        // After ending, refresh the project details and active time log.
        await refreshData(id);
      }
    },
    [id, refreshData],
  );

  // Fetch project details and any active time log when the page loads.
  useEffect(() => {
    if (id && typeof id === "string") {
      void refreshData(id);
    }
  }, [id, refreshData]);

  // Update the elapsed time every second while a time log is active.
  useEffect(() => {
    console.log("timeLog", timeLog);
    if (timeLog?.startTime) {
      const updateTimer = () => {
        const elapsed = Math.floor(
          (Date.now() - new Date(timeLog.startTime).getTime()) / 1000,
        );
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(
          2,
          "0",
        );
        setTimer(`${hours}:${minutes}`);
      };

      // Update immediately on load.
      updateTimer();

      // Then update every second.
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLog]);

  useEffect(() => {
    const playBell = () => {
      // If at :15, :30, :45, or :00, play the bell sound.
      if (
        !(
          timer.endsWith(":00") ||
          timer.endsWith(":15") ||
          timer.endsWith(":30") ||
          timer.endsWith(":45")
        )
      )
        return;

      // Check if its spamming... (10 seconds)
      const now = Date.now();
      if (lastTimePlayed && now - lastTimePlayed < 10 * 1000) return;
      setLastTimePlayed(now);

      // Play the bell sound.
      const bell = new Audio("/bell.mp3");
      void bell.play();
    };

    timeLog && playBell();
  }, [timer]);

  if (loading) return <Loader />;
  if (!project) return <div>Project not found</div>;

  return (
    <Container>
      <h2 className={styles.projectTitle}>Project: {project.name}</h2>
      {timeLog ? (
        <>
          <h3>Active Time Log</h3>
          <p className={styles.timer}>Elapsed Time: {timer}</p>
          <button
            className={`${styles.button} ${styles.end}`}
            onClick={() => endTimeLog(timeLog.id)}
          >
            End Time Log
          </button>
        </>
      ) : (
        <>
          <h3>No Active Time Log</h3>
          <button
            className={`${styles.button} ${styles.start}`}
            onClick={() => startTimeLog(project.id)}
          >
            Start Time Log
          </button>
        </>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
