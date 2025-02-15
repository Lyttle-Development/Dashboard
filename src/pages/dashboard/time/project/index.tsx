import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Select, SelectItemProps } from "../../../../components/Select";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Container } from "@/components/Container";

async function fetchApi(
  action: string,
  url: string,
  setResult: (result: any) => void,
  setLoading: (loading: boolean) => void,
  body?: object,
) {
  setLoading(true);
  try {
    const res = await fetch(url, {
      method: action,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    const resJson = await res.json();
    setResult(resJson || null);
  } catch (err) {
    setResult(null);
  }
  setLoading(false);
}

function mapProjectsToOptions(projects: any[]): SelectItemProps[] {
  // Sort projects by creation date
  projects.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return projects.map((project) => {
    const createDate = new Date(project.createdAt);
    const updateDate = new Date(project.updatedAt);
    // Format like "2021-10-01:2021-10-02"
    const formattedCreateDate = createDate.toISOString().split("T")[0];
    const formattedUpdateDate = updateDate.toISOString().split("T")[0];
    const formattedDate = `${formattedCreateDate}:${formattedUpdateDate}`;

    return {
      value: project.id,
      children: `[${formattedDate}]: ${project.name}`,
    } as SelectItemProps;
  });
}

export function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const fetchProjects = useCallback(async () => {
    await fetchApi(
      "GET",
      '/api/project?where={"invoiceId": null}',
      setProjects,
      setLoading,
    );
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  if (loading) return <div>Loading...</div>;
  if (!projects.length) return <div>No projects found</div>;

  return (
    <Container>
      <h2 className={styles.heading}>Select a Project</h2>
      <Select
        label="Select Project"
        options={mapProjectsToOptions(projects)}
        onValueChange={(projectId) => {
          router.push(`/dashboard/time/project/${projectId}`);
        }}
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
