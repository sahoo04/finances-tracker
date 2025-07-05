'use client';

import { useMemo } from 'react';
import { Transaction, Budget } from '@/types/transaction';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface BudgetStatusIndicatorProps {
  budget: Budget;
  transactions: Transaction[];
  className?: string;
}

export function BudgetStatusIndicator({ budget, transactions, className = '' }: BudgetStatusIndicatorProps) {
  const status = useMemo(() => {
    const monthTransactions = transactions.filter(t => 
      t.date.slice(0, 7) === budget.month && 
      t.type === 'expense' && 
      t.category === budget.category
    );

    const actualSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

    if (percentage > 100) {
      return {
        type: 'exceeded',
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        message: 'Budget exceeded',
      };
    } else if (percentage >= 90) {
      return {
        type: 'warning',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        message: 'Near budget limit',
      };
    } else {
      return {
        type: 'good',
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        message: 'Within budget',
      };
    }
  }, [budget, transactions]);

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${status.bgColor} ${status.color} ${className}`}>
      {status.icon}
      <span>{status.message}</span>
    </div>
  );
}