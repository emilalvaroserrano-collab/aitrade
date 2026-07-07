import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  let symbol = 'EUR/USD';
  try {
    const body = await req.json();
    symbol = body.symbol || 'EUR/USD';

    const prompt = `Analyze the latest financial news and current market sentiment for ${symbol}. 
Provide a very concise summary (2-3 sentences) of the current fundamental drivers and market outlook.
Do not use markdown formatting, just plain text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return NextResponse.json({
      analysis: response.text || 'No news analysis available.',
      model: 'gemini-3.5-flash (Search Grounded)'
    });
  } catch (error: any) {
    console.error('News analysis error:', error);
    
    const isRateLimit = error?.status === 429 || error?.statusCode === 429 || String(error).includes('429') || String(error).includes('quota');
    
    let fallbackAnalysis = '';
    if (symbol.includes('EUR') || symbol.includes('USD')) {
      fallbackAnalysis = `[DEMO MODE - API Quota Limit] EUR/USD is trading with a bullish bias as markets digest recent FOMC meeting minutes indicating possible rate cuts. Lower yields on US Treasuries are putting pressure on the greenback, supporting the Euro above key support levels. Traders await upcoming CPI inflation figures for direction.`;
    } else if (symbol.includes('GBP')) {
      fallbackAnalysis = `[DEMO MODE - API Quota Limit] GBP/USD remains supported amid persistent service-sector inflation in the UK, leading to expectations that the Bank of England will delay interest rate cuts compared to the Federal Reserve. Dynamic UK industrial production reports are adding moderate tailwinds to Sterling.`;
    } else if (symbol.includes('XAU') || symbol.includes('Gold')) {
      fallbackAnalysis = `[DEMO MODE - API Quota Limit] Spot gold prices steady as geopolitical tensions in Eastern Europe and the Middle East continue to bolster safe-haven demand. Broad cooling of US dollar strength provides secondary support to precious metals near all-time high barriers.`;
    } else {
      fallbackAnalysis = `[DEMO MODE - API Quota Limit] General global market sentiment remains cautious but positive. Central bank comments continue to dominate exchange rate volatility, with major currencies trading within well-defined local consolidation channels.`;
    }

    return NextResponse.json({
      analysis: fallbackAnalysis,
      model: isRateLimit ? 'Demo Mode (API Quota Limit reached)' : 'Demo Mode (Offline Fallback)'
    });
  }
}
