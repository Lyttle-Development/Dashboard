import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Invoice } from "@/lib/prisma";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const invoicesData = await fetchApi<Invoice[]>({
      table: "invoice",
      relations: {
        projects: true,
      },
    });
    setInvoices(invoicesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  if (loading) return <Loader />;
  if (!invoices?.length) return <div>No invoices found</div>;

  return (
    <Container>
      <h1>Invoices</h1>
      <Select
        label="Open Invoice"
        icon={faMagnifyingGlass}
        options={invoices.map((invoice) => ({
          label: invoice.projects.map((project) => project.name).join(", "),
          value: invoice.id,
        }))}
        onValueChange={(invoiceId) => router.push(`/invoice/${invoiceId}`)}
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
