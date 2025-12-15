import React, { useState } from 'react';
import StrategyBuilder from './components/StrategyBuilder';
import CodeViewer from './components/CodeViewer';
import TradingViewWidget from './components/TradingViewWidget';
import Portfolio from './components/Portfolio';
import ErrorBoundary from './components/ErrorBoundary';
import ChatBot from './components/ChatBot';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import MarketTicker from './components/MarketTicker';
import WalletView from './components/WalletView';
import { generateTradingBot, runBacktestSimulation } from './services/geminiService';
import { StrategyConfig, GeneratedBot, Platform, BacktestResult } from './types';
import { Activity, LayoutDashboard, LineChart, Bot, Settings, Layers, LogOut, Terminal, BookOpen, Cpu, Wallet, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'charts' | 'trades' | 'wallet' | 'ai_agent' | 'settings'>('dashboard');
  
  // Terminal/Bot State
  const [generatedBot, setGeneratedBot] = useState<GeneratedBot | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<StrategyConfig | null>(null);
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");
  const [activeTab, setActiveTab] = useState<'chart' | 'code'>('chart');

  const handleGenerate = async (config: StrategyConfig) => {
    setLoading(true);
    setGeneratedBot(null);
    setCurrentConfig(config);
    setActiveTab('code');

    try {
      const result = await generateTradingBot(config);
      setGeneratedBot(result);
    } catch (err: any) {
      alert(err.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBacktest = async (config: StrategyConfig) => {
    setLoading(true);
    setBacktestResult(null);
    setCurrentConfig(config);
    setActiveNav('trades'); // Auto-switch to Portfolio view

    try {
      const result = await runBacktestSimulation(config);
      setBacktestResult(result);
    } catch (err: any) {
      alert(err.message || "Backtest failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (newConfig: Partial<StrategyConfig>) => {
    if (newConfig.symbol && newConfig.symbol !== activeSymbol) {
      setActiveSymbol(newConfig.symbol);
    }
  };

  // Login Handler
  if (!isLoggedIn) {
      return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // Nav Item
  const NavItem = ({ id, icon: Icon, label }: any) => (
    <div 
        onClick={() => setActiveNav(id)}
        className={`flex flex-col items-center justify-center py-4 cursor-pointer transition-all border-l-2 group ${activeNav === id ? 'border-gaming-accent text-white bg-gaming-800/50' : 'border-transparent text-gaming-500 hover:text-gaming-400 hover:bg-gaming-900'}`}
    >
        <Icon size={20} className={`mb-1 transition-colors ${activeNav === id ? "text-gaming-accent" : "group-hover:text-white"}`} />
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-gaming-950 text-gaming-200 overflow-hidden font-sans">
      
      {/* 1. Main Navigation Rail */}
      <nav className="w-20 bg-gaming-950 border-r border-gaming-800 flex flex-col shrink-0 z-50">
         <div className="h-16 flex items-center justify-center border-b border-gaming-800 bg-gaming-900">
             <div className="bg-gaming-accent p-2 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                 <Bot className="h-6 w-6 text-gaming-950" />
             </div>
         </div>
         <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mt-2">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dash" />
            <NavItem id="charts" icon={Terminal} label="Charts" />
            <NavItem id="trades" icon={Briefcase} label="Portfolio" />
            <NavItem id="wallet" icon={Wallet} label="Wallet" />
            <NavItem id="ai_agent" icon={BookOpen} label="AI Agent" />
            <NavItem id="settings" icon={Settings} label="Config" />
         </div>
         <div className="py-4 flex flex-col items-center gap-4">
            <button onClick={() => setIsLoggedIn(false)} className="text-gaming-500 hover:text-danger transition-colors">
                <LogOut size={20} />
            </button>
         </div>
      </nav>

      {/* 2. Content Area (Switch based on activeNav) */}
      <div className="flex-1 flex flex-col min-w-0 bg-gaming-950 relative">
          
          <div className="flex-1 w-full relative overflow-hidden flex flex-col">
              {/* DASHBOARD VIEW */}
              {activeNav === 'dashboard' && (
                  <div className="w-full h-full">
                      <Dashboard />
                  </div>
              )}

              {/* CHARTS / STRATEGY BUILDER VIEW */}
              {activeNav === 'charts' && (
                  <div className="w-full h-full flex">
                     {/* Left Panel: Charts & Code */}
                     <div className="flex-1 flex flex-col min-w-0">
                        <header className="h-14 border-b border-gaming-800 bg-gaming-900 flex items-center justify-between px-4 shrink-0">
                             <div className="flex items-center gap-4">
                                 <div className="flex flex-col">
                                     <h1 className="text-lg font-black text-white leading-none tracking-tight flex items-center gap-2">
                                        {activeSymbol}
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gaming-800 text-gaming-400 font-mono border border-gaming-700">CRYPTO</span>
                                     </h1>
                                     <span className="text-[10px] text-gaming-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                                         <span className="w-1.5 h-1.5 rounded-full bg-gaming-accent animate-pulse"></span>
                                         Live Terminal
                                     </span>
                                 </div>
                             </div>
                             {/* Tab Switcher */}
                             <div className="flex bg-gaming-950 p-1 rounded border border-gaming-800">
                                 <button onClick={() => setActiveTab('chart')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${activeTab === 'chart' ? 'bg-gaming-800 text-white shadow-sm' : 'text-gaming-500 hover:text-white'}`}>
                                    Chart
                                 </button>
                                 <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 ${activeTab === 'code' ? 'bg-gaming-800 text-white shadow-sm' : 'text-gaming-500 hover:text-white'}`}>
                                    Code
                                    {generatedBot && <span className="w-1.5 h-1.5 rounded-full bg-gaming-accent"></span>}
                                 </button>
                             </div>
                        </header>

                        <div className="flex-1 relative overflow-hidden">
                             <ErrorBoundary>
                                {activeTab === 'chart' && (
                                    <div className="w-full h-full bg-gaming-950">
                                        <TradingViewWidget symbol={activeSymbol} />
                                    </div>
                                )}
                                {activeTab === 'code' && (
                                    <div className="w-full h-full bg-[#0d1117] overflow-hidden">
                                        {generatedBot ? (
                                             <CodeViewer 
                                                bot={generatedBot} 
                                                botName={currentConfig?.name || "Bot"} 
                                                ext={currentConfig?.platform === Platform.MT4 ? 'mq4' : 'mq5'} 
                                             />
                                        ) : (
                                             <div className="flex flex-col items-center justify-center h-full text-gaming-600 gap-2">
                                                <Cpu size={48} className="opacity-20" />
                                                <div className="text-sm font-bold text-gaming-500">NO STRATEGY GENERATED</div>
                                                <div className="text-xs max-w-xs text-center text-gaming-600">Configure your parameters in the Strategy Builder to generate MQL code.</div>
                                             </div>
                                        )}
                                    </div>
                                )}
                             </ErrorBoundary>
                        </div>
                     </div>

                     {/* Right Panel: Strategy Builder */}
                     <aside className="w-[320px] bg-gaming-900 border-l border-gaming-800 flex flex-col shrink-0 shadow-2xl z-30">
                         <StrategyBuilder 
                            onSubmit={handleGenerate}
                            onBacktest={handleBacktest}
                            isGenerating={loading}
                            onConfigChange={handleConfigChange}
                         />
                     </aside>
                  </div>
              )}

              {/* TRADES / PORTFOLIO VIEW */}
              {activeNav === 'trades' && (
                  <div className="w-full h-full overflow-hidden">
                      <Portfolio result={backtestResult} />
                  </div>
              )}

              {/* WALLET VIEW */}
              {activeNav === 'wallet' && (
                  <div className="w-full h-full">
                      <WalletView />
                  </div>
              )}

              {/* AI AGENT VIEW (Full Screen Chat) */}
              {activeNav === 'ai_agent' && (
                  <div className="w-full h-full p-6">
                      <div className="h-full bg-gaming-900 border border-gaming-800 rounded-xl overflow-hidden shadow-2xl">
                         <ChatBot embedded={true} />
                      </div>
                  </div>
              )}
              
              {/* SETTINGS (Placeholder) */}
              {activeNav === 'settings' && (
                 <div className="w-full h-full flex items-center justify-center text-gaming-500">
                    <div className="text-center">
                        <Settings size={48} className="mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                        <p className="text-sm">Configuration module coming soon.</p>
                    </div>
                 </div>
              )}
          </div>
          
          {/* Real-time Ticker Footer */}
          <MarketTicker />
          
      </div>
      
      {/* Overlay Chat is only shown if NOT in AI Agent tab */}
      {activeNav !== 'ai_agent' && <ChatBot />}

    </div>
  );
};

export default App;