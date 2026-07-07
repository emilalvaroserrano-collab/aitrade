import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { store } from '@/lib/store';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const prompt = `
      You are an AI trading bot analyzing the EUR/USD market.
      Current Market Data:
      Bid: ${store.marketData.bid}
      Ask: ${store.marketData.ask}
      Trend: ${store.marketData.trend}
      Volatility: ${store.marketData.volatility}
      
      Respond with ONLY a JSON object representing your trading signal, using this schema:
      {
        "signal": "BUY" | "SELL" | "HOLD",
        "confidence": number (0 to 100),
        "suggested_entry": number,
        "stop_loss": number,
        "take_profit": number,
        "risk_reward": number,
        "reason": "string explaining the signal",
        "model_version": "gemini-3.1-flash-lite"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    const text = response.text || '';
    const jsonStr = text.replace(/```json\n|\n```/g, '');
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Prediction error:', error);
    
    const isRateLimit = error?.status === 429 || error?.statusCode === 429 || String(error).includes('429') || String(error).includes('quota');
    
    const trend = store.marketData.trend;
    const bid = store.marketData.bid;
    const ask = store.marketData.ask;
    
    const signal = trend === 'BULLISH' ? 'BUY' : trend === 'BEARISH' ? 'SELL' : 'HOLD';
    const confidence = trend === 'BULLISH' ? 78 : trend === 'BEARISH' ? 74 : 50;
    
    const suggested_entry = Number(bid.toFixed(5));
    const stop_loss = trend === 'BULLISH' ? Number((bid - 0.0035).toFixed(5)) : Number((ask + 0.0035).toFixed(5));
    const take_profit = trend === 'BULLISH' ? Number((ask + 0.0084).toFixed(5)) : Number((bid - 0.0084).toFixed(5));
    
    const reason = trend === 'BULLISH' 
      ? `[DEMO MODE - API Quota Exceeded] Bullish momentum detected on ${store.marketData.symbol}. Moving averages indicate a strong ascending channel and high buyer concentration. Optimal entry identified at psychological support levels.`
      : trend === 'BEARISH'
      ? `[DEMO MODE - API Quota Exceeded] Bearish pressure mounting on ${store.marketData.symbol}. Breakout below crucial daily support validates near-term continuation towards key downside targets.`
      : `[DEMO MODE - API Quota Exceeded] Market is consolidating within a tight range. No clear directional bias present. Holding current positions until volume breakout occurs.`;

    return NextResponse.json({
      signal,
      confidence,
      suggested_entry,
      stop_loss,
      take_profit,
      risk_reward: 2.4,
      reason,
      model_version: isRateLimit ? 'Demo Mode (API Quota Limit reached)' : 'Demo Mode (Offline Fallback)'
    });
  }
}
