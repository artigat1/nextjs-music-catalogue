import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getCollection, getDocument, addDocument, updateDocument, deleteDocument, getPaginatedCollection, PaginatedResult } from '@/firebase/firestore';
import { Recording, Person, Theatre } from '@/types';
import { DocumentData, WithFieldValue, QueryDocumentSnapshot } from 'firebase/firestore';

// Helper function to remove undefined values (Firestore doesn't accept them)
function removeUndefinedValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
}

// Keys
export const QUERY_KEYS = {
    recordings: 'recordings',
    people: 'people',
    theatres: 'theatres',
};

// Recordings
export function useRecordings() {
    return useQuery({
        queryKey: [QUERY_KEYS.recordings],
        queryFn: async () => {
            const data = await getCollection('recordings');
            return data as (Recording & { id: string })[];
        },
    });
}

export function useInfiniteRecordings(pageSize: number = 10) {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.recordings, 'infinite', pageSize],
        queryFn: async ({ pageParam }) => {
            return getPaginatedCollection<Recording & { id: string }>(
                'recordings',
                'recordingDate',
                'desc',
                pageSize,
                pageParam as QueryDocumentSnapshot<DocumentData> | null
            );
        },
        initialPageParam: null as QueryDocumentSnapshot<DocumentData> | null,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    });
}

export function useRecording(id: string | undefined) {
    return useQuery({
        queryKey: [QUERY_KEYS.recordings, id],
        queryFn: async () => {
            if (!id || id === 'new') return null;
            const data = await getDocument('recordings', id);
            if (!data) return null;
            return { ...data, id } as (Recording & { id: string });
        },
        enabled: !!id && id !== 'new',
    });
}

// People
export function usePeople() {
    return useQuery({
        queryKey: [QUERY_KEYS.people],
        queryFn: async () => {
            const data = await getCollection('people');
            return data as (Person & { id: string })[];
        },
    });
}

export function usePerson(id: string | undefined) {
    return useQuery({
        queryKey: [QUERY_KEYS.people, id],
        queryFn: async () => {
            if (!id || id === 'new') return null;
            const data = await getDocument('people', id);
            if (!data) return null;
            return { ...data, id } as (Person & { id: string });
        },
        enabled: !!id && id !== 'new',
    });
}

// Theatres
export function useTheatres() {
    return useQuery({
        queryKey: [QUERY_KEYS.theatres],
        queryFn: async () => {
            const data = await getCollection('theatres');
            return data as (Theatre & { id: string })[];
        },
    });
}

export function useTheatre(id: string | undefined) {
    return useQuery({
        queryKey: [QUERY_KEYS.theatres, id],
        queryFn: async () => {
            if (!id || id === 'new') return null;
            const data = await getDocument('theatres', id);
            if (!data) return null;
            return { ...data, id } as (Theatre & { id: string });
        },
        enabled: !!id && id !== 'new',
    });
}

// Mutations
export function useDeleteRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDocument('recordings', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings] });
        },
    });
}

export function useDeletePerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDocument('people', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.people] });
        },
    });
}

export function useDeleteTheatre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDocument('theatres', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.theatres] });
        },
    });
}

export function useAddPerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WithFieldValue<DocumentData>) => addDocument('people', removeUndefinedValues(data as Record<string, unknown>) as WithFieldValue<DocumentData>),
        onSuccess: async (newId, variables) => {
            // Optimistically update the cache with the new person
            const personData = variables as WithFieldValue<DocumentData> & { name: string; info?: string; dateAdded: unknown; dateUpdated: unknown };
            queryClient.setQueryData<(Person & { id: string })[]>(
                [QUERY_KEYS.people],
                (old = []) => [
                    ...old,
                    {
                        id: newId,
                        name: personData.name,
                        info: personData.info || '',
                        dateAdded: personData.dateAdded,
                        dateUpdated: personData.dateUpdated,
                    } as Person & { id: string }
                ]
            );
            // Also refetch to ensure consistency
            await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.people] });
        },
    });
}

export function useAddTheatre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WithFieldValue<DocumentData>) => addDocument('theatres', removeUndefinedValues(data as Record<string, unknown>) as WithFieldValue<DocumentData>),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.theatres] });
        },
    });
}

// Plain data types for UI (without Firestore-specific types)
export interface RecordingInput {
    title: string;
    imageUrl?: string;
    info?: string;
    oneDriveLink?: string;
    galleryImages?: string[];
    releaseYear: number;
    recordingDate: Date;
    datePrecision?: 'year' | 'full';
    theatreId?: string;
    theatreName?: string;
    city?: string;
    artistIds: string[];
    artistNames: string[];
    composerIds: string[];
    lyricistIds: string[];
}

export function useUpdateRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: RecordingInput }) => {
            const { Timestamp, doc } = await import('firebase/firestore');
            const { db } = await import('@/firebase/config');

            // Convert plain data to Firestore format
            const firestoreData: Record<string, unknown> = {
                title: data.title,
                imageUrl: data.imageUrl,
                info: data.info,
                oneDriveLink: data.oneDriveLink,
                galleryImages: data.galleryImages,
                releaseYear: data.releaseYear,
                recordingDate: Timestamp.fromDate(data.recordingDate),
                datePrecision: data.datePrecision,
                dateUpdated: Timestamp.now(),
                artistIds: data.artistIds,
                artistNames: data.artistNames,
                artistRefs: data.artistIds.map(id => doc(db, 'people', id)),
                composerIds: data.composerIds,
                composerRefs: data.composerIds.map(id => doc(db, 'people', id)),
                lyricistIds: data.lyricistIds,
                lyricistRefs: data.lyricistIds.map(id => doc(db, 'people', id)),
            };

            // Add theatre data if provided
            if (data.theatreId) {
                firestoreData.theatreRef = doc(db, 'theatres', data.theatreId);
                firestoreData.theatreName = data.theatreName;
                firestoreData.city = data.city;
            }

            return updateDocument('recordings', id, removeUndefinedValues(firestoreData) as WithFieldValue<DocumentData>);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings, variables.id] });
        },
    });
}

export function useAddRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: RecordingInput) => {
            const { Timestamp, doc } = await import('firebase/firestore');
            const { db } = await import('@/firebase/config');

            // Convert plain data to Firestore format
            const firestoreData: Record<string, unknown> = {
                title: data.title,
                imageUrl: data.imageUrl,
                info: data.info,
                oneDriveLink: data.oneDriveLink,
                galleryImages: data.galleryImages,
                releaseYear: data.releaseYear,
                recordingDate: Timestamp.fromDate(data.recordingDate),
                datePrecision: data.datePrecision,
                dateAdded: Timestamp.now(),
                dateUpdated: Timestamp.now(),
                artistIds: data.artistIds,
                artistNames: data.artistNames,
                artistRefs: data.artistIds.map(id => doc(db, 'people', id)),
                composerIds: data.composerIds,
                composerRefs: data.composerIds.map(id => doc(db, 'people', id)),
                lyricistIds: data.lyricistIds,
                lyricistRefs: data.lyricistIds.map(id => doc(db, 'people', id)),
            };

            // Add theatre data if provided
            if (data.theatreId) {
                firestoreData.theatreRef = doc(db, 'theatres', data.theatreId);
                firestoreData.theatreName = data.theatreName;
                firestoreData.city = data.city;
            }

            return addDocument('recordings', removeUndefinedValues(firestoreData) as WithFieldValue<DocumentData>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings] });
        },
    });
}
