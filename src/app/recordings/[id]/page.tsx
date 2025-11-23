'use client';

import { useState, useEffect } from 'react';
import { Person, Theatre } from '@/types';
import { getDoc, DocumentReference } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingImage from '@/components/ui/LoadingImage';
import SearchPill from '@/components/ui/SearchPill';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useRecording } from '@/hooks/useQueries';
import { useAuth } from '@/hooks/useAuth';
import { formatDateDisplay } from '@/utils/dateUtils';

export default function RecordingDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();

    const { data: recording, isLoading: loading } = useRecording(id);

    const [theatre, setTheatre] = useState<(Theatre & { id: string }) | null>(null);
    const [artists, setArtists] = useState<(Person & { id: string })[]>([]);
    const [composers, setComposers] = useState<(Person & { id: string })[]>([]);
    const [lyricists, setLyricists] = useState<(Person & { id: string })[]>([]);

    useEffect(() => {
        if (!recording) return;

        const fetchRelatedData = async () => {
            try {
                // Fetch Theatre
                if (recording.theatreRef) {
                    const theatreSnap = await getDoc(recording.theatreRef);
                    if (theatreSnap.exists()) {
                        setTheatre({ id: theatreSnap.id, ...theatreSnap.data() } as Theatre & { id: string });
                    }
                }

                // Fetch People
                const fetchPeople = async (refs: DocumentReference[]) => {
                    if (!refs || refs.length === 0) return [];
                    const promises = refs.map(ref => getDoc(ref));
                    const snaps = await Promise.all(promises);
                    return snaps.map(snap => {
                        const data = snap.data();
                        return { id: snap.id, ...data } as Person & { id: string };
                    });
                };

                const [fetchedArtists, fetchedComposers, fetchedLyricists] = await Promise.all([
                    fetchPeople(recording.artistRefs),
                    fetchPeople(recording.composerRefs),
                    fetchPeople(recording.lyricistRefs)
                ]);

                setArtists(fetchedArtists);
                setComposers(fetchedComposers);
                setLyricists(fetchedLyricists);
            } catch (error) {
                console.error("Error fetching related data:", error);
            }
        };

        fetchRelatedData();
    }, [recording]);

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
                                    <div className="relative h-48 w-full md:h-full md:w-48">
                                        <LoadingImage
                                            className="object-contain bg-gray-200"
                                            src={recording.imageUrl}
                                            alt={recording.title}
                                            fill
                                            unoptimized
                                            containerClassName="h-full w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 w-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Recording</div>
                                <h1 className="block mt-1 text-3xl leading-tight font-bold text-gray-900">{recording.title}</h1>
                                <p className="mt-2 text-gray-500">
                                    {formatDateDisplay({
                                        recordingDate: recording.recordingDate,
                                        releaseYear: recording.releaseYear,
                                        datePrecision: recording.datePrecision
                                    })}
                                </p>
                                {recording.info && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{recording.info}</p>
                                    </div>
                                )}

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {recording.oneDriveLink && (
                                        <a
                                            href={recording.oneDriveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                            </svg>
                                            Go to OneDrive
                                        </a>
                                    )}

                                    {user && (user.role === 'admin' || user.role === 'editor') && (
                                        <Link
                                            href={`/admin/recordings/${id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors shadow-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit Recording
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery Carousel */}
                    {recording.galleryImages && recording.galleryImages.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Gallery</h2>
                            <ImageCarousel images={recording.galleryImages} />
                        </div>
                    )}

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
