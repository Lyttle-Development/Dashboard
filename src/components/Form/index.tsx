import * as React from "react";
import { Form as RadixForm } from "radix-ui";
import styles from "./index.module.scss";

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

interface FormFieldProps {
  option: FormOption;
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
}

function GetFormField({ option }: FormFieldProps) {
  switch (option.type) {
    case FormOptionType.TEXT:
      return (
        <input
          className={styles.Input}
          type="text"
          required={option.required}
          value={option.value}
        />
      );
    case FormOptionType.EMAIL:
      return (
        <input
          className={styles.Input}
          type="email"
          required={option.required}
          value={option.value}
        />
      );
    case FormOptionType.PASSWORD:
      return (
        <input
          className={styles.Input}
          type="password"
          required={option.required}
          value={option.value}
        />
      );
    case FormOptionType.TEXTAREA:
      return (
        <textarea
          className={styles.Textarea}
          required={option.required}
          value={option.value}
        />
      );
    case FormOptionType.CHECKBOX:
      return (
        <input
          className={styles.Input}
          type="checkbox"
          required={option.required}
          value={option.value}
        />
      );
    case FormOptionType.DATE:
      return (
        <input
          className={styles.Input}
          type="date"
          required={option.required}
          value={option.value}
        />
      );
    case FormOptionType.NUMBER:
      return (
        <input
          className={styles.Input}
          type="number"
          required={option.required}
          value={option.value}
        />
      );
    default:
      return null;
  }
}

export function FormField({ option, onChange = (e) => e }: FormFieldProps) {
  return (
    <RadixForm.Field
      className={styles.Field}
      name={option.key}
      onChange={onChange}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <RadixForm.Label className={styles.Label}>{option.key}</RadixForm.Label>
        <RadixForm.Message className={styles.Message} match="valueMissing">
          Please enter something
        </RadixForm.Message>
        <RadixForm.Message className={styles.Message} match="typeMismatch">
          Please check the format
        </RadixForm.Message>
      </div>
      <RadixForm.Control asChild>
        <GetFormField option={option} />
      </RadixForm.Control>
    </RadixForm.Field>
  );
}

export function Submit() {
  return (
    <RadixForm.Submit asChild>
      <button className={styles.Button} style={{ marginTop: 10 }} type="submit">
        Submit
      </button>
    </RadixForm.Submit>
  );
}
