
import React, { useState, useRef } from 'react';
import { Product, CustomFieldDefinition, StockMovement } from '../types.ts';
import { generateProductDescription, suggestPrice } from '../services/geminiService.ts';
import { Plus, Edit, Trash2, Wand2, Loader2, Save, X, Search, Filter, Download, DollarSign, Layers, History, ArrowRightLeft, Upload } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  searchTerm: string;
  customFields: CustomFieldDefinition[];
  // New props for stock movements
  stockMovements: StockMovement[];
  onAdjustStock: (productId: string, quantity: number, type: StockMovement['type'], reason: string) => void;
  onImportProducts: (products: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
    products, setProducts, searchTerm, customFields, 
    stockMovements, onAdjustStock, onImportProducts 
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Adjustment State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<StockMovement['type']>('adjustment');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // History State
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const productCustomFields = customFields.filter(f => f.target === 'product');

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(product.id);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setFormData({
      name: '', sku: '', category: '', price: 0, stock: 0, 
      customFields: {}
    });
    setIsAdding(true);
    setIsEditing(null);
  };

  const handleSave = () => {
    if (isAdding) {
      const newProduct = { ...formData, id: `PROD-${Date.now()}` } as Product;
      setProducts(prev => [...prev, newProduct]);
    } else if (isEditing) {
      setProducts(prev => prev.map(p => p.id === isEditing ? { ...p, ...formData } as Product : p));
    }
    setIsEditing(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        customFields: {
            ...prev.customFields,
            [fieldId]: value
        }
    }));
  };

  const handleAIGenerate = async () => {
      if (!formData.name || !formData.category) return;
      setLoadingAI(true);
      const desc = await generateProductDescription(formData.name, formData.category, "quality");
      const price = await suggestPrice(formData.name, formData.category, formData.price || 0);
      setFormData(prev => ({ ...prev, description: desc, price: price }));
      setLoadingAI(false);
  };

  const submitAdjustment = () => {
      if(!adjustingProduct || !adjustmentQty) return;
      const qty = parseInt(adjustmentQty);
      if(isNaN(qty) || qty === 0) return;

      onAdjustStock(adjustingProduct.id, qty, adjustmentType, adjustmentReason || 'Manual Adjustment');
      setAdjustingProduct(null);
      setAdjustmentQty('');
      setAdjustmentReason('');
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const text = event.target?.result as string;
              const lines = text.split('\n').filter(line => line.trim() !== '');
              const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
              
              const newProducts: Product[] = [];
              
              for(let i=1; i<lines.length; i++) {
                  const values = lines[i].split(',');
                  if(values.length < headers.length) continue;
                  
                  const p: any = { id: `PROD-IMP-${Date.now()}-${i}`, customFields: {} };
                  headers.forEach((h, idx) => {
                      const val = values[idx]?.trim();
                      if(h === 'price' || h === 'stock' || h === 'costprice') p[h] = parseFloat(val) || 0;
                      else if(h === 'vatrate') p.vatRate = parseFloat(val) || 0;
                      else p[h] = val;
                  });
                  // Defaults
                  if(!p.name) p.name = "Imported Product";
                  if(!p.category) p.category = "Uncategorized";
                  
                  newProducts.push(p as Product);
              }
              onImportProducts(newProducts);
              alert(`Successfully imported ${newProducts.length} products.`);
          } catch(err) {
              alert("Error parsing CSV. Ensure format: Name,SKU,Category,Price,Stock");
          }
      };
      reader.readAsText(file);
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isEditing || isAdding) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold">{isAdding ? 'Add Product' : 'Edit Product'}</h2>
          <button onClick={() => { setIsAdding(false); setIsEditing(null); }}><X className="w-6 h-6" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-bold flex gap-2"><Layers className="w-4 h-4" /> Core Info</h3>
                <div><label className="text-sm font-medium">Name</label><input className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium">SKU</label><input className="w-full border rounded p-2" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
                    <div><label className="text-sm font-medium">Category</label><input className="w-full border rounded p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                </div>
                <div>
                     <div className="flex justify-between"><label className="text-sm font-medium">Description</label><button onClick={handleAIGenerate} className="text-xs text-purple-600 flex gap-1 items-center">{loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Fill</button></div>
                     <textarea className="w-full border rounded p-2" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold flex gap-2"><DollarSign className="w-4 h-4" /> Financials</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium">Price</label><input type="number" className="w-full border rounded p-2" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} /></div>
                    <div><label className="text-sm font-medium">Cost</label><input type="number" className="w-full border rounded p-2" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})} /></div>
                    {isAdding && (<div><label className="text-sm font-medium">Initial Stock</label><input type="number" className="w-full border rounded p-2" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div>)}
                    <div><label className="text-sm font-medium">Image URL</label><input className="w-full border rounded p-2" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} /></div>
                </div>

                {/* Custom Fields Section */}
                {productCustomFields.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                        <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Custom Properties</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {productCustomFields.map(field => (
                                <div key={field.id}>
                                    <label className="text-sm font-medium block mb-1">{field.label}</label>
                                    {field.type === 'boolean' ? (
                                        <input type="checkbox" checked={!!formData.customFields?.[field.id]} onChange={e => handleCustomFieldChange(field.id, e.target.checked)} />
                                    ) : (
                                        <input 
                                            type={field.type === 'number' ? 'number' : 'text'} 
                                            className="w-full border rounded p-2 text-sm"
                                            value={formData.customFields?.[field.id] || ''}
                                            onChange={e => handleCustomFieldChange(field.id, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-slate-600">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-slate-900 text-white rounded-lg flex gap-2 items-center"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adjustment Modal */}
      {adjustingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAdjustingProduct(null)}></div>
              <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> Adjust Stock</h3>
                  <p className="text-sm text-slate-500 mb-4">Adjusting inventory for <span className="font-bold text-slate-800">{adjustingProduct.name}</span>. Current Stock: {adjustingProduct.stock}</p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Adjustment Type</label>
                          <select className="w-full p-2 border rounded-lg" value={adjustmentType} onChange={e => setAdjustmentType(e.target.value as any)}>
                              <option value="adjustment">Manual Correction (+/-)</option>
                              <option value="transfer">Stock Transfer</option>
                              <option value="correction">Damage / Shrinkage</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Quantity Change (Use negative for reduction)</label>
                          <input type="number" className="w-full p-2 border rounded-lg" placeholder="-5 or 10" value={adjustmentQty} onChange={e => setAdjustmentQty(e.target.value)} autoFocus />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Reason</label>
                          <input type="text" className="w-full p-2 border rounded-lg" placeholder="Audit correction, Warehouse B transfer..." value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setAdjustingProduct(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                          <button onClick={submitAdjustment} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Apply Adjustment</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* History Modal */}
      {viewingHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingHistory(null)}></div>
              <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2"><History className="w-5 h-5" /> Stock Movement History</h3>
                      <button onClick={() => setViewingHistory(null)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto border rounded-lg">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b sticky top-0">
                              <tr>
                                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Date</th>
                                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Type</th>
                                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Qty</th>
                                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Reason</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {stockMovements.filter(m => m.productId === viewingHistory).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                                  <tr key={m.id}>
                                      <td className="px-4 py-2 text-xs text-slate-600">{new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString()}</td>
                                      <td className="px-4 py-2"><span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${m.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.type}</span></td>
                                      <td className={`px-4 py-2 text-sm font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                                      <td className="px-4 py-2 text-sm text-slate-700">{m.reason}</td>
                                  </tr>
                              ))}
                              {stockMovements.filter(m => m.productId === viewingHistory).length === 0 && (
                                  <tr><td colSpan={4} className="p-4 text-center text-slate-400">No history found.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
        <div className="flex gap-2">
             <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none cursor-pointer hover:border-slate-400 transition-colors">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
             <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                 <Upload className="w-4 h-4" /> Import CSV
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload} />
            <button onClick={handleAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"><Plus className="w-4 h-4" /> Add Product</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
                <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Price/Stock</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Custom Fields</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-mono">${p.price}</div>
                            <div className={`text-xs ${p.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{p.stock} units</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(p.customFields || {}).map(([key, val]) => {
                                    const label = customFields.find(f => f.id === key)?.label || key;
                                    return <span key={key} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">{label}: {val}</span>;
                                })}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-1">
                                <button onClick={() => setAdjustingProduct(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Adjust Stock"><ArrowRightLeft className="w-4 h-4" /></button>
                                <button onClick={() => setViewingHistory(p.id)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="View History"><History className="w-4 h-4" /></button>
                                <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => setProducts(prev => prev.filter(pr => pr.id !== p.id))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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

export default Inventory;
