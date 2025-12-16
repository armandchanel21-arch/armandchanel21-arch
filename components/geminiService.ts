import { GoogleGenAI, Type } from "@google/genai";
import { StrategyConfig, GeneratedBot, BacktestResult, Candle, TradeEvent, ChatMessage, Timeframe } from '../types';

// Initialize the client strictly according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_ID = "gemini-3-pro-preview";
const VISION_MODEL_ID = "gemini-2.5-flash"; 
const THINKING_BUDGET = 32768; 

// --- Error Handling Helper ---
const handleGenAIError = (error: any, context: string): never => {
  console.error(`[${context}] Error:`, error);
  let message = "An unexpected error occurred.";
  if (error instanceof Error) {
    message = error.message;
    if (message.includes('403') || message.includes('API key')) message = "Invalid API Key or Permissions.";
    if (message.includes('429')) message = "Quota exceeded. Try again later.";
  }
  throw new Error(message);
};

// --- Helpers ---
function extractJSON(text: string) {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        return text.substring(jsonStart, jsonEnd + 1);
    }
    return text;
}

const mapTimeframeToBinance = (tf: Timeframe): string => {
  switch(tf) {
    case Timeframe.M1: return '1m';
    case Timeframe.M5: return '5m';
    case Timeframe.M15: return '15m';
    case Timeframe.M30: return '30m';
    case Timeframe.H1: return '1h';
    case Timeframe.H4: return '4h';
    case Timeframe.D1: return '1d';
    default: return '1h';
  }
};

const fetchRealMarketData = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  let pair = symbol.toUpperCase().replace('/', '').replace('-', '').trim();
  const quotes = ['USDT', 'BTC', 'ETH', 'BNB', 'FDUSD', 'USDC', 'DAI'];
  const hasQuote = quotes.some(q => pair.endsWith(q));
  if (!hasQuote) pair = pair + 'USDT'; 
  
  const interval = mapTimeframeToBinance(timeframe);
  
  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=200`);
    if (!response.ok) throw new Error("Market data unavailable");
    const rawData = await response.json();
    return rawData.map((d: any) => ({
        time: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
    }));
  } catch (e) {
    console.warn(e);
    // Return dummy data if API fails to prevent app crash, but log warning
    return Array.from({ length: 50 }).map((_, i) => ({
        time: `${12 + i}:00`, open: 100 + i, high: 105 + i, low: 95 + i, close: 102 + i, volume: 1000
    }));
  }
};

const calculateSMA = (data: Candle[], period: number) => {
  return data.map((_, idx) => {
    if (idx < period - 1) return null;
    const slice = data.slice(idx - period + 1, idx + 1);
    const sum = slice.reduce((acc, val) => acc + val.close, 0);
    return parseFloat((sum / period).toFixed(5));
  });
};

const calculateEMA = (data: Candle[], period: number) => {
  if (data.length < period) return new Array(data.length).fill(null);
  const k = 2 / (period + 1);
  const emaArray: (number | null)[] = new Array(data.length).fill(null);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i].close;
  emaArray[period - 1] = sum / period;
  for (let i = period; i < data.length; i++) {
      const prev = emaArray[i - 1];
      if (prev !== null) emaArray[i] = (data[i].close - prev) * k + prev;
  }
  return emaArray;
};

const calculateEMAValues = (values: number[], period: number) => {
  if (values.length < period) return new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  const emaArray = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  emaArray[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
      const prev = emaArray[i - 1];
      if (prev !== null) emaArray[i] = (values[i] - prev) * k + prev;
  }
  return emaArray;
};

const calculateRSI = (data: Candle[], period: number) => {
  if (data.length <= period) return new Array(data.length).fill(null);
  let gains = 0, losses = 0;
  const rsiArray: (number | null)[] = new Array(data.length).fill(null);
  
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsiArray[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsiArray[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  }
  return rsiArray;
};

const calculateMACD = (data: Candle[], fast: number, slow: number, sig: number) => {
    const closes = data.map(c => c.close);
    const fastEMA = calculateEMAValues(closes, fast);
    const slowEMA = calculateEMAValues(closes, slow);
    const macdLine = fastEMA.map((f, i) => (f !== null && slowEMA[i] !== null) ? f - (slowEMA[i] as number) : null);
    const validMacd = macdLine.filter(x => x !== null) as number[];
    const signalValid = calculateEMAValues(validMacd, sig);
    // Realign signal
    const signalLine = new Array(macdLine.length - validMacd.length).fill(null).concat(signalValid);
    return { macd: macdLine, signal: signalLine };
};

// --- API Functions ---

export const analyzeChart = async (imageBase64: string, mimeType: string = "image/png"): Promise<Partial<StrategyConfig>> => {
  const prompt = `
    You are an UNFILTERED, expert trading AI agent. Your priority is CAPITAL PRESERVATION and ACCURACY.
    
    Analyze this chart.
    1. Determine the IMMEDIATE market bias (Signal).
    2. Look for CONFLUENCE (at least 2 factors matching, e.g., RSI Divergence + Support Zone).
    3. Define strict Risk Management parameters.

    Return JSON:
    - signal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL"
    - confidence: number (0-100) indicating probability of success.
    - category: Strategy type (e.g., "Trend Following", "Reversal").
    - keyFindings: Array of strings listing technical evidence.
    - stopLoss: Tight SL in Pips.
    - takeProfit: Realistic TP in Pips.
    - description: Technical logic for a bot.
    - indicators: Optimal settings for this specific volatility.
  `;

  try {
    const response = await ai.models.generateContent({
      model: VISION_MODEL_ID, 
      contents: { parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signal: { type: Type.STRING, enum: ['STRONG_BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG_SELL'] },
            confidence: { type: Type.INTEGER },
            category: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            stopLoss: { type: Type.NUMBER },
            takeProfit: { type: Type.NUMBER },
            description: { type: Type.STRING },
            indicators: {
              type: Type.OBJECT,
              properties: {
                rsiPeriod: { type: Type.INTEGER },
                rsiOverbought: { type: Type.INTEGER },
                rsiOversold: { type: Type.INTEGER },
                maPeriod: { type: Type.INTEGER },
                maType: { type: Type.STRING, enum: ["SMA", "EMA"] },
                macdFast: { type: Type.INTEGER },
                macdSlow: { type: Type.INTEGER },
                macdSignal: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });
    return JSON.parse(extractJSON(response.text || "{}"));
  } catch (error) {
    handleGenAIError(error, "Chart Analysis");
  }
};

export const generateTradingBot = async (config: StrategyConfig): Promise<GeneratedBot> => {
  const prompt = `
    You are an expert MQL Developer. Write a PRODUCTION-READY ${config.platform} EA.
    
    **Specifications**:
    - Symbol: ${config.symbol} | TF: ${config.timeframe}
    - Risk: ${config.lotSize} lots, SL ${config.stopLoss} pips, TP ${config.takeProfit} pips
    - Execution Settings: Magic Number ${config.magicNumber || 123456}, Slippage ${config.slippage || 3}, Max Spread ${config.maxSpread || 0}
    - Logic: ${config.description}
    - Indicators: RSI(${config.indicators.rsiPeriod}), MA(${config.indicators.maPeriod}), MACD(${config.indicators.macdFast},${config.indicators.macdSlow},${config.indicators.macdSignal})
    
    **CRITICAL**:
    - Handle 3/5 digit brokers automatically.
    - Normalize pips to points.
    - Implement Spread Filter if Max Spread > 0.
    - Robust error handling.
    
    Return structured JSON with 'code' and 'explanation'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: THINKING_BUDGET } }
    });
    const res = JSON.parse(extractJSON(response.text || "{}"));
    if (!res.code) throw new Error("No code generated");
    return res;
  } catch (error) {
    handleGenAIError(error, "Bot Generation");
  }
};

