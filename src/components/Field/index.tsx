import * as React from "react";
import { Form as RadixForm } from "radix-ui";
import { FormField, FormOptionType } from "../Form";

export interface FormProps {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  type?: FormOptionType;
  onChange?: (value: string) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function Field({
  onChange = (v) => v,
  onSubmit = (e) => e,
  ...option
}: FormProps) {
  const handleOnchange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    onChange(target?.value ?? e.currentTarget.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  option.type = option.type ?? FormOptionType.TEXT;

  return (
    <RadixForm.Root onSubmit={handleSubmit}>
      <FormField option={option} onChange={handleOnchange} />
    </RadixForm.Root>
  );
}
