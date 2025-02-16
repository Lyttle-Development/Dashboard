import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { Select, SelectItemProps } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { PrintJob } from "@/lib/prisma";

function mapPrintsToOptions(prints: any[]): SelectItemProps[] {
  // Sort projects by name
  prints.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return prints.map((project) => {
    return {
      value: project.id,
      children: project.name,
    } as SelectItemProps;
  });
}

export function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prints, setPrints] = useState<PrintJob[]>([]);

  const fetchPrints = useCallback(async () => {
    setLoading(true);
    const projectsData = await fetchApi<PrintJob[]>({
      table: "customer",
    });
    setPrints(projectsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPrints();
  }, [fetchPrints]);

  if (loading) return <Loader />;
  if (!prints?.length) return <div>No projects found</div>;

  return (
    <Container>
      <h1>Customers</h1>
      <Button href="/dashboard/customer/create">
        <Icon icon={faCalendarPlus}>Create Customer</Icon>
      </Button>
      <Select
        label="Select Customer"
        options={mapPrintsToOptions(prints)}
        onValueChange={(projectId) =>
          router.push(`/dashboard/customer/${projectId}`)
        }
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
