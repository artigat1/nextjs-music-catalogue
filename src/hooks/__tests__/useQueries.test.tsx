import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecordings, usePeople, useTheatres } from '@/hooks/useQueries';
import * as firestoreModule from '@/firebase/firestore';
import { mockRecordings, mockPeople, mockTheatres } from '@/test/mockData';

// Mock the firestore module
vi.mock('@/firebase/firestore', () => ({
    getCollection: vi.fn(),
    getDocument: vi.fn(),
    addDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
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
