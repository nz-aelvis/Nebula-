
import React, { useState } from 'react';
import { Customer, Order } from '../types.ts';
import { Mail, Search, User, MoreHorizontal, Loader2, Sparkles, X, FileText, MapPin, Building, Plus } from 'lucide-react';
import { generateMarketingEmail } from '../services/geminiService.ts';

interface CustomersProps {
  customers: Customer[];
  orders: Order[];
}

const Customers: React.FC<CustomersProps> = ({ customers, orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showStatement, setShowStatement] = useState(false);

  const getCustomerStats = (customerName: string) => {
    const customerOrders = orders.filter(o => o.customerName === customerName);
    const totalSpend = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrderDate = customerOrders.length > 0 
        ? customerOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
        : 'Never';
    return { totalSpend, orderCount: customerOrders.length, lastOrderDate, history: customerOrders };
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nif && c.nif.includes(searchTerm))
  );

  const handleDraftEmail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowStatement(false);
    setLoadingEmail(true);
    const stats = getCustomerStats(customer.name);
    const draft = await generateMarketingEmail(customer.name, stats.totalSpend);
    setEmailDraft(draft);
    setLoadingEmail(false);
  };

  const handleViewStatement = (customer: Customer) => {
      setSelectedCustomer(customer);
      setShowStatement(true);
      setEmailDraft(null);
  };

  const closeModals = () => {
      setSelectedCustomer(null);
      setEmailDraft(null);
      setShowStatement(false);
  };

  return (
    <div className="space-y-6">
       {/* Modals */}
       {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModals}></div>
            
            {showStatement ? (
                // Statement Modal
                 <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Customer Statement</h3>
                            <p className="text-slate-500">Transaction History for {selectedCustomer.name}</p>
                        </div>
                        <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</h4>
                            <p className="font-bold text-slate-800">{selectedCustomer.name}</p>
                            <p className="text-sm text-slate-600">{selectedCustomer.address || 'No Address Provided'}</p>
                            <p className="text-sm text-slate-600">{selectedCustomer.phone}</p>
                            {selectedCustomer.nif && <p className="text-sm font-mono text-slate-600">NIF: {selectedCustomer.nif}</p>}
                        </div>
                        <div className="text-right">
                             <div className="inline-block bg-slate-50 p-4 rounded-xl text-center min-w-[150px]">
                                <span className="block text-xs text-slate-500 uppercase">Total Lifetime Value</span>
                                <span className="block text-2xl font-bold text-blue-600">${getCustomerStats(selectedCustomer.name).totalSpend.toFixed(2)}</span>
                             </div>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Invoice #</th>
                                <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Description</th>
                                <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {getCustomerStats(selectedCustomer.name).history.map(order => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3 text-sm text-slate-600">{order.date}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{order.id}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">Order with {order.items.length} items</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">${order.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-end">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Print Statement
                        </button>
                    </div>
                 </div>
            ) : (
                // Email AI Modal
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">AI Marketing Draft</h3>
                                <p className="text-sm text-slate-500">Targeting: {selectedCustomer.name}</p>
                            </div>
                        </div>
                        <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-6 min-h-[200px] border border-slate-200">
                        {loadingEmail ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                <p>Analyzing purchase history & writing email...</p>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed">
                                {emailDraft}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={closeModals} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors">
                            Discard
                        </button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send Email
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
            <p className="text-slate-500">Manage NIF, contacts, and transaction history.</p>
        </div>
        <div className="flex gap-3">
            <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search name or NIF..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
            </div>
             <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm font-medium">
                <Plus className="w-4 h-4" /> Add
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIF & Address</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">VAT Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Spend</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((customer) => {
                        const stats = getCustomerStats(customer.name);
                        return (
                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{customer.name}</div>
                                            <div className="text-xs text-slate-500">{customer.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                     <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                            <Building className="w-3 h-3 text-slate-400" />
                                            {customer.nif || 'No NIF'}
                                        </div>
                                         <div className="flex items-center gap-1 text-xs text-slate-600">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span className="truncate max-w-[150px]">{customer.address || 'No Address'}</span>
                                        </div>
                                     </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                        customer.vatAssured ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {customer.vatAssured ? 'Assujetti' : 'Non-Assujetti'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    ${stats.totalSpend.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleDraftEmail(customer)}
                                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors tooltip"
                                            title="AI Email Draft"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                         <button 
                                            onClick={() => handleViewStatement(customer)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors tooltip"
                                            title="View Statement"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
