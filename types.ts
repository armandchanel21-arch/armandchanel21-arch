export enum Platform {
  MT4 = 'MetaTrader 4 (MQL4)',
  MT5 = 'MetaTrader 5 (MQL5)',
}

export enum Timeframe {
  M1 = 'M1',
  M5 = 'M5',
  M15 = 'M15',
  M30 = 'M30',
  H1 = 'H1',
  H4 = 'H4',
  D1 = 'D1',
}

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface IndicatorSettings {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  maPeriod: number;
  maType: 'SMA' | 'EMA';
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
}

export interface StrategyConfig {
  id?: string; // Unique ID for management
  name: string;
  category: string;
  platform: Platform;
  symbol: string;
  timeframe: Timeframe;
  lotSize: number;
  stopLoss: number; // in pips
  takeProfit: number; // in pips
  description: string;
  indicators: IndicatorSettings;
  keyFindings?: string[];
  magicNumber?: number;
  slippage?: number;
  maxSpread?: number;
  signal?: SignalType;
  confidence?: number;
}

export interface GeneratedBot {
  code: string;
  explanation: string;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TradeEvent {
  id: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  profit: number; // in currency/pips
  entryIndex: number;
  exitIndex: number;
}

export interface BacktestResult {
  trades: TradeEvent[];
  metrics: {
    totalTrades: number;
    winRate: number;
    netProfit: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  data: Candle[]; // The data used for backtest
  equityCurve: { time: string; balance: number }[];
}

export interface ChatSource {
  title: string;
  uri: string;
  type?: 'web' | 'map';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: ChatSource[];
  isThinking?: boolean;
}