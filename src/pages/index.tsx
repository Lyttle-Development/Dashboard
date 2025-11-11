import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { useCallback, useEffect, useState } from "react";
import { Expense, ExpenseStatusEnum, PrintJob, Project } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Loader } from "@/components/Loader";

import styles from "./index.module.scss";
import { useApp } from "@/contexts/App.context";
import Link from "next/link";
import { getProjectFullName } from "@/lib/project";
import { findNewestTimeLog } from "@/lib/project/find-newest-time-log";
import { useMobile } from "@/hooks/useMobile";
import { router } from "next/client";
import { groupArrayBy, sortGroupedListBy } from "@/lib/array";
import { capitalizeWords } from "@/lib/format/string";
import { Icon } from "@/components/Icon";
import {
  faRotateLeft,
  faFileInvoice,
  faDiagramProject,
  faPrint,
  faMoneyBill,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { ActiveTimeLogs } from "@/components/ActiveTimeLogs";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button, ButtonStyle } from "@/components/Button";

function Page() {
  usePageTitle({ title: "Home" });
  const mobile = useMobile();
  const app = useApp();
  const [loadings, _setLoading] = useState<{ [key: string]: boolean }>({
    projects: false,
    printJobs: false,
    expenses: false,
  });
  const setLoading = (key: string, value: boolean) => {
    _setLoading((prev) => ({ ...prev, [key]: value }));
  };
  const loading = Object.values(loadings).some((loading) => loading);

  const [projects, setProjects] = useState<Project[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

    // Sort by newest task and then time log
    projectData?.sort((a, b) => {
      const hasTasksOrLogs = (item: any) =>
        item.tasks.length > 0 || item.timeLogs.length > 0;

      // If one has data and the other doesn't, push the one with no data to the end
      if (hasTasksOrLogs(a) && !hasTasksOrLogs(b)) return -1;
      if (!hasTasksOrLogs(a) && hasTasksOrLogs(b)) return 1;
      if (!hasTasksOrLogs(a) && !hasTasksOrLogs(b)) return 0; // both have no data

      const aNewestTask = a.tasks.reduce((prev, curr) => {
        return prev.updatedAt > curr.updatedAt ? prev : curr;
      }, a.tasks[0]);

      const bNewestTask = b.tasks.reduce((prev, curr) => {
        return prev.updatedAt > curr.updatedAt ? prev : curr;
      }, b.tasks[0]);

      const aNewestTimeLog = findNewestTimeLog(a.timeLogs);
      const bNewestTimeLog = findNewestTimeLog(b.timeLogs);

      const aTime = new Date(
        aNewestTask?.updatedAt ?? aNewestTask?.createdAt,
      ).getTime();
      const bTime = new Date(
        bNewestTask?.updatedAt ?? bNewestTask?.createdAt,
      ).getTime();

      if (aTime !== bTime) {
        return bTime - aTime;
      }

      return (
        new Date(bNewestTimeLog?.startTime).getTime() -
        new Date(aNewestTimeLog?.startTime).getTime()
      );
    });

    setProjects(projectData ?? []);
    setLoading("projects", false);
  }, []);

  const fetchPrintJobs = useCallback(async () => {
    setLoading("printJobs", true);
    const printJobData = await fetchApi<PrintJob[]>({
      table: "print-job",
      where: {
        invoiceId: null,
      },
      relations: {
        timeLogs: true,
      },
    });

    setPrintJobs(printJobData ?? []);
    setLoading("printJobs", false);
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading("expenses", true);
    const expenseData = await fetchApi<Expense[]>({
      table: "expense",
      where: {
        statusId: {
          not: ExpenseStatusEnum.CLOSED,
        },
      },
      relations: {
        status: true,
      },
    });

    setExpenses(expenseData ?? []);
    setLoading("expenses", false);
  }, []);

  useEffect(() => {
    if (mobile.onMobile) {
      router.push(LINKS.mobile.task);
      return;
    }
    void fetchProjects();
    void fetchPrintJobs();
    void fetchExpenses();
  }, []);

  const groupedExpenses = groupArrayBy(expenses, (expense) => {
    if (
      expense.recurring &&
      ![ExpenseStatusEnum.CREATED, ExpenseStatusEnum.REQUESTED].includes(
        expense.statusId,
      )
    )
      return "Recurring";
    if (expense.approved) return "Approved";
    if (expense.statusId == ExpenseStatusEnum.CREATED) return "Created";
    return "Requested";
  });
  const objectGroupedExpenses = Object.entries(
    sortGroupedListBy(groupedExpenses, [
      "Created",
      "Recurring",
      "Requested",
      "Approved",
    ]),
  );

  const invoicesToCreateProjects = projects.filter((project) => {
    // Check if the project has time logs
    if (project.timeLogs.length === 0) return false;
    // Filter out projects that have tasks
    if (project.tasks.filter((t) => !t.done).length != 0) return false;
    // Check if the project has an invoice
    if (project.invoiceId) return false;

    // Get the last time log
    const lastTimeLog = findNewestTimeLog(project.timeLogs);
    if (!lastTimeLog) return false;

    // Check if the last time log is older than 30 days
    const lastTimeLogDate = new Date(lastTimeLog.startTime);
    const now = new Date();
    return (
      // Only get time logs that have no active time logs in the last 30 days
      lastTimeLogDate.getTime() + 30 * 24 * 60 * 60 * 1000 < now.getTime()
    );
  });

  const invoicesToCreatePrintJobs = printJobs.filter((printJob) => {
    return printJob.completed;
  });

  const openPrintJobs = printJobs.filter((printJob) => !printJob.completed);

  const openProjects = projects.filter(
    (project) => project.tasks.filter((t) => !t.done).length > 0,
  );

  if (loading) {
    return <Loader />;
  }

  const canSeeExpenseCategory = (group: string) => {
    if (app.isOperationsManager) {
      return ["Recurring", "Approved", "Requested"].includes(group);
    }
    if (app.isManager) {
      return ["Created", "Requested"].includes(group);
    }
    return false;
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p className={styles.subtitle}>
          Welcome back! Here&apos;s what needs your attention.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        {app.isManager && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon icon={faFileInvoice} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {invoicesToCreateProjects.length + invoicesToCreatePrintJobs.length}
              </div>
              <div className={styles.statLabel}>Invoices to Create</div>
            </div>
          </div>
        )}

        {!app.isOperationsManager && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon icon={faDiagramProject} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{openProjects.length}</div>
              <div className={styles.statLabel}>Open Projects</div>
            </div>
          </div>
        )}

        {app.isAdmin && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon icon={faPrint} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{openPrintJobs.length}</div>
              <div className={styles.statLabel}>Open Print Jobs</div>
            </div>
          </div>
        )}

        {(app.isOperationsManager || app.isManager) && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon icon={faMoneyBill} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{expenses.length}</div>
              <div className={styles.statLabel}>Open Expenses</div>
            </div>
          </div>
        )}
      </div>

      <ActiveTimeLogs projectIds={openProjects.map((p) => p.id)} />

      {/* Invoices to Create Section */}
      {app.isManager &&
        (invoicesToCreateProjects?.length > 0 ||
          invoicesToCreatePrintJobs?.length > 0) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>
                  <Icon icon={faFileInvoice} /> Invoices to Create
                </h2>
                <p className={styles.sectionDescription}>
                  Projects and print jobs inactive for 30+ days that need
                  invoicing
                </p>
              </div>
            </div>
            <div className={styles.cardGrid}>
              {invoicesToCreateProjects?.map((project) => (
                <div key={project.id} className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Icon icon={faDiagramProject} />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {getProjectFullName(project, projects)}
                    </h3>
                    <div className={styles.cardMeta}>
                      <Icon icon={faClock} />
                      <span>
                        Last active:{" "}
                        {new Date(
                          findNewestTimeLog(project.timeLogs).startTime
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardAction}>
                    <Link href={LINKS.invoice.create.project(project.id)}>
                      <Button variant="primary">Create Invoice</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {invoicesToCreatePrintJobs?.map((printJob) => (
                <div key={printJob.id} className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Icon icon={faPrint} />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{printJob.name}</h3>
                    <div className={styles.cardMeta}>
                      <Icon icon={faClock} />
                      <span>
                        Last active:{" "}
                        {new Date(
                          findNewestTimeLog(printJob.timeLogs).startTime
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardAction}>
                    <Link href={LINKS.invoice.create.print(printJob.id)}>
                      <Button variant="primary">Create Invoice</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Open Print Jobs Section */}
      {app.isAdmin && openPrintJobs?.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                <Icon icon={faPrint} /> Open Print Jobs
              </h2>
              <p className={styles.sectionDescription}>
                Print jobs not yet marked as completed
              </p>
            </div>
          </div>
          <div className={styles.cardGrid}>
            {openPrintJobs.map((printJob) => (
              <Link
                key={printJob.id}
                href={LINKS.print.detail(printJob.id)}
                className={styles.card}
              >
                <div className={styles.cardIcon}>
                  <Icon icon={faPrint} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{printJob.name}</h3>
                  <div className={styles.cardMeta}>
                    <span>Quantity: {printJob.quantity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Open Projects Section */}
      {!app.isOperationsManager && openProjects?.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                <Icon icon={faDiagramProject} /> Open Projects
              </h2>
              <p className={styles.sectionDescription}>
                Projects with active tasks requiring attention
              </p>
            </div>
          </div>
          <div className={styles.cardGrid}>
            {openProjects.map((project) => (
              <Link
                key={project.id}
                href={LINKS.project.detail(project.id)}
                className={styles.card}
              >
                <div className={styles.cardIcon}>
                  <Icon icon={faDiagramProject} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    {getProjectFullName(project, projects)}
                  </h3>
                  <div className={styles.cardMeta}>
                    <span>
                      {project.tasks.filter((t) => !t.done).length} open task
                      {project.tasks.filter((t) => !t.done).length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Open Expenses Section */}
      {(app.isOperationsManager || app.isManager) &&
        objectGroupedExpenses?.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>
                  <Icon icon={faMoneyBill} /> Open Expenses
                </h2>
                <p className={styles.sectionDescription}>
                  Expenses pending review or approval
                </p>
              </div>
            </div>
            {objectGroupedExpenses.map(
              ([group, expenses]) =>
                expenses?.length > 0 &&
                canSeeExpenseCategory(group) && (
                  <div key={group} className={styles.expenseGroup}>
                    <h3 className={styles.expenseGroupTitle}>
                      {capitalizeWords(group)}
                    </h3>
                    <div className={styles.cardGrid}>
                      {expenses.map((expense) => (
                        <Link
                          key={expense.id}
                          href={LINKS.expense.detail(expense.id)}
                          className={styles.card}
                        >
                          <div className={styles.cardIcon}>
                            <Icon icon={faMoneyBill} />
                          </div>
                          <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>
                              {expense.name}
                              {expense.recurring && (
                                <Icon
                                  icon={faRotateLeft}
                                  className={styles.recurringIcon}
                                />
                              )}
                            </h3>
                            <div className={styles.cardMeta}>
                              <span>
                                Status: {capitalizeWords(expense.status.status)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
            )}
          </section>
        )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
