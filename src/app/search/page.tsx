'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import RecordingCard from '@/components/ui/RecordingCard';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useRecordings } from '@/hooks/useQueries';

function SearchContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get('q') || '';
    const initialType = (searchParams.get('type') as 'all' | 'title' | 'artist' | 'theatre') || 'all';

    const { data: recordings = [], isLoading: loading } = useRecordings();

    // Initialize state from URL
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [searchType, setSearchType] = useState<'all' | 'title' | 'artist' | 'theatre'>(initialType);

    // Sync URL with State (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (searchTerm) {
                params.set('q', searchTerm);
            } else {
                params.delete('q');
            }

            if (searchType !== 'all') {
                params.set('type', searchType);
            } else {
                params.delete('type');
            }

            const newQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (newQuery !== currentQuery) {
                router.replace(`${pathname}?${newQuery}`, { scroll: false });
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, searchType, pathname, router, searchParams]);

    // Sync State with URL (Handle Back/Forward navigation)
    useEffect(() => {
        const query = searchParams.get('q') || '';
        const type = (searchParams.get('type') as 'all' | 'title' | 'artist' | 'theatre') || 'all';

        if (query !== searchTerm) {
            setSearchTerm(query);
        }
        if (type !== searchType) {
            setSearchType(type);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Filter recordings using useMemo
    const filteredRecordings = useMemo(() => {
        if (!searchTerm) {
            return recordings;
        }

        const lowerTerm = searchTerm.toLowerCase();
        return recordings.filter(rec => {
            const matchTitle = rec.title.toLowerCase().includes(lowerTerm);
            const matchTheatre = rec.theatreName?.toLowerCase().includes(lowerTerm) || rec.city?.toLowerCase().includes(lowerTerm);
            const matchArtist = rec.artistNames?.some(name => name.toLowerCase().includes(lowerTerm));

            if (searchType === 'title') return matchTitle;
            if (searchType === 'theatre') return matchTheatre;
            if (searchType === 'artist') return matchArtist;

            // 'all'
            return matchTitle || matchTheatre || matchArtist;
        });
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
                            onChange={(e) => setSearchType(e.target.value as 'all' | 'title' | 'artist' | 'theatre')}
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
                        <RecordingCard key={recording.id} recording={recording} />
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

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}


