'use client';

import { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Recording, Theatre, Person } from '@/types';
import { Timestamp, doc, DocumentReference } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Modal from '@/components/ui/Modal';

export default function RecordingsPage() {
    const [recordings, setRecordings] = useState<(Recording & { id: string })[]>([]);
    const [theatres, setTheatres] = useState<(Theatre & { id: string })[]>([]);
    const [people, setPeople] = useState<(Person & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecording, setEditingRecording] = useState<(Recording & { id: string }) | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [recordingUrl, setRecordingUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
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
            setRecordingUrl(recording.recordingUrl);
            setImageUrl(recording.imageUrl);
            setReleaseYear(recording.releaseYear);
            setSelectedTheatreId(recording.theatreRef?.id || '');
            setSelectedArtistIds(recording.artistRefs?.map(ref => ref.id) || []);
            setSelectedComposerIds(recording.composerRefs?.map(ref => ref.id) || []);
            setSelectedLyricistIds(recording.lyricistRefs?.map(ref => ref.id) || []);
        } else {
            setEditingRecording(null);
            setTitle('');
            setRecordingUrl('');
            setImageUrl('');
            setReleaseYear(new Date().getFullYear());
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

            const recordingData: Partial<Recording> = {
                title,
                recordingUrl,
                imageUrl,
                releaseYear,
                recordingDate: Timestamp.now(), // Ideally this is a date picker, but using now or release year for simplicity
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

    const toggleSelection = (id: string, currentIds: string[], setIds: (ids: string[]) => void) => {
        if (currentIds.includes(id)) {
            setIds(currentIds.filter(i => i !== id));
        } else {
            setIds([...currentIds, id]);
        }
    };

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
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif">Year</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-primary uppercase tracking-wider font-serif">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-accent/10">
                        {recordings.map((recording) => (
                            <tr key={recording.id} className="hover:bg-surface/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{recording.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{recording.theatreName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{recording.releaseYear}</td>
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
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Recording URL</label>
                        <input
                            type="text"
                            value={recordingUrl}
                            onChange={(e) => setRecordingUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Image URL</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Release Year</label>
                        <input
                            type="number"
                            value={releaseYear}
                            onChange={(e) => setReleaseYear(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Theatre</label>
                        <select
                            value={selectedTheatreId}
                            onChange={(e) => setSelectedTheatreId(e.target.value)}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                            required
                        >
                            <option value="">Select Theatre</option>
                            {theatres.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                            ))}
                        </select>
                    </div>

                    {/* Multi-selects for people */}
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Artists</label>
                        <div className="max-h-32 overflow-y-auto border border-accent/30 rounded-md p-2 bg-background">
                            {people.map(p => (
                                <div key={p.id} className="flex items-center mb-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedArtistIds.includes(p.id)}
                                        onChange={() => toggleSelection(p.id, selectedArtistIds, setSelectedArtistIds)}
                                        className="mr-2 accent-primary"
                                    />
                                    <span className="text-sm text-foreground">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Composers</label>
                        <div className="max-h-32 overflow-y-auto border border-accent/30 rounded-md p-2 bg-background">
                            {people.map(p => (
                                <div key={p.id} className="flex items-center mb-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedComposerIds.includes(p.id)}
                                        onChange={() => toggleSelection(p.id, selectedComposerIds, setSelectedComposerIds)}
                                        className="mr-2 accent-primary"
                                    />
                                    <span className="text-sm text-foreground">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Lyricists</label>
                        <div className="max-h-32 overflow-y-auto border border-accent/30 rounded-md p-2 bg-background">
                            {people.map(p => (
                                <div key={p.id} className="flex items-center mb-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedLyricistIds.includes(p.id)}
                                        onChange={() => toggleSelection(p.id, selectedLyricistIds, setSelectedLyricistIds)}
                                        className="mr-2 accent-primary"
                                    />
                                    <span className="text-sm text-foreground">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-foreground/70 hover:bg-surface rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            {editingRecording ? 'Save Changes' : 'Add Recording'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
