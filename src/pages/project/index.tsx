import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faCalendarPlus,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Select, SelectItemProps } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Project } from "@/lib/prisma";

export function mapProjectsToOptions(projects: any[]): SelectItemProps[] {
  const getParentProjectName = (id: string, str: string = ""): string => {
    const parentProject = projects.find(
      (project: Project) => project.id === id,
    );

    str = parentProject.name + " > " + str;
    if (parentProject.parentProjectId) {
      return getParentProjectName(parentProject.parentProjectId, str);
    }

    return str;
  };

  return projects
    .filter((p) => p.parentProjectId)
    .map((project: Project) => {
      return {
        value: project.id,
        children: project.parentProjectId
          ? getParentProjectName(project.parentProjectId) + project.name
          : project.name,
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
      where: {
        invoiceId: null,
      },
      relations: {
        timeLogs: true,
      },
    });

    console.log(projectsData);
    // Oder projectdata by the newest TimeLog first
    const data = projectsData?.sort((a, b) => {
      // find newest timeLog
      const newestTimeLogA = a.timeLogs.reduce((acc, cur) => {
        const curTime = new Date(cur.startTime)?.getTime() ?? 0;
        return acc < curTime ? curTime : acc;
      }, 0);
      const newestTimeLogB = b.timeLogs.reduce((acc, cur) => {
        const curTime = new Date(cur.startTime)?.getTime() ?? 0;
        return acc < curTime ? curTime : acc;
      }, 0);
      return newestTimeLogB - newestTimeLogA;
    });
    setProjects(data ?? []);
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
        icon={faMagnifyingGlass}
        options={mapProjectsToOptions(projects)}
        onValueChange={(projectId) => router.push(`/project/${projectId}`)}
      />
      <Button href="/project/create">
        <Icon icon={faCalendarPlus}>Create Project</Icon>
      </Button>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
