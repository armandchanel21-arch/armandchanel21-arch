import React, { useState } from 'react';
import { StrategyConfig, GeneratedBot, Platform } from '../types';
import { generateTradingBot } from '../services/geminiService';
import CodeViewer from './CodeViewer';
import { Code, Download, Cpu, PlayCircle, Loader2, ArrowRight } from 'lucide-react';

interface BotGeneratorProps {
  config: StrategyConfig | null;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const BotGenerator: React.FC<BotGeneratorProps> = ({ config, onError, onSuccess }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bot, setBot] = useState<GeneratedBot | null>(null);

  const handleGenerate = async () => {
    if (!config) {
        onError("No strategy configuration loaded. Please build a strategy first.");
        return;
    }
    setIsGenerating(true);
    setBot(null);
    try {
        const result = await generateTradingBot(config);
        setBot(result);
        onSuccess("Bot code generated successfully!");
    } catch (e: any) {
        onError(e.message || "Generation failed");
    } finally {
        setIsGenerating(false);
    }
  };

  if (!config) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gaming-500">
              <Cpu size={64} className="mb-4 opacity-20" />
              <h2 className="text-xl font-bold text-white mb-2">No Strategy Loaded</h2>
              <p className="max-w-md">Please go to the <strong className="text-gaming-accent">Strategy Builder</strong> to design your logic before generating code.</p>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 bg-gaming-950 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Code className="text-gaming-accent" /> Bot Generator
                </h1>
                <div className="text-xs text-gaming-500 font-mono mt-1">
                    Target: <span className="text-white">{config.platform}</span> | Strategy: <span className="text-white">{config.name}</span>
                </div>
            </div>
            
            <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black rounded-xl text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Cpu />}
                {isGenerating ? 'Coding Agent Active...' : 'Generate Source Code'}
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-black border border-gaming-800 rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
            {bot ? (
                <CodeViewer 
                    bot={bot} 
                    botName={config.name} 
                    ext={config.platform === Platform.MT4 ? 'mq4' : 'mq5'} 
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gaming-900/50 backdrop-blur-sm">
                    {isGenerating ? (
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-gaming-800 border-t-gaming-accent rounded-full animate-spin mx-auto mb-6"></div>
                            <h3 className="text-xl font-bold text-white mb-2">Writing MQL Code...</h3>
                            <p className="text-sm text-gaming-500">Optimizing logic for {config.symbol} on {config.timeframe}</p>
                        </div>
                    ) : (
                        <div className="text-center p-8 max-w-lg">
                            <div className="w-20 h-20 bg-gaming-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-gaming-700">
                                <Code size={40} className="text-gaming-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Code</h3>
                            <p className="text-sm text-gaming-500 mb-6">
                                The AI agent will translate your natural language strategy into a compile-ready Expert Advisor.
                            </p>
                            <button onClick={handleGenerate} className="text-gaming-accent hover:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 mx-auto hover:underline">
                                Start Generation <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default BotGenerator;