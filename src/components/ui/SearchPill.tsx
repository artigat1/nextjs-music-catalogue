'use client';

import Link from 'next/link';

interface PillProps {
    label: string;
    searchQuery: string;
}

export default function SearchPill({ label, searchQuery }: PillProps) {
    return (
        <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer"
        >
            {label}
        </Link>
    );
}
