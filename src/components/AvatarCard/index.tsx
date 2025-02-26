import React from "react";
import { Avatar } from "@/components/Avatar";
import { idToName } from "@/lib/discord";
import styles from "./index.module.scss";

export interface AvatarCardProps {
  userId: string;
  title?: string;
  description?: string;
  children?: string | React.ReactNode;
}

export function AvatarCard({
  userId,
  title,
  description,
  children,
}: AvatarCardProps) {
  title = title ?? idToName(userId);

  return (
    <article className={styles.avatar_card}>
      <Avatar userId={userId} />
      <div className={styles.group}>
        <h5 className={styles.title}>{title}</h5>
        <p className={styles.description}>{children || description}</p>
      </div>
    </article>
  );
}
