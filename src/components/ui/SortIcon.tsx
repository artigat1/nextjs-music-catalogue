interface SortIconProps {
    field: string;
    currentField: string;
    direction: 'asc' | 'desc';
}

export default function SortIcon({ field, currentField, direction }: SortIconProps) {
    if (currentField !== field) return <span className="text-gray-400">⇅</span>;
    return direction === 'asc' ? <span>↑</span> : <span>↓</span>;
}
