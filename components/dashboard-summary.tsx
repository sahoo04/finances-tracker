'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';
import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardSummaryProps {
  transactions: Transaction[];
}

export function DashboardSummary({ transactions }: DashboardSummaryProps) {
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Category breakdown for expenses
    const expenseCategories = new Map<string, number>();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = expenseCategories.get(t.category) || 0;
        expenseCategories.set(t.category, current + t.amount);
      });

    const topExpenseCategory = Array.from(expenseCategories.entries())
      .sort(([,a], [,b]) => b - a)[0];

    // Recent transactions (last 5)
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // This month's data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance,
      topExpenseCategory,
      recentTransactions,
      thisMonthIncome,
      thisMonthExpenses,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated card-hover gradient-bg-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Total Balance
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${summary.balance.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {summary.balance >= 0 ? 'Positive balance' : 'Negative balance'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated card-hover gradient-bg-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Total Income
            </CardTitle>
            <div className="p-2 rounded-full bg-emerald-100">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${summary.totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {transactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated card-hover gradient-bg-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Total Expenses
            </CardTitle>
            <div className="p-2 rounded-full bg-red-100">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {transactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated card-hover gradient-bg-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              This Month
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-100">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.thisMonthIncome - summary.thisMonthExpenses >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              ${(summary.thisMonthIncome - summary.thisMonthExpenses).toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Net this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elevated card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100">
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              Top Expense Category
            </CardTitle>
            <CardDescription>
              Your highest spending category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.topExpenseCategory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {summary.topExpenseCategory[0]}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {((summary.topExpenseCategory[1] / summary.totalExpenses) * 100).toFixed(1)}% of total expenses
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      ${summary.topExpenseCategory[1].toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="progress-enhanced">
                  <div 
                    className="progress-bar error h-3"
                    style={{ 
                      width: `${(summary.topExpenseCategory[1] / summary.totalExpenses) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <PieChart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {summary.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 glass rounded-xl transition-all duration-200 hover:bg-white/20">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm truncate max-w-32">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(transaction.date)} • {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold text-sm ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}