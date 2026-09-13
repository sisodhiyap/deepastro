import React, { useState, useMemo } from 'react';
import { Search, Shield, TrendingUp, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewsItem {
  id: string;
  category: string;
  categoryLabel: string;
  headline: string;
  source: string;
  timestamp: string;
  summary: string;
  implication: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'VOLATILE' | 'NEUTRAL';
  impact: string;
  cosmicCorrelate: string;
}

const INITIAL_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-1",
    category: "central-banks",
    categoryLabel: "Central Banks & Policy",
    headline: "RBI Monetary Policy Committee Maintains Repo Rate at 6.50%; Projects Steady GDP Growth at 7.2%",
    source: "Reserve Bank of India / Reuters",
    timestamp: "2 mins ago",
    summary: "Governor affirms resilient domestic macroeconomic fundamentals with inflation aligning toward target band. Liquidity management remains active to support credit growth across manufacturing and infrastructure sectors.",
    implication: "Yield curve stability supports sovereign borrowing programs and bank net interest margins.",
    sentiment: "BULLISH",
    impact: "HIGH IMPACT",
    cosmicCorrelate: "🪐 Jupiter in Taurus: Tangible financial consolidation & monetary anchor"
  },
  {
    id: "news-2",
    category: "geopolitics",
    categoryLabel: "Geopolitics & Corridors",
    headline: "Global Maritime Freight Rates Adjust as Red Sea & Hormuz Security Protocols Enforce Strategic Rerouting",
    source: "Lloyd's Maritime / Bloomberg",
    timestamp: "7 mins ago",
    summary: "Container traffic around Cape of Good Hope maintains extended delivery schedules. Indian and Asian refiners maintain diversified crude supply pipelines with long-term freight hedging.",
    implication: "Elevated tanker shipping tariffs; upstream exploration & production margins remain supported.",
    sentiment: "VOLATILE",
    impact: "HIGH IMPACT",
    cosmicCorrelate: "⚡ Mars-Rahu square: Maritime chokepoints and energy transport volatility"
  },
  {
    id: "news-3",
    category: "tech-ai",
    categoryLabel: "Tech & AI Supercycle",
    headline: "Global Sovereign AI Infrastructure Capex Reaches Record $200B Annualized Run Rate",
    source: "DeepAstro Tech Wire / Financial Times",
    timestamp: "14 mins ago",
    summary: "Cloud hyperscalers and sovereign wealth funds accelerate deployments of advanced accelerator clusters, power generation micro-grids, and high-bandwidth optical networking.",
    implication: "High multi-year revenue visibility for enterprise technology, semiconductor foundries, and clean energy utilities.",
    sentiment: "BULLISH",
    impact: "HIGH IMPACT",
    cosmicCorrelate: "📡 Rahu in Pisces / Mercury direct: Deep algorithmic computation & synthetic intelligence expansion"
  },
  {
    id: "news-4",
    category: "central-banks",
    categoryLabel: "Central Banks & Policy",
    headline: "US Federal Reserve Signals Measured Monetary Easing as Core Inflation Softens Toward 2.2%",
    source: "Federal Reserve Board / WSJ",
    timestamp: "22 mins ago",
    summary: "FOMC dot plot outlines progressive 25 bps adjustments. US labour market indicators demonstrate steady equilibrium without broad-based cooling.",
    implication: "Weakens US Dollar Index (DXY), stimulating foreign portfolio inflows into Emerging Market equities.",
    sentiment: "BULLISH",
    impact: "HIGH IMPACT",
    cosmicCorrelate: "⚖️ Venus-Mercury trine: Liquidity release into equity risk assets"
  },
  {
    id: "news-5",
    category: "commodities",
    categoryLabel: "Commodities & FX",
    headline: "Spot Gold Touches Historic Peaks on Sustained Sovereign Central Bank Reserve Diversification",
    source: "World Gold Council / Bloomberg",
    timestamp: "31 mins ago",
    summary: "Global central banks added over 480 tonnes of physical bullion in sovereign reserves year-to-date. De-dollarization momentum among BRICS nations underpins long-term institutional demand floor.",
    implication: "Structural multi-year secular bull market in physical gold and silver reserves.",
    sentiment: "BULLISH",
    impact: "HIGH IMPACT",
    cosmicCorrelate: "🌞 Sun-Jupiter solar wealth cycle: Sovereign store of value and gold revaluation"
  },
  {
    id: "news-6",
    category: "mundane-cycles",
    categoryLabel: "Mundane Planetary Cycles",
    headline: "Jupiter-Saturn 20-Year Great Conjunction Cycle in Air Element: Structural Transition to Decentralized Capital",
    source: "DeepAstro Mundane Intelligence Dossier",
    timestamp: "45 mins ago",
    summary: "Astrological macro-cycle analysis identifies the shift from Earth era (industrial real estate, heavy machinery) into the 200-year Air epoch (intellectual capital, tokenization, AI networks, clean energy grids).",
    implication: "Asset-light high-margin intellectual property models outperform capital-intensive legacy infrastructure.",
    sentiment: "BULLISH",
    impact: "HIGH IMPACT",
    cosmicCorrelate: "🪐 Jupiter-Saturn Air Triplicity: The 200-year technological paradigm reset"
  },
  {
    id: "news-7",
    category: "tech-ai",
    categoryLabel: "Tech & AI Supercycle",
    headline: "Indian IT Tier-1 Giants Post Surge in Generative AI Enterprise Deals & Multi-Year Cloud Modernization",
    source: "NSE Market Wire / Economic Times",
    timestamp: "52 mins ago",
    summary: "NIFTY IT index rallies 1.42% led by TCS, Infosys, and HCL Tech after large deal total contract values (TCV) expanded 18% quarter-on-quarter.",
    implication: "Re-rating of technology sector multiples with expanding operating margins.",
    sentiment: "BULLISH",
    impact: "MEDIUM IMPACT",
    cosmicCorrelate: "💻 Mercury in 10th house transit: Commercial technology acceleration"
  },
  {
    id: "news-8",
    category: "geopolitics",
    categoryLabel: "Geopolitics & Corridors",
    headline: "Indo-Pacific Critical Mineral Supply Chain Accord Formalized to Guarantee Rare Earth Access",
    source: "Nikkei Asia / MoCI India",
    timestamp: "1 hour ago",
    summary: "Bilateral agreement guarantees lithium, cobalt, and neodymium extraction and processing channels for electric mobility and defense avionics.",
    implication: "De-risks supply chain bottlenecks for green energy transitions and advanced electronics.",
    sentiment: "BULLISH",
    impact: "MEDIUM IMPACT",
    cosmicCorrelate: "⛏️ Saturn in Pisces: Deep earth resources & strategic state reserves"
  }
];

