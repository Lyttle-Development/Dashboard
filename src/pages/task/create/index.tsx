import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Category, Project, Task } from "@/lib/prisma";
import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button, ButtonStyle } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { FormOptionType } from "@/components/Form";
import { Switch } from "@/components/Switch";
import { useApp } from "@/contexts/App.context";
import { mapProjectsToOptions } from "@/lib/project";
import { safeParseFieldString } from "@/lib/parse";
import styles from "./index.module.scss";
import { useRouter } from "next/router";
import { SideToSide } from "@/components/SideToSide";

function Page() {
  const app = useApp();
  const router = useRouter();
  const [loadings, setLoading] = useState({
    categories: true,
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [multiple, setMultiple] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<{
    title: string;
    description: string;
    categoryId: string | null;
    projectId: string | null;
  }>({
    title: "",
    description: "",
    categoryId: null,
    projectId: null,
  });

  const updateTask = (key: string, value: string | number) => {
    setTask((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchCategories = useCallback(async () => {
    updateLoading("categories", true);
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData ?? []);
    updateLoading("categories", false);
  }, []);

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
    void fetchCategories();
    void fetchProjects();
  }, [fetchCategories, fetchProjects]);

  const validTask = !!task.title && (!!task.categoryId || !!task.projectId);

  const createTask = async () => {
    if (!multiple) updateLoading("global", true);
    const res = await fetchApi<Task>({
      table: "task",
      method: "POST",
      body: { ...task, userId: app.userId },
    });

    if (!res) {
      alert("Failed to create task");
      updateLoading("global", false);
      return;
    }

    if (multiple) {
      setCreatedTasks((prev) => [...prev, res]);
      setTask({
        title: "",
        description: "",
        categoryId: task.categoryId,
        projectId: task.projectId,
      });
      return;
    }

    if (task.projectId) {
      await router.push(`/project/${task.projectId}`);
    } else {
      setTask({
        title: "",
        description: "",
        categoryId: null,
        projectId: null,
      });

      updateLoading("global", false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className={styles.container}>
      <h1>Create Task</h1>
      <Field
        label="title"
        required
        onChange={(p) => updateTask("title", safeParseFieldString(p))}
        value={task.title}
      />
      <Field
        label="description"
        onChange={(p) => updateTask("description", safeParseFieldString(p))}
        type={FormOptionType.TEXTAREA}
        value={task.description}
      />
      {!task.projectId && (
        <Select
          label="Category"
          options={categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          alwaysShowLabel
          onValueChange={(c) => updateTask("categoryId", c)}
          value={task.categoryId ?? undefined}
        />
      )}
      {!task.categoryId && (
        <SideToSide className={styles.project}>
          <div className={styles.flex_column}>
            <Select
              label="Project"
              alwaysShowLabel
              options={mapProjectsToOptions(projects, true)}
              onValueChange={(s) => updateTask("projectId", s)}
              value={task.projectId ?? undefined}
            />
          </div>
          <Button
            onClick={() => router.push(`/project/${task.projectId}`)}
            style={ButtonStyle.Primary}
          >
            Go to Project
          </Button>
        </SideToSide>
      )}
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

Page.getLayout = Layout.getDefault;

export default Page;
