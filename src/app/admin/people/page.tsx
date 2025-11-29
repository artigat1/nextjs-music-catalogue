"use client";

import { useState, useMemo, useCallback } from "react";
import { usePeople, useDeletePerson } from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import { usePagination } from "@/hooks/usePagination";
import SortIcon from "@/components/ui/SortIcon";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Link from "next/link";

export default function PeoplePage() {
  const { data: people = [], isLoading: loading } = usePeople();
  const deletePersonMutation = useDeletePerson();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return people;
    const query = searchQuery.toLowerCase();
    return people.filter(
      (person) =>
        person.name?.toLowerCase().includes(query) ||
        person.info?.toLowerCase().includes(query)
    );
  }, [people, searchQuery]);

  const {
    sortedData: sortedPeople,
    sortField,
    sortOrder,
    handleSort,
  } = useTableSort({
    data: filteredPeople,
    defaultSortField: "name",
  });

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    setPage,
  } = usePagination({
    data: sortedPeople,
    pageSize: 25,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this person?")) return;
    try {
      await deletePersonMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  if (loading) return <div>Loading people...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-primary">People</h2>
          <p className="text-sm text-foreground/60 mt-1">
            {totalItems} {totalItems !== 1 ? 'people' : 'person'}{searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <Link
          href="/admin/people/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Add Person
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput
          placeholder="Search by name or info..."
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
                onClick={() => handleSort("info")}
              >
                Info
                <SortIcon
                  field="info"
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
            {paginatedData.map((person) => (
              <tr
                key={person.id}
                className="hover:bg-surface/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <Link
                    href={`/admin/people/${person.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {person.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-foreground/70 max-w-xs truncate">
                  {person.info}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/people/${person.id}`}
                    className="text-accent hover:text-primary mr-4 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(person.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-foreground/50">
                  {searchQuery ? `No people found matching "${searchQuery}"` : "No people found"}
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
