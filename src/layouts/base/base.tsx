import React from 'react';

export interface BaseProps {
  children: React.ReactNode;
}

export function Base({ children }: BaseProps) {
  return <>{children}</>;
}
