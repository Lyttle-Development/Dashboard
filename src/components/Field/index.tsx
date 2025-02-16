import * as React from "react";
import { Form as RadixForm } from "radix-ui";
import { FormField, FormOptionType } from "../Form";

export interface FormProps {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  type?: FormOptionType;
  onChange: (value: string) => void;
}

export function Field({ onChange, ...option }: FormProps) {
  return (
    <RadixForm.Root onChange={(e: any) => onChange(e.target?.value)}>
      <FormField option={option} />
    </RadixForm.Root>
  );
}
