'use client';

import { useState, useEffect } from 'react';
import { getCollection } from '@/firebase/firestore';
import { Recording } from '@/types';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function Home() {
  const [recordings, setRecordings] = useState<(Recording & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRecordings = async () => {
      try {
        const q = query(
          collection(db, 'recordings'),
          orderBy('recordingDate', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Recording & { id: string })[];
        setRecordings(data);
      } catch (error) {
        console.error("Error fetching recordings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRecordings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-foreground/60">Loading latest recordings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 font-serif border-b border-accent/20 pb-4">Latest Recordings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((recording) => (
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
      </div>

      {recordings.length === 0 && (
        <div className="text-center text-foreground/50 py-12">
          No recordings found.
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
