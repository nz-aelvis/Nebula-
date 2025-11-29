
import React, { useState } from 'react';
import { User, RoleDefinition } from '../types.ts';
import { Users, Search, Plus, Edit, Trash2, Shield, Mail, CheckCircle, XCircle } from 'lucide-react';
import { DEFAULT_ROLES } from '../constants.ts';

interface AdminUsersProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isAdding, setIsAdding] = useState(false);
    
    // In a real app, roles would come from props/context, falling back to defaults here
    const availableRoles = JSON.parse(localStorage.getItem('roles') || JSON.stringify(DEFAULT_ROLES)) as RoleDefinition[];

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (user: User) => {
        setFormData(user);
        setIsEditing(user.id);
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to disable this user?')) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'inactive' } : u));
        }
    };

    const handleSave = () => {
        if (isAdding) {
            const newUser: User = {
                id: `USR-${Date.now()}`,
                status: 'active',
                avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
                name: formData.name || 'New User',
                email: formData.email || '',
                roleId: formData.roleId || availableRoles[0].id
            };
            setUsers(prev => [...prev, newUser]);
        } else if (isEditing) {
            setUsers(prev => prev.map(u => u.id === isEditing ? { ...u, ...formData } as User : u));
        }
        setIsAdding(false);
        setIsEditing(null);
        setFormData({});
    };

    const getRoleName = (roleId: string) => availableRoles.find(r => r.id === roleId)?.name || 'Unknown Role';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                    <p className="text-slate-500">Manage access control and RBAC roles.</p>
                </div>
                <button 
                    onClick={() => { setIsAdding(true); setFormData({ roleId: availableRoles[0].id, status: 'active' }); }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Edit/Add Modal Overlay */}
            {(isEditing || isAdding) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsAdding(false); setIsEditing(null); }}></div>
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">{isAdding ? 'Create New User' : 'Edit User'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                                        value={formData.roleId}
                                        onChange={e => setFormData({...formData, roleId: e.target.value})}
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button 
                                    onClick={() => { setIsAdding(false); setIsEditing(null); }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                                >
                                    Save User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative w-full max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200" />
                                        <div>
                                            <div className="font-medium text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border bg-blue-50 text-blue-700 border-blue-100">
                                        <Shield className="w-3 h-3" /> {getRoleName(user.roleId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                        user.status === 'active' ? 'text-green-600' : 'text-slate-400'
                                    }`}>
                                        {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        <span className="capitalize">{user.status}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
