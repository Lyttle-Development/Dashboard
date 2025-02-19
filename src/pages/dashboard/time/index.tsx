import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Select, SelectItemProps } from "@/components/Select";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Container } from "@/components/Container";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { PrintJob, Project } from "@/lib/prisma";

function mapToOptions(items: any[]): SelectItemProps[] {
  return items.map((project) => {
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
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const projectsData = await fetchApi<Project[]>({
      table: "project",
      where: { invoiceId: null },
      orderBy: { updatedAt: "desc" },
    });
    setProjects(projectsData ?? []);
    setLoading(false);
  }, []);

  const fetchPrintJobs = useCallback(async () => {
    setLoading(true);
    const projectsData = await fetchApi<PrintJob[]>({
      table: "printJob",
      where: { invoiceId: null },
      orderBy: { updatedAt: "desc" },
    });
    setPrintJobs(projectsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProjects();
    void fetchPrintJobs();
  }, [fetchProjects]);

  if (loading) return <Loader />;
  if (!projects.length) return <div>No projects found</div>;

  return (
    <Container>
      <h2 className={styles.heading}>Select a Project</h2>
      <Select
        label="Select Project"
        options={mapToOptions(projects)}
        onValueChange={(projectId) => {
          router.push(`/dashboard/time/project/${projectId}`);
        }}
      />
      <Select
        label="Select Print Job"
        options={mapToOptions(printJobs)}
        onValueChange={(projectId) => {
          router.push(`/dashboard/time/print/${projectId}`);
        }}
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
