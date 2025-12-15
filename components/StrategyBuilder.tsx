import React, { useState, useRef, useEffect } from 'react';
import { Platform, Timeframe, StrategyConfig, IndicatorSettings } from '../types';
import { Bot, Sliders, X, Save, FolderOpen, Trash2, Check, Camera, Activity, Zap, Settings2, Code, Play, GripVertical, Plus } from 'lucide-react';
import { analyzeChart } from '../services/geminiService';

interface StrategyBuilderProps {
  onSubmit: (config: StrategyConfig) => void;
  onBacktest: (config: StrategyConfig) => void;
  isGenerating: boolean;
  onConfigChange: (config: Partial<StrategyConfig>) => void;
}

const CATEGORIES = [
  "Trend Following", "Scalping", "Breakout", "Mean Reversion", "Grid System", "Price Action"
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

// Section Header
const SectionHeader = ({ title, count }: { title: string, count?: number }) => (
  <div className="flex items-center justify-between text-[10px] font-bold text-gaming-500 uppercase tracking-wider mb-2 mt-4 px-1">
    <span>{title}</span>
    {count !== undefined && <span className="bg-gaming-800 text-gaming-400 px-1.5 rounded-sm text-[9px] border border-gaming-700">{count}</span>}
  </div>
);

const ConfigInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="bg-gaming-800 rounded p-2 border border-gaming-700 hover:border-gaming-600 transition-colors">
    <label className="block text-[9px] font-bold text-gaming-500 mb-1 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ onSubmit, onBacktest, isGenerating, onConfigChange }) => {
  const [config, setConfig] = useState<StrategyConfig>({
    name: 'Alpha_Bot_v1',
    category: 'Trend Following',
    platform: Platform.MT5,
    symbol: 'BTCUSDT',
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

  const slInvalid = config.stopLoss <= 0;
  const tpInvalid = config.takeProfit <= 0;
  const formInvalid = slInvalid || tpInvalid;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('metabot_strategies');
      if (saved) {
        const parsed = JSON.parse(saved);
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
      setConfig(prev => ({
            ...prev,
            description: analysis.description || prev.description,
            category: analysis.category || prev.category,
            stopLoss: analysis.stopLoss || prev.stopLoss,
            takeProfit: analysis.takeProfit || prev.takeProfit,
            indicators: { ...prev.indicators, ...(analysis.indicators || {}) }
      }));
      setAutoTuned(true);
      setTimeout(() => setAutoTuned(false), 3000);
    } catch (error: any) { 
        setAnalysisError(error.message || "Analysis failed.");
    } finally { setIsAnalyzing(false); }
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
    const loadedConfig = { ...s, indicators: s.indicators || DEFAULT_INDICATORS };
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
    <div className="flex flex-col h-full bg-gaming-900 text-gaming-400">
      
      {/* Header */}
      <div className="bg-gaming-950 border-b border-gaming-800 p-3 flex justify-between items-center font-bold uppercase tracking-wider text-sm shrink-0">
         <div className="flex items-center gap-2 text-white">
            <Sliders size={16} className="text-gaming-accent" />
            <span>Strategy Builder</span>
         </div>
         <span className="bg-gaming-800 px-2 py-0.5 rounded text-[9px] text-gaming-500 border border-gaming-700">PRO MODE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        
        {/* Name & Load/Save */}
        <div className="flex justify-between items-center bg-gaming-800 p-2 rounded border border-gaming-700">
            <input
              type="text"
              name="name"
              value={config.name}
              onChange={handleChange}
              className="bg-transparent border-none text-white font-bold text-xs focus:ring-0 placeholder-gaming-600 w-full"
              placeholder="Strategy Name..."
            />
            <div className="flex gap-1 shrink-0">
                <div className="relative">
                    <button type="button" onClick={() => setShowLoadMenu(!showLoadMenu)} className="p-1.5 hover:bg-gaming-700 rounded text-gaming-500 hover:text-white transition-colors" title="Load">
                        <FolderOpen size={14} />
                    </button>
                    {showLoadMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-gaming-800 border border-gaming-700 shadow-2xl rounded z-50">
                            {savedStrategies.length === 0 ? (
                                <div className="p-2 text-[10px] text-gaming-500 text-center">No saved strategies</div>
                            ) : (
                                savedStrategies.map((s, i) => (
                                    <div key={i} onClick={() => handleLoadStrategy(s)} className="p-2 border-b border-gaming-700 hover:bg-gaming-700 cursor-pointer flex justify-between group text-xs text-white">
                                        <span>{s.name}</span>
                                        <Trash2 size={12} className="text-gaming-500 hover:text-danger" onClick={(e) => handleDeleteStrategy(e, s.name)} />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <button type="button" onClick={handleSaveStrategy} className={`p-1.5 hover:bg-gaming-700 rounded transition-colors ${saveFeedback ? 'text-gaming-accent' : 'text-gaming-500 hover:text-white'}`} title="Save">
                    {saveFeedback ? <Check size={14} /> : <Save size={14} />}
                </button>
            </div>
        </div>

        {/* Assets */}
        <SectionHeader title="Asset Configuration" />
        <div className="grid grid-cols-2 gap-2">
            <ConfigInput label="Target Symbol">
                <input
                  type="text"
                  name="symbol"
                  value={config.symbol}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none text-white font-mono text-xs focus:ring-0 p-0 uppercase"
                />
            </ConfigInput>
            <ConfigInput label="Timeframe">
                <select
                    name="timeframe"
                    value={config.timeframe}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none text-white font-mono text-xs focus:ring-0 p-0"
                >
                    {Object.values(Timeframe).map(tf => <option key={tf} value={tf}>{tf}</option>)}
                </select>
            </ConfigInput>
        </div>

        {/* AI Logic Builder */}
        <SectionHeader title="Logic Matrix" />
        <div className="bg-gaming-800 rounded border border-gaming-700 p-2 space-y-2">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold text-gaming-500 uppercase">Strategy Class</label>
                <select
                    name="category"
                    value={config.category}
                    onChange={handleChange}
                    className={`bg-gaming-900 border border-gaming-600 rounded text-xs text-white px-2 py-0.5 outline-none focus:border-gaming-accent ${autoTuned ? 'text-gaming-accent' : ''}`}
                    >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             
             {/* Text Area (Simulating Logic Blocks) */}
             <div>
                <textarea
                    name="description"
                    rows={4}
                    value={config.description}
                    onChange={handleChange}
                    className={`w-full bg-gaming-900 border border-gaming-600 rounded p-2 text-gray-300 text-xs mt-1 focus:border-gaming-accent focus:ring-0 outline-none resize-none font-mono leading-relaxed ${autoTuned ? 'border-gaming-accent' : ''}`}
                    placeholder="// Describe logic..."
                />
             </div>
             
             {/* AI Upload Button */}
             {!imagePreview ? (
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gaming-600 rounded hover:border-gaming-400 text-[10px] text-gaming-500 hover:text-white transition-all bg-gaming-900/50"
                >
                    <Camera size={12} />
                    <span>Import Chart Structure (AI)</span>
                </button>
             ) : (
                <div className="relative rounded overflow-hidden border border-gaming-600 h-16 bg-black group">
                    <img src={imagePreview} className="w-full h-full object-cover opacity-60" alt="Target" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={handleAnalyzeChart} disabled={isAnalyzing} className="bg-gaming-accent text-gaming-950 px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1">
                            {isAnalyzing ? <span className="animate-spin">⌛</span> : <Zap size={10} />} ANALYZE
                        </button>
                        <button type="button" onClick={() => { setImagePreview(null); setRawImage(null); }} className="bg-gaming-800 p-1 rounded text-white">
                            <X size={12} />
                        </button>
                    </div>
                </div>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
             {analysisError && <div className="text-[9px] text-danger">{analysisError}</div>}
        </div>

        <SectionHeader title="Risk Profile" />
        <div className="grid grid-cols-3 gap-2">
             <ConfigInput label="Lot Size">
                 <input type="number" name="lotSize" step="0.01" value={config.lotSize} onChange={handleChange} className="w-full bg-transparent text-white font-bold text-sm focus:ring-0 border-none p-0" />
             </ConfigInput>
             <ConfigInput label="SL (Pips)">
                 <input type="number" name="stopLoss" value={config.stopLoss} onChange={handleChange} className="w-full bg-transparent text-danger font-bold text-sm focus:ring-0 border-none p-0" />
             </ConfigInput>
             <ConfigInput label="TP (Pips)">
                 <input type="number" name="takeProfit" value={config.takeProfit} onChange={handleChange} className="w-full bg-transparent text-gaming-accent font-bold text-sm focus:ring-0 border-none p-0" />
             </ConfigInput>
        </div>

        {/* Indicators */}
        <details className="group bg-gaming-800 border border-gaming-700 rounded overflow-hidden">
            <summary className="flex items-center justify-between p-2 cursor-pointer text-xs font-bold text-gaming-400 group-open:text-white hover:bg-gaming-700 select-none">
                <span>TECHNICAL INDICATORS</span>
                <Sliders size={12} />
            </summary>
            <div className="p-2 space-y-2 border-t border-gaming-700 bg-gaming-900/50">
                 <div className="grid grid-cols-3 gap-1">
                    <input type="number" name="rsiPeriod" value={config.indicators.rsiPeriod} onChange={handleIndicatorChange} placeholder="RSI Per" className="bg-gaming-800 border border-gaming-600 rounded px-1 py-1 text-xs text-white text-center" />
                    <input type="number" name="rsiOverbought" value={config.indicators.rsiOverbought} onChange={handleIndicatorChange} className="bg-gaming-800 border border-gaming-600 rounded px-1 py-1 text-xs text-danger text-center" />
                    <input type="number" name="rsiOversold" value={config.indicators.rsiOversold} onChange={handleIndicatorChange} className="bg-gaming-800 border border-gaming-600 rounded px-1 py-1 text-xs text-gaming-accent text-center" />
                 </div>
                 <div className="flex gap-1">
                    <input type="number" name="maPeriod" value={config.indicators.maPeriod} onChange={handleIndicatorChange} className="flex-1 bg-gaming-800 border border-gaming-600 rounded px-1 py-1 text-xs text-white text-center" />
                    <select name="maType" value={config.indicators.maType} onChange={handleIndicatorChange} className="flex-1 bg-gaming-800 border border-gaming-600 rounded px-1 py-1 text-xs text-white">
                        <option value="SMA">SMA</option>
                        <option value="EMA">EMA</option>
                    </select>
                 </div>
            </div>
        </details>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gaming-950 border-t border-gaming-700 shrink-0 space-y-2">
         <div className="flex justify-between text-[10px] text-gaming-500 mb-1 font-bold uppercase tracking-wider">
             <span>Reward Ratio</span>
             <span className="text-white font-mono">1:{(config.takeProfit / config.stopLoss).toFixed(1)}</span>
         </div>
         
         <div className="flex gap-2">
            <button
                type="button"
                onClick={() => onBacktest(config)}
                disabled={isGenerating || formInvalid}
                className="flex-1 bg-gaming-800 hover:bg-gaming-700 text-white font-bold py-3 rounded text-xs border border-gaming-700 uppercase tracking-wide flex items-center justify-center gap-1 disabled:opacity-50 transition-colors"
            >
                <Play size={14} className="text-gaming-accent" /> 
                <span className="mt-0.5">Simulate</span>
            </button>
            <button
                type="button"
                onClick={() => onSubmit(config)}
                disabled={isGenerating || formInvalid}
                className="flex-[2] bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black py-3 rounded text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
                {isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-black rounded-full border-t-transparent"></div> : <><Code size={16} strokeWidth={3} /> EXPORT BOT</>}
            </button>
         </div>
      </div>

    </div>
  );
};

export default StrategyBuilder;