import { Timestamp, DocumentReference } from 'firebase/firestore';

export interface Theatre {
    id?: string;
    name: string;
    city: string;
    country: string;
    dateAdded: Timestamp;
    dateUpdated: Timestamp;
}

export interface Person {
    id?: string;
    name: string;
    info: string;
    dateAdded: Timestamp;
    dateUpdated: Timestamp;
}

export interface Recording {
    id?: string;
    title: string;
    recordingUrl: string;
    imageUrl: string;
    releaseYear: number;
    recordingDate: Timestamp;
    dateAdded: Timestamp;
    dateUpdated: Timestamp;
    theatreRef: DocumentReference;
    theatreName: string;
    city: string;
    artistRefs: DocumentReference[];
    artistNames: string[];
    lyricistRefs: DocumentReference[];
    composerRefs: DocumentReference[];
}

export interface UserData {
    email: string;
    role: 'viewer' | 'editor' | 'admin';
    dateAdded: Timestamp;
}
