"use client";

import { useState, useMemo, useCallback } from "react";
import { useTheatres, useDeleteTheatre } from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import { usePagination } from "@/hooks/usePagination";
import SortIcon from "@/components/ui/SortIcon";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Link from "next/link";

export default function TheatresPage() {
  const { data: theatres = [], isLoading: loading } = useTheatres();
  const deleteTheatreMutation = useDeleteTheatre();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTheatres = useMemo(() => {
    if (!searchQuery.trim()) return theatres;
    const query = searchQuery.toLowerCase();
    return theatres.filter(
      (theatre) =>
        theatre.name?.toLowerCase().includes(query) ||
        theatre.city?.toLowerCase().includes(query) ||
        theatre.country?.toLowerCase().includes(query)
    );
  }, [theatres, searchQuery]);

  const {
    sortedData: sortedTheatres,
    sortField,
    sortOrder,
    handleSort,
  } = useTableSort({
    data: filteredTheatres,
    defaultSortField: "name",
  });

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    setPage,
  } = usePagination({
    data: sortedTheatres,
    pageSize: 25,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theatre?")) return;
    try {
      await deleteTheatreMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting theatre:", error);
    }
  };

  if (loading) return <div>Loading theatres...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-primary">Theatres</h2>
          <p className="text-sm text-foreground/60 mt-1">
            {totalItems} theatre{totalItems !== 1 ? 's' : ''}{searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <Link
          href="/admin/theatres/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Add Theatre
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput
          placeholder="Search by name, city, or country..."
          onSearch={handleSearch}
        />
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-accent/20 overflow-hidden">
        <table className="min-w-full divide-y divide-accent/10">
          <thead className="bg-surface/50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif cursor-pointer hover:bg-accent/5"
                onClick={() => handleSort("name")}
              >
                Name
                <SortIcon
                  field="name"
                  currentField={sortField}
                  direction={sortOrder}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif cursor-pointer hover:bg-accent/5"
                onClick={() => handleSort("city")}
              >
                City
                <SortIcon
                  field="city"
                  currentField={sortField}
                  direction={sortOrder}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif cursor-pointer hover:bg-accent/5"
                onClick={() => handleSort("country")}
              >
                Country
                <SortIcon
                  field="country"
                  currentField={sortField}
                  direction={sortOrder}
                />
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-primary uppercase tracking-wider font-serif">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-accent/10">
            {paginatedData.map((theatre) => (
              <tr
                key={theatre.id}
                className="hover:bg-surface/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <Link
                    href={`/admin/theatres/${theatre.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {theatre.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                  {theatre.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                  {theatre.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/theatres/${theatre.id}`}
                    className="text-accent hover:text-primary mr-4 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(theatre.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-foreground/50">
                  {searchQuery ? `No theatres found matching "${searchQuery}"` : "No theatres found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
