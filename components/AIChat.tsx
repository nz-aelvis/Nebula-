import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import { askERP } from '../services/geminiService.ts';
import { Product, Order } from '../types.ts';

interface AIChatProps {
    products: Product[];
    orders: Order[];
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

const AIChat: React.FC<AIChatProps> = ({ products, orders }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', text: 'Hi! I am your Nebula Assistant. Ask me anything about your stock or orders.' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        const response = await askERP(query, { products, orders });
        
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: response };
        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                <Sparkles className="w-4 h-4 text-blue-300" />
                            </div>
                            <span className="font-bold text-sm">Gemini ERP Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-sm' 
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask about inventory..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                        />
                        <button 
                            type="submit" 
                            disabled={!query.trim() || loading}
                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto flex items-center gap-2 px-5 py-4 rounded-full font-bold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    isOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                {!isOpen && <span className="hidden sm:inline">Ask AI</span>}
            </button>
        </div>
    );
};

export default AIChat;