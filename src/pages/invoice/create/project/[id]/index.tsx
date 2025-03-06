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
import { Icon } from "@/components/Icon";
import {
  faDiagramProject,
  faPersonBreastfeeding,
} from "@fortawesome/free-solid-svg-icons";
import { formatNumber } from "@/lib/format/number";
import { SideToSide } from "@/components/SideToSide";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { TAX_COST_PROCENT } from "@/constants";
import { safeParseFloat } from "@/lib/parse";
import { procentToNumber } from "@/lib/procent";

function Page() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState("Initializing");
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project>(null);
  const [invoice, setInvoice] = useState({});
  const [discount, setDiscount] = useState(0);

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

    const projectData: Project =
      projectsData?.filter((p) => p.id === projectId)[0] || null;
    if (projectData) {
      setProject(projectData);
    }

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

  const totalPriceTimeLogs: number = getPriceFromPrices(
    projects.map((project) => project.timeLogs),
    projects.map((project) => project.price.price),
    true,
  ) as number;

  const totalPriceCalculatedDiscount =
    totalPriceTimeLogs - totalPriceTimeLogs * (discount / 100); // Subtract discount

  // Cost TAX
  const totalPriceCalculatedTax =
    totalPriceCalculatedDiscount * TAX_COST_PROCENT; // Add TAX/BTW
  const costPriceCalculatedTax =
    totalPriceCalculatedTax - totalPriceCalculatedDiscount;

  if (!projectId) return null;
  if (loading) return <Loader info={loadingTask} />;

  return (
    <Container className={styles.container}>
      <h1 className={styles.invoice_title}>
        <span>Create Invoice</span>
        <article className={styles.invoice_actions}>
          {project?.parentProjectId && (
            <Button
              href={`/invoice/create/project/${project?.parentProjectId}`}
            >
              <Icon icon={faPersonBreastfeeding} />
              Open Parent Project
            </Button>
          )}
          <Button href={`/project/${project?.id}`}>
            <Icon icon={faDiagramProject} />
            Open Project
          </Button>
        </article>
      </h1>
      <article className={styles.projects_container}>
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
      </article>
      <article className={styles.calculations}>
        <h3>Calculations:</h3>
        <p>
          Prices are calculated by the total hours worked on the projects, and
          the price set for each project.
        </p>
        <KeyValue
          label="Price worked hours"
          value={`€${formatNumber(totalPriceTimeLogs)}`}
        />
        <SideToSide>
          <KeyValue
            label="Discount"
            value={`${discount}% (€${formatNumber(totalPriceCalculatedDiscount - totalPriceTimeLogs)})`}
          />
          <Field
            label={""}
            type={FormOptionType.NUMBER}
            value={discount.toString()}
            onChange={(e) => {
              const num = safeParseFloat(e) || 0;
              setDiscount(num);
            }}
          />
        </SideToSide>
        <KeyValue
          label={`TAX/BTW`}
          value={`€${formatNumber(costPriceCalculatedTax)} (${procentToNumber(TAX_COST_PROCENT)}%)`}
        />
      </article>
      <article>
        <h3>Total price:</h3>
        <p>Price after discount and TAX/BTW is applied.</p>
        <KeyValue
          label="Total"
          value={`€${formatNumber(totalPriceCalculatedTax)}`}
        />
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
