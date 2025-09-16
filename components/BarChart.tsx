import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  currency: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, currency }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  return (
    <div className="space-y-3 p-4 bg-gray-900/40 rounded-lg border border-gray-700/60">
       <style>{`
        .bar-chart-bar {
            transform-origin: 0 50%;
            animation: growBar 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            transform: scaleX(0);
        }
        @keyframes growBar {
            to {
                transform: scaleX(1);
            }
        }
       `}</style>
      {data.map((item, index) => (
        <div key={item.label} className="grid grid-cols-[150px_1fr_100px] items-center gap-4 text-sm">
          <span className="font-semibold text-gray-300 truncate" title={item.label}>
            {item.label}
          </span>
          <div className="w-full bg-gray-700/50 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-500 h-4 rounded-full bar-chart-bar"
              style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  animationDelay: `${index * 100}ms`
                }}
            ></div>
          </div>
          <span className="text-right font-mono text-amber-300 font-semibold">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};
