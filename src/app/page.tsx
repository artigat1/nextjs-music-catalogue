'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useInfiniteRecordings } from '@/hooks/useQueries';
import { useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import RecordingCard from '@/components/ui/RecordingCard';

const VIEWS = {
  live: { label: 'Live', heading: 'Latest Live Recordings' },
  album: { label: 'Cast albums', heading: 'Cast Albums' },
};
type ViewKey = keyof typeof VIEWS;

export default function Home() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-8 text-center text-foreground/60">Loading...</div>}>
        <HomeContent />
      </Suspense>
    </AuthGuard>
  );
}

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const view: ViewKey = useSearchParams().get('view') === 'album' ? 'album' : 'live';

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteRecordings(10, view);

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

  const selectView = (next: ViewKey) => {
    router.push(next === 'live' ? pathname : `${pathname}?view=${next}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-4 font-serif border-b border-accent/20 pb-4">{VIEWS[view].heading}</h1>

      <div role="group" aria-label="Recording type" className="inline-flex rounded-md border border-accent/30 overflow-hidden mb-8">
        {(Object.keys(VIEWS) as ViewKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => selectView(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === key ? 'bg-primary text-white' : 'bg-surface text-foreground/70 hover:bg-accent/10'
            }`}
          >
            {VIEWS[key].label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center text-foreground/60">Loading recordings...</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((recording) => (
          <RecordingCard key={recording.id} recording={recording} />
        ))}
      </div>

      {!isLoading && recordings.length === 0 && (
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
