import { useMemo, useState } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  pageSize?: number;
}

interface UsePaginationResult<T> {
  paginatedData: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export function usePagination<T>({
  data,
  pageSize = 25,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page exceeds total pages (e.g., after filtering)
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, safePage, pageSize]);

  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  return {
    paginatedData,
    currentPage: safePage,
    totalPages,
    totalItems,
    setPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
  };
}
