'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from './AuthGuard';
import QueryProvider from '@/components/providers/QueryProvider';

export default function AppAccess({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();

    if (pathname === '/login') return <>{children}</>;

    return (
        <AuthGuard>
            <QueryProvider key={user?.uid}>{children}</QueryProvider>
        </AuthGuard>
    );
}
