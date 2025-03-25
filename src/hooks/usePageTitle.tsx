import { JSX, useEffect } from "react";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { SITE_NAME } from "@/constants";

interface UsePageTitleProps {
  title: string;
  description?: string;
}

/**
 * Custom hook for dynamically setting the page title and description.
 *
 * @param {string} title - The page-specific title (without site name).
 * @param {string} [description] - (Optional) SEO-friendly meta description.
 *
 * @returns {JSX.Element} - Head and SEO components for proper rendering.
 */
export const usePageTitle = ({
  title,
  description = "",
}: UsePageTitleProps): JSX.Element => {
  // ✅ Construct the full title dynamically
  const fullTitle: string = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // ✅ Effect to update the document title when title changes
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <>
      {/* ✅ Standard <head> updates */}
      <Head>
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>

      {/* ✅ Enhanced SEO metadata via next-seo */}
      <NextSeo title={fullTitle} description={description} />
    </>
  );
};
