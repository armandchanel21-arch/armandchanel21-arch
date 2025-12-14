import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GeneratedBot } from '../types';
import { Copy, Download, Check, FileCode } from 'lucide-react';

interface CodeViewerProps {
  bot: GeneratedBot;
  botName: string;
  ext: string;
}

// Minimal syntax highlighting logic reuse
const KEYWORDS = ["input", "extern", "void", "int", "double", "string", "bool", "return", "if", "else", "for", "while", "#property", "#include", "class", "new", "delete"];
const BUILTIN_FUNCTIONS = ["OrderSend", "OrderClose", "Symbol", "Period", "Ask", "Bid", "iRSI", "iMA", "iMACD", "Print", "Alert", "OnTick", "OnInit", "OnDeinit"];

const Token: React.FC<{ type: string; children?: React.ReactNode }> = ({ type, children }) => {
  let color = "text-[#d1d4dc]";
  switch (type) {
    case "comment": color = "text-[#6a7185] italic"; break;
    case "string": color = "text-[#c3e88d]"; break;
    case "keyword": color = "text-[#c792ea]"; break; // Purple
    case "function": color = "text-[#82aaff]"; break; // Blue
    case "number": color = "text-[#f78c6c]"; break; // Orange
    default: color = "text-[#d1d4dc]";
  }
  return <span className={color}>{children}</span>;
};

const highlightMQL = (code: string) => {
  const tokens: { type: string; content: string }[] = [];
  const regex = /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|\b(\d+\.?\d*)\b|([{}()[\];,])|(\b[a-zA-Z_]\w*\b)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", content: code.slice(lastIndex, match.index) });
    const [fullMatch, comment, string, number, operator, identifier] = match;
    if (comment) tokens.push({ type: "comment", content: comment });
    else if (string) tokens.push({ type: "string", content: string });
    else if (number) tokens.push({ type: "number", content: number });
    else if (identifier) {
      if (KEYWORDS.includes(identifier)) tokens.push({ type: "keyword", content: identifier });
      else if (BUILTIN_FUNCTIONS.includes(identifier)) tokens.push({ type: "function", content: identifier });
      else tokens.push({ type: "text", content: identifier });
    } else tokens.push({ type: "text", content: fullMatch });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < code.length) tokens.push({ type: "text", content: code.slice(lastIndex) });
  return tokens;
};

const CodeViewer: React.FC<CodeViewerProps> = ({ bot, botName, ext }) => {
  const [code, setCode] = useState(bot.code);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => setCode(bot.code), [bot]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${botName}.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const highlightedTokens = useMemo(() => highlightMQL(code), [code]);

  return (
    <div className="flex h-full flex-col font-mono text-sm">
      <div className="flex border-b border-trade-700 bg-trade-800">
          <div className="px-4 py-2 border-r border-trade-700 bg-[#0d1117] text-white flex items-center gap-2 text-xs border-t-2 border-t-trade-accent">
              <FileCode size={12} className="text-trade-accent" />
              {botName}.{ext}
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-1 px-2">
              <button onClick={handleCopy} className="p-1.5 text-trade-500 hover:text-white transition-colors" title="Copy">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
              <button onClick={handleDownload} className="p-1.5 text-trade-500 hover:text-white transition-colors" title="Download">
                  <Download size={14} />
              </button>
          </div>
      </div>

      <div className="relative flex-1 bg-[#0d1117] overflow-hidden">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0d1117] border-r border-trade-700 z-10 flex flex-col items-end py-4 pr-2 text-[#4b5563] text-xs leading-5 select-none overflow-hidden">
            {code.split('\n').map((_, i) => <div key={i} className="h-5">{i + 1}</div>)}
        </div>

        {/* Code Content */}
        <div className="absolute inset-0 pl-10 pt-4 overflow-auto custom-scrollbar">
            <pre className="p-4 pt-0 font-mono text-xs leading-5 whitespace-pre tab-4">
                {highlightedTokens.map((t, i) => <Token key={i} type={t.type}>{t.content}</Token>)}
            </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;