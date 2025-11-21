'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/firebase/auth';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <nav className="bg-black shadow-sm border-b border-accent/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-28">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center" title="Steve's Music Catalogue">
                            <img src="/logo.png" alt="Steve's Music Catalogue" className="w-48 h-auto object-contain hover:scale-105 transition-transform duration-200" />
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className="border-transparent text-white/70 hover:border-accent hover:text-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/search"
                                className="border-transparent text-white/70 hover:border-accent hover:text-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                            >
                                Search
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {(user.role === 'admin' || user.role === 'editor') && (
                                    <Link
                                        href="/admin"
                                        className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <span className="text-sm text-white/80 font-medium">
                                    {user.displayName}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-medium text-white/60 hover:text-accent transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
