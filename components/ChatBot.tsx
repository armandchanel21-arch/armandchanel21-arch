import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Search, BrainCircuit, ExternalLink, Globe, User, Bot, Loader2 } from 'lucide-react';
import { chatWithMentor, searchMarketData } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatBotProps {
    embedded?: boolean; // If true, renders full height/width without floating logic
}

const ChatBot: React.FC<ChatBotProps> = ({ embedded = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'mentor' | 'analyst'>('mentor');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Trading Assistant. Select 'Mentor' for deep strategy advice or 'Analyst' for real-time market news.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      let sources: { uri: string; title: string }[] | undefined;

      if (mode === 'mentor') {
        const history = messages
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, text: m.text }));
        
        responseText = await chatWithMentor(history, userMsg.text);
      } else {
        const result = await searchMarketData(userMsg.text);
        responseText = result.text;
        sources = result.sources;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        sources: sources,
        isThinking: mode === 'mentor'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Content Logic
  const ChatContent = () => (
    <div className={`flex flex-col h-full bg-gaming-800 ${embedded ? '' : 'border border-gaming-700 rounded-xl shadow-2xl overflow-hidden'}`}>
        {/* Header */}
        <div className="p-3 border-b border-gaming-700 bg-gaming-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bot size={18} className="text-gaming-accent" />
            <span>AI Assistant</span>
          </div>
          
          <div className="flex bg-gaming-950 rounded p-1 border border-gaming-700">
             <button 
               onClick={() => setMode('mentor')}
               className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${mode === 'mentor' ? 'bg-gaming-700 text-white' : 'text-gaming-500 hover:text-gray-300'}`}
             >
               <BrainCircuit size={12} />
               Mentor
             </button>
             <button 
               onClick={() => setMode('analyst')}
               className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${mode === 'analyst' ? 'bg-gaming-700 text-white' : 'text-gaming-500 hover:text-gray-300'}`}
             >
               <Globe size={12} />
               Analyst
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0d1117]">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gaming-600 text-gray-200' : 'bg-gaming-accent text-white'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`max-w-[80%] space-y-2`}>
                        <div className={`p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user' 
                              ? 'bg-gaming-700 text-white rounded-tr-none' 
                              : 'bg-gaming-800 text-gray-300 border border-gaming-700 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                        
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="bg-gaming-900/50 p-2 rounded border border-gaming-700/50 text-xs">
                                <div className="text-gaming-500 font-bold mb-1 flex items-center gap-1">
                                    <Search size={10} /> Sources
                                </div>
                                <div className="space-y-1">
                                    {msg.sources.map((source, idx) => (
                                        <a 
                                          key={idx} 
                                          href={source.uri} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 truncate hover:underline"
                                        >
                                            <ExternalLink size={10} />
                                            <span className="truncate">{source.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {msg.isThinking && (
                             <div className="text-[10px] text-gaming-500 flex items-center gap-1 opacity-50">
                                <BrainCircuit size={10} />
                                <span>Generated with Gemini Thinking</span>
                             </div>
                        )}
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gaming-accent text-white flex items-center justify-center shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="bg-gaming-800 border border-gaming-700 p-3 rounded-xl rounded-tl-none text-gray-400 text-sm flex items-center gap-2">
                         {mode === 'mentor' ? (
                            <>
                                <Loader2 size={14} className="animate-spin text-purple-400" />
                                <span className="animate-pulse">Thinking deeply...</span>
                            </>
                        ) : (
                            <>
                                <Search size={14} className="animate-pulse text-blue-400" />
                                <span className="animate-pulse">Searching live market data...</span>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-gaming-900 border-t border-gaming-700 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'mentor' ? "Ask about strategy..." : "Search live market news..."}
            className="flex-1 bg-gaming-950 border border-gaming-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gaming-500 focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-gaming-accent hover:bg-green-600 disabled:bg-gaming-700 disabled:text-gaming-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
    </div>
  );

  if (embedded) {
      return <div className="h-full w-full"><ChatContent /></div>;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-gaming-700 text-gray-400 rotate-90' : 'bg-gaming-accent text-white hover:bg-green-600'}`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <div 
        className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 h-[600px]' : 'opacity-0 scale-90 h-0 pointer-events-none'
        }`}
      >
        <ChatContent />
      </div>
    </>
  );
};

export default ChatBot;