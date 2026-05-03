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
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  title?: string;
}

export enum ButtonStyle {
  Default = "default",
  Primary = "primary",
  Danger = "danger",
  Secondary = "secondary",
  Success = "success",
}

export function Button({
  children,
  onClick,
  href,
  className,
  disabled,
  style = ButtonStyle.Default,
  variant,
  size,
  title,
}: ButtonProps) {
  const resolvedStyle = variant
    ? (ButtonStyle[variant.charAt(0).toUpperCase() + variant.slice(1) as keyof typeof ButtonStyle] ?? style)
    : style;

  const buttonClass = classnames(styles.Trigger, className, {
    [styles.disabled]: disabled,
    [styles.primary]: resolvedStyle === ButtonStyle.Primary,
    [styles.danger]: resolvedStyle === ButtonStyle.Danger,
    [styles.secondary]: resolvedStyle === ButtonStyle.Secondary,
    [styles.success]: resolvedStyle === ButtonStyle.Success,
    [styles.small]: size === "small",
    [styles.large]: size === "large",
  });

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClass}
        onClick={disabled ? undefined : onClick}
        title={title}
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
      title={title}
    >
      {children}
    </button>
  );
}
