import React, { useEffect, useRef, useState } from 'react';
import { Candle } from '@/hooks/use-trading';

interface CandlestickChartProps {
  data: Candle[];
  bid: number;
  ask: number;
}

export function CandlestickChart({ data, bid, ask }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: width || 600, height: height || 320 });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-secondary)] font-mono">
        Waiting for candlestick telemetry...
      </div>
    );
  }

  // Calculate scales based on high/low bounds of the visible candles
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const maxPrice = Math.max(...highs, ask);
  const minPrice = Math.min(...lows, bid);
  const priceRange = maxPrice - minPrice || 0.0001;

  // Add 8% vertical padding
  const paddingRatio = 0.08;
  const yMin = minPrice - priceRange * paddingRatio;
  const yMax = maxPrice + priceRange * paddingRatio;
  const yRange = yMax - yMin;

  const paddingLeft = 10;
  const paddingRight = 75; // wider space for price text labels
  const paddingTop = 25;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - yMin) / yRange) * chartHeight;
  };

  const candleWidth = Math.max(3, Math.min(18, (chartWidth / data.length) * 0.65));

  // Determine grid lines (5 rows)
  const gridCount = 5;
  const gridLines = Array.from({ length: gridCount }).map((_, i) => {
    const priceVal = yMin + (i / (gridCount - 1)) * yRange;
    return {
      price: priceVal,
      y: getY(priceVal)
    };
  });

  // Calculate coordinates for bid and ask live price lines
  const yBid = getY(bid);
  const yAsk = getY(ask);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0B0E11] rounded border border-[#2B2F36]">
      {/* Dynamic Header Watermark */}
      <div className="absolute top-3 left-4 pointer-events-none select-none z-10 flex flex-col gap-0.5">
        <span className="text-[10px] text-[#F0B90B] font-extrabold tracking-widest font-sans uppercase">AIFX PRO ENGINE</span>
        <span className="text-[9px] text-[#848E9C] font-mono">15M REVERSAL PREDICTION BAND</span>
      </div>

      <svg width={width} height={height} className="overflow-visible select-none font-mono text-[9px]">
        {/* Horizontal Gridlines & Price Scale */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="#1E2329"
              strokeWidth={1}
              strokeDasharray="2,3"
            />
            <text
              x={width - paddingRight + 8}
              y={line.y + 3}
              fill="#848E9C"
              textAnchor="start"
              className="font-bold tracking-tight"
            >
              {line.price.toFixed(5)}
            </text>
          </g>
        ))}

        {/* Time Labels at the bottom */}
        {data.map((candle, i) => {
          // Show label for every 6th candle to avoid overlapping text
          if (i % 6 !== 0) return null;
          const x = getX(i);
          return (
            <g key={`time-${i}`}>
              <line
                x1={x}
                y1={height - paddingBottom}
                x2={x}
                y2={height - paddingBottom + 4}
                stroke="#2B2F36"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - paddingBottom + 14}
                fill="#848E9C"
                textAnchor="middle"
                className="text-[8px] opacity-80"
              >
                {candle.time}
              </text>
            </g>
          );
        })}

        {/* Candlestick Glyphs */}
        {data.map((candle, i) => {
          const x = getX(i);
          const yOpen = getY(candle.open);
          const yClose = getY(candle.close);
          const yHigh = getY(candle.high);
          const yLow = getY(candle.low);

          const isUp = candle.close >= candle.open;
          const color = isUp ? '#0ECB81' : '#F6465D';

          const bodyY = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));

          return (
            <g key={`candle-${i}`}>
              {/* Wick */}
              <line
                x1={x}
                y1={yHigh}
                x2={x}
                y2={yLow}
                stroke={color}
                strokeWidth={1.2}
              />
              {/* Candle Body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyY}
                width={candleWidth}
                height={bodyHeight}
                fill={isUp ? 'transparent' : color}
                stroke={color}
                strokeWidth={1.2}
              />
            </g>
          );
        })}

        {/* Live BID Line */}
        {yBid >= paddingTop && yBid <= height - paddingBottom && (
          <g>
            <line
              x1={paddingLeft}
              y1={yBid}
              x2={width - paddingRight}
              y2={yBid}
              stroke="#0ECB81"
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.8}
            />
            {/* Background pill for live price badge */}
            <rect
              x={width - paddingRight + 4}
              y={yBid - 6}
              width={66}
              height={12}
              fill="rgba(14, 203, 129, 0.15)"
              rx={2}
            />
            <text
              x={width - paddingRight + 8}
              y={yBid + 3}
              fill="#0ECB81"
              className="font-extrabold text-[9px]"
              textAnchor="start"
            >
              BID {bid.toFixed(5)}
            </text>
          </g>
        )}

        {/* Live ASK Line */}
        {yAsk >= paddingTop && yAsk <= height - paddingBottom && (
          <g>
            <line
              x1={paddingLeft}
              y1={yAsk}
              x2={width - paddingRight}
              y2={yAsk}
              stroke="#F6465D"
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.8}
            />
            {/* Background pill for live price badge */}
            <rect
              x={width - paddingRight + 4}
              y={yAsk - 6}
              width={66}
              height={12}
              fill="rgba(246, 70, 93, 0.15)"
              rx={2}
            />
            <text
              x={width - paddingRight + 8}
              y={yAsk + 3}
              fill="#F6465D"
              className="font-extrabold text-[9px]"
              textAnchor="start"
            >
              ASK {ask.toFixed(5)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
