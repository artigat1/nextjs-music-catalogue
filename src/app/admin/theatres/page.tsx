'use client';

import { useState, useEffect } from 'react';
import { getCollection, deleteDocument } from '@/firebase/firestore';
import { Theatre } from '@/types';
import Link from 'next/link';

export default function TheatresPage() {
    const [theatres, setTheatres] = useState<(Theatre & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTheatres();
    }, []);

    const fetchTheatres = async () => {
        setLoading(true);
        try {
            const data = await getCollection('theatres');
            setTheatres(data as (Theatre & { id: string })[]);
        } catch (error) {
            console.error("Error fetching theatres:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this theatre?')) return;
        try {
            await deleteDocument('theatres', id);
            fetchTheatres();
        } catch (error) {
            console.error("Error deleting theatre:", error);
        }
    };

    if (loading) return <div>Loading theatres...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Theatres</h2>
                <Link
                    href="/admin/theatres/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Add Theatre
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {theatres.map((theatre) => (
                            <tr key={theatre.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Link href={`/admin/theatres/${theatre.id}`} className="hover:text-indigo-900 hover:underline">
                                        {theatre.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{theatre.city}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{theatre.country}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/admin/theatres/${theatre.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(theatre.id)}
                                        className="text-red-600 hover:text-red-900"
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
