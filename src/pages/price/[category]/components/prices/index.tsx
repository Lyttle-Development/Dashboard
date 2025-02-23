import { ServicePrice } from "@/lib/prisma";
import { Price } from "@/pages/price/[category]/components/price";
import styles from "./index.module.scss";

export interface PricesProps {
  prices: ServicePrice[];
  setPrices: (prices: ServicePrice[]) => void;
  reloadPrices: () => Promise<void>;
}

export function Prices({ prices, setPrices, reloadPrices }: PricesProps) {
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
      <ul className={styles.prices}>
        {prices &&
          prices.length > 0 &&
          prices.map((price) => (
            <li key={price.id}>
              <Price
                price={price}
                setPrice={setPrice}
                reloadPrices={reloadPrices}
              />
            </li>
          ))}
      </ul>
    </section>
  );
}

export default Prices;
