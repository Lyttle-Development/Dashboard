import styles from "./index.module.scss";

interface KeyValueProps {
  label: string;
  value: string | number;
}

export function KeyValue({ label, value }: KeyValueProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
