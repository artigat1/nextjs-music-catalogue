'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: ('viewer' | 'editor' | 'admin')[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user.role || 'viewer')) {
                // Redirect to home or unauthorized page if role doesn't match
                router.push('/');
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    if (allowedRoles && !allowedRoles.includes(user.role || 'viewer')) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
