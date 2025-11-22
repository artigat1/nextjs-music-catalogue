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

                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const input = form.elements.namedItem('search') as HTMLInputElement;
                                if (input.value.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(input.value.trim())}`;
                                }
                            }} className="relative hidden md:block">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search..."
                                    className="bg-gray-900 text-white text-sm rounded-full pl-4 pr-10 py-1.5 border border-gray-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent w-64 transition-all"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        )}

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
                                <span className="text-sm text-white/80 font-medium hidden sm:inline-block">
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
