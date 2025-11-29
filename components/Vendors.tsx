
import React, { useState } from 'react';
import { Vendor, PurchaseOrder } from '../types.ts';
import { Plus, Search, Truck, Phone, Mail, FileText, CheckCircle, PackagePlus } from 'lucide-react';

interface VendorsProps {
    vendors: Vendor[];
    purchaseOrders: PurchaseOrder[];
    onAddPO: (po: PurchaseOrder) => void;
    onReceivePO: (poId: string) => void;
}

const Vendors: React.FC<VendorsProps> = ({ vendors, purchaseOrders, onAddPO, onReceivePO }) => {
    const [view, setView] = useState<'list' | 'po'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [poForm, setPoForm] = useState<{vendorId: string, items: string, total: string}>({vendorId: '', items: '', total: ''});

    const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreatePO = () => {
        if(!poForm.vendorId) return;
        const newPO: PurchaseOrder = {
            id: `PO-${Date.now()}`,
            vendorId: poForm.vendorId,
            date: new Date().toISOString().split('T')[0],
            status: 'ordered',
            totalCost: parseFloat(poForm.total) || 0,
            items: [{ productName: poForm.items, quantity: 100, cost: parseFloat(poForm.total) || 0 }] // Simplified for demo
        };
        onAddPO(newPO);
        setView('list');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Vendor Management</h2>
                    <p className="text-slate-500">Manage suppliers and purchase orders.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                        Suppliers
                    </button>
                    <button 
                        onClick={() => setView('po')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'po' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                        Purchase Orders
                    </button>
                </div>
            </div>

            {view === 'list' && (
                <>
                <div className="relative w-full max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search vendors..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map(vendor => (
                        <div key={vendor.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full font-medium uppercase">{vendor.category}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{vendor.name}</h3>
                            <p className="text-slate-500 text-sm mb-4">Contact: {vendor.contactPerson}</p>
                            
                            <div className="space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" /> {vendor.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" /> {vendor.phone}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Add New Vendor Card (Visual Only) */}
                    <button className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="font-medium">Add New Vendor</span>
                    </button>
                </div>
                </>
            )}

            {view === 'po' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent POs */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-slate-800">Recent Purchase Orders</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">PO ID</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vendor</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {purchaseOrders.map(po => (
                                        <tr key={po.id}>
                                            <td className="px-6 py-4 font-mono text-sm">{po.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {vendors.find(v => v.id === po.vendorId)?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    po.status === 'received' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {po.status === 'received' && <CheckCircle className="w-3 h-3" />}
                                                    {po.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold">${po.totalCost.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                {po.status !== 'received' && (
                                                    <button 
                                                        onClick={() => onReceivePO(po.id)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                                    >
                                                        <PackagePlus className="w-3 h-3" />
                                                        Receive
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Create PO Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Create Purchase Order
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Vendor</label>
                                <select 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={poForm.vendorId}
                                    onChange={(e) => setPoForm({...poForm, vendorId: e.target.value})}
                                >
                                    <option value="">-- Choose Vendor --</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Items Description</label>
                                <textarea 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    placeholder="e.g., 50x Ergonomic Chairs, 20x Desks"
                                    value={poForm.items}
                                    onChange={(e) => setPoForm({...poForm, items: e.target.value})}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Total Cost ($)</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={poForm.total}
                                    onChange={(e) => setPoForm({...poForm, total: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={handleCreatePO}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                Submit PO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
