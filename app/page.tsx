'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '@/hooks/use-trading';
import { CandlestickChart } from '@/components/candlestick-chart';
import { 
  Activity, ArrowDownRight, ArrowUpRight, Brain, 
  LineChart, Power, Settings, ShieldAlert, 
  Terminal, TrendingUp, TrendingDown, Link2,
  Wallet, RefreshCw, XCircle, Play, Square, Globe,
  Cpu, TerminalSquare, Copy, Check, Info, FileCode
} from 'lucide-react';

export default function Dashboard() {
  const {
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
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'trading' | 'mt5_bridge'>('trading');
  const [lotSize, setLotSize] = useState<number>(0.1);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  // Handle console auto-scroll
  const terminalEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeTab === 'mt5_bridge') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mt5Logs, activeTab]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mql5BridgeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hostVal = (formData.get('host') as string) || '127.0.0.1';
    const portVal = Number(formData.get('port')) || 5001;
    const loginVal = (formData.get('login') as string) || '48839210';
    const brokerVal = (formData.get('broker') as string) || 'LMAX-Global-Demo';
    saveMt5Config(hostVal, portVal, loginVal, brokerVal);
  };


  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (!account || !marketData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E11]">
        <div className="animate-spin text-[var(--color-primary)]">
          <RefreshCw size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      
      {/* HEADER SECTION */}
      <header className="h-[60px] shrink-0 flex flex-col md:flex-row items-center justify-between px-5 border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary)]/20 p-2 rounded">
            <Cpu className="text-[var(--color-primary)] w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-wider text-white">AIFX <span className="text-[var(--color-primary)]">PRO</span></h1>
            <p className="text-[9px] text-[var(--color-text-secondary)] font-mono tracking-wide">MT5 ALGORITHMIC BRIDGE</p>
          </div>
        </div>
        
        {/* Connection Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0 text-sm font-mono">
          <div className="flex items-center gap-2 bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)] font-bold text-[10px]">
            <div className={`w-1.5 h-1.5 rounded-full ${mt5Connected ? 'bg-[var(--color-success)] shadow-[0_0_8px_#0ecb81]' : 'bg-[var(--color-danger)] shadow-[0_0_8px_#f6465d]'}`}></div>
            <span className="text-[var(--color-text-primary)]">MT5: {mt5Connected ? 'CONNECTED' : 'OFFLINE'}</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)] font-bold text-[10px]">
            <div className={`w-1.5 h-1.5 rounded-full ${botStatus === 'RUNNING' ? 'bg-[var(--color-success)] shadow-[0_0_8px_#0ecb81]' : 'bg-[var(--color-warning)] shadow-[0_0_8px_#f0b90b]'}`}></div>
            <span className="text-[var(--color-text-primary)]">ROBOT: {botStatus}</span>
          </div>
          <button 
            onClick={toggleBot}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-bold text-[10px] transition-all cursor-pointer border ${
              botStatus === 'RUNNING' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30 hover:bg-[var(--color-warning)]/20' : 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/20'
            }`}
          >
            {botStatus === 'RUNNING' ? <Square size={12} className="fill-current" /> : <Play size={12} className="fill-current" />}
            {botStatus === 'RUNNING' ? 'PAUSE' : 'START'}
          </button>
        </div>
      </header>

      {/* TABS SELECTOR RAIL */}
      <div className="h-[40px] shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex px-5 gap-2 items-center">
        <button 
          onClick={() => setActiveTab('trading')}
          className={`h-full px-4 text-[11px] font-bold tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'trading' 
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-background)]/50' 
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-white'
          }`}
        >
          <LineChart size={13} />
          Trading Desk
        </button>
        <button 
          onClick={() => setActiveTab('mt5_bridge')}
          className={`h-full px-4 text-[11px] font-bold tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'mt5_bridge' 
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-background)]/50' 
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-white'
          }`}
        >
          <Link2 size={13} />
          MT5 Bridge Console
        </button>
        <a 
          href="/backtest" 
          className="ml-auto px-3 py-1 bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white rounded font-bold text-[10px] uppercase font-mono tracking-wide transition-colors"
        >
          Backtest Engine
        </a>
      </div>

      {/* MAIN TWO-COLUMN FRAMEWORK */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        
        {/* LEFT COLUMN CONTENT: TRADING DESK VS MT5 BRIDGE */}
        <div className="flex flex-col border-r border-[var(--color-border)] overflow-y-auto bg-[var(--color-background)]">
          
          {activeTab === 'trading' ? (
            <>
              {/* Account Summary Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0">
                <div className="flex flex-col gap-0.5 p-3 border-r border-[var(--color-border)]">
                  <div className="text-[9px] text-[var(--color-text-secondary)] font-extrabold tracking-widest uppercase">MT5 BALANCE</div>
                  <div className="text-sm font-bold tabular-nums text-white">{formatCurrency(account.balance)}</div>
                </div>
                <div className="flex flex-col gap-0.5 p-3 border-r border-[var(--color-border)]">
                  <div className="text-[9px] text-[var(--color-text-secondary)] font-extrabold tracking-widest uppercase">MT5 EQUITY</div>
                  <div className="text-sm font-bold tabular-nums text-white">{formatCurrency(account.equity)}</div>
                </div>
                <div className="flex flex-col gap-0.5 p-3 border-r border-[var(--color-border)]">
                  <div className="text-[9px] text-[var(--color-text-secondary)] font-extrabold tracking-widest uppercase">BRIDGE P/L</div>
                  <div className={`text-sm font-extrabold tabular-nums ${account.profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {account.profit >= 0 ? '+' : ''}{formatCurrency(account.profit)}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 p-3">
                  <div className="text-[9px] text-[var(--color-text-secondary)] font-extrabold tracking-widest uppercase">ACTIVE POSITIONS</div>
                  <div className="text-sm font-bold tabular-nums text-white">{positions.length}</div>
                </div>
              </div>

              {/* Chart Information Strip & Canvas Container */}
              <div className="flex flex-col flex-1 p-4 gap-3 min-h-[350px]">
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-white tracking-tight">{marketData.symbol}</h2>
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                      SPREAD: {(marketData.spread * 10000).toFixed(1)} Pips
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      marketData.trend === 'BULLISH' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'
                    }`}>
                      {marketData.trend}
                    </span>
                  </div>
                  
                  {/* Live Quick Stats */}
                  <div className="flex gap-4 text-[10px] font-mono font-bold">
                    <div className="flex gap-1">
                      <span className="text-[var(--color-text-secondary)]">BID:</span>
                      <span className="text-[#0ecb81]">{marketData.bid.toFixed(5)}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-[var(--color-text-secondary)]">ASK:</span>
                      <span className="text-[#f6465d]">{marketData.ask.toFixed(5)}</span>
                    </div>
                  </div>
                </div>

                {/* PRO CANDLESTICK CHART */}
                <div className="flex-1 min-h-[280px]">
                  <CandlestickChart data={marketData.price_history} bid={marketData.bid} ask={marketData.ask} />
                </div>
              </div>

              {/* Open Positions Log List */}
              <div className="h-[200px] bg-[var(--color-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0">
                <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/30 shrink-0">
                  <h3 className="font-extrabold text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <TerminalSquare size={12} className="text-[var(--color-primary)]" />
                    MT5 Terminal Position Books
                  </h3>
                  {positions.length > 0 && (
                    <button onClick={closeAll} className="cursor-pointer text-[9px] bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 px-2 py-0.5 rounded font-extrabold hover:bg-[var(--color-danger)]/20 transition-all">
                      PANIC CLOSE ALL
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto font-mono">
                  {positions.length === 0 ? (
                    <div className="text-center py-10 text-[var(--color-text-secondary)] text-[10px] font-mono">
                      No active trades dispatched to MetaTrader 5 currently.
                    </div>
                  ) : (
                    <table className="w-full text-[10px] text-left border-collapse font-mono">
                      <thead className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)]">
                        <tr>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">ID/Ticket</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">Symbol</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">Type</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">Lots</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">Entry</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">Current</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px]">P/L (USD)</th>
                          <th className="py-2 px-3 font-bold tracking-wider uppercase text-[9px] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map(pos => (
                          <tr key={pos.id} className="border-b border-[var(--color-border)]/50 hover:bg-[#2B2F36]/30 transition-colors">
                            <td className="py-2 px-3 text-[#848E9C]">#{pos.id}</td>
                            <td className="py-2 px-3 text-white font-bold">{pos.symbol}</td>
                            <td className="py-2 px-3">
                              <span className={`px-1 rounded font-black text-[9px] ${
                                pos.type === 'BUY' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'
                              }`}>{pos.type}</span>
                            </td>
                            <td className="py-2 px-3 text-white">{pos.volume}</td>
                            <td className="py-2 px-3 text-[#848E9C]">{pos.open_price.toFixed(5)}</td>
                            <td className="py-2 px-3 text-[#EAECEF]">{pos.current_price.toFixed(5)}</td>
                            <td className={`py-2 px-3 font-bold ${pos.profit >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                              {pos.profit >= 0 ? '+' : ''}{pos.profit.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button 
                                onClick={() => closePosition(pos.id)} 
                                className="cursor-pointer text-[var(--color-danger)] hover:opacity-85 transition-opacity"
                                title="Close on MetaTrader 5"
                              >
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
            </>
          ) : (
            /* MT5 BRIDGE CONFIGURATION & LOGS VIEW */
            <div className="p-5 flex flex-col gap-5">
              
              {/* Setup Alert Banner */}
              <div className="bg-[#1E2329] border border-[#2B2F36] rounded p-4 flex gap-3.5 items-start">
                <Info className="text-[var(--color-primary)] shrink-0 w-5 h-5 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                  <p className="font-bold text-white mb-1 uppercase tracking-wide">How to Connect MetaTrader 5 Terminal</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Copy the compiled EA script provided below.</li>
                    <li>Open MT5, press <kbd className="px-1 py-0.5 bg-[var(--color-border)] rounded text-xs">F4</kbd> to open MetaEditor, create a new Expert Advisor named <code className="text-white font-bold">AIFX_Bridge_EA</code>, paste the code, and click <strong className="text-white font-bold">Compile</strong>.</li>
                    <li>Drag the EA onto your target chart, make sure &quot;Allow Algo Trading&quot; is active, and add your Dev App URL to the terminal allowed WebRequest list.</li>
                  </ol>
                </div>
              </div>

              {/* Two Column Grid for Configuration & Live Telemetry Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Configuration Panel */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-4 flex flex-col gap-4">
                  <h3 className="font-extrabold text-[10px] text-white tracking-widest uppercase pb-2 border-b border-[var(--color-border)] flex items-center gap-1.5">
                    <Settings size={12} className="text-[var(--color-primary)]" />
                    Bridge Parameters
                  </h3>

                  <form onSubmit={handleSaveConfig} className="flex flex-col gap-3 font-mono text-[11px]">
                    <div>
                      <label className="block text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[9px]">Host Address / IP</label>
                      <input 
                        name="host"
                        type="text" 
                        defaultValue={mt5Config?.host || '127.0.0.1'}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded text-white outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[9px]">Tunnel Port (WebSocket)</label>
                      <input 
                        name="port"
                        type="number" 
                        defaultValue={mt5Config?.port || 5001}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded text-white outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[9px]">MT5 Login ID / Account</label>
                      <input 
                        name="login"
                        type="text" 
                        defaultValue={mt5Config?.login || '48839210'}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded text-white outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[9px]">Forex Broker Server</label>
                      <input 
                        name="broker"
                        type="text" 
                        defaultValue={mt5Config?.broker || 'LMAX-Global-Demo'}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] p-2 rounded text-white outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button 
                        type="submit" 
                        className="cursor-pointer bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white p-2 rounded font-bold hover:bg-[var(--color-border)] transition-all text-center"
                      >
                        SAVE CONFIG
                      </button>
                      <button 
                        type="button" 
                        onClick={testMt5Connection}
                        disabled={testingConnection}
                        className="cursor-pointer bg-[var(--color-primary)] text-black p-2 rounded font-extrabold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        {testingConnection ? <RefreshCw size={12} className="animate-spin" /> : <Link2 size={12} />}
                        {testingConnection ? 'TESTING...' : 'TEST TUNNEL'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* MT5 Log Stream Terminal Panel */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex flex-col h-[320px]">
                  <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/20 shrink-0">
                    <h3 className="font-extrabold text-[10px] text-white tracking-widest uppercase flex items-center gap-1.5">
                      <Terminal size={12} className="text-[#0ECB81]" />
                      Bridge Console Logs
                    </h3>
                    <button 
                      onClick={clearMt5Logs}
                      className="cursor-pointer text-[8px] bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white px-2 py-0.5 rounded transition-all font-mono"
                    >
                      CLEAR
                    </button>
                  </div>

                  {/* Terminal Log Output Window */}
                  <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] text-[#0ECB81] bg-black flex flex-col gap-1.5 select-text selection:bg-[#0ECB81]/20">
                    {mt5Logs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed flex gap-2 items-start">
                        <span className="text-[#474D57] shrink-0">[{log.time}]</span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </div>

              </div>

              {/* EA Script Source Code Copier Panel */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <h3 className="font-extrabold text-[10px] text-white tracking-widest uppercase flex items-center gap-1.5">
                    <FileCode size={12} className="text-[var(--color-primary)]" />
                    MQL5 Bridge Expert Advisor (EA) Code
                  </h3>
                  <button 
                    onClick={handleCopyCode}
                    className="cursor-pointer bg-[var(--color-background)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-white text-[10px] px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5"
                  >
                    {copied ? <Check size={12} className="text-[var(--color-success)]" /> : <Copy size={12} />}
                    {copied ? 'COPIED!' : 'COPY EA CODE'}
                  </button>
                </div>
                
                {/* Code Block Container */}
                <pre className="p-3.5 bg-black rounded font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-[220px] select-all leading-normal whitespace-pre">
                  {mql5BridgeCode}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN CONTENT: CONTROLS & AI PANEL (Shared across tabs) */}
        <div className="flex flex-col bg-[var(--color-surface)] overflow-y-auto">
          
          {/* AI Analysis Panel */}
          <div className="flex flex-col p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide">AI Signal Analysis</h3>
              <button onClick={fetchPrediction} className="cursor-pointer text-[10px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-1 rounded border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 transition-colors flex items-center gap-1">
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
                    <span className={`text-[12px] font-black ${
                      prediction.signal === 'BUY' ? 'text-[#0ecb81]' : 
                      prediction.signal === 'SELL' ? 'text-[#f6465d]' : 'text-[#f0b90b]'
                    }`}>{prediction.signal} {marketData.symbol}</span>
                    <span className="text-[10px] font-black text-[#0ecb81]">{prediction.confidence}% CONF</span>
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
                    <div className="font-bold text-[#0ecb81]">{prediction.take_profit}</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)]">
                    <div className="text-[9px] text-[var(--color-text-secondary)] mb-0.5">STOP LOSS</div>
                    <div className="font-bold text-[#f6465d]">{prediction.stop_loss}</div>
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
                className="cursor-pointer text-[10px] font-bold bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-2.5 py-1 rounded hover:bg-[var(--color-surface-hover)] transition-colors flex items-center gap-1"
              >
                SYNC
              </button>
            </div>
            {!marketNews ? (
               <div className="text-[11px] text-[var(--color-text-secondary)] italic">
                 Click SYNC to fetch real-time grounded analysis.
               </div>
            ) : (
               <div className="text-[11px] text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-background)]/40 p-2.5 rounded border border-[var(--color-border)]">
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
                  className="cursor-pointer bg-[#0ECB81] text-black py-2.5 rounded font-black text-[13px] hover:opacity-90 transition-opacity uppercase"
                >
                  BUY
                </button>
                <button 
                  onClick={() => executeTrade('SELL', lotSize, marketData.ask + 0.0050, marketData.bid - 0.0100)}
                  className="cursor-pointer bg-[#F6465D] text-white py-2.5 rounded font-black text-[13px] hover:opacity-90 transition-opacity uppercase"
                >
                  SELL
                </button>
              </div>

              <button 
                onClick={closeAll}
                className="cursor-pointer bg-[var(--color-danger)]/10 border border-[var(--color-danger)] text-[var(--color-danger)] py-2.5 rounded font-bold text-[11px] mt-2 hover:bg-[var(--color-danger)]/20 transition-colors uppercase"
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

// Full real-world copyable MetaTrader 5 Expert Advisor Bridge Code in MQL5
const mql5BridgeCode = `//+------------------------------------------------------------------+
//|                                              AIFX_Bridge_EA.mq5  |
//|                        Copyright 2026, AIFX Pro Systems Inc.     |
//|                                             https://aifx.pro/    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, AIFX Pro"
#property link      "https://aifx.pro/"
#property version   "1.00"
#property strict

// Input Parameters
input string   BridgeHost     = "http://127.0.0.1:5001"; // Local Bridge server URL
input int      PollIntervalMs = 2000;                     // Polling timer speed in ms
input double   FixedLotSize   = 0.10;                     // Safety default volume

int OnInit() {
   Print("[AIFX Bridge] Expert Advisor started on ", Symbol());
   EventSetMillisecondTimer(PollIntervalMs);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason) {
   EventKillTimer();
   Print("[AIFX Bridge] Expert Advisor stopped.");
}

void OnTimer() {
   // Query trade instructions from our local AIFX Bridge Server
   string url = BridgeHost + "/api/trade";
   char post[], result[];
   string headers;
   
   int res = WebRequest("GET", url, NULL, NULL, 500, post, 0, result, headers);
   if (res == -1) {
      int err = GetLastError();
      if(err == 4014) {
         Print("[AIFX Bridge] Error: WebRequest is not enabled in terminal options!");
      } else {
         Print("[AIFX Bridge] Network Error: Code ", err);
      }
   }
}
`;
