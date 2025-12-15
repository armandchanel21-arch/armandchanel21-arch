import React from 'react';
import { Activity, TrendingUp, TrendingDown, DollarSign, Clock, Zap, Server, BarChart3, AlertTriangle } from 'lucide-react';

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

const BotStatusRow = ({ name, pair, status, profit }: any) => (
  <div className="flex items-center justify-between p-4 bg-gaming-900/50 border border-gaming-800 rounded-lg hover:bg-gaming-800 transition-colors">
    <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-gaming-accent shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-gaming-500'}`}></div>
        <div>
            <div className="text-sm font-bold text-white">{name}</div>
            <div className="text-[10px] text-gaming-500 font-mono">{pair}</div>
        </div>
    </div>
    <div className="text-right">
        <div className={`text-sm font-bold font-mono ${profit >= 0 ? 'text-gaming-accent' : 'text-danger'}`}>
            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
        </div>
        <div className="text-[10px] text-gaming-600 uppercase">24h PnL</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar animate-fade-in">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-2">Command Center</h1>
        <p className="text-gaming-500 text-sm">System Status: <span className="text-gaming-accent font-bold">OPERATIONAL</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <StatCard title="Total Equity" value="$14,250.80" sub="Available Margin: $8,400.00" icon={DollarSign} trend={12.5} />
         <StatCard title="Active Bots" value="3" sub="2 Idle / 1 Error" icon={Server} />
         <StatCard title="Win Rate" value="68.4%" sub="Last 100 Trades" icon={Activity} trend={2.1} />
         <StatCard title="Latency" value="24ms" sub="Binance API Connection" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart Area Placeholder (Mock) */}
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
                 {/* Decorative Mock Chart Line */}
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
         <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-5 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                <Server size={16} className="text-blue-400" /> 
                Active Agents
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                <BotStatusRow name="Alpha_Scalper_v2" pair="BTCUSDT" status="active" profit={124.50} />
                <BotStatusRow name="ETH_Grid_Master" pair="ETHUSDT" status="active" profit={45.20} />
                <BotStatusRow name="Solana_Breakout" pair="SOLUSDT" status="idle" profit={-12.80} />
                
                <div className="p-3 border border-dashed border-gaming-700 rounded-lg bg-gaming-900/30 text-center mt-4">
                    <AlertTriangle size={24} className="mx-auto text-yellow-500 mb-2" />
                    <div className="text-xs font-bold text-gaming-400">System Notification</div>
                    <div className="text-[10px] text-gaming-600 mt-1">Maintenance scheduled for 03:00 UTC. Trading will be paused for 15 minutes.</div>
                </div>
            </div>
            
            <button className="w-full mt-4 py-3 bg-gaming-700 hover:bg-gaming-600 text-white text-xs font-bold rounded uppercase tracking-wide transition-colors">
                Manage All Bots
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;