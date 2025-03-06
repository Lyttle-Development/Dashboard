import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Project, Task } from "@/lib/prisma";
import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { FormOptionType } from "@/components/Form";
import { Switch } from "@/components/Switch";
import { useApp } from "@/contexts/App.context";
import { mapProjectsToOptions } from "@/lib/project";
import styles from "./index.module.scss";

function Page() {
  const app = useApp();
  const [loadings, setLoading] = useState({
    projects: true,
    global: false,
  });
  const loading = Object.values(loadings).some((value) => value);
  const updateLoading = (key: string, value: boolean) => {
    setLoading((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [multiple, setMultiple] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<{
    title: string;
    description: string;
    projectId: string | null;
  }>({
    title: "",
    description: "",
    projectId: null,
  });

  const updateTask = (key: string, value: string | number) => {
    setTask((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchProjects = useCallback(async () => {
    updateLoading("projects", true);
    const projectsData = await fetchApi<Project[]>({
      table: "Project",
      relations: {
        timeLogs: true,
      },
    });
    setProjects(projectsData ?? []);
    updateLoading("projects", false);
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const validTask = !!task.title && !!task.projectId;

  const createTask = async () => {
    updateLoading("global", true);
    const res = await fetchApi<Task>({
      table: "task",
      method: "POST",
      body: { ...task, userId: app.userId, categoryId: null },
    });
    updateLoading("global", false);

    if (!res) {
      alert("Failed to create task");
      return;
    }

    if (multiple) {
      setCreatedTasks((prev) => [...prev, res]);
      setTask({
        title: "",
        description: "",
        projectId: task.projectId,
      });
      return;
    }

    if (task.projectId) {
      window.location.href = `/project/${task.projectId}`;
    }

    setTask({
      title: "",
      description: "",
      projectId: null,
    });
  };

  if (loading) return <Loader />;

  return (
    <Container className={styles.container}>
      <h1>Create Task</h1>
      <Field
        label="title"
        required
        onChange={(p) => updateTask("title", p)}
        value={task.title}
      />
      <Field
        label="description"
        onChange={(p) => updateTask("description", p)}
        type={FormOptionType.TEXTAREA}
        value={task.description}
      />
      <Select
        label="Project"
        alwaysShowLabel
        options={mapProjectsToOptions(projects, true)}
        onValueChange={(s) => updateTask("projectId", s)}
        value={task.projectId ?? undefined}
        className={styles.select}
      />
      {validTask && <Button onClick={createTask}>Create Task</Button>}
      <Switch
        label="Create Multiple"
        checked={multiple}
        onCheckedChange={setMultiple}
      />
      {multiple && (
        <>
          <h2>Tasks Created:</h2>
          <ul>
            {createdTasks.map((createdTask) => (
              <li key={createdTask.id}>{createdTask.title}</li>
            ))}
          </ul>
        </>
      )}
    </Container>
  );
}

export default Page;
