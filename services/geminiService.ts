import { GoogleGenAI, Type } from "@google/genai";
import { StrategyConfig, GeneratedBot, BacktestResult, Candle, TradeEvent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_ID = "gemini-3-pro-preview";
const THINKING_BUDGET = 32768; 

// --- Error Handling Helper ---
const handleGenAIError = (error: any, context: string): never => {
  console.error(`[${context}] Error:`, error);

  let message = "An unexpected error occurred. Please try again.";

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    // Check for common API errors
    if (msg.includes('api key') || msg.includes('403')) {
      message = "Authentication failed. Please check your API Key configuration.";
    } else if (msg.includes('quota') || msg.includes('429')) {
      message = "Usage limit exceeded. The AI model is busy, please wait a moment.";
    } else if (msg.includes('safety') || msg.includes('blocked')) {
      message = "Safety filters triggered. Please refine your request to be more specific to trading.";
    } else if (msg.includes('model not found') || msg.includes('404')) {
      message = "The selected AI model is currently unavailable.";
    } else if (msg.includes('timeout')) {
        message = "The request timed out. Please try again with a simpler configuration.";
    } else if (msg.includes('candidate')) {
        message = "The AI could not generate a valid response. Please try refining your inputs.";
    } else {
        // Pass through specific error messages we might have thrown manually
        message = error.message;
    }
  } else if (typeof error === 'string') {
      message = error;
  }

  throw new Error(message);
};

// --- Helpers ---

// Generate synthetic market data (Random Walk with momentum)
const generateSyntheticData = (symbol: string, periods: number = 150): Candle[] => {
  const data: Candle[] = [];
  let price = symbol.includes('JPY') ? 145.00 : 1.1000;
  const volatility = symbol.includes('JPY') ? 0.05 : 0.0005;
  
  // Create a realistic-looking chart
  for (let i = 0; i < periods; i++) {
    const change = (Math.random() - 0.5) * volatility * 2 + (Math.sin(i / 10) * volatility * 0.5);
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    price = close;
    
    const date = new Date();
    date.setHours(date.getHours() - (periods - i));
    
    data.push({
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
    });
  }
  return data;
};

// Calculate Simple Moving Average
const calculateSMA = (data: Candle[], period: number): (number | null)[] => {
  return data.map((_, idx) => {
    if (idx < period - 1) return null;
    const slice = data.slice(idx - period + 1, idx + 1);
    const sum = slice.reduce((acc, val) => acc + val.close, 0);
    return parseFloat((sum / period).toFixed(5));
  });
};

// Calculate Exponential Moving Average (Candle-based)
const calculateEMA = (data: Candle[], period: number): (number | null)[] => {
  if (data.length < period) return new Array(data.length).fill(null);
  
  const k = 2 / (period + 1);
  const emaArray: (number | null)[] = new Array(data.length).fill(null);
  
  // Initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
      sum += data[i].close;
  }
  emaArray[period - 1] = sum / period;

  // Calculate EMA
  for (let i = period; i < data.length; i++) {
      const prevEma = emaArray[i - 1];
      if (prevEma !== null) {
          const currentPrice = data[i].close;
          emaArray[i] = parseFloat(((currentPrice - prevEma) * k + prevEma).toFixed(5));
      }
  }
  return emaArray;
};

// Generic EMA for raw numbers (used for MACD)
const calculateEMAValues = (values: number[], period: number): (number | null)[] => {
  if (values.length < period) return new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  const emaArray = new Array(values.length).fill(null);
  
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  emaArray[period - 1] = sum / period;
  
  for (let i = period; i < values.length; i++) {
      const prev = emaArray[i - 1];
      if (prev !== null) {
          emaArray[i] = (values[i] - prev) * k + prev;
      }
  }
  return emaArray;
};

// Calculate Relative Strength Index
const calculateRSI = (data: Candle[], period: number): (number | null)[] => {
  if (data.length <= period) return new Array(data.length).fill(null);

  let gains = 0;
  let losses = 0;
  const rsiArray: (number | null)[] = new Array(data.length).fill(null);

  // First Average Gain/Loss
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // First RSI
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiArray[period] = avgLoss === 0 ? 100 : parseFloat((100 - (100 / (1 + rs))).toFixed(2));

  // Subsequent RSI
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
        rsiArray[i] = 100;
    } else {
        rs = avgGain / avgLoss;
        rsiArray[i] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
    }
  }
  return rsiArray;
};

