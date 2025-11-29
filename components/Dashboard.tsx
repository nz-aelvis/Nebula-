import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { Product, SalesStat, Order } from '../types.ts';
import { analyzeInventoryRisks, forecastSales } from '../services/geminiService.ts';
import { formatCurrency, convertPrice } from '../services/utils.ts';
import { AlertCircle, TrendingUp, Package, DollarSign, Activity, Sparkles, Cpu } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  salesData: SalesStat[];
  orders: Order[];
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ products, salesData, orders, currency }) => {
  const [riskAnalysis, setRiskAnalysis] = useState<string>("Analyzing inventory...");
  const [salesForecastAdvice, setSalesForecastAdvice] = useState<string>("Forecasting future trends...");
  const [chartData, setChartData] = useState<any[]>(salesData);
  
  const totalRevenueBase = orders.reduce((sum, order) => sum + order.total, 0); 
  const totalOrders = orders.length;
  const lowStockCount = products.filter(p => p.stock < 10).length;

  useEffect(() => {
    let isMounted = true;
    const runAI = async () => {
       const risk = await analyzeInventoryRisks(products);
       const forecastResult = await forecastSales(salesData);
       if (isMounted) {
         setRiskAnalysis(risk);
         setSalesForecastAdvice(forecastResult.advice);
         const historical = salesData.map(d => ({ ...d, type: 'actual', forecast: null }));
         const lastActual = historical[historical.length - 1];
         const predicted = forecastResult.points.map(d => ({ date: d.date, amount: null, forecast: d.amount, type: 'forecast' }));
         if (lastActual && predicted.length > 0) {
            const connector = { date: lastActual.date, amount: lastActual.amount, forecast: lastActual.amount, type: 'connector' };
            const newHistorical = [...historical];
            newHistorical.pop();
            newHistorical.push(connector);
            setChartData([...newHistorical, ...predicted]);
         } else {
             setChartData(historical);
         }
       }
    };
    runAI();
    return () => { isMounted = false; };
  }, [products, salesData]);

  const displayChartData = chartData.map(d => ({
      ...d,
      amount: d.amount ? convertPrice(d.amount, currency) : null,
      forecast: d.forecast ? convertPrice(d.forecast, currency) : null
  }));

  // Chart Styling
  const chartAxisStyle = { stroke: '#4A4A4A', fontSize: 12 };
  const tooltipStyle = { backgroundColor: '#1A1A1A', border: '1px solid #333', color: '#E5E5E5' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-surface p-6 border-l-4 border-nvidia shadow-lg">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-black border border-dark-border text-nvidia"><DollarSign className="w-6 h-6" /></div>
                <div>
                    <p className="text-xs font-bold text-dark-muted uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(totalRevenueBase, currency)}</h3>
                </div>
            </div>
        </div>
        <div className="bg-dark-surface p-6 border-l-4 border-white shadow-lg">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-black border border-dark-border text-white"><Package className="w-6 h-6" /></div>
                <div>
                    <p className="text-xs font-bold text-dark-muted uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-2xl font-bold text-white font-mono">{totalOrders}</h3>
                </div>
            </div>
        </div>
        <div className="bg-dark-surface p-6 border-l-4 border-red-500 shadow-lg">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-black border border-dark-border text-red-500"><AlertCircle className="w-6 h-6" /></div>
                <div>
                    <p className="text-xs font-bold text-dark-muted uppercase tracking-wider">Low Stock</p>
                    <h3 className="text-2xl font-bold text-white font-mono">{lowStockCount}</h3>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-surface p-6 border border-dark-border h-80">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide"><Activity className="w-5 h-5 text-nvidia" /> Weekly Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayChartData} margin={{top: 5, right: 20, bottom: 0, left: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="date" {...chartAxisStyle} tickLine={false} axisLine={false} />
              <YAxis {...chartAxisStyle} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#333' }} contentStyle={tooltipStyle} />
              <Bar dataKey="amount" fill="#76B900" radius={[2, 2, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-surface p-6 border border-dark-border h-80">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide"><TrendingUp className="w-5 h-5 text-nvidia" /> Revenue Trend & Forecast</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayChartData} margin={{top: 5, right: 20, bottom: 0, left: 0}}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#76B900" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#76B900" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="date" {...chartAxisStyle} tickLine={false} axisLine={false} />
              <YAxis {...chartAxisStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="amount" stroke="#76B900" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" name="Revenue" />
              <Line type="monotone" dataKey="forecast" stroke="#E5E5E5" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#E5E5E5', strokeWidth: 0}} name="AI Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-black border border-nvidia/50 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nvidia rounded-full filter blur-[100px] opacity-10"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-nvidia/10 border border-nvidia/50 rounded"><Cpu className="w-6 h-6 text-nvidia" /></div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Gemini AI Intelligence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-nvidia uppercase tracking-wider">Inventory Risk Analysis</h4>
                <div className="bg-dark-surface p-4 border-l-2 border-nvidia"><p className="text-sm text-dark-text leading-relaxed font-mono">{riskAnalysis}</p></div>
            </div>
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Strategic Forecast</h4>
                <div className="bg-dark-surface p-4 border-l-2 border-white"><p className="text-sm text-dark-text leading-relaxed font-mono">{salesForecastAdvice}</p></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;