'use client';

import React, { useState } from 'react';
import { Activity, Play, Upload, BarChart2, ShieldAlert, RefreshCw } from 'lucide-react';

export default function BacktestPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runBacktest = () => {
    setRunning(true);
    // Simulate backtest
    setTimeout(() => {
      setResults({
        winRate: 68.4,
        netProfit: 14502.50,
        grossProfit: 28400.00,
        costs: 1205.50,
        drawdown: 12.4,
        totalTrades: 1245,
        bestTrade: 450.20,
        worstTrade: -120.00,
      });
      setRunning(false);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      <header className="h-[60px] shrink-0 flex items-center justify-between px-5 border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary)]/20 p-2 rounded-lg">
            <Activity className="text-[var(--color-primary)] w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">AI Forex MT5 Trader</h1>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-wide">BACKTEST ENGINE</p>
          </div>
        </div>
        <div className="flex gap-4">
          <a href="/" className="px-4 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)] font-bold text-[11px] uppercase">
            Live Trading
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        
        {/* Controls */}
        <div className="flex flex-col p-5 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
          <h2 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4 flex items-center gap-2"><ShieldAlert size={14} /> Configuration</h2>
          
          <div className="space-y-4 font-mono text-[11px]">
            <div>
              <label className="block text-[var(--color-text-secondary)] mb-1">DATASET (10 YEARS)</label>
              <div className="flex items-center gap-2 bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded">
                <Upload size={14} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-primary)]">EURUSD_M15_2014_2024.csv</span>
              </div>
            </div>
            
            <div>
              <label className="block text-[var(--color-text-secondary)] mb-1">SYMBOL</label>
              <select className="w-full bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]">
                <option>EUR/USD</option>
                <option>GBP/USD</option>
                <option>XAU/USD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[var(--color-text-secondary)] mb-1">INITIAL DEPOSIT</label>
              <input type="number" defaultValue="10000" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]" />
            </div>

            <button 
              onClick={runBacktest}
              disabled={running}
              className={`w-full py-2.5 rounded font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-[12px] uppercase mt-2 ${
                running ? 'bg-[var(--color-primary)]/50 text-black/50' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-black'
              }`}
            >
              {running ? <span className="animate-spin"><RefreshCw size={14} /></span> : <Play size={14} />}
              {running ? 'SIMULATING...' : 'RUN BACKTEST'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 flex flex-col bg-[var(--color-background)] overflow-y-auto p-5">
          <h2 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4 flex items-center gap-2"><BarChart2 size={14} /> Results</h2>
          
          {!results ? (
            <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)] text-[11px] font-mono border border-dashed border-[var(--color-border)] rounded bg-[var(--color-surface)]">
              Run backtest to view 10-year simulation results.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                <div className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <div className="text-[10px] text-[var(--color-text-secondary)] mb-1">NET PROFIT</div>
                  <div className="text-lg text-[var(--color-success)] font-bold tabular-nums">+${results.netProfit.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <div className="text-[10px] text-[var(--color-text-secondary)] mb-1">WIN RATE</div>
                  <div className="text-lg text-[var(--color-text-primary)] font-bold tabular-nums">{results.winRate}%</div>
                </div>
                <div className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <div className="text-[10px] text-[var(--color-text-secondary)] mb-1">MAX DRAWDOWN</div>
                  <div className="text-lg text-[var(--color-danger)] font-bold tabular-nums">{results.drawdown}%</div>
                </div>
                <div className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <div className="text-[10px] text-[var(--color-text-secondary)] mb-1">TOTAL TRADES</div>
                  <div className="text-lg text-[var(--color-text-primary)] font-bold tabular-nums">{results.totalTrades}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono border-t border-[var(--color-border)] pt-5">
                <div className="flex justify-between p-2 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Gross Profit</span>
                  <span className="text-[var(--color-success)]">+${results.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Commissions/Spread</span>
                  <span className="text-[var(--color-danger)]">-${results.costs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Best Trade</span>
                  <span className="text-[var(--color-success)]">+${results.bestTrade.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Worst Trade</span>
                  <span className="text-[var(--color-danger)]">-${Math.abs(results.worstTrade).toLocaleString()}</span>
                </div>
              </div>

              {/* Fake equity curve */}
              <div className="flex-1 min-h-[200px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded relative overflow-hidden mt-4">
                 <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(to top right, var(--color-success), transparent)' }}></div>
                 <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0,100 L0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,50 L70,30 L80,35 L90,10 L100,5 L100,100 Z" fill="var(--color-success)" fillOpacity="0.1" stroke="var(--color-success)" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                 </svg>
                 <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-secondary)]">EQUITY CURVE (SIMULATED)</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
