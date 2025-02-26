import * as React from "react";
import { Switch as RadixSwitch } from "radix-ui";
import type { SwitchProps as RadixSwitchProps } from "@radix-ui/react-switch";
import styles from "./index.module.scss";

interface SwitchProps extends RadixSwitchProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  label,
  checked = false,
  onCheckedChange = () => {},
  ...props
}: SwitchProps) {
  return (
    <form>
      <div style={{ display: "flex", alignItems: "center" }}>
        <label
          className={styles.Label}
          htmlFor="airplane-mode"
          style={{ paddingRight: 15 }}
        >
          {label}
        </label>
        <RadixSwitch.Root
          className={styles.Root}
          id="airplane-mode"
          {...props}
          checked={checked}
          onCheckedChange={onCheckedChange}
        >
          <RadixSwitch.Thumb className={styles.Thumb} />
        </RadixSwitch.Root>
      </div>
    </form>
  );
}
