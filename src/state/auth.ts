import { atom } from 'recoil';
import { User } from 'firebase/auth';

export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'viewer' | 'editor' | 'admin' | null;
}

export const userState = atom<AppUser | null>({
    key: 'userState',
    default: null,
});

export const authLoadingState = atom<boolean>({
    key: 'authLoadingState',
    default: true,
});
