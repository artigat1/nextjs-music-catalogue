import { useState, useMemo } from "react";

export type SortOrder = "asc" | "desc";

interface UsTableSortProps<T> {
  data: T[];
  defaultSortField: string;
  defaultSortOrder?: SortOrder;
}

export function useTableSort<T extends object>({
  data,
  defaultSortField,
  defaultSortOrder = "asc",
}: UsTableSortProps<T>) {
  const [sortField, setSortField] = useState<string>(defaultSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aRaw = (a as Record<string, unknown>)[sortField];
      const bRaw = (b as Record<string, unknown>)[sortField];

      let aValue: string | number = "";
      let bValue: string | number = "";

      // Handle string values with case-insensitive comparison
      if (typeof aRaw === "string") {
        aValue = aRaw.toLowerCase();
      } else if (typeof aRaw === "number") {
        aValue = aRaw;
      } else if (aRaw && typeof aRaw === "object" && "toMillis" in aRaw) {
        // Handle Firestore Timestamps
        aValue = (aRaw as { toMillis: () => number }).toMillis();
      }

      if (typeof bRaw === "string") {
        bValue = bRaw.toLowerCase();
      } else if (typeof bRaw === "number") {
        bValue = bRaw;
      } else if (bRaw && typeof bRaw === "object" && "toMillis" in bRaw) {
        // Handle Firestore Timestamps
        bValue = (bRaw as { toMillis: () => number }).toMillis();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortField, sortOrder]);

  return {
    sortedData,
    sortField,
    sortOrder,
    handleSort,
  };
}
