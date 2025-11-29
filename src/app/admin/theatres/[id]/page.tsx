'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDocument, addDocument, updateDocument } from '@/firebase/firestore';
import { Theatre } from '@/types';
import { Timestamp } from 'firebase/firestore';

export default function TheatreEditorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        if (!isNew && id) {
            const fetchTheatre = async () => {
                try {
                    const data = await getDocument('theatres', id);
                    if (data) {
                        const theatre = data as Theatre;
                        setName(theatre.name || '');
                        setCity(theatre.city || '');
                        setCountry(theatre.country || '');
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
    }, [isNew, id, router]);

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
                await updateDocument('theatres', id, theatreData);
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
                <h2 className="text-2xl font-bold font-serif text-primary">{isNew ? 'Add Theatre' : 'Edit Theatre'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">City</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Country</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-foreground/70 hover:bg-surface rounded-md transition-colors"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : (isNew ? 'Add Theatre' : 'Save Changes')}
                    </button>
                </div>
            </form>
        </div>
    );
}
