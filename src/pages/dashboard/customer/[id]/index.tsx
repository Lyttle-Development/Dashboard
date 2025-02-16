import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import styles from "./index.module.scss";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { Customer } from "@/lib/prisma";
import { KeyValue } from "@/components/KeyValue";
import { fetchApi } from "@/lib/fetchApi";

export function Page() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchPrintJob = useCallback(async (customerId: string) => {
    setLoading(true);
    const customerData = await fetchApi<Customer>({
      table: "customer",
      id: customerId,
      relations: {
        addresses: true,
      },
    });

    setCustomer(customerData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const customerId = router.query.id as string;
    if (customerId) {
      void fetchPrintJob(customerId);
    }
  }, []);

  if (loading) return <Loader />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <Container>
      <h2 className={styles.projectTitle}>Customer: {customer.name}</h2>
      <article>
        <KeyValue label="Email" value={customer.email} />
        <KeyValue label="Phone" value={customer.phone} />
        <KeyValue
          label="Addresses"
          value={customer.addresses
            ?.map((a) => `${a.street}, ${a.zipCode} ${a.city} (${a.country})`)
            .join(" and ")}
        />
      </article>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
