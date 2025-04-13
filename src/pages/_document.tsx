import { Head, Html, Main, NextScript } from "next/document";
import { SITE_NAME } from "@/constants";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <title>{SITE_NAME}</title>

        {/* <!-- Favicon for browsers that support SVG format --> */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* <!-- Favicon for browsers that support PNG format --> */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* <!-- Favicon for older browsers or those that support ICO format --> */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        {/* <!-- For Apple devices --> */}
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* <!-- For Android devices (optional) --> */}
        <link rel="icon" sizes="192x192" href="/favicon.png" />
        {/* <!-- For Android devices (recommended) --> */}
        <meta name="theme-color" content="#ffffff" />

        {
          // Add Umami (only if the environment variable is set)
          process.env.UMAMI_WEBSITE_ID && (
            <script
              defer
              src="https://umami.app.lyttle.dev/script.js"
              data-website-id={process.env.UMAMI_WEBSITE_ID}
            />
          )
        }

        {/* <!-- Basic styles --> */}
        <style>
          {`
            body {
              font-family: 'Varela Round', Helvetica, Arial, sans-serif;
            }
          `}
        </style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
