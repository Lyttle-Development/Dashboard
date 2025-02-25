import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Category, Project, TimeLog } from "@/lib/prisma";
import { KeyValue } from "@/components/KeyValue";
import { fetchApi } from "@/lib/fetchApi";
import { Button, ButtonStyle } from "@/components/Button";
import { ProjectTimeLog } from "@/components/ProjectTimeLog";
import { idToName } from "@/lib/discord";
import {
  getFinishedTimeLogs,
  getPrice,
  getTotalFormattedHours,
  getTotalFormattedTimeLogsHours,
} from "@/lib/price/get-price";
import { Icon } from "@/components/Icon";
import {
  faFileInvoiceDollar,
  faPersonBreastfeeding,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function getTotalTimePerDayAndPerUser(timeLogs: TimeLog[]) {
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
  const router = useRouter();

  const [project, setProject] = useState<Project>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchProject = useCallback(async (projectId: string) => {
    setLoading(true);
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
    setLoading(false);
  }, []);

  useEffect(() => {
    const projectId = router.query.id as string;
    if (projectId) {
      void fetchProject(projectId);
    }
  }, []);

  const deleteProject = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await fetchApi<Project>({
        table: "project",
        id: project.id,
        method: "DELETE",
      });
      void router.push("/project");
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
          <Button href={`/invoice/create/project/${project.parentProjectId}`}>
            <Icon icon={faPersonBreastfeeding} />
            Open Parent Project
          </Button>
          <Button href={`/invoice/create/project/${project.id}`}>
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
        <>
          <article>
            <KeyValue
              label="Customer"
              value={`${project.customer.firstname} ${project.customer.lastname}`}
            />
            <KeyValue label="Category" value={project.price.category.name} />
            <KeyValue label="Service" value={project.price.service} />
            <KeyValue
              label="Calculated Price"
              value={getPrice(project.timeLogs, project.price.price)}
            />
          </article>
          <br />
          <h2>Time Logs</h2>
          <ProjectTimeLog
            projectId={project.id}
            reloadTimeLogs={fetchProject}
          />
          <article>
            <KeyValue
              label="Total Time"
              value={getTotalFormattedTimeLogsHours(project.timeLogs)}
            />
            <KeyValue label="Active Time Logs" value={activeTimeLogs.length} />
          </article>
          <br />
          <h5>Completed:</h5>
          <ul>
            {timeLogsGrouped.entries().map(([date, userTime]) => (
              <li key={date} className={styles.time_log_day}>
                <h6>{date}</h6>
                <ul>
                  {userTime.entries().map(([user, time]) => {
                    return (
                      <li key={user}>
                        <KeyValue
                          label={user}
                          value={getTotalFormattedHours(time)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2>Child Projects</h2>
          <ul className={styles.child_projects}>
            {project.childProjects.map((childProject) => (
              <li key={childProject.id}>
                <Button
                  href={`/project/${childProject.id}`}
                  onClick={() => fetchProject(childProject.id)}
                >
                  {childProject.name}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
