'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDocument, getCollection, addDocument, updateDocument } from '@/firebase/firestore';
import { Recording, Theatre, Person } from '@/types';
import { Timestamp, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import AutocompleteInput from '@/components/ui/AutocompleteInput';
import TheatreCreateModal from '@/components/ui/TheatreCreateModal';

export default function RecordingEditorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Data for dropdowns
    const [theatres, setTheatres] = useState<(Theatre & { id: string })[]>([]);
    const [people, setPeople] = useState<(Person & { id: string })[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [info, setInfo] = useState('');
    const [recordingDate, setRecordingDate] = useState('');
    const [selectedTheatreId, setSelectedTheatreId] = useState('');
    const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
    const [selectedComposerIds, setSelectedComposerIds] = useState<string[]>([]);
    const [selectedLyricistIds, setSelectedLyricistIds] = useState<string[]>([]);

    // Theatre Create Modal state
    const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
    const [pendingTheatreName, setPendingTheatreName] = useState('');
    const [theatreCreateResolve, setTheatreCreateResolve] = useState<((id: string) => void) | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [theats, peeps] = await Promise.all([
                    getCollection('theatres'),
                    getCollection('people')
                ]);
                setTheatres(theats as (Theatre & { id: string })[]);
                setPeople(peeps as (Person & { id: string })[]);

                if (!isNew && id) {
                    const recData = await getDocument('recordings', id);
                    if (recData) {
                        const recording = recData as Recording;
                        setTitle(recording.title || '');
                        setImageUrl(recording.imageUrl || '');
                        setInfo(recording.info || '');

                        const recDate = recording.recordingDate?.toDate();
                        setRecordingDate(recDate ? recDate.toISOString().split('T')[0] : '');

                        setSelectedTheatreId(recording.theatreRef?.id || '');

                        // Fallback to refs if ids arrays are missing (backward compatibility)
                        const artistIds = recording.artistIds || recording.artistRefs?.map(ref => ref.id) || [];
                        setSelectedArtistIds(artistIds);

                        const composerIds = recording.composerIds || recording.composerRefs?.map(ref => ref.id) || [];
                        setSelectedComposerIds(composerIds);

                        const lyricistIds = recording.lyricistIds || recording.lyricistRefs?.map(ref => ref.id) || [];
                        setSelectedLyricistIds(lyricistIds);
                    } else {
                        console.error("Recording not found");
                        router.push('/admin/recordings');
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isNew, id, router]);

    const createNewPerson = async (name: string): Promise<string> => {
        try {
            const newPersonData = {
                name: name.trim(),
                info: '',
                dateAdded: Timestamp.now(),
                dateUpdated: Timestamp.now(),
            };

            const newId = await addDocument('people', newPersonData);

            // Refresh people list
            const updatedPeople = await getCollection('people');
            setPeople(updatedPeople as (Person & { id: string })[]);

            return newId;
        } catch (error) {
            console.error('Error creating new person:', error);
            throw error;
        }
    };

    const createNewTheatre = async (name: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            setPendingTheatreName(name);
            setTheatreCreateResolve(() => resolve);
            setIsTheatreModalOpen(true);
        });
    };

    const handleTheatreCreate = async (name: string, city: string, country: string) => {
        try {
            const newTheatreData = {
                name: name.trim(),
                city: city.trim(),
                country: country.trim(),
                dateAdded: Timestamp.now(),
                dateUpdated: Timestamp.now(),
            };

            const newId = await addDocument('theatres', newTheatreData);

            // Refresh theatres list
            const updatedTheatres = await getCollection('theatres');
            setTheatres(updatedTheatres as (Theatre & { id: string })[]);

            if (theatreCreateResolve) {
                theatreCreateResolve(newId);
            }

            setIsTheatreModalOpen(false);
            setPendingTheatreName('');
            setTheatreCreateResolve(null);
        } catch (error) {
            console.error('Error creating new theatre:', error);
            throw error;
        }
    };

    const handleTheatreModalClose = () => {
        setIsTheatreModalOpen(false);
        setPendingTheatreName('');
        setTheatreCreateResolve(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const theatre = theatres.find(t => t.id === selectedTheatreId);
            if (!theatre) throw new Error('Theatre not found');

            const artistRefs = selectedArtistIds.map(id => doc(db, 'people', id));
            const composerRefs = selectedComposerIds.map(id => doc(db, 'people', id));
            const lyricistRefs = selectedLyricistIds.map(id => doc(db, 'people', id));

            const artistNames = people.filter(p => selectedArtistIds.includes(p.id)).map(p => p.name);

            const recDateTimestamp = recordingDate
                ? Timestamp.fromDate(new Date(recordingDate))
                : Timestamp.now();

            const releaseYear = recordingDate
                ? new Date(recordingDate).getFullYear()
                : new Date().getFullYear();

            const recordingData: Partial<Recording> = {
                title,
                imageUrl,
                info,
                releaseYear,
                recordingDate: recDateTimestamp,
                dateUpdated: Timestamp.now(),
                theatreRef: doc(db, 'theatres', selectedTheatreId),
                theatreName: theatre.name,
                city: theatre.city,
                artistRefs,
                artistNames,
                artistIds: selectedArtistIds,
                composerRefs,
                composerIds: selectedComposerIds,
                lyricistRefs,
                lyricistIds: selectedLyricistIds,
            };

            if (!isNew) {
                await updateDocument('recordings', id, recordingData);
            } else {
                recordingData.dateAdded = Timestamp.now();
                await addDocument('recordings', recordingData);
            }

            router.push('/admin/recordings');
        } catch (error) {
            console.error("Error saving recording:", error);
            setSaving(false);
        }
    };

    const theatreOptions = theatres.map(t => ({
        id: t.id,
        label: `${t.name} (${t.city})`
    }));

    const peopleOptions = people.map(p => ({
        id: p.id,
        label: p.name
    }));

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-primary">{isNew ? 'Add Recording' : 'Edit Recording'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recording Date</label>
                    <input
                        type="date"
                        value={recordingDate}
                        onChange={(e) => setRecordingDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <AutocompleteInput
                    label="Theatre"
                    placeholder="Search for a theatre..."
                    options={theatreOptions}
                    selectedIds={selectedTheatreId ? [selectedTheatreId] : []}
                    onSelect={(id) => setSelectedTheatreId(id)}
                    onRemove={() => setSelectedTheatreId('')}
                    allowCreate={true}
                    onCreateNew={createNewTheatre}
                />

                <AutocompleteInput
                    label="Composers"
                    placeholder="Search for composers..."
                    options={peopleOptions}
                    selectedIds={selectedComposerIds}
                    onSelect={(id) => setSelectedComposerIds([...selectedComposerIds, id])}
                    onRemove={(id) => setSelectedComposerIds(selectedComposerIds.filter(i => i !== id))}
                    allowCreate={true}
                    onCreateNew={createNewPerson}
                />

                <AutocompleteInput
                    label="Lyricists"
                    placeholder="Search for lyricists..."
                    options={peopleOptions}
                    selectedIds={selectedLyricistIds}
                    onSelect={(id) => setSelectedLyricistIds([...selectedLyricistIds, id])}
                    onRemove={(id) => setSelectedLyricistIds(selectedLyricistIds.filter(i => i !== id))}
                    allowCreate={true}
                    onCreateNew={createNewPerson}
                />

                <AutocompleteInput
                    label="Artists"
                    placeholder="Search for artists..."
                    options={peopleOptions}
                    selectedIds={selectedArtistIds}
                    onSelect={(id) => setSelectedArtistIds([...selectedArtistIds, id])}
                    onRemove={(id) => setSelectedArtistIds(selectedArtistIds.filter(i => i !== id))}
                    allowCreate={true}
                    onCreateNew={createNewPerson}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                        value={info}
                        onChange={(e) => setInfo(e.target.value)}
                        rows={3}
                        placeholder="Additional notes about this recording..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : (isNew ? 'Add Recording' : 'Save Changes')}
                    </button>
                </div>
            </form>

            <TheatreCreateModal
                isOpen={isTheatreModalOpen}
                theatreName={pendingTheatreName}
                onClose={handleTheatreModalClose}
                onCreate={handleTheatreCreate}
            />
        </div>
    );
}
