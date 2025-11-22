'use client';

import { useState, useEffect } from 'react';
import { getDocument } from '@/firebase/firestore';
import { Recording, Theatre, Person } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SearchPill from '@/components/ui/SearchPill';

export default function RecordingDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [recording, setRecording] = useState<(Recording & { id: string }) | null>(null);
    const [theatre, setTheatre] = useState<(Theatre & { id: string }) | null>(null);
    const [artists, setArtists] = useState<(Person & { id: string })[]>([]);
    const [composers, setComposers] = useState<(Person & { id: string })[]>([]);
    const [lyricists, setLyricists] = useState<(Person & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchRecordingDetails();
        }
    }, [id]);

    const fetchRecordingDetails = async () => {
        setLoading(true);
        try {
            const recData = await getDocument('recordings', id);
            if (recData) {
                const rec = recData as Recording & { id: string };
                setRecording(rec);

                // Fetch Theatre
                if (rec.theatreRef) {
                    const theatreSnap = await getDoc(rec.theatreRef);
                    if (theatreSnap.exists()) {
                        setTheatre({ id: theatreSnap.id, ...theatreSnap.data() } as Theatre & { id: string });
                    }
                }

                // Fetch People
                const fetchPeople = async (refs: any[]) => {
                    if (!refs || refs.length === 0) return [];
                    const promises = refs.map(ref => getDoc(ref));
                    const snaps = await Promise.all(promises);
                    return snaps.map(snap => {
                        const data = snap.data();
                        return { id: snap.id, ...(data as any) } as Person & { id: string };
                    });
                };

                const [fetchedArtists, fetchedComposers, fetchedLyricists] = await Promise.all([
                    fetchPeople(rec.artistRefs),
                    fetchPeople(rec.composerRefs),
                    fetchPeople(rec.lyricistRefs)
                ]);

                setArtists(fetchedArtists);
                setComposers(fetchedComposers);
                setLyricists(fetchedLyricists);
            }
        } catch (error) {
            console.error("Error fetching recording details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!recording) return <div className="p-8 text-center">Recording not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">&larr; Back to Home</Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="md:flex">
                            <div className="md:flex-shrink-0 md:w-48 bg-gray-200">
                                {recording.imageUrl ? (
                                    <img className="h-48 w-full object-contain md:h-full md:w-48 bg-gray-200" src={recording.imageUrl} alt={recording.title} />
                                ) : (
                                    <div className="h-48 w-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Recording</div>
                                <h1 className="block mt-1 text-3xl leading-tight font-bold text-gray-900">{recording.title}</h1>
                                <p className="mt-2 text-gray-500">
                                    {recording.recordingDate?.toDate().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {recording.info && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{recording.info}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Theatre Card */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Theatre</h2>
                        {theatre ? (
                            <div className="flex flex-wrap gap-2">
                                <SearchPill label={theatre.name} searchQuery={theatre.name} />
                                <SearchPill label={theatre.city} searchQuery={theatre.city} />
                            </div>
                        ) : (
                            <p className="text-gray-500">Theatre information not available.</p>
                        )}
                    </div>

                    {/* Artists Card */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Artists</h2>
                        {artists.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {artists.map(artist => (
                                    <SearchPill key={artist.id} label={artist.name} searchQuery={artist.name} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No artists listed.</p>
                        )}
                    </div>

                    {/* Creative Team Card */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Creative Team</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Composers</h3>
                                {composers.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {composers.map(c => (
                                            <SearchPill key={c.id} label={c.name} searchQuery={c.name} />
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-sm">None listed</p>}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Lyricists</h3>
                                {lyricists.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {lyricists.map(l => (
                                            <SearchPill key={l.id} label={l.name} searchQuery={l.name} />
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-sm">None listed</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