// Calculate MACD
const calculateMACD = (data: Candle[], fast: number, slow: number, sig: number) => {
    const closes = data.map(c => c.close);
    const fastEMA = calculateEMAValues(closes, fast);
    const slowEMA = calculateEMAValues(closes, slow);
    
    const macdLine = fastEMA.map((f, i) => {
        const s = slowEMA[i];
        if (f === null || s === null) return null;
        return parseFloat((f - s).toFixed(5));
    });

    const validIdx = macdLine.findIndex(v => v !== null);
    if (validIdx === -1) return { macd: macdLine, signal: macdLine };
    
    const validMacd = macdLine.slice(validIdx) as number[];
    const signalValid = calculateEMAValues(validMacd, sig);
    
    const padding = new Array(validIdx).fill(null);
    const signalLine = [...padding, ...signalValid];
    
    return { macd: macdLine, signal: signalLine };
};

// --- API Functions ---

export const analyzeChart = async (imageBase64: string): Promise<Partial<StrategyConfig>> => {
  const prompt = `
    You are an unfiltered, expert trading AI agent. Your goal is to extract the MAXIMUM profit potential from the provided chart.
    
    ANALYZE the image for:
    1. Exact Market Structure (Trends, Liquidity Sweeps, Order Blocks).
    2. Volatility Profile (for precise Stop Loss/Take Profit in Pips).
    3. Optimal Indicator Settings: Do NOT use defaults. Calculate the best RSI/MACD/MA periods that fit *this specific* price action.
    
    OUTPUT a complete JSON strategy configuration.
    - Category: The specific trading style (e.g. "Scalping", "Swing", "Mean Reversion").
    - Risk: Aggressive but calculated SL/TP in Pips.
    - Indicators: Exact tuned parameters.
    - Description: A raw, technical logic breakdown for a trading bot.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: "image/png", 
              data: imageBase64 
            } 
          },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: THINKING_BUDGET },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            stopLoss: { type: Type.NUMBER, description: "Optimal Stop Loss in Pips" },
            takeProfit: { type: Type.NUMBER, description: "Optimal Take Profit in Pips" },
            description: { type: Type.STRING, description: "Detailed strategy logic description" },
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
    
    if (response.text) {
        return JSON.parse(response.text) as Partial<StrategyConfig>;
    }
    throw new Error("No analysis generated from the image.");

  } catch (error) {
    handleGenAIError(error, "Chart Analysis");
  }
};

export const generateTradingBot = async (config: StrategyConfig): Promise<GeneratedBot> => {
  const prompt = `
    You are an expert algorithmic trading developer specializing in MQL4 and MQL5.
    
    Create a complete, error-free, compile-ready trading bot (Expert Advisor) based on the following specifications:
    
    - **Platform**: ${config.platform}
    - **Bot Name**: ${config.name}
    - **Strategy Type**: ${config.category}
    - **Target Symbol**: ${config.symbol} (Default if not specific)
    - **Timeframe**: ${config.timeframe}
    - **Risk Management**:
      - Initial Lot Size: ${config.lotSize}
      - Stop Loss: ${config.stopLoss} pips (Standard Pips)
      - Take Profit: ${config.takeProfit} pips (Standard Pips)
    
    **Technical Indicator Parameters (MUST be defined as 'input' or 'extern' variables)**:
    - RSI Period: ${config.indicators.rsiPeriod} (Levels: ${config.indicators.rsiOversold}/${config.indicators.rsiOverbought})
    - Moving Average: ${config.indicators.maPeriod} (${config.indicators.maType})
    - MACD: ${config.indicators.macdFast} (Fast), ${config.indicators.macdSlow} (Slow), ${config.indicators.macdSignal} (Signal)
    
    **Strategy Logic**:
    ${config.description}
    
    **Requirements**:
    1. The code must be complete with no placeholders.
    2. Include all necessary imports, input variables (extern/input), and the main event loop (OnTick).
    3. Implement robust error checking for order execution.
    4. Implement logic to calculate pip values correctly for the symbol (handle 3/5 digit brokers). Ensure Stop Loss and Take Profit inputs are treated as Pips and converted to Points internally (Pip * 10 for 5-digit brokers).
    5. Add comments explaining the logic.
    6. Return the response in a structured JSON format containing the source code and a brief explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: THINKING_BUDGET },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: {
              type: Type.STRING,
              description: "The full source code of the Expert Advisor (MQL4/MQL5).",
            },
            explanation: {
              type: Type.STRING,
              description: "A brief summary of how the bot works and any specific setup instructions.",
            },
          },
          required: ["code", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    if (!result.code) {
      throw new Error("Failed to generate valid code structure.");
    }

    return result as GeneratedBot;

  } catch (error) {
    handleGenAIError(error, "Bot Generation");
  }
};

