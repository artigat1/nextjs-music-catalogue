'use client';

import { useState } from 'react';
import Modal from './Modal';

interface TheatreCreateModalProps {
    isOpen: boolean;
    theatreName: string;
    onClose: () => void;
    onCreate: (name: string, city: string, country: string) => Promise<void>;
}

export default function TheatreCreateModal({
    isOpen,
    theatreName,
    onClose,
    onCreate,
}: TheatreCreateModalProps) {
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onCreate(theatreName, city, country);
            setCity('');
            setCountry('');
            onClose();
        } catch (error) {
            console.error('Error creating theatre:', error);
            alert('Error creating theatre. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCity('');
        setCountry('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Theatre">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theatre Name
                    </label>
                    <input
                        type="text"
                        value={theatreName}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                    </label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., London"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                    </label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., United Kingdom"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Theatre'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
