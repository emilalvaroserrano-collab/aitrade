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

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  volatility: string;
  price_history: Candle[];
}

export interface Mt5Config {
  host: string;
  port: number;
  login: string;
  broker: string;
  connected: boolean;
}

export interface Mt5Log {
  time: string;
  message: string;
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
  
  // MT5-specific states
  const [mt5Config, setMt5Config] = useState<Mt5Config | null>(null);
  const [mt5Logs, setMt5Logs] = useState<Mt5Log[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);

  const mt5Connected = mt5Config?.connected ?? false;

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

    const fetchMt5Data = async () => {
      try {
        const res = await fetch('/api/mt5');
        const data = await res.json();
        setMt5Config(data.config);
        setMt5Logs(data.logs);
      } catch (err) {
        console.error('Failed to fetch MT5 data', err);
      }
    };

    fetchMarket();
    fetchAccount();
    fetchMt5Data();

    const interval = setInterval(() => {
      fetchMarket();
      fetchAccount();
      fetchMt5Data();
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

  const saveMt5Config = async (host: string, port: number, login: string, broker: string) => {
    try {
      const res = await fetch('/api/mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_CONFIG', host, port, login, broker })
      });
      const data = await res.json();
      if (data.success) {
        setMt5Config(data.config);
      }
    } catch (err) {
      console.error('Failed to save MT5 config', err);
    }
  };

  const testMt5Connection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch('/api/mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST_CONNECTION' })
      });
      const data = await res.json();
      if (data.logs) {
        setMt5Logs(data.logs);
      }
      if (mt5Config) {
        setMt5Config({ ...mt5Config, connected: data.connected });
      }
    } catch (err) {
      console.error('Failed to test MT5 connection', err);
    } finally {
      setTestingConnection(false);
    }
  };

  const clearMt5Logs = async () => {
    try {
      const res = await fetch('/api/mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_LOGS' })
      });
      const data = await res.json();
      setMt5Logs(data.logs);
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  return {
    account,
    positions,
    marketData,
    prediction,
    marketNews,
    botStatus,
    mt5Connected,
    mt5Config,
    mt5Logs,
    testingConnection,
    fetchPrediction,
    fetchNews,
    executeTrade,
    closePosition,
    closeAll,
    toggleBot,
    saveMt5Config,
    testMt5Connection,
    clearMt5Logs
  };
}

