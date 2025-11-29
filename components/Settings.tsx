
import React, { useState, useRef } from 'react';
import { Save, Building2, Code, Shield, FileInput, Plus, Trash2, CheckSquare, User, Key, CheckCircle, Database, AlertTriangle, RefreshCw, Download, Upload } from 'lucide-react';
import { StoreProfile, User as UserType, InvoiceTemplate, RoleDefinition, Permission, CustomFieldDefinition } from '../types.ts';

interface SettingsProps {
    onSaveProfile: (profile: StoreProfile) => void;
    initialProfile: StoreProfile;
    currentUser: UserType;
    users: UserType[];
    setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserType>>;
    // New Props for Customization
    templates: InvoiceTemplate[];
    setTemplates: React.Dispatch<React.SetStateAction<InvoiceTemplate[]>>;
    roles: RoleDefinition[];
    setRoles: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
    customFields: CustomFieldDefinition[];
    setCustomFields: React.Dispatch<React.SetStateAction<CustomFieldDefinition[]>>;
    // Data Management
    onSeedData: () => void;
    onClearData: () => void;
    onBackupData: () => void;
    onRestoreData: (jsonString: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    onSaveProfile, initialProfile, currentUser, users, setUsers, setCurrentUser,
    templates, setTemplates, roles, setRoles, customFields, setCustomFields,
    onSeedData, onClearData, onBackupData, onRestoreData
}) => {
    const [profile, setProfile] = useState<StoreProfile>(initialProfile);
    const [activeTab, setActiveTab] = useState<'store' | 'profile' | 'templates' | 'forms' | 'roles' | 'data'>('store');
    const [saved, setSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const restoreInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [myProfile, setMyProfile] = useState({ name: currentUser.name, email: currentUser.email, password: '', confirmPassword: '' });

    // Template Editor State
    const [activeTemplate, setActiveTemplate] = useState<string>(templates[0]?.id || '');
    const currentTemplate = templates.find(t => t.id === activeTemplate);

    // Form Builder State
    const [newField, setNewField] = useState<Partial<CustomFieldDefinition>>({ target: 'product', type: 'text' });

    // Role Editor State
    const [editingRole, setEditingRole] = useState<string | null>(null);
    const roleToEdit = roles.find(r => r.id === editingRole);

    const ALL_PERMISSIONS: Permission[] = [
        'view_dashboard', 'manage_inventory', 'manage_pos', 
        'manage_orders', 'manage_customers', 'manage_finance', 
        'manage_settings', 'manage_users', 'manage_content'
    ];

    const handleSaveProfile = () => {
        onSaveProfile(profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleUpdateMyProfile = () => {
        setErrorMsg('');
        if (myProfile.password && myProfile.password !== myProfile.confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        const updatedUser: UserType = {
            ...currentUser,
            name: myProfile.name,
            email: myProfile.email,
            password: myProfile.password ? myProfile.password : currentUser.password // Update password only if provided
        };

        // Update in global users list
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        
        // Update current session
        setCurrentUser(updatedUser);

        // Clear password fields
        setMyProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateTemplate = (field: 'htmlContent' | 'cssContent', value: string) => {
        setTemplates(prev => prev.map(t => t.id === activeTemplate ? { ...t, [field]: value } : t));
    };

    const addCustomField = () => {
        if (!newField.label) return;
        setCustomFields(prev => [...prev, {
            id: `FLD-${Date.now()}`,
            target: newField.target || 'product',
            label: newField.label || 'New Field',
            type: newField.type || 'text',
            required: newField.required || false
        }]);
        setNewField({ target: 'product', type: 'text', label: '' });
    };

    const togglePermission = (roleId: string, perm: Permission) => {
        setRoles(prev => prev.map(role => {
            if (role.id !== roleId) return role;
            const hasPerm = role.permissions.includes(perm);
            return {
                ...role,
                permissions: hasPerm 
                    ? role.permissions.filter(p => p !== perm)
                    : [...role.permissions, perm]
            };
        }));
    };

    const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                onRestoreData(json);
                alert("System restored successfully from backup.");
            } catch (err) {
                alert("Invalid Backup File");
            }
        };
        reader.readAsText(file);
        if(restoreInputRef.current) restoreInputRef.current.value = '';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
                <p className="text-slate-500">Manage store profile, customization, and access control.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
                <button onClick={() => setActiveTab('store')} className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'store' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Store Profile</button>
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>My Account</button>
                <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'templates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Invoice Templates</button>
                <button onClick={() => setActiveTab('forms')} className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'forms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Form Builder</button>
                <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Roles & Permissions</button>
                <button onClick={() => setActiveTab('data')} className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Data Management</button>
            </div>

            {activeTab === 'store' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium mb-1">Store Name</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile.storeName} onChange={e => setProfile({...profile, storeName: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">NIF (Tax ID)</label><input type="text" className="w-full px-4 py-2 border rounded-lg font-mono" value={profile.nif} onChange={e => setProfile({...profile, nif: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Phone</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Address</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full px-4 py-2 border rounded-lg" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <select className="w-full px-4 py-2 border rounded-lg" value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})}>
                                <option value="USD">USD ($)</option>
                                <option value="BIF">BIF (FBu)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveProfile} className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${saved ? 'bg-green-600' : 'bg-slate-900'}`}>
                            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? 'Saved!' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in max-w-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> My Account</h3>
                    <div className="flex gap-6 mb-6 items-center">
                         <img src={currentUser.avatarUrl} className="w-20 h-20 rounded-full border border-slate-200" />
                         <div>
                             <h4 className="font-bold text-xl">{currentUser.name}</h4>
                             <p className="text-slate-500 text-sm">{currentUser.email}</p>
                             <p className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block mt-1 uppercase font-bold">{currentUser.roleId}</p>
                         </div>
                    </div>
                    
                    {errorMsg && <div className="bg-red-50 text-red-600 px-4 py-2 rounded mb-4 text-sm font-bold">{errorMsg}</div>}

                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Display Name</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={myProfile.name} onChange={e => setMyProfile({...myProfile, name: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full px-4 py-2 border rounded-lg" value={myProfile.email} onChange={e => setMyProfile({...myProfile, email: e.target.value})} /></div>
                        
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Key className="w-4 h-4" /> Change Password</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">New Password</label><input type="password" className="w-full px-4 py-2 border rounded-lg" value={myProfile.password} onChange={e => setMyProfile({...myProfile, password: e.target.value})} placeholder="Leave blank to keep current" /></div>
                                <div><label className="block text-sm font-medium mb-1">Confirm Password</label><input type="password" className="w-full px-4 py-2 border rounded-lg" value={myProfile.confirmPassword} onChange={e => setMyProfile({...myProfile, confirmPassword: e.target.value})} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleUpdateMyProfile} className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${saved ? 'bg-green-600' : 'bg-slate-900'}`}>
                            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? 'Updated!' : 'Update Account'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'templates' && currentTemplate && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Code className="w-5 h-5" /> HTML Template Editor</h3>
                        <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400">Structure (HTML)</label>
                                <textarea 
                                    className="w-full h-48 font-mono text-xs p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={currentTemplate.htmlContent}
                                    onChange={e => updateTemplate('htmlContent', e.target.value)}
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="text-xs font-bold uppercase text-slate-400">Styling (CSS)</label>
                                <textarea 
                                    className="w-full flex-1 font-mono text-xs p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={currentTemplate.cssContent}
                                    onChange={e => updateTemplate('cssContent', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[600px] overflow-hidden flex flex-col">
                        <h3 className="font-bold mb-4">Preview</h3>
                        <div className="flex-1 border border-slate-200 rounded-lg overflow-auto bg-gray-50 p-4">
                            <style>{currentTemplate.cssContent}</style>
                            <div dangerouslySetInnerHTML={{ __html: currentTemplate.htmlContent
                                .replace('{{invoiceId}}', 'INV-001')
                                .replace('{{date}}', '2024-01-01')
                                .replace('{{storeName}}', profile.storeName)
                                .replace('{{storeAddress}}', profile.address)
                                .replace('{{storePhone}}', profile.phone)
                                .replace('{{storeNif}}', profile.nif)
                                .replace('{{customerName}}', 'John Doe')
                                .replace('{{customerTin}}', 'TIN: 12345')
                                .replace('{{total}}', '$100.00')
                                .replace('{{itemsRow}}', '<tr><td>Demo Item</td><td>$100.00</td></tr>')
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'forms' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><FileInput className="w-5 h-5" /> Custom Field Builder</h3>
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Field Label</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Serial Number" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                            <select className="w-full px-3 py-2 border rounded-lg" value={newField.type} onChange={e => setNewField({...newField, type: e.target.value as any})}>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="boolean">Checkbox</option>
                            </select>
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target</label>
                            <select className="w-full px-3 py-2 border rounded-lg" value={newField.target} onChange={e => setNewField({...newField, target: e.target.value as any})}>
                                <option value="product">Product</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                        <button onClick={addCustomField} className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Add</button>
                    </div>

                    <div className="space-y-2">
                        {customFields.length === 0 && <p className="text-center text-slate-400 py-8">No custom fields defined.</p>}
                        {customFields.map(field => (
                            <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs uppercase font-bold">{field.target}</span>
                                    <span className="font-medium text-slate-900">{field.label}</span>
                                    <span className="text-xs text-slate-500 font-mono">({field.type})</span>
                                </div>
                                <button onClick={() => setCustomFields(prev => prev.filter(f => f.id !== field.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> RBAC Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border-r border-slate-100 pr-6 space-y-2">
                            {roles.map(role => (
                                <button 
                                    key={role.id} 
                                    onClick={() => setEditingRole(role.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center ${editingRole === role.id ? 'bg-blue-50 text-blue-700 font-bold border-blue-200 border' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    {role.name}
                                </button>
                            ))}
                            <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center gap-2 text-sm mt-4">
                                <Plus className="w-4 h-4" /> New Role
                            </button>
                        </div>
                        <div className="md:col-span-2">
                            {roleToEdit ? (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Role Name</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-lg" value={roleToEdit.name} onChange={(e) => setRoles(prev => prev.map(r => r.id === roleToEdit.id ? {...r, name: e.target.value} : r))} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Permissions</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ALL_PERMISSIONS.map(perm => (
                                            <label key={perm} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleToEdit.permissions.includes(perm) ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50 border-slate-200'}`}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center ${roleToEdit.permissions.includes(perm) ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                                                    {roleToEdit.permissions.includes(perm) && <CheckSquare className="w-3 h-3" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={roleToEdit.permissions.includes(perm)} onChange={() => togglePermission(roleToEdit.id, perm)} />
                                                <span className="text-sm font-medium text-slate-700">{perm.replace(/_/g, ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">Select a role to edit permissions</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
             {activeTab === 'data' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5" /> Data Management</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-xl bg-slate-50">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><RefreshCw className="w-4 h-4 text-blue-600" /> Demo Data</h4>
                            <p className="text-sm text-slate-500 mb-4">Populate the system with example products, orders, and customers for testing.</p>
                            <button onClick={onSeedData} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Seed Demo Data</button>
                        </div>

                        <div className="p-4 border rounded-xl bg-slate-50">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-600" /> Factory Reset</h4>
                            <p className="text-sm text-slate-500 mb-4">Permanently delete all system data. This action cannot be undone.</p>
                            <button onClick={onClearData} className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">Wipe All Data</button>
                        </div>
                        
                        <div className="p-4 border rounded-xl bg-slate-50">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><Download className="w-4 h-4 text-green-600" /> Backup System</h4>
                            <p className="text-sm text-slate-500 mb-4">Export all database records to a JSON file for safekeeping.</p>
                            <button onClick={onBackupData} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">Export JSON</button>
                        </div>

                         <div className="p-4 border rounded-xl bg-slate-50">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><Upload className="w-4 h-4 text-purple-600" /> Restore System</h4>
                            <p className="text-sm text-slate-500 mb-4">Import a previously saved JSON backup file. Overwrites current data.</p>
                            <button onClick={() => restoreInputRef.current?.click()} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">Import JSON</button>
                            <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreFile} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
