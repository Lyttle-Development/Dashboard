import { ServicePrice } from "@/lib/prisma";
import { Price } from "@/pages/dashboard/price/[category]/components/price";

export interface PricesProps {
  prices: ServicePrice[];
  setPrices: (prices: ServicePrice[]) => void;
}

export function Prices({ prices, setPrices }: PricesProps) {
  const setPrice = (newPrice: ServicePrice) => {
    const newPrices = prices.map((price) => {
      if (price.id === newPrice.id) {
        return newPrice;
      }
      return price;
    });
    setPrices(newPrices);
  };

  return (
    <section>
      <ul>
        {prices &&
          prices.length > 0 &&
          prices.map((price) => (
            <li key={price.id}>
              <Price price={price} setPrice={setPrice} />
            </li>
          ))}
      </ul>
    </section>
  );
}
