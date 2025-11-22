import { Recording, Theatre, Person } from '@/types';
import { Timestamp } from 'firebase/firestore';

export const mockTheatre: Theatre & { id: string } = {
    id: 'theatre-1',
    name: 'Royal Opera House',
    city: 'London',
    country: 'UK',
    dateAdded: Timestamp.now(),
    dateUpdated: Timestamp.now(),
};

export const mockPerson: Person & { id: string } = {
    id: 'person-1',
    name: 'John Doe',
    info: 'Famous performer',
    dateAdded: Timestamp.now(),
    dateUpdated: Timestamp.now(),
};

export const mockRecording: Recording & { id: string } = {
    id: 'recording-1',
    title: 'La Bohème',
    imageUrl: 'https://example.com/image.jpg',
    info: 'A beautiful performance',
    releaseYear: 2023,
    recordingDate: Timestamp.fromDate(new Date('2023-05-15')),
    dateAdded: Timestamp.now(),
    dateUpdated: Timestamp.now(),
    theatreRef: {} as unknown as import('firebase/firestore').DocumentReference,
    theatreName: 'Royal Opera House',
    city: 'London',
    artistRefs: [],
    artistNames: ['John Doe', 'Jane Smith'],
    artistIds: ['person-1', 'person-2'],
    composerRefs: [],
    composerIds: ['person-3'],
    lyricistRefs: [],
    lyricistIds: ['person-4'],
    oneDriveLink: 'https://onedrive.com/example',
    galleryImages: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'],
};

export const mockRecordings: (Recording & { id: string })[] = [
    mockRecording,
    {
        ...mockRecording,
        id: 'recording-2',
        title: 'Carmen',
        recordingDate: Timestamp.fromDate(new Date('2023-06-20')),
        releaseYear: 2023,
    },
    {
        ...mockRecording,
        id: 'recording-3',
        title: 'The Magic Flute',
        recordingDate: Timestamp.fromDate(new Date('2023-04-10')),
        releaseYear: 2023,
    },
];

export const mockPeople: (Person & { id: string })[] = [
    mockPerson,
    {
        ...mockPerson,
        id: 'person-2',
        name: 'Jane Smith',
    },
    {
        ...mockPerson,
        id: 'person-3',
        name: 'Wolfgang Mozart',
        info: 'Composer',
    },
];

export const mockTheatres: (Theatre & { id: string })[] = [
    mockTheatre,
    {
        ...mockTheatre,
        id: 'theatre-2',
        name: 'La Scala',
        city: 'Milan',
        country: 'Italy',
    },
];
