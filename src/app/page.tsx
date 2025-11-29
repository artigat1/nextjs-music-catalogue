'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useInfiniteRecordings } from '@/hooks/useQueries';
import { useMemo, useEffect, useRef, useCallback } from 'react';
import RecordingCard from '@/components/ui/RecordingCard';


export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteRecordings(10);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array of recordings
  const recordings = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items);
  }, [data]);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading) {
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

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-foreground/60">
            <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground/60 rounded-full animate-spin" />
            Loading more...
          </div>
        )}
        {!hasNextPage && recordings.length > 0 && (
          <div className="text-foreground/40 text-sm">
            No more recordings
          </div>
        )}
      </div>
    </div>
  );
}
