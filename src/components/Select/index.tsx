import * as React from "react";
import { ForwardedRef, useState } from "react";
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
import { Field } from "@/components/Field";
import { FormValueTypes } from "@/components/Form";
import { Button } from "@/components/Button";
import { SideToSide } from "@/components/SideToSide";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export interface SelectProps extends RadixSelectProps {
  label: string;
  icon?: IconProp;
  options: (SelectItemProps | SelectGroupProps)[];
  alwaysShowLabel?: boolean;
  className?: string;
  searchable?: boolean;
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

const isSelectGroupProps = (
  option: SelectItemProps | SelectGroupProps,
): option is SelectGroupProps => {
  return (option as SelectGroupProps).options !== undefined;
};

export function Select({
  label = "Select",
  icon,
  options: originalOptions,
  alwaysShowLabel = false,
  className,
  searchable = false,
  ...props
}: SelectProps) {
  const [options, setOptions] =
    useState<(SelectItemProps | SelectGroupProps)[]>(originalOptions);
  const [search, setSearch] = useState<FormValueTypes>("");
  const [searching, setSearching] = useState(false);

  if (searching) {
    return (
      <Field
        label={`Search: ${label}`}
        onChange={setSearch}
        onSubmit={() => {
          const newOptions = originalOptions.filter((option) => {
            if (isSelectGroupProps(option)) {
              return (
                option.label
                  ?.toString()
                  .toLowerCase()
                  .includes(search.toString().toLowerCase()) ||
                option.options.some((opt) =>
                  opt.label
                    ?.toString()
                    .toLowerCase()
                    .includes(search.toString().toLowerCase()),
                )
              );
            }
            return (option.label ?? option.children)
              ?.toString()
              .toLowerCase()
              .includes(search.toString().toLowerCase());
          });

          setOptions(newOptions);
          if (newOptions.length === 1) {
            // If there is only one option, select it.
            props.onValueChange((newOptions[0] as SelectItemProps).value);
          }
          setSearching(false);
        }}
        autoFocus
      />
    );
  }

  return (
    <SideToSide className={styles.side_to_side}>
      <RadixSelect.Root {...props}>
        <article className={styles.group}>
          {(props.value || alwaysShowLabel) && (
            <label className={styles.label}>{label}</label>
          )}
          <RadixSelect.Trigger
            className={classNames(
              styles.Trigger,
              {
                [styles.disabled]: props.disabled || options.length === 0,
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
                  if (isSelectGroupProps(option)) {
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
        </article>
      </RadixSelect.Root>
      {searchable && (
        <Button onClick={() => setSearching(!searching)}>
          <Icon icon={faMagnifyingGlass}></Icon>
        </Button>
      )}
    </SideToSide>
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
