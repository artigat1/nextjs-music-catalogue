import { useState, useMemo } from "react";

export type SortOrder = "asc" | "desc";

interface UsTableSortProps<T> {
  data: T[];
  defaultSortField: string;
  defaultSortOrder?: SortOrder;
}

export function useTableSort<T extends Record<string, unknown>>({
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
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      // Handle string values with case-insensitive comparison
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Handle Firestore Timestamps (they have toMillis method)
      if (aValue && typeof aValue === "object" && "toMillis" in aValue) {
        aValue = aValue.toMillis();
      }
      if (bValue && typeof bValue === "object" && "toMillis" in bValue) {
        bValue = bValue.toMillis();
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
