import { Layout } from "@/layouts";
import { useRouter } from "next/router";
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import { Project } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { KeyValue } from "@/components/KeyValue";
import {
  getPrice,
  getPriceFromPrices,
  getTotalFormattedTimeLogsHours,
} from "@/lib/price/get-price";

function Page() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState("Initializing");
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoice, setInvoice] = useState({});

  const updateProjects = (newProjects: Project[]) => {
    // Update the projects state with the new projects, but filter out any duplicates.
    setProjects((prevProjects) =>
      [...prevProjects, ...newProjects].filter(
        (project, index, self) =>
          self.findIndex((p) => p.id === project.id) === index,
      ),
    );
  };

  const fetchProjects = async (ids: string[], child = 0) => {
    setLoading(true);
    child
      ? setLoadingTask("Fetching child projects at level #" + child)
      : setLoadingTask("Fetching projects");
    const projectsData = await fetchApi<Project[]>({
      table: "project",
      where: {
        id: {
          in: ids,
        },
      },
      relations: {
        price: true,
        timeLogs: true,
        childProjects: true,
      },
    });
    setLoadingTask("Updating projects");

    updateProjects(projectsData);
    const childProjects = projectsData.flatMap(
      (project) => project.childProjects,
    );
    if (childProjects.length > 0) {
      return await fetchProjects(
        childProjects.map((project) => project.id),
        child + 1,
      );
    }
    setLoadingTask("Done");

    setLoading(false);
  };

  const createInvoice = async () => {};

  useEffect(() => {
    void fetchProjects([projectId as string]);
  }, [projectId]);

  if (!projectId) return null;
  if (loading) return <Loader info={loadingTask} />;

  return (
    <Container>
      <h1>Create Invoice</h1>
      <h2>Projects:</h2>
      <p>
        All these projects prices will be listed combined, and after creating
        this invoice closed.
      </p>
      <ul className={styles.projects}>
        {projects
          .filter((p) => p.priceId !== "133f319d-101f-4b0a-91ae-c3ebb0483714") // Filter out the project price, as it should not have time booked.
          .map((project) => (
            <li key={project.id} className={styles.project}>
              <Button href={`/project/${project.id}`}>{project.name}</Button>
              <article>
                <KeyValue
                  label="Hours worked"
                  value={getTotalFormattedTimeLogsHours(project.timeLogs)}
                />
                <KeyValue
                  label="Price"
                  value={getPrice(project.timeLogs, project.price.price)}
                />
              </article>
            </li>
          ))}
      </ul>
      <article>
        <h3>
          Total price:{" "}
          {getPriceFromPrices(
            projects.map((project) => project.timeLogs),
            projects.map((project) => project.price.price),
          )}
        </h3>
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
