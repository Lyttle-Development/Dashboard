import styles from "../../index.module.scss";
import { KeyValue } from "@/components/KeyValue";
import { ProjectTimeLog } from "@/components/ProjectTimeLog";
import {
  getPrice,
  getTotalFormattedHours,
  getTotalFormattedTimeLogsHours,
} from "@/lib/price/get-price";
import { Project, TimeLog } from "@/lib/prisma";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Icon } from "@/components/Icon";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

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
  const closeTask = async (taskId: string) => {
    await fetchApi({
      method: "PUT",
      table: "task",
      id: taskId,
      body: { done: true },
    });

    void fetchProject(project.id);
  };

  return (
    <div className={styles.project_details}>
      <section>
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
      </section>

      <section>
        <h2>Time Logs:</h2>
        <ProjectTimeLog projectId={project.id} reloadTimeLogs={fetchProject} />
        <article>
          <KeyValue
            label="Total Time"
            value={getTotalFormattedTimeLogsHours(project.timeLogs)}
          />
          <KeyValue label="Active Time Logs" value={activeTimeLogs.length} />
        </article>
      </section>

      <section>
        <h2>Tasks:</h2>
        <ul className={styles.tasks}>
          {project.tasks
            .filter((t) => !t.done)
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )
            .map((task) => (
              <li key={task.id} className={styles.task}>
                <Button
                  onClick={() => closeTask(task.id)}
                  title={"Mark completed, and close task."}
                >
                  <Icon icon={faCircleCheck} />
                </Button>
                <article className={styles.task_details}>
                  <h6>{task.title}</h6>
                  {task.description && <p>{task.description}</p>}
                </article>
              </li>
            ))}
          {project.tasks.filter((t) => !t.done).length === 0 && (
            <li className={styles.task}>
              <p>No tasks</p>
            </li>
          )}
        </ul>
      </section>

      <section>
        <h2>Completed Time Logs:</h2>
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
      </section>
    </div>
  );
}

export default ChildProject;
