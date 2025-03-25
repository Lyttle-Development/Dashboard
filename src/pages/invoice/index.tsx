import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { fetchApi } from "@/lib/fetchApi";
import { Invoice } from "@/lib/prisma";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { SideToSide } from "@/components/SideToSide";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Page() {
  usePageTitle({ title: "Invoices" });
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
      where: {
        statusId: {
          not: "3f5c10b6-1301-4c0b-8da9-e2515865339e", // PAID
        },
      },
    });
    setInvoices(invoicesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  if (loading) return <Loader />;

  return (
    <Container>
      <h1>Invoices</h1>

      <SideToSide>
        <Select
          label="Open Invoice"
          icon={faMagnifyingGlass}
          options={invoices.map((invoice) => ({
            label: invoice.projects.map((project) => project.name).join(", "),
            value: invoice.id,
          }))}
          onValueChange={(invoiceId) =>
            router.push(LINKS.invoice.detail.project(invoiceId))
          }
          disabled={!(invoices && invoices.length)}
        />
      </SideToSide>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
