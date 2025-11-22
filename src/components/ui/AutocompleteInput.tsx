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
    onCreateNew?: (name: string) => Promise<string>; // Returns the new ID
    placeholder: string;
    label: string;
    allowCreate?: boolean;
}

export default function AutocompleteInput({
    options,
    selectedIds,
    onSelect,
    onRemove,
    onCreateNew,
    placeholder,
    label,
    allowCreate = false,
}: AutocompleteInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
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

    const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (!allowCreate || !onCreateNew) return;

        const pastedText = e.clipboardData.getData('text');

        // Check if it contains commas (likely a list)
        if (pastedText.includes(',')) {
            e.preventDefault();
            setIsProcessing(true);

            try {
                // Split by comma and clean up names
                const names = pastedText
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name.length > 0);

                for (const name of names) {
                    // Check if person already exists
                    const existing = options.find(
                        opt => opt.label.toLowerCase() === name.toLowerCase()
                    );

                    if (existing) {
                        // Add existing person if not already selected
                        if (!selectedIds.includes(existing.id)) {
                            onSelect(existing.id);
                        }
                    } else {
                        // Create new person
                        const newId = await onCreateNew(name);
                        onSelect(newId);
                    }
                }

                setInputValue('');
            } catch (error) {
                console.error('Error processing pasted names:', error);
                alert('Error processing some names. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();

            // First check if there's a filtered option available (user is typing and matches exist)
            if (filteredOptions.length > 0) {
                // Select the first filtered option
                handleSelect(filteredOptions[0]);
                return;
            }

            // Check if there's a partial match in all options (case where dropdown might be closed)
            const partialMatch = options.find(
                opt => !selectedIds.includes(opt.id) &&
                    opt.label.toLowerCase().includes(inputValue.trim().toLowerCase())
            );

            if (partialMatch) {
                // Found a match, select it
                handleSelect(partialMatch);
                return;
            }

            // Only try to create new if allowCreate is enabled and no matches found
            if (allowCreate && onCreateNew) {
                // Create new
                setIsProcessing(true);
                try {
                    const newId = await onCreateNew(inputValue.trim());
                    onSelect(newId);
                    setInputValue('');
                } catch (error) {
                    console.error('Error creating new entry:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    if (!errorMessage.includes('cancelled')) {
                        alert(`Error: ${errorMessage}`);
                    }
                } finally {
                    setIsProcessing(false);
                }
            }
        }
    };

    const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {/* Input with Dropdown */}
            <div ref={wrapperRef} className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => inputValue && setIsOpen(true)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder={allowCreate ? `${placeholder} (paste comma-separated list or press Enter to create new)` : placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={isProcessing}
                />

                {isProcessing && (
                    <div className="absolute right-3 top-2.5">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}

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

                {/* Create New Hint */}
                {allowCreate && inputValue && filteredOptions.length === 0 && !isProcessing && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="px-4 py-2 text-sm text-gray-600">
                            Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to create "{inputValue}"
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Pills - Below Input */}
            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 w-full max-w-full">
                    {selectedOptions.map((option) => (
                        <span
                            key={option.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-gray-300 hover:bg-blue-100 hover:border-blue-400 transition-colors flex-shrink-0 whitespace-nowrap"
                        >
                            {option.label}
                            <button
                                type="button"
                                onClick={() => onRemove(option.id)}
                                className="ml-1 text-gray-500 hover:text-blue-700 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center text-base leading-none transition-colors"
                                disabled={isProcessing}
                                title="Remove (does not delete from database)"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
