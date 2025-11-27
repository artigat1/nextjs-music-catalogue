"use client";

import { usePeople, useDeletePerson } from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import SortIcon from "@/components/ui/SortIcon";
import Link from "next/link";

export default function PeoplePage() {
  const { data: people = [], isLoading: loading } = usePeople();
  const deletePersonMutation = useDeletePerson();
  const {
    sortedData: sortedPeople,
    sortField,
    sortOrder,
    handleSort,
  } = useTableSort({
    data: people,
    defaultSortField: "name",
  });

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
        <h2 className="text-2xl font-bold font-serif text-primary">People</h2>
        <Link
          href="/admin/people/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Add Person
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
            {sortedPeople.map((person) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
