// Simple in-memory store for simulation
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const store = {
  account: {
    balance: 10000.0,
    equity: 10000.0,
    margin_free: 10000.0,
    profit: 0.0,
  },
  positions: [] as any[],
  mt5Config: {
    host: '127.0.0.1',
    port: 5001,
    login: '48839210',
    broker: 'LMAX-Global-Demo',
    connected: true,
  },
  mt5Logs: [
    { time: '12:50:02', message: 'Bridge: MT5 Terminal executable found in C:\\Program Files\\MetaTrader 5\\' },
    { time: '12:50:03', message: 'Bridge: Loading AIFX_Bridge_EA.ex5 on EURUSD M15 chart...' },
    { time: '12:50:05', message: 'Bridge: Successfully connected to local broker server' },
    { time: '12:50:06', message: 'Bridge: MT5 Account #48839210 verified. Balance: $10,000.00' },
    { time: '12:50:07', message: 'Bridge: WebSocket socket server started on 127.0.0.1:5001' },
    { time: '12:50:08', message: 'Bridge: Signal tunnel online. Ready to route trade executions.' }
  ] as { time: string; message: string }[],
  marketData: {
    symbol: 'EUR/USD',
    bid: 1.0950,
    ask: 1.0952,
    spread: 0.0002,
    trend: 'BULLISH',
    volatility: 'HIGH',
    price_history: [] as Candle[]
  }
};

// Seed initial candlestick history
let currentPrice = 1.0910;
store.marketData.price_history = Array.from({ length: 30 }).map((_, i) => {
  const open = Number((currentPrice + (Math.random() - 0.5) * 0.0012).toFixed(5));
  const close = Number((open + (Math.random() - 0.5) * 0.0010).toFixed(5));
  const high = Number((Math.max(open, close) + Math.random() * 0.0005).toFixed(5));
  const low = Number((Math.min(open, close) - Math.random() * 0.0005).toFixed(5));
  currentPrice = close;
  const time = new Date(Date.now() - (30 - i) * 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { time, open, high, low, close };
});

// Set current bid/ask based on the last seed candle
const lastCandle = store.marketData.price_history[store.marketData.price_history.length - 1];
store.marketData.bid = lastCandle.close;
store.marketData.ask = Number((lastCandle.close + 0.0002).toFixed(5));

export const updateMarketData = () => {
  const change = (Math.random() - 0.5) * 0.0006;
  const newBid = Number((store.marketData.bid + change).toFixed(5));
  store.marketData.bid = newBid;
  store.marketData.ask = Number((newBid + 0.0002).toFixed(5));
  
  // Update latest candle in the history
  const len = store.marketData.price_history.length;
  if (len > 0) {
    const last = store.marketData.price_history[len - 1];
    last.close = newBid;
    if (newBid > last.high) last.high = newBid;
    if (newBid < last.low) last.low = newBid;
    
    // With 15% probability, form a new candle to show dynamic movement
    if (Math.random() < 0.15) {
      store.marketData.price_history.shift();
      const open = last.close;
      const close = Number((open + (Math.random() - 0.5) * 0.0004).toFixed(5));
      const high = Number((Math.max(open, close) + Math.random() * 0.0003).toFixed(5));
      const low = Number((Math.min(open, close) - Math.random() * 0.0003).toFixed(5));
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      store.marketData.price_history.push({ time, open, high, low, close });
    }
  }
  
  let totalProfit = 0;
  store.positions.forEach(p => {
    p.current_price = store.marketData.bid;
    if (p.type === 'BUY') {
      p.profit = (p.current_price - p.open_price) * p.volume * 100000;
    } else {
      p.profit = (p.open_price - p.current_price) * p.volume * 100000;
    }
    totalProfit += p.profit;
  });

  store.account.profit = totalProfit;
  store.account.equity = store.account.balance + totalProfit;
};

