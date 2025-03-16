import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/contexts/App.context";
import { fetchApi } from "@/lib/fetchApi";
import { Project, TimeLog } from "@/lib/prisma";
import { Form, FormOptionType } from "@/components/Form";
import { Dialog } from "@/components/Dialog";
import { Button, ButtonStyle } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { faGaugeHigh, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import { SideToSide } from "@/components/SideToSide";
import { getTimeLogTimeSpent } from "@/lib/price/get-price";

export interface ProjectTimeLogProps {
  project: Project;
  reloadTimeLogs: (projectId: string) => void;
}

export function ProjectTimeLog({ project, reloadTimeLogs = (p) => p }) {
  const app = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLog, setTimeLog] = useState<TimeLog>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const fetchEmptyTimeLog = useCallback(async () => {
    setLoading(true);
    const timeLogData = await fetchApi<TimeLog[]>({
      table: "time-log",
      where: { projectId: project.id, user: app.userId, endTime: null },
    });
    setTimeLog(timeLogData?.length ? timeLogData[0] : null);
    setLoading(false);
  }, [project, app.userId]);

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
        projectId: project.id,
        startTime: new Date().toISOString(),
      },
    });
    setTimeLog(timeLogData);
    setLoading(false);
    // await refreshData();
    void reloadTimeLogs(project.id);
  }, [refreshData, app.userId, project]);

  const endTimeLog = useCallback(async () => {
    setLoading(true);
    if (!timeLog?.id) return;
    await fetchApi<TimeLog>({
      method: "PUT",
      table: "time-log",
      id: timeLog.id,
      body: { endTime: new Date().toISOString() },
    });
    // await refreshData();
    void reloadTimeLogs(project.id);
    setLoading(false);
  }, [timeLog, refreshData]);

  useEffect(() => {
    if (project.id) void refreshData();
  }, [project, refreshData]);

  const submitQuickTime = async (data: { date: string; time: string }) => {
    setDialogOpen(false);
    const [hours, minutes] = data.time?.split(":") ?? [];
    if (!hours || !minutes) return;
    const [year, month, day] = data.date.split("-");

    const startDate = new Date(Number(year), Number(month) - 1, Number(day));
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(Number(year), Number(month) - 1, Number(day));
    endDate.setHours(Number(hours), Number(minutes), 0, 0);

    const res = await fetchApi<TimeLog>({
      method: "POST",
      table: "time-log",
      body: {
        user: app.userId,
        projectId: project.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    if (!res) {
      window.alert("Failed to add time");
      return;
    }

    void reloadTimeLogs(project.id);
  };

  return (
    <SideToSide>
      {timeLog ? (
        <>
          <Button
            onClick={endTimeLog}
            style={ButtonStyle.Danger}
            disabled={loading}
          >
            <Icon icon={faStop} />
            End Time Log ({getTimeLogTimeSpent(timeLog)})
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={startTimeLog}
            style={ButtonStyle.Primary}
            disabled={loading}
          >
            <Icon icon={faPlay} />
            Start Time Log
          </Button>
        </>
      )}
      <Dialog
        title="Quickly add time"
        description="Add time to the project"
        buttonText={
          <>
            <Icon icon={faGaugeHigh} />
            <span>Quickly add time</span>
          </>
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      >
        <Form
          onSubmit={submitQuickTime}
          options={[
            {
              key: "date",
              label: "Date",
              type: FormOptionType.DATE,
              required: true,
            },
            {
              key: "time",
              label: "Time",
              type: FormOptionType.TEXT,
              placeholder: "HH:MM",
              required: true,
            },
          ]}
        />
      </Dialog>
    </SideToSide>
  );
}
