'use client';

import { useState, useRef, useEffect } from 'react';

interface AutocompleteOption {
    id: string;
    label: string;
}

interface AutocompleteInputProps {
    options: AutocompleteOption[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    placeholder: string;
    label: string;
}

export default function AutocompleteInput({
    options,
    selectedIds,
    onSelect,
    onRemove,
    placeholder,
    label,
}: AutocompleteInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (inputValue) {
            const filtered = options.filter(
                (option) =>
                    !selectedIds.includes(option.id) &&
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredOptions(filtered);
            setIsOpen(filtered.length > 0);
        } else {
            setFilteredOptions([]);
            setIsOpen(false);
        }
    }, [inputValue, options, selectedIds]);

    const handleSelect = (option: AutocompleteOption) => {
        onSelect(option.id);
        setInputValue('');
        setIsOpen(false);
    };

    const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {/* Selected Pills */}
            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedOptions.map((option) => (
                        <span
                            key={option.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                            {option.label}
                            <button
                                type="button"
                                onClick={() => onRemove(option.id)}
                                className="hover:text-blue-600 font-bold"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input with Dropdown */}
            <div ref={wrapperRef} className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => inputValue && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Dropdown */}
                {isOpen && filteredOptions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
