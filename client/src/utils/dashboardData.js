export const timeRanges = ["1D", "1W", "1M", "1Y", "5Y"];

export const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "market", label: "Market" },
  { id: "portfolio", label: "Portfolio" },
  { id: "analysis", label: "AI Analysis" },
  { id: "news", label: "News" },
  { id: "settings", label: "Settings" },
];

export const mobileNavItems = [
  { id: "home", label: "Home" },
  { id: "market", label: "Market" },
  { id: "portfolio", label: "Portfolio" },
  { id: "ai", label: "AI" },
  { id: "profile", label: "Profile" },
];

const RANGE_TO_TIMEFRAME = {
  "1D": "daily",
  "1W": "weekly",
  "1M": "daily",
  "1Y": "monthly",
  "5Y": "fiveYears",
};

export async function fetchTickers() {
  const res = await fetch("/api/tickers");
  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
}

export async function fetchStockData(ticker) {
  const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error(`Failed to fetch data for ${ticker}`);
  return res.json();
}

function deriveSignal(changePercent) {
  if (changePercent > 2) return "BUY";
  if (changePercent < -1) return "SELL";
  return "HOLD";
}

function buildSparklineFromForecast(forecast) {
  return forecast.map((f, i) => ({ step: i + 1, value: f.predictedClose }));
}

export function mapApiDataToDashboard(apiData, range = "1M") {
  const { ticker, summary, forecast, timeframes } = apiData;
  const timeframeKey = RANGE_TO_TIMEFRAME[range] || "daily";
  const rawRows = timeframes[timeframeKey] || timeframes.daily || [];

  // Map backend rows to chart shape; keep `date` as label
  const chartData = rawRows.map((row) => ({
    label: row.date,
    date: row.date,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    volume: row.volume,
  }));

  const first = chartData[0]?.close || 0;
  const last = chartData[chartData.length - 1]?.close || summary.currentPrice;
  const changePercent = first ? Number((((last - first) / first) * 100).toFixed(2)) : 0;
  const signal = deriveSignal(summary.predictedChangePercent ?? changePercent);
  const confidence = signal === "BUY" ? 87 : signal === "SELL" ? 79 : 72;

  return {
    summary: {
      symbol: ticker,
      currentPrice: summary.currentPrice,
      changePercent,
      predictedPrice: summary.predictedPriceDay7,
      predictedChange: summary.predictedChange,
      predictedChangePercent: summary.predictedChangePercent,
      ma20: summary.ma20,
      ma50: summary.ma50,
      high52Week: summary.high52Week,
      low52Week: summary.low52Week,
      marketStatus: "Open",
    },
    chartData,
    forecast,
    insight: {
      signal,
      confidence,
      reasoning:
        signal === "BUY"
          ? "Trend momentum is strong and price action remains healthy above recent average levels."
          : signal === "SELL"
            ? "Short-term pressure is visible and the recent trend suggests caution."
            : "Price is moving in a balanced range, so waiting for confirmation may be smarter.",
      sparkline: buildSparklineFromForecast(forecast),
    },
    portfolio: {
      totalInvestment: 185000,
      currentValue: 201450,
      profitLoss: 16450,
      allocation: [
        { name: "AAPL", value: 32 },
        { name: "TSLA", value: 21 },
        { name: "RELIANCE", value: 27 },
        { name: "MSFT", value: 12 },
        { name: "Cash", value: 8 },
      ],
    },
    trending: forecast.slice(0, 5).map((f, i) => ({
      symbol: `Day ${i + 1}`,
      price: f.predictedClose,
      change: Number((((f.predictedClose - summary.currentPrice) / summary.currentPrice) * 100).toFixed(2)),
      sparkline: buildSparklineFromForecast(forecast),
    })),
    news: [
      { title: "Tech leaders extend gains as investors rotate into AI-linked stocks.", source: "Market Pulse" },
      { title: "Energy and financials stay firm while traders watch upcoming macro data.", source: "Street Brief" },
      { title: "Analysts raise outlook on large-cap names after stronger guidance this week.", source: "Capital Wire" },
      { title: "Retail activity increases in trending sectors as volatility cools down.", source: "Finance Desk" },
    ],
    chat: {
      sentiment: signal === "BUY" ? "Positive" : signal === "SELL" ? "Negative" : "Neutral",
      recommendation: signal,
      confidence,
      reasoning:
        signal === "BUY"
          ? "Momentum, volume, and short-term trend all support a constructive view."
          : signal === "SELL"
            ? "Weak recent movement and softer trend strength suggest reduced conviction."
            : "Signals are mixed, so a neutral stance makes the most sense for now.",
    },
  };
}
