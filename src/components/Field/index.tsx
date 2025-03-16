import * as React from "react";
import { Form as RadixForm } from "radix-ui";
import { FormOptionType, FormValueTypes } from "../Form";
import { FormField } from "../Form/components/Field";

export interface FormProps {
  label: string;
  value?: FormValueTypes;
  placeholder?: string;
  required?: boolean;
  type?: FormOptionType;
  onChange?: (value: FormValueTypes) => void;
  onFile?: (value: FileList) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  autoFocus?: boolean;
}

export function Field({
  onChange = (v) => v,
  onFile = (v) => v,
  onSubmit = (e) => e,
  className,
  ...option
}: FormProps) {
  const handleOnchange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value: string = target?.value ?? e.currentTarget.value;
    // if file return the binary data
    if (option.type === FormOptionType.FILE) {
      return onFile(target.files);
    }
    onChange(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  option.type = option.type ?? FormOptionType.TEXT;

  return (
    <RadixForm.Root onSubmit={handleSubmit} className={className}>
      <FormField
        option={{ key: "field", ...option }}
        onChange={handleOnchange}
      />
    </RadixForm.Root>
  );
}
