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
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { ActiveTimeLogs } from "@/components/ActiveTimeLogs";

function Page() {
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
      router.push("/mobile/task");
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
      <h1>Activity:</h1>

      {app.isManager &&
        (invoicesToCreateProjects?.length > 0 ||
          invoicesToCreatePrintJobs?.length > 0) && (
          <section>
            <h2>Invoices to create:</h2>
            <p>Projects inactive for 30 days should be closed and invoiced.</p>
            <ul className={styles.invoices}>
              {invoicesToCreateProjects?.length > 0 &&
                invoicesToCreateProjects.map((project) => (
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
              {invoicesToCreatePrintJobs?.length > 0 &&
                invoicesToCreatePrintJobs?.map((printJob) => (
                  <li key={printJob.id} className={styles.invoice}>
                    <Link href={`/invoice/create/print/${printJob.id}`}>
                      <h6>
                        <strong>Name: </strong>
                        {printJob.name}
                      </h6>
                      <p>
                        <strong>Last active: </strong>
                        {new Date(
                          findNewestTimeLog(printJob.timeLogs).startTime,
                        ).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}

      <ActiveTimeLogs projectIds={openProjects.map((p) => p.id)} />

      {app.isAdmin && openPrintJobs?.length > 0 && (
        <section>
          <h2>Open PrintJobs:</h2>
          <p>Print Jobs not marked as completed.</p>
          <ul className={styles.print_jobs}>
            {openPrintJobs.map((printJob) => (
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

      {(app.isOperationsManager || app.isManager) &&
        objectGroupedExpenses?.length > 0 && (
          <section>
            <h2>Open Expenses:</h2>
            <p>
              Expenses that are not closed should be reviewed and closed if
              necessary.
            </p>
            <ul className={styles.expenses_grouped}>
              {objectGroupedExpenses?.map(
                ([group, expenses]) =>
                  expenses?.length > 0 &&
                  canSeeExpenseCategory(group) && (
                    <>
                      <h5>{capitalizeWords(group)}:</h5>
                      <ul className={styles.expenses_group}>
                        {expenses?.map((expense) => (
                          <li key={expense.id} className={styles.expense}>
                            <Link href={`/expense/${expense.id}`}>
                              <h6>
                                <strong>Name: </strong>
                                {expense.name}
                                {expense.recurring && (
                                  <Icon
                                    icon={faRotateLeft}
                                    className={styles.recurring_icon}
                                  />
                                )}
                              </h6>
                              <p>
                                <strong>Status: </strong>
                                {capitalizeWords(expense.status.status)}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ),
              )}
            </ul>
          </section>
        )}

      {openProjects && (
        <section>
          <h2>Open Projects:</h2>
          <p>Projects with open tasks</p>
          <ul className={styles.projects}>
            {openProjects.map((project) => (
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
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
