import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/contexts/App.context";
import { fetchApi } from "@/lib/fetchApi";
import { Project, TimeLog } from "@/lib/prisma";
import { Loader } from "@/components/Loader";
import styles from "./index.module.scss";

export interface ProjectTimeLogProps {
  projectId: string;
  reloadTimeLogs: (projectId: string) => void;
}

export function ProjectTimeLog({ projectId, reloadTimeLogs = (p) => p }) {
  const app = useApp();
  const [project, setProject] = useState<Project>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLog, setTimeLog] = useState<TimeLog>(null);
  const [timer, setTimer] = useState<string>("00:00");
  const [lastTimePlayed, setLastTimePlayed] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    const projectData = await fetchApi<Project>({
      table: "project",
      id: projectId,
    });
    setProject(projectData);
    setLoading(false);
  }, [projectId]);

  const fetchEmptyTimeLog = useCallback(async () => {
    setLoading(true);
    const timeLogData = await fetchApi<TimeLog[]>({
      table: "time-log",
      where: { projectId, user: app.userId, endTime: null },
    });
    setTimeLog(timeLogData?.length ? timeLogData[0] : null);
    setLoading(false);
  }, [projectId, app.userId]);

  const refreshData = useCallback(async () => {
    await fetchProject();
    await fetchEmptyTimeLog();
  }, [fetchProject, fetchEmptyTimeLog]);

  const startTimeLog = useCallback(async () => {
    setLoading(true);
    const timeLogData = await fetchApi<TimeLog>({
      method: "POST",
      table: "time-log",
      body: {
        user: app.userId,
        projectId,
        startTime: new Date().toISOString(),
      },
    });
    setTimeLog(timeLogData);
    setLoading(false);
    // await refreshData();
    void reloadTimeLogs(projectId);
  }, [refreshData, app.userId, projectId]);

  const endTimeLog = useCallback(async () => {
    if (!timeLog?.id) return;
    await fetchApi<TimeLog>({
      method: "PUT",
      table: "time-log",
      id: timeLog.id,
      body: { endTime: new Date().toISOString() },
    });
    // await refreshData();
    void reloadTimeLogs(projectId);
  }, [timeLog, refreshData]);

  useEffect(() => {
    if (projectId) refreshData();
  }, [projectId, refreshData]);

  useEffect(() => {
    if (timeLog?.startTime) {
      const updateTimer = () => {
        const elaps = Math.floor(
          (Date.now() - new Date(timeLog.startTime).getTime()) / 1000,
        );
        const hours = String(Math.floor(elaps / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((elaps % 3600) / 60)).padStart(
          2,
          "0",
        );
        setTimer(`${hours}:${minutes}`);
        setElapsed(elaps);
        setLastTimePlayed(new Date().getTime());
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLog]);

  useEffect(() => {
    if (elapsed < 10) return;
    if ([":00", ":15", ":30", ":45"].some((t) => timer.endsWith(t))) {
      const now = Date.now();
      if (lastTimePlayed && now - lastTimePlayed < 10000) return;
      setLastTimePlayed(now);
      const bell = new Audio("/bell.mp3");
      void bell.play();
    }
  }, [timer]);

  if (loading) return <Loader />;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      {timeLog ? (
        <article className={styles.side_to_side}>
          <button
            className={`${styles.button} ${styles.end}`}
            onClick={endTimeLog}
          >
            End Time Log
          </button>
          <p className={styles.timer}>Elapsed Time: {timer}</p>
        </article>
      ) : (
        <article className={styles.side_to_side}>
          <button
            className={`${styles.button} ${styles.start}`}
            onClick={startTimeLog}
          >
            Start Time Log
          </button>
        </article>
      )}
    </div>
  );
}
