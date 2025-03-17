import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./index.module.scss";
import { fetchPreview } from "@/lib/fetchApi";

export interface PreviewProps {
  link: string;
  image?: string;
  onImage?: (image: string) => void;
}

export function Preview({
  link,
  image,
  onImage = (img) => null,
}: PreviewProps) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const previewData = await fetchPreview(link);
      setPreview(previewData?.image ?? null);
      if (previewData?.image) onImage(previewData?.image);
      setLoading(false);
    };
    void fetch();
  }, [link]);

  if (loading && !preview && !image) return null;

  return (
    <Image
      src={loading || !preview ? image : preview}
      width={500}
      height={500}
      alt={link + "'s avatar."}
      className={styles.preview}
    />
  );
}
