import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableSort } from '@/hooks/useTableSort';

interface TestItem {
    id: string;
    name: string;
    info: string;
    count: number;
}

const testData: TestItem[] = [
    { id: '1', name: 'Zebra', info: 'Last animal', count: 10 },
    { id: '2', name: 'Apple', info: 'A fruit', count: 5 },
    { id: '3', name: 'Mango', info: 'Tropical fruit', count: 15 },
    { id: '4', name: 'banana', info: 'Yellow fruit', count: 3 },
];

describe('useTableSort', () => {
    describe('initial state', () => {
        it('sorts data alphabetically by default field in ascending order', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                })
            );

            expect(result.current.sortField).toBe('name');
            expect(result.current.sortOrder).toBe('asc');
            expect(result.current.sortedData.map(item => item.name)).toEqual([
                'Apple',
                'banana',
                'Mango',
                'Zebra',
            ]);
        });

        it('uses provided default sort order', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                    defaultSortOrder: 'desc',
                })
            );

            expect(result.current.sortOrder).toBe('desc');
            expect(result.current.sortedData.map(item => item.name)).toEqual([
                'Zebra',
                'Mango',
                'banana',
                'Apple',
            ]);
        });
    });

    describe('case-insensitive sorting', () => {
        it('sorts strings case-insensitively', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                })
            );

            const names = result.current.sortedData.map(item => item.name);
            expect(names).toEqual(['Apple', 'banana', 'Mango', 'Zebra']);
        });
    });

    describe('handleSort', () => {
        it('toggles sort order when clicking same field', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                })
            );

            expect(result.current.sortOrder).toBe('asc');

            act(() => {
                result.current.handleSort('name');
            });

            expect(result.current.sortOrder).toBe('desc');
            expect(result.current.sortedData.map(item => item.name)).toEqual([
                'Zebra',
                'Mango',
                'banana',
                'Apple',
            ]);
        });

        it('changes to new field with ascending order', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                })
            );

            act(() => {
                result.current.handleSort('info');
            });

            expect(result.current.sortField).toBe('info');
            expect(result.current.sortOrder).toBe('asc');
            expect(result.current.sortedData.map(item => item.info)).toEqual([
                'A fruit',
                'Last animal',
                'Tropical fruit',
                'Yellow fruit',
            ]);
        });

        it('resets to ascending when switching fields', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                })
            );

            // Toggle to descending
            act(() => {
                result.current.handleSort('name');
            });
            expect(result.current.sortOrder).toBe('desc');

            // Switch to different field - should reset to ascending
            act(() => {
                result.current.handleSort('info');
            });
            expect(result.current.sortOrder).toBe('asc');
        });
    });

    describe('numeric sorting', () => {
        it('sorts numbers correctly', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'count',
                })
            );

            expect(result.current.sortedData.map(item => item.count)).toEqual([3, 5, 10, 15]);
        });

        it('sorts numbers in descending order', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'count',
                    defaultSortOrder: 'desc',
                })
            );

            expect(result.current.sortedData.map(item => item.count)).toEqual([15, 10, 5, 3]);
        });
    });

    describe('null/undefined handling', () => {
        it('handles null values by treating them as empty strings', () => {
            const dataWithNulls = [
                { id: '1', name: 'Zebra' },
                { id: '2', name: null },
                { id: '3', name: 'Apple' },
            ];

            const { result } = renderHook(() =>
                useTableSort({
                    data: dataWithNulls,
                    defaultSortField: 'name',
                })
            );

            // Null values should sort to the beginning (empty string)
            expect(result.current.sortedData.map(item => item.name)).toEqual([
                null,
                'Apple',
                'Zebra',
            ]);
        });

        it('handles undefined values', () => {
            const dataWithUndefined = [
                { id: '1', name: 'Zebra' },
                { id: '2', name: undefined },
                { id: '3', name: 'Apple' },
            ];

            const { result } = renderHook(() =>
                useTableSort({
                    data: dataWithUndefined,
                    defaultSortField: 'name',
                })
            );

            expect(result.current.sortedData.map(item => item.name)).toEqual([
                undefined,
                'Apple',
                'Zebra',
            ]);
        });
    });

    describe('Firestore Timestamp handling', () => {
        it('sorts objects with toMillis method (Firestore Timestamps)', () => {
            const dataWithTimestamps = [
                { id: '1', date: { toMillis: () => 3000 } },
                { id: '2', date: { toMillis: () => 1000 } },
                { id: '3', date: { toMillis: () => 2000 } },
            ];

            const { result } = renderHook(() =>
                useTableSort({
                    data: dataWithTimestamps,
                    defaultSortField: 'date',
                })
            );

            expect(result.current.sortedData.map(item => item.date.toMillis())).toEqual([
                1000,
                2000,
                3000,
            ]);
        });
    });

    describe('empty data', () => {
        it('handles empty array', () => {
            const { result } = renderHook(() =>
                useTableSort({
                    data: [],
                    defaultSortField: 'name',
                })
            );

            expect(result.current.sortedData).toEqual([]);
        });
    });

    describe('data immutability', () => {
        it('does not mutate the original data array', () => {
            const originalData = [...testData];

            renderHook(() =>
                useTableSort({
                    data: testData,
                    defaultSortField: 'name',
                })
            );

            expect(testData).toEqual(originalData);
        });
    });
});
