
import React, { useState } from 'react';
import { Invoice, Product, Order, InvoiceTemplate, StoreProfile } from '../types.ts';
import { FileText, Download, Calculator, TrendingUp, Search, Globe, Ship } from 'lucide-react';
import { estimateImportDuty } from '../services/geminiService.ts';
import { formatCurrency } from '../services/utils.ts';

interface FiscalProps {
    invoices: Invoice[];
    products: Product[];
    orders: Order[];
    activeTemplate: InvoiceTemplate;
    storeProfile: StoreProfile;
}

const Fiscal: React.FC<FiscalProps> = ({ invoices, activeTemplate, storeProfile }) => {
    const [activeTab, setActiveTab] = useState<'invoices' | 'asycuda' | 'reports'>('invoices');
    
    // ASYCUDA State
    const [importForm, setImportForm] = useState({ product: '', category: '', value: '' });
    const [estimation, setEstimation] = useState<{ hsCode: string, dutyRate: string, estimatedCost: string } | null>(null);
    const [loadingEst, setLoadingEst] = useState(false);

    const renderInvoicePreview = (invoice: Invoice) => {
        const itemsHtml = invoice.items.map(item => `
            <tr>
                <td>${item.productId} (Qty: ${item.quantity})</td>
                <td>$${item.priceAtPurchase.toFixed(2)}</td>
            </tr>
        `).join('');

        const html = activeTemplate.htmlContent
            .replace('{{invoiceId}}', invoice.id)
            .replace('{{date}}', new Date().toISOString().split('T')[0])
            .replace('{{storeName}}', storeProfile.storeName)
            .replace('{{storeAddress}}', storeProfile.address)
            .replace('{{storePhone}}', storeProfile.phone)
            .replace('{{storeNif}}', storeProfile.nif)
            .replace('{{customerName}}', invoice.customerName)
            .replace('{{customerTin}}', `TIN: ${invoice.tin}`)
            .replace('{{total}}', `$${invoice.total.toFixed(2)}`)
            .replace('{{itemsRow}}', itemsHtml)
            .replace('{{fiscalSig}}', invoice.fiscalSignature)
            .replace('{{ebmsId}}', invoice.ebmsResponseId || 'N/A');

        return (
            <div className="bg-white border rounded shadow p-4 my-4 overflow-auto">
                 <style>{activeTemplate.cssContent}</style>
                 <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        );
    };

    const handleEstimateDuty = async () => {
        if (!importForm.product || !importForm.value) return;
        setLoadingEst(true);
        const result = await estimateImportDuty(importForm.product, importForm.category, parseFloat(importForm.value));
        setEstimation(result);
        setLoadingEst(false);
    };

    // Reporting Stats
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalVAT = totalRevenue * 0.18; // Approx 18% VAT

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fiscal & Compliance</h2>
                    <p className="text-slate-500">Manage OBR invoices, tax reports, and customs estimations.</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                    <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Invoices</button>
                    <button onClick={() => setActiveTab('asycuda')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'asycuda' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>ASYCUDA Estimator</button>
                    <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Tax Reports</button>
                </div>
            </div>

            {activeTab === 'invoices' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Fiscal Sig</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No invoices generated yet.</td></tr> : invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => {
                                    const win = window.open('', '_blank');
                                    if (win) {
                                        win.document.write(`<html><head><title>Invoice ${inv.id}</title><style>${activeTemplate.cssContent}</style></head><body>${renderInvoicePreview(inv).props.children[1].props.dangerouslySetInnerHTML.__html}</body></html>`);
                                        win.document.close();
                                    }
                                }}>
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600">{inv.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(inv.obrTime).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">{inv.customerName}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{inv.fiscalSignature.substring(0, 15)}...</td>
                                    <td className="px-6 py-4 font-bold">${inv.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-500 hover:text-blue-600 p-2"><FileText className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'asycuda' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Import Duty AI Estimator</h3>
                        <p className="text-sm text-slate-500 mb-6">Enter product details to estimate HS Codes and Duties for Customs declarations.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <input className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Cotton T-Shirt" value={importForm.product} onChange={e => setImportForm({...importForm, product: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category / Material</label>
                                <input className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Textiles" value={importForm.category} onChange={e => setImportForm({...importForm, category: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Declared Value (CIF $)</label>
                                <input type="number" className="w-full px-4 py-2 border rounded-lg" placeholder="1000" value={importForm.value} onChange={e => setImportForm({...importForm, value: e.target.value})} />
                            </div>
                            <button 
                                onClick={handleEstimateDuty}
                                disabled={loadingEst}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                            >
                                {loadingEst ? <Calculator className="w-4 h-4 animate-pulse" /> : <Ship className="w-4 h-4" />}
                                Calculate Duty
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center">
                        {!estimation ? (
                            <div className="text-center text-slate-400">
                                <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Results will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="text-center pb-6 border-b border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Predicted HS Code</p>
                                    <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-wider">{estimation.hsCode}</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                                        <p className="text-xs text-slate-500 mb-1">Applicable Rate</p>
                                        <p className="text-xl font-bold text-blue-600">{estimation.dutyRate}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                                        <p className="text-xs text-slate-500 mb-1">Est. Duty Cost</p>
                                        <p className="text-xl font-bold text-red-600">{estimation.estimatedCost}</p>
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">
                                    <strong>Disclaimer:</strong> AI estimates are for planning purposes only. Consult official tariff books for actual clearance.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg text-green-600"><TrendingUp className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Gross Sales</p>
                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue, storeProfile.currency)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><Calculator className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">VAT Collected (18%)</p>
                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalVAT, storeProfile.currency)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">
                            <Download className="w-5 h-5" /> Download OBR Report
                        </button>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold mb-4">Transaction Log</h3>
                        <div className="h-64 overflow-y-auto font-mono text-xs text-slate-600 space-y-2">
                            {invoices.map(inv => (
                                <div key={inv.id} className="flex justify-between border-b border-slate-50 pb-1">
                                    <span>{inv.obrTime} | {inv.fiscalSignature}</span>
                                    <span>{formatCurrency(inv.total, storeProfile.currency)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fiscal;
