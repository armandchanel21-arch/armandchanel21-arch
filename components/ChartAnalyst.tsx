import React, { useState, useRef } from 'react';
import { Upload, Zap, Image as ImageIcon, Loader2, Check, ScanLine, ArrowUpCircle, ArrowDownCircle, AlertOctagon } from 'lucide-react';
import { analyzeChart } from '../services/geminiService';
import { StrategyConfig } from '../types';

interface ChartAnalystProps {
  onAnalysisComplete: (config: Partial<StrategyConfig>) => void;
  onError: (msg: string) => void;
}

const ChartAnalyst: React.FC<ChartAnalystProps> = ({ onAnalysisComplete, onError }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png"); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Partial<StrategyConfig> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
          onError("Image size too large. Please use an image under 4MB.");
          return;
      }
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setImagePreview(res);
        setRawImage(res.split(',')[1]);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!rawImage) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeChart(rawImage, mimeType);
      setResult(analysis);
      onAnalysisComplete(analysis); 
    } catch (err: any) {
      console.error("Analysis Error:", err);
      onError(err.message || "Analysis failed. Please try a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const SignalBadge = ({ signal, confidence }: { signal: string, confidence: number }) => {
      let color = 'text-gray-400';
      let bg = 'bg-gray-900';
      let icon = <AlertOctagon />;
      
      if (signal.includes('BUY')) {
          color = 'text-gaming-accent';
          bg = 'bg-gaming-accent/10 border-gaming-accent';
          icon = <ArrowUpCircle size={32} className="animate-bounce" />;
      } else if (signal.includes('SELL')) {
          color = 'text-danger';
          bg = 'bg-danger/10 border-danger';
          icon = <ArrowDownCircle size={32} className="animate-bounce" />;
      }

      return (
          <div className={`p-4 rounded-xl border-2 ${bg} flex items-center justify-between mb-4`}>
              <div className="flex items-center gap-3">
                  <div className={color}>{icon}</div>
                  <div>
                      <div className={`text-lg font-black ${color}`}>{signal.replace('_', ' ')}</div>
                      <div className="text-xs text-gaming-500 font-bold uppercase tracking-wider">AI Signal Confidence</div>
                  </div>
              </div>
              <div className="text-right">
                  <div className="text-2xl font-black text-white">{confidence}%</div>
                  <div className="text-[10px] text-gaming-500">Probability</div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-gaming-950 p-6 overflow-y-auto custom-scrollbar">
       <div className="max-w-4xl mx-auto w-full space-y-8">
           
           <div className="text-center">
               <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">AI Chart Analyst</h1>
               <p className="text-gaming-500 text-sm">Upload a chart. Our Vision AI detects structure, risk parameters, and gives a <strong>Buy/Sell Signal</strong>.</p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Upload Area */}
               <div className="space-y-4">
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${imagePreview ? 'border-gaming-accent/50' : 'border-gaming-700 hover:border-gaming-500 hover:bg-gaming-900/30'}`}
                   >
                       {imagePreview ? (
                           <img src={imagePreview} alt="Chart" className="absolute inset-0 w-full h-full object-contain bg-black/50" />
                       ) : (
                           <div className="text-center p-6">
                               <div className="w-16 h-16 bg-gaming-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gaming-500 group-hover:text-gaming-accent group-hover:scale-110 transition-all">
                                   <Upload size={32} />
                               </div>
                               <h3 className="text-white font-bold text-sm">Click to Upload Chart</h3>
                               <p className="text-xs text-gaming-500 mt-2">Supports PNG, JPG (Max 4MB)</p>
                           </div>
                       )}
                       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   </div>

                   {imagePreview && (
                       <button 
                         onClick={runAnalysis}
                         disabled={isAnalyzing}
                         className="w-full py-4 bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black rounded-xl text-sm uppercase tracking-widest shadow-lg hover:shadow-gaming-accent/20 transition-all flex items-center justify-center gap-2"
                       >
                           {isAnalyzing ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" />}
                           {isAnalyzing ? 'Analyzing Market Structure...' : 'Run Vision Analysis'}
                       </button>
                   )}
               </div>

               {/* Results Area */}
               <div className="bg-gaming-900 border border-gaming-800 rounded-2xl p-6 relative overflow-hidden min-h-[400px]">
                   {!result ? (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-gaming-700">
                           {isAnalyzing ? (
                               <div className="text-center animate-pulse">
                                   <ScanLine size={64} className="mb-4 text-gaming-accent mx-auto" />
                                   <p className="text-xs font-bold uppercase tracking-widest text-white">Scanning Price Action...</p>
                                   <p className="text-[10px] text-gaming-500 mt-2">Calculating Risk & Signal...</p>
                               </div>
                           ) : (
                               <>
                                   <ImageIcon size={64} className="mb-4 opacity-20" />
                                   <p className="text-xs font-bold uppercase tracking-widest">No Analysis Data</p>
                               </>
                           )}
                       </div>
                   ) : (
                       <div className="space-y-6 animate-fade-in relative z-10">
                           <div className="flex items-center gap-2 text-gaming-accent border-b border-gaming-800 pb-4">
                               <CheckCircleIcon />
                               <span className="font-bold text-lg">Analysis Complete</span>
                           </div>

                           {/* Signal Badge */}
                           {result.signal && result.confidence && (
                               <SignalBadge signal={result.signal} confidence={result.confidence} />
                           )}

                           {/* Market Structure Findings */}
                           {result.keyFindings && result.keyFindings.length > 0 && (
                               <div className="bg-black/40 border border-gaming-700 rounded-xl p-4">
                                   <label className="text-[10px] font-bold text-gaming-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                       <ScanLine size={12} className="text-gaming-accent" /> Key Findings
                                   </label>
                                   <ul className="space-y-2">
                                       {result.keyFindings.map((finding, i) => (
                                           <li key={i} className="flex items-start gap-2.5 text-sm text-gray-200">
                                               <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gaming-accent shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0"></div>
                                               <span>{finding}</span>
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           )}

                           <div className="grid grid-cols-2 gap-4">
                               <div className="bg-gaming-800 p-3 rounded-lg">
                                   <div className="text-[10px] text-gaming-500 uppercase font-bold">Rec. Stop Loss</div>
                                   <div className="text-danger font-mono font-bold text-lg">{result.stopLoss} Pips</div>
                               </div>
                               <div className="bg-gaming-800 p-3 rounded-lg">
                                   <div className="text-[10px] text-gaming-500 uppercase font-bold">Rec. Take Profit</div>
                                   <div className="text-gaming-accent font-mono font-bold text-lg">{result.takeProfit} Pips</div>
                               </div>
                           </div>
                           
                           <div className="pt-4 border-t border-gaming-800 text-center">
                               <p className="text-xs text-gaming-500 mb-2">Strategy parameters copied to builder.</p>
                           </div>
                       </div>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
};

const CheckCircleIcon = () => (
    <div className="p-1 bg-gaming-accent/20 rounded-full">
        <Check size={16} />
    </div>
);

export default ChartAnalyst;