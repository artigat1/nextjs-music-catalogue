'use client';

import { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { UserData } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

export default function UsersPage() {
    const [users, setUsers] = useState<(UserData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getCollection('users');
            setUsers(data as (UserData & { id: string })[]);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail) return;

        try {
            // Use email as ID for simplicity in this model as discussed
            // But addDocument generates an ID. 
            // Ideally we should setDoc with email as ID if we want to enforce uniqueness easily
            // or just check if it exists. 
            // For now, let's just add it. 
            // Wait, useAuth expects to find the user by email. 
            // So we should probably use setDoc with email as ID, or add a field 'email'.
            // My useAuth implementation tries to find a doc with ID = email.
            // So I must use setDoc (which I didn't export in firestore.ts, I only exported addDocument).
            // I should update firestore.ts or use addDocument and change useAuth.
            // Changing useAuth to query by email field is safer than email as ID (PII in ID).
            // But for now, let's stick to the plan or update firestore.ts.

            // Actually, I'll just use addDocument and let's say I'll update useAuth to query by email.
            // That's better practice.

            const newUser: UserData = {
                email: newUserEmail,
                role: newUserRole,
                dateAdded: Timestamp.now(),
            };

            await addDocument('users', newUser);
            setNewUserEmail('');
            fetchUsers();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleUpdateRole = async (id: string, newRole: 'viewer' | 'editor' | 'admin') => {
        try {
            await updateDocument('users', id, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteDocument('users', id);
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            {/* Add User Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                <form onSubmit={handleAddUser} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add User
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                                        className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        disabled={currentUser?.role !== 'admin'}
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.dateAdded?.toDate().toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                        disabled={currentUser?.role !== 'admin'}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
