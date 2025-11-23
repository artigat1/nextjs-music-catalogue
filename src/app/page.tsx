'use client';

import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useRecordings } from '@/hooks/useQueries';
import { useMemo } from 'react';
import Image from 'next/image';
import { formatDateDisplay } from '@/utils/dateUtils';

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const { data: allRecordings = [], isLoading: loading } = useRecordings();

  // Get latest 10 recordings sorted by date
  const recordings = useMemo(() => {
    return [...allRecordings]
      .sort((a, b) => {
        const dateA = a.recordingDate?.toDate().getTime() || 0;
        const dateB = b.recordingDate?.toDate().getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [allRecordings]);

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
                  <Image
                    src={recording.imageUrl}
                    alt={recording.title}
                    fill
                    unoptimized
                    className="object-cover object-center group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-foreground/40">
                    <NoImagePlaceholder />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-primary mb-1 font-serif">{recording.title}</h3>
                <p className="text-sm text-foreground/70 mb-1">{recording.theatreName}, {recording.city}</p>
                <p className="text-sm text-foreground/60">
                  {formatDateDisplay({
                    recordingDate: recording.recordingDate,
                    releaseYear: recording.releaseYear,
                    datePrecision: recording.datePrecision
                  })}
                </p>
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
