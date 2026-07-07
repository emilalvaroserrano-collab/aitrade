'use client';

import React, { useState } from 'react';
import { useTrading } from '@/hooks/use-trading';
import { 
  Activity, ArrowDownRight, ArrowUpRight, Brain, 
  LineChart, Power, Settings, ShieldAlert, 
  Terminal, TrendingUp, TrendingDown, 
  Wallet, RefreshCw, XCircle, Play, Square, Globe
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const {
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
  } = useTrading();

  const [lotSize, setLotSize] = useState<number>(0.1);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [autoMode, setAutoMode] = useState<boolean>(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (!account || !marketData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1115]">
        <div className="animate-spin text-primary">
          <RefreshCw size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      <header className="h-[60px] shrink-0 flex flex-col md:flex-row items-center justify-between px-5 border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Forex MT5 Trader</h1>
            <p className="text-xs text-slate-400 font-mono">LIVE PREDICTION ENGINE</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0 text-sm font-mono">
          <a href="/backtest" className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)] font-bold text-[10px]">
            BACKTEST
          </a>
          <div className="flex items-center gap-2 bg-[var(--color-surface)] px-2 py-1 rounded border border-[var(--color-border)] font-bold text-[10px]">
            <div className={`w-1.5 h-1.5 rounded-full ${mt5Connected ? 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]' : 'bg-[var(--color-danger)] shadow-[0_0_8px_var(--color-danger)]'}`}></div>
            <span className="text-[var(--color-text-primary)]">MT5 {mt5Connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-surface)] px-2 py-1 rounded border border-[var(--color-border)] font-bold text-[10px]">
            <div className={`w-1.5 h-1.5 rounded-full ${botStatus === 'RUNNING' ? 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]' : 'bg-[var(--color-warning)] shadow-[0_0_8px_var(--color-warning)]'}`}></div>
            <span className="text-[var(--color-text-primary)]">BOT {botStatus}</span>
          </div>
          <button 
            onClick={toggleBot}
            className={`flex items-center gap-1 px-3 py-1 rounded font-bold text-[10px] transition-colors cursor-pointer border ${
              botStatus === 'RUNNING' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)] hover:bg-[var(--color-warning)]/20' : 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)] hover:bg-[var(--color-success)]/20'
            }`}
          >
            {botStatus === 'RUNNING' ? <Square size={14} /> : <Play size={14} />}
            {botStatus === 'RUNNING' ? 'PAUSE BOT' : 'START BOT'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        
        {/* LEFT COLUMN: ACCOUNT & MARKET */}
        <div className="flex flex-col border-r border-[var(--color-border)] overflow-y-auto">
          
          {/* Account Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <div className="flex flex-col gap-0.5 p-3 border-r border-[var(--color-border)]">
              <div className="text-[10px] text-[var(--color-text-secondary)] font-bold tracking-wide">BALANCE (USD)</div>
              <div className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">{formatCurrency(account.balance)}</div>
            </div>
            <div className="flex flex-col gap-0.5 p-3 border-r border-[var(--color-border)]">
              <div className="text-[10px] text-[var(--color-text-secondary)] font-bold tracking-wide">EQUITY (USD)</div>
              <div className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">{formatCurrency(account.equity)}</div>
            </div>
            <div className="flex flex-col gap-0.5 p-3 border-r border-[var(--color-border)]">
              <div className="text-[10px] text-[var(--color-text-secondary)] font-bold tracking-wide">OPEN P/L</div>
              <div className={`text-sm font-bold tabular-nums ${account.profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {account.profit >= 0 ? '+' : ''}{formatCurrency(account.profit)}
              </div>
            </div>
            <div className="flex flex-col gap-0.5 p-3">
              <div className="text-[10px] text-[var(--color-text-secondary)] font-bold tracking-wide">ACTIVE TRADES</div>
              <div className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">{positions.length}</div>
            </div>
          </div>

          {/* Market View */}
          <div className="flex flex-col flex-1 min-h-[300px] border-b border-[var(--color-border)]">
            <div className="h-[48px] flex items-center px-4 gap-5 border-b border-[var(--color-surface)] bg-[var(--color-background)]">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-[var(--color-primary)]">{marketData.symbol}</h2>
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${marketData.trend === 'BULLISH' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                  {marketData.trend === 'BULLISH' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {marketData.trend}
                </div>
              </div>
              <div className="flex gap-4 font-mono text-[11px] items-center ml-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">BID</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{marketData.bid.toFixed(5)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">ASK</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{marketData.ask.toFixed(5)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">SPREAD</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{(marketData.spread * 10000).toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 w-full p-4 bg-[var(--color-background)]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={marketData.price_history}>
                  <XAxis dataKey="time" stroke="var(--color-border)" fontSize={10} tickMargin={8} />
                  <YAxis domain={['auto', 'auto']} stroke="var(--color-border)" fontSize={10} width={50} tickFormatter={(val) => val.toFixed(4)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '11px' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Open Positions */}
          <div className="h-[180px] bg-[var(--color-background)] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-[var(--color-surface)]">
              <h3 className="font-bold text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide">Open Positions</h3>
              {positions.length > 0 && (
                <button onClick={closeAll} className="cursor-pointer text-[10px] bg-[var(--color-danger)]/10 text-[var(--color-danger)] px-2 py-1 rounded font-bold hover:bg-[var(--color-danger)]/20 transition-colors flex items-center gap-1">
                  CLOSE ALL
                </button>
              )}
            </div>
            
            {positions.length === 0 ? (
              <div className="text-center py-6 text-[var(--color-text-secondary)] text-[11px]">No active trades.</div>
            ) : (
              <table className="w-full text-[11px] text-left border-collapse">
                <thead className="text-[var(--color-text-secondary)] bg-[var(--color-background)] border-b border-[var(--color-surface)]">
                  <tr>
                    <th className="py-2 px-3 font-normal">Symbol</th>
                    <th className="py-2 px-3 font-normal">Type</th>
                    <th className="py-2 px-3 font-normal">Volume</th>
                    <th className="py-2 px-3 font-normal">Open Price</th>
                    <th className="py-2 px-3 font-normal">Current</th>
                    <th className="py-2 px-3 font-normal">Profit</th>
                    <th className="py-2 px-3 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(pos => (
                    <tr key={pos.id} className="border-b border-[var(--color-surface)] hover:bg-[var(--color-surface)] font-mono cursor-pointer transition-colors">
                      <td className="py-2 px-3 text-[var(--color-text-primary)]">{pos.symbol}</td>
                      <td className={`py-2 px-3 font-bold ${pos.type === 'BUY' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>{pos.type}</td>
                      <td className="py-2 px-3 text-[var(--color-text-primary)]">{pos.volume}</td>
                      <td className="py-2 px-3 text-[var(--color-text-primary)]">{pos.open_price.toFixed(5)}</td>
                      <td className="py-2 px-3 text-[var(--color-text-primary)]">{pos.current_price.toFixed(5)}</td>
                      <td className={`py-2 px-3 font-bold ${pos.profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                        {pos.profit >= 0 ? '+' : ''}{pos.profit.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button onClick={() => closePosition(pos.id)} className="cursor-pointer text-[var(--color-danger)] hover:opacity-80 transition-opacity">
                          <XCircle size={14} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & AI */}
        <div className="flex flex-col bg-[var(--color-surface)] overflow-y-auto">
          
          {/* AI Analysis Panel */}
          <div className="flex flex-col p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide">AI Signal Analysis</h3>
              <button onClick={fetchPrediction} className="cursor-pointer text-[10px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 transition-colors flex items-center gap-1">
                SCAN
              </button>
            </div>

            {!prediction ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)] text-[11px]">
                Click SCAN to run AI market analysis.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-[var(--color-background)] rounded border border-[var(--color-border)] border-l-4 border-l-[var(--color-primary)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[13px] font-bold ${
                      prediction.signal === 'BUY' ? 'text-[var(--color-success)]' : 
                      prediction.signal === 'SELL' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'
                    }`}>{prediction.signal} {marketData.symbol}</span>
                    <span className="text-[11px] font-bold text-[var(--color-success)]">{prediction.confidence}% CONF</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                    {prediction.reason}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)]">
                    <div className="text-[9px] text-[var(--color-text-secondary)] mb-0.5">ENTRY</div>
                    <div className="font-bold text-[var(--color-text-primary)]">{prediction.suggested_entry}</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)]">
                    <div className="text-[9px] text-[var(--color-text-secondary)] mb-0.5">TARGET (TP)</div>
                    <div className="font-bold text-[var(--color-success)]">{prediction.take_profit}</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)]">
                    <div className="text-[9px] text-[var(--color-text-secondary)] mb-0.5">STOP LOSS</div>
                    <div className="font-bold text-[var(--color-danger)]">{prediction.stop_loss}</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)]">
                    <div className="text-[9px] text-[var(--color-text-secondary)] mb-0.5">RISK/REWARD</div>
                    <div className="font-bold text-[var(--color-text-primary)]">1:{prediction.risk_reward}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Market News Grounding Panel */}
          <div className="flex flex-col p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide">Live Fundamental Analysis</h3>
              <button 
                onClick={() => fetchNews(marketData.symbol)} 
                className="cursor-pointer text-[10px] font-bold bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-2 py-1 rounded hover:bg-[var(--color-surface-hover)] transition-colors flex items-center gap-1"
              >
                SYNC
              </button>
            </div>
            {!marketNews ? (
               <div className="text-[11px] text-[var(--color-text-secondary)] italic">
                 Click SYNC to fetch real-time grounded analysis.
               </div>
            ) : (
               <div className="text-[11px] text-[var(--color-text-primary)] leading-relaxed">
                 {marketNews}
               </div>
            )}
          </div>

          {/* Manual Trading Controls */}
          <div className="flex flex-col p-4">
            <h3 className="font-bold text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Execution</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.01" 
                  value={lotSize} 
                  onChange={(e) => setLotSize(Number(e.target.value))}
                  className="flex-1 bg-[var(--color-background)] border border-[var(--color-text-muted)] rounded p-2 text-[var(--color-text-primary)] font-mono text-[12px] focus:outline-none focus:border-[var(--color-primary)]"
                />
                <div className="flex-1 bg-[var(--color-background)] border border-[var(--color-text-muted)] rounded p-2 text-[var(--color-text-primary)] font-mono text-[12px] text-center flex items-center justify-center">
                  {riskPercent}% RISK
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => executeTrade('BUY', lotSize, marketData.bid - 0.0050, marketData.ask + 0.0100)}
                  className="cursor-pointer bg-[var(--color-success)] text-black py-2.5 rounded font-bold text-[13px] hover:opacity-90 transition-opacity"
                >
                  BUY
                </button>
                <button 
                  onClick={() => executeTrade('SELL', lotSize, marketData.ask + 0.0050, marketData.bid - 0.0100)}
                  className="cursor-pointer bg-[var(--color-danger)] text-white py-2.5 rounded font-bold text-[13px] hover:opacity-90 transition-opacity"
                >
                  SELL
                </button>
              </div>

              <button 
                onClick={closeAll}
                className="cursor-pointer bg-[var(--color-danger)]/10 border border-[var(--color-danger)] text-[var(--color-danger)] py-2.5 rounded font-bold text-[11px] mt-2 hover:bg-[var(--color-danger)]/20 transition-colors"
              >
                CLOSE ALL POSITIONS (Panic)
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