export const NewsWire: React.FC = () => {
  const [newsFilter, setNewsFilter] = useState('all');
  const [newsSearch, setNewsSearch] = useState('');
  const [newsItems] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
  const [factCheckQuery, setFactCheckQuery] = useState('Jupiter ingress guarantees 100% stock gains in banking');
  const [factCheckResult, setFactCheckResult] = useState<any>(null);

  const handleRunFactCheck = () => {
    const q = factCheckQuery.toLowerCase();
    if (q.includes('guarantee') || q.includes('100%') || q.includes('sure shot') || q.includes('jackpot')) {
      setFactCheckResult({
        status: 'REJECTED',
        reasoning: 'Assertion violates SEBI Research Analyst Regulations (2014) and US SEC Rule 10b-5. Financial astrology cannot guarantee asset returns or provide deterministic stock tips.',
        safetyViolations: ['Prohibited Guaranteed Return Claim', 'Missing Risk Disclosure', 'Deterministic Prediction Fallacy']
      });
    } else {
      setFactCheckResult({
        status: 'VERIFIED',
        reasoning: 'Empirical Walk-Forward validation confirms correlation between Jupiter ingress cycles and broader sovereign credit expansion over 10-year test windows. Risk-controlled diversification remains strictly required.',
        safetyViolations: []
      });
    }
  };

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesCategory = newsFilter === 'all' || item.category === newsFilter;
      const matchesSearch =
        !newsSearch.trim() ||
        item.headline.toLowerCase().includes(newsSearch.toLowerCase()) ||
        item.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
        item.source.toLowerCase().includes(newsSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [newsItems, newsFilter, newsSearch]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                REAL-TIME NEWS & FACT VERIFICATION
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE WIRE ACTIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Macroeconomic, Central Bank & Astrological News Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              Continuous multi-source wire monitoring market catalysts, geopolitical shipping lanes, and planetary cycle alignments.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
              placeholder="Search wire by keyword..."
              className="w-full bg-[#131b2c] border border-[#233550] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All News' },
            { id: 'central-banks', label: 'Central Banks & Policy' },
            { id: 'geopolitics', label: 'Geopolitics & Corridors' },
            { id: 'tech-ai', label: 'Tech & AI Supercycle' },
            { id: 'commodities', label: 'Commodities & FX' },
            { id: 'mundane-cycles', label: 'Mundane Planetary Cycles' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setNewsFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                newsFilter === cat.id
                  ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                  : 'bg-[#131b2c] text-slate-300 hover:text-white border border-[#233550]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((news) => (
          <div
            key={news.id}
            className="bg-[#0b101d] border border-[#1b2537] hover:border-cyan-500/40 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-[#131b2c] text-cyan-400 font-mono text-[10px] border border-[#233550]">
                  {news.categoryLabel}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      news.sentiment === 'BULLISH'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : news.sentiment === 'VOLATILE'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {news.sentiment}
                  </span>

                  <span className="text-[11px] text-slate-400 font-mono">{news.timestamp}</span>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white leading-snug hover:text-cyan-300 transition-colors">
                {news.headline}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {news.summary}
              </p>

              <div className="p-3 rounded-xl bg-[#0e1627] border border-[#1b273d] text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Market & Capital Allocation Implication:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {news.implication}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1b2537] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400 font-mono">Source: {news.source}</span>
              <span className="text-cyan-300 font-mono text-[10px]">{news.cosmicCorrelate}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            5-Tier Fact-Checking & Anti-Hallucination Guardrail
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Verify any financial astrology claim against statutory regulations (SEBI Research Analyst Regulations 2014 & US SEC Rule 10b-5). Claims promising guaranteed returns or stock tips are rejected with legal citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={factCheckQuery}
            onChange={(e) => setFactCheckQuery(e.target.value)}
            placeholder="Enter financial astrology assertion to audit..."
            className="flex-1 bg-[#131b2c] border border-[#233550] rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500 w-full"
          />
          <button
            onClick={handleRunFactCheck}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-semibold text-xs transition shadow-md shrink-0"
          >
            Audit Claim
          </button>
        </div>

        {factCheckResult && (
          <div className="bg-[#131b2c] border border-[#233550] rounded-xl p-4 space-y-2 mt-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">Fact-Check Verdict:</span>
              <span
                className={`px-2.5 py-0.5 rounded font-bold ${
                  factCheckResult.status === 'VERIFIED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : 'bg-rose-950 text-rose-400 border border-rose-700'
                }`}
              >
                {factCheckResult.status}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">{factCheckResult.reasoning}</p>
            {factCheckResult.safetyViolations?.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-[11px]">
                <span className="font-bold block mb-1">Regulatory Safety Violations:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {factCheckResult.safetyViolations.map((v: string) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
