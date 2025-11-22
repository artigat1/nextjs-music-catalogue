import { describe, it, expect } from 'vitest';
import { mockRecording, mockRecordings } from '@/test/mockData';

describe('Data Filtering and Sorting', () => {
    describe('Recording Search', () => {
        it('filters recordings by title', () => {
            const searchTerm = 'bohème';
            const results = mockRecordings.filter((rec) =>
                rec.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(results).toHaveLength(1);
            expect(results[0].title).toBe('La Bohème');
        });

        it('filters recordings by theatre name', () => {
            const searchTerm = 'royal';
            const results = mockRecordings.filter((rec) =>
                rec.theatreName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(results.length).toBeGreaterThan(0);
            results.forEach((rec) => {
                expect(rec.theatreName.toLowerCase()).toContain('royal');
            });
        });

        it('filters recordings by artist name', () => {
            const searchTerm = 'john';
            const results = mockRecordings.filter((rec) =>
                rec.artistNames?.some((name) =>
                    name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );

            expect(results.length).toBeGreaterThan(0);
        });

        it('filters recordings by city', () => {
            const searchTerm = 'london';
            const results = mockRecordings.filter((rec) =>
                rec.city.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(results.length).toBeGreaterThan(0);
            results.forEach((rec) => {
                expect(rec.city.toLowerCase()).toContain('london');
            });
        });

        it('handles case-insensitive search', () => {
            const searchTerms = ['CARMEN', 'carmen', 'CaRmEn'];

            searchTerms.forEach((term) => {
                const results = mockRecordings.filter((rec) =>
                    rec.title.toLowerCase().includes(term.toLowerCase())
                );
                expect(results).toHaveLength(1);
            });
        });

        it('returns empty array for no matches', () => {
            const searchTerm = 'nonexistent';
            const results = mockRecordings.filter((rec) =>
                rec.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(results).toHaveLength(0);
        });
    });

    describe('Recording Sorting', () => {
        it('sorts recordings by date descending', () => {
            const sorted = [...mockRecordings].sort((a, b) => {
                const dateA = a.recordingDate?.toDate().getTime() || 0;
                const dateB = b.recordingDate?.toDate().getTime() || 0;
                return dateB - dateA;
            });

            expect(sorted[0].title).toBe('Carmen'); // June 2023
            expect(sorted[1].title).toBe('La Bohème'); // May 2023
            expect(sorted[2].title).toBe('The Magic Flute'); // April 2023
        });

        it('sorts recordings by date ascending', () => {
            const sorted = [...mockRecordings].sort((a, b) => {
                const dateA = a.recordingDate?.toDate().getTime() || 0;
                const dateB = b.recordingDate?.toDate().getTime() || 0;
                return dateA - dateB;
            });

            expect(sorted[0].title).toBe('The Magic Flute'); // April 2023
            expect(sorted[1].title).toBe('La Bohème'); // May 2023
            expect(sorted[2].title).toBe('Carmen'); // June 2023
        });

        it('sorts recordings alphabetically by title', () => {
            const sorted = [...mockRecordings].sort((a, b) =>
                a.title.localeCompare(b.title)
            );

            expect(sorted[0].title).toBe('Carmen');
            expect(sorted[1].title).toBe('La Bohème');
            expect(sorted[2].title).toBe('The Magic Flute');
        });
    });

    describe('Data Validation', () => {
        it('validates required recording fields', () => {
            expect(mockRecording).toHaveProperty('id');
            expect(mockRecording).toHaveProperty('title');
            expect(mockRecording).toHaveProperty('theatreName');
            expect(mockRecording).toHaveProperty('recordingDate');
            expect(mockRecording).toHaveProperty('releaseYear');
        });

        it('validates artist arrays', () => {
            expect(Array.isArray(mockRecording.artistNames)).toBe(true);
            expect(Array.isArray(mockRecording.artistIds)).toBe(true);
            expect(mockRecording.artistNames?.length).toBeGreaterThan(0);
        });

        it('validates optional fields', () => {
            expect(mockRecording.oneDriveLink).toBeDefined();
            expect(mockRecording.galleryImages).toBeDefined();
            expect(Array.isArray(mockRecording.galleryImages)).toBe(true);
        });

        it('validates timestamp fields', () => {
            expect(mockRecording.recordingDate).toBeDefined();
            expect(mockRecording.dateAdded).toBeDefined();
            expect(mockRecording.dateUpdated).toBeDefined();
        });
    });

    describe('Array Operations', () => {
        it('limits results to specified count', () => {
            const limit = 2;
            const limited = mockRecordings.slice(0, limit);

            expect(limited).toHaveLength(limit);
        });

        it('removes duplicates from array', () => {
            const duplicates = [...mockRecordings, mockRecordings[0]];
            const unique = Array.from(new Set(duplicates.map((r) => r.id))).map((id) =>
                duplicates.find((r) => r.id === id)
            );

            expect(unique).toHaveLength(mockRecordings.length);
        });

        it('filters out null/undefined values', () => {
            const withNulls = [...mockRecordings, null, undefined] as any[];
            const filtered = withNulls.filter((item) => item != null);

            expect(filtered).toHaveLength(mockRecordings.length);
        });
    });
});
