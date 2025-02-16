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
import { Category } from "@/lib/prisma";

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
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  if (loading) return <Loader />;
  if (!categories?.length) return <div>No projects found</div>;

  return (
    <Container>
      <h1>Prices</h1>
      <Button href="/dashboard/price/create">
        <Icon icon={faCalendarPlus}>Create Price</Icon>
      </Button>
      <Select
        label="Select Price Category"
        options={mapPrintsToOptions(categories)}
        onValueChange={(projectId) =>
          router.push(`/dashboard/price/${projectId}`)
        }
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
