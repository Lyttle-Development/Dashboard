import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Category, Project, TimeLog } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button, ButtonStyle } from "@/components/Button";
import { idToName } from "@/lib/discord";
import { getFinishedTimeLogs } from "@/lib/price/get-price";
import { Icon } from "@/components/Icon";
import {
  faFileInvoiceDollar,
  faPersonBreastfeeding,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { ChildProject } from "@/pages/project/[id]/components/ChildProject";
import { ProjectProject } from "@/pages/project/[id]/components/ProjectProject";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

function getTotalTimePerDayAndPerUser(
  timeLogs: TimeLog[],
): Map<string, Map<string, number>> {
  timeLogs = getFinishedTimeLogs(timeLogs);

  // Return a list of user ids and their total time worked summed up per day.
  const timePerDayAndPerUser = new Map<string, Map<string, number>>();
  for (const timeLog of timeLogs) {
    const date = new Date(timeLog.startTime).toDateString();
    const user = idToName(timeLog.user);
    if (!timePerDayAndPerUser.has(date)) {
      timePerDayAndPerUser.set(date, new Map());
    }
    const userTime = timePerDayAndPerUser.get(date);
    if (!userTime.has(user)) {
      userTime.set(user, 0);
    }
    const duration =
      new Date(timeLog.endTime).getTime() -
      new Date(timeLog.startTime).getTime();
    userTime.set(user, userTime.get(user) + duration);
  }

  return timePerDayAndPerUser;
}

export function Page() {
  usePageTitle({ title: "Project Details" });
  const router = useRouter();

  const [project, setProject] = useState<Project>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchProject = useCallback(
    async (projectId: string, noReload: boolean = false) => {
      if (!noReload) setLoading(true);
      try {
        const projectData = await fetchApi<Project>({
          table: "project",
          id: projectId,
          method: "GET",
          relations: {
            timeLogs: true,
            customer: true,
            price: true,
            childProjects: true,
            tasks: true,
          },
        });

        if (!projectData) {
          throw new Error("Project not found");
        }

        projectData.price.category = await fetchApi<Category>({
          table: "category",
          id: projectData.price.categoryId,
          method: "GET",
        });

        projectData.timeLogs = projectData.timeLogs.sort((a, b) => {
          return (
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
        });

        setProject(projectData);
      } catch (err) {
        setProject(null);
      }
      if (!noReload) setLoading(false);
    },
    [],
  );

  const fetchProjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const projectId = router.query.id as string;
    if (projectId) {
      void fetchProject(projectId);
    }
    void fetchProjects();
  }, []);

  const deleteProject = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await fetchApi<Project>({
        table: "project",
        id: project.id,
        method: "DELETE",
      });
      void router.push(LINKS.project.root);
    }
  };

  if (loading) return <Loader />;
  if (!project) return <div>Project not found</div>;

  const timeLogsGrouped = getTotalTimePerDayAndPerUser(project.timeLogs);
  const activeTimeLogs = getFinishedTimeLogs(project.timeLogs, true);

  return (
    <Container>
      <h2 className={styles.project_title}>
        <span>Project: {project.name}</span>
        <article className={styles.project_actions}>
          {project.parentProjectId && (
            <Button onClick={() => fetchProject(project.parentProjectId)}>
              <Icon icon={faPersonBreastfeeding} />
              Open Parent Project
            </Button>
          )}
          <Button href={LINKS.invoice.create.project(project.id)}>
            <Icon icon={faFileInvoiceDollar} />
            Create invoice
          </Button>
          <Button onClick={deleteProject} style={ButtonStyle.Danger}>
            <Icon icon={faTrashCan} />
            Delete Project
          </Button>
        </article>
      </h2>
      {project?.price?.category?.name !== "PROJECT" ? (
        <ChildProject
          project={project}
          fetchProject={fetchProject}
          activeTimeLogs={activeTimeLogs}
          timeLogsGrouped={timeLogsGrouped}
          projects={projects}
        />
      ) : (
        <ProjectProject project={project} fetchProject={fetchProject} />
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
