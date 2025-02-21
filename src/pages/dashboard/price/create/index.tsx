import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Category, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import { useRouter } from "next/router";

interface updatePrice {
  categoryId: string | null;
  service: string | null;
  price: number | null;
}

function Page() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState<updatePrice>({
    categoryId: null,
    service: null,
    price: null,
  });

  const updatePrice = (key: keyof ServicePrice, value: string | number) => {
    setPrice((prev) => ({ ...prev, [key]: value }));
  };

  const fetchCategories = async () => {
    const categoriesData = await fetchApi<Category[]>({
      table: "category",
    });
    setCategories(categoriesData);
  };

  const createPrice = async () => {
    const data = await fetchApi<ServicePrice>({
      table: "servicePrice",
      method: "POST",
      body: price,
    });
    void router.push(`/dashboard/price/${data.id}`);
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const validPrice = price.categoryId && price.service && price.price;

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
        onChange={(s) => updatePrice("service", s)}
      />
      <Field
        label="Price"
        required
        onChange={(p) => updatePrice("price", parseInt(p) || 0)}
      />
      {validPrice && <Button onClick={createPrice}>Create Price</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
