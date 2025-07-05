'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, CategoryData, CATEGORY_COLORS } from '@/types/transaction';

interface CategoryPieChartProps {
  transactions: Transaction[];
  type: 'income' | 'expense';
}

export function CategoryPieChart({ transactions, type }: CategoryPieChartProps) {
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    transactions
      .filter(transaction => transaction.type === type)
      .forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      });

    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, type]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 mb-1">{data.payload.name}</p>
          <p className="text-sm text-slate-600">
            Amount: <span className="font-semibold">${data.value.toFixed(2)}</span>
          </p>
          <p className="text-xs text-slate-500">
            {((data.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.slice(0, 6).map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 truncate max-w-20">
              {entry.value}
            </span>
          </div>
        ))}
        {payload.length > 6 && (
          <div className="text-xs text-slate-500">
            +{payload.length - 6} more
          </div>
        )}
      </div>
    );
  };

  if (categoryData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No {type} data to display</p>
          <p className="text-xs text-slate-500">Add some {type} transactions to see the breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}