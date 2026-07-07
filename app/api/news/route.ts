import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { symbol } = await req.json();

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
  } catch (error) {
    console.error('News analysis error:', error);
    return NextResponse.json({
      analysis: 'Error fetching fundamental analysis from AI.',
      model: 'error'
    });
  }
}
