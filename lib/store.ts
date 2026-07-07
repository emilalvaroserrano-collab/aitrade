// Simple in-memory store for simulation
export const store = {
  account: {
    balance: 10000.0,
    equity: 10000.0,
    margin_free: 10000.0,
    profit: 0.0,
  },
  positions: [] as any[],
  marketData: {
    symbol: 'EUR/USD',
    bid: 1.0950,
    ask: 1.0952,
    spread: 0.0002,
    trend: 'BULLISH',
    volatility: 'HIGH',
    price_history: Array.from({ length: 20 }).map((_, i) => ({
      time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString(),
      price: 1.0900 + Math.random() * 0.01
    }))
  }
};

export const updateMarketData = () => {
  const change = (Math.random() - 0.5) * 0.0010;
  store.marketData.bid = Number((store.marketData.bid + change).toFixed(5));
  store.marketData.ask = Number((store.marketData.bid + 0.0002).toFixed(5));
  store.marketData.price_history.shift();
  store.marketData.price_history.push({
    time: new Date().toLocaleTimeString(),
    price: store.marketData.bid
  });
  
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
