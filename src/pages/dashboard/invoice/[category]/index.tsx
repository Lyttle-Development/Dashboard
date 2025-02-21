import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/layouts";
import { Loader } from "@/components/Loader";
import { Container } from "@/components/Container";
import { ServicePrice } from "@/lib/prisma";
import { fetchApi } from "@/lib/fetchApi";
import { Prices } from "@/pages/dashboard/price/[category]/components/prices";
import { Button } from "@/components/Button";

export function Page() {
  const router = useRouter();

  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [originalPrices, setOriginalPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the project details by id.
  const fetchPrices = useCallback(async (categoryId: string) => {
    setLoading(true);
    const pricesData = await fetchApi<ServicePrice[]>({
      table: "servicePrice",
      where: { categoryId },
      relations: { category: true },
    });

    setPrices(pricesData);
    setOriginalPrices(pricesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const categoryId = router.query.category as string;
    if (categoryId) {
      void fetchPrices(categoryId);
    }
  }, []);

  const changedPrices = prices.filter((price) => {
    const originalPrice = originalPrices.find((p) => p.id === price.id);
    return originalPrice?.price !== price.price;
  });

  const changed = changedPrices.length > 0;

  const submitChanges = () => {
    changedPrices.forEach(async (price) => {
      await fetchApi({
        method: "PUT",
        table: "servicePrice",
        id: price.id,
        body: {
          service: price.service,
          price: price.price,
        },
      });
    });
    setOriginalPrices(prices);
  };

  if (loading) return <Loader />;
  if (!prices) return <div>Prices not found</div>;

  return (
    <Container>
      <h1>Prices: {prices[0]?.category?.name}</h1>
      <Prices prices={prices} setPrices={setPrices} />
      {changed && (
        <Button onClick={submitChanges}>
          Submit Changes ({changedPrices.length} prices changed)
        </Button>
      )}
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
