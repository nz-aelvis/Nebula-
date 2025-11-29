
import React, { useState } from 'react';
import { Product, OrderItem, StoreProfile } from '../types.ts';
import { Search, ShoppingCart, Trash2, Printer, RefreshCw, CreditCard, Banknote, ScanBarcode, User, Building2 } from 'lucide-react';
import { generateFiscalSignature } from '../services/geminiService.ts';
import { formatCurrency, convertPrice } from '../services/utils.ts';

interface POSProps {
    products: Product[];
    onCompleteSale: (items: OrderItem[], total: number, paymentMethod: string, fiscalSig: string) => void;
    storeProfile: StoreProfile;
}

const POS: React.FC<POSProps> = ({ products, onCompleteSale, storeProfile }) => {
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'|'mobile'>('cash');
    const [processing, setProcessing] = useState(false);
    const [customerNIF, setCustomerNIF] = useState('');
    const [customerName, setCustomerName] = useState('');
    
    // POS typically uses the store's default currency (likely BIF or USD depending on settings)
    const currency = storeProfile.currency || 'USD';

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    const filteredProducts = products.filter(p => 
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
        (selectedCategory === 'All' || p.category === selectedCategory)
    );

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, quantity: 1, priceAtPurchase: product.price }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.productId === productId) return { ...i, quantity: Math.max(1, i.quantity + delta) };
            return i;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(i => i.productId !== productId));
    };

    const cartTotalBase = cart.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
    const taxAmountBase = storeProfile.vatAssured ? cartTotalBase * 0.18 : 0; 
    const finalTotalBase = cartTotalBase + taxAmountBase;
    
    // Converted totals for Display
    const finalTotalDisplay = convertPrice(finalTotalBase, currency);

    const handleCheckout = async () => {
        setProcessing(true);
        const fiscalSig = await generateFiscalSignature(finalTotalBase, new Date().toISOString(), `POS-${Date.now()}`);
        setTimeout(() => {
            onCompleteSale(cart, finalTotalBase, paymentMethod, fiscalSig);
            setCart([]);
            setIsCheckingOut(false);
            setProcessing(false);
            setCustomerNIF('');
            setCustomerName('');
        }, 1500);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Scan barcode or search..." className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                        <ScanBarcode className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <select className="px-4 py-3 bg-slate-100 rounded-lg outline-none font-medium text-slate-600 cursor-pointer" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                    {filteredProducts.map(product => (
                        <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 transition-all hover:shadow-md flex flex-col">
                            <div className="h-28 bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded backdrop-blur-sm">{product.uom || 'Pcs'}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{product.name}</h3>
                            <div className="flex justify-between items-center mt-auto">
                                <span className="text-slate-500 text-xs font-mono">{product.sku}</span>
                                <span className="font-bold text-blue-600">{formatCurrency(product.price, currency)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-96 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Current Sale</h2>
                    <button onClick={() => setCart([])} className="text-slate-400 hover:text-white p-1"><RefreshCw className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map((item, idx) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-slate-900">{product?.name}</div>
                                    <div className="text-xs text-slate-500">{formatCurrency(item.priceAtPurchase, currency)} x {item.quantity} {product?.uom}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-white border border-slate-200 rounded-md">
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1); }} className="px-2 py-1 text-slate-600 hover:bg-slate-100">-</button>
                                        <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1); }} className="px-2 py-1 text-slate-600 hover:bg-slate-100">+</button>
                                    </div>
                                    <div className="font-bold text-slate-900 text-sm w-12 text-right">{formatCurrency(item.priceAtPurchase * item.quantity, currency)}</div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500"><span>Subtotal (HT)</span><span>{formatCurrency(cartTotalBase, currency)}</span></div>
                    {storeProfile.vatAssured && <div className="flex justify-between text-sm text-slate-500"><span>VAT (18%)</span><span>{formatCurrency(taxAmountBase, currency)}</span></div>}
                    <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200"><span>Total (TTC)</span><span>{formatCurrency(finalTotalBase, currency)}</span></div>
                    {!isCheckingOut ? (
                        <button onClick={() => setIsCheckingOut(true)} disabled={cart.length === 0} className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50">Checkout</button>
                    ) : (
                        <div className="mt-4 space-y-3 animate-in slide-in-from-bottom duration-300">
                            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                                <div className="text-xs font-bold text-slate-400 uppercase">Customer Info</div>
                                <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><input type="text" placeholder="Customer Name" className="w-full text-sm outline-none" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                                <div className="flex items-center gap-2 border-t border-slate-100 pt-2"><Building2 className="w-4 h-4 text-slate-400" /><input type="text" placeholder="Customer NIF" className="w-full text-sm outline-none font-mono" value={customerNIF} onChange={e => setCustomerNIF(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setPaymentMethod('cash')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs font-medium ${paymentMethod === 'cash' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white'}`}><Banknote className="w-5 h-5" /> Cash</button>
                                <button onClick={() => setPaymentMethod('card')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs font-medium ${paymentMethod === 'card' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white'}`}><CreditCard className="w-5 h-5" /> Card</button>
                                <button onClick={() => setPaymentMethod('mobile')} className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs font-medium ${paymentMethod === 'mobile' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white'}`}><ScanBarcode className="w-5 h-5" /> Mobile</button>
                            </div>
                            <button onClick={handleCheckout} disabled={processing} className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">{processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} Print Fiscal Receipt</button>
                            <button onClick={() => setIsCheckingOut(false)} className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default POS;
