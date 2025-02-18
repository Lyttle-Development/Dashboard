import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Customer, PrintJob, ServicePrice } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Select } from "@/components/Select";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";

export function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [printJob, setPrintJob] = useState<PrintJob>(null);
  const [originalPrintJob, setOriginalPrintJob] = useState<PrintJob>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServicePrice[]>([]);

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

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const servicesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      where: { categoryId: "71e25dc1-f273-4b1e-a91a-7758d0394d3f" },
    });

    setServices(servicesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const printJobId = router.query.id as string;
    if (printJobId) {
      void fetchPrintJob(printJobId);
    }
    void fetchCustomers();
    void fetchServices();
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
        priceId: printJob.priceId,
        quantity: printJob.quantity,
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
      void router.push("/dashboard/print");
    }
  };

  if (loading) return <Loader />;
  if (!printJob) return <div>PrintJob not found</div>;

  return (
    <Container>
      <h2 className={styles.title}>
        <span>Print Job: {printJob.name}</span>
        <Button onClick={deletePrintJob}>Delete Print Job</Button>
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
          label="Service"
          options={services.map((service) => ({
            label: service.service,
            value: service.id,
          }))}
          value={printJob.priceId}
          onValueChange={(value) => handleChange("priceId", value)}
        />
        <Field
          label="Print Amount"
          value={printJob.quantity?.toString() ?? "0"}
          onChange={(e) => handleChange("quantity", parseInt(e) || 0)}
        />
      </article>
      {hasChanges && <Button onClick={updatePrintJob}>Update Customer</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
