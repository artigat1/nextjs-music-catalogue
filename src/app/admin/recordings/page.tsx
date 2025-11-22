'use client';

import { useRecordings, useDeleteRecording } from '@/hooks/useQueries';
import Link from 'next/link';

export default function RecordingsPage() {
    const { data: recordings = [], isLoading: loading } = useRecordings();
    const deleteRecordingMutation = useDeleteRecording();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recording?')) return;
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
                <h2 className="text-2xl font-bold font-serif text-primary">Recordings</h2>
                <Link
                    href="/admin/recordings/new"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Add Recording
                </Link>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-accent/20 overflow-hidden">
                <table className="min-w-full divide-y divide-accent/10">
                    <thead className="bg-surface/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif">Theatre</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-primary uppercase tracking-wider font-serif">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-accent/10">
                        {recordings.map((recording) => (
                            <tr key={recording.id} className="hover:bg-surface/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                    <Link href={`/admin/recordings/${recording.id}`} className="hover:text-primary hover:underline">
                                        {recording.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                                    <Link href={`/admin/recordings/${recording.id}`} className="hover:text-primary hover:underline">
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
                    </tbody>
                </table>
            </div>
        </div>
    );
}
