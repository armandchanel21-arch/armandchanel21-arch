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
import { BacktestResult, Candle, TradeEvent } from '../types';
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';

interface BacktestChartProps {
  result: BacktestResult;
  onClose: () => void;
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-trade-800 border border-trade-700 p-3 rounded-lg flex items-center gap-3">
    <div className={`p-2 rounded-full bg-opacity-10 ${color}`}>
      <Icon size={18} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <div className="text-xs text-trade-500 uppercase font-bold">{label}</div>
      <div className="text-lg font-mono text-gray-200">{value}</div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-trade-800 border border-trade-700 p-3 rounded shadow-xl text-xs z-50">
        <div className="font-bold text-gray-300 mb-1">{label}</div>
        <div className="flex justify-between gap-4 mb-1">
            <span className="text-gray-500">Close:</span>
            <span className="text-trade-accent font-mono">{data.close}</span>
        </div>
        {data.tradeInfo && (
          <div className={`mt-2 border-t border-trade-700 pt-2 ${data.tradeInfo.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
            <div className="font-bold flex items-center gap-1">
                {data.tradeInfo.type === 'BUY' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                {data.tradeInfo.type} ENTRY
            </div>
            <div className="flex justify-between gap-4 mt-1 text-gray-400">
                <span>Price:</span>
                <span className="font-mono text-gray-300">{data.tradeInfo.entryPrice}</span>
            </div>
          </div>
        )}
         {data.exitInfo && (
          <div className={`mt-2 border-t border-trade-700 pt-2 ${data.exitInfo.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <div className="font-bold">EXIT {data.exitInfo.profit > 0 ? '(WIN)' : '(LOSS)'}</div>
            <div className="flex justify-between gap-4 mt-1 text-gray-400">
                <span>Price:</span>
                <span className="font-mono text-gray-300">{data.exitInfo.exitPrice}</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-400">
                <span>Profit:</span>
                <span className="font-mono">{data.exitInfo.profit.toFixed(1)} pips</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const BacktestChart: React.FC<BacktestChartProps> = ({ result, onClose }) => {
  const { data, trades, metrics, equityCurve } = result;

  // Prepare chart data with trade markers
  const chartData = data.map((candle, index) => {
    const tradeEntry = trades.find(t => t.entryIndex === index);
    const tradeExit = trades.find(t => t.exitIndex === index);
    
    return {
      ...candle,
      index,
      tradeInfo: tradeEntry,
      exitInfo: tradeExit // Map exit info specifically
    };
  });

  return (
    <div className="flex flex-col h-full bg-trade-950 animate-fade-in relative">
      {/* Header Stats */}
      <div className="h-20 border-b border-trade-700 bg-trade-900 px-6 flex items-center justify-between shrink-0">
         <div className="flex gap-4">
             <StatCard 
               label="Net Profit" 
               value={`$${metrics.netProfit.toFixed(2)}`} 
               icon={DollarSign} 
               color={metrics.netProfit >= 0 ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'} 
             />
             <StatCard 
               label="Win Rate" 
               value={`${metrics.winRate}%`} 
               icon={Percent} 
               color="bg-blue-500 text-blue-500" 
             />
             <StatCard 
               label="Total Trades" 
               value={metrics.totalTrades} 
               icon={Activity} 
               color="bg-purple-500 text-purple-500" 
             />
             <StatCard 
               label="Profit Factor" 
               value={metrics.profitFactor.toFixed(2)} 
               icon={TrendingUp} 
               color="bg-orange-500 text-orange-500" 
             />
         </div>
         <button onClick={onClose} className="px-4 py-2 bg-trade-800 hover:bg-trade-700 border border-trade-600 rounded text-sm text-gray-300 transition-colors">
            Close Simulation
         </button>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* Main Price Chart */}
        <div className="flex-[2] min-h-0 bg-trade-900 border border-trade-700 rounded-lg p-4 relative flex flex-col">
            <h3 className="absolute top-4 left-4 text-xs font-bold text-trade-500 z-10 flex items-center gap-2">
                PRICE ACTION SIMULATION
                <span className="flex items-center gap-1 text-[10px] bg-trade-800 px-2 py-0.5 rounded border border-trade-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Buy
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-trade-800 px-2 py-0.5 rounded border border-trade-700">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Sell
                </span>
            </h3>
            <div className="flex-1 w-full min-h-0 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                        <XAxis dataKey="time" stroke="#434651" tick={{fontSize: 10}} />
                        <YAxis domain={['auto', 'auto']} stroke="#434651" tick={{fontSize: 10}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="close" stroke="#2962ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#2962ff' }} />
                        
                        {/* Iterate trades to draw markers and lines */}
                        {trades.map((trade, i) => {
                            const entryTime = data[trade.entryIndex]?.time;
                            const exitTime = data[trade.exitIndex]?.time;
                            const isWin = trade.profit > 0;
                            
                            return (
                                <React.Fragment key={`trade-visual-${i}`}>
                                    {/* Connection Line */}
                                    {entryTime && exitTime && (
                                        <ReferenceLine 
                                            segment={[
                                                { x: entryTime, y: trade.entryPrice }, 
                                                { x: exitTime, y: trade.exitPrice }
                                            ]} 
                                            stroke={isWin ? '#00dc82' : '#f23645'} 
                                            strokeDasharray="3 3" 
                                            opacity={0.5}
                                            strokeWidth={1}
                                        />
                                    )}

                                    {/* Entry Marker */}
                                    <ReferenceDot 
                                        x={entryTime} 
                                        y={trade.entryPrice} 
                                        r={5} 
                                        fill={trade.type === 'BUY' ? '#00dc82' : '#f23645'} 
                                        stroke="#131722"
                                        strokeWidth={2}
                                        label={{ 
                                            position: 'top', 
                                            value: trade.type === 'BUY' ? 'B' : 'S', 
                                            fill: trade.type === 'BUY' ? '#00dc82' : '#f23645',
                                            fontSize: 10,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    
                                    {/* Exit Marker */}
                                    {exitTime && (
                                    <ReferenceDot 
                                        x={exitTime} 
                                        y={trade.exitPrice} 
                                        r={4} 
                                        fill={isWin ? '#00dc82' : '#f23645'} 
                                        stroke="none"
                                        shape={(props: any) => (
                                            <g transform={`translate(${props.cx},${props.cy})`}>
                                                <rect x="-3" y="-3" width="6" height="6" transform="rotate(45)" fill={props.fill} stroke="#131722" strokeWidth={1} />
                                            </g>
                                        )}
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
        <div className="flex-1 min-h-[150px] bg-trade-900 border border-trade-700 rounded-lg p-4 relative flex flex-col">
             <h3 className="absolute top-4 left-4 text-xs font-bold text-trade-500 z-10">EQUITY CURVE</h3>
             <div className="flex-1 w-full min-h-0 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurve} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00dc82" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00dc82" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                        <XAxis dataKey="time" stroke="#434651" tick={{fontSize: 10}} />
                        <YAxis domain={['auto', 'auto']} stroke="#434651" tick={{fontSize: 10}} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1e222d', borderColor: '#2a2e39'}}
                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Balance']}
                            labelStyle={{color: '#8b9bb4'}}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#00dc82" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestChart;