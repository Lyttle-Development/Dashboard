import styles from "./index.module.scss";
import { KeyValue } from "@/components/KeyValue";
import { ProjectTimeLog } from "@/components/ProjectTimeLog";
import {
  getPrice,
  getTotalFormattedHours,
  getTotalFormattedTimeLogsHours,
} from "@/lib/price/get-price";
import { Project, Task, TimeLog } from "@/lib/prisma";
import { Field } from "@/components/Field";
import { Form, FormOptionType } from "@/components/Form";
import { useState } from "react";
import TaskItem from "@/pages/project/[id]/components/ChildProject/components/TaskItem";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetchApi } from "@/lib/fetchApi";
import { useApp } from "@/contexts/App.context";
import { ActiveTimeLogs } from "@/components/ActiveTimeLogs";
import { SideToSide } from "@/components/SideToSide";
import { Button } from "@/components/Button";
import { LINKS } from "@/links";

interface ChildProjectProps {
  project: Project;
  projects: Project[];
  fetchProject: (projectId: string, noReload?: boolean) => void;
  activeTimeLogs: TimeLog[];
  timeLogsGrouped: Map<string, Map<string, number>>;
}

export function ChildProject({
  project,
  projects,
  fetchProject,
  activeTimeLogs,
  timeLogsGrouped,
}: ChildProjectProps) {
  const app = useApp();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filter, _setFilter] = useState<string>(
    localStorage?.getItem("projectFilter") || "",
  );
  const setFilter = (filter: string) => {
    _setFilter(filter);
    localStorage?.setItem("projectFilter", filter);
  };

  const submitTask = async (data: { title: string; description: string }) => {
    setDialogOpen(false);

    const res = await fetchApi<Task>({
      method: "POST",
      table: "task",
      body: {
        title: data.title,
        userId: app.userId,
        projectId: project.id,
        description: data.description,
        categoryId: null,
      },
    });

    if (!res) {
      window.alert("Failed to add time");
      return;
    }

    void fetchProject(project.id, true);
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
        <ProjectTimeLog project={project} reloadTimeLogs={fetchProject} />
        <article>
          <KeyValue
            label="Total Time"
            value={getTotalFormattedTimeLogsHours(project.timeLogs)}
          />
          <KeyValue label="Active Time Logs" value={activeTimeLogs.length} />
        </article>
        <ActiveTimeLogs projectIds={[project.id]} lessInfo />
      </section>

      <section>
        <SideToSide>
          <h2>Tasks:</h2>

          <Dialog
            title="Quick Create Task"
            description="Add task to the project"
            buttonText={
              <>
                <Icon icon={faPlus} />
                <span>Quick Create Task</span>
              </>
            }
            onOpenChange={setDialogOpen}
            open={dialogOpen}
          >
            <Form
              onSubmit={submitTask}
              options={[
                {
                  key: "title",
                  label: "Title",
                  type: FormOptionType.TEXT,
                  required: true,
                },
                {
                  key: "description",
                  label: "Description",
                  type: FormOptionType.TEXTAREA,
                  required: false,
                },
              ]}
            />
          </Dialog>
          <Button href={LINKS.task.create_project(project.id)}>
            Bulk Create Task
          </Button>
        </SideToSide>
        <Field
          label="Search Tasks"
          type={FormOptionType.TEXT}
          onChange={setFilter}
          value={filter}
        />
        <ul className={styles.tasks}>
          {project?.tasks
            ?.filter(
              (t) =>
                !t.done &&
                (t?.title?.toLowerCase()?.includes(filter?.toLowerCase()) ||
                  t?.description
                    ?.toLowerCase()
                    ?.includes(filter?.toLowerCase())),
            )
            ?.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )
            ?.map((task) => (
              <TaskItem
                project={project}
                task={task}
                fetchProject={fetchProject}
                projects={projects}
              />
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
