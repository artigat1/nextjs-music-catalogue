'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange } from '@/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'viewer' | 'editor' | 'admin' | null;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    authError: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // User docs are keyed by lowercased email (see admin users page).
                    const userDocRef = doc(db, 'users', firebaseUser.email!.toLowerCase());
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            role: userData.role || 'viewer',
                        });
                        setAuthError(null);
                    } else {
                        console.warn('User not found in allowlist');
                        setUser(null);
                        setAuthError(`${firebaseUser.email} does not have access to this catalogue. Contact the site owner to be added.`);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUser(null);
                    setAuthError('Something went wrong checking your access. Please try again.');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, authError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);
