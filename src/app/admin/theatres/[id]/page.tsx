'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDocument, addDocument, updateDocument } from '@/firebase/firestore';
import { Theatre } from '@/types';
import { Timestamp } from 'firebase/firestore';

export default function TheatreEditorPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const isNew = params.id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        if (!isNew) {
            const fetchTheatre = async () => {
                try {
                    const data = await getDocument('theatres', params.id);
                    if (data) {
                        const theatre = data as Theatre;
                        setName(theatre.name);
                        setCity(theatre.city);
                        setCountry(theatre.country);
                    } else {
                        console.error("Theatre not found");
                        router.push('/admin/theatres');
                    }
                } catch (error) {
                    console.error("Error fetching theatre:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTheatre();
        }
    }, [isNew, params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const theatreData: Partial<Theatre> = {
                name,
                city,
                country,
                dateUpdated: Timestamp.now(),
            };

            if (!isNew) {
                await updateDocument('theatres', params.id, theatreData);
            } else {
                theatreData.dateAdded = Timestamp.now();
                await addDocument('theatres', theatreData);
            }

            router.push('/admin/theatres');
        } catch (error) {
            console.error("Error saving theatre:", error);
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{isNew ? 'Add Theatre' : 'Edit Theatre'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : (isNew ? 'Add Theatre' : 'Save Changes')}
                    </button>
                </div>
            </form>
        </div>
    );
}
