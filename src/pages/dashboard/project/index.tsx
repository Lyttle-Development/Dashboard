import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { Select, SelectItemProps } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
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
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const projectsData = await fetchApi<Project[]>({
      table: "project",
      where: { invoiceId: null },
      orderBy: { updatedAT: "desc" },
    });
    setProjects(projectsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  if (loading) return <Loader />;
  if (!projects?.length) return <div>No projects found</div>;

  return (
    <Container>
      <h1>Projects</h1>
      <Select
        label="Select Project"
        options={mapProjectsToOptions(projects)}
        onValueChange={(projectId) =>
          router.push(`/dashboard/project/${projectId}`)
        }
      />
      <Button href="/dashboard/project/create">
        <Icon icon={faCalendarPlus}>Create Project</Icon>
      </Button>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
