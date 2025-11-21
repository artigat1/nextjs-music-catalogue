'use client';

import { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Recording, Theatre, Person } from '@/types';
import { Timestamp, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Modal from '@/components/ui/Modal';
import AutocompleteInput from '@/components/ui/AutocompleteInput';

export default function RecordingsPage() {
    const [recordings, setRecordings] = useState<(Recording & { id: string })[]>([]);
    const [theatres, setTheatres] = useState<(Theatre & { id: string })[]>([]);
    const [people, setPeople] = useState<(Person & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecording, setEditingRecording] = useState<(Recording & { id: string }) | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [recordingDate, setRecordingDate] = useState('');
    const [selectedTheatreId, setSelectedTheatreId] = useState('');
    const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
    const [selectedComposerIds, setSelectedComposerIds] = useState<string[]>([]);
    const [selectedLyricistIds, setSelectedLyricistIds] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recs, theats, peeps] = await Promise.all([
                getCollection('recordings'),
                getCollection('theatres'),
                getCollection('people')
            ]);
            setRecordings(recs as (Recording & { id: string })[]);
            setTheatres(theats as (Theatre & { id: string })[]);
            setPeople(peeps as (Person & { id: string })[]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (recording?: Recording & { id: string }) => {
        if (recording) {
            setEditingRecording(recording);
            setTitle(recording.title);
            setImageUrl(recording.imageUrl);

            // Convert Firestore Timestamp to date string for input
            const recDate = recording.recordingDate?.toDate();
            setRecordingDate(recDate ? recDate.toISOString().split('T')[0] : '');

            setSelectedTheatreId(recording.theatreRef?.id || '');
            setSelectedArtistIds(recording.artistRefs?.map(ref => ref.id) || []);
            setSelectedComposerIds(recording.composerRefs?.map(ref => ref.id) || []);
            setSelectedLyricistIds(recording.lyricistRefs?.map(ref => ref.id) || []);
        } else {
            setEditingRecording(null);
            setTitle('');
            setImageUrl('');
            setRecordingDate('');
            setSelectedTheatreId('');
            setSelectedArtistIds([]);
            setSelectedComposerIds([]);
            setSelectedLyricistIds([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecording(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const theatre = theatres.find(t => t.id === selectedTheatreId);
            if (!theatre) throw new Error('Theatre not found');

            const artistRefs = selectedArtistIds.map(id => doc(db, 'people', id));
            const composerRefs = selectedComposerIds.map(id => doc(db, 'people', id));
            const lyricistRefs = selectedLyricistIds.map(id => doc(db, 'people', id));

            const artistNames = people.filter(p => selectedArtistIds.includes(p.id)).map(p => p.name);

            // Convert date string to Timestamp
            const recDateTimestamp = recordingDate
                ? Timestamp.fromDate(new Date(recordingDate))
                : Timestamp.now();

            const releaseYear = recordingDate
                ? new Date(recordingDate).getFullYear()
                : new Date().getFullYear();

            const recordingData: Partial<Recording> = {
                title,
                imageUrl,
                releaseYear,
                recordingDate: recDateTimestamp,
                dateUpdated: Timestamp.now(),
                theatreRef: doc(db, 'theatres', selectedTheatreId),
                theatreName: theatre.name,
                city: theatre.city,
                artistRefs,
                artistNames,
                composerRefs,
                lyricistRefs,
            };

            if (editingRecording) {
                await updateDocument('recordings', editingRecording.id, recordingData);
            } else {
                recordingData.dateAdded = Timestamp.now();
                await addDocument('recordings', recordingData);
            }

            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving recording:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recording?')) return;
        try {
            await deleteDocument('recordings', id);
            fetchData();
        } catch (error) {
            console.error("Error deleting recording:", error);
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

    if (loading) return <div>Loading recordings...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-primary">Recordings</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Add Recording
                </button>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{recording.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{recording.theatreName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                                    {recording.recordingDate?.toDate().toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(recording)}
                                        className="text-accent hover:text-primary mr-4 transition-colors"
                                    >
                                        Edit
                                    </button>
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

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingRecording ? 'Edit Recording' : 'Add Recording'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    />

                    <AutocompleteInput
                        label="Artists"
                        placeholder="Search for artists..."
                        options={peopleOptions}
                        selectedIds={selectedArtistIds}
                        onSelect={(id) => setSelectedArtistIds([...selectedArtistIds, id])}
                        onRemove={(id) => setSelectedArtistIds(selectedArtistIds.filter(i => i !== id))}
                    />

                    <AutocompleteInput
                        label="Composers"
                        placeholder="Search for composers..."
                        options={peopleOptions}
                        selectedIds={selectedComposerIds}
                        onSelect={(id) => setSelectedComposerIds([...selectedComposerIds, id])}
                        onRemove={(id) => setSelectedComposerIds(selectedComposerIds.filter(i => i !== id))}
                    />

                    <AutocompleteInput
                        label="Lyricists"
                        placeholder="Search for lyricists..."
                        options={peopleOptions}
                        selectedIds={selectedLyricistIds}
                        onSelect={(id) => setSelectedLyricistIds([...selectedLyricistIds, id])}
                        onRemove={(id) => setSelectedLyricistIds(selectedLyricistIds.filter(i => i !== id))}
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {editingRecording ? 'Save Changes' : 'Add Recording'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
