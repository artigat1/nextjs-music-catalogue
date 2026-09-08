'use client';

import Image from 'next/image';
import { signInWithGoogle, signInWithMicrosoft, signOut } from '@/firebase/auth';
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const { user, authError } = useAuth();
    const displayError = error || authError;

    // Redirect once the allowlist check has accepted the user, so a rejected
    // user stays here and sees the error message.
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleLogin = async (provider: 'Google' | 'Microsoft') => {
        setError(null);
        setNotice(null);
        try {
            const signedInUser = await (provider === 'Google' ? signInWithGoogle() : signInWithMicrosoft());
            if (!signedInUser.emailVerified) {
                try {
                    await sendEmailVerification(signedInUser);
                    setNotice('Verification email sent. Open the link in that email, then sign in again.');
                } finally {
                    await signOut();
                }
            }
        } catch (err) {
            setError(`Could not complete sign-in with ${provider}. Please try again.`);
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-surface shadow-lg rounded-lg p-8 border border-accent/20">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary font-serif">Sign In</h2>

                {notice && <p role="status" className="mb-4 text-foreground">{notice}</p>}

                {displayError && !notice && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {displayError}
                    </div>
                )}

                <button
                    onClick={() => handleLogin('Google')}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-accent/30 text-foreground hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
                >
                    <Image
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                    />
                    Sign in with Google
                </button>

                <button
                    onClick={() => handleLogin('Microsoft')}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-accent/30 text-foreground hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition duration-200 shadow-sm hover:shadow-md mt-4"
                >
                    <svg width="24" height="24" viewBox="0 0 23 23" className="w-6 h-6" aria-hidden="true">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                        <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                        <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                    </svg>
                    Sign in with Microsoft
                </button>
            </div>
        </div>
    );
}
