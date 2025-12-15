import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

const MarketTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
        try {
            // Fetch top assets: BTC, ETH, SOL, BNB, XRP from Binance
            const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];
            const promises = symbols.map(s => 
                fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`)
                .then(r => r.json())
                .catch(() => null)
            );
            
            const results = await Promise.all(promises);
            
            const tickerItems = results
                .filter(data => data && data.symbol)
                .map((data: any) => ({
                    symbol: data.symbol.replace('USDT', '/USD'),
                    price: parseFloat(data.lastPrice),
                    change: parseFloat(data.priceChangePercent)
                }));
            
            setItems(tickerItems);
        } catch (e) {
            console.error("Ticker fetch error", e);
        }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="h-8 bg-gaming-950 border-t border-gaming-800 flex items-center px-4 overflow-hidden select-none shrink-0 z-40 relative">
        <div className="flex gap-8 w-full overflow-hidden animate-marquee">
            {items.map((item) => {
                const parts = item.price.toFixed(2).split('.');
                return (
                    <div key={item.symbol} className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap">
                        <span className="text-gaming-400 font-bold">{item.symbol}</span>
                        <span className="text-white">
                            ${Math.floor(item.price).toLocaleString()}
                            <span className="text-gray-500">.{parts[1]}</span>
                        </span>
                        <span className={`flex items-center ${item.change >= 0 ? 'text-gaming-accent' : 'text-danger'}`}>
                             {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default MarketTicker;