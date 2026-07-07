import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'OPEN') {
    const { type, volume, sl, tp } = body;
    const price = type === 'BUY' ? store.marketData.ask : store.marketData.bid;
    const position = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: store.marketData.symbol,
      type,
      volume,
      open_price: price,
      current_price: price,
      sl,
      tp,
      profit: 0
    };
    store.positions.push(position);
  } else if (action === 'CLOSE') {
    const { id } = body;
    const pos = store.positions.find(p => p.id === id);
    if (pos) {
      store.account.balance += pos.profit;
      store.positions = store.positions.filter(p => p.id !== id);
    }
  } else if (action === 'CLOSE_ALL') {
    store.positions.forEach(pos => {
      store.account.balance += pos.profit;
    });
    store.positions = [];
  }

  return NextResponse.json({ success: true });
}
