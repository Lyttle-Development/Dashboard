import { Select, SelectItemProps } from "@/components/select";
import { useCallback, useEffect, useState } from "react";

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
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    const resJson = await res.json();
    setResult(resJson || null);
  } catch (err) {
    setResult(null);
  }
  setLoading(false);
}

export function ProjectsSelect() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [timeLog, setTimeLog] = useState<{ id }>(null);

  const reset = () => {
    setProjects([]);
    setSelectedProject(null);
    setTimeLog(null);
  };

  // Wrap fetchData in useCallback to avoid dependency warnings.
  const fetchProjects = useCallback(
    async () =>
      fetchApi(
        "GET",
        '/api/project?where={"invoiceId": null}',
        setProjects,
        setLoading,
      ),
    [],
  );

  // Wrap fetchData in useCallback to avoid dependency warnings.
  const fetchEmptyTimeLog = useCallback(
    async (projectId) =>
      fetchApi(
        "GET",
        `/api/time-log?where={"projectId": "${projectId}", "endTime":null}`,
        (res) => (res ? setTimeLog(res[0]) : setTimeLog(null)),
        setLoading,
      ),
    [],
  );

  const startTimeLog = useCallback(async (projectId) => {
    fetchApi("POST", `/api/time-log`, setTimeLog, setLoading, {
      projectId: projectId,
      startTime: new Date().toISOString(),
    });
    reset();
  }, []);

  const endTimeLog = useCallback(async (timeLogId) => {
    fetchApi("PUT", `/api/time-log/${timeLogId}`, setTimeLog, setLoading, {
      endTime: new Date().toISOString(),
    });
    reset();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      void fetchEmptyTimeLog(selectedProject);
      return;
    }
    void fetchProjects();
  }, [selectedProject]);

  // Reset all on unload
  useEffect(() => {
    return reset;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2>Reporting Project Time</h2>
      {!selectedProject && projects.length > 0 && (
        <Select
          label="Select Project"
          options={mapProjectsToOptions(projects)}
          onValueChange={setSelectedProject}
        />
      )}
      {!selectedProject && projects.length === 0 && (
        <div>
          <h3>No projects found</h3>
        </div>
      )}
      {selectedProject && (
        <div>
          <h3>Selected Project</h3>
          <p>
            {projects.find((project) => (project.id = selectedProject)).name}
          </p>
        </div>
      )}
      {selectedProject && timeLog && (
        <div>
          <h3>Time Log</h3>
          <button onClick={() => endTimeLog(timeLog.id)}>End Time Log</button>
        </div>
      )}
      {selectedProject && !timeLog && (
        <div>
          <h3>Time Log</h3>
          <button onClick={() => startTimeLog(selectedProject)}>
            Start Time Log
          </button>
        </div>
      )}
    </>
  );
}

const mapProjectsToOptions = (projects: any[]) => {
  projects.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return projects.map((project) => {
    const createDate = new Date(project.createdAt);
    const updateDate = new Date(project.updatedAt);

    // format like "2021-10-01"
    const formattedCreateDate = createDate.toISOString().split("T")[0];
    const formattedUpdateDate = updateDate.toISOString().split("T")[0];

    const formattedDate = `${formattedCreateDate}:${formattedUpdateDate}`;

    return {
      value: project.id,
      children: `[${formattedDate}]: ${project.name}`,
    } as SelectItemProps;
  });
};
