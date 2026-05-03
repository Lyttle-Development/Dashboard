import React from "react";
import { Icon } from "@/components/Icon";
import { faArrowRight, faFolder, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.scss";

export interface RelationshipItem {
  id: string;
  name: string;
  parentId?: string | null;
  children?: RelationshipItem[];
}

export interface ParentChildRelationshipProps<T extends RelationshipItem> {
  items: T[];
  currentItemId?: string;
  onItemClick?: (item: T) => void;
  itemRenderer?: (item: T) => React.ReactNode;
  maxDepth?: number;
}

/**
 * Generic component for displaying parent-child relationships (self-referential models)
 * Can be used for Projects, Categories, or any other hierarchical data
 */
export function ParentChildRelationship<T extends RelationshipItem>({
  items,
  currentItemId,
  onItemClick,
  itemRenderer,
  maxDepth = 5,
}: ParentChildRelationshipProps<T>) {
  // Build a hierarchy from flat list
  const buildHierarchy = (flatItems: T[]): T[] => {
    const itemMap = new Map<string, T>();
    const rootItems: T[] = [];

    // First pass: create map of all items
    flatItems.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    flatItems.forEach((item) => {
      const mappedItem = itemMap.get(item.id);
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        if (parent.children) {
          parent.children.push(mappedItem);
        }
      } else {
        rootItems.push(mappedItem);
      }
    });

    return rootItems;
  };

  const hierarchy = buildHierarchy(items);

  // Render a single item with its children
  const renderItem = (item: T, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.id === currentItemId;
    const isMaxDepth = depth >= maxDepth;

    return (
      <div
        key={item.id}
        className={`${styles.item} ${isCurrent ? styles.current : ""}`}
        style={{ marginLeft: `${depth * 1.5}rem` }}
      >
        <div
          className={styles.itemContent}
          onClick={() => onItemClick?.(item)}
          role={onItemClick ? "button" : undefined}
          tabIndex={onItemClick ? 0 : undefined}
        >
          <div className={styles.itemIcon}>
            {hasChildren ? (
              <Icon icon={faFolderOpen} />
            ) : (
              <Icon icon={faFolder} />
            )}
          </div>
          <div className={styles.itemLabel}>
            {itemRenderer ? itemRenderer(item) : item.name}
          </div>
          {depth > 0 && (
            <div className={styles.depth}>
              <Icon icon={faArrowRight} />
              <span>Level {depth}</span>
            </div>
          )}
        </div>
        {hasChildren && !isMaxDepth && (
          <div className={styles.children}>
            {item.children.map((child) => renderItem(child as T, depth + 1))}
          </div>
        )}
        {hasChildren && isMaxDepth && (
          <div className={styles.maxDepthWarning}>
            Max depth reached. {item.children.length} child item(s) not shown.
          </div>
        )}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon icon={faFolder} />
        <p>No items to display</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {hierarchy.map((item) => renderItem(item, 0))}
    </div>
  );
}
