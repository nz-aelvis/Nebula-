
import React, { useState } from 'react';
import { BlogPost, Review, Product } from '../types.ts';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Search, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService.ts'; // Reusing AI service

interface CommunityProps {
    posts: BlogPost[];
    setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    products: Product[];
}

const Community: React.FC<CommunityProps> = ({ posts, setPosts, reviews, setReviews, products }) => {
    const [activeTab, setActiveTab] = useState<'blog' | 'reviews'>('blog');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});

    const handleSavePost = () => {
        const newPost: BlogPost = {
            id: currentPost.id || `POST-${Date.now()}`,
            title: currentPost.title || 'Untitled',
            content: currentPost.content || '',
            author: currentPost.author || 'Admin',
            date: new Date().toISOString().split('T')[0],
            tags: currentPost.tags || [],
            status: currentPost.status || 'draft',
            imageUrl: currentPost.imageUrl
        };

        if (currentPost.id) {
            setPosts(prev => prev.map(p => p.id === currentPost.id ? newPost : p));
        } else {
            setPosts(prev => [newPost, ...prev]);
        }
        setIsEditing(false);
        setCurrentPost({});
    };

    const handleDeletePost = (id: string) => {
        if(confirm('Delete this post?')) setPosts(prev => prev.filter(p => p.id !== id));
    };

    const handleReviewAction = (id: string, status: 'approved' | 'rejected') => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    // Simple AI Assist for Blog
    const handleAIAssist = async () => {
        if (!currentPost.title) return;
        // Reusing the description generator for simplicity, in real world would use a dedicated blog generator
        const content = await generateProductDescription(currentPost.title, 'Blog Post', 'engaging, informative');
        setCurrentPost(prev => ({ ...prev, content: prev.content + "\n" + content }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Community & Content</h2>
                    <p className="text-slate-500">Manage blog posts and customer reviews.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('blog')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'blog' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>Blog</button>
                    <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'reviews' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>Reviews</button>
                </div>
            </div>

            {activeTab === 'blog' && (
                <>
                    {!isEditing ? (
                        <div className="space-y-4">
                            <button onClick={() => { setCurrentPost({}); setIsEditing(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-medium">
                                <Plus className="w-4 h-4" /> New Post
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map(post => (
                                    <div key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        {post.imageUrl && <div className="h-40 bg-slate-100"><img src={post.imageUrl} className="w-full h-full object-cover" /></div>}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{post.status}</span>
                                                <span className="text-xs text-slate-400">{post.date}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 mb-2 truncate">{post.title}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-3 mb-4">{post.content}</p>
                                            <div className="flex justify-end gap-2 border-t pt-2">
                                                <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-3xl mx-auto">
                            <h3 className="font-bold text-lg mb-4">{currentPost.id ? 'Edit Post' : 'Create Post'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input type="text" className="w-full px-4 py-2 border rounded-lg" value={currentPost.title || ''} onChange={e => setCurrentPost({...currentPost, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <div className="flex gap-2">
                                        <input type="text" className="w-full px-4 py-2 border rounded-lg" value={currentPost.imageUrl || ''} onChange={e => setCurrentPost({...currentPost, imageUrl: e.target.value})} />
                                        <button className="p-2 bg-slate-100 rounded border"><ImageIcon className="w-5 h-5 text-slate-500" /></button>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="block text-sm font-medium">Content</label>
                                        <button onClick={handleAIAssist} className="text-xs text-purple-600 font-bold hover:underline">AI Assist</button>
                                    </div>
                                    <textarea className="w-full px-4 py-2 border rounded-lg h-40" value={currentPost.content || ''} onChange={e => setCurrentPost({...currentPost, content: e.target.value})}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select className="w-full px-4 py-2 border rounded-lg" value={currentPost.status || 'draft'} onChange={e => setCurrentPost({...currentPost, status: e.target.value as any})}>
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Author</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-lg" value={currentPost.author || 'Admin'} onChange={e => setCurrentPost({...currentPost, author: e.target.value})} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                                    <button onClick={handleSavePost} className="px-6 py-2 bg-slate-900 text-white rounded-lg">Save Post</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'reviews' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Comment</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No reviews yet.</td></tr> : reviews.map(review => (
                                <tr key={review.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium">{products.find(p => p.id === review.productId)?.name || 'Unknown Product'}</td>
                                    <td className="px-6 py-4 text-sm">{review.customerName}</td>
                                    <td className="px-6 py-4 text-sm text-yellow-500">{'★'.repeat(review.rating)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{review.comment}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                                            review.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                            review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>{review.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {review.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleReviewAction(review.id, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                                                    <button onClick={() => handleReviewAction(review.id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            <button onClick={() => setReviews(prev => prev.filter(r => r.id !== review.id))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Community;
