import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { BacktestResult } from '../types';
import { TrendingUp, Activity, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';

interface BacktestChartProps {
  result: BacktestResult;
  onClose: () => void;
}

// Gaming Style Stat Card (Adapted for Trading)
const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
  <div className="bg-gaming-800 border border-gaming-700 p-3 rounded flex items-center gap-3 shadow-sm min-w-[140px]">
    <div className={`p-2 rounded bg-gaming-950 border border-gaming-700 ${colorClass}`}>
      <Icon size={16} />
    </div>
    <div>
      <div className="text-[10px] text-gaming-500 uppercase font-black tracking-wide">{label}</div>
      <div className="text-lg font-black text-white leading-tight font-mono">{value}</div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gaming-950 border border-gaming-700 p-3 rounded shadow-xl text-xs z-50">
        <div className="font-bold text-gaming-400 mb-1 font-mono">{label}</div>
        <div className="flex justify-between gap-4 mb-1">
            <span className="text-gaming-500">Close</span>
            <span className="text-white font-mono font-bold">{data.close}</span>
        </div>
        {data.tradeInfo && (
          <div className={`mt-2 border-t border-gaming-800 pt-2 ${data.tradeInfo.type === 'BUY' ? 'text-gaming-accent' : 'text-danger'}`}>
            <div className="font-black flex items-center gap-1">
                {data.tradeInfo.type === 'BUY' ? <ArrowUp size={12} strokeWidth={3}/> : <ArrowDown size={12} strokeWidth={3}/>}
                {data.tradeInfo.type} SIGNAL
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gaming-500">
                <span>Entry: {data.tradeInfo.entryPrice}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const BacktestChart: React.FC<BacktestChartProps> = ({ result, onClose }) => {
  // Defensive Programming: Ensure result and metrics exist
  if (!result || !result.metrics) {
      return (
        <div className="flex items-center justify-center h-full text-gaming-500 text-sm">
            No backtest data available.
        </div>
      );
  }

  const { data, trades, metrics, equityCurve } = result;

  // Safe Metric Accessors
  const netProfit = Number(metrics.netProfit) || 0;
  const winRate = Number(metrics.winRate) || 0;
  const totalTrades = Number(metrics.totalTrades) || 0;
  const profitFactor = Number(metrics.profitFactor) || 0;

  // Prepare chart data with trade markers
  const chartData = (data || []).map((candle, index) => {
    const tradeEntry = trades ? trades.find(t => t.entryIndex === index) : undefined;
    const tradeExit = trades ? trades.find(t => t.exitIndex === index) : undefined;
    
    return {
      ...candle,
      index,
      tradeInfo: tradeEntry,
      exitInfo: tradeExit // Map exit info specifically
    };
  });

  return (
    <div className="flex flex-col h-full bg-gaming-950 animate-fade-in relative">
      
      {/* Stats Header */}
      <div className="h-24 bg-gaming-900 border-b border-gaming-800 px-4 flex items-center gap-4 overflow-x-auto no-scrollbar shrink-0">
         <StatCard 
           label="Net Profit" 
           value={`$${netProfit.toFixed(2)}`} 
           icon={DollarSign} 
           colorClass={netProfit >= 0 ? 'text-gaming-accent' : 'text-danger'} 
         />
         <StatCard 
           label="Win Rate" 
           value={`${winRate.toFixed(1)}%`} 
           icon={Percent} 
           colorClass="text-blue-400" 
         />
         <StatCard 
           label="Total Trades" 
           value={totalTrades} 
           icon={Activity} 
           colorClass="text-purple-400" 
         />
         <StatCard 
           label="Profit Factor" 
           value={profitFactor.toFixed(2)} 
           icon={TrendingUp} 
           colorClass="text-orange-400" 
         />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* Main Price Chart */}
        <div className="flex-[2] min-h-0 bg-gaming-900 border border-gaming-800 rounded p-4 relative flex flex-col">
            <h3 className="absolute top-3 left-3 text-[10px] font-black text-gaming-500 z-10 flex items-center gap-2 uppercase tracking-widest bg-gaming-900/80 px-2 py-1 rounded">
                Trade Execution Visualizer
            </h3>
            <div className="flex-1 w-full min-h-0 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                        <XAxis dataKey="time" stroke="#525252" tick={{fontSize: 9, fill: '#737373'}} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#525252" tick={{fontSize: 9, fill: '#737373'}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
                        
                        {/* Iterate trades to draw markers and lines */}
                        {trades && trades.map((trade, i) => {
                            const entryTime = data[trade.entryIndex]?.time;
                            const exitTime = data[trade.exitIndex]?.time;
                            const isWin = trade.profit > 0;
                            
                            return (
                                <React.Fragment key={`trade-visual-${i}`}>
                                    {entryTime && exitTime && (
                                        <ReferenceLine 
                                            segment={[
                                                { x: entryTime, y: trade.entryPrice }, 
                                                { x: exitTime, y: trade.exitPrice }
                                            ]} 
                                            stroke={isWin ? '#22c55e' : '#ef4444'} 
                                            strokeDasharray="2 2" 
                                            opacity={0.6}
                                            strokeWidth={1}
                                        />
                                    )}
                                    <ReferenceDot 
                                        x={entryTime} 
                                        y={trade.entryPrice} 
                                        r={3} 
                                        fill={trade.type === 'BUY' ? '#22c55e' : '#ef4444'} 
                                        stroke="#050505"
                                        strokeWidth={1}
                                    />
                                    {exitTime && (
                                    <ReferenceDot 
                                        x={exitTime} 
                                        y={trade.exitPrice} 
                                        r={2} 
                                        fill="#ffffff" 
                                    />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Equity Curve */}
        {equityCurve && equityCurve.length > 0 && (
        <div className="flex-1 min-h-[150px] bg-gaming-900 border border-gaming-800 rounded p-4 relative flex flex-col">
             <h3 className="absolute top-3 left-3 text-[10px] font-black text-gaming-500 z-10 uppercase tracking-widest bg-gaming-900/80 px-2 py-1 rounded">Equity Curve</h3>
             <div className="flex-1 w-full min-h-0 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurve} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} stroke="#525252" tick={{fontSize: 9, fill: '#737373'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#050505', borderColor: '#2A2A2A'}}
                            itemStyle={{color: '#22c55e', fontWeight: 'bold'}}
                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Balance']}
                            labelStyle={{color: '#737373'}}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default BacktestChart;