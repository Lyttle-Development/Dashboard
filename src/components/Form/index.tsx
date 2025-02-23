import * as React from "react";
import { Form as RadixForm } from "radix-ui";
import styles from "./index.module.scss";
import { FormField } from "@/components/Form/components/Field";
import { Submit } from "@/components/Form/components/Submit";

export interface FormResult {
  [key: string]: string | number | boolean | File;
}

export interface FormProps {
  options: FormOption[];
  onChange?: (value: string) => void;
  onSubmit?: (event: FormResult) => void;
}

export interface FormOption {
  key: string;
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  type?: FormOptionType;
}

export enum FormOptionType {
  CHECKBOX = "checkbox",
  DATE = "date",
  EMAIL = "email",
  NUMBER = "number",
  PASSWORD = "password",
  TEXT = "text",
  TEXTAREA = "textarea",
}

export function Form({
  options,
  onChange = (v) => v,
  onSubmit = (e) => e,
}: FormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const formData: FormResult = {};

  const handleOnchange = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLFormElement;
    onChange(target?.value ?? e.currentTarget.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFieldChange = (
    key: string,
    e: React.FormEvent<HTMLInputElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    formData[key] = target.value;
  };

  return (
    <RadixForm.Root
      ref={formRef}
      className={styles.Root}
      onSubmit={handleSubmit}
      onChange={handleOnchange}
    >
      {options.map((option) => (
        <FormField
          key={option.label}
          option={option}
          onChange={(e) => handleFieldChange(option.key, e)}
        />
      ))}
      <Submit />
    </RadixForm.Root>
  );
}
