import React from 'react';
import { Activity, TrendingUp, TrendingDown, DollarSign, Clock, Zap, Server, BarChart3, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { StrategyConfig } from '../types';

const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-5 hover:border-gaming-600 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gaming-900 rounded-lg border border-gaming-700 group-hover:border-gaming-500 transition-colors text-gaming-500 group-hover:text-white">
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-gaming-accent' : 'bg-red-500/10 text-gaming-danger'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-black text-white mb-1 font-mono tracking-tight">{value}</div>
    <div className="text-xs text-gaming-500 font-medium uppercase tracking-wide">{title}</div>
    {sub && <div className="text-[10px] text-gaming-600 mt-2 font-mono">{sub}</div>}
  </div>
);

interface DashboardProps {
    savedStrategies: StrategyConfig[];
    onEditStrategy: (strategy: StrategyConfig) => void;
    onDeleteStrategy: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ savedStrategies, onEditStrategy, onDeleteStrategy }) => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 custom-scrollbar animate-fade-in">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-2">Command Center</h1>
        <p className="text-gaming-500 text-sm">System Status: <span className="text-gaming-accent font-bold">OPERATIONAL</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
         <StatCard title="Total Equity" value="$14,250.80" sub="Available Margin: $8,400.00" icon={DollarSign} trend={12.5} />
         <StatCard title="Saved Bots" value={savedStrategies.length.toString()} sub={`${savedStrategies.length} strategies ready`} icon={Server} />
         <StatCard title="Win Rate" value="68.4%" sub="Last 100 Trades" icon={Activity} trend={2.1} />
         <StatCard title="Latency" value="24ms" sub="Binance API Connection" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart Area Placeholder */}
         <div className="lg:col-span-2 bg-gaming-800 border border-gaming-700 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 size={16} className="text-gaming-accent" /> 
                    Portfolio Performance
                </h3>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gaming-950 rounded text-[10px] text-white border border-gaming-700">1D</button>
                    <button className="px-3 py-1 bg-gaming-700 rounded text-[10px] text-gaming-400 hover:text-white">1W</button>
                    <button className="px-3 py-1 bg-gaming-700 rounded text-[10px] text-gaming-400 hover:text-white">1M</button>
                </div>
            </div>
            <div className="flex-1 bg-gaming-950/50 rounded-lg border border-gaming-800 flex items-center justify-center relative overflow-hidden min-h-[300px]">
                 <svg className="w-full h-full absolute inset-0 text-gaming-accent/20" preserveAspectRatio="none">
                    <path d="M0,200 Q150,250 300,150 T600,100 T900,220 T1200,50 V300 H0 Z" fill="currentColor" />
                    <path d="M0,200 Q150,250 300,150 T600,100 T900,220 T1200,50" fill="none" stroke="currentColor" strokeWidth="2" className="text-gaming-accent" />
                 </svg>
                 <div className="z-10 text-center">
                    <div className="text-3xl font-black text-white font-mono">$1,240.50</div>
                    <div className="text-xs text-gaming-500 uppercase tracking-widest mt-1">Net Profit (7d)</div>
                 </div>
            </div>
         </div>

         {/* Bot List */}
         <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-5 flex flex-col h-[400px]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                <Server size={16} className="text-blue-400" /> 
                My Bots ({savedStrategies.length})
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {savedStrategies.length === 0 ? (
                    <div className="text-center text-gaming-500 text-xs py-10">
                        No bots created yet. Go to Strategy Studio.
                    </div>
                ) : (
                    savedStrategies.map((bot) => (
                        <div key={bot.id} className="flex items-center justify-between p-3 bg-gaming-900/50 border border-gaming-800 rounded-lg hover:bg-gaming-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full bg-gaming-500 group-hover:bg-gaming-accent transition-colors`}></div>
                                <div>
                                    <div className="text-sm font-bold text-white">{bot.name}</div>
                                    <div className="text-[10px] text-gaming-500 font-mono">{bot.symbol} | {bot.timeframe}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onEditStrategy(bot)} className="p-1.5 hover:bg-gaming-700 rounded text-gaming-500 hover:text-white" title="Edit / Retest">
                                    <Edit size={14} />
                                </button>
                                <button onClick={() => bot.id && onDeleteStrategy(bot.id)} className="p-1.5 hover:bg-gaming-700 rounded text-gaming-500 hover:text-danger" title="Delete">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;