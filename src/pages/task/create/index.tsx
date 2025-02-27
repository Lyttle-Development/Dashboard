import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Category, Project, Task } from "@/lib/prisma";
import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { FormOptionType } from "@/components/Form";
import { Switch } from "@/components/Switch";
import { useApp } from "@/contexts/App.context";
import { mapProjectsToOptions } from "@/lib/project";

function Page() {
  const app = useApp();
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

  const validTask = task.title && (task.categoryId || task.projectId);

  const createTask = async () => {
    updateLoading("global", true);
    const res = await fetchApi<Task>({
      table: "task",
      method: "POST",
      body: { ...task, userId: app.userId },
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
        categoryId: task.categoryId,
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
      categoryId: null,
      projectId: null,
    });
  };

  if (loading) return <Loader />;

  return (
    <Container>
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
        <Select
          label="Project"
          alwaysShowLabel
          options={mapProjectsToOptions(projects)}
          onValueChange={(s) => updateTask("projectId", s)}
          value={task.projectId ?? undefined}
        />
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
