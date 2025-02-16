import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Select, SelectItemProps } from "@/components/Select";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Container } from "@/components/Container";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Project } from "@/lib/prisma";

function mapProjectsToOptions(projects: any[]): SelectItemProps[] {
  // Sort projects by creation date
  projects.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return projects.map((project) => {
    return {
      value: project.id,
      children: project.name,
    } as SelectItemProps;
  });
}

export function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const projectsData = await fetchApi<Project[]>({
      table: "project",
      where: { invoiceId: null },
    });
    setProjects(projectsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  if (loading) return <Loader />;
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
