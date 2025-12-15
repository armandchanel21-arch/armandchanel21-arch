import React, { useState, useEffect } from 'react';
import { Platform, Timeframe, StrategyConfig, IndicatorSettings, BacktestResult } from '../types';
import { Bot, Sliders, Save, FolderOpen, Trash2, Check, Zap, Play, LayoutTemplate, Activity, ArrowRight, Camera, X } from 'lucide-react';
import { runBacktestSimulation, analyzeChart } from '../services/geminiService';
import BacktestChart from './BacktestChart';

interface StrategyBuilderProps {
  initialConfig: StrategyConfig | null;
  onUpdateConfig: (config: StrategyConfig) => void;
  onSaveStrategy: (config: StrategyConfig) => void;
  onNavigateToGenerator: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const DEFAULT_INDICATORS: IndicatorSettings = {
  rsiPeriod: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  maPeriod: 50,
  maType: 'SMA',
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9
};

const SectionHeader = ({ title, count }: { title: string, count?: number }) => (
  <div className="flex items-center justify-between text-[10px] font-bold text-gaming-500 uppercase tracking-wider mb-2 mt-4 px-1">
    <span>{title}</span>
    {count !== undefined && <span className="bg-gaming-800 text-gaming-400 px-1.5 rounded-sm text-[9px] border border-gaming-700">{count}</span>}
  </div>
);

const ConfigInput: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
  <div className={`bg-gaming-900/50 rounded-lg p-3 border border-gaming-800 hover:border-gaming-700 transition-colors ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="block text-[9px] font-bold text-gaming-500 mb-2 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ initialConfig, onUpdateConfig, onSaveStrategy, onNavigateToGenerator, onError, onSuccess }) => {
  const [config, setConfig] = useState<StrategyConfig>(initialConfig || {
    name: 'Alpha_Bot_v1',
    category: 'Trend Following',
    platform: Platform.MT5,
    symbol: 'BTCUSDT',
    timeframe: Timeframe.H1,
    lotSize: 0.1,
    stopLoss: 50,
    takeProfit: 100,
    description: 'Buy when RSI(14) crosses above 30. Sell when RSI(14) crosses below 70.',
    indicators: DEFAULT_INDICATORS,
    magicNumber: 123456,
    slippage: 3,
    maxSpread: 20
  });

  const [isProMode, setIsProMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<BacktestResult | null>(null);
  
  // Image Analysis State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoTuned, setAutoTuned] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync prop changes (e.g. from Analyst or Edit Dashboard)
  useEffect(() => {
    if (initialConfig) {
        setConfig(prev => ({ 
            ...prev, 
            ...initialConfig,
            magicNumber: initialConfig.magicNumber ?? prev.magicNumber ?? 123456,
            slippage: initialConfig.slippage ?? prev.slippage ?? 3,
            maxSpread: initialConfig.maxSpread ?? prev.maxSpread ?? 20
        }));
    }
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['lotSize', 'stopLoss', 'takeProfit', 'magicNumber', 'slippage', 'maxSpread'];
    const newConfig = {
      ...config,
      [name]: numericFields.includes(name) ? parseFloat(value) : value
    };
    setConfig(newConfig);
    onUpdateConfig(newConfig);
  };

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newConfig = {
      ...config,
      indicators: {
        ...config.indicators,
        [name]: name === 'maType' ? value : parseFloat(value) || 0
      }
    };
    setConfig(newConfig);
    onUpdateConfig(newConfig);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setRawImage(result.split(',')[1]); 
        setAutoTuned(false);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeChart = async () => {
    if (!rawImage) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await analyzeChart(rawImage);
      const newConfig = {
            ...config,
            description: analysis.description || config.description,
            category: analysis.category || config.category,
            stopLoss: analysis.stopLoss || config.stopLoss,
            takeProfit: analysis.takeProfit || config.takeProfit,
            indicators: { ...config.indicators, ...(analysis.indicators || {}) },
            signal: analysis.signal
      };
      setConfig(newConfig);
      onUpdateConfig(newConfig);
      setAutoTuned(true);
      setTimeout(() => setAutoTuned(false), 3000);
    } catch (error: any) { 
        setAnalysisError(error.message || "Analysis failed.");
    } finally { setIsAnalyzing(false); }
  };

  const handleRunSimulation = async () => {
      setIsSimulating(true);
      setSimResult(null);
      try {
          const result = await runBacktestSimulation(config);
          setSimResult(result);
          onSuccess("Simulation complete! Review accuracy below.");
      } catch (e: any) {
          onError(e.message || "Simulation failed");
      } finally {
          setIsSimulating(false);
      }
  };

  const handleSave = () => {
      if (!config.name) {
          onError("Please provide a name for your bot strategy.");
          return;
      }
      onSaveStrategy(config);
      onSuccess(`Strategy "${config.name}" saved to dashboard.`);
  };

  return (
    <div className="flex flex-col h-full bg-gaming-900 text-gaming-400 font-sans">
      
      {/* Top Bar */}
      <div className="bg-gaming-950 border-b border-gaming-800 px-6 py-4 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-gaming-800 rounded border border-gaming-700">
                <LayoutTemplate size={20} className="text-gaming-accent" />
            </div>
            <div>
                <h2 className="text-white font-black text-lg uppercase tracking-tight leading-none">Strategy Studio</h2>
                <div className="text-[10px] font-bold text-gaming-500 uppercase tracking-widest mt-1">Design & Backtest</div>
            </div>
         </div>

         <div className="flex items-center gap-2">
             <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-gaming-700 text-gaming-400 hover:text-white hover:bg-gaming-800 transition-all">
                 <Save size={12} /> Save
             </button>
             <button 
                onClick={() => setIsProMode(!isProMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isProMode ? 'bg-gaming-800 border-gaming-accent text-white' : 'border-gaming-700 text-gaming-500'}`}
             >
                {isProMode ? 'PRO MODE' : 'LITE MODE'}
             </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
         <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Input Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Identity & Risk */}
                <div className="space-y-4">
                    <div className="bg-gaming-900/50 p-4 rounded-xl border border-gaming-800">
                        <label className="text-[10px] font-bold text-gaming-500 uppercase mb-2 block">Strategy Name</label>
                        <input
                            type="text"
                            name="name"
                            value={config.name}
                            onChange={handleChange}
                            className="w-full bg-gaming-950 border border-gaming-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                        />
                    </div>
                    
                    <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-4">
                        <SectionHeader title="Asset & Risk" />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <ConfigInput label="Symbol">
                                <input type="text" name="symbol" value={config.symbol} onChange={handleChange} className="w-full bg-transparent text-white font-mono uppercase text-sm" />
                            </ConfigInput>
                            <ConfigInput label="Timeframe">
                                <select name="timeframe" value={config.timeframe} onChange={handleChange} className="w-full bg-transparent text-white font-mono text-sm">
                                    {Object.values(Timeframe).map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                </select>
                            </ConfigInput>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <ConfigInput label="Lot Size">
                                <input type="number" name="lotSize" step="0.01" value={config.lotSize} onChange={handleChange} className="w-full bg-transparent text-white font-bold text-sm" />
                            </ConfigInput>
                            <ConfigInput label="SL (Pips)">
                                <input type="number" name="stopLoss" value={config.stopLoss} onChange={handleChange} className="w-full bg-transparent text-danger font-bold text-sm" />
                            </ConfigInput>
                            <ConfigInput label="TP (Pips)">
                                <input type="number" name="takeProfit" value={config.takeProfit} onChange={handleChange} className="w-full bg-transparent text-gaming-accent font-bold text-sm" />
                            </ConfigInput>
                        </div>
                        
                        <SectionHeader title="Execution Settings" />
                        <div className="grid grid-cols-3 gap-2">
                             <ConfigInput label="Magic #">
                                <input type="number" name="magicNumber" value={config.magicNumber || ''} onChange={handleChange} className="w-full bg-transparent text-white text-sm" placeholder="123456" />
                             </ConfigInput>
                             <ConfigInput label="Slippage">
                                <input type="number" name="slippage" value={config.slippage || ''} onChange={handleChange} className="w-full bg-transparent text-white text-sm" placeholder="3" />
                             </ConfigInput>
                             <ConfigInput label="Max Spread">
                                <input type="number" name="maxSpread" value={config.maxSpread || ''} onChange={handleChange} className="w-full bg-transparent text-white text-sm" placeholder="0" />
                             </ConfigInput>
                        </div>
                    </div>
                </div>

                {/* Column 2: Logic Description */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] font-bold text-gaming-500 uppercase">Trading Logic (Natural Language)</label>
                             <div className="flex items-center gap-2">
                                 {autoTuned && <span className="text-[9px] bg-gaming-accent text-black font-bold px-2 py-0.5 rounded animate-pulse">AI TUNED</span>}
                                 <span className="text-[9px] bg-gaming-900 px-2 py-0.5 rounded text-gaming-400">AI Driven</span>
                             </div>
                        </div>
                        
                         {/* AI Auto Tune Section */}
                         <div className="mb-3">
                             {!imagePreview ? (
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gaming-700 hover:border-gaming-500 rounded bg-gaming-900/30 text-xs text-gaming-500 hover:text-white transition-all group"
                                >
                                    <Camera size={14} className="group-hover:text-gaming-accent" />
                                    <span>Upload Chart for Vision Analysis</span>
                                </button>
                             ) : (
                                <div className="relative rounded overflow-hidden border border-gaming-600 h-24 bg-black w-full flex items-center justify-center">
                                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Target" />
                                    <div className="relative z-10 flex items-center gap-3">
                                        <button type="button" onClick={handleAnalyzeChart} disabled={isAnalyzing} className="bg-gaming-accent text-gaming-950 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 hover:brightness-110 shadow-lg">
                                            {isAnalyzing ? <div className="animate-spin h-3 w-3 border-2 border-black rounded-full border-t-transparent"></div> : <Zap size={14} />}
                                            RUN VISION
                                        </button>
                                        <button type="button" onClick={() => { setImagePreview(null); setRawImage(null); }} className="bg-black/50 p-1.5 rounded text-white hover:text-danger border border-white/20 hover:border-danger/50 backdrop-blur-sm">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                             )}
                             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                             {analysisError && <div className="text-[10px] text-danger mt-1 text-center">{analysisError}</div>}
                        </div>

                        <textarea
                            name="description"
                            value={config.description}
                            onChange={handleChange}
                            className="flex-1 w-full bg-gaming-950 border border-gaming-700 rounded-lg p-4 text-gray-300 text-sm focus:border-gaming-accent outline-none resize-none font-mono leading-relaxed"
                            placeholder="Describe your strategy here..."
                        />
                    </div>
                    
                    {/* Indicators (Collapsible in Lite, Expanded in Pro) */}
                    <div className="bg-gaming-900/50 border border-gaming-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-[10px] font-bold text-gaming-500 uppercase">Indicator Config</div>
                            <div className="flex items-center gap-2">
                                <Sliders size={12} className="text-gaming-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <ConfigInput label="RSI Period">
                                <input type="number" name="rsiPeriod" value={config.indicators.rsiPeriod} onChange={handleIndicatorChange} className="w-full bg-transparent text-white text-center" />
                            </ConfigInput>
                            <ConfigInput label="MA Period">
                                <input type="number" name="maPeriod" value={config.indicators.maPeriod} onChange={handleIndicatorChange} className="w-full bg-transparent text-white text-center" />
                            </ConfigInput>
                            {isProMode && (
                                <>
                                    <ConfigInput label="MACD Fast">
                                        <input type="number" name="macdFast" value={config.indicators.macdFast} onChange={handleIndicatorChange} className="w-full bg-transparent text-white text-center" />
                                    </ConfigInput>
                                    <ConfigInput label="MACD Slow">
                                        <input type="number" name="macdSlow" value={config.indicators.macdSlow} onChange={handleIndicatorChange} className="w-full bg-transparent text-white text-center" />
                                    </ConfigInput>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Results Area (Inline) */}
            <div className="border-t border-gaming-800 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} className="text-gaming-accent" /> 
                        Simulation & Accuracy Check
                    </h3>
                </div>
                
                <div className="bg-black border border-gaming-800 rounded-xl overflow-hidden min-h-[300px] relative">
                    {!simResult ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gaming-700">
                             {isSimulating ? (
                                 <div className="text-center">
                                     <div className="w-10 h-10 border-2 border-gaming-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                     <p className="text-xs font-bold text-gaming-500 animate-pulse">Running Backtest on Real Data...</p>
                                 </div>
                             ) : (
                                 <>
                                    <Play size={48} className="mb-4 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Ready to Simulate</p>
                                    <p className="text-[10px] mt-1">Click "Run Simulation" to test accuracy.</p>
                                 </>
                             )}
                        </div>
                    ) : (
                        <div className="h-[400px]">
                            <BacktestChart result={simResult} onClose={() => setSimResult(null)} />
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-gaming-950 border-t border-gaming-700 shrink-0 flex gap-4">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex-1 bg-gaming-800 hover:bg-gaming-700 text-white font-bold py-3 rounded-xl text-sm border border-gaming-700 uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
          >
             <Play size={16} className="text-gaming-accent" />
             {isSimulating ? 'Testing...' : 'Run Simulation'}
          </button>
          
          <button
            onClick={onNavigateToGenerator}
            className="flex-[2] bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black py-3 rounded-xl text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
          >
             Generate Bot Code <ArrowRight size={18} strokeWidth={2.5} />
          </button>
      </div>

    </div>
  );
};

export default StrategyBuilder;