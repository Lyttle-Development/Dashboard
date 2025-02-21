import { ServicePrice } from "@/lib/prisma";
import styles from "./index.module.scss";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";

export interface PriceProps {
  price: ServicePrice;
  setPrice: (price: ServicePrice) => void;
  reloadPrices: () => Promise<void>;
}

export function Price({
  price,
  setPrice: _setPrice,
  reloadPrices,
}: PriceProps) {
  const setPrice = (key: string, value: string | number) => {
    _setPrice({
      ...price,
      [key]: value,
    });
  };

  const deletePrice = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this price?",
    );
    if (confirmDelete) {
      await fetchApi({
        table: "servicePrice",
        method: "DELETE",
        id: price.id,
      });
      reloadPrices();
    }
  };

  return (
    <article className={styles.price}>
      <Field
        onChange={(v) => setPrice("service", v)}
        value={price.service}
        label="Service"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={(v) => setPrice("price", parseInt(v))}
        value={price.price?.toString() ?? "0"}
        label="Price"
        type={FormOptionType.TEXT}
      />
      <Button onClick={deletePrice}>Delete</Button>
    </article>
  );
}

export default Price;
