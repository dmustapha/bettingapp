'use client';

import dynamic from 'next/dynamic';
import { TimeframeOption } from '@/hooks/usePriceHistory';

interface TokenChartProps {
  symbol: string;
  initialTimeframe?: TimeframeOption;
  height?: number;
  showTimeframeSelector?: boolean;
  chartType?: 'line' | 'area' | 'candlestick';
}

// Dynamically import the chart component with no SSR
const TokenChartClient = dynamic(
  () => import('./TokenChartClient').then((mod) => ({ default: mod.TokenChartClient })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading chart...</span>
          </div>
        </div>
      </div>
    ),
  }
);

export function TokenChart(props: TokenChartProps) {
  return <TokenChartClient {...props} />;
}
