
import React, { useState } from 'react';
import { Truck, CreditCard, X, Smartphone, Globe, Lock, Phone } from 'lucide-react';
import { formatCurrency } from '../services/utils.ts';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartTotal: number;
    currency: string;
    onComplete: (details: any) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cartTotal, currency, onComplete }) => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'ecocash' | 'lumicash'>('card');
    const [details, setDetails] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        } else {
            // Include currency and method in details
            onComplete({ ...details, paymentMethod, currency });
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
                        <p className="text-sm text-slate-500">Step {step} of 2</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {step === 1 ? (
                        <>
                            <div className="space-y-4 animate-in slide-in-from-right duration-200">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Truck className="w-4 h-4" /> Shipping Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                            value={details.name} onChange={e => setDetails({...details, name: e.target.value})} placeholder="John Doe" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input required type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                            value={details.email} onChange={e => setDetails({...details, email: e.target.value})} placeholder="john@example.com" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                        <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                            value={details.address} onChange={e => setDetails({...details, address: e.target.value})} placeholder="123 Main St" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                        <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                            value={details.city} onChange={e => setDetails({...details, city: e.target.value})} placeholder="Bujumbura" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                        <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                            value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} placeholder="+257..." />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                    Continue to Payment
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4 animate-in slide-in-from-right duration-200">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> Payment Method
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Globe className="w-6 h-6" />
                                        <span className="text-xs font-bold">Card</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentMethod('ecocash')}
                                        className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'ecocash' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Smartphone className="w-6 h-6" />
                                        <span className="text-xs font-bold">EcoCash</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentMethod('lumicash')}
                                        className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'lumicash' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Smartphone className="w-6 h-6" />
                                        <span className="text-xs font-bold">Lumicash</span>
                                    </button>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-sm text-slate-800 font-medium flex justify-between items-center">
                                        <span>Total Amount:</span>
                                        <span className="font-bold text-2xl text-slate-900">{formatCurrency(cartTotal, currency)}</span>
                                    </p>
                                </div>

                                {paymentMethod === 'card' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                                            <div className="relative">
                                                <input required type="text" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                                    value={details.cardNumber} onChange={e => setDetails({...details, cardNumber: e.target.value})} placeholder="0000 0000 0000 0000" />
                                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                                                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                                    value={details.expiry} onChange={e => setDetails({...details, expiry: e.target.value})} placeholder="MM/YY" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                                                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                                    value={details.cvc} onChange={e => setDetails({...details, cvc: e.target.value})} placeholder="123" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in">
                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800 flex gap-2">
                                            <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <div>
                                                Please ensure your mobile phone is unlocked. You will receive a prompt to authorize <strong>{formatCurrency(cartTotal, currency)}</strong>.
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{paymentMethod === 'ecocash' ? 'EcoCash' : 'Lumicash'} Number</label>
                                            <div className="relative">
                                                <input required type="text" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                                    value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} placeholder="7xxxxxxx" />
                                                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                    Back
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                                    Pay {formatCurrency(cartTotal, currency)}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
