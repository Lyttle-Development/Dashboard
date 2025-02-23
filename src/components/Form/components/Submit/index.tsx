import { Form as RadixForm } from "radix-ui";
import styles from "@/components/Form/index.module.scss";
import * as React from "react";

export function Submit() {
  return (
    <RadixForm.Submit asChild>
      <button className={styles.Button} style={{ marginTop: 10 }} type="submit">
        Submit
      </button>
    </RadixForm.Submit>
  );
}
