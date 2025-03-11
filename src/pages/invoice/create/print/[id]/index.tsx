import { Layout } from "@/layouts";
import { useRouter } from "next/router";
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import { PrintJob, ServicePrice } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { KeyValue } from "@/components/KeyValue";
import { getTotalHours } from "@/lib/price/get-price";
import { Icon } from "@/components/Icon";
import { faDiagramProject } from "@fortawesome/free-solid-svg-icons";
import { formatNumber } from "@/lib/format/number";
import { SideToSide } from "@/components/SideToSide";
import { FormOptionType } from "@/components/Form";
import {
  PRINT_LABOUR_BASE_COST,
  PRINT_MARGIN_PROCENT,
  TAX_COST_PROCENT,
} from "@/constants";
import { safeParseFloat } from "@/lib/parse";
import { procentToNumber } from "@/lib/procent";
import { Markdown } from "@/components/Markdown";

function Page() {
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

  // Electricity cost
  const electricityPrice =
    prices?.find(
      (p) => p.id === "cd90b1ef-af06-49e1-80b5-f6920b2d3a92", // ELECTRICITY_PRICE
    ).price ?? 0;
  const printTime = getTotalHours(printJob.timeLogs, true);
  const costPriceElectricity =
    Math.ceil(printTime * electricityPrice * 100) / 100;

  const totalPriceElectricity = costPriceElectricity; // Electricity cost

  // Material cost
  const materialPricePerGram = printJob
    ? Math.ceil(
        (printJob.material?.unitPrice / printJob.material?.unitAmount) * 100,
      ) / 100
    : 0;
  const costPriceMaterial =
    Math.ceil(
      printJob.quantity * printJob.weight * materialPricePerGram * 100,
    ) / 100;
  const totalPriceMaterial = totalPriceElectricity + totalPriceElectricity; // Material cost

  // Labour cost
  const totalPriceCalculatedLabour =
    Math.ceil(
      (totalPriceMaterial + PRINT_LABOUR_BASE_COST * printJob.quantity) * 100,
    ) / 100;
  const costPriceCalculatedLabour =
    totalPriceCalculatedLabour - totalPriceMaterial;

  // Margin cost
  const totalPriceCalculatedMargin =
    Math.ceil(totalPriceCalculatedLabour * PRINT_MARGIN_PROCENT * 100) / 100;
  const costPriceCalculatedMargin =
    totalPriceCalculatedMargin - totalPriceCalculatedLabour;

  // Discount cost
  const totalPriceCalculatedDiscount =
    discount !== 0
      ? Math.ceil(totalPriceCalculatedMargin * (1 - discount / 100) * 100) / 100
      : totalPriceCalculatedMargin;
  const costPriceCalculatedDiscount =
    totalPriceCalculatedDiscount - totalPriceCalculatedMargin;

  // TAX/BTW cost
  const totalPriceCalculatedTax =
    Math.ceil(totalPriceCalculatedDiscount * TAX_COST_PROCENT * 100) / 100; // Add TAX/BTW
  const costPriceCalculatedTax =
    totalPriceCalculatedTax - totalPriceCalculatedDiscount;

  console.log(
    "totalPriceElectricity",
    totalPriceElectricity,
    costPriceElectricity,
  );
  console.log("totalPriceMaterial", totalPriceMaterial, costPriceMaterial);
  console.log(
    "totalPriceCalculatedLabour",
    totalPriceCalculatedLabour,
    costPriceCalculatedLabour,
  );
  console.log(
    "totalPriceCalculatedMargin",
    totalPriceCalculatedMargin,
    costPriceCalculatedMargin,
  );
  console.log(
    "totalPriceCalculatedDiscount",
    totalPriceCalculatedDiscount,
    costPriceCalculatedDiscount,
  );
  console.log(
    "totalPriceCalculatedTax",
    totalPriceCalculatedTax,
    costPriceCalculatedTax,
  );

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
      <article className={styles.group}>
        <h3>Calculations:</h3>
        <p>
          Prices are calculated by the total hours worked on the projects, and
          the price set for each project.
        </p>
        <hr />
        <KeyValue
          label="Price electricity"
          value={`€${formatNumber(costPriceElectricity)} (${printTime}h x €${formatNumber(electricityPrice)})`}
        />
        <Markdown>
          {`**Electricity cost**: hours worked (round down) x electricity price (per hour)`}
        </Markdown>
        <hr />
        <KeyValue
          label="Material cost"
          value={`€${formatNumber(costPriceMaterial)} (${printJob.quantity}p x ${printJob.weight}g x €${formatNumber(materialPricePerGram)}/g)`}
        />
        <Markdown>
          {`**Material cost**: quantity x weight x material price per gram`}
        </Markdown>
        <hr />
        <KeyValue
          label="Labour"
          value={`€${formatNumber(costPriceCalculatedLabour)} (€${PRINT_LABOUR_BASE_COST} * ${printJob.quantity}p)`}
        />
        <Markdown>
          {`**Labour cost**: material cost + labour base cost per print (amount)`}
        </Markdown>
        <hr />
        <KeyValue
          label="Margin"
          value={`€${formatNumber(costPriceCalculatedMargin)} (${procentToNumber(PRINT_MARGIN_PROCENT)}%)`}
        />
        <Markdown>{`**Margin cost**: labour cost x margin procent`}</Markdown>
        <hr />
        <SideToSide className={styles.discount_wrapper}>
          <KeyValue label="Discount" value={""} />
          <input
            type={FormOptionType.NUMBER}
            value={discount.toString()}
            onChange={(e) => {
              const num = safeParseFloat(e.target.value) || 0;
              setDiscount(num);
            }}
            className={styles.discount_input}
          />
          <span>% (€{formatNumber(costPriceCalculatedDiscount)})</span>
        </SideToSide>
        <Markdown>
          {`**Discount cost**: margin cost x discount procent (if any)`}
        </Markdown>
        <hr />
        <KeyValue
          label={`TAX/BTW`}
          value={`€${formatNumber(costPriceCalculatedTax)} (${procentToNumber(TAX_COST_PROCENT)}%)`}
        />
        <Markdown>{`**TAX/BTW cost**: discount cost x TAX/BTW procent`}</Markdown>
        <hr />
      </article>
      <article className={styles.group}>
        <h3>Total price:</h3>
        <p>Price after discount and TAX/BTW is applied.</p>
        <hr />
        <KeyValue
          label="Total (excl. TAX/BTW)"
          value={`€${formatNumber(totalPriceCalculatedDiscount)}`}
        />
        <hr />
        <KeyValue
          label="Total (incl. TAX/BTW)"
          value={`€${formatNumber(totalPriceCalculatedTax)}`}
        />
        <hr />
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
