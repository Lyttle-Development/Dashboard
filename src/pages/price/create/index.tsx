import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Category, IntervalEnum, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import { useRouter } from "next/router";
import { Loader } from "@/components/Loader";
import { safeParseFloat } from "@/lib/parse";
import { LINKS } from "@/links";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FormOptionType } from "@/components/Form";

type updatePrice = Omit<
  ServicePrice,
  "id" | "projects" | "printJobs" | "Invoice" | "updatedAt" | "createdAt"
>;

function Page() {
  usePageTitle({ title: "Create Price" });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState<updatePrice>({
    categoryId: null,
    service: null,
    price: null,
    description: null,
    notes: null,
    interval: null,
  });

  const updatePrice = (key: keyof ServicePrice, value: string | number) => {
    setPrice((prev) => ({ ...prev, [key]: value }));
  };

  const fetchCategories = async () => {
    setLoading(true);
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData);
    setLoading(false);
  };

  const createPrice = async () => {
    setLoading(true);
    const data = await fetchApi<ServicePrice>({
      table: "servicePrice",
      method: "POST",
      body: price,
    });
    setLoading(false);
    void router.push(LINKS.price.detail(data.categoryId));
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const validPrice = !!price.categoryId && !!price.service && !!price.price;

  if (loading) {
    return <Loader />;
  }

  return (
    <Container>
      <h1>Create Price</h1>
      <Select
        label="Category"
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        required
        onValueChange={(c) => updatePrice("categoryId", c)}
      />
      <Field
        label="Service"
        required
        onChange={(value) =>
          updatePrice("service", typeof value === "string" ? value : "")
        }
      />
      <Field
        label="Description"
        required
        onChange={(value) =>
          updatePrice("description", typeof value === "string" ? value : "")
        }
        type={FormOptionType.TEXTAREA}
      />
      <Field
        label="Price"
        required
        onChange={(p) => updatePrice("price", safeParseFloat(p) || 0)}
      />
      <Field
        label="Notes"
        required
        onChange={(value) =>
          updatePrice("notes", typeof value === "string" ? value : "")
        }
        type={FormOptionType.TEXTAREA}
      />
      <Select
        label="Select Interval"
        options={(Object.values(IntervalEnum) as string[]).map((interval) => ({
          label: interval,
          value: interval,
        }))}
        onValueChange={(value) =>
          updatePrice("interval", typeof value === "string" ? value : "")
        }
        value={price.interval?.toString()}
        searchable
      />
      {validPrice && <Button onClick={createPrice}>Create Price</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
