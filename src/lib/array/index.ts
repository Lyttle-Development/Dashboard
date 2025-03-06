export function groupArrayBy<T>(
  list: T[] = [],
  by = (item: T): string => null,
): T[][] {
  const result: T[][] = [];
  for (const item of list) {
    const group = by(item);
    if (!group) continue;

    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
  }
  return result;
}

export function sortGroupedListBy<T>(
  list: T[][] = [],
  groups: string[] = [],
): T[][] {
  const result: T[][] = [];
  for (const group of groups) {
    result[group] = list[group];
  }
  return result;
}
