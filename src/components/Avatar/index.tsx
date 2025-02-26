import React from "react";
import Image from "next/image";
import { idToName } from "@/lib/discord";
import styles from "./index.module.scss";

export interface AvatarProps {
  userId: string;
}

export function Avatar({ userId }: AvatarProps) {
  return (
    <Image
      src={"/avatar/" + userId + ".jpg"}
      width={100}
      height={100}
      alt={idToName(userId) + "'s avatar."}
      className={styles.avatar}
    />
  );
}
