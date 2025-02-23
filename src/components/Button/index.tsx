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
  style?: ButtonStyle;
}

export enum ButtonStyle {
  Default = "default",
  Primary = "primary",
  Danger = "danger",
}

export function Button({
  children,
  onClick,
  href,
  className,
  disabled,
  style = ButtonStyle.Default,
}: ButtonProps) {
  const buttonClass = classnames(styles.Trigger, className, {
    [styles.disabled]: disabled,
    [styles.primary]: style === ButtonStyle.Primary,
    [styles.danger]: style === ButtonStyle.Danger,
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
