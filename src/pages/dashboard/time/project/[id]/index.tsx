import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";

async function fetchApi(
  action: string,
  url: string,
  setResult: (result: any) => void,
  setLoading: (loading: boolean) => void,
  body?: object,
) {
  setLoading(true);
  try {
    const res = await fetch(url, {
      method: action,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    const resJson = await res.json();
    setResult(resJson || null);
  } catch (err) {
    setResult(null);
  }
  setLoading(false);
}

export function Page() {
  const router = useRouter();
  const { id } = router.query; // project id from the URL

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeLog, setTimeLog] = useState<any>(null);
  const [timer, setTimer] = useState("00:00");

  // Fetch the project details by id.
  const fetchProject = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/project/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();
      setProject(data);
    } catch (err) {
      setProject(null);
    }
    setLoading(false);
  }, []);

  // Fetch any active time log (one with a null endTime)
  const fetchEmptyTimeLog = useCallback(async (projectId: string) => {
    await fetchApi(
      "GET",
      `/api/time-log?where={"projectId": "${projectId}", "endTime":null}`,
      (res) => (res ? setTimeLog(res[0]) : setTimeLog(null)),
      setLoading,
    );
  }, []);

  // Helper to refetch both project and time log data.
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
      await fetchApi("POST", `/api/time-log`, setTimeLog, setLoading, {
        projectId: projectId,
        startTime: new Date().toISOString(),
      });
      // After starting, refresh the project details and active time log.
      await refreshData(projectId);
    },
    [refreshData],
  );

  // End the active time log.
  const endTimeLog = useCallback(
    async (timeLogId: string) => {
      await fetchApi(
        "PUT",
        `/api/time-log/${timeLogId}`,
        setTimeLog,
        setLoading,
        {
          endTime: new Date().toISOString(),
        },
      );
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

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.projectTitle}>Project: {project.name}</h2>
      {timeLog ? (
        <div className={styles.activeLog}>
          <h3>Active Time Log</h3>
          <p className={styles.timer}>Elapsed Time: {timer}</p>
          <button
            className={`${styles.button} ${styles.end}`}
            onClick={() => endTimeLog(timeLog.id)}
          >
            End Time Log
          </button>
        </div>
      ) : (
        <div className={styles.noLog}>
          <h3>No Active Time Log</h3>
          <button
            className={`${styles.button} ${styles.start}`}
            onClick={() => startTimeLog(project.id)}
          >
            Start Time Log
          </button>
        </div>
      )}
    </div>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
