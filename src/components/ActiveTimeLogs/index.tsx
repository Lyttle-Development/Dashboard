import React, { useCallback, useEffect, useState } from "react";
import styles from "./index.module.scss";
import { capitalizeWords } from "@/lib/format/string";
import Link from "next/link";
import { AvatarCard } from "@/components/AvatarCard";
import { getProjectFullName } from "@/lib/project";
import { useApp } from "@/contexts/App.context";
import { fetchApi } from "@/lib/fetchApi";
import { Category, Project, TimeLog } from "@/lib/prisma";
import { groupArrayBy } from "@/lib/array";
import { KeyValue } from "@/components/KeyValue";
import {
  getTimeLogsTimeSpent,
  getTimeLogTimeSpent,
} from "@/lib/price/get-price";

interface ActiveTimeLogsProps {
  projectIds?: string[];
  lessInfo?: boolean;
}

export function ActiveTimeLogs({
  projectIds,
  lessInfo = false,
}: ActiveTimeLogsProps) {
  const app = useApp();
  const [loadings, _setLoading] = useState<{ [key: string]: boolean }>({
    timeLogs: false,
    projects: false,
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
      where: {
        projectId: {
          in: projectIds,
        },
      },
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
      where: {
        id: {
          in: projectIds,
        },
      },
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

  const groupedTimeLogs = groupArrayBy(
    timeLogs.filter((timeLog) => !timeLog.endTime),
    (timeLog) => {
      const project = projects.find(
        (project) => project.id === timeLog.projectId,
      );
      if (!project) return null;
      const category = categories.find(
        (category) => category.id === project.price.categoryId,
      );
      return category?.name ?? null;
    },
  );
  const runningTimeLogs = Object.entries(groupedTimeLogs);

  if (!runningTimeLogs.length) return null;

  return (
    <section>
      {!lessInfo && (
        <>
          <h2>Active Time Logs:</h2>
          <p>Time logs currently running</p>
        </>
      )}
      <ul className={styles.active_logs}>
        {runningTimeLogs.map(([categoryName, rTimeLogs]) => (
          <li key={categoryName} className={styles.active_logs__group}>
            {!lessInfo && <h5>{capitalizeWords(categoryName)}</h5>}
            <ul className={styles.active_logs__group__projects}>
              {rTimeLogs.map((timeLog) => {
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
                        <KeyValue
                          label="Working On"
                          value={getProjectFullName(project, projects)}
                        />
                        <KeyValue
                          label="Time Spent"
                          value={`${getTimeLogTimeSpent(timeLog)} / ${getTimeLogsTimeSpent(
                            timeLogs.filter((t) => {
                              // Get today's time logs
                              const today = new Date();
                              const startTime = new Date(t.startTime);
                              // YYYY-MM-DD
                              const startDate = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, "0")}-${String(startTime.getDate()).padStart(2, "0")}`;
                              // YYYY-MM-DD
                              const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                              return (
                                t.user === timeLog.user &&
                                // Same day (including year, month, and day)
                                startDate === todayDate
                              );
                            }),
                          )} (today)`}
                        />
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
  );
}
