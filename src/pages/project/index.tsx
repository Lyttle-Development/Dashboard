import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faDiagramProject,
  faPlus,
  faClock,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Button, ButtonStyle } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Customer, Project } from "@/lib/prisma";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { HierarchicalFilter } from "@/components/HierarchicalFilter";
import styles from "./index.module.scss";

export function Page() {
  usePageTitle({ title: "Projects" });
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch all projects (we'll filter client-side for now)
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projectsData = await fetchApi<Project[]>({
        table: "project",
        relations: {
          timeLogs: true,
          customer: true,
          tasks: true,
        },
      });
      setProjects(projectsData ?? []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  // Filter projects by selected customer
  const filteredProjects = selectedCustomer
    ? projects.filter((p) => p.customerId === selectedCustomer.id)
    : [];

  // Calculate project statistics
  const getProjectStats = (project: Project) => {
    const timeLogs = project.timeLogs || [];
    const totalTime = timeLogs.reduce((sum, log) => {
      if (log.startTime && log.endTime) {
        return sum + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
      }
      return sum;
    }, 0);
    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    const taskCount = project.tasks?.length || 0;
    return { hours, minutes, taskCount };
  };

  return (
    <Container>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>
            Manage your projects - select a customer first
          </p>
        </div>
        <Button
          href={LINKS.project.create}
          style={ButtonStyle.Primary}
        >
          <Icon icon={faPlus} />
          New Project
        </Button>
      </div>

      <HierarchicalFilter
        onCustomerChange={(customer) => setSelectedCustomer(customer)}
        showProjectFilter={false}
      />

      {loading && (
        <div className={styles.projectGrid}>
          <SkeletonLoader type="card" count={6} />
        </div>
      )}

      {!loading && !selectedCustomer && (
        <div className={styles.emptyState}>
          <Icon icon={faDiagramProject} className={styles.emptyIcon} />
          <h3>Select a Customer</h3>
          <p>Choose a customer above to view their projects</p>
        </div>
      )}

      {!loading && selectedCustomer && filteredProjects.length === 0 && (
        <div className={styles.emptyState}>
          <Icon icon={faDiagramProject} className={styles.emptyIcon} />
          <h3>No Projects Found</h3>
          <p>This customer doesn&apos;t have any projects yet</p>
          <Button
            href={LINKS.project.create}
            style={ButtonStyle.Primary}
          >
            <Icon icon={faPlus} />
            Create First Project
          </Button>
        </div>
      )}

      {!loading && selectedCustomer && filteredProjects.length > 0 && (
        <div className={styles.projectGrid}>
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project);
            return (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  {project.invoiceId && (
                    <span className={styles.badge}>Invoiced</span>
                  )}
                </div>

                <div className={styles.projectStats}>
                  <div className={styles.stat}>
                    <Icon icon={faClock} />
                    <span>
                      {stats.hours}h {stats.minutes}m
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <Icon icon={faDiagramProject} />
                    <span>{stats.taskCount} tasks</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Button
                    onClick={() => router.push(LINKS.project.detail(project.id))}
                    style={ButtonStyle.Primary}
                  >
                    <Icon icon={faEye} />
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
