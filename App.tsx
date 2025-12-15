import React, { useState, useEffect } from 'react';
import StrategyBuilder from './components/StrategyBuilder';
import ChartAnalyst from './components/ChartAnalyst';
import BotGenerator from './components/BotGenerator';
import TradingViewWidget from './components/TradingViewWidget';
import Portfolio from './components/Portfolio';
import ErrorBoundary from './components/ErrorBoundary';
import ChatBot from './components/ChatBot';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import MarketTicker from './components/MarketTicker';
import WalletView from './components/WalletView';
import NotificationSystem, { Notification } from './components/NotificationSystem';
import { StrategyConfig } from './types';
import { LayoutDashboard, Bot, Settings, Terminal, Briefcase, Wallet, Menu, Activity, ShieldCheck, Hammer, Eye, Code } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  
  // Data State
  const [currentConfig, setCurrentConfig] = useState<StrategyConfig | null>(null);
  const [savedStrategies, setSavedStrategies] = useState<StrategyConfig[]>([]);
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load strategies on mount
  useEffect(() => {
      const stored = localStorage.getItem('botx_strategies');
      if (stored) {
          try {
              setSavedStrategies(JSON.parse(stored));
          } catch(e) { console.error("Failed to load strategies"); }
      }
  }, []);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Bot Management
  const handleSaveStrategy = (config: StrategyConfig) => {
      const newStrategy = { ...config, id: config.id || Date.now().toString() };
      setSavedStrategies(prev => {
          const exists = prev.findIndex(s => s.id === newStrategy.id);
          const updated = exists >= 0 
            ? prev.map(s => s.id === newStrategy.id ? newStrategy : s)
            : [...prev, newStrategy];
          
          localStorage.setItem('botx_strategies', JSON.stringify(updated));
          return updated;
      });
      setCurrentConfig(newStrategy);
  };

  const handleDeleteStrategy = (id: string) => {
      setSavedStrategies(prev => {
          const updated = prev.filter(s => s.id !== id);
          localStorage.setItem('botx_strategies', JSON.stringify(updated));
          return updated;
      });
      addNotification('success', "Strategy deleted.");
  };

  const handleEditStrategy = (strategy: StrategyConfig) => {
      setCurrentConfig(strategy);
      setActiveNav('builder');
  };

  const handleAnalysisComplete = (analysis: Partial<StrategyConfig>) => {
    setCurrentConfig(prev => {
        const base = prev || { 
            name: "AI_Analysed_Bot", 
            symbol: "BTCUSDT", 
            platform: "MetaTrader 5 (MQL5)", 
            timeframe: "H1", 
            lotSize: 0.1, 
            stopLoss: 50, 
            takeProfit: 100, 
            category: "Price Action", 
            description: "", 
            indicators: { rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30, maPeriod: 50, maType: 'SMA', macdFast: 12, macdSlow: 26, macdSignal: 9 } 
        } as StrategyConfig;
        
        return {
            ...base,
            ...analysis,
            indicators: { ...base.indicators, ...analysis.indicators }
        };
    });
    addNotification('success', "Analysis applied! Switching to Strategy Builder.");
    setActiveNav('builder');
  };

  if (!isLoggedIn) {
      return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // Mobile Bottom Nav Item
  const BottomNavItem = ({ id, icon: Icon, label }: any) => (
    <button 
        onClick={() => setActiveNav(id)}
        className={`flex flex-col items-center justify-center py-2 flex-1 transition-colors ${activeNav === id ? 'text-white' : 'text-gaming-500'}`}
    >
        <Icon size={20} className={`mb-1 ${activeNav === id ? "text-gaming-accent" : ""}`} strokeWidth={activeNav === id ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  // Desktop Sidebar Item
  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button 
        onClick={() => setActiveNav(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-r-2 ${activeNav === id ? 'text-white border-gaming-accent bg-gaming-900/50' : 'text-gaming-500 border-transparent hover:text-gray-300 hover:bg-gaming-900/30'}`}
    >
        <Icon size={18} className={activeNav === id ? "text-gaming-accent" : ""} />
        {label}
    </button>
  );

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-black text-gray-200 overflow-hidden font-sans">
      
      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />

      {/* 1. Desktop Sidebar (Hidden on Mobile) */}
      <nav className="hidden md:flex w-64 bg-black border-r border-gaming-800 flex-col shrink-0 z-50">
         <div className="h-16 flex items-center px-6 border-b border-gaming-800">
             <div className="flex items-center gap-2 font-bold text-white text-lg">
                 <div className="bg-gaming-800 p-1.5 rounded-lg border border-gaming-700">
                     <Bot size={20} className="text-gaming-accent" />
                 </div>
                 <span>Bot X <span className="text-gaming-accent">Pro</span></span>
             </div>
         </div>
         <div className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
            <div className="px-4 text-[10px] font-bold text-gaming-600 uppercase mb-2">Platform</div>
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem id="analyst" icon={Eye} label="Chart Analyst" />
            <SidebarItem id="builder" icon={Hammer} label="Strategy Studio" />
            <SidebarItem id="generator" icon={Code} label="Bot Generator" />
            <SidebarItem id="charts" icon={Terminal} label="Terminal" />
            
            <div className="px-4 text-[10px] font-bold text-gaming-600 uppercase mb-2 mt-6">Account</div>
            <SidebarItem id="trades" icon={Briefcase} label="Portfolio" />
            <SidebarItem id="wallet" icon={Wallet} label="Wallet" />
            <SidebarItem id="settings" icon={Settings} label="Settings" />
         </div>
         <div className="p-4 border-t border-gaming-800">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gaming-800 flex items-center justify-center text-xs font-bold text-white">JS</div>
                 <div>
                     <div className="text-xs font-bold text-white">John Smith</div>
                     <div className="text-[10px] text-gaming-500">Pro Plan</div>
                 </div>
             </div>
         </div>
      </nav>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative h-full">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden h-14 bg-black border-b border-gaming-800 flex items-center justify-between px-4 shrink-0 z-40">
              <div className="flex items-center gap-2 font-bold text-white">
                 <Bot size={20} className="text-gaming-accent" />
                 <span>Bot X</span>
              </div>
              <div className="w-8 h-8 bg-gaming-800 rounded-full flex items-center justify-center">
                  <Menu size={18} />
              </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col pb-16 md:pb-0">
              <ErrorBoundary>
                  {activeNav === 'dashboard' && (
                    <Dashboard 
                        savedStrategies={savedStrategies}
                        onEditStrategy={handleEditStrategy}
                        onDeleteStrategy={handleDeleteStrategy}
                    />
                  )}
                  
                  {activeNav === 'analyst' && (
                      <ChartAnalyst 
                        onAnalysisComplete={handleAnalysisComplete}
                        onError={(msg) => addNotification('error', msg)}
                      />
                  )}

                  {activeNav === 'builder' && (
                      <div className="w-full h-full md:p-6 flex justify-center bg-gaming-900/20">
                          <div className="w-full max-w-7xl h-full md:shadow-xl md:rounded-2xl overflow-hidden md:border border-gaming-800 bg-black">
                            <StrategyBuilder 
                                initialConfig={currentConfig}
                                onUpdateConfig={setCurrentConfig}
                                onSaveStrategy={handleSaveStrategy}
                                onNavigateToGenerator={() => setActiveNav('generator')}
                                onError={(msg) => addNotification('error', msg)}
                                onSuccess={(msg) => addNotification('success', msg)}
                            />
                          </div>
                      </div>
                  )}

                  {activeNav === 'generator' && (
                      <BotGenerator 
                        config={currentConfig}
                        onError={(msg) => addNotification('error', msg)}
                        onSuccess={(msg) => addNotification('success', msg)}
                      />
                  )}

                  {activeNav === 'charts' && (
                      <div className="w-full h-full flex flex-col">
                            <header className="h-12 border-b border-gaming-800 bg-gaming-900/50 flex items-center justify-between px-4 shrink-0">
                                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                                    {currentConfig?.symbol || activeSymbol}
                                </h1>
                            </header>
                            <div className="flex-1 relative bg-black">
                                <TradingViewWidget symbol={currentConfig?.symbol || activeSymbol} />
                            </div>
                      </div>
                  )}

                  {activeNav === 'trades' && <div className="h-full w-full"><Portfolio result={null} /></div>}
                  {activeNav === 'wallet' && <WalletView />}
                  
                  {activeNav === 'settings' && (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
                        <div className="bg-gaming-900 border border-gaming-800 rounded-xl p-4 flex items-center gap-4">
                            <ShieldCheck size={24} className="text-gaming-accent" />
                            <div>
                                <div className="text-sm font-bold text-white">Security Active</div>
                                <div className="text-xs text-gaming-500">SHA-256 Encryption Active</div>
                            </div>
                        </div>
                    </div>
                  )}
              </ErrorBoundary>
          </div>
          
          {/* Market Ticker - Desktop Only */}
          <div className="hidden md:block">
            <MarketTicker />
          </div>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t border-gaming-800 flex justify-between px-2 pb-safe z-50 h-16 items-center">
          <BottomNavItem id="dashboard" icon={LayoutDashboard} label="Home" />
          <BottomNavItem id="builder" icon={Hammer} label="Build" />
          <BottomNavItem id="generator" icon={Code} label="Code" />
          <BottomNavItem id="analyst" icon={Eye} label="Vision" />
          <BottomNavItem id="charts" icon={Activity} label="Trade" />
      </div>

      {/* Global Components */}
      <ChatBot />

    </div>
  );
};

export default App;