'use client';

import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Budget } from '@/types/transaction';
import { AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BudgetAlertsProps {
  transactions: Transaction[];
  budgets: Budget[];
  onDismiss?: (alertId: string) => void;
  dismissedAlerts?: string[];
}

interface BudgetAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  budgetAmount: number;
  actualAmount: number;
  overAmount: number;
  percentage: number;
  month: string;
}

export function BudgetAlerts({ transactions, budgets, onDismiss, dismissedAlerts = [] }: BudgetAlertsProps) {
  const alerts = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    
    if (currentMonthBudgets.length === 0) return [];

    const monthTransactions = transactions.filter(t => {
      const transactionMonth = t.date.slice(0, 7);
      return transactionMonth === currentMonth && t.type === 'expense';
    });

    // Calculate actual spending by category
    const actualSpending = new Map<string, number>();
    monthTransactions.forEach(t => {
      const current = actualSpending.get(t.category) || 0;
      actualSpending.set(t.category, current + t.amount);
    });

    const budgetAlerts: BudgetAlert[] = [];

    currentMonthBudgets.forEach(budget => {
      const actual = actualSpending.get(budget.category) || 0;
      const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
      
      if (percentage > 100) {
        const overAmount = actual - budget.amount;
        const alertId = `${budget.category}-${budget.month}-exceeded`;
        
        if (!dismissedAlerts.includes(alertId)) {
          budgetAlerts.push({
            id: alertId,
            type: 'critical',
            category: budget.category,
            budgetAmount: budget.amount,
            actualAmount: actual,
            overAmount,
            percentage,
            month: budget.month,
          });
        }
      } else if (percentage >= 90) {
        const alertId = `${budget.category}-${budget.month}-warning`;
        
        if (!dismissedAlerts.includes(alertId)) {
          budgetAlerts.push({
            id: alertId,
            type: 'warning',
            category: budget.category,
            budgetAmount: budget.amount,
            actualAmount: actual,
            overAmount: 0,
            percentage,
            month: budget.month,
          });
        }
      }
    });

    return budgetAlerts.sort((a, b) => {
      // Sort by severity: critical first, then warning
      if (a.type === 'critical' && b.type !== 'critical') return -1;
      if (b.type === 'critical' && a.type !== 'critical') return 1;
      return b.percentage - a.percentage;
    });
  }, [transactions, budgets, dismissedAlerts]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive' as const;
      case 'warning': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="card-elevated border-0 bounce-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <div className="p-2 rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          Budget Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={getAlertVariant(alert.type)} className="alert-enhanced relative">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <AlertTitle>
                {alert.type === 'critical' 
                  ? `Budget Exceeded: ${alert.category}`
                  : `Budget Alert: ${alert.category}`
                }
              </AlertTitle>
              <AlertDescription>
                {alert.type === 'critical' ? (
                  <>
                    You've spent <strong>${alert.actualAmount.toFixed(2)}</strong> in {alert.category} 
                    this month, which is <strong>${alert.overAmount.toFixed(2)}</strong> over your 
                    budget of ${alert.budgetAmount.toFixed(2)} ({alert.percentage.toFixed(1)}% of budget used).
                  </>
                ) : (
                  <>
                    You've used <strong>{alert.percentage.toFixed(1)}%</strong> of your {alert.category} 
                    budget for {formatMonth(alert.month)}. You have ${(alert.budgetAmount - alert.actualAmount).toFixed(2)} remaining.
                  </>
                )}
              </AlertDescription>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-transparent transition-all duration-200 hover:scale-110"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}