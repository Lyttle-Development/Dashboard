import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { Category, ServicePrice } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/Button";
import { useRouter } from "next/router";
import { Loader } from "@/components/Loader";

interface updatePrice {
  categoryId: string | null;
  service: string | null;
  price: number | null;
}

function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
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
    void router.push(`/price/${data.id}`);
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const validPrice = price.categoryId && price.service && price.price;

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
        onChange={(s) => updatePrice("service", s)}
      />
      <Field
        label="Price"
        required
        onChange={(p) => updatePrice("price", parseFloat(p) || 0)}
      />
      {validPrice && <Button onClick={createPrice}>Create Price</Button>}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
