'use client';

import { useState, useEffect } from 'react';
import { getCollection } from '@/firebase/firestore';
import { Recording } from '@/types';
import Link from 'next/link';

export default function SearchPage() {
    const [recordings, setRecordings] = useState<(Recording & { id: string })[]>([]);
    const [filteredRecordings, setFilteredRecordings] = useState<(Recording & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<'all' | 'title' | 'artist' | 'theatre'>('all');

    useEffect(() => {
        // For this demo/playground, we'll fetch all and filter client-side.
        // In a real app with large data, we'd use Algolia or specific Firestore queries.
        const fetchAllRecordings = async () => {
            try {
                const data = await getCollection('recordings');
                setRecordings(data as (Recording & { id: string })[]);
                setFilteredRecordings(data as (Recording & { id: string })[]);
            } catch (error) {
                console.error("Error fetching recordings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllRecordings();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredRecordings(recordings);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = recordings.filter(rec => {
            const matchTitle = rec.title.toLowerCase().includes(lowerTerm);
            const matchTheatre = rec.theatreName?.toLowerCase().includes(lowerTerm) || rec.city?.toLowerCase().includes(lowerTerm);
            const matchArtist = rec.artistNames?.some(name => name.toLowerCase().includes(lowerTerm));

            if (searchType === 'title') return matchTitle;
            if (searchType === 'theatre') return matchTheatre;
            if (searchType === 'artist') return matchArtist;

            // 'all'
            return matchTitle || matchTheatre || matchArtist;
        });

        setFilteredRecordings(filtered);
    }, [searchTerm, searchType, recordings]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-primary mb-8 font-serif border-b border-accent/20 pb-4">Search Recordings</h1>

            <div className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Search Term</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by title, artist, theatre..."
                            className="w-full px-4 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground placeholder-foreground/40"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Search By</label>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as any)}
                            className="w-full px-4 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                        >
                            <option value="all">All Fields</option>
                            <option value="title">Title</option>
                            <option value="artist">Artist</option>
                            <option value="theatre">Theatre/City</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-foreground/60">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecordings.map((recording) => (
                        <Link href={`/recordings/${recording.id}`} key={recording.id} className="group">
                            <div className="bg-surface rounded-lg shadow-sm overflow-hidden border border-transparent transition-all hover:shadow-md hover:border-accent/50 h-full flex flex-col">
                                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-surface/50 h-48 relative border-b border-accent/10">
                                    {recording.imageUrl ? (
                                        <img
                                            src={recording.imageUrl}
                                            alt={recording.title}
                                            className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-foreground/40">
                                            <NoImagePlaceholder />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-primary mb-1 font-serif">{recording.title}</h3>
                                    <p className="text-sm text-foreground/70 mb-2">{recording.theatreName}, {recording.city}</p>
                                    <div className="mt-auto pt-4 border-t border-accent/10">
                                        <p className="text-sm text-foreground/60">Released: {recording.releaseYear}</p>
                                        {recording.artistNames && recording.artistNames.length > 0 && (
                                            <p className="text-sm text-foreground/80 mt-2 truncate font-medium">
                                                {recording.artistNames.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredRecordings.length === 0 && (
                        <div className="col-span-full text-center text-foreground/50 py-12">
                            No recordings found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NoImagePlaceholder() {
    return (
        <svg className="h-12 w-12 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
    );
}
