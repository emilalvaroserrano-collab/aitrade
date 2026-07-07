import { useState, useEffect } from 'react';

export interface AccountInfo {
  balance: number;
  equity: number;
  margin_free: number;
  profit: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  open_price: number;
  current_price: number;
  sl: number;
  tp: number;
  profit: number;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  volatility: string;
  price_history: { time: string; price: number }[];
}

export interface AiPrediction {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  suggested_entry: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  reason: string;
  model_version: string;
}

export function useTrading() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [prediction, setPrediction] = useState<AiPrediction | null>(null);
  const [marketNews, setMarketNews] = useState<string>('');
  const [botStatus, setBotStatus] = useState<'RUNNING' | 'PAUSED' | 'ERROR'>('PAUSED');
  const [mt5Connected, setMt5Connected] = useState(true);

  // Fetch initial state and simulate live updates
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/market');
        const data = await res.json();
        setMarketData(data);
      } catch (err) {
        console.error('Failed to fetch market data', err);
      }
    };

    const fetchAccount = async () => {
      try {
        const res = await fetch('/api/account');
        const data = await res.json();
        setAccount(data.account);
        setPositions(data.positions);
      } catch (err) {
        console.error('Failed to fetch account data', err);
      }
    };

    fetchMarket();
    fetchAccount();

    const interval = setInterval(() => {
      fetchMarket();
      fetchAccount();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchPrediction = async () => {
    try {
      const res = await fetch('/api/predict', { method: 'POST' });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error('Failed to fetch prediction', err);
    }
  };

  const fetchNews = async (symbol: string) => {
    setMarketNews('Analyzing live web data...');
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const data = await res.json();
      setMarketNews(data.analysis);
    } catch (err) {
      console.error('Failed to fetch news', err);
      setMarketNews('Error fetching analysis.');
    }
  };

  const executeTrade = async (type: 'BUY' | 'SELL', volume: number, sl: number, tp: number) => {
    try {
      await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'OPEN', type, volume, sl, tp }),
      });
      // Refresh immediately
      const res = await fetch('/api/account');
      const data = await res.json();
      setAccount(data.account);
      setPositions(data.positions);
    } catch (err) {
      console.error('Failed to execute trade', err);
    }
  };

  const closePosition = async (id: string) => {
    try {
      await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLOSE', id }),
      });
    } catch (err) {
      console.error('Failed to close position', err);
    }
  };

  const closeAll = async () => {
    try {
      await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLOSE_ALL' }),
      });
    } catch (err) {
      console.error('Failed to close all', err);
    }
  };

  const toggleBot = () => {
    setBotStatus(prev => prev === 'RUNNING' ? 'PAUSED' : 'RUNNING');
  };

  return {
    account,
    positions,
    marketData,
    prediction,
    marketNews,
    botStatus,
    mt5Connected,
    fetchPrediction,
    fetchNews,
    executeTrade,
    closePosition,
    closeAll,
    toggleBot
  };
}
