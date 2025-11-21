'use client';

import { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Theatre } from '@/types';
import { Timestamp } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';

export default function TheatresPage() {
    const [theatres, setTheatres] = useState<(Theatre & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheatre, setEditingTheatre] = useState<(Theatre & { id: string }) | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        fetchTheatres();
    }, []);

    const fetchTheatres = async () => {
        setLoading(true);
        try {
            const data = await getCollection('theatres');
            setTheatres(data as (Theatre & { id: string })[]);
        } catch (error) {
            console.error("Error fetching theatres:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (theatre?: Theatre & { id: string }) => {
        if (theatre) {
            setEditingTheatre(theatre);
            setName(theatre.name);
            setCity(theatre.city);
            setCountry(theatre.country);
        } else {
            setEditingTheatre(null);
            setName('');
            setCity('');
            setCountry('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTheatre(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const theatreData: Partial<Theatre> = {
                name,
                city,
                country,
                dateUpdated: Timestamp.now(),
            };

            if (editingTheatre) {
                await updateDocument('theatres', editingTheatre.id, theatreData);
            } else {
                theatreData.dateAdded = Timestamp.now();
                await addDocument('theatres', theatreData);
            }

            fetchTheatres();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving theatre:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this theatre?')) return;
        try {
            await deleteDocument('theatres', id);
            fetchTheatres();
        } catch (error) {
            console.error("Error deleting theatre:", error);
        }
    };

    if (loading) return <div>Loading theatres...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Theatres</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Add Theatre
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {theatres.map((theatre) => (
                            <tr key={theatre.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{theatre.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{theatre.city}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{theatre.country}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(theatre)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(theatre.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTheatre ? 'Edit Theatre' : 'Add Theatre'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {editingTheatre ? 'Save Changes' : 'Add Theatre'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
