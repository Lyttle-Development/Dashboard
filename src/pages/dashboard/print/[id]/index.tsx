import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { PrintJob } from "@/lib/prisma";
import { KeyValue } from "@/components/KeyValue";
import { fetchApi } from "@/lib/fetchApi";

export function Page() {
  const router = useRouter();

  const [printJob, setPrintJob] = useState<PrintJob>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchPrintJob = useCallback(async (printJobId: string) => {
    setLoading(true);
    const printJobData = await fetchApi<PrintJob>({
      table: "print-job",
      id: printJobId,
      relations: { Customer: true, ServicePrice: true },
    });

    console.log(printJobData);

    setPrintJob(printJobData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const printJobId = router.query.id as string;
    if (printJobId) {
      void fetchPrintJob(printJobId);
    }
  }, []);

  if (loading) return <Loader />;
  if (!printJob) return <div>PrintJob not found</div>;

  return (
    <Container>
      <h2 className={styles.projectTitle}>Project: {printJob.name}</h2>
      <article>
        <KeyValue label="Customer" value={printJob.customer?.name} />
        {/*<KeyValue label="Category" value={printJob.servicePrice.category.name} />*/}
        <KeyValue label="Service" value={printJob.servicePrice?.service} />
      </article>
      {/*<h2>Calculated Price</h2>*/}
      {/*<article>*/}
      {/*  <KeyValue*/}
      {/*    label="Standard"*/}
      {/*    value={getPrice(totalDurationHours, printJob.price.standard)}*/}
      {/*  />*/}
      {/*  <KeyValue*/}
      {/*    label="Standard Min"*/}
      {/*    value={getPrice(totalDurationHours, printJob.servicePrice.standardMin)}*/}
      {/*  />*/}
      {/*  <KeyValue*/}
      {/*    label="Standard Max"*/}
      {/*    value={getPrice(totalDurationHours, printJob.servicePrice.standardMax)}*/}
      {/*  />*/}
      {/*  <br />*/}
      {/*  <KeyValue*/}
      {/*    label="Friend"*/}
      {/*    value={getPrice(totalDurationHours, printJob.servicePrice.friends)}*/}
      {/*  />*/}
      {/*  <KeyValue*/}
      {/*    label="Friend Min"*/}
      {/*    value={getPrice(totalDurationHours, printJob.servicePrice.friendsMin)}*/}
      {/*  />*/}
      {/*  <KeyValue*/}
      {/*    label="Friend Max"*/}
      {/*    value={getPrice(totalDurationHours, printJob.servicePrice.friendsMax)}*/}
      {/*  />*/}
      {/*</article>*/}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
