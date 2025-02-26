import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/contexts/App.context";
import { fetchApi } from "@/lib/fetchApi";
import { TimeLog } from "@/lib/prisma";
import styles from "./index.module.scss";
import { Button, ButtonStyle } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons";

export interface PrintTimeLogProps {
  printJobId: string;
}

export function PrintTimeLog({ printJobId }: PrintTimeLogProps) {
  const app = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLog, setTimeLog] = useState<TimeLog>(null);
  const [timer, setTimer] = useState<string>("00:00");
  const [lastTimePlayed, setLastTimePlayed] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);

  const fetchEmptyTimeLog = useCallback(async () => {
    setLoading(true);
    const timeLogData = await fetchApi<TimeLog[]>({
      table: "time-log",
      where: { printJobId, user: app.userId, endTime: null },
    });
    setTimeLog(timeLogData?.length ? timeLogData[0] : null);
    setLoading(false);
  }, [app.userId]);

  const refreshData = useCallback(async () => {
    await fetchEmptyTimeLog();
  }, [fetchEmptyTimeLog]);

  const startTimeLog = useCallback(async () => {
    setLoading(true);
    const timeLogData = await fetchApi<TimeLog>({
      method: "POST",
      table: "time-log",
      body: {
        user: app.userId,
        printJobId,
        startTime: new Date().toISOString(),
      },
    });
    setTimeLog(timeLogData);
    setLoading(false);
    void refreshData();
  }, [refreshData, app.userId, printJobId]);

  const endTimeLog = useCallback(async () => {
    if (!timeLog?.id) return;
    await fetchApi<TimeLog>({
      method: "PUT",
      table: "time-log",
      id: timeLog.id,
      body: { endTime: new Date().toISOString() },
    });
    void refreshData();
  }, [timeLog, refreshData]);

  useEffect(() => {
    if (printJobId) void refreshData();
  }, [printJobId, refreshData]);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <article className={styles.side_to_side}>
        {timeLog ? (
          <>
            <Button onClick={endTimeLog} style={ButtonStyle.Danger}>
              <Icon icon={faStop} />
              End Time Log ({timer})
            </Button>
          </>
        ) : (
          <>
            <Button onClick={startTimeLog} style={ButtonStyle.Primary}>
              <Icon icon={faPlay} />
              Start Time Log
            </Button>
          </>
        )}
      </article>
    </div>
  );
}
