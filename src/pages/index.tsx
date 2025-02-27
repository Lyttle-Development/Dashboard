import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useCallback, useEffect, useState } from "react";
import { Category, PrintJob, Project, TimeLog } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Loader } from "@/components/Loader";

import styles from "./index.module.scss";
import { useApp } from "@/contexts/App.context";
import Link from "next/link";
import { AvatarCard } from "@/components/AvatarCard";
import { getProjectFullName } from "@/lib/project";
import { findNewestTimeLog } from "@/lib/project/find-newest-time-log";

function Page() {
  const app = useApp();
  const [loadings, _setLoading] = useState<{ [key: string]: boolean }>({
    timeLogs: false,
    projects: false,
    printJobs: false,
    categories: false,
  });
  const setLoading = (key: string, value: boolean) => {
    _setLoading((prev) => ({ ...prev, [key]: value }));
  };
  const loading = Object.values(loadings).some((loading) => loading);

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
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

  const fetchPrintJobs = useCallback(async () => {
    setLoading("printJobs", true);
    const printJobData = await fetchApi<PrintJob[]>({
      table: "print-job",
      relations: {
        timeLogs: true,
      },
    });

    setPrintJobs(printJobData ?? []);
    setLoading("printJobs", false);
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
    void fetchPrintJobs();
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

  const invoicesToCreate = projects.filter((project) => {
    const lastTimeLog = findNewestTimeLog(project.timeLogs);
    if (!lastTimeLog) return false;
    const lastTimeLogDate = new Date(lastTimeLog.startTime);
    const now = new Date();
    return (
      // Only get time logs that have no active time logs in the last 30 days
      lastTimeLogDate.getTime() + 30 * 24 * 60 * 60 * 1000 < now.getTime()
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <Container className={styles.container}>
      <h1>Activity:</h1>

      {app.isManager && invoicesToCreate && invoicesToCreate.length > 0 && (
        <section>
          <h2>Invoices to create:</h2>
          <p>Projects inactive for 30 days should be closed and invoiced.</p>
          <ul className={styles.invoices}>
            {invoicesToCreate.map((project) => (
              <li key={project.id} className={styles.invoice}>
                <Link href={`/invoice/create/project/${project.id}`}>
                  <h6>
                    <strong>Name: </strong>
                    {getProjectFullName(project, projects)}
                  </h6>
                  <p>
                    <strong>Last active: </strong>
                    {new Date(
                      findNewestTimeLog(project.timeLogs).startTime,
                    ).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {Object.entries(groupedTimeLogs).length > 0 && (
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
                            <span>{getProjectFullName(project, projects)}</span>
                          </AvatarCard>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {app.isAdmin && (
        <section>
          <h2>Open PrintJobs:</h2>
          <p>Print Jobs not started.</p>
          <ul className={styles.print_jobs}>
            {printJobs
              .filter((printJob) => printJob.timeLogs.length === 0)
              .map((printJob) => (
                <li key={printJob.id} className={styles.print_job}>
                  <Link href={`/print/${printJob.id}`}>
                    <h6>
                      <strong>Title: </strong>
                      {printJob.name}
                    </h6>
                    <p>
                      <strong>Amount to print: </strong>
                      {printJob.quantity}
                    </p>
                  </Link>
                </li>
              ))}
            {printJobs.filter((printJob) => printJob.timeLogs.length === 0)
              .length === 0 && <li>No open print jobs</li>}
          </ul>
        </section>
      )}

      <section>
        <h2>Open Projects:</h2>
        <p>Projects with open tasks</p>
        <ul className={styles.projects}>
          {projects
            .filter(
              (project) => project.tasks.filter((t) => !t.done).length > 0,
            )
            .map((project) => (
              <li key={project.id} className={styles.project}>
                <Link href={`/project/${project.id}`}>
                  <h6>
                    <strong>Name: </strong>
                    {getProjectFullName(project, projects)}
                  </h6>
                  <p>
                    <strong>Open Task(s): </strong>
                    {project.tasks.filter((t) => !t.done).length}
                  </p>
                </Link>
              </li>
            ))}
          {projects.filter((project) => project.tasks.length === 0).length ===
            0 && <li>No open projects</li>}
        </ul>
      </section>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
