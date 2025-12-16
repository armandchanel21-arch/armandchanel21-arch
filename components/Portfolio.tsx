import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { BacktestResult, TradeEvent } from '../types';
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent, ArrowUp, ArrowDown, Wallet, PieChart, History } from 'lucide-react';

interface PortfolioProps {
  result: BacktestResult | null;
}

// Generate sleek mock data for "Investor Pitch Mode"
const generateMockData = () => {
  const data = [];
  let balance = 10000;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.4) * 200; // Slight upward bias
    balance += change;
    data.push({
      time: `Day ${i + 1}`,
      balance: parseFloat(balance.toFixed(2)),
      change: parseFloat(change.toFixed(2))
    });
  }
  return {
    equityCurve: data,
    metrics: {
      netProfit: balance - 10000,
      winRate: 65.4,
      totalTrades: 142,
      profitFactor: 1.85,
      maxDrawdown: 4.2
    },
    recentTrades: Array.from({ length: 8 }).map((_, i) => ({
      id: `trade-${i}`,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      entryPrice: 42000 + Math.random() * 1000,
      exitPrice: 42500 + Math.random() * 1000,
      profit: (Math.random() - 0.3) * 100,
      time: 'Just now'
    })) as unknown as TradeEvent[]
  };
};

const StatCard = ({ label, value, icon: Icon, colorClass, sub }: any) => (
  <div className="bg-gaming-800 border border-gaming-700 p-4 rounded-xl flex items-center gap-4 shadow-lg hover:border-gaming-600 transition-all">
    <div className={`p-3 rounded-lg bg-gaming-900 border border-gaming-700 ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <div className="text-[10px] text-gaming-500 uppercase font-black tracking-widest">{label}</div>
      <div className="text-xl font-black text-white leading-tight font-mono">{value}</div>
      {sub && <div className="text-[10px] text-gaming-500 mt-0.5 font-bold">{sub}</div>}
    </div>
  </div>
);

const Portfolio: React.FC<PortfolioProps> = ({ result }) => {
  // Use real result or fallback to mock data
  const { equityCurve, metrics, recentTrades, isDemo } = useMemo(() => {
    if (result && result.metrics) {
      return {
        equityCurve: result.equityCurve || [],
        metrics: result.metrics,
        recentTrades: [...(result.trades || [])].reverse().slice(0, 50),
        isDemo: false
      };
    }
    const mock = generateMockData();
    return { ...mock, isDemo: true };
  }, [result]);

  // Safe Metric Accessors
  const netProfit = Number(metrics.netProfit) || 0;
  const winRate = Number(metrics.winRate) || 0;
  const totalTrades = Number(metrics.totalTrades) || 0;
  const maxDrawdown = Number(metrics.maxDrawdown) || 0;

  const currentBalance = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].balance : 0;

  return (
    <div className="flex flex-col h-full bg-gaming-950 animate-fade-in relative overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gaming-800 bg-gaming-900/50 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
             <Wallet className="text-gaming-accent" /> Portfolio Overview
           </h2>
           <p className="text-xs text-gaming-500 font-bold tracking-wide mt-1">
             {isDemo ? 'DEMO ACCOUNT (SIMULATION)' : 'LIVE STRATEGY PERFORMANCE'}
           </p>
        </div>
        <div className="text-right">
             <div className="text-[10px] text-gaming-500 uppercase font-bold">Total Balance</div>
             <div className="text-3xl font-black text-white font-mono tracking-tight">
                ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
            label="Net Profit" 
            value={`$${netProfit.toFixed(2)}`} 
            icon={DollarSign} 
            colorClass={netProfit >= 0 ? 'text-gaming-accent' : 'text-danger'}
            sub={isDemo ? "+12.5% this month" : "Realized P&L"} 
            />
            <StatCard 
            label="Win Rate" 
            value={`${winRate.toFixed(1)}%`} 
            icon={Percent} 
            colorClass="text-blue-400"
            sub="High Probability"
            />
            <StatCard 
            label="Total Trades" 
            value={totalTrades} 
            icon={Activity} 
            colorClass="text-purple-400"
            sub=" executed orders"
            />
            <StatCard 
            label="Drawdown" 
            value={`${maxDrawdown.toFixed(2)}%`} 
            icon={TrendingDown} 
            colorClass="text-orange-400"
            sub="Max Risk Exposure" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-gaming-800 border border-gaming-700 rounded-xl p-5 flex flex-col shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black text-gaming-400 uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp size={14} /> Equity Curve
                      </h3>
                      <div className="flex gap-2">
                          <button className="px-2 py-1 bg-gaming-900 rounded text-[10px] text-white border border-gaming-700">Line</button>
                          <button className="px-2 py-1 bg-gaming-800 rounded text-[10px] text-gaming-500 hover:text-white">Candle</button>
                      </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityCurve}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                            <XAxis dataKey="time" stroke="#525252" tick={{fontSize: 10, fill: '#737373'}} axisLine={false} tickLine={false} minTickGap={30} />
                            <YAxis domain={['auto', 'auto']} stroke="#525252" tick={{fontSize: 10, fill: '#737373'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#050505', borderColor: '#2A2A2A', borderRadius: '8px'}}
                                itemStyle={{color: '#22c55e', fontWeight: 'bold', fontFamily: 'monospace'}}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Balance']}
                                labelStyle={{color: '#737373', fontSize: '10px', marginBottom: '4px'}}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Profit Distribution (Fake/Real) */}
              <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-5 flex flex-col shadow-xl">
                  <h3 className="text-xs font-black text-gaming-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <PieChart size={14} /> PnL Distribution
                  </h3>
                  <div className="flex-1 min-h-0">
                      {/* Simple Bar Chart showing wins vs losses magnitude */}
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={equityCurve.slice(-20)}> {/* Show last 20 points as proxy for daily pnl */}
                             <Bar dataKey="change" radius={[2, 2, 0, 0]}>
                                {equityCurve.slice(-20).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                             </Bar>
                             <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{backgroundColor: '#050505', borderColor: '#2A2A2A', borderRadius: '8px'}}
                                itemStyle={{color: '#fff', fontSize: '12px'}}
                             />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* Trade History Table */}
          <div className="bg-gaming-800 border border-gaming-700 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gaming-700 flex items-center gap-2">
                  <History size={16} className="text-gaming-500" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Trade History</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                      <thead className="bg-gaming-900 text-gaming-500 font-bold uppercase tracking-wider">
                          <tr>
                              <th className="p-3">Type</th>
                              <th className="p-3">Entry</th>
                              <th className="p-3">Exit</th>
                              <th className="p-3 text-right">Profit</th>
                              <th className="p-3 text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gaming-700">
                          {recentTrades.map((trade: any) => (
                              <tr key={trade.id} className="hover:bg-gaming-700/50 transition-colors">
                                  <td className="p-3">
                                      <span className={`font-black flex items-center gap-1 ${trade.type === 'BUY' ? 'text-gaming-accent' : 'text-danger'}`}>
                                          {trade.type === 'BUY' ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                                          {trade.type}
                                      </span>
                                  </td>
                                  <td className="p-3 font-mono text-gray-300">{Number(trade.entryPrice).toFixed(2)}</td>
                                  <td className="p-3 font-mono text-gray-300">{Number(trade.exitPrice).toFixed(2)}</td>
                                  <td className={`p-3 text-right font-mono font-bold ${trade.profit >= 0 ? 'text-gaming-accent' : 'text-danger'}`}>
                                      {trade.profit >= 0 ? '+' : ''}{Number(trade.profit).toFixed(2)}
                                  </td>
                                  <td className="p-3 text-right">
                                      <span className="px-2 py-1 rounded-full bg-gaming-900 border border-gaming-700 text-[9px] text-gaming-500 uppercase font-bold">Closed</span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Portfolio;