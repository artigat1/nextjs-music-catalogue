import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollection, getDocument, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Recording, Person, Theatre } from '@/types';
import { DocumentData, WithFieldValue } from 'firebase/firestore';

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
        mutationFn: (data: WithFieldValue<DocumentData>) => addDocument('people', data),
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
        mutationFn: (data: WithFieldValue<DocumentData>) => addDocument('theatres', data),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.theatres] });
        },
    });
}

export function useUpdateRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Recording> }) => updateDocument('recordings', id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings, variables.id] });
        },
    });
}

export function useAddRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WithFieldValue<DocumentData>) => addDocument('recordings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recordings] });
        },
    });
}
