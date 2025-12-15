import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Clear any existing content before appending new script
    currentContainer.innerHTML = '';

    // Create the widget container div that the script expects
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget h-full w-full';
    currentContainer.appendChild(widgetDiv);

    // Intelligent Symbol Formatting for Real-Time Data
    let rawSymbol = symbol.toUpperCase().replace('/', '').replace('-', '').trim();
    let formattedSymbol = rawSymbol;

    // Detect if already prefixed
    if (!rawSymbol.includes(':')) {
        const forexCommon = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'];
        const commodities = ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'GOLD', 'SILVER'];
        const indices = ['US30', 'SPX500', 'NAS100', 'GER30', 'DJI'];

        if (forexCommon.includes(rawSymbol)) {
            // FXCM usually provides free real-time forex data in TV
            formattedSymbol = `FX:${rawSymbol}`;
        } else if (commodities.includes(rawSymbol) || rawSymbol === 'GOLD') {
             formattedSymbol = rawSymbol === 'GOLD' ? 'OANDA:XAUUSD' : `OANDA:${rawSymbol}`;
        } else if (indices.includes(rawSymbol)) {
             formattedSymbol = `CAPITALCOM:${rawSymbol}`;
        } else {
             // Default to Binance for Crypto (Primary Use Case for this app)
             // Check if it looks like a ticker without a pair (e.g. "BTC")
             // Append USDT if it's just a coin name to ensure a valid pair
             if (rawSymbol.length <= 5 && !rawSymbol.endsWith('USDT') && !rawSymbol.endsWith('USD') && !rawSymbol.endsWith('EUR')) {
                 formattedSymbol = `BINANCE:${rawSymbol}USDT`;
             } else {
                 formattedSymbol = `BINANCE:${rawSymbol}`;
             }
        }
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": formattedSymbol,
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(5, 5, 5, 1)", 
      "gridColor": "rgba(42, 46, 57, 0.3)",
      "toolbar_bg": "#121212", 
      "withdateranges": true,
      "allow_symbol_change": true,
      "details": false,
      "hotlist": false,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650"
    });

    currentContainer.appendChild(script);

    return () => {
        if (currentContainer) {
            currentContainer.innerHTML = '';
        }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full bg-gaming-950" ref={containerRef}>
      {/* Content injected by useEffect */}
    </div>
  );
};

export default memo(TradingViewWidget);