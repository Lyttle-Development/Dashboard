import * as React from "react";
import { ForwardedRef } from "react";
import { Select as RadixSelect } from "radix-ui";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import type { SelectProps as RadixSelectProps } from "@radix-ui/react-select";
import classnames from "classnames";
import classNames from "classnames";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import styles from "./index.module.scss";
import { Icon } from "@/components/Icon";

export interface SelectProps extends RadixSelectProps {
  label: string;
  icon?: IconProp;
  options: SelectItemProps[] | SelectGroupProps[];
  alwaysShowLabel?: boolean;
  className?: string;
}

export interface SelectGroupProps {
  label: string;
  options: SelectItemProps[];
}

export interface SelectItemProps {
  value: string;
  children?: string | React.ReactNode;
  label?: string | React.ReactNode;
  className?: string;
}

export function Select({
  label = "Select",
  icon,
  options,
  alwaysShowLabel = false,
  className,
  ...props
}: SelectProps) {
  return (
    <RadixSelect.Root {...props}>
      {(props.value || alwaysShowLabel) && (
        <label className={styles.label}>{label}</label>
      )}
      <RadixSelect.Trigger
        className={classNames(
          styles.Trigger,
          {
            [styles.disabled]: props.disabled,
          },
          className,
        )}
      >
        <RadixSelect.Value
          placeholder={
            <span className={styles.value}>
              {icon && <Icon icon={icon} />}
              {label}
            </span>
          }
        />
        <RadixSelect.Icon className={styles.Icon}>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className={styles.Content}>
          <RadixSelect.ScrollUpButton className={styles.ScrollButton}>
            <ChevronUpIcon />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className={styles.Viewport}>
            {options.map((option, index) => {
              const addSeparator = index > 0 && index < options.length;
              if ("label" in option && "options" in option) {
                return (
                  <div key={index}>
                    {addSeparator && (
                      <RadixSelect.Separator className={styles.Separator} />
                    )}
                    <SelectGroup
                      key={index}
                      label={option.label}
                      options={option.options}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={index}>
                    {addSeparator && (
                      <RadixSelect.Separator className={styles.Separator} />
                    )}
                    <SelectItem key={index} value={option.value}>
                      {option.children || option.label}
                    </SelectItem>
                  </div>
                );
              }
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

function SelectGroup({ label, options }: SelectGroupProps) {
  return (
    <RadixSelect.Group className={styles.Label}>
      <RadixSelect.Label className="SelectLabel">{label}</RadixSelect.Label>
      {options.map((option, index) => (
        <SelectItem key={index} value={option.value}>
          {option.children || option.label}
        </SelectItem>
      ))}
    </RadixSelect.Group>
  );
}

const SelectItem = React.forwardRef(
  (
    { children, label, className, ...props }: SelectItemProps,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <RadixSelect.Item
        className={classnames(styles.Item, className)}
        {...props}
        ref={forwardedRef}
      >
        <RadixSelect.ItemText>{children || label}</RadixSelect.ItemText>
        <RadixSelect.ItemIndicator className={styles.ItemIndicator}>
          <CheckIcon />
        </RadixSelect.ItemIndicator>
      </RadixSelect.Item>
    );
  },
);
