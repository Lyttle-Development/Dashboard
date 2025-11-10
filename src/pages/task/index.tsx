import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faListCheck, faPlus, faSearch, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Task, Category } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Tasks" });
  
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [tasksData, categoriesData] = await Promise.all([
      fetchApi<Task[]>({ table: "task" }),
      fetchApi<Category[]>({ table: "category" }),
    ]);
    setTasks(tasksData ?? []);
    setCategories(categoriesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const toggleTaskDone = async (taskId: number, currentStatus: boolean) => {
    await fetchApi({
      table: "task",
      method: "PUT",
      where: { id: taskId },
      data: { done: !currentStatus },
    });
    await fetchData();
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const completedCount = tasks.filter((t) => t.done).length;

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <Icon icon={faListCheck} className={styles.icon} />
            <h1>Tasks</h1>
          </div>
          <Button href={LINKS.task.create} variant="primary">
            <Icon icon={faPlus} /> Create Task
          </Button>
        </div>

        <div className={styles.searchBar}>
          <Icon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{tasks.length}</div>
            <div className={styles.statLabel}>Total Tasks</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{completedCount}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{tasks.length - completedCount}</div>
            <div className={styles.statLabel}>Remaining</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon={faListCheck} className={styles.emptyIcon} />
          <h3>No tasks found</h3>
          <p>
            {searchQuery
              ? "No tasks match your search criteria"
              : "Get started by creating your first task"}
          </p>
          {!searchQuery && (
            <Button href={LINKS.task.create} variant="primary">
              <Icon icon={faPlus} /> Create Task
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map((task) => (
            <div key={task.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{task.name}</h3>
                <button
                  className={`${styles.checkbox} ${task.done ? styles.checked : ""}`}
                  onClick={() => toggleTaskDone(task.id, task.done)}
                  title={task.done ? "Mark as incomplete" : "Mark as complete"}
                >
                  {task.done && <Icon icon={faCheck} />}
                </button>
              </div>
              
              {task.description && (
                <p className={styles.cardDescription}>{task.description}</p>
              )}

              <div className={styles.cardMeta}>
                <span className={styles.badge}>
                  {getCategoryName(task.categoryId)}
                </span>
                {task.priority && (
                  <span className={`${styles.badge} ${styles[getPriorityColor(task.priority)]}`}>
                    {task.priority}
                  </span>
                )}
              </div>

              <div className={styles.cardActions}>
                <Button href={`${LINKS.task.index}/${task.id}`} variant="secondary" size="small">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
