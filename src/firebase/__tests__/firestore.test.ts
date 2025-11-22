import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestoreModule from '@/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase
vi.mock('@/firebase/config', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        getDocs: vi.fn(),
        getDoc: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
    };
});

describe('Firestore Helper Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCollection', () => {
        it('returns collection data with IDs', async () => {
            const mockData = [
                { id: '1', name: 'Test 1' },
                { id: '2', name: 'Test 2' },
            ];

            const mockSnapshot = {
                docs: mockData.map((item) => ({
                    id: item.id,
                    data: () => ({ name: item.name }),
                })),
            };

            const { getDocs } = await import('firebase/firestore');
            vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

            const result = await firestoreModule.getCollection('test-collection');

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('name');
        });

        it('handles empty collections', async () => {
            const mockSnapshot = {
                docs: [],
            };

            const { getDocs } = await import('firebase/firestore');
            vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

            const result = await firestoreModule.getCollection('empty-collection');

            expect(result).toHaveLength(0);
        });
    });

    describe('getDocument', () => {
        it('returns document data with ID', async () => {
            const mockDoc = {
                exists: () => true,
                id: 'doc-1',
                data: () => ({ name: 'Test Document' }),
            };

            const { getDoc } = await import('firebase/firestore');
            vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

            const result = await firestoreModule.getDocument('test-collection', 'doc-1');

            expect(result).toHaveProperty('id', 'doc-1');
            expect(result).toHaveProperty('name', 'Test Document');
        });

        it('returns null for non-existent documents', async () => {
            const mockDoc = {
                exists: () => false,
            };

            const { getDoc } = await import('firebase/firestore');
            vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

            const result = await firestoreModule.getDocument('test-collection', 'non-existent');

            expect(result).toBeNull();
        });
    });

    describe('addDocument', () => {
        it('adds document and returns ID', async () => {
            const mockDocRef = { id: 'new-doc-id' };

            const { addDoc } = await import('firebase/firestore');
            vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

            const result = await firestoreModule.addDocument('test-collection', {
                name: 'New Document',
            });

            expect(result).toBe('new-doc-id');
        });
    });

    describe('updateDocument', () => {
        it('updates document successfully', async () => {
            const { updateDoc } = await import('firebase/firestore');
            vi.mocked(updateDoc).mockResolvedValue(undefined);

            await expect(
                firestoreModule.updateDocument('test-collection', 'doc-1', {
                    name: 'Updated Name',
                })
            ).resolves.not.toThrow();

            expect(updateDoc).toHaveBeenCalled();
        });
    });

    describe('deleteDocument', () => {
        it('deletes document successfully', async () => {
            const { deleteDoc } = await import('firebase/firestore');
            vi.mocked(deleteDoc).mockResolvedValue(undefined);

            await expect(
                firestoreModule.deleteDocument('test-collection', 'doc-1')
            ).resolves.not.toThrow();

            expect(deleteDoc).toHaveBeenCalled();
        });
    });
});
