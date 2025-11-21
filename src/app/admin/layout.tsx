'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/firebase/auth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Recordings', href: '/admin/recordings' },
        { name: 'People', href: '/admin/people' },
        { name: 'Theatres', href: '/admin/theatres' },
        { name: 'Users', href: '/admin/users' },
    ];

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <AuthGuard allowedRoles={['editor', 'admin']}>
            <div className="min-h-screen bg-gray-100 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
                    <div className="p-6 border-b">
                        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                    </div>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t mt-auto">
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Mobile Header (visible only on small screens) */}
                <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                    <h1 className="text-lg font-bold">Admin</h1>
                    {/* Mobile menu toggle could go here */}
                </div>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto md:ml-0 mt-14 md:mt-0">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
