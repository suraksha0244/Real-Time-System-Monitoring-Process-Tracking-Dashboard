import type React from "react";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./chart.css";

// ChartContainer Component
export const ChartContainer = ({
  children,
}: {
  children: React.ReactElement;
}) => (
  <div className="chart-container">
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow border border-gray-200">
        <p className="text-sm text-gray-600">Time: {label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm text-gray-600">
            {item.name}: {item.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Series Interface
interface Series {
  dataKey: string;
  label: string;
  color: string;
  valueFormatter?: (value: number) => string;
}

// LineChartProps Interface
interface LineChartProps {
  data: Array<{ timestamp: number; value: number; [key: string]: any }>;
  xAxisDataKey: string;
  series: Series[];
  yAxisWidth: number;
  showXAxis: boolean;
  showYAxis: boolean;
  showGrid: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  xAxisFormatter: (value: number) => string;
  yAxisFormatter: (value: number) => string;
}

// LineChart Component
export const LineChart = ({
  data,
  xAxisDataKey,
  series,
  yAxisWidth,
  showXAxis,
  showYAxis,
  showGrid,
  showTooltip,
  showLegend,
  xAxisFormatter,
  yAxisFormatter,
}: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          {series.map((serie, index) => (
            <linearGradient
              key={`color-${index}`}
              id={`color-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={serie.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={serie.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        {showXAxis && (
          <XAxis dataKey={xAxisDataKey} tickFormatter={xAxisFormatter} />
        )}
        {showYAxis && (
          <YAxis width={yAxisWidth} tickFormatter={yAxisFormatter} domain={[0, 99]} />
        )}
        {showLegend && <Legend />}
        {showTooltip && (
          <Tooltip
            content={<CustomTooltip />}
            position={{ x: 0, y: 0 }} // Adjust position dynamically
          />
        )}
        {series.map((serie, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={serie.dataKey}
            stroke={serie.color}
            fill={`url(#color-${index})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};