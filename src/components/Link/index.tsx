import NextLink from "next/link";
import { useRouter } from "next/router";

export enum LinkTarget {
  BLANK = "_blank",
  PARENT = "_parent",
  SELF = "_self",
  TOP = "_top",
}

export interface LinkProps {
  href?: string;
  route?: string;
  target?: LinkTarget;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  classNameActive?: string;
}

export function Link({
  href,
  route,
  target,
  onClick,
  children,
  className,
  classNameActive,
}: LinkProps) {
  route = route ?? href;
  const router = useRouter();
  const active = router.pathname == route ? classNameActive : "";

  if (!href && onClick) {
    return (
      <a onClick={onClick} className={`${className} ${active}`} target={target}>
        {children}
      </a>
    );
  }

  if (href && !onClick) {
    return (
      <NextLink
        href={href}
        className={`${className} ${active}`}
        target={target}
      >
        {children}
      </NextLink>
    );
  }

  return <p>Invalid link!</p>;
}
