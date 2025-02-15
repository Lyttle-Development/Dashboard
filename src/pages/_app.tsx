import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import "./../styles/reset.scss";
import "./../styles/defaults.scss";
import "@radix-ui/themes/styles.css";
import "./../styles/global.scss";
import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/contexts/App.provider";

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider>
      <AppProvider>{getLayout(<Component {...pageProps} />)}</AppProvider>
    </SessionProvider>
  );
}
