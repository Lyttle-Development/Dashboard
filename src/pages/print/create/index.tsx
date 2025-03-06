import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";
import { Customer, PrintJob, PrintMaterial, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { KeyValue } from "@/components/KeyValue";
import { Button } from "@/components/Button";
import styles from "./index.module.scss";
import { FormOptionType } from "@/components/Form";
import { Field } from "@/components/Field";
import { useRouter } from "next/router";
import { Loader } from "@/components/Loader";

function Page() {
  const router = useRouter();

  const [loadings, setLoading] = useState<{ [key: string]: boolean }>({
    customer: false,
    material: false,
    price: false,
    global: false,
  });
  const updateLoading = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));
  const loading = Object.values(loadings).some((v) => v);
  const [name, setName] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customer, setCustomer] = useState<Customer>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [material, setMaterial] = useState<PrintMaterial>(null);
  const [materials, setMaterials] = useState<PrintMaterial[]>([]);
  const [price, setPrice] = useState<ServicePrice>(null);
  const [prices, setPrices] = useState<ServicePrice[]>([]);

  const fetchCustomers = async () => {
    updateLoading("customer", true);
    const customersData = await fetchApi<Customer[]>({
      table: "customer",
      where: {
        firstname: {
          contains: customerSearch,
          mode: "insensitive",
        },
      },
    });
    setCustomers(customersData);
    if (customersData?.length === 1) setCustomer(customersData[0]);
    updateLoading("customer", false);
  };

  const fetchMaterials = async () => {
    updateLoading("material", true);
    const materialsData = await fetchApi<PrintMaterial[]>({
      table: "printMaterial",
    });
    setMaterials(materialsData);
    updateLoading("material", false);
  };

  const fetchPrices = async () => {
    updateLoading("price", true);
    const pricesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      where: {
        categoryId: "71e25dc1-f273-4b1e-a91a-7758d0394d3f",
      },
    });
    setPrices(pricesData);
    updateLoading("price", false);
  };

  useEffect(() => {
    void fetchMaterials();
    void fetchPrices();
  }, []);

  const restart = () => {
    updateLoading("global", true);
    setCustomerSearch("");
    setCustomer(null);
    setCustomers([]);

    setPrice(null);
    updateLoading("global", false);
  };

  const createPrintJob = async () => {
    updateLoading("global", true);
    const data = await fetchApi<PrintJob>({
      table: "print-job",
      method: "POST",
      body: {
        name,
        customerId: customer.id,
        priceId: price.id,
        materialId: material.id,
      },
    });
    restart();
    updateLoading("global", false);
    void router.push(`/print/${data.id}`);
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <h1 className={styles.title}>
        <span>Create Print Job</span>
        <Button onClick={restart}>Restart</Button>
      </h1>
      <Field
        label="Print Job Name"
        type={FormOptionType.TEXT}
        required
        onChange={(value) => setName(typeof value === "string" ? value : "")}
      />
      {customer && (
        <KeyValue
          label="Customer"
          value={customer.firstname + " " + customer.lastname}
        />
      )}
      {!customer &&
        customers &&
        (customers.length > 0 ? (
          <Select
            label="Select Customer"
            options={customers.map((customer) => ({
              label: customer.firstname + " " + customer.lastname,
              value: customer.id,
            }))}
            onValueChange={(value) =>
              setCustomer(customers.find((c) => c.id === value))
            }
          />
        ) : (
          <article className={styles.side_to_side}>
            <Field
              label="Search Customer"
              type={FormOptionType.TEXT}
              required
              onChange={(value) =>
                setCustomerSearch(typeof value === "string" ? value : "")
              }
              onSubmit={fetchCustomers}
            />
          </article>
        ))}
      {materials &&
        materials.length > 0 &&
        (material ? (
          <KeyValue label="Material" value={material.type} />
        ) : (
          <Select
            label="Select Material"
            options={materials.map((material) => ({
              label: `${material.type}: ${material.color}`,
              value: material.id,
            }))}
            onValueChange={(value) =>
              setMaterial(materials.find((m) => m.id === value))
            }
          />
        ))}
      {prices &&
        prices.length > 0 &&
        (price ? (
          <KeyValue label="Service" value={price.service} />
        ) : (
          <Select
            label="Select Price"
            options={prices.map((price) => ({
              label: price.service,
              value: price.id,
            }))}
            onValueChange={(value) =>
              setPrice(prices.find((p) => p.id === value))
            }
          />
        ))}
      {!!material && !!price && !!customer && !!name && (
        <Button onClick={createPrintJob}>Create Print Job</Button>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
