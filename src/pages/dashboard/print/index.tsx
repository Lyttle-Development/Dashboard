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
  // Sort projects by creation date
  prints.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
      table: "print-job",
      where: { invoiceId: null },
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
      <h1>Printing</h1>
      <Select
        label="Select Print Job"
        options={mapPrintsToOptions(prints)}
        onValueChange={(projectId) =>
          router.push(`/dashboard/print/${projectId}`)
        }
      />
      <Button href="/dashboard/print/create">
        <Icon icon={faCalendarPlus}>Create Print Job</Icon>
      </Button>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
