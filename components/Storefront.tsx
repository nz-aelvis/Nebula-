import React, { useState } from 'react';
import { Product, OrderItem, BlogPost, Review } from '../types.ts';
import { ShoppingCart, Eye, Sparkles, X, MessageSquare, BookOpen, Star, Cpu } from 'lucide-react';
import { formatCurrency } from '../services/utils.ts';

interface StorefrontProps {
  products: Product[];
  cart: OrderItem[];
  addToCart: (product: Product) => void;
  cartTotal: number;
  searchTerm: string;
  currency: string;
  blogPosts: BlogPost[];
  reviews: Review[];
}

const Storefront: React.FC<StorefrontProps> = ({ 
    products, cart, addToCart, searchTerm, currency, blogPosts, reviews 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewBlog, setViewBlog] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const publishedPosts = blogPosts.filter(p => p.status === 'published');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductRating = (prodId: string) => {
      const prodReviews = reviews.filter(r => r.productId === prodId && r.status === 'approved');
      if (prodReviews.length === 0) return null;
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      return { avg, count: prodReviews.length };
  };

  if (viewBlog) {
      return (
          <div className="max-w-7xl mx-auto px-4 py-8">
              <button onClick={() => setViewBlog(false)} className="mb-6 text-nvidia hover:text-white flex items-center gap-2 uppercase text-xs font-bold tracking-widest">← Back to Store</button>
              <h1 className="text-4xl font-bold mb-8 text-white uppercase tracking-tighter">Community Intelligence</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {publishedPosts.map(post => (
                      <div key={post.id} className="bg-dark-surface border border-dark-border rounded-none overflow-hidden hover:border-nvidia transition-colors group">
                          {post.imageUrl && <div className="h-48 overflow-hidden"><img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-80 group-hover:opacity-100" /></div>}
                          <div className="p-6">
                              <span className="text-[10px] font-bold text-nvidia uppercase tracking-widest border border-nvidia/30 px-2 py-1">{post.tags[0]}</span>
                              <h2 className="text-xl font-bold mt-3 mb-3 text-white group-hover:text-nvidia transition-colors">{post.title}</h2>
                              <p className="text-dark-muted line-clamp-3 text-sm">{post.content}</p>
                              <div className="mt-4 pt-4 border-t border-dark-border flex justify-between text-xs text-dark-muted font-mono">
                                  <span>{post.author}</span>
                                  <span>{post.date}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setQuickViewProduct(null)}></div>
            <div className="relative bg-dark-surface border border-dark-border rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-4xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-200">
                <div className="h-64 md:h-auto bg-black relative">
                    <img src={quickViewProduct.imageUrl} className="w-full h-full object-contain p-8" />
                </div>
                <div className="p-8 flex flex-col h-full bg-dark-surface">
                    <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white" /></button>
                    <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">{quickViewProduct.name}</h2>
                    <p className="text-dark-muted mb-6 flex-1 text-sm leading-relaxed">{quickViewProduct.description}</p>
                    
                    {/* Reviews Section in Modal */}
                    <div className="mb-6 p-4 bg-black/50 border border-dark-border">
                        <h4 className="font-bold text-xs uppercase text-nvidia mb-3 flex items-center gap-2 tracking-widest"><MessageSquare className="w-3 h-3" /> Field Reports</h4>
                        {reviews.filter(r => r.productId === quickViewProduct.id && r.status === 'approved').length > 0 ? (
                            <div className="space-y-3">
                                {reviews.filter(r => r.productId === quickViewProduct.id && r.status === 'approved').slice(0, 2).map(r => (
                                    <div key={r.id} className="text-sm border-b border-dark-border pb-2 last:border-0">
                                        <div className="flex justify-between font-medium text-white mb-1">
                                            <span>{r.customerName}</span>
                                            <span className="text-nvidia flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-nvidia" /> {r.rating}</span>
                                        </div>
                                        <p className="text-dark-muted text-xs">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-xs text-dark-muted">No reports filed.</p>}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-dark-border">
                         <span className="text-3xl font-bold text-white font-mono">{formatCurrency(quickViewProduct.price, currency)}</span>
                         <button onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }} className="px-8 py-3 bg-nvidia text-black font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                             <ShoppingCart className="w-5 h-5" /> Acquire
                         </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-dark-surface border border-dark-border p-12 relative overflow-hidden shadow-2xl flex justify-between items-center group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nvidia rounded-full filter blur-[150px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-block border border-nvidia/30 px-3 py-1 mb-4 text-[10px] font-bold text-nvidia uppercase tracking-[0.2em] bg-nvidia/5">Next Gen Performance</div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tighter text-white uppercase">System <span className="text-transparent bg-clip-text bg-gradient-to-r from-nvidia to-white">Upgrade</span></h1>
          <p className="text-lg text-dark-muted mb-8 font-light">Advanced components curated by AI algorithms.</p>
          <div className="flex gap-4">
             <button className="px-8 py-3 bg-nvidia text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">Initialize Shop</button>
             <button onClick={() => setViewBlog(true)} className="px-8 py-3 border border-dark-border text-white font-bold uppercase tracking-widest hover:border-nvidia hover:text-nvidia transition-colors flex items-center gap-2"><Cpu className="w-4 h-4" /> Intelligence</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-dark-border">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-nvidia text-black' : 'bg-transparent text-dark-muted hover:text-white'}`}>{cat}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                    const rating = getProductRating(product.id);
                    return (
                        <div key={product.id} className="bg-dark-surface border border-dark-border overflow-hidden hover:border-nvidia transition-all group flex flex-col relative">
                            <div className="relative h-64 bg-black group">
                                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity" />}
                                <div className="absolute inset-0 bg-black/50 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                    <button onClick={() => setQuickViewProduct(product)} className="px-6 py-2 border border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">Scan</button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col bg-dark-surface">
                                {rating && <div className="flex items-center gap-1 text-[10px] text-nvidia mb-2 tracking-widest font-bold"><Star className="w-3 h-3 fill-nvidia" /> {rating.avg.toFixed(1)} <span className="text-dark-muted">({rating.count} RPT)</span></div>}
                                <h3 className="text-md font-bold text-white mb-1 uppercase tracking-wide">{product.name}</h3>
                                <p className="text-xs text-dark-muted line-clamp-2 mb-4 flex-1 font-mono">{product.description}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-border">
                                    <span className="text-lg font-bold text-nvidia font-mono">{formatCurrency(product.price, currency)}</span>
                                    <button onClick={() => addToCart(product)} className="p-2 text-dark-muted hover:text-white hover:bg-white/10 transition-colors"><ShoppingCart className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
      </div>
    </div>
  );
};

export default Storefront;