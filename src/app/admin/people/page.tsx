'use client';

import { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Person } from '@/types';
import { Timestamp } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';

export default function PeoplePage() {
    const [people, setPeople] = useState<(Person & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<(Person & { id: string }) | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [info, setInfo] = useState('');

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        setLoading(true);
        try {
            const data = await getCollection('people');
            setPeople(data as (Person & { id: string })[]);
        } catch (error) {
            console.error("Error fetching people:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (person?: Person & { id: string }) => {
        if (person) {
            setEditingPerson(person);
            setName(person.name);
            setInfo(person.info);
        } else {
            setEditingPerson(null);
            setName('');
            setInfo('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPerson(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const personData: Partial<Person> = {
                name,
                info,
                dateUpdated: Timestamp.now(),
            };

            if (editingPerson) {
                await updateDocument('people', editingPerson.id, personData);
            } else {
                personData.dateAdded = Timestamp.now();
                await addDocument('people', personData);
            }

            fetchPeople();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving person:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this person?')) return;
        try {
            await deleteDocument('people', id);
            fetchPeople();
        } catch (error) {
            console.error("Error deleting person:", error);
        }
    };

    if (loading) return <div>Loading people...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-primary">People</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Add Person
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-accent/20 overflow-hidden">
                <table className="min-w-full divide-y divide-accent/10">
                    <thead className="bg-surface/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider font-serif">Info</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-primary uppercase tracking-wider font-serif">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-accent/10">
                        {people.map((person) => (
                            <tr key={person.id} className="hover:bg-surface/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{person.name}</td>
                                <td className="px-6 py-4 text-sm text-foreground/70 max-w-xs truncate">{person.info}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(person)}
                                        className="text-accent hover:text-primary mr-4 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(person.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
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
                title={editingPerson ? 'Edit Person' : 'Add Person'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Info</label>
                        <textarea
                            value={info}
                            onChange={(e) => setInfo(e.target.value)}
                            className="w-full px-3 py-2 border border-accent/30 rounded-md focus:ring-accent focus:border-accent bg-background text-foreground"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-foreground/70 hover:bg-surface rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            {editingPerson ? 'Save Changes' : 'Add Person'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
