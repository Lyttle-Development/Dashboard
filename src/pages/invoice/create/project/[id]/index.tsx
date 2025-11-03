import { Layout } from "@/layouts";
import { useRouter } from "next/router";
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import { Project } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button, ButtonStyle } from "@/components/Button";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { KeyValue } from "@/components/KeyValue";
import {
  getTotalFormattedTimeLogsHours,
} from "@/lib/price/get-price";
import { Icon } from "@/components/Icon";
import {
  faDiagramProject,
  faPersonBreastfeeding,
  faPrint,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { SideToSide } from "@/components/SideToSide";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { safeParseFloat } from "@/lib/parse";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { calculateProjectInvoice, formatCurrency, formatPercentage } from "@/lib/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";
import { getProjectFullName } from "@/lib/project";

function Page() {
  usePageTitle({ title: "Create Project Invoice" });
  const router = useRouter();
  const { id: projectId } = router.query;

  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState("Initializing");
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [invoice, setInvoice] = useState({});
  const [discount, setDiscount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

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
    if (child) {
      setLoadingTask("Fetching child projects at level #" + child);
    } else {
      setLoadingTask("Fetching projects");
    }
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

  const createInvoice = async () => {
    if (!project?.customer) {
      alert("Please assign a customer to this project first");
      return;
    }

    if (calculation.projects.length === 0) {
      alert("No projects with time logs found");
      return;
    }

    try {
      setLoading(true);
      setLoadingTask("Creating invoice...");

      // Get or create invoice status "Open"
      const statuses = await fetchApi<any[]>({
        table: "invoiceStatus",
        where: { status: "Open" },
      });

      let statusId = statuses?.[0]?.id;
      if (!statusId) {
        // Create "Open" status if it doesn't exist
        const newStatus = await fetch("/api/invoiceStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Open" }),
        }).then((res) => res.json());
        statusId = newStatus.id;
      }

      // Create the invoice
      const invoiceData = {
        invoiceDate: new Date().toISOString(),
        amount: calculation.total,
        statusId,
        customerId: project.customer.id,
        priceId: project.priceId,
      };

      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const newInvoice = await response.json();

      // Link all projects to this invoice
      setLoadingTask("Linking projects to invoice...");
      for (const proj of calculation.projects) {
        await fetch(`/api/project/${proj.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: newInvoice.id }),
        });
      }

      setLoadingTask("Done!");
      alert("Invoice created successfully!");
      
      // Redirect to invoice listing or detail page
      router.push(LINKS.invoice.root);
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects([projectId as string]);
  }, [projectId]);

  if (!projectId) return null;
  if (loading) return <Loader info={loadingTask} />;

  // Use centralized calculation helper
  const calculation = calculateProjectInvoice(projects, discount);

  // Prepare invoice preview data
  const invoicePreviewData = {
    invoiceDate: new Date(),
    customer: {
      name: project?.customer?.firstname
        ? `${project.customer.firstname} ${project.customer.lastname || ""}`
        : "Customer Name",
      email: project?.customer?.email,
    },
    items: calculation.projects.map((proj) => ({
      description: getProjectFullName(
        projects.find((p) => p.id === proj.id)!,
        projects
      ),
      quantity: proj.hours,
      unitPrice: proj.rate,
      amount: proj.amount,
      details: `${proj.hours} hours worked at ${formatCurrency(proj.rate)}/hour`,
    })),
    subtotal: calculation.subtotal,
    discount: calculation.discount,
    discountAmount: calculation.discountAmount,
    tax: calculation.tax,
    taxAmount: calculation.taxAmount,
    total: calculation.total,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <h1>Create Project Invoice</h1>
        <div className={styles.actions}>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            style={showPreview ? ButtonStyle.Primary : ButtonStyle.Default}
          >
            <Icon icon={faEye} />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          {showPreview && (
            <Button onClick={handlePrint} style={ButtonStyle.Primary}>
              <Icon icon={faPrint} />
              Print Invoice
            </Button>
          )}
          {project?.parentProjectId && (
            <Button
              href={LINKS.invoice.create.project(project?.parentProjectId)}
            >
              <Icon icon={faPersonBreastfeeding} />
              Parent Project
            </Button>
          )}
          <Button href={LINKS.project.detail(project?.id)}>
            <Icon icon={faDiagramProject} />
            View Project
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className={styles.previewSection}>
          <InvoicePreview {...invoicePreviewData} />
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h2>Projects Included</h2>
            <p className={styles.sectionDescription}>
              All projects listed below will be combined into one invoice. After
              creating the invoice, these projects will be marked as closed.
            </p>
            <div className={styles.projectsList}>
              {calculation.projects.map((proj) => {
                const projectData = projects.find((p) => p.id === proj.id)!;
                return (
                  <div key={proj.id} className={styles.projectCard}>
                    <div className={styles.projectHeader}>
                      <h3>{getProjectFullName(projectData, projects)}</h3>
                      <Button href={LINKS.project.detail(proj.id)}>
                        View Details
                      </Button>
                    </div>
                    <div className={styles.projectDetails}>
                      <KeyValue
                        label="Hours Worked"
                        value={getTotalFormattedTimeLogsHours(
                          projectData.timeLogs
                        )}
                      />
                      <KeyValue
                        label="Hourly Rate"
                        value={formatCurrency(proj.rate)}
                      />
                      <KeyValue
                        label="Subtotal"
                        value={formatCurrency(proj.amount)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Invoice Summary</h2>
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Subtotal:</span>
                <span className={styles.value}>
                  {formatCurrency(calculation.subtotal)}
                </span>
              </div>

              <div className={styles.discountRow}>
                <div className={styles.discountLabel}>
                  <span className={styles.label}>Discount:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => {
                      const num = safeParseFloat(e.target.value) || 0;
                      setDiscount(Math.max(0, Math.min(100, num)));
                    }}
                    className={styles.discountInput}
                  />
                  <span>%</span>
                </div>
                <span className={styles.value}>
                  -{formatCurrency(calculation.discountAmount)}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.label}>
                  Tax ({formatPercentage(calculation.tax)}):
                </span>
                <span className={styles.value}>
                  {formatCurrency(calculation.taxAmount)}
                </span>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.label}>Total:</span>
                <span className={styles.value}>
                  {formatCurrency(calculation.total)}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.createActions}>
              <Button
                onClick={createInvoice}
                style={ButtonStyle.Primary}
                disabled={calculation.projects.length === 0}
              >
                Create Invoice
              </Button>
            </div>
          </section>
        </>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
