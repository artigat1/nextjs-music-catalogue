'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useRecordings } from '@/hooks/useQueries';
import { useMemo } from 'react';
import RecordingCard from '@/components/ui/RecordingCard';


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
          <RecordingCard key={recording.id} recording={recording} />
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
