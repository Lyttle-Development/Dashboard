interface Props {
  onMobile: boolean;
}

/**
 * Custom hook to handle authentication logic
 */
export function useMobile(): Props {
  const onMobile = window.innerWidth < 768;

  return { onMobile };
}
