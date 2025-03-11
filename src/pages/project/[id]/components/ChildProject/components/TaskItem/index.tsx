import styles from "./index.module.scss";
import { Button } from "@/components/Button";
import { Project, Task } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { fetchApi } from "@/lib/fetchApi";
import { useEffect, useState } from "react";
import { Markdown } from "@/components/Markdown";

interface ProjectProjectProps {
  project: Project;
  task: Task;
  fetchProject: (projectId: string, noReload?: boolean) => void;
}

export function TaskItem({ project, task, fetchProject }: ProjectProjectProps) {
  const [title, setTitle] = useState<string>(null);
  const [description, setDescription] = useState<string>(null);

  useEffect(() => {}, []);

  const updateTask = async (taskId: string) => {
    await fetchApi({
      method: "PUT",
      table: "task",
      id: taskId,
      body: {
        title: title ?? task.title,
        description: description ?? task.description,
      },
    });

    setTitle(null);
    setDescription(null);

    void fetchProject(project.id, true);
  };

  const closeTask = async (taskId: string) => {
    await fetchApi({
      method: "PUT",
      table: "task",
      id: taskId,
      body: { done: true },
    });

    void fetchProject(project.id, true);
  };

  return (
    <li key={task.id} className={styles.task}>
      <Button
        onClick={() => closeTask(task.id)}
        title={"Mark completed, and close task."}
      >
        <Icon icon={faCircleCheck} />
      </Button>
      <article className={styles.task_details}>
        <TaskItemTitle
          task={task}
          title={title}
          setTitle={setTitle}
          updateTask={updateTask}
        />
        <TaskItemDescription
          task={task}
          description={description}
          setDescription={setDescription}
          updateTask={updateTask}
        />
      </article>
    </li>
  );
}

interface TaskItemTitleProps {
  task: Task;
  title: string;
  setTitle: (title: string) => void;
  updateTask: (taskId: string) => void;
}

function TaskItemTitle({
  task,
  title,
  setTitle,
  updateTask,
}: TaskItemTitleProps) {
  if (title == null) {
    return (
      <h6 onClick={() => setTitle(task.title || "")}>{task.title || "N/A"}</h6>
    );
  }
  return (
    <input
      className={styles.title_input}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onSubmit={() => updateTask(task.id)}
      onBlur={() => updateTask(task.id)}
      autoFocus={true}
    />
  );
}

interface TaskItemDescriptionProps {
  task: Task;
  description: string;
  setDescription: (description: string) => void;
  updateTask: (taskId: string) => void;
}

function TaskItemDescription({
  task,
  description,
  setDescription,
  updateTask,
}: TaskItemDescriptionProps) {
  if (description == null) {
    return (
      <div onClick={() => setDescription(task.description ?? "")}>
        <Markdown>
          {task.description?.replaceAll("\n", "\n\n") ?? "N/A"}
        </Markdown>
      </div>
    );
  }
  return (
    <textarea
      className={styles.description_input}
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      onSubmit={() => updateTask(task.id)}
      onBlur={() => updateTask(task.id)}
      autoFocus={true}
    />
  );
}

export default TaskItem;
