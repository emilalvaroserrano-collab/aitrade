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
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({
      signal: 'HOLD',
      confidence: 0,
      suggested_entry: store.marketData.bid,
      stop_loss: 0,
      take_profit: 0,
      risk_reward: 0,
      reason: 'Error fetching prediction from AI.',
      model_version: 'error'
    });
  }
}
