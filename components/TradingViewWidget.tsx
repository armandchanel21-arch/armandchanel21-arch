import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Use a unique ID to ensure clean re-renders
    const widgetId = `tradingview_${Math.random().toString(36).substring(7)}`;
    currentContainer.innerHTML = ''; // Clear previous

    const widgetDiv = document.createElement('div');
    widgetDiv.id = widgetId;
    widgetDiv.className = 'w-full h-full';
    widgetDiv.style.height = '100%'; 
    widgetDiv.style.width = '100%';
    currentContainer.appendChild(widgetDiv);

    let rawSymbol = symbol.toUpperCase().replace('/', '').replace('-', '').trim();
    let formattedSymbol = rawSymbol;

    // Symbol Mapping Logic
    if (!rawSymbol.includes(':')) {
        const forexCommon = ['EURUSD', 'GBPUSD', 'USDJPY'];
        if (forexCommon.includes(rawSymbol)) {
            formattedSymbol = `FX:${rawSymbol}`;
        } else if (rawSymbol === 'GOLD') {
             formattedSymbol = 'OANDA:XAUUSD';
        } else if (rawSymbol.length <= 5 && !rawSymbol.endsWith('USDT')) {
             formattedSymbol = `BINANCE:${rawSymbol}USDT`;
        } else {
             formattedSymbol = `BINANCE:${rawSymbol}`;
        }
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
        if (typeof (window as any).TradingView !== 'undefined') {
            new (window as any).TradingView.widget({
                "autosize": true,
                "symbol": formattedSymbol,
                "interval": "60",
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "hide_side_toolbar": false,
                "allow_symbol_change": true,
                "container_id": widgetId,
                "hide_volume": false,
                "save_image": false,
                "backgroundColor": "#000000"
            });
        }
    };
    currentContainer.appendChild(script);

    return () => {
        if (currentContainer) currentContainer.innerHTML = '';
    };
  }, [symbol]);

  return (
    <div className="w-full h-full bg-black relative" ref={containerRef} style={{ minHeight: '300px' }}>
      {/* Widget Injected Here */}
    </div>
  );
};

export default memo(TradingViewWidget);