export const runBacktestSimulation = async (config: StrategyConfig): Promise<BacktestResult> => {
  // 1. Generate Data (More data for valid indicators)
  const totalCandles = 150;
  const analysisWindow = 60;
  const candles = generateSyntheticData(config.symbol, totalCandles); 

  // 2. Calculate Indicators using updated config
  const rsiValues = calculateRSI(candles, config.indicators.rsiPeriod);
  const maValues = config.indicators.maType === 'SMA' 
      ? calculateSMA(candles, config.indicators.maPeriod) 
      : calculateEMA(candles, config.indicators.maPeriod);
  const macdValues = calculateMACD(candles, config.indicators.macdFast, config.indicators.macdSlow, config.indicators.macdSignal);

  // 3. Prepare data subset for AI (keeping it concise but informative)
  const startIndex = Math.max(0, candles.length - analysisWindow);
  const visibleCandles = candles.slice(startIndex);
  
  const simplifiedData = visibleCandles.map((c, i) => {
      const globalIndex = startIndex + i;
      const rsi = rsiValues[globalIndex] !== null ? `RSI:${rsiValues[globalIndex]}` : 'RSI:N/A';
      const ma = maValues[globalIndex] !== null ? `MA:${maValues[globalIndex]}` : 'MA:N/A';
      
      const mVal = macdValues.macd[globalIndex];
      const sVal = macdValues.signal[globalIndex];
      const macdStr = (mVal !== null && sVal !== null) 
        ? `MACD:${mVal} Sig:${sVal}` 
        : 'MACD:N/A';

      return `Idx:${i} T:${c.time} Close:${c.close} High:${c.high} Low:${c.low} ${rsi} ${ma} ${macdStr}`;
  }).join('\n');

  // 4. Ask AI to Simulate Trades with explicit parameters
  const prompt = `
    Act as a high-precision trading backtesting engine.
    
    **Strategy**: ${config.description}
    
    **Risk Settings**: 
    - TP: ${config.takeProfit} pips
    - SL: ${config.stopLoss} pips
    
    **Indicator Parameters**: 
    - RSI Period: ${config.indicators.rsiPeriod}
    - MA: ${config.indicators.maPeriod} (${config.indicators.maType})
    - MACD: ${config.indicators.macdFast}/${config.indicators.macdSlow}/${config.indicators.macdSignal}
    
    **IMPORTANT**: Use the above Indicator Parameters and Risk Settings strictly, even if they conflict with the Strategy text.
    
    **Market Data (Last ${analysisWindow} periods with pre-calculated indicators)**:
    ${simplifiedData}
    
    **Task**:
    Simulate the execution of this strategy on the provided data points.
    1. Identify entry points (Buy/Sell) based on the logic and the pre-calculated indicator values.
    2. Determine exit points based on TP/SL or Strategy Exit logic.
    3. Calculate profit/loss in pips.
    
    **Output JSON**:
    Return a JSON object with:
    - "trades": Array of trades. Each trade must have:
      - "type": "BUY" or "SELL"
      - "entryIndex": integer (index from the provided list, 0 to ${analysisWindow - 1})
      - "exitIndex": integer (index from the provided list, must be > entryIndex)
      - "entryPrice": number
      - "exitPrice": number
      - "profit": number (positive for win, negative for loss)
    - "metrics": Object with "winRate" (0-100), "netProfit", "profitFactor", "maxDrawdown".
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8192 }, // Lower budget for faster simulation
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                trades: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ["BUY", "SELL"] },
                            entryIndex: { type: Type.INTEGER },
                            exitIndex: { type: Type.INTEGER },
                            entryPrice: { type: Type.NUMBER },
                            exitPrice: { type: Type.NUMBER },
                            profit: { type: Type.NUMBER }
                        }
                    }
                },
                metrics: {
                    type: Type.OBJECT,
                    properties: {
                        winRate: { type: Type.NUMBER },
                        netProfit: { type: Type.NUMBER },
                        profitFactor: { type: Type.NUMBER },
                        maxDrawdown: { type: Type.NUMBER }
                    }
                }
            }
        }
      },
    });

    const simulation = JSON.parse(response.text || "{}");
    
    // 5. Construct Equity Curve
    let balance = 10000;
    const equityCurve = [{ time: 'Start', balance }];
    
    // Map trades to the timeline roughly
    const trades: TradeEvent[] = (simulation.trades || []).map((t: any, i: number) => {
       balance += t.profit * 10; // Simplified lot sizing effect
       const exitTime = visibleCandles[t.exitIndex]?.time || 'End';
       equityCurve.push({ time: exitTime, balance });
       return { ...t, id: `trade-${i}` };
    });

    // Ensure metrics exist
    const metrics = simulation.metrics || {
        winRate: 0, netProfit: 0, profitFactor: 0, maxDrawdown: 0, totalTrades: 0
    };
    metrics.totalTrades = trades.length;

    return {
      trades,
      metrics,
      data: visibleCandles,
      equityCurve
    };

  } catch (error) {
    handleGenAIError(error, "Backtest Simulation");
  }
};