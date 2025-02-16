import React from "react";
import Link from "next/link";
import classnames from "classnames";
import styles from "./index.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  href,
  className,
  disabled,
}: ButtonProps) {
  const buttonClass = classnames(styles.Trigger, className, {
    [styles.disabled]: disabled,
  });

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClass}
        onClick={disabled ? undefined : onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClass}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
