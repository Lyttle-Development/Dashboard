import { Layout } from "@/layouts";
import { useRouter } from "next/router";
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import { PrintJob } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { KeyValue } from "@/components/KeyValue";
import { getPrice } from "@/lib/price/get-price";
import { Icon } from "@/components/Icon";
import { faDiagramProject } from "@fortawesome/free-solid-svg-icons";
import { formatNumber } from "@/lib/format/number";
import { SideToSide } from "@/components/SideToSide";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { TAX_COST_PROCENT } from "@/constants";

function Page() {
  const router = useRouter();
  const { id: printJobId } = router.query;

  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState("Initializing");
  const [printJob, setPrintJob] = useState<PrintJob>(null);
  const [invoice, setInvoice] = useState({});
  const [discount, setDiscount] = useState(0);

  const fetchPrintJob = async (id: string) => {
    setLoading(true);
    setLoadingTask("Fetching print job");
    const printJobData = await fetchApi<PrintJob>({
      table: "printJob",
      id,
      relations: {
        timeLogs: true,
        price: true,
      },
    });
    setPrintJob(printJobData);
    setLoading(false);
  };

  const createInvoice = async () => {};

  useEffect(() => {
    void fetchPrintJob(printJobId as string);
  }, [printJobId]);

  const totalPriceTimeLogs: number = printJob
    ? (getPrice(printJob.timeLogs, printJob.price.price, true) as number)
    : null;

  const totalPriceCalculatedDiscount =
    totalPriceTimeLogs - totalPriceTimeLogs * (discount / 100); // Subtract discount
  const totalPriceCalculatedTax =
    totalPriceCalculatedDiscount * (1 + TAX_COST_PROCENT); // Add TAX/BTW

  if (!printJobId) return null;
  if (!printJob) return null;
  if (loading) return <Loader info={loadingTask} />;

  return (
    <Container className={styles.container}>
      <h1 className={styles.invoice_title}>
        <span>Create Invoice</span>
        <article className={styles.invoice_actions}>
          <Button href={`/print/${printJob?.id}`}>
            <Icon icon={faDiagramProject} />
            Open Print Job
          </Button>
        </article>
      </h1>
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
              const num = parseFloat(e) || 0;
              setDiscount(num);
            }}
          />
        </SideToSide>
        <KeyValue
          label="TAX/BTW"
          value={`21% (€${formatNumber(totalPriceCalculatedTax - totalPriceCalculatedDiscount)})`}
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
