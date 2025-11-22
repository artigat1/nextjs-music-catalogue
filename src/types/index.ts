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
    imageUrl: string;
    info: string;
    releaseYear: number;
    recordingDate: Timestamp;
    dateAdded: Timestamp;
    dateUpdated: Timestamp;
    theatreRef: DocumentReference;
    theatreName: string;
    city: string;
    artistRefs: DocumentReference[];
    artistNames: string[];
    artistIds: string[]; // added to store full list of artist IDs
    lyricistRefs: DocumentReference[];
    composerRefs: DocumentReference[];
    composerIds: string[]; // added to store full list of composer IDs
    lyricistIds: string[]; // added to store full list of lyricist IDs
    oneDriveLink?: string; // optional OneDrive shared link
    galleryImages?: string[]; // optional array of image URLs for carousel
}


export interface UserData {
    email: string;
    role: 'viewer' | 'editor' | 'admin';
    dateAdded: Timestamp;
}
