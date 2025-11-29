import React, { useState } from 'react';
import { Lock, ArrowRight, Store, AlertCircle, Cpu } from 'lucide-react';
import { User } from '../types.ts';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToStore: () => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToStore, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Authentication Logic (Simulated)
    setTimeout(() => {
      // Find user with matching email and password (in real app, use bcrypt compare)
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (user) {
        if (user.status === 'inactive') {
             setError('Account is disabled. Contact administrator.');
             setLoading(false);
        } else {
             onLogin(user);
        }
      } else {
        setError('Invalid credentials. Default: admin@nebula.com / admin');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nvidia rounded-full filter blur-[150px] opacity-10 animate-pulse"></div>
      
      <div className="bg-dark-surface border border-dark-border p-8 rounded-none shadow-2xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* NVIDIA-like Green Line Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-nvidia shadow-[0_0_15px_rgba(118,185,0,0.8)]"></div>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-black border border-nvidia/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(118,185,0,0.2)]">
            <Cpu className="w-8 h-8 text-nvidia" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Nebula <span className="text-nvidia">ERP</span></h1>
          <p className="text-dark-muted text-sm uppercase tracking-widest">Enterprise System Access</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-xs font-bold text-nvidia mb-2 uppercase tracking-wider">Email Identity</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-nvidia focus:shadow-[0_0_10px_rgba(118,185,0,0.3)] transition-all"
              placeholder="admin@nebula.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-nvidia mb-2 uppercase tracking-wider">Security Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-nvidia focus:shadow-[0_0_10px_rgba(118,185,0,0.3)] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-nvidia text-black font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(118,185,0,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                Authenticate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-border text-center">
          <button 
            onClick={onNavigateToStore}
            className="text-dark-muted hover:text-nvidia transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto uppercase tracking-wide"
          >
            <Store className="w-4 h-4" />
            Public Storefront
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;