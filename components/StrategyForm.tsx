import React, { useState, useRef, useEffect } from 'react';
import { Platform, Timeframe, StrategyConfig, IndicatorSettings } from '../types';
import { Bot, LineChart, ShieldAlert, Sliders, Sparkles, X, Save, FolderOpen, Trash2, Check, Play, Camera, Activity, Zap } from 'lucide-react';
import { analyzeChart } from '../services/geminiService';

interface StrategyFormProps {
  onSubmit: (config: StrategyConfig) => void;
  onBacktest: (config: StrategyConfig) => void;
  isGenerating: boolean;
  onConfigChange: (config: Partial<StrategyConfig>) => void;
}

const CATEGORIES = [
  "Trend Following", "Scalping", "Breakout", "Mean Reversion", "Grid System", "Price Action", "Arbitrage", "News Trading", "Custom"
];

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

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 text-xs font-bold text-trade-500 uppercase tracking-wider mb-3 mt-6 border-b border-trade-800 pb-1">
    <Icon size={14} />
    <span>{title}</span>
  </div>
);

const InputGroup: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-[11px] font-medium text-trade-500 mb-1">{label}</label>
    {children}
  </div>
);

const StrategyForm: React.FC<StrategyFormProps> = ({ onSubmit, onBacktest, isGenerating, onConfigChange }) => {
  const [config, setConfig] = useState<StrategyConfig>({
    name: 'Alpha_Bot_v1',
    category: 'Trend Following',
    platform: Platform.MT5,
    symbol: 'EURUSD',
    timeframe: Timeframe.H1,
    lotSize: 0.1,
    stopLoss: 50,
    takeProfit: 100,
    description: 'Buy when RSI(14) crosses above 30. Sell when RSI(14) crosses below 70.',
    indicators: DEFAULT_INDICATORS
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoTuned, setAutoTuned] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save/Load State
  const [savedStrategies, setSavedStrategies] = useState<StrategyConfig[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Validation State
  const slInvalid = config.stopLoss <= 0;
  const tpInvalid = config.takeProfit <= 0;
  const formInvalid = slInvalid || tpInvalid;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('metabot_strategies');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure legacy saves have indicators
        setSavedStrategies(parsed.map((s: any) => ({ 
            ...s, 
            category: s.category || 'Custom',
            indicators: s.indicators || DEFAULT_INDICATORS 
        })));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    // Sync symbol changes to parent for Chart updates
    const timer = setTimeout(() => {
        onConfigChange({ symbol: config.symbol });
    }, 500);
    return () => clearTimeout(timer);
  }, [config.symbol, onConfigChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: ['lotSize', 'stopLoss', 'takeProfit'].includes(name) ? parseFloat(value) : value
    }));
  };

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      indicators: {
        ...prev.indicators,
        [name]: name === 'maType' ? value : parseFloat(value) || 0
      }
    }));
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
      
      setConfig(prev => {
        // Merge structured analysis into state
        const updated = {
            ...prev,
            description: analysis.description || prev.description,
            category: analysis.category || prev.category,
            stopLoss: analysis.stopLoss || prev.stopLoss,
            takeProfit: analysis.takeProfit || prev.takeProfit,
            indicators: {
                ...prev.indicators,
                ...(analysis.indicators || {})
            }
        };
        return updated;
      });
      setAutoTuned(true);
      setTimeout(() => setAutoTuned(false), 3000);

    } catch (error: any) { 
        setAnalysisError(error.message || "Analysis failed.");
    } 
    finally { setIsAnalyzing(false); }
  };

  const handleSaveStrategy = () => {
    if (!config.name.trim()) return alert("Enter name.");
    const newStrategies = [...savedStrategies];
    const existingIndex = newStrategies.findIndex(s => s.name === config.name);
    if (existingIndex >= 0) {
      if (!window.confirm(`Overwrite "${config.name}"?`)) return;
      newStrategies[existingIndex] = config;
    } else {
      newStrategies.push(config);
    }
    setSavedStrategies(newStrategies);
    localStorage.setItem('metabot_strategies', JSON.stringify(newStrategies));
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleLoadStrategy = (s: StrategyConfig) => {
    // Merge with defaults to ensure indicators exist for old saves
    const loadedConfig = {
        ...s,
        indicators: s.indicators || DEFAULT_INDICATORS
    };
    setConfig(loadedConfig);
    setShowLoadMenu(false);
    onConfigChange(loadedConfig);
  };

  const handleDeleteStrategy = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const newStrategies = savedStrategies.filter(s => s.name !== name);
    setSavedStrategies(newStrategies);
    localStorage.setItem('metabot_strategies', JSON.stringify(newStrategies));
  };

  return (
    <form className="p-4 text-sm" onSubmit={(e) => e.preventDefault()}>
      
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-sm font-bold text-white">Strategy Builder</h2>
         <div className="flex gap-1">
             <div className="relative">
                <button type="button" onClick={() => setShowLoadMenu(!showLoadMenu)} className="p-1.5 hover:bg-trade-700 rounded text-trade-500 hover:text-white transition-colors">
                    <FolderOpen size={16} />
                </button>
                {showLoadMenu && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-trade-800 border border-trade-700 shadow-xl rounded z-50 max-h-60 overflow-y-auto">
                        {savedStrategies.length === 0 && <div className="p-3 text-xs text-center text-gray-500">No saves.</div>}
                        {savedStrategies.map((s, i) => (
                            <div key={i} onClick={() => handleLoadStrategy(s)} className="p-2 border-b border-trade-700/50 hover:bg-trade-700 cursor-pointer flex justify-between group">
                                <span className="text-xs text-gray-300 truncate">{s.name}</span>
                                <Trash2 size={12} className="text-trade-500 hover:text-red-400 opacity-0 group-hover:opacity-100" onClick={(e) => handleDeleteStrategy(e, s.name)} />
                            </div>
                        ))}
                    </div>
                )}
             </div>
             <button type="button" onClick={handleSaveStrategy} className={`p-1.5 hover:bg-trade-700 rounded transition-colors ${saveFeedback ? 'text-green-400' : 'text-trade-500 hover:text-white'}`}>
                {saveFeedback ? <Check size={16} /> : <Save size={16} />}
             </button>
         </div>
      </div>

      <div className="space-y-1">
          <InputGroup label="BOT IDENTITY">
             <input
              type="text"
              name="name"
              value={config.name}
              onChange={handleChange}
              className="w-full bg-trade-900 border border-trade-600 rounded px-2 py-1.5 text-white focus:border-trade-accent focus:ring-1 focus:ring-trade-accent outline-none text-xs"
              placeholder="Name..."
            />
          </InputGroup>

          <InputGroup label="PLATFORM">
             <div className="grid grid-cols-2 gap-2">
                 {[Platform.MT4, Platform.MT5].map(p => (
                     <label key={p} className={`cursor-pointer text-center text-xs py-1.5 rounded border transition-all ${config.platform === p ? 'bg-trade-700 border-trade-accent text-white' : 'bg-trade-900 border-trade-600 text-gray-500 hover:bg-trade-700'}`}>
                         <input type="radio" name="platform" value={p} checked={config.platform === p} onChange={handleChange} className="hidden" />
                         {p === Platform.MT4 ? 'MT4' : 'MT5'}
                     </label>
                 ))}
             </div>
          </InputGroup>
      </div>

      <SectionHeader icon={LineChart} title="Market Config" />
      <div className="grid grid-cols-2 gap-2">
          <InputGroup label="SYMBOL">
             <input
              type="text"
              name="symbol"
              value={config.symbol}
              onChange={handleChange}
              className="w-full bg-trade-900 border border-trade-600 rounded px-2 py-1.5 text-white focus:border-trade-accent outline-none text-xs font-mono uppercase"
            />
          </InputGroup>
          <InputGroup label="TIMEFRAME">
            <select
                name="timeframe"
                value={config.timeframe}
                onChange={handleChange}
                className="w-full bg-trade-900 border border-trade-600 rounded px-2 py-1.5 text-white focus:border-trade-accent outline-none text-xs"
              >
                {Object.values(Timeframe).map(tf => <option key={tf} value={tf}>{tf}</option>)}
              </select>
          </InputGroup>
      </div>
      <InputGroup label="STRATEGY TYPE">
         <select
              name="category"
              value={config.category}
              onChange={handleChange}
              className={`w-full bg-trade-900 border rounded px-2 py-1.5 text-white focus:border-trade-accent outline-none text-xs transition-colors ${autoTuned ? 'border-trade-success text-trade-success font-bold' : 'border-trade-600'}`}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
         </select>
      </InputGroup>

      <SectionHeader icon={ShieldAlert} title="Risk Management" />
      <div className="grid grid-cols-3 gap-2">
         <InputGroup label="LOTS">
             <input type="number" name="lotSize" step="0.01" value={config.lotSize} onChange={handleChange} className="w-full bg-trade-900 border border-trade-600 rounded px-2 py-1.5 text-white focus:border-trade-accent outline-none text-xs" />
         </InputGroup>
         <InputGroup label="SL (PIPS)">
             <input 
                type="number" 
                name="stopLoss" 
                value={config.stopLoss} 
                onChange={handleChange} 
                className={`w-full bg-trade-900 border rounded px-2 py-1.5 text-red-400 outline-none text-xs transition-colors ${
                  slInvalid 
                    ? 'border-red-500 focus:border-red-500' 
                    : autoTuned ? 'border-trade-success' : 'border-trade-600 focus:border-red-500'
                }`} 
             />
             {slInvalid && <span className="text-[10px] text-red-500 mt-1 block">Must be &gt; 0</span>}
         </InputGroup>
         <InputGroup label="TP (PIPS)">
             <input 
                type="number" 
                name="takeProfit" 
                value={config.takeProfit} 
                onChange={handleChange} 
                className={`w-full bg-trade-900 border rounded px-2 py-1.5 text-green-400 outline-none text-xs transition-colors ${
                  tpInvalid 
                    ? 'border-red-500 focus:border-red-500' 
                    : autoTuned ? 'border-trade-success' : 'border-trade-600 focus:border-green-500'
                }`} 
             />
             {tpInvalid && <span className="text-[10px] text-red-500 mt-1 block">Must be &gt; 0</span>}
         </InputGroup>
      </div>

      <SectionHeader icon={Sliders} title="Indicators" />
      <div className={`space-y-3 bg-trade-900/50 p-3 rounded border transition-colors ${autoTuned ? 'border-trade-success shadow-[0_0_10px_rgba(0,220,130,0.1)]' : 'border-trade-800'}`}>
          {/* RSI Row */}
          <div>
            <label className="text-[10px] text-trade-500 font-bold mb-1 block">RSI SETTINGS</label>
            <div className="grid grid-cols-3 gap-2">
                <input type="number" name="rsiPeriod" value={config.indicators.rsiPeriod} onChange={handleIndicatorChange} placeholder="Per" className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-white" />
                <input type="number" name="rsiOverbought" value={config.indicators.rsiOverbought} onChange={handleIndicatorChange} placeholder="OB" className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-red-400" />
                <input type="number" name="rsiOversold" value={config.indicators.rsiOversold} onChange={handleIndicatorChange} placeholder="OS" className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-green-400" />
            </div>
          </div>

          {/* MA Row */}
          <div>
             <label className="text-[10px] text-trade-500 font-bold mb-1 block">MOVING AVERAGE</label>
             <div className="grid grid-cols-2 gap-2">
                <input type="number" name="maPeriod" value={config.indicators.maPeriod} onChange={handleIndicatorChange} className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-white" />
                <select name="maType" value={config.indicators.maType} onChange={handleIndicatorChange} className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-white">
                    <option value="SMA">SMA</option>
                    <option value="EMA">EMA</option>
                </select>
             </div>
          </div>

          {/* MACD Row */}
          <div>
             <label className="text-[10px] text-trade-500 font-bold mb-1 block">MACD (FAST-SLOW-SIG)</label>
             <div className="grid grid-cols-3 gap-2">
                <input type="number" name="macdFast" value={config.indicators.macdFast} onChange={handleIndicatorChange} className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-white" />
                <input type="number" name="macdSlow" value={config.indicators.macdSlow} onChange={handleIndicatorChange} className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-white" />
                <input type="number" name="macdSignal" value={config.indicators.macdSignal} onChange={handleIndicatorChange} className="bg-trade-900 border border-trade-600 rounded px-2 py-1 text-xs text-white" />
             </div>
          </div>
      </div>

      <SectionHeader icon={Bot} title="Strategy Logic" />
      
      {/* Visual Input Compact */}
      <div className="mb-3">
         {!imagePreview ? (
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-trade-600 hover:border-trade-400 rounded text-xs text-trade-500 hover:text-gray-300 transition-all bg-trade-900/50"
            >
                <Camera size={14} />
                <span>Upload Chart & Auto-Tune Bot</span>
            </button>
         ) : (
            <div className="relative rounded overflow-hidden border border-trade-600 group">
                <img src={imagePreview} className="w-full h-20 object-cover opacity-60" alt="Analysis Target" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={handleAnalyzeChart} disabled={isAnalyzing} className="p-1.5 bg-trade-accent text-white rounded hover:bg-blue-500 flex items-center gap-2 px-3">
                        {isAnalyzing ? <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div> : <Zap size={14} fill="currentColor" />}
                        <span className="text-xs font-bold">Auto-Tune</span>
                    </button>
                    <button type="button" onClick={() => { setImagePreview(null); setRawImage(null); setAnalysisError(null); }} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600">
                        <X size={14} />
                    </button>
                </div>
            </div>
         )}
         <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
         
         {/* Analysis Error Display */}
         {analysisError && (
             <div className="mt-2 text-[10px] text-red-300 flex items-start gap-1.5 bg-red-900/20 p-2 rounded border border-red-500/30 animate-fade-in">
                 <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                 <span>{analysisError}</span>
             </div>
         )}
      </div>

      <textarea
        name="description"
        rows={6}
        value={config.description}
        onChange={handleChange}
        className={`w-full bg-trade-900 border rounded p-2 text-gray-300 focus:border-trade-accent outline-none text-xs leading-relaxed resize-none font-mono transition-colors ${autoTuned ? 'border-trade-success shadow-[0_0_10px_rgba(0,220,130,0.1)]' : 'border-trade-600'}`}
        placeholder="Describe entry/exit rules..."
      />

      <div className="mt-6 pt-4 border-t border-trade-700 flex gap-2">
         <button
            type="button"
            onClick={() => onBacktest(config)}
            disabled={isGenerating || formInvalid}
            className={`flex-1 py-3 rounded text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                isGenerating || formInvalid
                ? 'bg-trade-800 text-trade-500 cursor-not-allowed border border-trade-700' 
                : 'bg-trade-800 hover:bg-trade-700 text-trade-success border border-trade-700'
            }`}
        >
            <Activity size={16} />
            BACKTEST
        </button>
        <button
            type="button"
            onClick={() => onSubmit(config)}
            disabled={isGenerating || formInvalid}
            className={`flex-1 py-3 rounded text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                isGenerating || formInvalid
                ? 'bg-trade-700 text-gray-500 cursor-not-allowed' 
                : 'bg-trade-accent hover:bg-blue-500 text-white hover:shadow-blue-500/20'
            }`}
        >
            {isGenerating ? (
                 <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
            ) : (
                <>
                 <Play size={16} fill="currentColor" />
                 GENERATE
                </>
            )}
        </button>
      </div>

    </form>
  );
};

export default StrategyForm;