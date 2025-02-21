import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";

interface LoaderProps {
  info?: string;
}

export function Loader({ info }: LoaderProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
      {info && <p className={styles.info}>{info}</p>}
    </div>
  );
}
