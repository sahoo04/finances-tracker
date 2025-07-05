'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Budget, Transaction } from '@/types/transaction';
import { Edit2, Trash2, Target, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetStatusIndicator } from '@/components/budget-status-indicator';

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetList({ budgets, transactions, onEdit, onDelete }: BudgetListProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return currentMonth;
  });

  const filteredBudgets = budgets.filter(budget => budget.month === selectedMonth);

  const getBudgetStatus = (budget: Budget) => {
    const monthTransactions = transactions.filter(t => 
      t.date.slice(0, 7) === budget.month && 
      t.type === 'expense' && 
      t.category === budget.category
    );

    const actualSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;
    const remaining = Math.max(0, budget.amount - actualSpent);

    let status: 'under' | 'over' | 'on-track' = 'under';
    if (percentage > 100) status = 'over';
    else if (percentage >= 80) status = 'on-track';

    return {
      actualSpent,
      percentage,
      remaining,
      status,
    };
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-red-600 bg-red-50';
      case 'on-track': return 'text-amber-600 bg-amber-50';
      case 'under': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'on-track': return <Target className="h-4 w-4 text-amber-500" />;
      case 'under': return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      default: return <Target className="h-4 w-4 text-slate-500" />;
    }
  };

  // Get unique months from budgets for the dropdown
  const availableMonths = Array.from(new Set(budgets.map(b => b.month)))
    .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  if (budgets.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Target className="h-12 w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No budgets set</h3>
            <p className="text-slate-500">
              Start by setting your first budget to track your spending goals
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Overview
          </CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 bg-white border-slate-200">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBudgets.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No budgets for {formatMonth(selectedMonth)}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBudgets.map((budget) => {
              const status = getBudgetStatus(budget);
              return (
                <div
                  key={budget.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                        {getStatusIcon(status.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">
                              {budget.category}
                            </h4>
                            <BudgetStatusIndicator 
                              budget={budget} 
                              transactions={transactions}
                            />
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">
                              ${budget.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-500">budgeted</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              Spent: ${status.actualSpent.toFixed(2)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                              {status.percentage.toFixed(1)}% used
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                status.status === 'over' ? 'bg-red-500' :
                                status.status === 'on-track' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, status.percentage)}%` 
                              }}
                            />
                          </div>
                          
                          <div className="text-xs text-slate-500">
                            {status.status === 'over' 
                              ? `$${(status.actualSpent - budget.amount).toFixed(2)} over budget`
                              : `$${status.remaining.toFixed(2)} remaining`
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(budget)}
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(budget.id)}
                        className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}