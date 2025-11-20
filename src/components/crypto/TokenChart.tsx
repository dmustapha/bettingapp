'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, ColorType } from 'lightweight-charts';
import { usePriceHistory, TimeframeOption } from '@/hooks/usePriceHistory';
import { PriceHistoryPoint } from '@/lib/priceApi';

interface TokenChartProps {
  symbol: string;
  initialTimeframe?: TimeframeOption;
  height?: number;
  showTimeframeSelector?: boolean;
  chartType?: 'line' | 'area' | 'candlestick';
}

export function TokenChart({
  symbol,
  initialTimeframe = '7D',
  height = 400,
  showTimeframeSelector = true,
  chartType = 'area',
}: TokenChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(initialTimeframe);
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'area' | 'candlestick'>(
    chartType
  );

  const { history, loading } = usePriceHistory(
    symbol,
    selectedTimeframe,
    selectedChartType === 'candlestick'
  );

  const timeframes: TimeframeOption[] = ['1H', '4H', '1D', '7D', '30D'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937', style: LineStyle.Dotted },
        horzLines: { color: '#1f2937', style: LineStyle.Dotted },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: '#6366f1',
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: '#6366f1',
        },
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
      },
    });

    chartRef.current = chart;

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!chartRef.current || !history || history.length === 0) return;

    // Remove old series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    // Create new series based on chart type
    if (selectedChartType === 'candlestick') {
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      candlestickSeries.setData(history);
      seriesRef.current = candlestickSeries;
    } else if (selectedChartType === 'area') {
      const areaSeries = chartRef.current.addAreaSeries({
        topColor: 'rgba(99, 102, 241, 0.4)',
        bottomColor: 'rgba(99, 102, 241, 0.0)',
        lineColor: '#6366f1',
        lineWidth: 2,
      });

      // Convert to simple format
      const areaData = history.map((point: PriceHistoryPoint) => ({
        time: point.time,
        value: point.close,
      }));

      areaSeries.setData(areaData);
      seriesRef.current = areaSeries;
    } else {
      // Line chart
      const lineSeries = chartRef.current.addLineSeries({
        color: '#6366f1',
        lineWidth: 2,
      });

      const lineData = history.map((point: PriceHistoryPoint) => ({
        time: point.time,
        value: point.close,
      }));

      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    }

    // Fit content
    chartRef.current.timeScale().fitContent();
  }, [history, selectedChartType]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{symbol} Price Chart</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Loading chart data...' : `Historical price data`}
          </p>
        </div>

        {showTimeframeSelector && (
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Chart Type Selector */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setSelectedChartType('line')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedChartType === 'line'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setSelectedChartType('area')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedChartType === 'area'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setSelectedChartType('candlestick')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedChartType === 'candlestick'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Candle
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedTimeframe === tf
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Loading chart...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />
      </div>

      {/* Chart Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Powered by CoinGecko</span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Real-time data
          </span>
        </div>
      </div>
    </div>
  );
}
