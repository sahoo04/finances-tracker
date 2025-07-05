'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Budget, SpendingInsight } from '@/types/transaction';
import { AlertTriangle, CheckCircle, Info, TrendingUp, Target } from 'lucide-react';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    const currentMonthTransactions = transactions.filter(t => 
      t.date.slice(0, 7) === currentMonth && t.type === 'expense'
    );

    const insights: SpendingInsight[] = [];

    // Calculate actual spending by category for current month
    const actualSpending = new Map<string, number>();
    currentMonthTransactions.forEach(t => {
      const current = actualSpending.get(t.category) || 0;
      actualSpending.set(t.category, current + t.amount);
    });

    // Budget vs actual insights
    currentMonthBudgets.forEach(budget => {
      const actual = actualSpending.get(budget.category) || 0;
      const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;

      if (percentage > 100) {
        insights.push({
          type: 'warning',
          title: 'Budget Exceeded',
          description: `You've spent $${(actual - budget.amount).toFixed(2)} over your ${budget.category} budget this month.`,
          category: budget.category,
          amount: actual - budget.amount,
        });
      } else if (percentage >= 80) {
        insights.push({
          type: 'warning',
          title: 'Approaching Budget Limit',
          description: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget. $${(budget.amount - actual).toFixed(2)} remaining.`,
          category: budget.category,
          amount: budget.amount - actual,
        });
      } else if (percentage < 50 && actual > 0) {
        insights.push({
          type: 'success',
          title: 'Great Spending Control',
          description: `You're doing well with your ${budget.category} budget! Only ${percentage.toFixed(1)}% used so far.`,
          category: budget.category,
        });
      }
    });

    // Spending trend insights (compare with previous month)
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const prevMonthStr = previousMonth.toISOString().slice(0, 7);
    
    const prevMonthTransactions = transactions.filter(t => 
      t.date.slice(0, 7) === prevMonthStr && t.type === 'expense'
    );

    const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (previousTotal > 0) {
      const changePercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
      
      if (changePercentage > 20) {
        insights.push({
          type: 'warning',
          title: 'Spending Increased Significantly',
          description: `Your spending is ${changePercentage.toFixed(1)}% higher than last month. Consider reviewing your expenses.`,
          amount: currentTotal - previousTotal,
        });
      } else if (changePercentage < -10) {
        insights.push({
          type: 'success',
          title: 'Spending Decreased',
          description: `Great job! Your spending is ${Math.abs(changePercentage).toFixed(1)}% lower than last month.`,
          amount: Math.abs(currentTotal - previousTotal),
        });
      }
    }

    // Category-specific insights
    const categorySpending = new Map<string, number>();
    currentMonthTransactions.forEach(t => {
      const current = categorySpending.get(t.category) || 0;
      categorySpending.set(t.category, current + t.amount);
    });

    const topCategory = Array.from(categorySpending.entries())
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory && currentTotal > 0) {
      const percentage = (topCategory[1] / currentTotal) * 100;
      if (percentage > 40) {
        insights.push({
          type: 'info',
          title: 'High Category Concentration',
          description: `${percentage.toFixed(1)}% of your spending is in ${topCategory[0]}. Consider diversifying your expenses.`,
          category: topCategory[0],
        });
      }
    }

    // No budget insights
    const categoriesWithoutBudgets = Array.from(categorySpending.keys())
      .filter(category => !currentMonthBudgets.some(b => b.category === category));

    if (categoriesWithoutBudgets.length > 0 && categoriesWithoutBudgets.length <= 3) {
      insights.push({
        type: 'info',
        title: 'Missing Budgets',
        description: `Consider setting budgets for: ${categoriesWithoutBudgets.join(', ')}.`,
      });
    }

    return insights.slice(0, 6); // Limit to 6 insights
  }, [transactions, budgets]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'border-amber-200 bg-amber-50/50';
      case 'success': return 'border-emerald-200 bg-emerald-50/50';
      case 'info': return 'border-blue-200 bg-blue-50/50';
      default: return 'border-slate-200 bg-slate-50/50';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No insights available yet</p>
            <p className="text-xs text-slate-500">Add more transactions and budgets to get personalized insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getCardStyle(insight.type)} transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                {getIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 text-sm mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.amount && (
                    <p className="text-xs text-slate-500 mt-2">
                      Amount: ${insight.amount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}