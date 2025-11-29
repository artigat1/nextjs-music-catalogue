'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDocument, addDocument, updateDocument } from '@/firebase/firestore';
import { Person } from '@/types';
import { Timestamp } from 'firebase/firestore';

export default function PersonEditorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [info, setInfo] = useState('');

    useEffect(() => {
        if (!isNew && id) {
            const fetchPerson = async () => {
                try {
                    const data = await getDocument('people', id);
                    if (data) {
                        const person = data as Person;
                        setName(person.name || '');
                        setInfo(person.info || '');
                    } else {
                        console.error("Person not found");
                        router.push('/admin/people');
                    }
                } catch (error) {
                    console.error("Error fetching person:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPerson();
        }
    }, [isNew, id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const personData: Partial<Person> = {
                name,
                info,
                dateUpdated: Timestamp.now(),
            };

            if (!isNew) {
                await updateDocument('people', id, personData);
            } else {
                personData.dateAdded = Timestamp.now();
                await addDocument('people', personData);
            }

            router.push('/admin/people');
        } catch (error) {
            console.error("Error saving person:", error);
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-primary">{isNew ? 'Add Person' : 'Edit Person'}</h2>
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
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Info</label>
                    <textarea
                        value={info}
                        onChange={(e) => setInfo(e.target.value)}
                        className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        rows={4}
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
                        {saving ? 'Saving...' : (isNew ? 'Add Person' : 'Save Changes')}
                    </button>
                </div>
            </form>
        </div>
    );
}
