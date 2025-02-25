import styles from "../../index.module.scss";
import { KeyValue } from "@/components/KeyValue";
import { ProjectTimeLog } from "@/components/ProjectTimeLog";
import {
  getPrice,
  getTotalFormattedHours,
  getTotalFormattedTimeLogsHours,
} from "@/lib/price/get-price";
import { Project, TimeLog } from "@/lib/prisma";

interface ChildProjectProps {
  project: Project;
  fetchProject: (projectId: string) => void;
  activeTimeLogs: TimeLog[];
  timeLogsGrouped: Map<string, Map<string, number>>;
}

export function ChildProject({
  project,
  fetchProject,
  activeTimeLogs,
  timeLogsGrouped,
}: ChildProjectProps) {
  return (
    <>
      <article>
        <KeyValue
          label="Customer"
          value={`${project.customer.firstname} ${project.customer.lastname}`}
        />
        <KeyValue label="Category" value={project.price.category.name} />
        <KeyValue label="Service" value={project.price.service} />
        <KeyValue
          label="Calculated Price"
          value={getPrice(project.timeLogs, project.price.price)}
        />
      </article>
      <br />
      <h2>Time Logs</h2>
      <ProjectTimeLog projectId={project.id} reloadTimeLogs={fetchProject} />
      <article>
        <KeyValue
          label="Total Time"
          value={getTotalFormattedTimeLogsHours(project.timeLogs)}
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
                      value={getTotalFormattedHours(time)}
                    />
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ChildProject;
