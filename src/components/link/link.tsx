import NextLink from 'next/link';
import { useRouter } from 'next/router';

export interface LinkProps {
  href?: string;
  route?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  classNameActive?: string;
}

export function Link({
  href,
  route,
  onClick,
  children,
  className,
  classNameActive,
}: LinkProps) {
  route = route ?? href;
  const router = useRouter();
  const active = router.pathname == route ? classNameActive : '';

  if (!href && onClick) {
    return (
      <a onClick={onClick} className={`${className} ${active}`}>
        {children}
      </a>
    );
  }

  if (href && !onClick) {
    return (
      <NextLink href={href} className={`${className} ${active}`}>
        {children}
      </NextLink>
    );
  }

  return <p>Invalid link!</p>;
}
