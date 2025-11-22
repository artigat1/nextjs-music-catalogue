'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 font-serif text-primary">Welcome, {user?.displayName || 'User'}</h2>
            <p className="text-foreground/70">
                Use the sidebar to manage recordings, people, theatres, and users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Link href="/admin/recordings" className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 hover:border-primary/50 transition-colors cursor-pointer block">
                    <h3 className="text-lg font-bold mb-2 font-serif text-primary">Recordings</h3>
                    <p className="text-foreground/60 mb-4">Manage your music collection.</p>
                    {/* Stats could go here */}
                </Link>
                <Link href="/admin/people" className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 hover:border-primary/50 transition-colors cursor-pointer block">
                    <h3 className="text-lg font-bold mb-2 font-serif text-primary">People</h3>
                    <p className="text-foreground/60 mb-4">Manage artists, composers, and lyricists.</p>
                </Link>
                <Link href="/admin/theatres" className="bg-surface p-6 rounded-lg shadow-sm border border-accent/20 hover:border-primary/50 transition-colors cursor-pointer block">
                    <h3 className="text-lg font-bold mb-2 font-serif text-primary">Theatres</h3>
                    <p className="text-foreground/60 mb-4">Manage theatre locations.</p>
                </Link>
            </div>
        </div>
    );
}
