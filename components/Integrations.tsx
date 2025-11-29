
import React, { useState } from 'react';
import { IntegrationConfig } from '../types.ts';
import { Puzzle, Check, X, Key, Globe, Eye, EyeOff } from 'lucide-react';

interface IntegrationsProps {
    integrations: IntegrationConfig[];
    setIntegrations: React.Dispatch<React.SetStateAction<IntegrationConfig[]>>;
}

const Integrations: React.FC<IntegrationsProps> = ({ integrations, setIntegrations }) => {
    const [showKey, setShowKey] = useState<string | null>(null);

    const toggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, isEnabled: !i.isEnabled } : i));
    };

    const updateApiKey = (id: string, newKey: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, apiKey: newKey } : i));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Integrator Hub</h2>
                <p className="text-slate-500">Manage third-party connections and API keys.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {integrations.map(integration => (
                    <div key={integration.id} className={`p-6 rounded-xl border transition-all ${integration.isEnabled ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${integration.isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {integration.provider === 'stripe' ? <Globe className="w-6 h-6" /> : 
                                     integration.provider === 'ecocash' ? <Key className="w-6 h-6" /> :
                                     <Puzzle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{integration.name}</h3>
                                    <p className="text-xs text-slate-500">{integration.description}</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={integration.isEnabled} 
                                    onChange={() => toggleIntegration(integration.id)}
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-100 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </div>

                        {integration.isEnabled && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key / Secret</label>
                                    <div className="relative">
                                        <input 
                                            type={showKey === integration.id ? "text" : "password"} 
                                            value={integration.apiKey}
                                            onChange={(e) => updateApiKey(integration.id, e.target.value)}
                                            className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-600"
                                        />
                                        <button 
                                            onClick={() => setShowKey(showKey === integration.id ? null : integration.id)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showKey === integration.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                
                                {integration.provider.includes('cash') && (
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Webhook URL</label>
                                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <code className="text-xs text-slate-600 flex-1 overflow-hidden text-ellipsis">https://api.nebula.com/webhooks/{integration.provider}</code>
                                            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Active</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {!integration.isEnabled && (
                            <div className="h-20 flex items-center justify-center text-slate-400 text-sm italic">
                                Integration Disabled
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Integrations;
