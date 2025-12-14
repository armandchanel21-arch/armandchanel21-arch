import React, { useState } from 'react';
import StrategyForm from './components/StrategyForm';
import CodeViewer from './components/CodeViewer';
import TradingViewWidget from './components/TradingViewWidget';
import BacktestChart from './components/BacktestChart';
import ErrorBoundary from './components/ErrorBoundary';
import { generateTradingBot, runBacktestSimulation } from './services/geminiService';
import { StrategyConfig, GeneratedBot, Platform, BacktestResult } from './types';
import { CandlestickChart, Activity, PanelBottom, Sidebar, BarChart2, ChevronRight, ShieldAlert, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [generatedBot, setGeneratedBot] = useState<GeneratedBot | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<StrategyConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Workspace State
  const [activeSymbol, setActiveSymbol] = useState("EURUSD");
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'LIVE' | 'BACKTEST'>('LIVE');

  const handleGenerate = async (config: StrategyConfig) => {
    setLoading(true);
    setError(null);
    setGeneratedBot(null);
    setCurrentConfig(config);
    setIsBottomPanelOpen(true); // Open bottom panel to show results

    try {
      const result = await generateTradingBot(config);
      setGeneratedBot(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBacktest = async (config: StrategyConfig) => {
    setLoading(true);
    setError(null);
    setBacktestResult(null);
    setCurrentConfig(config);
    
    // Switch view to allow user to see loading state in the main area
    setViewMode('BACKTEST');

    try {
      const result = await runBacktestSimulation(config);
      setBacktestResult(result);
    } catch (err: any) {
      setError(err.message || "Backtest failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (newConfig: Partial<StrategyConfig>) => {
    if (newConfig.symbol && newConfig.symbol !== activeSymbol) {
      setActiveSymbol(newConfig.symbol);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-trade-900 text-[#d1d4dc] overflow-hidden">
      
      {/* Header / Top Bar */}
      <header className="h-12 bg-trade-900 border-b border-trade-700 flex items-center justify-between px-4 shrink-0 select-none z-40 relative">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-white">
             <div className="bg-trade-accent p-1 rounded">
               <CandlestickChart className="h-4 w-4 text-white" />
             </div>
             <span className="font-semibold tracking-wide text-sm">MetaBot Forge</span>
           </div>
           
           <div className="h-4 w-px bg-trade-700 mx-2"></div>
           
           <div className="flex items-center gap-2 text-xs text-trade-500">
             <span>{activeSymbol}</span>
             <span className="w-1 h-1 rounded-full bg-trade-500"></span>
             <span>{viewMode === 'LIVE' ? 'Real-Time' : 'Historical Simulation'}</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher - Slide Toggle */}
          <div 
            className="relative flex items-center bg-trade-950 rounded-full p-1 border border-trade-700 w-56 h-9 cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] mr-2 select-none group"
            onClick={() => setViewMode(viewMode === 'LIVE' ? 'BACKTEST' : 'LIVE')}
          >
             {/* Slider Background */}
             <div 
                className={`
                    absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full 
                    transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    shadow-[0_2px_5px_rgba(0,0,0,0.3)] border border-white/5
                    ${viewMode === 'LIVE' ? 'left-1 bg-trade-700' : 'left-[50%] bg-trade-700'}
                `}
             >
                {/* Active Glow Accent */}
                <div className={`absolute inset-0 rounded-full opacity-20 transition-colors duration-500 ${viewMode === 'LIVE' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
             </div>

             {/* Live Option */}
             <div className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${viewMode === 'LIVE' ? 'text-white scale-105' : 'text-trade-500 hover:text-trade-300'}`}>
                <Activity size={14} className={`transition-all duration-500 ${viewMode === 'LIVE' ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}`} />
                <span>Live Feed</span>
             </div>

             {/* Backtest Option */}
             <div className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${viewMode === 'BACKTEST' ? 'text-white scale-105' : 'text-trade-500 hover:text-trade-300'}`}>
                <BarChart2 size={14} className={`transition-all duration-500 ${viewMode === 'BACKTEST' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' : ''}`} />
                <span>Backtest</span>
             </div>
          </div>

          {viewMode === 'LIVE' ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-trade-800 border border-trade-700 text-[10px] text-trade-success font-medium">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                ON
              </div>
          ) : (
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-purple-900/30 border border-purple-500/30 text-[10px] text-purple-400 font-medium">
                <Activity size={12} />
                SIM
              </div>
          )}
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded hover:bg-trade-700 transition-colors ${isSidebarOpen ? 'text-trade-accent' : 'text-trade-500'}`}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Sidebar size={18} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Chart Area */}
        <main className="flex-1 bg-trade-950 relative flex flex-col min-w-0">
          <div className="flex-1 relative z-0 overflow-hidden">
            <ErrorBoundary>
              {viewMode === 'LIVE' ? (
                <TradingViewWidget symbol={activeSymbol} />
              ) : (
                loading ? (
                    <div className="flex items-center justify-center h-full flex-col gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trade-accent"></div>
                        <div className="text-trade-500 text-sm animate-pulse">Running Market Simulation...</div>
                    </div>
                ) : backtestResult ? (
                    <BacktestChart 
                        result={backtestResult} 
                        onClose={() => setViewMode('LIVE')} 
                    />
                ) : (
                    <div className="flex items-center justify-center h-full flex-col gap-3 text-trade-500">
                        {error ? (
                            <>
                                <div className="text-red-500 text-sm flex items-center gap-2">
                                   <Activity size={18} />
                                   Simulation Failed
                                </div>
                                <p className="text-xs text-red-400/70 max-w-xs text-center">{error}</p>
                            </>
                        ) : (
                            <>
                                <BarChart2 size={48} className="opacity-20" />
                                <p className="text-sm font-medium">No Simulation Data</p>
                                <p className="text-xs text-trade-600 max-w-xs text-center">Configure a strategy in the sidebar and click "Backtest" to generate results.</p>
                            </>
                        )}
                        <button 
                            onClick={() => setViewMode('LIVE')} 
                            className="mt-2 px-4 py-2 bg-trade-800 hover:bg-trade-700 rounded text-xs text-white border border-trade-700 transition-colors"
                        >
                            Return to Live Chart
                        </button>
                    </div>
                )
              )}
            </ErrorBoundary>
          </div>
          
          {/* Bottom Panel (Code Editor) */}
          <div 
            className={`bg-trade-900 border-t border-trade-700 transition-all duration-300 ease-in-out flex flex-col absolute bottom-0 w-full z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] ${
              isBottomPanelOpen ? 'h-[50%]' : 'h-10'
            }`}
          >
            {/* Panel Header */}
            <div 
              className="h-10 flex items-center justify-between px-4 bg-trade-800 border-b border-trade-700 cursor-pointer hover:bg-trade-700/50 transition-colors"
              onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <PanelBottom size={14} />
                  <span>Pine Editor / MQL Output</span>
                </div>
                {generatedBot && (
                  <span className="text-[10px] bg-trade-700 text-trade-success px-1.5 py-0.5 rounded border border-trade-600">
                    GENERATED
                  </span>
                )}
                {error && (
                  <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded border border-red-900">
                    ERROR
                  </span>
                )}
              </div>
              <div className="text-xs text-trade-500">
                {isBottomPanelOpen ? 'Minimize' : 'Click to expand'}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden relative bg-[#0d1117]">
              {isBottomPanelOpen && (
                 <ErrorBoundary>
                    {generatedBot ? (
                      <CodeViewer 
                        bot={generatedBot} 
                        botName={currentConfig?.name || "Bot"}
                        ext={currentConfig?.platform === Platform.MT4 ? 'mq4' : 'mq5'} 
                      />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-4 text-center">
                            <ShieldAlert size={32} className="opacity-50" />
                            <p className="text-sm font-bold">Generation Failed</p>
                            <p className="text-xs text-red-400/70 max-w-md bg-red-950/30 p-2 rounded border border-red-900/50 font-mono">
                                {error}
                            </p>
                        </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-trade-500 gap-2">
                        {loading && !backtestResult ? (
                          <>
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trade-accent"></div>
                             <p className="text-sm">Forging Strategy...</p>
                          </>
                        ) : (
                          <>
                            <PanelBottom size={32} className="opacity-20" />
                            <p className="text-sm">Strategy output will appear here.</p>
                          </>
                        )}
                      </div>
                    )}
                 </ErrorBoundary>
              )}
            </div>
          </div>
        </main>

        {/* Slide to Open Handle (Visible when sidebar closed) */}
        <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${!isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="bg-trade-800 border border-trade-700 border-r-0 rounded-l-xl shadow-[-4px_0_12px_rgba(0,0,0,0.4)] text-trade-500 hover:text-white hover:bg-trade-700 h-24 w-8 flex items-center justify-center cursor-pointer group"
                title="Open Live Test Logic / Bot Builder"
            >
                <div className="flex flex-col items-center gap-2">
                     <Cpu size={16} className="text-trade-accent animate-pulse" />
                     <div className="w-1 h-8 rounded-full bg-trade-600 group-hover:bg-trade-400 transition-colors"></div>
                </div>
            </button>
        </div>

        {/* Right Sidebar (Strategy Config) */}
        <aside 
          className={`bg-trade-800 border-l border-trade-700 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] z-30 shadow-2xl relative ${
            isSidebarOpen ? 'w-[360px] translate-x-0' : 'w-0 translate-x-full absolute right-0 h-full'
          }`}
        >
          {/* Slide Away Button (Handle) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`
                absolute -left-6 top-1/2 transform -translate-y-1/2 
                bg-trade-800 border border-trade-700 border-r-0 
                text-trade-500 hover:text-white hover:bg-trade-700
                rounded-l-xl shadow-[-4px_0_12px_rgba(0,0,0,0.4)] 
                z-50 flex items-center justify-center 
                h-20 w-8 
                cursor-pointer
                transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
                group
                ${isSidebarOpen ? 'opacity-100 translate-x-0 delay-75' : 'opacity-0 translate-x-8 pointer-events-none'}
            `}
            title="Slide Away / View Chart"
          >
             <div className="w-1 h-8 rounded-full bg-trade-600 group-hover:bg-trade-400 transition-colors absolute left-2"></div>
             <ChevronRight size={20} className="relative left-1 group-hover:translate-x-0.5 transition-transform text-trade-400 group-hover:text-white" />
          </button>

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="w-[360px]"> {/* Fixed width container to prevent reflow during transition */}
              <StrategyForm 
                onSubmit={handleGenerate} 
                onBacktest={handleBacktest}
                isGenerating={loading} 
                onConfigChange={handleConfigChange}
              />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default App;