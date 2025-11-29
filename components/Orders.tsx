
import React, { useState } from 'react';
import { Order, Product } from '../types.ts';
import { Search, Eye, ShieldCheck, ShieldAlert, Loader2, ChevronDown, Package, CheckCircle, Truck, Clock, X, AlertTriangle, RotateCcw, Ban } from 'lucide-react';
import { analyzeOrderRisk } from '../services/geminiService.ts';

interface OrdersProps {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    products: Product[];
    onCancelOrder: (orderId: string, reason: string) => void;
    onRefundOrder: (orderId: string, reason: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ orders, setOrders, products, onCancelOrder, onRefundOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [riskAnalysis, setRiskAnalysis] = useState<Record<string, string>>({});
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [actionType, setActionType] = useState<'cancel' | 'refund' | null>(null);

    const filteredOrders = orders.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const handleAnalyzeRisk = async (e: React.MouseEvent, order: Order) => {
        e.stopPropagation();
        setAnalyzing(order.id);
        const result = await analyzeOrderRisk(order);
        setRiskAnalysis(prev => ({ ...prev, [order.id]: result }));
        setAnalyzing(null);
    };

    const confirmAction = () => {
        if(!selectedOrder) return;
        if(actionType === 'cancel') {
            onCancelOrder(selectedOrder.id, actionReason || 'Customer requested cancellation');
        } else if (actionType === 'refund') {
            onRefundOrder(selectedOrder.id, actionReason || 'Item returned');
        }
        setActionType(null);
        setActionReason('');
        setSelectedOrder(null);
    };

    return (
        <div className="space-y-6">
            {/* Action Confirmation Modal (Cancel/Refund) */}
            {actionType && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActionType(null)}></div>
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
                            {actionType === 'cancel' ? <Ban className="w-5 h-5 text-red-500" /> : <RotateCcw className="w-5 h-5 text-amber-500" />}
                            {actionType === 'cancel' ? 'Cancel Order' : 'Refund Order'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            {actionType === 'cancel' 
                                ? 'This will mark the order as cancelled and restore items to stock.' 
                                : 'This will mark the order as refunded. Stock will NOT be restored automatically (use Stock Adjustment if needed).'}
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Reason</label>
                            <input autoFocus type="text" className="w-full border rounded p-2" placeholder="Reason..." value={actionReason} onChange={e => setActionReason(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setActionType(null)} className="px-4 py-2 text-slate-600">Back</button>
                            <button onClick={confirmAction} className={`px-4 py-2 text-white font-bold rounded-lg ${actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Order {selectedOrder.id}</h3>
                                <p className="text-slate-500 text-sm">Placed on {selectedOrder.date} by <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span></p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                                <div className="flex items-center gap-2">
                                    {selectedOrder.status === 'delivered' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                                     selectedOrder.status === 'shipped' ? <Truck className="w-5 h-5 text-blue-500" /> :
                                     selectedOrder.status === 'cancelled' ? <Ban className="w-5 h-5 text-red-500" /> :
                                     selectedOrder.status === 'refunded' ? <RotateCcw className="w-5 h-5 text-amber-500" /> :
                                     <Clock className="w-5 h-5 text-amber-500" />}
                                     
                                    {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'refunded') ? (
                                        <span className="font-bold uppercase text-sm">{selectedOrder.status}</span>
                                    ) : (
                                        <select 
                                            value={selectedOrder.status}
                                            onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                                            className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer hover:underline"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Amount</div>
                                <div className="text-xl font-bold text-slate-900">${selectedOrder.total.toFixed(2)}</div>
                            </div>
                        </div>

                        {riskAnalysis[selectedOrder.id] && (
                            <div className="mb-6 bg-purple-50 border border-purple-100 p-4 rounded-xl flex gap-3 items-start">
                                <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-purple-900 text-sm">AI Risk Assessment</h4>
                                    <p className="text-sm text-purple-800">{riskAnalysis[selectedOrder.id]}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wider sticky top-0 bg-white py-2">Items Ordered</h4>
                            {selectedOrder.items.map((item, idx) => {
                                const product = products.find(p => p.id === item.productId);
                                return (
                                    <div key={idx} className="flex gap-4 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-12 h-12 bg-white rounded border border-slate-200 overflow-hidden flex-shrink-0">
                                            <img src={product?.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 text-sm">{product?.name || 'Unknown Product'}</p>
                                            <p className="text-xs text-slate-500">SKU: {product?.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">${item.priceAtPurchase.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => handleAnalyzeRisk(e, selectedOrder)}
                                    disabled={analyzing === selectedOrder.id}
                                    className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-2 px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                    {analyzing === selectedOrder.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Analyze Risk
                                </button>
                                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' && (
                                    <>
                                        <button onClick={() => setActionType('cancel')} className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Ban className="w-4 h-4" /> Cancel
                                        </button>
                                        <button onClick={() => setActionType('refund')} className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors">
                                            <RotateCcw className="w-4 h-4" /> Refund
                                        </button>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
                    <p className="text-slate-500">Track and fulfill customer orders.</p>
                </div>
                <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search orders..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No orders found.</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm text-blue-600 font-medium">{order.id}</div>
                                            {riskAnalysis[order.id] && (
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mt-1">
                                                    <ShieldCheck className="w-3 h-3" /> Analyzed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{order.customerName}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{order.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="relative group/status inline-block">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                                    disabled={order.status === 'cancelled' || order.status === 'refunded'}
                                                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-700 focus:ring-green-300' : 
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700 focus:ring-blue-300' : 
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'refunded' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-yellow-100 text-yellow-700 focus:ring-yellow-300'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled" disabled>Cancelled</option>
                                                    <option value="refunded" disabled>Refunded</option>
                                                </select>
                                                {order.status !== 'cancelled' && order.status !== 'refunded' && <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500`} />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">${order.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={(e) => handleAnalyzeRisk(e, order)}
                                                    disabled={analyzing === order.id}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors tooltip"
                                                    title="Analyze Risk"
                                                >
                                                    {analyzing === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;
