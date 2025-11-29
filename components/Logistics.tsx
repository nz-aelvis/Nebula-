
import React, { useState } from 'react';
import { Shipment } from '../types.ts';
import { Truck, MapPin, Package, Clock, Globe, Plus, ChevronDown } from 'lucide-react';

interface LogisticsProps {
    shipments: Shipment[];
    onAddShipment: (shipment: Shipment) => void;
    onUpdateStatus: (id: string, status: Shipment['status']) => void;
}

const Logistics: React.FC<LogisticsProps> = ({ shipments, onAddShipment, onUpdateStatus }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
        type: 'incoming',
        carrier: '',
        referenceId: '',
        estimatedArrival: ''
    });

    const handleCreate = () => {
        if (!newShipment.carrier || !newShipment.referenceId) return;
        
        onAddShipment({
            id: `SHP-${Date.now().toString().slice(-4)}`,
            type: newShipment.type as 'incoming' | 'outgoing',
            referenceId: newShipment.referenceId || '',
            status: 'processing',
            carrier: newShipment.carrier || '',
            estimatedArrival: newShipment.estimatedArrival || new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
        setNewShipment({ type: 'incoming', carrier: '', referenceId: '', estimatedArrival: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Logistics & Fleet</h2>
                    <p className="text-slate-500">Track incoming supplies and customer deliveries.</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" /> New Shipment
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-slate-800 mb-4">Create New Shipment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select 
                                className="w-full px-3 py-2 border rounded-lg outline-none"
                                value={newShipment.type}
                                onChange={e => setNewShipment({...newShipment, type: e.target.value as any})}
                            >
                                <option value="incoming">Incoming (Supply)</option>
                                <option value="outgoing">Outgoing (Delivery)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reference ID (PO/Order)</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border rounded-lg outline-none"
                                placeholder="PO-123 or ORD-456"
                                value={newShipment.referenceId}
                                onChange={e => setNewShipment({...newShipment, referenceId: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Carrier</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border rounded-lg outline-none"
                                placeholder="DHL, FedEx, Maersk"
                                value={newShipment.carrier}
                                onChange={e => setNewShipment({...newShipment, carrier: e.target.value})}
                            />
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={handleCreate}
                                className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Track Shipment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm">Active Imports</p>
                            <h3 className="text-2xl font-bold">{shipments.filter(s => s.type === 'incoming' && s.status !== 'delivered').length} Shipments</h3>
                        </div>
                    </div>
                    <div className="w-full bg-blue-800/50 rounded-full h-1.5 mb-2">
                        <div className="bg-white/90 h-1.5 rounded-full w-2/3"></div>
                    </div>
                    <p className="text-xs text-blue-200">Customs Clearance Pending</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-emerald-100 text-sm">Local Fleet</p>
                            <h3 className="text-2xl font-bold">5 Trucks</h3>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <span className="px-2 py-1 bg-white/20 rounded text-xs">TRK-001 (Active)</span>
                        <span className="px-2 py-1 bg-white/20 rounded text-xs">TRK-002 (Idle)</span>
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 mt-6">Shipment Tracking</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {shipments.map(shipment => (
                        <div key={shipment.id} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${
                                        shipment.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                        shipment.status === 'customs' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {shipment.type === 'incoming' ? <Globe className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900">{shipment.id}</h4>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded uppercase tracking-wide">{shipment.carrier}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> ref: {shipment.referenceId}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <div className="relative inline-block">
                                            <select 
                                                value={shipment.status}
                                                onChange={(e) => onUpdateStatus(shipment.id, e.target.value as any)}
                                                className={`appearance-none pl-2 pr-6 py-1 rounded text-sm font-bold capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                                                    shipment.status === 'customs' ? 'text-amber-600 bg-amber-50' : 
                                                    shipment.status === 'delivered' ? 'text-green-600 bg-green-50' : 
                                                    'text-blue-600 bg-blue-50'
                                                }`}
                                            >
                                                <option value="processing">Processing</option>
                                                <option value="in-transit">In Transit</option>
                                                <option value="customs">Customs</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Est. Arrival</p>
                                        <div className="flex items-center justify-end gap-1 text-sm font-medium text-slate-700">
                                            <Clock className="w-3 h-3" /> {shipment.estimatedArrival}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 relative">
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                                    <div 
                                        style={{ width: shipment.status === 'delivered' ? '100%' : shipment.status === 'in-transit' ? '60%' : '30%' }} 
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                                            shipment.status === 'customs' ? 'bg-amber-500' : 
                                            shipment.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Logistics;
