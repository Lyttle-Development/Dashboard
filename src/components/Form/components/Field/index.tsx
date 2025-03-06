import * as React from "react";
import styles from "@/components/Form/index.module.scss";
import { Form as RadixForm } from "radix-ui";
import { FormOption, FormOptionType } from "@/components/Form";
import { safeParseFieldString } from "@/lib/parse";

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
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.EMAIL:
      return (
        <input
          className={styles.Input}
          type="email"
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.PASSWORD:
      return (
        <input
          className={styles.Input}
          type="password"
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.TEXTAREA:
      return (
        <textarea
          className={styles.Textarea}
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.CHECKBOX:
      return (
        <input
          className={styles.Input}
          type="checkbox"
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.DATE:
      return (
        <input
          className={styles.Input}
          type="date"
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.NUMBER:
      return (
        <input
          className={styles.Input}
          type="number"
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
        />
      );
    case FormOptionType.FILE:
      return (
        <input
          className={styles.Input}
          type="file"
          required={option.required}
          value={safeParseFieldString(option.value)}
          placeholder={option.placeholder}
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
        <RadixForm.Label className={styles.Label}>
          {option.label ?? option.key}
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
