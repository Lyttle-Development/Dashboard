import { IntervalEnum, ServicePrice } from "@/lib/prisma";
import styles from "./index.module.scss";
import { Field } from "@/components/Field";
import { FormOptionType } from "@/components/Form";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { useState } from "react";
import { Select } from "@/components/Select";

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
  const [priceString, _setPriceString] = useState(price.price.toString());

  const setPriceString = (value: string) => {
    _setPriceString(value);
    const p = parseFloat(value);
    if (!isNaN(p)) {
      _setPrice({
        ...price,
        price: p,
      });
    }
  };

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
        onChange={(value) =>
          setPrice("service", typeof value === "string" ? value : "")
        }
        value={price.service}
        label="Service"
        type={FormOptionType.TEXT}
      />
      <Field
        onChange={setPriceString}
        value={priceString || "0"}
        label="Price"
        type={FormOptionType.TEXT}
      />
      <Select
        label="Interval"
        options={(Object.values(IntervalEnum) as string[]).map((interval) => ({
          label: interval,
          value: interval,
        }))}
        onValueChange={(value) =>
          setPrice("interval", typeof value === "string" ? value : "")
        }
        value={price.interval?.toString()}
        searchable
      />
      <Field
        onChange={(value) =>
          setPrice("description", typeof value === "string" ? value : "")
        }
        value={price.description || ""}
        label="Description"
        type={FormOptionType.TEXTAREA}
      />
      <Field
        onChange={(value) =>
          setPrice("notes", typeof value === "string" ? value : "")
        }
        value={price.notes || ""}
        label="Notes"
        type={FormOptionType.TEXTAREA}
      />
      <Button onClick={deletePrice}>Delete</Button>
    </article>
  );
}

export default Price;
