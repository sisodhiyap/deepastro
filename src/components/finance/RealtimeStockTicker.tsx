import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  pct: number;
  currency: string;
  category: string;
}

const INITIAL_TICKER_ITEMS: TickerItem[] = [
  { symbol: "NIFTY 50", name: "NIFTY 50", price: 24865.40, change: 142.15, pct: 0.58, currency: "INR", category: "INDEX" },
  { symbol: "SENSEX", name: "BSE SENSEX", price: 81480.20, change: 410.80, pct: 0.51, currency: "INR", category: "INDEX" },
  { symbol: "BANK NIFTY", name: "Bank Nifty", price: 52380.60, change: 285.40, pct: 0.55, currency: "INR", category: "INDEX" },
  { symbol: "S&P 500", name: "S&P 500", price: 5815.25, change: 24.10, pct: 0.42, currency: "USD", category: "GLOBAL" },
  { symbol: "NASDAQ 100", name: "Nasdaq 100", price: 18290.80, change: 110.50, pct: 0.61, currency: "USD", category: "GLOBAL" },
  { symbol: "DOW JONES", name: "Dow Jones 30", price: 42454.12, change: 165.20, pct: 0.39, currency: "USD", category: "GLOBAL" },
  { symbol: "BRENT CRUDE", name: "Brent Oil", price: 74.65, change: -0.85, pct: -1.13, currency: "USD/bbl", category: "COMMODITY" },
  { symbol: "GOLD (XAU)", name: "Gold Spot", price: 2682.40, change: 12.80, pct: 0.48, currency: "USD/oz", category: "COMMODITY" },
  { symbol: "SILVER (XAG)", name: "Silver Spot", price: 31.85, change: 0.42, pct: 1.34, currency: "USD/oz", category: "COMMODITY" },
  { symbol: "BITCOIN", name: "BTC/USD", price: 64250.00, change: 1120.00, pct: 1.77, currency: "USD", category: "CRYPTO" },
  { symbol: "USD/INR", name: "USD to INR", price: 84.18, change: 0.04, pct: 0.05, currency: "INR", category: "FOREX" },
  { symbol: "10Y G-SEC", name: "India 10Y Yield", price: 7.08, change: -0.02, pct: -0.28, currency: "%", category: "BONDS" },
  { symbol: "INDIA VIX", name: "Volatility Index", price: 13.42, change: -0.48, pct: -3.45, currency: "Pts", category: "VOLATILITY" }
];

export const RealtimeStockTicker: React.FC = () => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(INITIAL_TICKER_ITEMS);
  const [isTickerLive, setIsTickerLive] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [lastTickTime, setLastTickTime] = useState(new Date().toLocaleTimeString());
  const [flashingSymbols, setFlashingSymbols] = useState<{ [symbol: string]: 'up' | 'down' }>({});

  useEffect(() => {
    if (!isTickerLive) return;

    const countTimer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
    }, 1000);

    const tickTimer = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString();
      setLastTickTime(nowStr);

      setTickerItems((prevItems) => {
        const flashes: { [symbol: string]: 'up' | 'down' } = {};

        const updated = prevItems.map((item) => {
          if (Math.random() < 0.65) {
            const isPositiveDrift = Math.random() > 0.45;
            const deltaPct = (Math.random() * 0.22 + 0.03) * (isPositiveDrift ? 1 : -1);
            const deltaPrice = (item.price * deltaPct) / 100;
            const newPrice = Math.max(0.01, item.price + deltaPrice);
            const newChange = item.change + deltaPrice;
            const newPct = (newChange / (newPrice - newChange)) * 100;

            flashes[item.symbol] = isPositiveDrift ? 'up' : 'down';

            return {
              ...item,
              price: Number(newPrice.toFixed(item.price > 1000 ? 2 : item.price > 10 ? 2 : 4)),
              change: Number(newChange.toFixed(2)),
              pct: Number(newPct.toFixed(2))
            };
          }
          return item;
        });

        setFlashingSymbols(flashes);
        setTimeout(() => setFlashingSymbols({}), 1500);

        return updated;
      });
    }, 5000);

    return () => {
      clearInterval(countTimer);
      clearInterval(tickTimer);
    };
  }, [isTickerLive]);

  return (
    <div className="bg-[#090d16] border border-[#1b2537] rounded-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1b2537] text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE TICKER • 5S INTERVAL</span>
          </div>

          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Multi-Exchange Real-Time Stream (NSE • BSE • NYSE • FOREX)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            Next tick in <span className="text-cyan-400 font-bold">{countdown}s</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Tick: <span className="text-slate-200">{lastTickTime}</span>
          </span>

          <button
            onClick={() => setIsTickerLive(!isTickerLive)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#152033] hover:bg-[#1f2e47] text-slate-300 border border-[#233550] transition-colors"
          >
            {isTickerLive ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isTickerLive ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>

      <div className="pt-3 overflow-x-auto scrollbar-thin flex items-center gap-3 pb-1">
        {tickerItems.map((item) => {
          const isUp = item.pct >= 0;
          const flash = flashingSymbols[item.symbol];

          return (
            <div
              key={item.symbol}
              className={`shrink-0 px-3.5 py-2 rounded-xl border transition-all duration-300 min-w-[170px] ${
                flash === 'up'
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]'
                  : flash === 'down'
                  ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.02]'
                  : 'bg-[#0e1424] border-[#1e293b] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>{item.symbol}</span>
                <span className="text-[9px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900">
                  {item.category}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-sm font-bold font-mono text-white">
                  {item.currency === 'INR' ? '₹' : item.currency === 'USD' ? '$' : ''}
                  {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                <span
                  className={`flex items-center text-xs font-mono font-bold ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isUp ? '+' : ''}{item.pct}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
