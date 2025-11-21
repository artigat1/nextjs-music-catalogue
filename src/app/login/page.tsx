'use client';

import { signInWithGoogle } from '@/firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err) {
            setError('Failed to sign in with Google.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-surface shadow-lg rounded-lg p-8 border border-accent/20">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary font-serif">Sign In</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-accent/30 text-foreground hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        className="w-6 h-6"
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
