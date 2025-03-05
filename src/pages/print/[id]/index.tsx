import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Customer, PrintJob, PrintMaterial } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Select } from "@/components/Select";
import { Field } from "@/components/Field";
import { Button, ButtonStyle } from "@/components/Button";
import { PrintTimeLog } from "@/components/PrintTimeLog";
import { Icon } from "@/components/Icon";
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";

export function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [printJob, setPrintJob] = useState<PrintJob>(null);
  const [originalPrintJob, setOriginalPrintJob] = useState<PrintJob>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<PrintMaterial[]>([]);

  // Fetch the project details by id.
  const fetchPrintJob = useCallback(async (printJobId: string) => {
    setLoading(true);
    const printJobData = await fetchApi<PrintJob>({
      table: "print-job",
      id: printJobId,
      relations: { customer: true, price: true },
    });

    setPrintJob(printJobData);
    setOriginalPrintJob(printJobData);
    setLoading(false);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const customersData = await fetchApi<Customer[]>({ table: "customer" });

    setCustomers(customersData);
    setLoading(false);
  }, []);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const materialsData = await fetchApi<PrintMaterial[]>({
      table: "printMaterial",
    });

    setMaterials(materialsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const printJobId = router.query.id as string;
    if (printJobId) {
      void fetchPrintJob(printJobId);
    }
    void fetchCustomers();
    void fetchMaterials();
  }, []);

  const changes = Object.keys(printJob ?? {}).filter(
    (key) => printJob[key] !== originalPrintJob[key],
  );
  const hasChanges = changes.length > 0;

  const handleChange = (field: string, value: string | number) => {
    setPrintJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePrintJob = async () => {
    await fetchApi<PrintJob>({
      table: "print-job",
      id: printJob.id,
      method: "PUT",
      body: {
        customerId: printJob.customerId,
        materialId: printJob.materialId,
        quantity: printJob.quantity,
        weight: printJob.weight,
      },
    });
    void fetchPrintJob(printJob.id);
  };

  const deletePrintJob = async () => {
    if (confirm("Are you sure you want to delete this print job?")) {
      await fetchApi<PrintJob>({
        table: "print-job",
        id: printJob.id,
        method: "DELETE",
      });
      void router.push("/print");
    }
  };

  if (loading) return <Loader />;
  if (!printJob) return <div>PrintJob not found</div>;

  return (
    <Container>
      <h2 className={styles.title}>
        <span>Print Job: {printJob.name}</span>
        <article className={styles.actions}>
          <Button href={`/invoice/create/print/${printJob.id}`}>
            <Icon icon={faFileInvoiceDollar} />
            Create invoice
          </Button>
          <Button onClick={deletePrintJob} style={ButtonStyle.Danger}>
            Delete Print Job
          </Button>
        </article>
      </h2>
      <article className={styles.information}>
        <Select
          label="Customer"
          options={customers.map((customer) => ({
            label: customer.firstname + " " + customer.lastname,
            value: customer.id,
          }))}
          value={printJob.customerId}
          onValueChange={(value) => handleChange("customerId", value)}
        />

        <Select
          label="Material"
          options={materials.map((service) => ({
            label: `${service.type}: ${service.color}`,
            value: service.id,
          }))}
          value={printJob.materialId}
          onValueChange={(value) => handleChange("materialId", value)}
        />
        <Field
          label="Print Amount (total items)"
          value={printJob.quantity?.toString() ?? "0"}
          onChange={(e) => handleChange("quantity", parseInt(e) || 0)}
        />
        <Field
          label="Print Gram (per item)"
          value={printJob.weight?.toString() ?? "0"}
          onChange={(e) => handleChange("weight", parseInt(e) || 0)}
        />
      </article>
      {hasChanges && <Button onClick={updatePrintJob}>Update Print Job</Button>}

      <PrintTimeLog printJobId={printJob.id} />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
