'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, Budget, BudgetComparison } from '@/types/transaction';

interface BudgetComparisonChartProps {
  transactions: Transaction[];
  budgets: Budget[];
  selectedMonth: string;
}

export function BudgetComparisonChart({ transactions, budgets, selectedMonth }: BudgetComparisonChartProps) {
  const comparisonData = useMemo(() => {
    const monthBudgets = budgets.filter(b => b.month === selectedMonth);
    
    if (monthBudgets.length === 0) return [];

    const monthTransactions = transactions.filter(t => {
      const transactionMonth = t.date.slice(0, 7); // YYYY-MM
      return transactionMonth === selectedMonth && t.type === 'expense';
    });

    // Calculate actual spending by category
    const actualSpending = new Map<string, number>();
    monthTransactions.forEach(t => {
      const current = actualSpending.get(t.category) || 0;
      actualSpending.set(t.category, current + t.amount);
    });

    return monthBudgets.map(budget => {
      const actual = actualSpending.get(budget.category) || 0;
      const remaining = Math.max(0, budget.amount - actual);
      const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
      
      let status: 'under' | 'over' | 'on-track' = 'under';
      if (percentage > 100) status = 'over';
      else if (percentage >= 80) status = 'on-track';

      return {
        category: budget.category,
        budgeted: budget.amount,
        actual,
        remaining,
        percentage,
        status,
      };
    }).sort((a, b) => b.budgeted - a.budgeted);
  }, [transactions, budgets, selectedMonth]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as BudgetComparison;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Budgeted: <span className="font-semibold">${data.budgeted.toFixed(2)}</span>
            </p>
            <p className="text-sm text-slate-600">
              Actual: <span className="font-semibold">${data.actual.toFixed(2)}</span>
            </p>
            <p className="text-sm text-emerald-600">
              Remaining: <span className="font-semibold">${data.remaining.toFixed(2)}</span>
            </p>
            <p className="text-xs text-slate-500">
              {data.percentage.toFixed(1)}% of budget used
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case 'over': return '#ef4444'; // red
      case 'on-track': return '#f59e0b'; // amber
      case 'under': return '#10b981'; // emerald
      default: return '#64748b'; // slate
    }
  };

  if (comparisonData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No budget data for this month</p>
          <p className="text-xs text-slate-500">Set some budgets to see the comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="budgeted" 
            fill="#e2e8f0"
            radius={[4, 4, 0, 0]}
            name="Budgeted"
          />
          <Bar 
            dataKey="actual" 
            radius={[4, 4, 0, 0]}
            name="Actual"
          >
            {comparisonData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}