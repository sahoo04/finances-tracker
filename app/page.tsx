'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BarChart3, PieChart, LayoutDashboard, Target, Calendar, AlertTriangle } from 'lucide-react';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { ExpenseChart } from '@/components/expense-chart';
import { CategoryPieChart } from '@/components/category-pie-chart';
import { DashboardSummary } from '@/components/dashboard-summary';
import { BudgetForm } from '@/components/budget-form';
import { BudgetList } from '@/components/budget-list';
import { BudgetComparisonChart } from '@/components/budget-comparison-chart';
import { SpendingInsights } from '@/components/spending-insights';
import { BudgetAlerts } from '@/components/budget-alerts';
import { Transaction, Budget } from '@/types/transaction';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }

    const savedDismissedAlerts = localStorage.getItem('dismissedAlerts');
    if (savedDismissedAlerts) {
      setDismissedAlerts(JSON.parse(savedDismissedAlerts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('dismissedAlerts', JSON.stringify(dismissedAlerts));
  }, [dismissedAlerts]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setShowForm(false);
  };

  const updateTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...updatedTransaction, id } : t
    ));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets([newBudget, ...budgets]);
    setShowBudgetForm(false);
  };

  const updateBudget = (id: string, updatedBudget: Omit<Budget, 'id'>) => {
    setBudgets(budgets.map(b => 
      b.id === id ? { ...updatedBudget, id } : b
    ));
    setEditingBudget(null);
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Get unique months from budgets for the dropdown
  const availableMonths = Array.from(new Set([
    ...budgets.map(b => b.month),
    selectedMonth // Include current selected month
  ])).sort((a, b) => b.localeCompare(a));

  // Check if there are any budget alerts for the current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
  const currentMonthTransactions = transactions.filter(t => 
    t.date.slice(0, 7) === currentMonth && t.type === 'expense'
  );

  const hasActiveAlerts = currentMonthBudgets.some(budget => {
    const actualSpent = currentMonthTransactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;
    const alertId = percentage > 100 
      ? `${budget.category}-${budget.month}-exceeded`
      : `${budget.category}-${budget.month}-warning`;
    
    return (percentage > 100 || percentage >= 90) && !dismissedAlerts.includes(alertId);
  });

  return (
    <div className="min-h-screen gradient-bg-main">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 fade-in-up">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Personal Finance Visualizer
          </h1>
          <p className="text-slate-600 text-lg">
            Track your income, expenses, and budgets with beautiful visualizations and insights
          </p>
        </div>

        {/* Budget Alerts - Show at the top when there are active alerts */}
        {hasActiveAlerts && (
          <div className="mb-6 bounce-in">
            <BudgetAlerts
              transactions={transactions}
              budgets={budgets}
              onDismiss={dismissAlert}
              dismissedAlerts={dismissedAlerts}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-5 glass rounded-2xl border border-white/20">
              <TabsTrigger value="dashboard" className="tab-enhanced flex items-center gap-2 relative">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                {hasActiveAlerts && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full pulse-notification" />
                )}
              </TabsTrigger>
              <TabsTrigger value="budgets" className="tab-enhanced flex items-center gap-2 relative">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Budgets</span>
                {hasActiveAlerts && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full pulse-notification" />
                )}
              </TabsTrigger>
              <TabsTrigger value="charts" className="tab-enhanced flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="tab-enhanced flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="tab-enhanced flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowBudgetForm(true);
                  setActiveTab('budgets');
                }}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 glass rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Target className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
              <Button 
                onClick={() => {
                  setShowForm(true);
                  setActiveTab('transactions');
                }}
                className="btn-gradient rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6 fade-in-up">
            {/* Show alerts on dashboard too if there are any */}
            {hasActiveAlerts && (
              <BudgetAlerts
                transactions={transactions}
                budgets={budgets}
                onDismiss={dismissAlert}
                dismissedAlerts={dismissedAlerts}
              />
            )}
            <DashboardSummary transactions={transactions} />
            <SpendingInsights transactions={transactions} budgets={budgets} />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6 fade-in-up">
            {/* Show alerts on budget tab */}
            {hasActiveAlerts && (
              <BudgetAlerts
                transactions={transactions}
                budgets={budgets}
                onDismiss={dismissAlert}
                dismissedAlerts={dismissedAlerts}
              />
            )}
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                {(showBudgetForm || editingBudget) ? (
                  <BudgetForm
                    budget={editingBudget}
                    onSubmit={editingBudget 
                      ? (data) => updateBudget(editingBudget.id, data)
                      : addBudget
                    }
                    onCancel={() => {
                      setShowBudgetForm(false);
                      setEditingBudget(null);
                    }}
                    existingBudgets={budgets}
                  />
                ) : (
                  <Card className="card-elevated card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Budget Management
                        </span>
                        <Button 
                          onClick={() => setShowBudgetForm(true)}
                          className="btn-gradient rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Set Budget
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Set monthly spending limits for different categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="text-slate-400 mb-4">
                          <Target className="h-12 w-12 mx-auto mb-2" />
                        </div>
                        <p className="text-slate-500 mb-4">
                          Click "Set Budget" to create your first budget
                        </p>
                        <Button 
                          onClick={() => setShowBudgetForm(true)}
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 glass rounded-xl"
                        >
                          Get Started
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <BudgetList
                  budgets={budgets}
                  transactions={transactions}
                  onEdit={(budget) => {
                    setEditingBudget(budget);
                    setShowBudgetForm(false);
                  }}
                  onDelete={deleteBudget}
                />
              </div>

              <Card className="card-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Budget vs Actual
                      </CardTitle>
                      <CardDescription>
                        Compare your budgeted amounts with actual spending
                      </CardDescription>
                    </div>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-48 glass border-white/20 rounded-xl">
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
                  <BudgetComparisonChart 
                    transactions={transactions} 
                    budgets={budgets} 
                    selectedMonth={selectedMonth}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 fade-in-up">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Overview
                </CardTitle>
                <CardDescription>
                  Track your income and expenses over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart transactions={transactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6 fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <PieChart className="h-5 w-5" />
                    Expense Categories
                  </CardTitle>
                  <CardDescription>
                    Breakdown of your spending by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryPieChart transactions={transactions} type="expense" />
                </CardContent>
              </Card>

              <Card className="card-elevated card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-600">
                    <PieChart className="h-5 w-5" />
                    Income Categories
                  </CardTitle>
                  <CardDescription>
                    Breakdown of your income by source
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryPieChart transactions={transactions} type="income" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 fade-in-up">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </span>
                    {!showForm && !editingTransaction && (
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="btn-gradient rounded-xl"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {editingTransaction ? 'Update transaction details' : 'Record your income and expenses'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(showForm || editingTransaction) ? (
                    <TransactionForm
                      transaction={editingTransaction}
                      onSubmit={editingTransaction 
                        ? (data) => updateTransaction(editingTransaction.id, data)
                        : addTransaction
                      }
                      onCancel={() => {
                        setShowForm(false);
                        setEditingTransaction(null);
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-slate-400 mb-4">
                        <Plus className="h-12 w-12 mx-auto mb-2" />
                      </div>
                      <p className="text-slate-500 mb-4">
                        Click "Add New" to record your first transaction
                      </p>
                      <Button 
                        onClick={() => setShowForm(true)}
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 glass rounded-xl"
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-elevated xl:col-span-1">
                <CardHeader>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>
                    View and manage your financial transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList
                    transactions={transactions}
                    onEdit={(transaction) => {
                      setEditingTransaction(transaction);
                      setShowForm(false);
                    }}
                    onDelete={deleteTransaction}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}