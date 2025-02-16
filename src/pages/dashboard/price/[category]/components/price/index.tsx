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
        onChange={(v) => setPrice("standard", parseInt(v))}
        value={price.standard.toString()}
        label="Price (Standard)"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={(v) => setPrice("standardMin", parseInt(v))}
        value={price.standardMin.toString()}
        label="Price (Standard Min)"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={(v) => setPrice("standardMax", parseInt(v))}
        value={price.standardMax.toString()}
        label="Price (Standard Max)"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={(v) => setPrice("friends", parseInt(v))}
        value={price.friends.toString()}
        label="Price (Friends)"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={(v) => setPrice("friendsMin", parseInt(v))}
        value={price.friendsMin.toString()}
        label="Price (Friends Min)"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={(v) => setPrice("friendsMax", parseInt(v))}
        value={price.friendsMax.toString()}
        label="Price (Friends Max)"
        type={FormOptionType.TEXT}
      />
    </article>
  );
}