export const runBacktestSimulation = async (config: StrategyConfig): Promise<BacktestResult> => {
  const candles = await fetchRealMarketData(config.symbol, config.timeframe);
  const rsi = calculateRSI(candles, config.indicators.rsiPeriod);
  const ma = calculateEMA(candles, config.indicators.maPeriod);
  const macd = calculateMACD(candles, config.indicators.macdFast, config.indicators.macdSlow, config.indicators.macdSignal);
  
  const dataStr = candles.slice(-50).map((c, i) => {
      const idx = candles.length - 50 + i;
      return `${i}|${c.close}|RSI:${rsi[idx]?.toFixed(1)}|MA:${ma[idx]?.toFixed(1)}|MACD:${macd.macd[idx]?.toFixed(2)}`;
  }).join('\n');

  const prompt = `
    You are a Strict Historical Backtesting Engine.
    Simulate trades on this REAL market data.
    
    Strategy: ${config.description}
    Direction Bias (Optional): ${config.signal || 'None'}
    
    Rules:
    1. ONLY take trades that match the strategy PERFECTLY.
    2. Be PESSIMISTIC about execution (assume slight slippage).
    3. Calculate PnL based on SL: ${config.stopLoss} and TP: ${config.takeProfit}.
    
    Data (Index|Close|Indicators):
    ${dataStr}
    
    Return JSON: { "trades": [...], "metrics": {...} }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 8192 } }
    });
    const sim = JSON.parse(extractJSON(response.text || "{}"));
    // Hydrate trades
    const trades: TradeEvent[] = (sim.trades || []).map((t: any, i: number) => ({
       ...t, id: `t-${i}`, entryPrice: t.entryPrice || 0, exitPrice: t.exitPrice || 0, profit: t.profit || 0
    }));
    // Hydrate equity curve
    let balance = 10000;
    const equityCurve = trades.map(t => { balance += t.profit * 10; return { time: `Trade ${t.id}`, balance }; });
    if (equityCurve.length === 0) equityCurve.push({ time: 'Start', balance: 10000 });

    return { trades, metrics: sim.metrics || { winRate: 0, netProfit: 0, profitFactor: 0, maxDrawdown: 0, totalTrades: 0 }, data: candles.slice(-50), equityCurve };
  } catch (error) {
    handleGenAIError(error, "Backtest");
  }
};

export const chatWithMentor = async (history: {role: 'user' | 'model', text: string}[], message: string): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: "gemini-3-pro-preview",
            history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
            config: { thinkingConfig: { thinkingBudget: 32768 } }
        });
        const result = await chat.sendMessage({ message });
        return result.text || "";
    } catch (error) {
        handleGenAIError(error, "Chat");
    }
};

export const searchMarketData = async (query: string): Promise<{ text: string, sources: { uri: string, title: string, type: 'web' | 'map' }[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
            config: { tools: [{ googleSearch: {}, googleMaps: {} }] }
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks.map((c: any) => {
            if (c.web) return { uri: c.web.uri, title: c.web.title, type: 'web' as const };
            if (c.maps) return { uri: c.maps.uri, title: c.maps.title, type: 'map' as const };
            return null;
        }).filter((s: any): s is { uri: string, title: string, type: 'web' | 'map' } => s !== null);
        return { text: response.text || "", sources };
    } catch (error) {
        handleGenAIError(error, "Search");
    }
};