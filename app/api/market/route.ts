import { NextResponse } from 'next/server';
import { store, updateMarketData } from '@/lib/store';

export async function GET() {
  updateMarketData();
  return NextResponse.json(store.marketData);
}
