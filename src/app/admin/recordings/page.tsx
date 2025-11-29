"use client";

import { useState, useMemo, useCallback } from "react";
import { useRecordings, useDeleteRecording } from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import { usePagination } from "@/hooks/usePagination";
import SortIcon from "@/components/ui/SortIcon";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Link from "next/link";

export default function RecordingsPage() {
  const { data: recordings = [], isLoading: loading } = useRecordings();
  const deleteRecordingMutation = useDeleteRecording();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecordings = useMemo(() => {
    if (!searchQuery.trim()) return recordings;
    const query = searchQuery.toLowerCase();
    return recordings.filter(
      (recording) =>
        recording.title?.toLowerCase().includes(query) ||
        recording.theatreName?.toLowerCase().includes(query) ||
        recording.city?.toLowerCase().includes(query)
    );
  }, [recordings, searchQuery]);

  const {
    sortedData: sortedRecordings,
    sortField,
    sortOrder,
    handleSort,
  } = useTableSort({
    data: filteredRecordings,
    defaultSortField: "title",
  });

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    setPage,
  } = usePagination({
    data: sortedRecordings,
    pageSize: 25,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;
    try {
      await deleteRecordingMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting recording:", error);
    }
  };

  if (loading) return <div>Loading recordings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-primary">
            Recordings
          </h2>
          <p className="text-sm text-foreground/60 mt-1">
            {totalItems} recording{totalItems !== 1 ? 's' : ''}{searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <Link
          href="/admin/recordings/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Add Recording
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput
          placeholder="Search by title, theatre, or city..."
          onSearch={handleSearch}
        />
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-accent/20 overflow-hidden">
        <table className="min-w-full divide-y divide-accent/10">
          <thead className="bg-surface/50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif cursor-pointer hover:bg-accent/5"
                onClick={() => handleSort("title")}
              >
                Title
                <SortIcon
                  field="title"
                  currentField={sortField}
                  direction={sortOrder}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif cursor-pointer hover:bg-accent/5"
                onClick={() => handleSort("theatreName")}
              >
                Theatre
                <SortIcon
                  field="theatreName"
                  currentField={sortField}
                  direction={sortOrder}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif cursor-pointer hover:bg-accent/5"
                onClick={() => handleSort("recordingDate")}
              >
                Date
                <SortIcon
                  field="recordingDate"
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
            {paginatedData.map((recording) => (
              <tr
                key={recording.id}
                className="hover:bg-surface/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <Link
                    href={`/admin/recordings/${recording.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {recording.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                  <Link
                    href={`/admin/recordings/${recording.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {recording.theatreName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                  {recording.recordingDate?.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/recordings/${recording.id}`}
                    className="text-accent hover:text-primary mr-4 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(recording.id)}
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
                  {searchQuery ? `No recordings found matching "${searchQuery}"` : "No recordings found"}
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
