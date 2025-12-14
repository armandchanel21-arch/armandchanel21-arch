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

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol.replace('/', ''), // TV expects 'EURUSD', not 'EUR/USD'
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
      "backgroundColor": "rgba(19, 23, 34, 1)",
      "gridColor": "rgba(42, 46, 57, 0.5)",
      "toolbar_bg": "#1e222d"
    });

    currentContainer.appendChild(script);

    // Cleanup function: remove content when symbol changes or component unmounts
    return () => {
        if (currentContainer) {
            currentContainer.innerHTML = '';
        }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full bg-trade-900" ref={containerRef}>
      {/* Content injected by useEffect */}
    </div>
  );
};

export default memo(TradingViewWidget);