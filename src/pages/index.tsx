import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useCallback, useEffect, useState } from "react";
import { Category, Project, TimeLog } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Loader } from "@/components/Loader";

import styles from "./index.module.scss";
import { useApp } from "@/contexts/App.context";
import Link from "next/link";
import { AvatarCard } from "@/components/AvatarCard";

function Page() {
  const app = useApp();
  const [loadings, _setLoading] = useState<{ [key: string]: boolean }>({
    projects: false,
    timeLogs: false,
    categories: false,
  });
  const setLoading = (key: string, value: boolean) => {
    _setLoading((prev) => ({ ...prev, [key]: value }));
  };
  const loading = Object.values(loadings).some((loading) => loading);

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchTimeLogs = useCallback(async () => {
    setLoading("projects", true);
    const timeLogData = await fetchApi<TimeLog[]>({
      table: "time-log",
      where: { endTime: null },
      relations: {
        project: true,
      },
    });

    setTimeLogs(timeLogData ?? []);
    setLoading("projects", false);
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading("projects", true);
    const projectData = await fetchApi<Project[]>({
      table: "project",
      relations: {
        price: true,
        timeLogs: true,
        tasks: true,
      },
    });

    setProjects(projectData ?? []);
    setLoading("projects", false);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading("categories", true);
    const categoryData = await fetchApi<Category[]>({
      table: "category",
    });

    setCategories(categoryData ?? []);
    setLoading("categories", false);
  }, []);

  useEffect(() => {
    void fetchTimeLogs();
    void fetchProjects();
    void fetchCategories();
  }, []);

  // Group by category, category can be found inside the price object
  const groupedTimeLogs = [];
  for (const timeLog of timeLogs) {
    const category = categories.find(
      (category) =>
        projects.find((project) => project.id === timeLog.projectId)?.price
          .categoryId === category.id,
    );
    if (!category) continue;

    if (!groupedTimeLogs[category.name]) {
      groupedTimeLogs[category.name] = [];
    }
    groupedTimeLogs[category.name].push(timeLog);
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <Container className={styles.container}>
      <h1>Activity:</h1>

      <section>
        <h2>Invoices to create:</h2>
        <p>Projects inactive for 30 days should be closed and invoiced.</p>
      </section>

      <section>
        <h2>Open Projects:</h2>
        <p>Projects with open tasks</p>
        <ul>
          {projects
            .filter(
              (project) => project.tasks.filter((t) => !t.done).length > 0,
            )
            .map((project) => (
              <li key={project.id}>
                <Link href={`/project/${project.id}`}>{project.name}</Link>
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2>Active Time Logs:</h2>
        <p>Time logs currently running</p>
        <ul className={styles.active_logs}>
          {Object.entries(groupedTimeLogs).map(([categoryName, timeLogs]) => (
            <li key={categoryName} className={styles.active_logs__group}>
              <h5>{categoryName}</h5>
              <ul className={styles.active_logs__group__projects}>
                {timeLogs.map((timeLog) => {
                  const project = projects.find(
                    (project) => project.id === timeLog.projectId,
                  );
                  return (
                    <li
                      key={timeLog.id}
                      className={styles.active_logs__group__project}
                      title={
                        timeLog.user !== app.userId
                          ? "This time log is not yours"
                          : ""
                      }
                    >
                      <Link href={`/project/${project.id}`}>
                        <AvatarCard userId={timeLog.user}>
                          <span className={styles.working_on}>
                            Working on:{" "}
                          </span>
                          <span>{timeLog.project.name}</span>
                        </AvatarCard>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          {Object.entries(groupedTimeLogs).length === 0 && (
            <li>No active time logs</li>
          )}
        </ul>
      </section>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
