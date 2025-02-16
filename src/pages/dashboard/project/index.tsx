import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { Select, SelectItemProps } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";

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
    return {
      value: project.id,
      children: project.name,
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

  if (loading) return <Loader />;
  if (!projects?.length) return <div>No projects found</div>;

  return (
    <Container>
      <h1>Projects</h1>
      <Button href="/dashboard/project/create">
        <Icon icon={faCalendarPlus}>Create Project</Icon>
      </Button>
      <Select
        label="Select Project"
        options={mapProjectsToOptions(projects)}
        onValueChange={(projectId) =>
          router.push(`/dashboard/project/${projectId}`)
        }
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
