'use client';

import { useEffect, useRef, useState } from 'react';
import { usePriceHistory, TimeframeOption } from '@/hooks/usePriceHistory';
import { PriceHistoryPoint } from '@/lib/priceApi';

interface TokenChartClientProps {
  symbol: string;
  initialTimeframe?: TimeframeOption;
  height?: number;
  showTimeframeSelector?: boolean;
  chartType?: 'line' | 'area' | 'candlestick';
}

export function TokenChartClient({
  symbol,
  initialTimeframe = '7D',
  height = 400,
  showTimeframeSelector = true,
  chartType = 'area',
}: TokenChartClientProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(initialTimeframe);
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'area' | 'candlestick'>(
    chartType
  );

  const { history, loading, error } = usePriceHistory(
    symbol,
    selectedTimeframe,
    selectedChartType === 'candlestick'
  );

  const timeframes: TimeframeOption[] = ['1H', '4H', '1D', '7D', '30D'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: any = null;
    let resizeHandler: (() => void) | null = null;

    // Dynamically import and create chart
    import('lightweight-charts').then((LightweightCharts) => {
      if (!chartContainerRef.current) return;

      console.log('Creating chart with lightweight-charts...');

      chart = LightweightCharts.createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: '#1f2937', style: LightweightCharts.LineStyle.Dotted },
          horzLines: { color: '#1f2937', style: LightweightCharts.LineStyle.Dotted },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#6366f1',
            width: 1,
            style: LightweightCharts.LineStyle.Solid,
            labelBackgroundColor: '#6366f1',
          },
          horzLine: {
            color: '#6366f1',
            width: 1,
            style: LightweightCharts.LineStyle.Solid,
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
      console.log('Chart created successfully', {
        hasAddAreaSeries: typeof chart.addAreaSeries === 'function',
        chartKeys: Object.keys(chart).slice(0, 10)
      });

      // Handle window resize
      resizeHandler = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', resizeHandler);
    });

    return () => {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      if (chart) {
        chart.remove();
      }
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  // Update chart data when history changes
  const updateChartData = () => {
    if (!chartRef.current || !history || history.length === 0) {
      console.log('Skipping chart update - no chart or no data', {
        hasChart: !!chartRef.current,
        hasHistory: !!history,
        historyLength: history?.length || 0
      });
      return;
    }

    try {
      console.log('Updating chart with', history.length, 'data points');
      console.log('Chart methods check:', {
        hasAddAreaSeries: typeof chartRef.current.addAreaSeries === 'function',
        hasAddLineSeries: typeof chartRef.current.addLineSeries === 'function',
        hasAddCandlestickSeries: typeof chartRef.current.addCandlestickSeries === 'function',
        chartType: typeof chartRef.current,
        chartKeys: chartRef.current ? Object.keys(chartRef.current).slice(0, 15) : []
      });

      // Check if chart has necessary methods
      if (typeof chartRef.current.addAreaSeries !== 'function') {
        console.error('Chart does not have addAreaSeries method!');
        return;
      }

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

        const areaData = history.map((point: PriceHistoryPoint) => ({
          time: point.time,
          value: point.close,
        }));

        areaSeries.setData(areaData);
        seriesRef.current = areaSeries;
      } else {
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
      console.log('Chart updated successfully');
    } catch (error) {
      console.error('Error updating chart:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };

  useEffect(() => {
    // Add a small delay to ensure chart is fully initialized
    const timeoutId = setTimeout(() => {
      updateChartData();
    }, 200);

    return () => clearTimeout(timeoutId);
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
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg z-10">
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Failed to load chart data</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{error}</span>
            </div>
          </div>
        )}
        {!loading && !error && history.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg z-10">
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">No chart data available</span>
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
