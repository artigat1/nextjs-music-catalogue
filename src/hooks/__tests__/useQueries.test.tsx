import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecordings, useInfiniteRecordings, useAddRecording, usePeople, useTheatres } from '@/hooks/useQueries';
import * as firestoreModule from '@/firebase/firestore';
import { mockRecordings, mockPeople, mockTheatres } from '@/test/mockData';

// Mock the firestore module
vi.mock('@/firebase/firestore', () => ({
    getCollection: vi.fn(),
    getDocument: vi.fn(),
    addDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getPaginatedCollection: vi.fn(),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'QueryClientWrapper';
    return Wrapper;
};

describe('useQueries Hooks', () => {
    describe('useRecordings', () => {
        it('fetches recordings successfully', async () => {
            vi.mocked(firestoreModule.getCollection).mockResolvedValue(mockRecordings);

            const { result } = renderHook(() => useRecordings(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockRecordings);
            expect(firestoreModule.getCollection).toHaveBeenCalledWith('recordings');
        });

        it('handles error when fetching recordings', async () => {
            vi.mocked(firestoreModule.getCollection).mockRejectedValue(new Error('Fetch failed'));

            const { result } = renderHook(() => useRecordings(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeTruthy();
        });

        it('shows loading state', () => {
            vi.mocked(firestoreModule.getCollection).mockImplementation(
                () => new Promise(() => { }) // Never resolves
            );

            const { result } = renderHook(() => useRecordings(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(true);
        });
    });

    describe('useInfiniteRecordings', () => {
        const emptyPage = { items: [], lastDoc: null, hasMore: false };

        it('queries without a filter by default', async () => {
            vi.mocked(firestoreModule.getPaginatedCollection).mockResolvedValue(emptyPage);

            const { result } = renderHook(() => useInfiniteRecordings(10), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(firestoreModule.getPaginatedCollection).toHaveBeenCalledWith(
                'recordings', 'recordingDate', 'desc', 10, null, undefined
            );
        });

        it('filters by recording type and refetches when the type changes', async () => {
            vi.mocked(firestoreModule.getPaginatedCollection).mockResolvedValue(emptyPage);

            const { result, rerender } = renderHook(
                ({ type }: { type?: 'live' | 'album' }) => useInfiniteRecordings(10, type),
                { wrapper: createWrapper(), initialProps: { type: 'live' as 'live' | 'album' | undefined } }
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(firestoreModule.getPaginatedCollection).toHaveBeenLastCalledWith(
                'recordings', 'recordingDate', 'desc', 10, null, { field: 'recordingType', value: 'live' }
            );

            rerender({ type: 'album' });

            await waitFor(() =>
                expect(firestoreModule.getPaginatedCollection).toHaveBeenLastCalledWith(
                    'recordings', 'recordingDate', 'desc', 10, null, { field: 'recordingType', value: 'album' }
                )
            );
        });
    });

    describe('useAddRecording', () => {
        const input = {
            title: 'Hamilton',
            releaseYear: 2016,
            recordingDate: new Date('2016-01-01'),
            artistIds: [],
            artistNames: [],
            composerIds: [],
            lyricistIds: [],
        };

        it('writes the recording type', async () => {
            vi.mocked(firestoreModule.addDocument).mockResolvedValue('new-id');

            const { result } = renderHook(() => useAddRecording(), { wrapper: createWrapper() });
            await result.current.mutateAsync({ ...input, recordingType: 'album' });

            expect(firestoreModule.addDocument).toHaveBeenCalledWith(
                'recordings',
                expect.objectContaining({ recordingType: 'album' })
            );
        });

        it('saves recordingType as live when it is not set', async () => {
            vi.mocked(firestoreModule.addDocument).mockResolvedValue('new-id');

            const { result } = renderHook(() => useAddRecording(), { wrapper: createWrapper() });
            await result.current.mutateAsync(input);

            expect(vi.mocked(firestoreModule.addDocument).mock.lastCall?.[1]).toHaveProperty('recordingType', 'live');
        });
    });

    describe('usePeople', () => {
        it('fetches people successfully', async () => {
            vi.mocked(firestoreModule.getCollection).mockResolvedValue(mockPeople);

            const { result } = renderHook(() => usePeople(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockPeople);
            expect(firestoreModule.getCollection).toHaveBeenCalledWith('people');
        });
    });

    describe('useTheatres', () => {
        it('fetches theatres successfully', async () => {
            vi.mocked(firestoreModule.getCollection).mockResolvedValue(mockTheatres);

            const { result } = renderHook(() => useTheatres(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockTheatres);
            expect(firestoreModule.getCollection).toHaveBeenCalledWith('theatres');
        });
    });
});
