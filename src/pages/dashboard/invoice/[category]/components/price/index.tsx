import { ServicePrice } from "@/lib/prisma";
import styles from "./index.module.scss";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";

export interface PriceProps {
  price: ServicePrice;
  setPrice: (price: ServicePrice) => void;
}

export function Price({ price, setPrice: _setPrice }: PriceProps) {
  const setPrice = (key: string, value: string | number) => {
    _setPrice({
      ...price,
      [key]: value,
    });
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
    </article>
  );
}

export default Price;
