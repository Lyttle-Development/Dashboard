import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faDiagramProject,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Project } from "@/lib/prisma";
import { SideToSide } from "@/components/SideToSide";
import { mapProjectsToOptions } from "@/lib/project";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Projects" });
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
      <SideToSide>
        <Select
          label="Select Project"
          icon={faMagnifyingGlass}
          options={mapProjectsToOptions(projects, true)}
          onValueChange={(projectId) =>
            router.push(LINKS.project.detail(projectId))
          }
          disabled={!(projects && projects.length)}
        />
        <Button href={LINKS.project.create}>
          <Icon icon={faDiagramProject}>Create Project</Icon>
        </Button>
      </SideToSide>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
