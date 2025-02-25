import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Category, Project } from "@/lib/prisma";
import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { FormOptionType } from "@/components/Form";

interface updatePrice {
  categoryId: string | null;
  service: string | null;
  price: number | null;
}

function Page() {
  const [loadings, setLoading] = useState({
    categories: true,
    projects: true,
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
  const [task, setTask] = useState<{
    title: string;
    description: string;
    categoryId: number | null;
    projectId: number | null;
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
    const res = await fetchApi({
      table: "task",
      method: "POST",
      body: task,
    });

    if (!res) {
      alert("Failed to create task");
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
      <Field label="title" required onChange={(p) => updateTask("title", p)} />
      <Field
        label="description"
        onChange={(p) => updateTask("description", p)}
        type={FormOptionType.TEXTAREA}
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
        />
      )}
      {!task.categoryId && (
        <Select
          label="Project"
          alwaysShowLabel
          options={projects.map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          onValueChange={(s) => updateTask("projectId", s)}
        />
      )}
      {validTask && <Button onClick={createTask}>Create Task</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
