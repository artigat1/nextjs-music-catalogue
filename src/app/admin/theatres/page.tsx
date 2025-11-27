"use client";

import { useTheatres, useDeleteTheatre } from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import SortIcon from "@/components/ui/SortIcon";
import Link from "next/link";

export default function TheatresPage() {
  const { data: theatres = [], isLoading: loading } = useTheatres();
  const deleteTheatreMutation = useDeleteTheatre();
  const {
    sortedData: sortedTheatres,
    sortField,
    sortOrder,
    handleSort,
  } = useTableSort({
    data: theatres,
    defaultSortField: "name",
  });

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
        <h2 className="text-2xl font-bold font-serif text-primary">Theatres</h2>
        <Link
          href="/admin/theatres/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Add Theatre
        </Link>
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
            {sortedTheatres.map((theatre) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
