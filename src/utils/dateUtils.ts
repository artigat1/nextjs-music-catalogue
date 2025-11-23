import { Timestamp } from 'firebase/firestore';

interface DateDisplayOptions {
    recordingDate?: Timestamp;
    releaseYear?: number;
    datePrecision?: 'year' | 'full';
}

export function formatDateDisplay({ recordingDate, releaseYear, datePrecision }: DateDisplayOptions): string {
    if (datePrecision === 'year') {
        return releaseYear?.toString() || '';
    }

    if (recordingDate) {
        return recordingDate.toDate().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    return releaseYear?.toString() || '';
}
