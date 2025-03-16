import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faCircleUser,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Select, SelectItemProps } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { PrintJob } from "@/lib/prisma";
import { SideToSide } from "@/components/SideToSide";

function mapPrintsToOptions(prints: any[]): SelectItemProps[] {
  // Sort projects by name
  prints.sort((a, b) => {
    return a?.firstname?.localeCompare(b?.firstname);
  });

  return prints.map((project) => {
    return {
      value: project.id,
      label: project.firstname + " " + project.lastname,
    } as SelectItemProps;
  });
}

export function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<PrintJob[]>([]);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    const projectsData = await fetchApi<PrintJob[]>({
      table: "customer",
    });
    setCustomer(projectsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCustomer();
  }, [fetchCustomer]);

  if (loading) return <Loader />;

  return (
    <Container>
      <h1>Customers</h1>

      <SideToSide>
        <Select
          label="Select Customer"
          icon={faMagnifyingGlass}
          options={mapPrintsToOptions(customer)}
          onValueChange={(projectId) => router.push(`/customer/${projectId}`)}
          disabled={!(customer && customer.length)}
          searchable
        />
        <Button href="/customer/create">
          <Icon icon={faCircleUser}>Create Customer</Icon>
        </Button>
      </SideToSide>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
