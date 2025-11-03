import { Layout } from "@/layouts";
import { useRouter } from "next/router";
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import { PrintJob, ServicePrice } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button, ButtonStyle } from "@/components/Button";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { KeyValue } from "@/components/KeyValue";
import { Icon } from "@/components/Icon";
import { faDiagramProject, faPrint, faEye } from "@fortawesome/free-solid-svg-icons";
import { safeParseFloat } from "@/lib/parse";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  calculatePrintJobInvoice,
  formatCurrency,
  formatPercentage,
} from "@/lib/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";

function Page() {
  usePageTitle({ title: "Create Print Job Invoice" });
  const router = useRouter();
  const { id: printJobId } = router.query;

  const [loadings, setLoading] = useState({
    printJob: true,
    prices: true,
  });
  const updateLoading = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));
  const loading = Object.values(loadings).some((v) => v);
  const [loadingTask, setLoadingTask] = useState("Initializing");
  const [printJob, setPrintJob] = useState<PrintJob>(null);
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [invoice, setInvoice] = useState({});
  const [discount, setDiscount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const fetchPrintJob = async (id: string) => {
    updateLoading("printJob", true);
    setLoadingTask("Fetching print job");
    const printJobData = await fetchApi<PrintJob>({
      table: "printJob",
      id,
      relations: {
        timeLogs: true,
        price: true,
        material: true,
        customer: true,
      },
    });
    setPrintJob(printJobData);
    updateLoading("printJob", false);
  };

  const fetchPrices = async () => {
    updateLoading("prices", true);
    setLoadingTask("Fetching prices");
    const prices = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
    });
    setPrices(prices);
    updateLoading("prices", false);
  };

  const createInvoice = async () => {};

  useEffect(() => {
    void fetchPrintJob(printJobId as string);
    void fetchPrices();
  }, [printJobId]);

  if (!printJobId || !printJob) return <Loader />;
  if (loading) return <Loader info={loadingTask} />;

  // Get electricity price from service prices
  const electricityPrice =
    prices?.find(
      (p) => p.id === "cd90b1ef-af06-49e1-80b5-f6920b2d3a92" // ELECTRICITY_PRICE
    )?.price ?? 0;

  // Use centralized calculation helper
  const calculation = calculatePrintJobInvoice(
    printJob,
    electricityPrice,
    discount
  );

  // Prepare invoice preview data
  const invoicePreviewData = {
    invoiceDate: new Date(),
    customer: {
      name: printJob.customer?.firstname
        ? `${printJob.customer.firstname} ${printJob.customer.lastname || ""}`
        : "Customer Name",
      email: printJob.customer?.email,
    },
    items: [
      {
        description: `3D Print Job: ${printJob.name}`,
        quantity: printJob.quantity,
        unitPrice: calculation.subtotalAfterDiscount / printJob.quantity,
        amount: calculation.subtotalAfterDiscount,
        details: `${printJob.quantity} units at ${printJob.weight}g each`,
      },
    ],
    subtotal: calculation.subtotal,
    discount: calculation.discount,
    discountAmount: calculation.discountAmount,
    tax: calculation.tax,
    taxAmount: calculation.taxAmount,
    total: calculation.total,
    notes: `Electricity: ${calculation.electricity.hours.toFixed(2)}h × ${formatCurrency(calculation.electricity.rate)}/h = ${formatCurrency(calculation.electricity.cost)}\nMaterial: ${calculation.material.quantity} × ${calculation.material.weightPerUnit}g × ${formatCurrency(calculation.material.pricePerGram)}/g = ${formatCurrency(calculation.material.cost)}\nLabour: ${formatCurrency(calculation.labour.baseCost)} × ${calculation.labour.quantity} units = ${formatCurrency(calculation.labour.cost)}\nMargin: ${formatPercentage(calculation.margin.rate)} = ${formatCurrency(calculation.margin.cost)}`,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <h1>Create Print Job Invoice</h1>
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
          <Button href={LINKS.print.detail(printJob?.id)}>
            <Icon icon={faDiagramProject} />
            View Print Job
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
            <h2>Print Job Details</h2>
            <div className={styles.printJobCard}>
              <div className={styles.printJobHeader}>
                <h3>{printJob.name}</h3>
                <Button href={LINKS.print.detail(printJob.id)}>
                  View Details
                </Button>
              </div>
              <div className={styles.printJobDetails}>
                <KeyValue label="Quantity" value={`${printJob.quantity} units`} />
                <KeyValue
                  label="Weight per Unit"
                  value={`${printJob.weight}g`}
                />
                <KeyValue
                  label="Print Time"
                  value={`${calculation.electricity.hours.toFixed(2)} hours`}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Cost Breakdown</h2>
            <p className={styles.sectionDescription}>
              Detailed breakdown of all costs involved in this print job.
            </p>
            <div className={styles.breakdownCard}>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>
                  <strong>Electricity</strong>
                  <span className={styles.formula}>
                    {calculation.electricity.hours.toFixed(2)}h ×{" "}
                    {formatCurrency(calculation.electricity.rate)}/h
                  </span>
                </div>
                <div className={styles.breakdownValue}>
                  {formatCurrency(calculation.electricity.cost)}
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>
                  <strong>Material</strong>
                  <span className={styles.formula}>
                    {calculation.material.quantity} units ×{" "}
                    {calculation.material.weightPerUnit}g ×{" "}
                    {formatCurrency(calculation.material.pricePerGram)}/g
                  </span>
                </div>
                <div className={styles.breakdownValue}>
                  {formatCurrency(calculation.material.cost)}
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>
                  <strong>Labour</strong>
                  <span className={styles.formula}>
                    {formatCurrency(calculation.labour.baseCost)} ×{" "}
                    {calculation.labour.quantity} units
                  </span>
                </div>
                <div className={styles.breakdownValue}>
                  {formatCurrency(calculation.labour.cost)}
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>
                  <strong>Margin</strong>
                  <span className={styles.formula}>
                    {formatPercentage(calculation.margin.rate)}
                  </span>
                </div>
                <div className={styles.breakdownValue}>
                  {formatCurrency(calculation.margin.cost)}
                </div>
              </div>
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
                disabled={!printJob}
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
