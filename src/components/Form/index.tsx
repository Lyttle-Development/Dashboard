import * as React from "react";
import { Form as RadixForm } from "radix-ui";
import styles from "./index.module.scss";

export interface FormProps {
  options: FormOption[];
}

export interface FormOption {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  type?: FormOptionType;
}

export enum FormOptionType {
  TEXT = "text",
  EMAIL = "email",
  PASSWORD = "password",
  TEXTAREA = "textarea",
  SELECT = "select",
  RADIO = "radio",
  CHECKBOX = "checkbox",
}

export function Form({ options }: FormProps) {
  return (
    <RadixForm.Root className={styles.Root}>
      {options.map((option) => (
        <FormField key={option.label} option={option} />
      ))}
      <Submit />
    </RadixForm.Root>
  );
}

interface FormFieldProps {
  option: FormOption;
}

function GetFormField({ option }: FormFieldProps) {
  switch (option.type) {
    case FormOptionType.TEXT:
      return (
        <input
          className={styles.Input}
          type="text"
          required={option.required}
        />
      );
    case FormOptionType.EMAIL:
      return (
        <input
          className={styles.Input}
          type="email"
          required={option.required}
        />
      );
    case FormOptionType.PASSWORD:
      return (
        <input
          className={styles.Input}
          type="password"
          required={option.required}
        />
      );
    case FormOptionType.TEXTAREA:
      return (
        <textarea className={styles.Textarea} required={option.required} />
      );
    case FormOptionType.SELECT:
      return <span>N/A</span>;
    case FormOptionType.RADIO:
      return <span>N/A</span>;
    case FormOptionType.CHECKBOX:
      return <span>N/A</span>;
    default:
      return null;
  }
}

export function FormField({ option }: FormFieldProps) {
  return (
    <RadixForm.Field className={styles.Field} name={option.label}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <RadixForm.Label className={styles.Label}>
          {option.label}
        </RadixForm.Label>
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
      <button className={styles.Button} style={{ marginTop: 10 }}>
        Submit
      </button>
    </RadixForm.Submit>
  );
}
