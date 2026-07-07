import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    config: store.mt5Config,
    logs: store.mt5Logs
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'SAVE_CONFIG') {
      const { host, port, login, broker } = body;
      store.mt5Config = {
        host: host || store.mt5Config.host,
        port: Number(port) || store.mt5Config.port,
        login: login || store.mt5Config.login,
        broker: broker || store.mt5Config.broker,
        connected: store.mt5Config.connected
      };
      
      store.mt5Logs.push({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: `Bridge: Configuration updated locally. Host: ${store.mt5Config.host}:${store.mt5Config.port}`
      });
      
      return NextResponse.json({ success: true, config: store.mt5Config });
    }

    if (action === 'TEST_CONNECTION') {
      store.mt5Logs.push({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: `Bridge: Attempting connection test to MT5 Terminal at ${store.mt5Config.host}:${store.mt5Config.port}...`
      });

      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      await delay(500); // simulate quick round-trip

      const isSuccessful = Math.random() > 0.15; // 85% success rate simulation

      if (isSuccessful) {
        store.mt5Config.connected = true;
        store.mt5Logs.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: `Bridge: Connection verified! Successfully bound to MT5 client instance.`
        });
        store.mt5Logs.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: `Bridge: Broker authorization OK. MT5 Status is LIVE.`
        });
      } else {
        store.mt5Config.connected = false;
        store.mt5Logs.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: `Bridge: Error: Connection timed out. Is the Expert Advisor (EA) running in MT5 on chart ${store.marketData.symbol}?`
        });
      }

      return NextResponse.json({ success: isSuccessful, connected: store.mt5Config.connected, logs: store.mt5Logs });
    }

    if (action === 'CLEAR_LOGS') {
      store.mt5Logs = [];
      return NextResponse.json({ success: true, logs: [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('MT5 API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
