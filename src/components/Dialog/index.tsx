import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./index.module.scss";
import { Button } from "@/components/Button";

export interface DialogProps {
  buttonText?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (s: boolean) => void;
}

export function Dialog({
  buttonText = "Open dialog",
  title = "Dialog title",
  description = "Dialog description",
  children,
  open = false,
  onOpenChange = (s) => {},
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Trigger asChild>
        <Button onClick={() => onOpenChange(true)}>{buttonText}</Button>
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.Overlay} />
        <RadixDialog.Content className={styles.Content}>
          <RadixDialog.Title className={styles.Title}>
            {title}
          </RadixDialog.Title>
          <RadixDialog.Description className={styles.Description}>
            {description}
          </RadixDialog.Description>
          {children}
          <RadixDialog.Close asChild>
            <button className={styles.IconButton} aria-label="Close">
              <Cross2Icon />
            </button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
