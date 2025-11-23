import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { formatDateDisplay } from '../dateUtils';

describe('formatDateDisplay', () => {
    it('returns year string when precision is year', () => {
        const result = formatDateDisplay({
            releaseYear: 1995,
            datePrecision: 'year',
            recordingDate: Timestamp.now() // Should be ignored
        });
        expect(result).toBe('1995');
    });

    it('returns formatted full date when precision is full', () => {
        const date = new Date('2025-01-01T12:00:00');
        const timestamp = Timestamp.fromDate(date);

        const result = formatDateDisplay({
            recordingDate: timestamp,
            datePrecision: 'full'
        });

        // Note: Locale output might vary slightly by environment, but en-GB is usually "1 January 2025"
        expect(result).toMatch(/1 January 2025/);
    });

    it('defaults to full date if precision is undefined', () => {
        const date = new Date('2025-01-01T12:00:00');
        const timestamp = Timestamp.fromDate(date);

        const result = formatDateDisplay({
            recordingDate: timestamp
        });

        expect(result).toMatch(/1 January 2025/);
    });

    it('falls back to releaseYear if recordingDate is missing', () => {
        const result = formatDateDisplay({
            releaseYear: 2020,
            datePrecision: 'full'
        });
        expect(result).toBe('2020');
    });

    it('returns empty string if no data provided', () => {
        const result = formatDateDisplay({});
        expect(result).toBe('');
    });
});
